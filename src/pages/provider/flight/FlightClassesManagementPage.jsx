import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import flightClassService from '../../../services/flightClassService';
import flightService from '../../../services/flightService';
import { Spinner } from '../../../components/ui/Spinner';
import { ErrorAlert } from '../../../components/shared/ErrorAlert';
import Breadcrumb from '../../../components/shared/Breadcrumb';

const FlightClassesManagementPage = ({ flightIdProp }) => {
    const navigate = useNavigate();
    const { flightId: flightIdParam } = useParams();
    const flightId = flightIdProp || flightIdParam; // Use prop if available, otherwise use param
    const providerId = localStorage.getItem('providerId');

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [flight, setFlight] = useState(null);
    const [classes, setClasses] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [showTemplateModal, setShowTemplateModal] = useState(false);
    const [editingClass, setEditingClass] = useState(null);
    const [viewMode, setViewMode] = useState('card'); // 'card' or 'table'

    // Form state
    const [formData, setFormData] = useState({
        class_type: 'Economy',
        class_name: '',
        total_seats: 150,
        available_seats: 150,
        price: 100,
        baggage_allowance: {
            cabin: { weight: 7, unit: 'kg' },
            checked: { weight: 23, unit: 'kg', pieces: 1 }
        },
        seat_pitch: '32 inches',
        seat_width: '18 inches',
        amenities: [],
        refund_policy: '',
        change_policy: ''
    });

    const [validationErrors, setValidationErrors] = useState([]);
    const [duplicateWarning, setDuplicateWarning] = useState(false);

    useEffect(() => {
        fetchData();
    }, [flightId]);

    useEffect(() => {
        // Auto-set available_seats when total_seats changes and creating new class
        if (!editingClass) {
            setFormData(prev => ({
                ...prev,
                available_seats: prev.total_seats
            }));
        }
    }, [formData.total_seats, editingClass]);

    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);

            // Fetch flight details and classes in parallel
            const [flightData, classesData] = await Promise.all([
                flightService.getFlightById(providerId, flightId),
                flightClassService.getFlightClasses(flightId)
            ]);

            setFlight(flightData);
            if (Array.isArray(classesData)) {
                setClasses(classesData);
            } else {
                setClasses([]);
            }
        } catch (err) {
            console.error('Error fetching data:', err);
            setError(err.response?.data?.message || 'Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        setValidationErrors([]);
    };

    const handleNestedChange = (parent, child, value) => {
        setFormData(prev => ({
            ...prev,
            [parent]: {
                ...prev[parent],
                [child]: value
            }
        }));
    };

    const handleDeepNestedChange = (parent, child, grandchild, value) => {
        setFormData(prev => ({
            ...prev,
            [parent]: {
                ...prev[parent],
                [child]: {
                    ...prev[parent][child],
                    [grandchild]: value
                }
            }
        }));
    };

    const toggleAmenity = (amenity) => {
        setFormData(prev => ({
            ...prev,
            amenities: prev.amenities.includes(amenity)
                ? prev.amenities.filter(a => a !== amenity)
                : [...prev.amenities, amenity]
        }));
    };

    const handleClassTypeChange = async (classType) => {
        handleChange('class_type', classType);
        
        // Check for duplicate
        const isDuplicate = await flightClassService.checkDuplicateClassType(
            flightId,
            classType,
            editingClass?._id
        );
        setDuplicateWarning(isDuplicate);

        // Update default amenities
        const defaultAmenities = flightClassService.getAvailableAmenities(classType);
        setFormData(prev => ({
            ...prev,
            amenities: defaultAmenities.slice(0, 3) // Select first 3 by default
        }));
    };

    const openCreateModal = () => {
        setEditingClass(null);
        setFormData({
            class_type: 'Economy',
            class_name: 'Economy Standard',
            total_seats: 150,
            available_seats: 150,
            price: 100,
            baggage_allowance: {
                cabin: { weight: 7, unit: 'kg' },
                checked: { weight: 23, unit: 'kg', pieces: 1 }
            },
            seat_pitch: '32 inches',
            seat_width: '18 inches',
            amenities: ['Standard seat', 'In-flight entertainment', 'Meal service'],
            refund_policy: 'Non-refundable. Name change fee applies.',
            change_policy: 'Change fee: $50. Fare difference may apply.'
        });
        setValidationErrors([]);
        setDuplicateWarning(false);
        setShowModal(true);
    };

    const openEditModal = (flightClass) => {
        setEditingClass(flightClass);
        setFormData({
            class_type: flightClass.class_type,
            class_name: flightClass.class_name,
            total_seats: flightClass.total_seats,
            available_seats: flightClass.available_seats,
            price: flightClass.price,
            baggage_allowance: flightClass.baggage_allowance,
            seat_pitch: flightClass.seat_pitch,
            seat_width: flightClass.seat_width,
            amenities: flightClass.amenities || [],
            refund_policy: flightClass.refund_policy || '',
            change_policy: flightClass.change_policy || ''
        });
        setValidationErrors([]);
        setDuplicateWarning(false);
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate
        const validation = flightClassService.validateClassData(formData);
        if (!validation.valid) {
            setValidationErrors(validation.errors);
            return;
        }

        try {
            setLoading(true);

            if (editingClass) {
                await flightClassService.updateClass(flightId, editingClass._id, formData);
                alert('Class updated successfully!');
            } else {
                await flightClassService.createClass(flightId, formData);
                alert('Class created successfully!');
            }

            setShowModal(false);
            fetchData();
        } catch (err) {
            console.error('Error saving class:', err);
            setError(err.response?.data?.message || 'Failed to save class');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (classId) => {
        if (window.confirm('Are you sure you want to delete this class? This action cannot be undone.')) {
            try {
                setLoading(true);
                await flightClassService.deleteClass(flightId, classId);
                alert('Class deleted successfully!');
                fetchData();
            } catch (err) {
                console.error('Error deleting class:', err);
                alert(err.response?.data?.message || 'Failed to delete class');
                setLoading(false);
            }
        }
    };

    const handleQuickTemplate = async (template) => {
        try {
            setLoading(true);
            setError(null);

            switch (template) {
                case 'standard':
                    await flightClassService.createStandardClasses(flightId);
                    alert('Standard classes (Economy, Business, First) created successfully!');
                    break;
                case 'economy':
                    await flightClassService.createEconomyOnly(flightId);
                    alert('Economy class created successfully!');
                    break;
                case 'premium':
                    await flightClassService.createPremiumClasses(flightId);
                    alert('Premium classes (Business, First) created successfully!');
                    break;
            }

            setShowTemplateModal(false);
            fetchData();
        } catch (err) {
            console.error('Error creating template classes:', err);
            setError(err.response?.data?.message || 'Failed to create template classes');
            setLoading(false);
        }
    };

    const getSeatAvailabilityPercentage = (availableSeats, totalSeats) => {
        return ((availableSeats / totalSeats) * 100).toFixed(0);
    };

    const breadcrumbItems = [
        { label: 'Dashboard', path: '/provider' },
        { label: 'Flights', path: '/provider/flights' },
        { label: flight ? `${flight.flight_number}` : 'Flight', path: `/provider/flights/${flightId}` },
        { label: 'Classes' }
    ];

    // Styles
    const containerStyle = {
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '2rem'
    };

    const contentStyle = {
        maxWidth: '1400px',
        margin: '0 auto'
    };

    const headerCardStyle = {
        background: 'white',
        borderRadius: '24px',
        padding: '2rem',
        marginBottom: '2rem',
        boxShadow: '0 20px 60px rgba(0,0,0,0.2)'
    };

    const titleStyle = {
        fontSize: '2rem',
        fontWeight: '700',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        marginBottom: '0.5rem'
    };

    const flightInfoStyle = {
        fontSize: '0.875rem',
        color: '#6b7280',
        marginBottom: '1.5rem',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        flexWrap: 'wrap'
    };

    const actionsContainerStyle = {
        display: 'flex',
        gap: '1rem',
        alignItems: 'center',
        flexWrap: 'wrap'
    };

    const buttonStyle = {
        padding: '0.75rem 1.5rem',
        fontSize: '0.875rem',
        fontWeight: '600',
        borderRadius: '12px',
        border: 'none',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem'
    };

    const primaryButtonStyle = {
        ...buttonStyle,
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)'
    };

    const secondaryButtonStyle = {
        ...buttonStyle,
        background: 'white',
        color: '#667eea',
        border: '2px solid #667eea'
    };

    const viewToggleStyle = {
        display: 'flex',
        gap: '0.5rem',
        background: '#f3f4f6',
        padding: '0.25rem',
        borderRadius: '10px'
    };

    const viewButtonStyle = (isActive) => ({
        padding: '0.5rem 1rem',
        fontSize: '0.875rem',
        fontWeight: '600',
        borderRadius: '8px',
        border: 'none',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        background: isActive ? 'white' : 'transparent',
        color: isActive ? '#667eea' : '#6b7280',
        boxShadow: isActive ? '0 2px 4px rgba(0,0,0,0.1)' : 'none'
    });

    const cardsGridStyle = {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
        gap: '1.5rem',
        marginTop: '2rem'
    };

    const classCardStyle = (classType) => {
        const colors = flightClassService.getClassTypeColor(classType);
        return {
            background: 'white',
            borderRadius: '20px',
            padding: '1.5rem',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
            border: `3px solid ${colors.bg}`,
            transition: 'all 0.3s ease',
            cursor: 'pointer'
        };
    };

    const classHeaderStyle = {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '1rem'
    };

    const classTypeBadgeStyle = (classType) => {
        const colors = flightClassService.getClassTypeColor(classType);
        return {
            padding: '0.5rem 1rem',
            borderRadius: '20px',
            background: colors.bg,
            color: colors.color,
            fontSize: '0.875rem',
            fontWeight: '700',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem'
        };
    };

    const classNameStyle = {
        fontSize: '1.25rem',
        fontWeight: '700',
        color: '#1f2937',
        marginTop: '0.5rem',
        marginBottom: '0.75rem'
    };

    const priceStyle = {
        fontSize: '2rem',
        fontWeight: '700',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        marginBottom: '1rem'
    };

    const seatInfoStyle = {
        marginBottom: '1rem'
    };

    const progressBarContainerStyle = {
        width: '100%',
        height: '8px',
        background: '#e5e7eb',
        borderRadius: '10px',
        overflow: 'hidden',
        marginTop: '0.5rem'
    };

    const progressBarFillStyle = (percentage, classType) => {
        const colors = flightClassService.getClassTypeColor(classType);
        return {
            width: `${percentage}%`,
            height: '100%',
            background: colors.color,
            transition: 'width 0.3s ease'
        };
    };

    const amenitiesGridStyle = {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '0.5rem',
        marginBottom: '1rem'
    };

    const amenityChipStyle = {
        padding: '0.375rem 0.75rem',
        background: '#f3f4f6',
        borderRadius: '20px',
        fontSize: '0.75rem',
        fontWeight: '500',
        color: '#374151',
        display: 'flex',
        alignItems: 'center',
        gap: '0.25rem'
    };

    const cardActionsStyle = {
        display: 'flex',
        gap: '0.5rem',
        marginTop: '1rem'
    };

    const editButtonStyle = {
        ...buttonStyle,
        background: '#dbeafe',
        color: '#1d4ed8',
        flex: 1,
        justifyContent: 'center',
        padding: '0.625rem'
    };

    const deleteButtonStyle = {
        ...buttonStyle,
        background: '#fee2e2',
        color: '#dc2626',
        flex: 1,
        justifyContent: 'center',
        padding: '0.625rem'
    };

    const emptyStateStyle = {
        background: 'white',
        borderRadius: '16px',
        padding: '4rem 2rem',
        textAlign: 'center'
    };

    const modalOverlayStyle = {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '2rem'
    };

    const modalContentStyle = {
        background: 'white',
        borderRadius: '20px',
        padding: '2rem',
        maxWidth: '800px',
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
    };

    const modalTitleStyle = {
        fontSize: '1.5rem',
        fontWeight: '700',
        color: '#1f2937',
        marginBottom: '1.5rem'
    };

    const formGroupStyle = {
        marginBottom: '1.5rem'
    };

    const labelStyle = {
        display: 'block',
        fontSize: '0.875rem',
        fontWeight: '600',
        color: '#374151',
        marginBottom: '0.5rem'
    };

    const requiredStyle = {
        color: '#ef4444',
        marginLeft: '0.25rem'
    };

    const inputStyle = {
        width: '100%',
        padding: '0.75rem',
        fontSize: '0.875rem',
        border: '2px solid #e5e7eb',
        borderRadius: '10px',
        transition: 'all 0.3s ease',
        outline: 'none',
        boxSizing: 'border-box'
    };

    const selectStyle = {
        ...inputStyle,
        cursor: 'pointer',
        appearance: 'none',
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'right 0.75rem center',
        backgroundSize: '1.5em 1.5em',
        paddingRight: '2.5rem'
    };

    const gridStyle = {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem'
    };

    const amenitySelectStyle = {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
        gap: '0.5rem',
        marginTop: '0.5rem'
    };

    const amenityCheckboxLabelStyle = (isSelected) => ({
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.75rem',
        border: '2px solid',
        borderColor: isSelected ? '#667eea' : '#e5e7eb',
        borderRadius: '10px',
        background: isSelected ? '#ede9fe' : 'white',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        fontSize: '0.875rem'
    });

    const warningBoxStyle = {
        background: '#fef3c7',
        border: '2px solid #fbbf24',
        borderRadius: '10px',
        padding: '1rem',
        marginBottom: '1rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem'
    };

    const templateCardStyle = {
        background: 'white',
        borderRadius: '16px',
        padding: '1.5rem',
        border: '2px solid #e5e7eb',
        cursor: 'pointer',
        transition: 'all 0.3s ease'
    };

    if (loading && !showModal) return <Spinner />;

    return (
        <div style={containerStyle}>
            <div style={contentStyle}>
                {/* Header */}
                <div style={headerCardStyle}>
                    <Breadcrumb items={breadcrumbItems} />

                    <h1 style={titleStyle}>🎫 Flight Classes Management</h1>
                    
                    {flight && (
                        <div style={flightInfoStyle}>
                            <span>✈️ <strong>{flight.flight_number}</strong></span>
                            <span>|</span>
                            <span>{flight.airline_name}</span>
                            <span>|</span>
                            <span>{flight.departure_airport} → {flight.arrival_airport}</span>
                        </div>
                    )}

                    {error && <ErrorAlert message={error} />}

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                        <div style={actionsContainerStyle}>
                            <button
                                onClick={openCreateModal}
                                style={primaryButtonStyle}
                                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                            >
                                ➕ Add Class
                            </button>
                            <button
                                onClick={() => setShowTemplateModal(true)}
                                style={secondaryButtonStyle}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = '#667eea';
                                    e.currentTarget.style.color = 'white';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = 'white';
                                    e.currentTarget.style.color = '#667eea';
                                }}
                            >
                                🚀 Quick Templates
                            </button>
                            {classes.length > 0 && (
                                <button
                                    onClick={() => navigate(`/provider/flights/${flightId}/seats`)}
                                    style={{...secondaryButtonStyle, borderColor: '#10b981', color: '#10b981'}}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.background = '#10b981';
                                        e.currentTarget.style.color = 'white';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.background = 'white';
                                        e.currentTarget.style.color = '#10b981';
                                    }}
                                >
                                    💺 Configure Seats
                                </button>
                            )}
                        </div>

                        <div style={viewToggleStyle}>
                            <button
                                onClick={() => setViewMode('card')}
                                style={viewButtonStyle(viewMode === 'card')}
                            >
                                📇 Cards
                            </button>
                            <button
                                onClick={() => setViewMode('table')}
                                style={viewButtonStyle(viewMode === 'table')}
                            >
                                📋 Table
                            </button>
                        </div>
                    </div>
                </div>

                {/* Classes List */}
                {classes.length === 0 ? (
                    <div style={emptyStateStyle}>
                        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎫</div>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1f2937', marginBottom: '0.5rem' }}>
                            No Classes Yet
                        </h3>
                        <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '1.5rem' }}>
                            Add classes to define seating options and pricing for this flight
                        </p>
                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                            <button onClick={openCreateModal} style={primaryButtonStyle}>
                                ➕ Add First Class
                            </button>
                            <button
                                onClick={() => setShowTemplateModal(true)}
                                style={secondaryButtonStyle}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = '#667eea';
                                    e.currentTarget.style.color = 'white';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = 'white';
                                    e.currentTarget.style.color = '#667eea';
                                }}
                            >
                                🚀 Use Template
                            </button>
                        </div>
                    </div>
                ) : viewMode === 'card' ? (
                    <div style={cardsGridStyle}>
                        {classes.map((flightClass) => {
                            const availability = getSeatAvailabilityPercentage(
                                flightClass.available_seats,
                                flightClass.total_seats
                            );
                            const colors = flightClassService.getClassTypeColor(flightClass.class_type);

                            return (
                                <div
                                    key={flightClass._id}
                                    style={classCardStyle(flightClass.class_type)}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.transform = 'translateY(-4px)';
                                        e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.15)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = 'translateY(0)';
                                        e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.05)';
                                    }}
                                >
                                    <div style={classHeaderStyle}>
                                        <div>
                                            <div style={classTypeBadgeStyle(flightClass.class_type)}>
                                                {colors.icon} {flightClass.class_type}
                                            </div>
                                            <h3 style={classNameStyle}>{flightClass.class_name}</h3>
                                        </div>
                                    </div>

                                    <div style={priceStyle}>
                                        ${flightClass.price.toLocaleString()}
                                    </div>

                                    <div style={seatInfoStyle}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                            <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>Seat Availability</span>
                                            <span style={{ fontSize: '0.875rem', fontWeight: '600', color: colors.color }}>
                                                {flightClass.available_seats}/{flightClass.total_seats} ({availability}%)
                                            </span>
                                        </div>
                                        <div style={progressBarContainerStyle}>
                                            <div style={progressBarFillStyle(availability, flightClass.class_type)} />
                                        </div>
                                    </div>

                                    <div style={{ marginBottom: '1rem', fontSize: '0.875rem', color: '#6b7280' }}>
                                        <div>📏 Seat: {flightClass.seat_pitch} × {flightClass.seat_width}</div>
                                    </div>

                                    <div style={amenitiesGridStyle}>
                                        {flightClass.amenities && flightClass.amenities.length > 0 ? (
                                            flightClass.amenities.slice(0, 5).map((amenity, index) => (
                                                <div key={index} style={amenityChipStyle}>
                                                    <span>{flightClassService.getAmenityIcon(amenity)}</span>
                                                    <span>{amenity}</span>
                                                </div>
                                            ))
                                        ) : (
                                            <span style={{ color: '#9ca3af', fontSize: '0.75rem' }}>No amenities</span>
                                        )}
                                        {flightClass.amenities && flightClass.amenities.length > 5 && (
                                            <div style={{ ...amenityChipStyle, background: colors.bg, color: colors.color }}>
                                                +{flightClass.amenities.length - 5} more
                                            </div>
                                        )}
                                    </div>

                                    <div style={cardActionsStyle}>
                                        <button
                                            onClick={() => openEditModal(flightClass)}
                                            style={editButtonStyle}
                                        >
                                            ✏️ Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(flightClass._id)}
                                            style={deleteButtonStyle}
                                        >
                                            🗑️ Delete
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div style={{ background: 'white', borderRadius: '16px', padding: '1.5rem', overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0' }}>
                            <thead>
                                <tr>
                                    <th style={{ textAlign: 'left', padding: '1rem', fontSize: '0.75rem', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', borderBottom: '2px solid #e5e7eb' }}>Type</th>
                                    <th style={{ textAlign: 'left', padding: '1rem', fontSize: '0.75rem', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', borderBottom: '2px solid #e5e7eb' }}>Name</th>
                                    <th style={{ textAlign: 'left', padding: '1rem', fontSize: '0.75rem', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', borderBottom: '2px solid #e5e7eb' }}>Seats</th>
                                    <th style={{ textAlign: 'left', padding: '1rem', fontSize: '0.75rem', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', borderBottom: '2px solid #e5e7eb' }}>Price</th>
                                    <th style={{ textAlign: 'left', padding: '1rem', fontSize: '0.75rem', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', borderBottom: '2px solid #e5e7eb' }}>Amenities</th>
                                    <th style={{ textAlign: 'left', padding: '1rem', fontSize: '0.75rem', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', borderBottom: '2px solid #e5e7eb' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {classes.map((flightClass) => (
                                    <tr key={flightClass._id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                                        <td style={{ padding: '1rem' }}>
                                            <span style={classTypeBadgeStyle(flightClass.class_type)}>
                                                {flightClassService.getClassTypeColor(flightClass.class_type).icon} {flightClass.class_type}
                                            </span>
                                        </td>
                                        <td style={{ padding: '1rem', fontWeight: '600' }}>{flightClass.class_name}</td>
                                        <td style={{ padding: '1rem' }}>
                                            {flightClass.available_seats}/{flightClass.total_seats}
                                        </td>
                                        <td style={{ padding: '1rem', fontWeight: '700', color: '#667eea' }}>
                                            ${flightClass.price.toLocaleString()}
                                        </td>
                                        <td style={{ padding: '1rem' }}>
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                                                {flightClass.amenities && flightClass.amenities.slice(0, 3).map((amenity, index) => (
                                                    <span key={index} style={amenityChipStyle}>
                                                        {flightClassService.getAmenityIcon(amenity)} {amenity}
                                                    </span>
                                                ))}
                                                {flightClass.amenities && flightClass.amenities.length > 3 && (
                                                    <span style={amenityChipStyle}>+{flightClass.amenities.length - 3}</span>
                                                )}
                                            </div>
                                        </td>
                                        <td style={{ padding: '1rem' }}>
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                <button
                                                    onClick={() => openEditModal(flightClass)}
                                                    style={{ ...buttonStyle, padding: '0.5rem 1rem', fontSize: '0.75rem', background: '#dbeafe', color: '#1d4ed8' }}
                                                >
                                                    ✏️ Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(flightClass._id)}
                                                    style={{ ...buttonStyle, padding: '0.5rem 1rem', fontSize: '0.75rem', background: '#fee2e2', color: '#dc2626' }}
                                                >
                                                    🗑️
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Create/Edit Modal */}
                {showModal && (
                    <div style={modalOverlayStyle} onClick={() => setShowModal(false)}>
                        <div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
                            <h2 style={modalTitleStyle}>
                                {editingClass ? '✏️ Edit Class' : '➕ Add New Class'}
                            </h2>

                            {duplicateWarning && (
                                <div style={warningBoxStyle}>
                                    <span style={{ fontSize: '1.5rem' }}>⚠️</span>
                                    <div>
                                        <div style={{ fontWeight: '600', color: '#d97706' }}>Duplicate Class Type</div>
                                        <div style={{ fontSize: '0.875rem', color: '#92400e' }}>
                                            A {formData.class_type} class already exists for this flight.
                                        </div>
                                    </div>
                                </div>
                            )}

                            {validationErrors.length > 0 && (
                                <div style={{ background: '#fee2e2', border: '2px solid #fca5a5', borderRadius: '10px', padding: '1rem', marginBottom: '1rem' }}>
                                    <div style={{ fontWeight: '700', marginBottom: '0.5rem', color: '#dc2626' }}>
                                        ⚠️ Validation Errors:
                                    </div>
                                    <ul style={{ margin: 0, paddingLeft: '1.5rem', color: '#dc2626' }}>
                                        {validationErrors.map((err, index) => (
                                            <li key={index}>{err}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            <form onSubmit={handleSubmit}>
                                {/* Class Type */}
                                <div style={formGroupStyle}>
                                    <label style={labelStyle}>
                                        Class Type<span style={requiredStyle}>*</span>
                                    </label>
                                    <select
                                        value={formData.class_type}
                                        onChange={(e) => handleClassTypeChange(e.target.value)}
                                        style={selectStyle}
                                        required
                                    >
                                        <option value="Economy">💺 Economy</option>
                                        <option value="Business">🛋️ Business</option>
                                        <option value="First">👑 First Class</option>
                                    </select>
                                </div>

                                {/* Class Name */}
                                <div style={formGroupStyle}>
                                    <label style={labelStyle}>
                                        Class Name<span style={requiredStyle}>*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.class_name}
                                        onChange={(e) => handleChange('class_name', e.target.value)}
                                        style={inputStyle}
                                        placeholder="e.g., Economy Standard, Business Premium"
                                        required
                                        onFocus={(e) => e.target.style.borderColor = '#667eea'}
                                        onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                                    />
                                </div>

                                {/* Seats & Price */}
                                <div style={gridStyle}>
                                    <div style={formGroupStyle}>
                                        <label style={labelStyle}>
                                            Total Seats<span style={requiredStyle}>*</span>
                                        </label>
                                        <input
                                            type="number"
                                            value={formData.total_seats}
                                            onChange={(e) => handleChange('total_seats', parseInt(e.target.value) || 0)}
                                            style={inputStyle}
                                            min="1"
                                            required
                                            onFocus={(e) => e.target.style.borderColor = '#667eea'}
                                            onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                                        />
                                    </div>

                                    <div style={formGroupStyle}>
                                        <label style={labelStyle}>
                                            Available Seats{editingClass ? <span style={requiredStyle}>*</span> : ''}
                                        </label>
                                        <input
                                            type="number"
                                            value={formData.available_seats}
                                            onChange={(e) => handleChange('available_seats', parseInt(e.target.value) || 0)}
                                            style={inputStyle}
                                            min="0"
                                            max={formData.total_seats}
                                            readOnly={!editingClass}
                                            onFocus={(e) => e.target.style.borderColor = '#667eea'}
                                            onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                                        />
                                    </div>

                                    <div style={formGroupStyle}>
                                        <label style={labelStyle}>
                                            Price (USD)<span style={requiredStyle}>*</span>
                                        </label>
                                        <input
                                            type="number"
                                            value={formData.price}
                                            onChange={(e) => handleChange('price', parseFloat(e.target.value) || 0)}
                                            style={inputStyle}
                                            min="0"
                                            step="0.01"
                                            required
                                            onFocus={(e) => e.target.style.borderColor = '#667eea'}
                                            onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                                        />
                                    </div>
                                </div>

                                {/* Seat Dimensions */}
                                <div style={gridStyle}>
                                    <div style={formGroupStyle}>
                                        <label style={labelStyle}>Seat Pitch</label>
                                        <input
                                            type="text"
                                            value={formData.seat_pitch}
                                            onChange={(e) => handleChange('seat_pitch', e.target.value)}
                                            style={inputStyle}
                                            placeholder="e.g., 32 inches"
                                            onFocus={(e) => e.target.style.borderColor = '#667eea'}
                                            onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                                        />
                                    </div>

                                    <div style={formGroupStyle}>
                                        <label style={labelStyle}>Seat Width</label>
                                        <input
                                            type="text"
                                            value={formData.seat_width}
                                            onChange={(e) => handleChange('seat_width', e.target.value)}
                                            style={inputStyle}
                                            placeholder="e.g., 18 inches"
                                            onFocus={(e) => e.target.style.borderColor = '#667eea'}
                                            onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                                        />
                                    </div>
                                </div>

                                {/* Amenities */}
                                <div style={formGroupStyle}>
                                    <label style={labelStyle}>Amenities</label>
                                    <div style={amenitySelectStyle}>
                                        {flightClassService.getAvailableAmenities(formData.class_type).map((amenity) => (
                                            <label
                                                key={amenity}
                                                style={amenityCheckboxLabelStyle(formData.amenities.includes(amenity))}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={formData.amenities.includes(amenity)}
                                                    onChange={() => toggleAmenity(amenity)}
                                                    style={{ cursor: 'pointer' }}
                                                />
                                                <span>{flightClassService.getAmenityIcon(amenity)} {amenity}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                {/* Policies */}
                                <div style={formGroupStyle}>
                                    <label style={labelStyle}>Refund Policy</label>
                                    <textarea
                                        value={formData.refund_policy}
                                        onChange={(e) => handleChange('refund_policy', e.target.value)}
                                        style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }}
                                        placeholder="Describe refund policy..."
                                        onFocus={(e) => e.target.style.borderColor = '#667eea'}
                                        onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                                    />
                                </div>

                                <div style={formGroupStyle}>
                                    <label style={labelStyle}>Change Policy</label>
                                    <textarea
                                        value={formData.change_policy}
                                        onChange={(e) => handleChange('change_policy', e.target.value)}
                                        style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }}
                                        placeholder="Describe change policy..."
                                        onFocus={(e) => e.target.style.borderColor = '#667eea'}
                                        onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                                    />
                                </div>

                                {/* Actions */}
                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
                                    <button
                                        type="button"
                                        onClick={() => setShowModal(false)}
                                        style={secondaryButtonStyle}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.background = '#fee2e2';
                                            e.currentTarget.style.color = '#dc2626';
                                            e.currentTarget.style.borderColor = '#dc2626';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.background = 'white';
                                            e.currentTarget.style.color = '#667eea';
                                            e.currentTarget.style.borderColor = '#667eea';
                                        }}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        style={{
                                            ...primaryButtonStyle,
                                            opacity: loading ? 0.6 : 1,
                                            cursor: loading ? 'not-allowed' : 'pointer'
                                        }}
                                        onMouseEnter={(e) => !loading && (e.currentTarget.style.transform = 'translateY(-2px)')}
                                        onMouseLeave={(e) => !loading && (e.currentTarget.style.transform = 'translateY(0)')}
                                    >
                                        {loading ? '⏳ Saving...' : (editingClass ? '💾 Update Class' : '✅ Create Class')}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Template Modal */}
                {showTemplateModal && (
                    <div style={modalOverlayStyle} onClick={() => setShowTemplateModal(false)}>
                        <div style={{ ...modalContentStyle, maxWidth: '600px' }} onClick={(e) => e.stopPropagation()}>
                            <h2 style={modalTitleStyle}>🚀 Quick Class Templates</h2>
                            <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '1.5rem' }}>
                                Choose a template to quickly create multiple classes with default configurations
                            </p>

                            <div style={{ display: 'grid', gap: '1rem' }}>
                                <div
                                    style={templateCardStyle}
                                    onClick={() => handleQuickTemplate('standard')}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.borderColor = '#667eea';
                                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.2)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.borderColor = '#e5e7eb';
                                        e.currentTarget.style.boxShadow = 'none';
                                    }}
                                >
                                    <h3 style={{ fontSize: '1.125rem', fontWeight: '700', marginBottom: '0.5rem' }}>
                                        ✈️ Standard Classes (All 3)
                                    </h3>
                                    <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.75rem' }}>
                                        Creates Economy, Business, and First Class with default settings
                                    </p>
                                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                        <span style={{ ...classTypeBadgeStyle('Economy'), fontSize: '0.75rem', padding: '0.25rem 0.75rem' }}>
                                            💺 Economy: $100
                                        </span>
                                        <span style={{ ...classTypeBadgeStyle('Business'), fontSize: '0.75rem', padding: '0.25rem 0.75rem' }}>
                                            🛋️ Business: $300
                                        </span>
                                        <span style={{ ...classTypeBadgeStyle('First'), fontSize: '0.75rem', padding: '0.25rem 0.75rem' }}>
                                            👑 First: $600
                                        </span>
                                    </div>
                                </div>

                                <div
                                    style={templateCardStyle}
                                    onClick={() => handleQuickTemplate('economy')}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.borderColor = '#667eea';
                                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.2)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.borderColor = '#e5e7eb';
                                        e.currentTarget.style.boxShadow = 'none';
                                    }}
                                >
                                    <h3 style={{ fontSize: '1.125rem', fontWeight: '700', marginBottom: '0.5rem' }}>
                                        💺 Economy Only
                                    </h3>
                                    <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.75rem' }}>
                                        Creates single Economy class for budget flights
                                    </p>
                                    <span style={{ ...classTypeBadgeStyle('Economy'), fontSize: '0.75rem', padding: '0.25rem 0.75rem' }}>
                                        💺 Economy: $100 (180 seats)
                                    </span>
                                </div>

                                <div
                                    style={templateCardStyle}
                                    onClick={() => handleQuickTemplate('premium')}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.borderColor = '#667eea';
                                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.2)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.borderColor = '#e5e7eb';
                                        e.currentTarget.style.boxShadow = 'none';
                                    }}
                                >
                                    <h3 style={{ fontSize: '1.125rem', fontWeight: '700', marginBottom: '0.5rem' }}>
                                        👑 Business + First
                                    </h3>
                                    <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.75rem' }}>
                                        Creates premium classes only
                                    </p>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <span style={{ ...classTypeBadgeStyle('Business'), fontSize: '0.75rem', padding: '0.25rem 0.75rem' }}>
                                            🛋️ Business: $300
                                        </span>
                                        <span style={{ ...classTypeBadgeStyle('First'), fontSize: '0.75rem', padding: '0.25rem 0.75rem' }}>
                                            👑 First: $600
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                                <button
                                    onClick={() => setShowTemplateModal(false)}
                                    style={secondaryButtonStyle}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.background = '#667eea';
                                        e.currentTarget.style.color = 'white';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.background = 'white';
                                        e.currentTarget.style.color = '#667eea';
                                    }}
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FlightClassesManagementPage;

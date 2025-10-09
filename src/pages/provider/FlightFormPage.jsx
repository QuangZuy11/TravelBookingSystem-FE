import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import Breadcrumb from '../../components/shared/Breadcrumb';
import { Spinner } from '../../components/ui/Spinner';
import { ErrorAlert } from '../../components/shared/ErrorAlert';

const FlightFormPage = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const providerId = localStorage.getItem('providerId');
    const isEditMode = Boolean(id);

    const [formData, setFormData] = useState({
        flightNumber: '',
        flightType: 'domestic', // Add flight type field
        airline: {
            name: '',
            code: '',
            logo: ''
        },
        departure: {
            airport: '',
            city: '',
            terminal: '',
            date: '',
            time: ''
        },
        arrival: {
            airport: '',
            city: '',
            terminal: '',
            date: '',
            time: ''
        },
        duration: '',
        aircraft: '',
        capacity: {
            economy: { total: 0, available: 0, price: 0 },
            business: { total: 0, available: 0, price: 0 },
            firstClass: { total: 0, available: 0, price: 0 }
        },
        status: 'scheduled',
        amenities: [],
        baggageAllowance: {
            carryOn: { weight: 7, unit: 'kg' },
            checked: { weight: 23, unit: 'kg' }
        },
        mealOptions: []
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [activeSection, setActiveSection] = useState(null);
    const [errors, setErrors] = useState({});

    const amenitiesList = ['WiFi', 'Entertainment', 'Meals', 'Power Outlets', 'USB Charging', 'Reclining Seats', 'Extra Legroom'];
    const mealOptionsList = ['Vegetarian', 'Non-Vegetarian', 'Vegan', 'Gluten-Free', 'Halal', 'Kosher', 'Special Dietary'];

    useEffect(() => {
        if (isEditMode) {
            fetchFlightData();
        }
    }, [id]);

    useEffect(() => {
        calculateDuration();
    }, [formData.departure.date, formData.departure.time, formData.arrival.date, formData.arrival.time]);

    const fetchFlightData = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`/api/flight/provider/${providerId}/flights/${id}`);
            if (response.data.success) {
                setFormData(response.data.data);
            }
        } catch (err) {
            console.error('Error fetching flight:', err);
            setError('Failed to load flight data');
        } finally {
            setLoading(false);
        }
    };

    const calculateDuration = () => {
        const { departure, arrival } = formData;
        if (departure.date && departure.time && arrival.date && arrival.time) {
            const departureDateTime = new Date(`${departure.date}T${departure.time}`);
            const arrivalDateTime = new Date(`${arrival.date}T${arrival.time}`);
            
            if (arrivalDateTime > departureDateTime) {
                const diffMs = arrivalDateTime - departureDateTime;
                const hours = Math.floor(diffMs / (1000 * 60 * 60));
                const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
                setFormData(prev => ({ ...prev, duration: `${hours}h ${minutes}m` }));
            }
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.flightNumber) newErrors.flightNumber = 'Flight number is required';
        if (!formData.airline.name) newErrors.airlineName = 'Airline name is required';
        if (!formData.departure.airport) newErrors.departureAirport = 'Departure airport is required';
        if (!formData.arrival.airport) newErrors.arrivalAirport = 'Arrival airport is required';
        if (!formData.departure.date) newErrors.departureDate = 'Departure date is required';
        if (!formData.arrival.date) newErrors.arrivalDate = 'Arrival date is required';

        // Validate arrival after departure
        const departureDateTime = new Date(`${formData.departure.date}T${formData.departure.time}`);
        const arrivalDateTime = new Date(`${formData.arrival.date}T${formData.arrival.time}`);
        if (arrivalDateTime <= departureDateTime) {
            newErrors.arrivalTime = 'Arrival time must be after departure time';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        
        if (name.includes('.')) {
            const parts = name.split('.');
            setFormData(prev => {
                let updated = { ...prev };
                let current = updated;
                
                for (let i = 0; i < parts.length - 1; i++) {
                    current[parts[i]] = { ...current[parts[i]] };
                    current = current[parts[i]];
                }
                
                current[parts[parts.length - 1]] = type === 'number' ? parseFloat(value) : value;
                return updated;
            });
        } else if (name === 'amenities' || name === 'mealOptions') {
            setFormData(prev => ({
                ...prev,
                [name]: checked
                    ? [...prev[name], value]
                    : prev[name].filter(item => item !== value)
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: type === 'number' ? parseFloat(value) : value
            }));
        }
    };

    // Transform nested form data to flat structure for backend
    const transformFormDataForBackend = (data) => {
        return {
            flight_number: data.flightNumber,
            flight_type: data.flightType || 'domestic',
            airline_code: data.airline.code,
            airline_name: data.airline.name,
            airline_logo: data.airline.logo,
            aircraft_type: data.aircraft,
            departure_airport: data.departure.airport,
            departure_city: data.departure.city,
            departure_terminal: data.departure.terminal,
            departure_time: `${data.departure.date}T${data.departure.time}:00.000Z`,
            arrival_airport: data.arrival.airport,
            arrival_city: data.arrival.city,
            arrival_terminal: data.arrival.terminal,
            arrival_time: `${data.arrival.date}T${data.arrival.time}:00.000Z`,
            duration: data.duration,
            status: data.status,
            base_price: data.capacity.economy.price || 0,
            total_seats: (data.capacity.economy.total || 0) + (data.capacity.business.total || 0) + (data.capacity.firstClass.total || 0),
            available_seats: (data.capacity.economy.available || 0) + (data.capacity.business.available || 0) + (data.capacity.firstClass.available || 0),
            amenities: data.amenities,
            baggage_allowance: data.baggageAllowance,
            meal_options: data.mealOptions
        };
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            alert('Please fix the errors in the form');
            return;
        }

        try {
            setLoading(true);
            const backendData = transformFormDataForBackend(formData);
            
            if (isEditMode) {
                await axios.put(`/api/flight/provider/${providerId}/flights/${id}`, backendData);
                alert('Flight updated successfully!');
            } else {
                await axios.post(`/api/flight/provider/${providerId}/flights`, backendData);
                alert('Flight created successfully!');
            }
            navigate('/provider/flights');
        } catch (err) {
            console.error('Error saving flight:', err);
            console.error('Error details:', err.response?.data);
            alert(`Failed to save flight: ${err.response?.data?.error || err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveDraft = async () => {
        try {
            const draftFormData = { ...formData, status: 'draft' };
            const backendData = transformFormDataForBackend(draftFormData);
            
            if (isEditMode) {
                await axios.put(`/api/flight/provider/${providerId}/flights/${id}`, backendData);
            } else {
                await axios.post(`/api/flight/provider/${providerId}/flights`, backendData);
            }
            alert('Draft saved successfully!');
            navigate('/provider/flights');
        } catch (err) {
            console.error('Error saving draft:', err);
            console.error('Error details:', err.response?.data);
            alert(`Failed to save draft: ${err.response?.data?.error || err.message}`);
        }
    };

    const breadcrumbItems = [
        { label: 'Dashboard', path: '/provider' },
        { label: 'Flights', path: '/provider/flights' },
        { label: isEditMode ? 'Edit Flight' : 'Create Flight' }
    ];

    // Styles
    const containerStyle = {
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '2rem'
    };

    const formContainerStyle = {
        maxWidth: '1200px',
        margin: '0 auto',
        background: 'white',
        borderRadius: '24px',
        padding: '3rem',
        boxShadow: '0 20px 60px rgba(0,0,0,0.2)'
    };

    const headerStyle = {
        marginBottom: '2.5rem',
        borderBottom: '3px solid #667eea',
        paddingBottom: '1.5rem'
    };

    const titleStyle = {
        fontSize: '2.5rem',
        fontWeight: '700',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        marginBottom: '0.5rem'
    };

    const sectionStyle = {
        marginBottom: '2.5rem',
        padding: '2rem',
        background: '#f9fafb',
        borderRadius: '16px',
        border: '2px solid transparent',
        transition: 'all 0.3s ease'
    };

    const sectionActiveStyle = {
        ...sectionStyle,
        border: '2px solid #667eea',
        background: 'white',
        boxShadow: '0 4px 15px rgba(102, 126, 234, 0.1)'
    };

    const sectionTitleStyle = {
        fontSize: '1.5rem',
        fontWeight: '700',
        color: '#1f2937',
        marginBottom: '1.5rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem'
    };

    const gridStyle = {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '1.5rem',
        marginBottom: '1.5rem'
    };

    const inputStyle = {
        width: '100%',
        padding: '0.875rem 1rem',
        fontSize: '1rem',
        border: '2px solid #e5e7eb',
        borderRadius: '12px',
        transition: 'all 0.3s ease',
        outline: 'none'
    };

    const labelStyle = {
        display: 'block',
        fontSize: '0.875rem',
        fontWeight: '600',
        color: '#374151',
        marginBottom: '0.5rem',
        textTransform: 'uppercase',
        letterSpacing: '0.05em'
    };

    const errorStyle = {
        color: '#ef4444',
        fontSize: '0.875rem',
        marginTop: '0.25rem'
    };

    const checkboxContainerStyle = {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
        gap: '1rem'
    };

    const checkboxLabelStyle = {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.75rem 1rem',
        background: 'white',
        border: '2px solid #e5e7eb',
        borderRadius: '10px',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        fontSize: '0.875rem',
        fontWeight: '500'
    };

    const checkboxLabelActiveStyle = {
        ...checkboxLabelStyle,
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        borderColor: '#667eea'
    };

    const buttonContainerStyle = {
        display: 'flex',
        justifyContent: 'flex-end',
        gap: '1rem',
        marginTop: '2.5rem',
        paddingTop: '2rem',
        borderTop: '2px solid #e5e7eb'
    };

    const buttonStyle = {
        padding: '1rem 2.5rem',
        fontSize: '1rem',
        fontWeight: '600',
        borderRadius: '12px',
        border: 'none',
        cursor: 'pointer',
        transition: 'all 0.3s ease'
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
        color: '#6b7280',
        border: '2px solid #e5e7eb'
    };

    if (loading && isEditMode) return <Spinner />;
    if (error) return <ErrorAlert message={error} />;

    return (
        <div style={containerStyle}>
            <form onSubmit={handleSubmit} style={formContainerStyle}>
                <Breadcrumb items={breadcrumbItems} />

                <div style={headerStyle}>
                    <h1 style={titleStyle}>
                        {isEditMode ? '✈️ Edit Flight' : '✈️ Create New Flight'}
                    </h1>
                    <p style={{ color: '#6b7280' }}>Fill in the details to {isEditMode ? 'update' : 'create'} a flight</p>
                </div>

                {/* Basic Information */}
                <div 
                    style={activeSection === 'basic' ? sectionActiveStyle : sectionStyle}
                    onFocus={() => setActiveSection('basic')}
                >
                    <h2 style={sectionTitleStyle}>
                        <span style={{ fontSize: '1.75rem' }}>✈️</span>
                        Basic Information
                    </h2>
                    <div style={gridStyle}>
                        <div>
                            <label style={labelStyle}>Flight Number *</label>
                            <input
                                type="text"
                                name="flightNumber"
                                value={formData.flightNumber}
                                onChange={handleChange}
                                required
                                style={inputStyle}
                                placeholder="VN123"
                            />
                            {errors.flightNumber && <p style={errorStyle}>{errors.flightNumber}</p>}
                        </div>
                        <div>
                            <label style={labelStyle}>Flight Type *</label>
                            <select
                                name="flightType"
                                value={formData.flightType}
                                onChange={handleChange}
                                required
                                style={inputStyle}
                            >
                                <option value="domestic">Domestic</option>
                                <option value="international">International</option>
                            </select>
                        </div>
                        <div>
                            <label style={labelStyle}>Aircraft Type</label>
                            <input
                                type="text"
                                name="aircraft"
                                value={formData.aircraft}
                                onChange={handleChange}
                                style={inputStyle}
                                placeholder="Boeing 787"
                            />
                        </div>
                        <div>
                            <label style={labelStyle}>Status</label>
                            <select
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                style={inputStyle}
                            >
                                <option value="scheduled">Scheduled</option>
                                <option value="delayed">Delayed</option>
                                <option value="cancelled">Cancelled</option>
                                <option value="departed">Departed</option>
                                <option value="arrived">Arrived</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Airline Information */}
                <div 
                    style={activeSection === 'airline' ? sectionActiveStyle : sectionStyle}
                    onFocus={() => setActiveSection('airline')}
                >
                    <h2 style={sectionTitleStyle}>
                        <span style={{ fontSize: '1.75rem' }}>🏢</span>
                        Airline Information
                    </h2>
                    <div style={gridStyle}>
                        <div>
                            <label style={labelStyle}>Airline Name *</label>
                            <input
                                type="text"
                                name="airline.name"
                                value={formData.airline.name}
                                onChange={handleChange}
                                required
                                style={inputStyle}
                                placeholder="Vietnam Airlines"
                            />
                            {errors.airlineName && <p style={errorStyle}>{errors.airlineName}</p>}
                        </div>
                        <div>
                            <label style={labelStyle}>Airline Code</label>
                            <input
                                type="text"
                                name="airline.code"
                                value={formData.airline.code}
                                onChange={handleChange}
                                style={inputStyle}
                                placeholder="VN"
                            />
                        </div>
                        <div>
                            <label style={labelStyle}>Airline Logo URL</label>
                            <input
                                type="url"
                                name="airline.logo"
                                value={formData.airline.logo}
                                onChange={handleChange}
                                style={inputStyle}
                                placeholder="https://example.com/logo.png"
                            />
                        </div>
                    </div>
                </div>

                {/* Departure Information */}
                <div 
                    style={activeSection === 'departure' ? sectionActiveStyle : sectionStyle}
                    onFocus={() => setActiveSection('departure')}
                >
                    <h2 style={sectionTitleStyle}>
                        <span style={{ fontSize: '1.75rem' }}>🛫</span>
                        Departure Information
                    </h2>
                    <div style={gridStyle}>
                        <div>
                            <label style={labelStyle}>Airport *</label>
                            <input
                                type="text"
                                name="departure.airport"
                                value={formData.departure.airport}
                                onChange={handleChange}
                                required
                                style={inputStyle}
                                placeholder="Noi Bai International"
                            />
                            {errors.departureAirport && <p style={errorStyle}>{errors.departureAirport}</p>}
                        </div>
                        <div>
                            <label style={labelStyle}>City</label>
                            <input
                                type="text"
                                name="departure.city"
                                value={formData.departure.city}
                                onChange={handleChange}
                                style={inputStyle}
                                placeholder="Hanoi"
                            />
                        </div>
                        <div>
                            <label style={labelStyle}>Terminal</label>
                            <input
                                type="text"
                                name="departure.terminal"
                                value={formData.departure.terminal}
                                onChange={handleChange}
                                style={inputStyle}
                                placeholder="T1"
                            />
                        </div>
                        <div>
                            <label style={labelStyle}>Date *</label>
                            <input
                                type="date"
                                name="departure.date"
                                value={formData.departure.date}
                                onChange={handleChange}
                                required
                                style={inputStyle}
                            />
                            {errors.departureDate && <p style={errorStyle}>{errors.departureDate}</p>}
                        </div>
                        <div>
                            <label style={labelStyle}>Time *</label>
                            <input
                                type="time"
                                name="departure.time"
                                value={formData.departure.time}
                                onChange={handleChange}
                                required
                                style={inputStyle}
                            />
                        </div>
                    </div>
                </div>

                {/* Arrival Information */}
                <div 
                    style={activeSection === 'arrival' ? sectionActiveStyle : sectionStyle}
                    onFocus={() => setActiveSection('arrival')}
                >
                    <h2 style={sectionTitleStyle}>
                        <span style={{ fontSize: '1.75rem' }}>🛬</span>
                        Arrival Information
                    </h2>
                    <div style={gridStyle}>
                        <div>
                            <label style={labelStyle}>Airport *</label>
                            <input
                                type="text"
                                name="arrival.airport"
                                value={formData.arrival.airport}
                                onChange={handleChange}
                                required
                                style={inputStyle}
                                placeholder="Tan Son Nhat International"
                            />
                            {errors.arrivalAirport && <p style={errorStyle}>{errors.arrivalAirport}</p>}
                        </div>
                        <div>
                            <label style={labelStyle}>City</label>
                            <input
                                type="text"
                                name="arrival.city"
                                value={formData.arrival.city}
                                onChange={handleChange}
                                style={inputStyle}
                                placeholder="Ho Chi Minh City"
                            />
                        </div>
                        <div>
                            <label style={labelStyle}>Terminal</label>
                            <input
                                type="text"
                                name="arrival.terminal"
                                value={formData.arrival.terminal}
                                onChange={handleChange}
                                style={inputStyle}
                                placeholder="T2"
                            />
                        </div>
                        <div>
                            <label style={labelStyle}>Date *</label>
                            <input
                                type="date"
                                name="arrival.date"
                                value={formData.arrival.date}
                                onChange={handleChange}
                                required
                                style={inputStyle}
                            />
                            {errors.arrivalDate && <p style={errorStyle}>{errors.arrivalDate}</p>}
                        </div>
                        <div>
                            <label style={labelStyle}>Time *</label>
                            <input
                                type="time"
                                name="arrival.time"
                                value={formData.arrival.time}
                                onChange={handleChange}
                                required
                                style={inputStyle}
                            />
                            {errors.arrivalTime && <p style={errorStyle}>{errors.arrivalTime}</p>}
                        </div>
                        <div>
                            <label style={labelStyle}>Duration (Auto-calculated)</label>
                            <input
                                type="text"
                                value={formData.duration}
                                readOnly
                                style={{ ...inputStyle, background: '#f3f4f6' }}
                                placeholder="Will be calculated"
                            />
                        </div>
                    </div>
                </div>

                {/* Capacity & Pricing */}
                <div 
                    style={activeSection === 'capacity' ? sectionActiveStyle : sectionStyle}
                    onFocus={() => setActiveSection('capacity')}
                >
                    <h2 style={sectionTitleStyle}>
                        <span style={{ fontSize: '1.75rem' }}>💺</span>
                        Capacity & Pricing
                    </h2>
                    
                    {/* Economy Class */}
                    <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#374151', marginBottom: '1rem' }}>Economy Class</h3>
                    <div style={gridStyle}>
                        <div>
                            <label style={labelStyle}>Total Seats</label>
                            <input
                                type="number"
                                name="capacity.economy.total"
                                value={formData.capacity.economy.total}
                                onChange={handleChange}
                                min="0"
                                style={inputStyle}
                            />
                        </div>
                        <div>
                            <label style={labelStyle}>Available Seats</label>
                            <input
                                type="number"
                                name="capacity.economy.available"
                                value={formData.capacity.economy.available}
                                onChange={handleChange}
                                min="0"
                                max={formData.capacity.economy.total}
                                style={inputStyle}
                            />
                        </div>
                        <div>
                            <label style={labelStyle}>Price (VND)</label>
                            <input
                                type="number"
                                name="capacity.economy.price"
                                value={formData.capacity.economy.price}
                                onChange={handleChange}
                                min="0"
                                style={inputStyle}
                            />
                        </div>
                    </div>

                    {/* Business Class */}
                    <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#374151', marginBottom: '1rem', marginTop: '1.5rem' }}>Business Class</h3>
                    <div style={gridStyle}>
                        <div>
                            <label style={labelStyle}>Total Seats</label>
                            <input
                                type="number"
                                name="capacity.business.total"
                                value={formData.capacity.business.total}
                                onChange={handleChange}
                                min="0"
                                style={inputStyle}
                            />
                        </div>
                        <div>
                            <label style={labelStyle}>Available Seats</label>
                            <input
                                type="number"
                                name="capacity.business.available"
                                value={formData.capacity.business.available}
                                onChange={handleChange}
                                min="0"
                                max={formData.capacity.business.total}
                                style={inputStyle}
                            />
                        </div>
                        <div>
                            <label style={labelStyle}>Price (VND)</label>
                            <input
                                type="number"
                                name="capacity.business.price"
                                value={formData.capacity.business.price}
                                onChange={handleChange}
                                min="0"
                                style={inputStyle}
                            />
                        </div>
                    </div>

                    {/* First Class */}
                    <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#374151', marginBottom: '1rem', marginTop: '1.5rem' }}>First Class</h3>
                    <div style={gridStyle}>
                        <div>
                            <label style={labelStyle}>Total Seats</label>
                            <input
                                type="number"
                                name="capacity.firstClass.total"
                                value={formData.capacity.firstClass.total}
                                onChange={handleChange}
                                min="0"
                                style={inputStyle}
                            />
                        </div>
                        <div>
                            <label style={labelStyle}>Available Seats</label>
                            <input
                                type="number"
                                name="capacity.firstClass.available"
                                value={formData.capacity.firstClass.available}
                                onChange={handleChange}
                                min="0"
                                max={formData.capacity.firstClass.total}
                                style={inputStyle}
                            />
                        </div>
                        <div>
                            <label style={labelStyle}>Price (VND)</label>
                            <input
                                type="number"
                                name="capacity.firstClass.price"
                                value={formData.capacity.firstClass.price}
                                onChange={handleChange}
                                min="0"
                                style={inputStyle}
                            />
                        </div>
                    </div>
                </div>

                {/* Amenities */}
                <div 
                    style={activeSection === 'amenities' ? sectionActiveStyle : sectionStyle}
                    onFocus={() => setActiveSection('amenities')}
                >
                    <h2 style={sectionTitleStyle}>
                        <span style={{ fontSize: '1.75rem' }}>✨</span>
                        Amenities
                    </h2>
                    <div style={checkboxContainerStyle}>
                        {amenitiesList.map(amenity => (
                            <label 
                                key={amenity}
                                style={formData.amenities.includes(amenity) 
                                    ? checkboxLabelActiveStyle 
                                    : checkboxLabelStyle}
                            >
                                <input
                                    type="checkbox"
                                    name="amenities"
                                    value={amenity}
                                    checked={formData.amenities.includes(amenity)}
                                    onChange={handleChange}
                                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                                />
                                <span>{amenity}</span>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Baggage Allowance */}
                <div 
                    style={activeSection === 'baggage' ? sectionActiveStyle : sectionStyle}
                    onFocus={() => setActiveSection('baggage')}
                >
                    <h2 style={sectionTitleStyle}>
                        <span style={{ fontSize: '1.75rem' }}>🧳</span>
                        Baggage Allowance
                    </h2>
                    <div style={gridStyle}>
                        <div>
                            <label style={labelStyle}>Carry-on Weight</label>
                            <input
                                type="number"
                                name="baggageAllowance.carryOn.weight"
                                value={formData.baggageAllowance.carryOn.weight}
                                onChange={handleChange}
                                min="0"
                                style={inputStyle}
                            />
                        </div>
                        <div>
                            <label style={labelStyle}>Carry-on Unit</label>
                            <select
                                name="baggageAllowance.carryOn.unit"
                                value={formData.baggageAllowance.carryOn.unit}
                                onChange={handleChange}
                                style={inputStyle}
                            >
                                <option value="kg">Kilograms (kg)</option>
                                <option value="lbs">Pounds (lbs)</option>
                            </select>
                        </div>
                        <div>
                            <label style={labelStyle}>Checked Weight</label>
                            <input
                                type="number"
                                name="baggageAllowance.checked.weight"
                                value={formData.baggageAllowance.checked.weight}
                                onChange={handleChange}
                                min="0"
                                style={inputStyle}
                            />
                        </div>
                        <div>
                            <label style={labelStyle}>Checked Unit</label>
                            <select
                                name="baggageAllowance.checked.unit"
                                value={formData.baggageAllowance.checked.unit}
                                onChange={handleChange}
                                style={inputStyle}
                            >
                                <option value="kg">Kilograms (kg)</option>
                                <option value="lbs">Pounds (lbs)</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Meal Options */}
                <div 
                    style={activeSection === 'meals' ? sectionActiveStyle : sectionStyle}
                    onFocus={() => setActiveSection('meals')}
                >
                    <h2 style={sectionTitleStyle}>
                        <span style={{ fontSize: '1.75rem' }}>🍽️</span>
                        Meal Options
                    </h2>
                    <div style={checkboxContainerStyle}>
                        {mealOptionsList.map(meal => (
                            <label 
                                key={meal}
                                style={formData.mealOptions.includes(meal) 
                                    ? checkboxLabelActiveStyle 
                                    : checkboxLabelStyle}
                            >
                                <input
                                    type="checkbox"
                                    name="mealOptions"
                                    value={meal}
                                    checked={formData.mealOptions.includes(meal)}
                                    onChange={handleChange}
                                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                                />
                                <span>{meal}</span>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Action Buttons */}
                <div style={buttonContainerStyle}>
                    <button
                        type="button"
                        onClick={() => navigate('/provider/flights')}
                        style={secondaryButtonStyle}
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handleSaveDraft}
                        style={secondaryButtonStyle}
                    >
                        Save as Draft
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        style={primaryButtonStyle}
                    >
                        {loading ? 'Saving...' : (isEditMode ? 'Update Flight' : 'Create Flight')}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default FlightFormPage;
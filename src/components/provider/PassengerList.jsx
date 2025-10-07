import React, { useState, useEffect } from 'react';
import passengerService from '../../services/passengerService';
import PassengerForm from './PassengerForm';
import Spinner from '../ui/Spinner';
import ErrorAlert from '../shared/ErrorAlert';

const PassengerList = ({ bookingId }) => {
    const [passengers, setPassengers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editingPassenger, setEditingPassenger] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedPassenger, setSelectedPassenger] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deletePassengerId, setDeletePassengerId] = useState(null);

    useEffect(() => {
        if (bookingId) {
            fetchPassengers();
        }
    }, [bookingId]);

    const fetchPassengers = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await passengerService.getBookingPassengers(bookingId);
            setPassengers(data);
        } catch (err) {
            setError(err.message || 'Failed to load passengers');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (passenger) => {
        setEditingPassenger(passenger);
        setShowEditModal(true);
    };

    const handleSaveEdit = async (updatedPassenger) => {
        try {
            await passengerService.updatePassenger(editingPassenger.passengerId, updatedPassenger);
            setShowEditModal(false);
            setEditingPassenger(null);
            fetchPassengers();
        } catch (err) {
            setError(err.message || 'Failed to update passenger');
        }
    };

    const handleDelete = (passengerId) => {
        setDeletePassengerId(passengerId);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        try {
            await passengerService.deletePassenger(deletePassengerId);
            setShowDeleteModal(false);
            setDeletePassengerId(null);
            fetchPassengers();
        } catch (err) {
            setError(err.message || 'Failed to delete passenger');
        }
    };

    const handleViewDetails = (passenger) => {
        setSelectedPassenger(passenger);
    };

    const getGenderBadge = (gender) => {
        const colors = {
            male: '#3b82f6',
            female: '#ec4899',
            other: '#8b5cf6'
        };

        return {
            background: colors[gender] || '#6b7280',
            color: 'white',
            padding: '0.25rem 0.75rem',
            borderRadius: '20px',
            fontSize: '0.75rem',
            fontWeight: '600',
            textTransform: 'capitalize'
        };
    };

    const getMealBadge = (meal) => {
        if (!meal || meal === 'none') return null;

        return {
            background: '#f3f4f6',
            color: '#374151',
            padding: '0.25rem 0.75rem',
            borderRadius: '20px',
            fontSize: '0.75rem',
            fontWeight: '500',
            textTransform: 'capitalize'
        };
    };

    // Styles
    const containerStyle = {
        background: 'white',
        borderRadius: '16px',
        padding: '2rem',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)'
    };

    const headerStyle = {
        marginBottom: '1.5rem',
        paddingBottom: '1rem',
        borderBottom: '2px solid #e5e7eb'
    };

    const titleStyle = {
        fontSize: '1.5rem',
        fontWeight: '700',
        color: '#1f2937',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem'
    };

    const badgeStyle = {
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        padding: '0.25rem 0.75rem',
        borderRadius: '20px',
        fontSize: '0.875rem',
        fontWeight: '600'
    };

    const tableStyle = {
        width: '100%',
        borderCollapse: 'separate',
        borderSpacing: '0',
        marginTop: '1rem'
    };

    const thStyle = {
        background: '#f9fafb',
        padding: '1rem',
        textAlign: 'left',
        fontSize: '0.875rem',
        fontWeight: '600',
        color: '#374151',
        borderBottom: '2px solid #e5e7eb',
        whiteSpace: 'nowrap'
    };

    const tdStyle = {
        padding: '1rem',
        borderBottom: '1px solid #e5e7eb',
        fontSize: '0.875rem',
        color: '#1f2937'
    };

    const actionButtonStyle = {
        padding: '0.5rem 1rem',
        fontSize: '0.75rem',
        fontWeight: '600',
        borderRadius: '8px',
        border: 'none',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        marginRight: '0.5rem'
    };

    const viewButtonStyle = {
        ...actionButtonStyle,
        background: '#e0e7ff',
        color: '#4f46e5'
    };

    const editButtonStyle = {
        ...actionButtonStyle,
        background: '#dbeafe',
        color: '#1d4ed8'
    };

    const deleteButtonStyle = {
        ...actionButtonStyle,
        background: '#fee2e2',
        color: '#dc2626',
        marginRight: 0
    };

    const modalOverlayStyle = {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '2rem'
    };

    const modalContentStyle = {
        background: 'white',
        borderRadius: '16px',
        padding: '2rem',
        maxWidth: '800px',
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto'
    };

    const deleteModalStyle = {
        background: 'white',
        borderRadius: '16px',
        padding: '2rem',
        maxWidth: '500px',
        width: '100%'
    };

    const detailsModalStyle = {
        background: 'white',
        borderRadius: '16px',
        padding: '2rem',
        maxWidth: '600px',
        width: '100%'
    };

    const detailsGridStyle = {
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '1.5rem',
        marginTop: '1.5rem'
    };

    const detailItemStyle = {
        marginBottom: '0'
    };

    const detailLabelStyle = {
        fontSize: '0.75rem',
        fontWeight: '600',
        color: '#6b7280',
        marginBottom: '0.25rem',
        textTransform: 'uppercase'
    };

    const detailValueStyle = {
        fontSize: '0.875rem',
        color: '#1f2937',
        fontWeight: '500'
    };

    const emptyStateStyle = {
        textAlign: 'center',
        padding: '3rem',
        color: '#6b7280'
    };

    const emptyIconStyle = {
        fontSize: '3rem',
        marginBottom: '1rem'
    };

    if (loading) return <Spinner />;
    if (error) return <ErrorAlert message={error} />;

    return (
        <>
            <div style={containerStyle}>
                <div style={headerStyle}>
                    <h2 style={titleStyle}>
                        <span>👥</span>
                        Passengers
                        <span style={badgeStyle}>{passengers.length}</span>
                    </h2>
                </div>

                {passengers.length === 0 ? (
                    <div style={emptyStateStyle}>
                        <div style={emptyIconStyle}>✈️</div>
                        <p>No passengers found for this booking</p>
                    </div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={tableStyle}>
                            <thead>
                                <tr>
                                    <th style={{ ...thStyle, borderTopLeftRadius: '10px' }}>Full Name</th>
                                    <th style={thStyle}>Gender</th>
                                    <th style={thStyle}>Date of Birth</th>
                                    <th style={thStyle}>Nationality</th>
                                    <th style={thStyle}>Passport</th>
                                    <th style={thStyle}>Seat</th>
                                    <th style={thStyle}>Class</th>
                                    <th style={thStyle}>Meal</th>
                                    <th style={{ ...thStyle, borderTopRightRadius: '10px' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {passengers.map((passenger) => (
                                    <tr key={passenger.passengerId}>
                                        <td style={tdStyle}>
                                            <strong>{passenger.fullName}</strong>
                                        </td>
                                        <td style={tdStyle}>
                                            <span style={getGenderBadge(passenger.gender)}>
                                                {passenger.gender}
                                            </span>
                                        </td>
                                        <td style={tdStyle}>
                                            {new Date(passenger.dateOfBirth).toLocaleDateString()}
                                        </td>
                                        <td style={tdStyle}>{passenger.nationality}</td>
                                        <td style={tdStyle}>
                                            <span style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>
                                                {passenger.passportNumber}
                                            </span>
                                        </td>
                                        <td style={tdStyle}>
                                            <strong>{passenger.seatNumber || '-'}</strong>
                                        </td>
                                        <td style={tdStyle}>{passenger.seatClass || '-'}</td>
                                        <td style={tdStyle}>
                                            {passenger.mealPreference && passenger.mealPreference !== 'none' ? (
                                                <span style={getMealBadge(passenger.mealPreference)}>
                                                    {passenger.mealPreference}
                                                </span>
                                            ) : (
                                                '-'
                                            )}
                                        </td>
                                        <td style={tdStyle}>
                                            <button
                                                onClick={() => handleViewDetails(passenger)}
                                                style={viewButtonStyle}
                                            >
                                                View
                                            </button>
                                            <button
                                                onClick={() => handleEdit(passenger)}
                                                style={editButtonStyle}
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDelete(passenger.passengerId)}
                                                style={deleteButtonStyle}
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Edit Modal */}
            {showEditModal && editingPassenger && (
                <div style={modalOverlayStyle} onClick={() => setShowEditModal(false)}>
                    <div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
                        <PassengerForm
                            passenger={editingPassenger}
                            onSave={handleSaveEdit}
                            onCancel={() => {
                                setShowEditModal(false);
                                setEditingPassenger(null);
                            }}
                        />
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div style={modalOverlayStyle} onClick={() => setShowDeleteModal(false)}>
                    <div style={deleteModalStyle} onClick={(e) => e.stopPropagation()}>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#1f2937', marginBottom: '1rem' }}>
                            Delete Passenger
                        </h3>
                        <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
                            Are you sure you want to delete this passenger? This action cannot be undone.
                        </p>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                style={{
                                    padding: '0.75rem 1.5rem',
                                    fontSize: '0.875rem',
                                    fontWeight: '600',
                                    borderRadius: '10px',
                                    border: '2px solid #e5e7eb',
                                    background: 'white',
                                    color: '#6b7280',
                                    cursor: 'pointer'
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDelete}
                                style={{
                                    padding: '0.75rem 1.5rem',
                                    fontSize: '0.875rem',
                                    fontWeight: '600',
                                    borderRadius: '10px',
                                    border: 'none',
                                    background: '#dc2626',
                                    color: 'white',
                                    cursor: 'pointer'
                                }}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Details Modal */}
            {selectedPassenger && (
                <div style={modalOverlayStyle} onClick={() => setSelectedPassenger(null)}>
                    <div style={detailsModalStyle} onClick={(e) => e.stopPropagation()}>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#1f2937', marginBottom: '0.5rem' }}>
                            Passenger Details
                        </h3>
                        <p style={{ color: '#6b7280', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
                            Complete information about the passenger
                        </p>

                        <div style={detailsGridStyle}>
                            <div style={detailItemStyle}>
                                <div style={detailLabelStyle}>Full Name</div>
                                <div style={detailValueStyle}>{selectedPassenger.fullName}</div>
                            </div>

                            <div style={detailItemStyle}>
                                <div style={detailLabelStyle}>Gender</div>
                                <div style={detailValueStyle}>
                                    <span style={getGenderBadge(selectedPassenger.gender)}>
                                        {selectedPassenger.gender}
                                    </span>
                                </div>
                            </div>

                            <div style={detailItemStyle}>
                                <div style={detailLabelStyle}>Date of Birth</div>
                                <div style={detailValueStyle}>
                                    {new Date(selectedPassenger.dateOfBirth).toLocaleDateString()}
                                </div>
                            </div>

                            <div style={detailItemStyle}>
                                <div style={detailLabelStyle}>Nationality</div>
                                <div style={detailValueStyle}>{selectedPassenger.nationality}</div>
                            </div>

                            <div style={detailItemStyle}>
                                <div style={detailLabelStyle}>Passport Number</div>
                                <div style={detailValueStyle}>
                                    <span style={{ fontFamily: 'monospace' }}>
                                        {selectedPassenger.passportNumber}
                                    </span>
                                </div>
                            </div>

                            <div style={detailItemStyle}>
                                <div style={detailLabelStyle}>Seat Number</div>
                                <div style={detailValueStyle}>
                                    <strong>{selectedPassenger.seatNumber || 'Not Assigned'}</strong>
                                </div>
                            </div>

                            <div style={detailItemStyle}>
                                <div style={detailLabelStyle}>Class</div>
                                <div style={detailValueStyle}>{selectedPassenger.seatClass || 'Not Assigned'}</div>
                            </div>

                            <div style={detailItemStyle}>
                                <div style={detailLabelStyle}>Meal Preference</div>
                                <div style={detailValueStyle}>
                                    {selectedPassenger.mealPreference && selectedPassenger.mealPreference !== 'none' ? (
                                        <span style={getMealBadge(selectedPassenger.mealPreference)}>
                                            {selectedPassenger.mealPreference}
                                        </span>
                                    ) : (
                                        'No Preference'
                                    )}
                                </div>
                            </div>
                        </div>

                        {selectedPassenger.specialRequests && (
                            <div style={{ marginTop: '1.5rem' }}>
                                <div style={detailLabelStyle}>Special Requests</div>
                                <div style={{ ...detailValueStyle, marginTop: '0.5rem' }}>
                                    {selectedPassenger.specialRequests}
                                </div>
                            </div>
                        )}

                        <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end' }}>
                            <button
                                onClick={() => setSelectedPassenger(null)}
                                style={{
                                    padding: '0.75rem 1.5rem',
                                    fontSize: '0.875rem',
                                    fontWeight: '600',
                                    borderRadius: '10px',
                                    border: 'none',
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    color: 'white',
                                    cursor: 'pointer'
                                }}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default PassengerList;
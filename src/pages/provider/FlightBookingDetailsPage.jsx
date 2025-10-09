import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import flightBookingService from '../../services/flightBookingService';
import Breadcrumb from '../../components/shared/Breadcrumb';
import { Spinner } from '../../components/ui/Spinner';
import { ErrorAlert } from '../../components/shared/ErrorAlert';

const FlightBookingDetailsPage = () => {
    const navigate = useNavigate();
    const { bookingId } = useParams();

    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [cancelReason, setCancelReason] = useState('');

    useEffect(() => {
        fetchBookingDetails();
    }, [bookingId]);

    const fetchBookingDetails = async () => {
        try {
            setLoading(true);
            const response = await flightBookingService.getBookingById(bookingId);
            if (response.success) {
                setBooking(response.data);
            }
        } catch (err) {
            setError('Failed to load booking details');
        } finally {
            setLoading(false);
        }
    };

    const handleCancelBooking = async () => {
        if (!cancelReason.trim()) {
            alert('Please provide a cancellation reason');
            return;
        }

        try {
            await flightBookingService.cancelBooking(bookingId, cancelReason);
            alert('Booking cancelled successfully!');
            setShowCancelModal(false);
            fetchBookingDetails();
        } catch (err) {
            alert('Failed to cancel booking');
        }
    };

    const handlePrintTicket = () => {
        window.print();
    };

    const handleSendEmail = () => {
        alert('Email sent successfully! (Feature to be implemented)');
    };

    const breadcrumbItems = [
        { label: 'Dashboard', path: '/provider' },
        { label: 'Flight Bookings', path: '/provider/flight-bookings' },
        { label: `Booking #${bookingId}` }
    ];

    // Styles
    const containerStyle = {
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '2rem'
    };

    const contentStyle = {
        maxWidth: '1200px',
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
        fontSize: '2.5rem',
        fontWeight: '700',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        marginBottom: '1rem'
    };

    const actionsStyle = {
        display: 'flex',
        gap: '1rem',
        flexWrap: 'wrap',
        marginTop: '1.5rem'
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
        color: '#6b7280',
        border: '2px solid #e5e7eb'
    };

    const dangerButtonStyle = {
        ...buttonStyle,
        background: '#ef4444',
        color: 'white'
    };

    const sectionCardStyle = {
        background: 'white',
        borderRadius: '24px',
        padding: '2rem',
        marginBottom: '2rem',
        boxShadow: '0 20px 60px rgba(0,0,0,0.2)'
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

    const infoGridStyle = {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '1.5rem'
    };

    const infoCardStyle = {
        padding: '1.5rem',
        background: '#f9fafb',
        borderRadius: '12px',
        border: '2px solid #e5e7eb'
    };

    const infoLabelStyle = {
        fontSize: '0.875rem',
        fontWeight: '600',
        color: '#6b7280',
        marginBottom: '0.5rem',
        textTransform: 'uppercase',
        letterSpacing: '0.05em'
    };

    const infoValueStyle = {
        fontSize: '1.125rem',
        fontWeight: '600',
        color: '#1f2937'
    };

    const statusBadgeStyle = (status) => {
        const colors = {
            confirmed: { bg: '#d1fae5', color: '#065f46' },
            pending: { bg: '#fef3c7', color: '#92400e' },
            cancelled: { bg: '#fee2e2', color: '#991b1b' },
            completed: { bg: '#dbeafe', color: '#1e40af' }
        };

        const style = colors[status] || colors.pending;

        return {
            display: 'inline-block',
            padding: '0.5rem 1rem',
            borderRadius: '20px',
            fontSize: '0.875rem',
            fontWeight: '600',
            backgroundColor: style.bg,
            color: style.color
        };
    };

    const tableStyle = {
        width: '100%',
        borderCollapse: 'separate',
        borderSpacing: '0',
        marginTop: '1rem'
    };

    const thStyle = {
        textAlign: 'left',
        padding: '1rem',
        fontSize: '0.875rem',
        fontWeight: '600',
        color: '#6b7280',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        borderBottom: '2px solid #e5e7eb'
    };

    const tdStyle = {
        padding: '1rem',
        fontSize: '0.875rem',
        color: '#1f2937',
        borderBottom: '1px solid #f3f4f6'
    };

    const timelineStyle = {
        position: 'relative',
        paddingLeft: '2rem',
        marginTop: '1.5rem'
    };

    const timelineItemStyle = {
        position: 'relative',
        paddingBottom: '1.5rem',
        borderLeft: '2px solid #e5e7eb',
        paddingLeft: '1.5rem'
    };

    const timelineDotStyle = {
        position: 'absolute',
        left: '-6px',
        top: '0',
        width: '12px',
        height: '12px',
        borderRadius: '50%',
        background: '#667eea'
    };

    const modalOverlayStyle = {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000
    };

    const modalContentStyle = {
        background: 'white',
        borderRadius: '24px',
        padding: '2rem',
        maxWidth: '500px',
        width: '90%',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
    };

    const modalTitleStyle = {
        fontSize: '1.5rem',
        fontWeight: '700',
        color: '#1f2937',
        marginBottom: '1.5rem'
    };

    const textareaStyle = {
        width: '100%',
        padding: '0.875rem 1rem',
        fontSize: '1rem',
        border: '2px solid #e5e7eb',
        borderRadius: '12px',
        minHeight: '100px',
        resize: 'vertical',
        outline: 'none',
        marginBottom: '1.5rem'
    };

    if (loading) return <Spinner />;
    if (error) return <ErrorAlert message={error} />;
    if (!booking) return <ErrorAlert message="Booking not found" />;

    return (
        <div style={containerStyle}>
            <div style={contentStyle}>
                {/* Header */}
                <div style={headerCardStyle}>
                    <Breadcrumb items={breadcrumbItems} />
                    <h1 style={titleStyle}>
                        Booking Details: {booking.bookingCode || `#${booking.id}`}
                    </h1>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <span style={statusBadgeStyle(booking.status)}>
                            {booking.status.toUpperCase()}
                        </span>
                        <span style={{ color: '#6b7280' }}>
                            Booked on {new Date(booking.bookingDate).toLocaleDateString()}
                        </span>
                    </div>

                    {/* Actions */}
                    <div style={actionsStyle}>
                        <button
                            onClick={() => navigate('/provider/flight-bookings')}
                            style={secondaryButtonStyle}
                        >
                            ← Back to List
                        </button>
                        <button
                            onClick={handlePrintTicket}
                            style={primaryButtonStyle}
                        >
                            🖨️ Print Ticket
                        </button>
                        <button
                            onClick={handleSendEmail}
                            style={primaryButtonStyle}
                        >
                            ✉️ Send Email
                        </button>
                        {booking.status !== 'cancelled' && booking.status !== 'completed' && (
                            <button
                                onClick={() => setShowCancelModal(true)}
                                style={dangerButtonStyle}
                            >
                                ❌ Cancel Booking
                            </button>
                        )}
                    </div>
                </div>

                {/* Customer Information */}
                <div style={sectionCardStyle}>
                    <h2 style={sectionTitleStyle}>
                        <span>👤</span>
                        Customer Information
                    </h2>
                    <div style={infoGridStyle}>
                        <div style={infoCardStyle}>
                            <div style={infoLabelStyle}>Name</div>
                            <div style={infoValueStyle}>{booking.customerName}</div>
                        </div>
                        <div style={infoCardStyle}>
                            <div style={infoLabelStyle}>Email</div>
                            <div style={infoValueStyle}>{booking.customerEmail}</div>
                        </div>
                        <div style={infoCardStyle}>
                            <div style={infoLabelStyle}>Phone</div>
                            <div style={infoValueStyle}>{booking.customerPhone}</div>
                        </div>
                    </div>
                </div>

                {/* Flight Details */}
                <div style={sectionCardStyle}>
                    <h2 style={sectionTitleStyle}>
                        <span>✈️</span>
                        Flight Details
                    </h2>
                    <div style={infoGridStyle}>
                        <div style={infoCardStyle}>
                            <div style={infoLabelStyle}>Flight Number</div>
                            <div style={infoValueStyle}>{booking.flightNumber}</div>
                        </div>
                        <div style={infoCardStyle}>
                            <div style={infoLabelStyle}>Airline</div>
                            <div style={infoValueStyle}>{booking.airlineName}</div>
                        </div>
                        <div style={infoCardStyle}>
                            <div style={infoLabelStyle}>Route</div>
                            <div style={infoValueStyle}>
                                {booking.departureCity} → {booking.arrivalCity}
                            </div>
                        </div>
                        <div style={infoCardStyle}>
                            <div style={infoLabelStyle}>Departure</div>
                            <div style={infoValueStyle}>
                                {booking.departureDate} {booking.departureTime}
                            </div>
                        </div>
                        <div style={infoCardStyle}>
                            <div style={infoLabelStyle}>Arrival</div>
                            <div style={infoValueStyle}>
                                {booking.arrivalDate} {booking.arrivalTime}
                            </div>
                        </div>
                        <div style={infoCardStyle}>
                            <div style={infoLabelStyle}>Duration</div>
                            <div style={infoValueStyle}>{booking.duration}</div>
                        </div>
                    </div>
                </div>

                {/* Seat Information */}
                <div style={sectionCardStyle}>
                    <h2 style={sectionTitleStyle}>
                        <span>💺</span>
                        Seat Information
                    </h2>
                    <div style={infoGridStyle}>
                        <div style={infoCardStyle}>
                            <div style={infoLabelStyle}>Seat Number(s)</div>
                            <div style={infoValueStyle}>
                                {Array.isArray(booking.seats) ? booking.seats.join(', ') : booking.seatNumber}
                            </div>
                        </div>
                        <div style={infoCardStyle}>
                            <div style={infoLabelStyle}>Class</div>
                            <div style={infoValueStyle}>{booking.seatClass}</div>
                        </div>
                        <div style={infoCardStyle}>
                            <div style={infoLabelStyle}>Total Passengers</div>
                            <div style={infoValueStyle}>{booking.passengerCount || 1}</div>
                        </div>
                    </div>
                </div>

                {/* Passenger List */}
                {booking.passengers && booking.passengers.length > 0 && (
                    <div style={sectionCardStyle}>
                        <h2 style={sectionTitleStyle}>
                            <span>👥</span>
                            Passenger List
                        </h2>
                        <table style={tableStyle}>
                            <thead>
                                <tr>
                                    <th style={thStyle}>Name</th>
                                    <th style={thStyle}>Age</th>
                                    <th style={thStyle}>Gender</th>
                                    <th style={thStyle}>Seat</th>
                                    <th style={thStyle}>Meal Preference</th>
                                </tr>
                            </thead>
                            <tbody>
                                {booking.passengers.map((passenger, index) => (
                                    <tr key={index}>
                                        <td style={tdStyle}>{passenger.name}</td>
                                        <td style={tdStyle}>{passenger.age}</td>
                                        <td style={tdStyle}>{passenger.gender}</td>
                                        <td style={tdStyle}>{passenger.seat}</td>
                                        <td style={tdStyle}>{passenger.mealPreference || 'N/A'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Payment Information */}
                <div style={sectionCardStyle}>
                    <h2 style={sectionTitleStyle}>
                        <span>💳</span>
                        Payment Information
                    </h2>
                    <div style={infoGridStyle}>
                        <div style={infoCardStyle}>
                            <div style={infoLabelStyle}>Total Price</div>
                            <div style={{ ...infoValueStyle, fontSize: '1.5rem', color: '#667eea' }}>
                                {booking.totalPrice.toLocaleString()} VND
                            </div>
                        </div>
                        <div style={infoCardStyle}>
                            <div style={infoLabelStyle}>Payment Method</div>
                            <div style={infoValueStyle}>{booking.paymentMethod || 'N/A'}</div>
                        </div>
                        <div style={infoCardStyle}>
                            <div style={infoLabelStyle}>Payment Status</div>
                            <div style={infoValueStyle}>{booking.paymentStatus || 'Paid'}</div>
                        </div>
                        <div style={infoCardStyle}>
                            <div style={infoLabelStyle}>Transaction ID</div>
                            <div style={infoValueStyle}>{booking.transactionId || 'N/A'}</div>
                        </div>
                    </div>
                </div>

                {/* Booking Timeline */}
                <div style={sectionCardStyle}>
                    <h2 style={sectionTitleStyle}>
                        <span>🕐</span>
                        Booking Timeline
                    </h2>
                    <div style={timelineStyle}>
                        {booking.timeline && booking.timeline.length > 0 ? (
                            booking.timeline.map((event, index) => (
                                <div key={index} style={timelineItemStyle}>
                                    <div style={timelineDotStyle}></div>
                                    <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>
                                        {event.action}
                                    </div>
                                    <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                                        {new Date(event.timestamp).toLocaleString()}
                                    </div>
                                    {event.note && (
                                        <div style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.25rem' }}>
                                            {event.note}
                                        </div>
                                    )}
                                </div>
                            ))
                        ) : (
                            <div>
                                <div style={timelineItemStyle}>
                                    <div style={timelineDotStyle}></div>
                                    <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>
                                        Booking Created
                                    </div>
                                    <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                                        {new Date(booking.bookingDate).toLocaleString()}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Cancel Booking Modal */}
            {showCancelModal && (
                <div style={modalOverlayStyle} onClick={() => setShowCancelModal(false)}>
                    <div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
                        <h3 style={modalTitleStyle}>Cancel Booking</h3>
                        <p style={{ color: '#6b7280', marginBottom: '1rem' }}>
                            Please provide a reason for cancellation:
                        </p>
                        <textarea
                            value={cancelReason}
                            onChange={(e) => setCancelReason(e.target.value)}
                            style={textareaStyle}
                            placeholder="Enter cancellation reason..."
                        />
                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                            <button
                                onClick={() => setShowCancelModal(false)}
                                style={secondaryButtonStyle}
                            >
                                Close
                            </button>
                            <button
                                onClick={handleCancelBooking}
                                style={dangerButtonStyle}
                            >
                                Confirm Cancellation
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FlightBookingDetailsPage;
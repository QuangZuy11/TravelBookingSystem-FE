import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import flightService from '../../../services/flightService';
import scheduleService from '../../../services/scheduleService';
import flightBookingService from '../../../services/flightBookingService';
import passengerService from '../../../services/passengerService';
import MultiPassengerForm from '../../../components/provider/MultiPassengerForm';
import Spinner from '../../../components/ui/Spinner';
import ErrorAlert from '../../../components/shared/ErrorAlert';

const FlightBookingFormPage = () => {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Data states
    const [flights, setFlights] = useState([]);
    const [schedules, setSchedules] = useState([]);
    const [availableSeats, setAvailableSeats] = useState([]);

    // Form states
    const [bookingData, setBookingData] = useState({
        userId: '',
        userEmail: '',
        userName: '',
        userPhone: '',
        flightId: '',
        scheduleId: '',
        seatClass: 'Economy',
        numberOfPassengers: 1,
        totalPrice: 0,
        paymentMethod: 'credit_card',
        specialRequests: ''
    });

    const [selectedSeats, setSelectedSeats] = useState([]);
    const [passengers, setPassengers] = useState([]);

    useEffect(() => {
        fetchFlights();
    }, []);

    useEffect(() => {
        if (bookingData.flightId) {
            fetchSchedules(bookingData.flightId);
        }
    }, [bookingData.flightId]);

    useEffect(() => {
        if (bookingData.scheduleId) {
            fetchAvailableSeats(bookingData.scheduleId);
        }
    }, [bookingData.scheduleId]);

    useEffect(() => {
        calculateTotalPrice();
    }, [bookingData.seatClass, bookingData.numberOfPassengers]);

    const fetchFlights = async () => {
        try {
            setLoading(true);
            const providerId = localStorage.getItem('providerId');
            const data = await flightService.getProviderFlights(providerId);
            setFlights(data);
        } catch (err) {
            setError('Failed to load flights');
        } finally {
            setLoading(false);
        }
    };

    const fetchSchedules = async (flightId) => {
        try {
            setLoading(true);
            const data = await scheduleService.getFlightSchedules(flightId);
            // Filter for future schedules only
            const futureSchedules = data.filter(schedule =>
                new Date(schedule.departureTime) > new Date()
            );
            setSchedules(futureSchedules);
        } catch (err) {
            setError('Failed to load schedules');
        } finally {
            setLoading(false);
        }
    };

    const fetchAvailableSeats = async (scheduleId) => {
        try {
            setLoading(true);
            // Mock available seats - replace with actual API call
            const mockSeats = generateMockSeats();
            setAvailableSeats(mockSeats);
        } catch (err) {
            setError('Failed to load available seats');
        } finally {
            setLoading(false);
        }
    };

    const generateMockSeats = () => {
        const seats = [];
        const classes = ['Economy', 'Business', 'First'];
        const rows = { Economy: 20, Business: 10, First: 5 };
        const seatsPerRow = { Economy: 6, Business: 4, First: 4 };

        classes.forEach(seatClass => {
            for (let row = 1; row <= rows[seatClass]; row++) {
                for (let seat = 0; seat < seatsPerRow[seatClass]; seat++) {
                    const seatLetter = String.fromCharCode(65 + seat); // A, B, C, D...
                    seats.push({
                        seatNumber: `${row}${seatLetter}`,
                        class: seatClass,
                        isAvailable: Math.random() > 0.3, // 70% available
                        price: seatClass === 'First' ? 500 : seatClass === 'Business' ? 300 : 100
                    });
                }
            }
        });

        return seats;
    };

    const calculateTotalPrice = () => {
        const basePricePerClass = {
            'Economy': 100,
            'Business': 300,
            'First': 500
        };

        const basePrice = basePricePerClass[bookingData.seatClass] || 100;
        const total = basePrice * bookingData.numberOfPassengers;

        setBookingData(prev => ({
            ...prev,
            totalPrice: total
        }));
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setBookingData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSeatSelection = (seat) => {
        const isSelected = selectedSeats.find(s => s.seatNumber === seat.seatNumber);

        if (isSelected) {
            setSelectedSeats(selectedSeats.filter(s => s.seatNumber !== seat.seatNumber));
        } else {
            if (selectedSeats.length < bookingData.numberOfPassengers) {
                setSelectedSeats([...selectedSeats, seat]);
            }
        }
    };

    const handlePassengersSave = (passengersData) => {
        setPassengers(passengersData);
        setCurrentStep(4); // Move to confirmation
    };

    const handleSubmitBooking = async () => {
        try {
            setLoading(true);
            setError(null);

            // Create booking
            const bookingPayload = {
                userId: bookingData.userId,
                scheduleId: bookingData.scheduleId,
                seatClass: bookingData.seatClass,
                numberOfPassengers: bookingData.numberOfPassengers,
                totalPrice: bookingData.totalPrice,
                paymentMethod: bookingData.paymentMethod,
                specialRequests: bookingData.specialRequests,
                seats: selectedSeats.map(s => s.seatNumber).join(', ')
            };

            const createdBooking = await flightBookingService.createBooking(bookingPayload);

            // Add passengers to booking
            if (passengers.length > 0) {
                await passengerService.addMultiplePassengers(createdBooking.bookingId, passengers);
            }

            // Navigate to booking details
            navigate(`/provider/flight-bookings/${createdBooking.bookingId}`);
        } catch (err) {
            setError(err.message || 'Failed to create booking');
        } finally {
            setLoading(false);
        }
    };

    const getSelectedFlight = () => {
        return flights.find(f => f.flightId === parseInt(bookingData.flightId));
    };

    const getSelectedSchedule = () => {
        return schedules.find(s => s.scheduleId === parseInt(bookingData.scheduleId));
    };

    // Styles
    const containerStyle = {
        padding: '2rem',
        maxWidth: '1400px',
        margin: '0 auto'
    };

    const headerStyle = {
        marginBottom: '2rem'
    };

    const titleStyle = {
        fontSize: '2rem',
        fontWeight: '700',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        marginBottom: '0.5rem'
    };

    const subtitleStyle = {
        fontSize: '1rem',
        color: '#6b7280'
    };

    const progressBarContainerStyle = {
        background: 'white',
        borderRadius: '16px',
        padding: '2rem',
        marginBottom: '2rem',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)'
    };

    const stepsStyle = {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'relative'
    };

    const stepStyle = (stepNumber) => ({
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        flex: 1,
        position: 'relative',
        zIndex: 1
    });

    const stepCircleStyle = (stepNumber) => ({
        width: '50px',
        height: '50px',
        borderRadius: '50%',
        background: currentStep >= stepNumber
            ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
            : '#e5e7eb',
        color: currentStep >= stepNumber ? 'white' : '#6b7280',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '1.25rem',
        fontWeight: '700',
        marginBottom: '0.5rem',
        transition: 'all 0.3s ease'
    });

    const stepLabelStyle = (stepNumber) => ({
        fontSize: '0.875rem',
        fontWeight: '600',
        color: currentStep >= stepNumber ? '#667eea' : '#6b7280',
        textAlign: 'center'
    });

    const stepLineStyle = (stepNumber) => ({
        position: 'absolute',
        top: '25px',
        left: '50%',
        right: '-50%',
        height: '3px',
        background: currentStep > stepNumber ? '#667eea' : '#e5e7eb',
        zIndex: 0,
        transition: 'all 0.3s ease'
    });

    const contentCardStyle = {
        background: 'white',
        borderRadius: '16px',
        padding: '2rem',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
        marginBottom: '2rem'
    };

    const sectionTitleStyle = {
        fontSize: '1.25rem',
        fontWeight: '700',
        color: '#1f2937',
        marginBottom: '1.5rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem'
    };

    const gridStyle = {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '1.5rem',
        marginBottom: '1.5rem'
    };

    const formGroupStyle = {
        marginBottom: '0'
    };

    const labelStyle = {
        display: 'block',
        fontSize: '0.875rem',
        fontWeight: '600',
        color: '#374151',
        marginBottom: '0.5rem'
    };

    const inputStyle = {
        width: '100%',
        padding: '0.75rem 1rem',
        fontSize: '0.875rem',
        border: '2px solid #e5e7eb',
        borderRadius: '10px',
        outline: 'none'
    };

    const selectStyle = {
        ...inputStyle
    };

    const seatGridStyle = {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(60px, 1fr))',
        gap: '0.5rem',
        marginTop: '1rem'
    };

    const seatButtonStyle = (seat, isSelected) => ({
        padding: '0.75rem',
        fontSize: '0.75rem',
        fontWeight: '600',
        borderRadius: '8px',
        border: isSelected ? '2px solid #667eea' : '2px solid #e5e7eb',
        background: !seat.isAvailable ? '#f3f4f6' : isSelected ? '#667eea' : 'white',
        color: !seat.isAvailable ? '#9ca3af' : isSelected ? 'white' : '#374151',
        cursor: seat.isAvailable ? 'pointer' : 'not-allowed',
        transition: 'all 0.3s ease'
    });

    const buttonContainerStyle = {
        display: 'flex',
        justifyContent: 'space-between',
        gap: '1rem',
        marginTop: '2rem'
    };

    const buttonStyle = {
        padding: '0.875rem 2rem',
        fontSize: '0.875rem',
        fontWeight: '600',
        borderRadius: '10px',
        border: 'none',
        cursor: 'pointer',
        transition: 'all 0.3s ease'
    };

    const nextButtonStyle = {
        ...buttonStyle,
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)'
    };

    const backButtonStyle = {
        ...buttonStyle,
        background: 'white',
        color: '#6b7280',
        border: '2px solid #e5e7eb'
    };

    const summaryCardStyle = {
        background: '#f9fafb',
        borderRadius: '12px',
        padding: '1.5rem',
        marginBottom: '1rem'
    };

    const summaryRowStyle = {
        display: 'flex',
        justifyContent: 'space-between',
        padding: '0.75rem 0',
        borderBottom: '1px solid #e5e7eb'
    };

    const summaryLabelStyle = {
        fontSize: '0.875rem',
        color: '#6b7280'
    };

    const summaryValueStyle = {
        fontSize: '0.875rem',
        fontWeight: '600',
        color: '#1f2937'
    };

    const totalRowStyle = {
        ...summaryRowStyle,
        borderBottom: 'none',
        fontSize: '1.25rem',
        fontWeight: '700',
        color: '#667eea'
    };

    if (loading) return <Spinner />;

    return (
        <div style={containerStyle}>
            {/* Header */}
            <div style={headerStyle}>
                <h1 style={titleStyle}>Create New Flight Booking</h1>
                <p style={subtitleStyle}>
                    Complete the booking process step by step
                </p>
            </div>

            {/* Progress Bar */}
            <div style={progressBarContainerStyle}>
                <div style={stepsStyle}>
                    <div style={stepStyle(1)}>
                        <div style={stepCircleStyle(1)}>1</div>
                        <span style={stepLabelStyle(1)}>Flight & Customer</span>
                    </div>
                    <div style={{ ...stepStyle(2), position: 'relative' }}>
                        {currentStep > 1 && <div style={stepLineStyle(1)}></div>}
                        <div style={stepCircleStyle(2)}>2</div>
                        <span style={stepLabelStyle(2)}>Seat Selection</span>
                    </div>
                    <div style={{ ...stepStyle(3), position: 'relative' }}>
                        {currentStep > 2 && <div style={stepLineStyle(2)}></div>}
                        <div style={stepCircleStyle(3)}>3</div>
                        <span style={stepLabelStyle(3)}>Passenger Info</span>
                    </div>
                    <div style={{ ...stepStyle(4), position: 'relative' }}>
                        {currentStep > 3 && <div style={stepLineStyle(3)}></div>}
                        <div style={stepCircleStyle(4)}>4</div>
                        <span style={stepLabelStyle(4)}>Confirmation</span>
                    </div>
                </div>
            </div>

            {error && <ErrorAlert message={error} />}

            {/* Step 1: Flight & Customer Selection */}
            {currentStep === 1 && (
                <div style={contentCardStyle}>
                    <h2 style={sectionTitleStyle}>
                        <span>✈️</span>
                        Flight & Customer Information
                    </h2>

                    <div style={gridStyle}>
                        <div style={formGroupStyle}>
                            <label style={labelStyle}>Customer User ID *</label>
                            <input
                                type="text"
                                name="userId"
                                value={bookingData.userId}
                                onChange={handleInputChange}
                                style={inputStyle}
                                placeholder="Enter user ID"
                            />
                        </div>

                        <div style={formGroupStyle}>
                            <label style={labelStyle}>Customer Name *</label>
                            <input
                                type="text"
                                name="userName"
                                value={bookingData.userName}
                                onChange={handleInputChange}
                                style={inputStyle}
                                placeholder="Enter customer name"
                            />
                        </div>

                        <div style={formGroupStyle}>
                            <label style={labelStyle}>Email *</label>
                            <input
                                type="email"
                                name="userEmail"
                                value={bookingData.userEmail}
                                onChange={handleInputChange}
                                style={inputStyle}
                                placeholder="customer@email.com"
                            />
                        </div>

                        <div style={formGroupStyle}>
                            <label style={labelStyle}>Phone Number *</label>
                            <input
                                type="tel"
                                name="userPhone"
                                value={bookingData.userPhone}
                                onChange={handleInputChange}
                                style={inputStyle}
                                placeholder="+84 xxx xxx xxx"
                            />
                        </div>

                        <div style={formGroupStyle}>
                            <label style={labelStyle}>Select Flight *</label>
                            <select
                                name="flightId"
                                value={bookingData.flightId}
                                onChange={handleInputChange}
                                style={selectStyle}
                            >
                                <option value="">Choose a flight...</option>
                                {flights.map(flight => (
                                    <option key={flight.flightId} value={flight.flightId}>
                                        {flight.flightNumber} - {flight.departureAirport} → {flight.arrivalAirport}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div style={formGroupStyle}>
                            <label style={labelStyle}>Select Schedule *</label>
                            <select
                                name="scheduleId"
                                value={bookingData.scheduleId}
                                onChange={handleInputChange}
                                style={selectStyle}
                                disabled={!bookingData.flightId}
                            >
                                <option value="">Choose a schedule...</option>
                                {schedules.map(schedule => (
                                    <option key={schedule.scheduleId} value={schedule.scheduleId}>
                                        {new Date(schedule.departureTime).toLocaleString()}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div style={formGroupStyle}>
                            <label style={labelStyle}>Seat Class *</label>
                            <select
                                name="seatClass"
                                value={bookingData.seatClass}
                                onChange={handleInputChange}
                                style={selectStyle}
                            >
                                <option value="Economy">Economy</option>
                                <option value="Business">Business</option>
                                <option value="First">First Class</option>
                            </select>
                        </div>

                        <div style={formGroupStyle}>
                            <label style={labelStyle}>Number of Passengers *</label>
                            <input
                                type="number"
                                name="numberOfPassengers"
                                value={bookingData.numberOfPassengers}
                                onChange={handleInputChange}
                                style={inputStyle}
                                min="1"
                                max="10"
                            />
                        </div>

                        <div style={formGroupStyle}>
                            <label style={labelStyle}>Payment Method *</label>
                            <select
                                name="paymentMethod"
                                value={bookingData.paymentMethod}
                                onChange={handleInputChange}
                                style={selectStyle}
                            >
                                <option value="credit_card">Credit Card</option>
                                <option value="debit_card">Debit Card</option>
                                <option value="paypal">PayPal</option>
                                <option value="bank_transfer">Bank Transfer</option>
                            </select>
                        </div>
                    </div>

                    <div style={buttonContainerStyle}>
                        <button
                            onClick={() => navigate('/provider/flight-bookings')}
                            style={backButtonStyle}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={() => setCurrentStep(2)}
                            style={nextButtonStyle}
                            disabled={!bookingData.userId || !bookingData.scheduleId}
                        >
                            Next: Select Seats →
                        </button>
                    </div>
                </div>
            )}

            {/* Step 2: Seat Selection */}
            {currentStep === 2 && (
                <div style={contentCardStyle}>
                    <h2 style={sectionTitleStyle}>
                        <span>💺</span>
                        Select Seats ({selectedSeats.length}/{bookingData.numberOfPassengers})
                    </h2>

                    <div style={{ marginBottom: '1rem' }}>
                        <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>
                            Select {bookingData.numberOfPassengers} seat(s) for your passengers in {bookingData.seatClass} class
                        </p>
                        <div style={{ display: 'flex', gap: '1rem', fontSize: '0.75rem' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                <div style={{ width: '12px', height: '12px', background: 'white', border: '2px solid #e5e7eb', borderRadius: '4px' }}></div>
                                Available
                            </span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                <div style={{ width: '12px', height: '12px', background: '#667eea', borderRadius: '4px' }}></div>
                                Selected
                            </span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                <div style={{ width: '12px', height: '12px', background: '#f3f4f6', borderRadius: '4px' }}></div>
                                Occupied
                            </span>
                        </div>
                    </div>

                    <div style={seatGridStyle}>
                        {availableSeats
                            .filter(seat => seat.class === bookingData.seatClass)
                            .map(seat => {
                                const isSelected = selectedSeats.find(s => s.seatNumber === seat.seatNumber);
                                return (
                                    <button
                                        key={seat.seatNumber}
                                        onClick={() => handleSeatSelection(seat)}
                                        style={seatButtonStyle(seat, isSelected)}
                                        disabled={!seat.isAvailable}
                                    >
                                        {seat.seatNumber}
                                    </button>
                                );
                            })}
                    </div>

                    <div style={buttonContainerStyle}>
                        <button
                            onClick={() => setCurrentStep(1)}
                            style={backButtonStyle}
                        >
                            ← Back
                        </button>
                        <button
                            onClick={() => setCurrentStep(3)}
                            style={nextButtonStyle}
                            disabled={selectedSeats.length !== bookingData.numberOfPassengers}
                        >
                            Next: Passenger Info →
                        </button>
                    </div>
                </div>
            )}

            {/* Step 3: Passenger Information */}
            {currentStep === 3 && (
                <MultiPassengerForm
                    onSave={handlePassengersSave}
                    onCancel={() => setCurrentStep(2)}
                    defaultSeatClass={bookingData.seatClass}
                />
            )}

            {/* Step 4: Confirmation */}
            {currentStep === 4 && (
                <div style={contentCardStyle}>
                    <h2 style={sectionTitleStyle}>
                        <span>✅</span>
                        Booking Confirmation
                    </h2>

                    <div style={summaryCardStyle}>
                        <h3 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '1rem' }}>
                            Flight Details
                        </h3>
                        <div style={summaryRowStyle}>
                            <span style={summaryLabelStyle}>Flight</span>
                            <span style={summaryValueStyle}>
                                {getSelectedFlight()?.flightNumber}
                            </span>
                        </div>
                        <div style={summaryRowStyle}>
                            <span style={summaryLabelStyle}>Route</span>
                            <span style={summaryValueStyle}>
                                {getSelectedFlight()?.departureAirport} → {getSelectedFlight()?.arrivalAirport}
                            </span>
                        </div>
                        <div style={summaryRowStyle}>
                            <span style={summaryLabelStyle}>Departure</span>
                            <span style={summaryValueStyle}>
                                {getSelectedSchedule() && new Date(getSelectedSchedule().departureTime).toLocaleString()}
                            </span>
                        </div>
                        <div style={summaryRowStyle}>
                            <span style={summaryLabelStyle}>Class</span>
                            <span style={summaryValueStyle}>{bookingData.seatClass}</span>
                        </div>
                        <div style={summaryRowStyle}>
                            <span style={summaryLabelStyle}>Seats</span>
                            <span style={summaryValueStyle}>
                                {selectedSeats.map(s => s.seatNumber).join(', ')}
                            </span>
                        </div>
                    </div>

                    <div style={summaryCardStyle}>
                        <h3 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '1rem' }}>
                            Customer Information
                        </h3>
                        <div style={summaryRowStyle}>
                            <span style={summaryLabelStyle}>Name</span>
                            <span style={summaryValueStyle}>{bookingData.userName}</span>
                        </div>
                        <div style={summaryRowStyle}>
                            <span style={summaryLabelStyle}>Email</span>
                            <span style={summaryValueStyle}>{bookingData.userEmail}</span>
                        </div>
                        <div style={summaryRowStyle}>
                            <span style={summaryLabelStyle}>Phone</span>
                            <span style={summaryValueStyle}>{bookingData.userPhone}</span>
                        </div>
                    </div>

                    <div style={summaryCardStyle}>
                        <h3 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '1rem' }}>
                            Passengers ({passengers.length})
                        </h3>
                        {passengers.map((passenger, index) => (
                            <div key={index} style={summaryRowStyle}>
                                <span style={summaryLabelStyle}>Passenger {index + 1}</span>
                                <span style={summaryValueStyle}>{passenger.fullName}</span>
                            </div>
                        ))}
                    </div>

                    <div style={summaryCardStyle}>
                        <div style={totalRowStyle}>
                            <span>Total Price</span>
                            <span>${bookingData.totalPrice.toLocaleString()}</span>
                        </div>
                        <div style={summaryRowStyle}>
                            <span style={summaryLabelStyle}>Payment Method</span>
                            <span style={summaryValueStyle}>
                                {bookingData.paymentMethod.replace('_', ' ').toUpperCase()}
                            </span>
                        </div>
                    </div>

                    <div style={buttonContainerStyle}>
                        <button
                            onClick={() => setCurrentStep(3)}
                            style={backButtonStyle}
                        >
                            ← Back
                        </button>
                        <button
                            onClick={handleSubmitBooking}
                            style={nextButtonStyle}
                            disabled={loading}
                        >
                            {loading ? 'Creating Booking...' : 'Confirm & Create Booking ✓'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FlightBookingFormPage;
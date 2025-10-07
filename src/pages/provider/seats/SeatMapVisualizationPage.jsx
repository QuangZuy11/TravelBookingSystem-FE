import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import flightClassService from '../../../services/flightClassService';
import seatService from '../../../services/seatService';

const SeatMapVisualizationPage = ({ flightIdProp }) => {
    const { flightId: flightIdParam } = useParams();
    const flightId = flightIdProp || flightIdParam; // Use prop if available, otherwise use param
    
    const [loading, setLoading] = useState(true);
    const [classes, setClasses] = useState([]);
    const [seats, setSeats] = useState([]);
    const [selectedSeat, setSelectedSeat] = useState(null);
    const [showPopover, setShowPopover] = useState(false);
    const [updating, setUpdating] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (flightId) {
            fetchData();
        } else {
            console.error('SeatMapVisualizationPage: flightId is undefined');
            setError('Flight ID is missing');
            setLoading(false);
        }
    }, [flightId]);

    const fetchData = async () => {
        try {
            setLoading(true);
            setError('');
            console.log('SeatMapVisualizationPage: Fetching data for flightId:', flightId);
            
            const [classesData, seatsData] = await Promise.all([
                flightClassService.getFlightClasses(flightId),
                seatService.getAllSeats(flightId)
            ]);
            
            console.log('SeatMapVisualizationPage: Classes loaded:', classesData?.length || 0);
            console.log('SeatMapVisualizationPage: Seats loaded:', seatsData?.length || 0);
            
            setClasses(classesData || []);
            setSeats(seatsData || []);
        } catch (error) {
            console.error('Error fetching seat map data:', error);
            console.error('Error details:', error.response?.data);
            setError(`Failed to load seat map: ${error.response?.data?.error || error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleSeatClick = (seat) => {
        setSelectedSeat(seat);
        setShowPopover(true);
    };

    const handleUpdateStatus = async (newStatus) => {
        try {
            setUpdating(true);
            await seatService.updateSeatStatus(flightId, selectedSeat._id, newStatus);
            
            // Update local state
            setSeats(prevSeats => 
                prevSeats.map(seat => 
                    seat._id === selectedSeat._id 
                        ? { ...seat, status: newStatus }
                        : seat
                )
            );
            
            setShowPopover(false);
            setSelectedSeat(null);
        } catch (error) {
            console.error('Error updating seat status:', error);
            setError('Failed to update seat status');
        } finally {
            setUpdating(false);
        }
    };

    const handleUpdatePrice = async (newPrice) => {
        try {
            setUpdating(true);
            await seatService.updateSeat(flightId, selectedSeat._id, { 
                ...selectedSeat, 
                price: parseFloat(newPrice) 
            });
            
            // Update local state
            setSeats(prevSeats => 
                prevSeats.map(seat => 
                    seat._id === selectedSeat._id 
                        ? { ...seat, price: parseFloat(newPrice) }
                        : seat
                )
            );
            
            setShowPopover(false);
            setSelectedSeat(null);
        } catch (error) {
            console.error('Error updating seat price:', error);
            setError('Failed to update seat price');
        } finally {
            setUpdating(false);
        }
    };

    const renderSeatMap = () => {
        console.log('Rendering seat map...');
        console.log('Classes:', classes);
        console.log('Seats sample:', seats.slice(0, 3));
        
        const groupedByClass = seatService.groupSeatsByClass(seats, classes);
        console.log('Grouped by class:', Object.keys(groupedByClass).map(key => ({
            classId: key,
            className: groupedByClass[key].class?.class_name,
            seatCount: groupedByClass[key].seats.length
        })));
        
        return Object.values(groupedByClass).map(({ class: classData, seats: classSeats }) => {
            console.log(`Rendering class: ${classData?.class_name}, seats: ${classSeats.length}`);
            
            if (classSeats.length === 0) {
                console.log(`No seats for class ${classData?.class_name}, skipping...`);
                return null;
            }
            
            const seatMap = seatService.organizeSeatMap(classSeats);
            const rows = Object.keys(seatMap).sort((a, b) => parseInt(a) - parseInt(b));
            
            return (
                <div key={classData._id} style={styles.classSection}>
                    {/* Class Header */}
                    <div style={styles.classHeader}>
                        <h3 style={styles.className}>
                            {classData.class_name}
                            <span style={{
                                ...styles.classBadge,
                                backgroundColor: getClassColor(classData.class_type)
                            }}>
                                {classData.class_type}
                            </span>
                        </h3>
                        <div style={styles.classStats}>
                            <div style={styles.statItem}>
                                <span style={styles.statLabel}>Available:</span>
                                <span style={{...styles.statValue, color: '#22c55e'}}>
                                    {classSeats.filter(s => s.status === 'available').length}
                                </span>
                            </div>
                            <div style={styles.statItem}>
                                <span style={styles.statLabel}>Booked:</span>
                                <span style={{...styles.statValue, color: '#94a3b8'}}>
                                    {classSeats.filter(s => s.status === 'booked').length}
                                </span>
                            </div>
                            <div style={styles.statItem}>
                                <span style={styles.statLabel}>Blocked:</span>
                                <span style={{...styles.statValue, color: '#ef4444'}}>
                                    {classSeats.filter(s => s.status === 'blocked').length}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Seat Grid */}
                    <div style={styles.seatGrid}>
                        {/* Column Headers */}
                        <div style={styles.columnHeaders}>
                            <div style={styles.rowNumberHeader}></div>
                            {seatMap[rows[0]]?.map((seat, index) => {
                                const parsed = seatService.parseSeatNumber(seat.seat_number);
                                return (
                                    <div key={index} style={styles.columnHeader}>
                                        {parsed?.letter}
                                    </div>
                                );
                            })}
                        </div>

                        {/* Seat Rows */}
                        {rows.map(row => (
                            <div key={row} style={styles.seatRow}>
                                <div style={styles.rowNumber}>{row}</div>
                                {seatMap[row].map(seat => {
                                    const statusColor = seatService.getSeatStatusColor(seat.status);
                                    return (
                                        <div
                                            key={seat._id}
                                            style={{
                                                ...styles.seat,
                                                backgroundColor: statusColor.bg,
                                                color: statusColor.color,
                                                cursor: 'pointer'
                                            }}
                                            onClick={() => handleSeatClick(seat)}
                                            title={`${seat.seat_number} - ${statusColor.label} - $${seat.price}`}
                                        >
                                            {seatService.parseSeatNumber(seat.seat_number)?.letter}
                                        </div>
                                    );
                                })}
                                <div style={styles.rowNumber}>{row}</div>
                            </div>
                        ))}
                    </div>
                </div>
            );
        });
    };

    const getClassColor = (classType) => {
        const colors = {
            Economy: '#3b82f6',
            Business: '#8b5cf6',
            First: '#f59e0b'
        };
        return colors[classType] || '#6b7280';
    };

    if (loading) {
        return (
            <div style={styles.loadingContainer}>
                <div style={styles.spinner}></div>
                <p style={styles.loadingText}>Loading seat map...</p>
            </div>
        );
    }

    if (seats.length === 0) {
        return (
            <div style={styles.emptyState}>
                <div style={{ fontSize: '64px', marginBottom: '16px' }}>💺</div>
                <h3 style={styles.emptyTitle}>No Seats Configured</h3>
                <p style={styles.emptyText}>
                    This flight doesn't have any seats yet.
                </p>
                <p style={{...styles.emptyText, marginTop: '8px', fontWeight: '600'}}>
                    Please use the "Bulk Setup" tab to generate seats first.
                </p>
                {classes.length === 0 && (
                    <p style={{...styles.emptyText, marginTop: '16px', color: '#ef4444'}}>
                        ⚠️ You need to create flight classes before setting up seats.
                    </p>
                )}
            </div>
        );
    }

    return (
        <div style={styles.container}>
            {/* Legend */}
            <div style={styles.legend}>
                <div style={styles.legendItem}>
                    <div style={{...styles.legendSeat, backgroundColor: '#22c55e'}}></div>
                    <span style={styles.legendLabel}>Available</span>
                </div>
                <div style={styles.legendItem}>
                    <div style={{...styles.legendSeat, backgroundColor: '#94a3b8'}}></div>
                    <span style={styles.legendLabel}>Booked</span>
                </div>
                <div style={styles.legendItem}>
                    <div style={{...styles.legendSeat, backgroundColor: '#ef4444'}}></div>
                    <span style={styles.legendLabel}>Blocked</span>
                </div>
            </div>

            {error && (
                <div style={styles.errorAlert}>
                    {error}
                </div>
            )}

            {/* Seat Map */}
            <div style={styles.mapContainer}>
                {renderSeatMap()}
            </div>

            {/* Seat Details Popover */}
            {showPopover && selectedSeat && (
                <>
                    <div 
                        style={styles.overlay} 
                        onClick={() => setShowPopover(false)}
                    ></div>
                    <div style={styles.popover}>
                        <div style={styles.popoverHeader}>
                            <h3 style={styles.popoverTitle}>
                                Seat {selectedSeat.seat_number}
                            </h3>
                            <button
                                onClick={() => setShowPopover(false)}
                                style={styles.closeButton}
                            >
                                ✕
                            </button>
                        </div>

                        <div style={styles.popoverBody}>
                            {/* Current Status */}
                            <div style={styles.popoverSection}>
                                <label style={styles.popoverLabel}>Status</label>
                                <div style={{
                                    ...styles.statusBadge,
                                    backgroundColor: seatService.getSeatStatusColor(selectedSeat.status).bg
                                }}>
                                    {seatService.getSeatStatusColor(selectedSeat.status).label}
                                </div>
                            </div>

                            {/* Price */}
                            <div style={styles.popoverSection}>
                                <label style={styles.popoverLabel}>Price</label>
                                <div style={styles.priceDisplay}>
                                    ${selectedSeat.price}
                                </div>
                            </div>

                            {/* Class Info */}
                            <div style={styles.popoverSection}>
                                <label style={styles.popoverLabel}>Class</label>
                                <div>
                                    {classes.find(c => c._id === selectedSeat.class_id)?.class_name || 'N/A'}
                                </div>
                            </div>

                            {/* Actions */}
                            <div style={styles.popoverSection}>
                                <label style={styles.popoverLabel}>Actions</label>
                                <div style={styles.actionButtons}>
                                    {selectedSeat.status !== 'available' && (
                                        <button
                                            onClick={() => handleUpdateStatus('available')}
                                            style={{...styles.actionButton, backgroundColor: '#22c55e'}}
                                            disabled={updating}
                                        >
                                            Mark Available
                                        </button>
                                    )}
                                    {selectedSeat.status !== 'blocked' && (
                                        <button
                                            onClick={() => handleUpdateStatus('blocked')}
                                            style={{...styles.actionButton, backgroundColor: '#ef4444'}}
                                            disabled={updating}
                                        >
                                            Block Seat
                                        </button>
                                    )}
                                    {selectedSeat.status !== 'booked' && (
                                        <button
                                            onClick={() => handleUpdateStatus('booked')}
                                            style={{...styles.actionButton, backgroundColor: '#94a3b8'}}
                                            disabled={updating}
                                        >
                                            Mark Booked
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Update Price */}
                            <div style={styles.popoverSection}>
                                <label style={styles.popoverLabel}>Update Price</label>
                                <div style={styles.priceUpdateForm}>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        defaultValue={selectedSeat.price}
                                        style={styles.priceInput}
                                        id="newPrice"
                                    />
                                    <button
                                        onClick={() => {
                                            const newPrice = document.getElementById('newPrice').value;
                                            handleUpdatePrice(newPrice);
                                        }}
                                        style={styles.updatePriceButton}
                                        disabled={updating}
                                    >
                                        Update
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

const styles = {
    container: {
        padding: '24px'
    },
    legend: {
        display: 'flex',
        justifyContent: 'center',
        gap: '32px',
        marginBottom: '24px',
        padding: '16px',
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    },
    legendItem: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
    },
    legendSeat: {
        width: '32px',
        height: '32px',
        borderRadius: '6px',
        border: '2px solid rgba(0,0,0,0.1)'
    },
    legendLabel: {
        fontSize: '14px',
        fontWeight: '600',
        color: '#475569'
    },
    errorAlert: {
        padding: '16px',
        backgroundColor: '#fee2e2',
        border: '1px solid #fecaca',
        borderRadius: '8px',
        color: '#dc2626',
        marginBottom: '24px'
    },
    mapContainer: {
        display: 'flex',
        flexDirection: 'column',
        gap: '32px'
    },
    classSection: {
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        padding: '24px',
        overflow: 'auto'
    },
    classHeader: {
        marginBottom: '24px',
        paddingBottom: '16px',
        borderBottom: '2px solid #e2e8f0'
    },
    className: {
        fontSize: '24px',
        fontWeight: '700',
        color: '#1e293b',
        marginBottom: '12px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
    },
    classBadge: {
        padding: '6px 16px',
        borderRadius: '12px',
        fontSize: '14px',
        fontWeight: '600',
        color: 'white'
    },
    classStats: {
        display: 'flex',
        gap: '24px'
    },
    statItem: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
    },
    statLabel: {
        fontSize: '14px',
        color: '#64748b'
    },
    statValue: {
        fontSize: '18px',
        fontWeight: '700'
    },
    seatGrid: {
        display: 'inline-block',
        minWidth: '100%'
    },
    columnHeaders: {
        display: 'flex',
        gap: '8px',
        marginBottom: '8px',
        paddingLeft: '8px'
    },
    rowNumberHeader: {
        width: '40px',
        flexShrink: 0
    },
    columnHeader: {
        width: '48px',
        height: '32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '14px',
        fontWeight: '700',
        color: '#64748b'
    },
    seatRow: {
        display: 'flex',
        gap: '8px',
        marginBottom: '8px',
        alignItems: 'center'
    },
    rowNumber: {
        width: '40px',
        textAlign: 'center',
        fontSize: '14px',
        fontWeight: '700',
        color: '#64748b',
        flexShrink: 0
    },
    seat: {
        width: '48px',
        height: '48px',
        borderRadius: '8px 8px 4px 4px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '14px',
        fontWeight: '700',
        border: '2px solid rgba(0,0,0,0.1)',
        transition: 'transform 0.2s, box-shadow 0.2s',
        userSelect: 'none'
    },
    overlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        zIndex: 999
    },
    popover: {
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
        zIndex: 1000,
        width: '90%',
        maxWidth: '500px',
        maxHeight: '80vh',
        overflow: 'auto'
    },
    popoverHeader: {
        padding: '20px',
        borderBottom: '1px solid #e2e8f0',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    popoverTitle: {
        fontSize: '20px',
        fontWeight: '700',
        color: '#1e293b'
    },
    closeButton: {
        width: '32px',
        height: '32px',
        borderRadius: '6px',
        border: 'none',
        backgroundColor: '#f1f5f9',
        color: '#475569',
        fontSize: '18px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    },
    popoverBody: {
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px'
    },
    popoverSection: {
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
    },
    popoverLabel: {
        fontSize: '14px',
        fontWeight: '600',
        color: '#475569'
    },
    statusBadge: {
        display: 'inline-block',
        padding: '8px 16px',
        borderRadius: '8px',
        color: 'white',
        fontWeight: '600',
        fontSize: '14px',
        alignSelf: 'flex-start'
    },
    priceDisplay: {
        fontSize: '24px',
        fontWeight: '700',
        color: '#10b981'
    },
    actionButtons: {
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
    },
    actionButton: {
        padding: '10px 16px',
        border: 'none',
        borderRadius: '8px',
        color: 'white',
        fontWeight: '600',
        fontSize: '14px',
        cursor: 'pointer',
        transition: 'opacity 0.2s'
    },
    priceUpdateForm: {
        display: 'flex',
        gap: '8px'
    },
    priceInput: {
        flex: 1,
        padding: '10px 14px',
        border: '1px solid #cbd5e1',
        borderRadius: '8px',
        fontSize: '14px',
        outline: 'none'
    },
    updatePriceButton: {
        padding: '10px 24px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        fontWeight: '600',
        cursor: 'pointer'
    },
    loadingContainer: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px 20px'
    },
    spinner: {
        width: '48px',
        height: '48px',
        border: '4px solid #e2e8f0',
        borderTopColor: '#667eea',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite'
    },
    loadingText: {
        marginTop: '16px',
        color: '#64748b',
        fontSize: '16px'
    },
    emptyState: {
        textAlign: 'center',
        padding: '60px 20px'
    },
    emptyTitle: {
        fontSize: '24px',
        fontWeight: '700',
        color: '#1e293b',
        marginBottom: '12px'
    },
    emptyText: {
        fontSize: '16px',
        color: '#64748b'
    }
};

export default SeatMapVisualizationPage;

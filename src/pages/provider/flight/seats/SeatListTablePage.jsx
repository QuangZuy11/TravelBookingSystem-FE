import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import flightClassService from '../../../../services/flightClassService';
import seatService from '../../../../services/seatService';

const SeatListTablePage = ({ flightIdProp }) => {
    const { flightId: flightIdParam } = useParams();
    const flightId = flightIdProp || flightIdParam; // Use prop if available, otherwise use param
    
    const [loading, setLoading] = useState(true);
    const [classes, setClasses] = useState([]);
    const [seats, setSeats] = useState([]);
    const [filteredSeats, setFilteredSeats] = useState([]);
    const [selectedSeats, setSelectedSeats] = useState([]);
    const [editingPriceSeatId, setEditingPriceSeatId] = useState(null);
    const [tempPrice, setTempPrice] = useState('');
    
    // Filters
    const [filters, setFilters] = useState({
        classId: '',
        status: '',
        priceMin: '',
        priceMax: ''
    });
    
    // Sort
    const [sortConfig, setSortConfig] = useState({ key: 'seat_number', direction: 'asc' });
    
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        fetchData();
    }, [flightId]);

    useEffect(() => {
        applyFilters();
    }, [seats, filters, sortConfig]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [classesData, seatsData] = await Promise.all([
                flightClassService.getFlightClasses(flightId),
                seatService.getAllSeats(flightId)
            ]);
            setClasses(classesData);
            setSeats(seatsData);
        } catch (error) {
            console.error('Error fetching data:', error);
            setError('Failed to load seats');
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = () => {
        let filtered = [...seats];

        // Filter by class
        if (filters.classId) {
            filtered = filtered.filter(seat => seat.class_id === filters.classId);
        }

        // Filter by status
        if (filters.status) {
            filtered = filtered.filter(seat => seat.status === filters.status);
        }

        // Filter by price range
        if (filters.priceMin) {
            filtered = filtered.filter(seat => seat.price >= parseFloat(filters.priceMin));
        }
        if (filters.priceMax) {
            filtered = filtered.filter(seat => seat.price <= parseFloat(filters.priceMax));
        }

        // Sort
        filtered.sort((a, b) => {
            let aValue = a[sortConfig.key];
            let bValue = b[sortConfig.key];

            // Special handling for seat_number (parse to row/letter)
            if (sortConfig.key === 'seat_number') {
                const aParsed = seatService.parseSeatNumber(a.seat_number);
                const bParsed = seatService.parseSeatNumber(b.seat_number);
                if (aParsed && bParsed) {
                    if (aParsed.row !== bParsed.row) {
                        aValue = aParsed.row;
                        bValue = bParsed.row;
                    } else {
                        aValue = aParsed.letter;
                        bValue = bParsed.letter;
                    }
                }
            }

            if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });

        setFilteredSeats(filtered);
    };

    const handleSort = (key) => {
        setSortConfig(prev => ({
            key,
            direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
        }));
    };

    const handleSelectSeat = (seatId) => {
        setSelectedSeats(prev => {
            if (prev.includes(seatId)) {
                return prev.filter(id => id !== seatId);
            }
            return [...prev, seatId];
        });
    };

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedSeats(filteredSeats.map(seat => seat._id));
        } else {
            setSelectedSeats([]);
        }
    };

    const handleBulkStatusUpdate = async (newStatus) => {
        if (selectedSeats.length === 0) {
            setError('Please select seats first');
            return;
        }

        try {
            setError('');
            await Promise.all(
                selectedSeats.map(seatId => 
                    seatService.updateSeatStatus(flightId, seatId, newStatus)
                )
            );

            // Update local state
            setSeats(prevSeats =>
                prevSeats.map(seat =>
                    selectedSeats.includes(seat._id)
                        ? { ...seat, status: newStatus }
                        : seat
                )
            );

            setSelectedSeats([]);
            setSuccessMessage(`Successfully updated ${selectedSeats.length} seats to ${newStatus}`);
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (error) {
            console.error('Error updating seats:', error);
            setError('Failed to update seats');
        }
    };

    const handleBulkPriceUpdate = async () => {
        if (selectedSeats.length === 0) {
            setError('Please select seats first');
            return;
        }

        const newPrice = prompt('Enter new price for selected seats:');
        if (!newPrice || isNaN(parseFloat(newPrice))) {
            return;
        }

        try {
            setError('');
            await Promise.all(
                selectedSeats.map(seatId => {
                    const seat = seats.find(s => s._id === seatId);
                    return seatService.updateSeat(flightId, seatId, {
                        ...seat,
                        price: parseFloat(newPrice)
                    });
                })
            );

            // Update local state
            setSeats(prevSeats =>
                prevSeats.map(seat =>
                    selectedSeats.includes(seat._id)
                        ? { ...seat, price: parseFloat(newPrice) }
                        : seat
                )
            );

            setSelectedSeats([]);
            setSuccessMessage(`Successfully updated price for ${selectedSeats.length} seats`);
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (error) {
            console.error('Error updating prices:', error);
            setError('Failed to update prices');
        }
    };

    const handleBulkDelete = async () => {
        if (selectedSeats.length === 0) {
            setError('Please select seats first');
            return;
        }

        if (!window.confirm(`Are you sure you want to delete ${selectedSeats.length} seats?`)) {
            return;
        }

        try {
            setError('');
            await Promise.all(
                selectedSeats.map(seatId => 
                    seatService.deleteSeat(flightId, seatId)
                )
            );

            // Update local state
            setSeats(prevSeats =>
                prevSeats.filter(seat => !selectedSeats.includes(seat._id))
            );

            setSelectedSeats([]);
            setSuccessMessage(`Successfully deleted ${selectedSeats.length} seats`);
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (error) {
            console.error('Error deleting seats:', error);
            setError('Failed to delete seats');
        }
    };

    const handleInlineEdit = (seatId, currentPrice) => {
        setEditingPriceSeatId(seatId);
        setTempPrice(currentPrice.toString());
    };

    const handleSaveInlineEdit = async (seatId) => {
        try {
            const seat = seats.find(s => s._id === seatId);
            await seatService.updateSeat(flightId, seatId, {
                ...seat,
                price: parseFloat(tempPrice)
            });

            setSeats(prevSeats =>
                prevSeats.map(s =>
                    s._id === seatId ? { ...s, price: parseFloat(tempPrice) } : s
                )
            );

            setEditingPriceSeatId(null);
            setTempPrice('');
        } catch (error) {
            console.error('Error updating price:', error);
            setError('Failed to update price');
        }
    };

    const handleCancelInlineEdit = () => {
        setEditingPriceSeatId(null);
        setTempPrice('');
    };

    const getClassName = (classId) => {
        const cls = classes.find(c => c._id === classId);
        return cls ? cls.class_name : 'N/A';
    };

    const getClassColor = (classId) => {
        const cls = classes.find(c => c._id === classId);
        if (!cls) return '#6b7280';
        const colors = {
            Economy: '#3b82f6',
            Business: '#8b5cf6',
            First: '#f59e0b'
        };
        return colors[cls.class_type] || '#6b7280';
    };

    if (loading) {
        return (
            <div style={styles.loadingContainer}>
                <div style={styles.spinner}></div>
                <p style={styles.loadingText}>Loading seats...</p>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            {/* Filters */}
            <div style={styles.filtersCard}>
                <h3 style={styles.filtersTitle}>Filters</h3>
                <div style={styles.filtersGrid}>
                    <div style={styles.filterGroup}>
                        <label style={styles.filterLabel}>Class</label>
                        <select
                            value={filters.classId}
                            onChange={(e) => setFilters({ ...filters, classId: e.target.value })}
                            style={styles.filterSelect}
                        >
                            <option value="">All Classes</option>
                            {classes.map(cls => (
                                <option key={cls._id} value={cls._id}>
                                    {cls.class_name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div style={styles.filterGroup}>
                        <label style={styles.filterLabel}>Status</label>
                        <select
                            value={filters.status}
                            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                            style={styles.filterSelect}
                        >
                            <option value="">All Statuses</option>
                            <option value="available">Available</option>
                            <option value="booked">Booked</option>
                            <option value="blocked">Blocked</option>
                        </select>
                    </div>

                    <div style={styles.filterGroup}>
                        <label style={styles.filterLabel}>Min Price</label>
                        <input
                            type="number"
                            value={filters.priceMin}
                            onChange={(e) => setFilters({ ...filters, priceMin: e.target.value })}
                            style={styles.filterInput}
                            placeholder="$0"
                        />
                    </div>

                    <div style={styles.filterGroup}>
                        <label style={styles.filterLabel}>Max Price</label>
                        <input
                            type="number"
                            value={filters.priceMax}
                            onChange={(e) => setFilters({ ...filters, priceMax: e.target.value })}
                            style={styles.filterInput}
                            placeholder="$999999"
                        />
                    </div>
                </div>

                <button
                    onClick={() => setFilters({ classId: '', status: '', priceMin: '', priceMax: '' })}
                    style={styles.clearFiltersButton}
                >
                    Clear Filters
                </button>
            </div>

            {/* Bulk Actions */}
            {selectedSeats.length > 0 && (
                <div style={styles.bulkActionsCard}>
                    <div style={styles.bulkActionsHeader}>
                        <span style={styles.selectedCount}>
                            {selectedSeats.length} seat(s) selected
                        </span>
                        <div style={styles.bulkActionsButtons}>
                            <button
                                onClick={() => handleBulkStatusUpdate('available')}
                                style={{...styles.bulkButton, backgroundColor: '#22c55e'}}
                            >
                                Mark Available
                            </button>
                            <button
                                onClick={() => handleBulkStatusUpdate('blocked')}
                                style={{...styles.bulkButton, backgroundColor: '#ef4444'}}
                            >
                                Block
                            </button>
                            <button
                                onClick={handleBulkPriceUpdate}
                                style={{...styles.bulkButton, backgroundColor: '#3b82f6'}}
                            >
                                Update Price
                            </button>
                            <button
                                onClick={handleBulkDelete}
                                style={{...styles.bulkButton, backgroundColor: '#dc2626'}}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Alerts */}
            {error && (
                <div style={styles.errorAlert}>{error}</div>
            )}
            {successMessage && (
                <div style={styles.successAlert}>{successMessage}</div>
            )}

            {/* Table */}
            <div style={styles.tableCard}>
                <div style={styles.tableHeader}>
                    <h3 style={styles.tableTitle}>
                        All Seats ({filteredSeats.length})
                    </h3>
                </div>

                <div style={styles.tableContainer}>
                    <table style={styles.table}>
                        <thead>
                            <tr style={styles.tableHeaderRow}>
                                <th style={styles.tableHeaderCell}>
                                    <input
                                        type="checkbox"
                                        checked={
                                            selectedSeats.length === filteredSeats.length &&
                                            filteredSeats.length > 0
                                        }
                                        onChange={handleSelectAll}
                                        style={styles.checkbox}
                                    />
                                </th>
                                <th 
                                    style={{...styles.tableHeaderCell, cursor: 'pointer'}}
                                    onClick={() => handleSort('seat_number')}
                                >
                                    Seat Number {sortConfig.key === 'seat_number' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                </th>
                                <th style={styles.tableHeaderCell}>Class</th>
                                <th 
                                    style={{...styles.tableHeaderCell, cursor: 'pointer'}}
                                    onClick={() => handleSort('price')}
                                >
                                    Price {sortConfig.key === 'price' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                </th>
                                <th 
                                    style={{...styles.tableHeaderCell, cursor: 'pointer'}}
                                    onClick={() => handleSort('status')}
                                >
                                    Status {sortConfig.key === 'status' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                </th>
                                <th style={styles.tableHeaderCell}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredSeats.length === 0 ? (
                                <tr>
                                    <td colSpan="6" style={styles.emptyCell}>
                                        No seats found
                                    </td>
                                </tr>
                            ) : (
                                filteredSeats.map(seat => (
                                    <tr key={seat._id} style={styles.tableRow}>
                                        <td style={styles.tableCell}>
                                            <input
                                                type="checkbox"
                                                checked={selectedSeats.includes(seat._id)}
                                                onChange={() => handleSelectSeat(seat._id)}
                                                style={styles.checkbox}
                                            />
                                        </td>
                                        <td style={styles.tableCell}>
                                            <span style={styles.seatNumber}>
                                                {seat.seat_number}
                                            </span>
                                        </td>
                                        <td style={styles.tableCell}>
                                            <span style={{
                                                ...styles.classBadge,
                                                backgroundColor: getClassColor(seat.class_id)
                                            }}>
                                                {getClassName(seat.class_id)}
                                            </span>
                                        </td>
                                        <td style={styles.tableCell}>
                                            {editingPriceSeatId === seat._id ? (
                                                <div style={styles.inlineEditContainer}>
                                                    <input
                                                        type="number"
                                                        value={tempPrice}
                                                        onChange={(e) => setTempPrice(e.target.value)}
                                                        style={styles.inlineEditInput}
                                                        autoFocus
                                                    />
                                                    <button
                                                        onClick={() => handleSaveInlineEdit(seat._id)}
                                                        style={styles.inlineEditSaveButton}
                                                    >
                                                        ✓
                                                    </button>
                                                    <button
                                                        onClick={handleCancelInlineEdit}
                                                        style={styles.inlineEditCancelButton}
                                                    >
                                                        ✕
                                                    </button>
                                                </div>
                                            ) : (
                                                <span 
                                                    style={styles.priceText}
                                                    onDoubleClick={() => handleInlineEdit(seat._id, seat.price)}
                                                    title="Double-click to edit"
                                                >
                                                    ${seat.price}
                                                </span>
                                            )}
                                        </td>
                                        <td style={styles.tableCell}>
                                            <span style={{
                                                ...styles.statusBadge,
                                                backgroundColor: seatService.getSeatStatusColor(seat.status).bg
                                            }}>
                                                {seatService.getSeatStatusColor(seat.status).label}
                                            </span>
                                        </td>
                                        <td style={styles.tableCell}>
                                            <select
                                                value={seat.status}
                                                onChange={(e) => {
                                                    seatService.updateSeatStatus(flightId, seat._id, e.target.value)
                                                        .then(() => {
                                                            setSeats(prevSeats =>
                                                                prevSeats.map(s =>
                                                                    s._id === seat._id ? { ...s, status: e.target.value } : s
                                                                )
                                                            );
                                                        })
                                                        .catch(err => setError('Failed to update status'));
                                                }}
                                                style={styles.actionSelect}
                                            >
                                                <option value="available">Available</option>
                                                <option value="booked">Booked</option>
                                                <option value="blocked">Blocked</option>
                                            </select>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

const styles = {
    container: {
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px'
    },
    filtersCard: {
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        padding: '24px'
    },
    filtersTitle: {
        fontSize: '18px',
        fontWeight: '700',
        color: '#1e293b',
        marginBottom: '16px'
    },
    filtersGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
        marginBottom: '16px'
    },
    filterGroup: {
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
    },
    filterLabel: {
        fontSize: '14px',
        fontWeight: '600',
        color: '#475569'
    },
    filterSelect: {
        padding: '10px 14px',
        border: '1px solid #cbd5e1',
        borderRadius: '8px',
        fontSize: '14px',
        outline: 'none'
    },
    filterInput: {
        padding: '10px 14px',
        border: '1px solid #cbd5e1',
        borderRadius: '8px',
        fontSize: '14px',
        outline: 'none'
    },
    clearFiltersButton: {
        padding: '8px 16px',
        backgroundColor: '#f1f5f9',
        color: '#475569',
        border: 'none',
        borderRadius: '6px',
        fontSize: '14px',
        fontWeight: '600',
        cursor: 'pointer'
    },
    bulkActionsCard: {
        backgroundColor: '#f8fafc',
        border: '2px solid #667eea',
        borderRadius: '12px',
        padding: '16px'
    },
    bulkActionsHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '12px'
    },
    selectedCount: {
        fontSize: '16px',
        fontWeight: '700',
        color: '#667eea'
    },
    bulkActionsButtons: {
        display: 'flex',
        gap: '8px',
        flexWrap: 'wrap'
    },
    bulkButton: {
        padding: '8px 16px',
        border: 'none',
        borderRadius: '6px',
        color: 'white',
        fontSize: '14px',
        fontWeight: '600',
        cursor: 'pointer'
    },
    errorAlert: {
        padding: '16px',
        backgroundColor: '#fee2e2',
        border: '1px solid #fecaca',
        borderRadius: '8px',
        color: '#dc2626'
    },
    successAlert: {
        padding: '16px',
        backgroundColor: '#d1fae5',
        border: '1px solid #a7f3d0',
        borderRadius: '8px',
        color: '#065f46'
    },
    tableCard: {
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        overflow: 'hidden'
    },
    tableHeader: {
        padding: '20px',
        borderBottom: '1px solid #e2e8f0'
    },
    tableTitle: {
        fontSize: '20px',
        fontWeight: '700',
        color: '#1e293b'
    },
    tableContainer: {
        overflowX: 'auto'
    },
    table: {
        width: '100%',
        borderCollapse: 'collapse'
    },
    tableHeaderRow: {
        backgroundColor: '#f8fafc',
        borderBottom: '2px solid #e2e8f0'
    },
    tableHeaderCell: {
        padding: '16px',
        textAlign: 'left',
        fontSize: '14px',
        fontWeight: '700',
        color: '#475569',
        whiteSpace: 'nowrap'
    },
    tableRow: {
        borderBottom: '1px solid #e2e8f0',
        transition: 'backgroundColor 0.2s'
    },
    tableCell: {
        padding: '16px',
        fontSize: '14px',
        color: '#1e293b'
    },
    checkbox: {
        width: '18px',
        height: '18px',
        cursor: 'pointer'
    },
    seatNumber: {
        fontSize: '16px',
        fontWeight: '700',
        color: '#1e293b'
    },
    classBadge: {
        display: 'inline-block',
        padding: '4px 12px',
        borderRadius: '12px',
        fontSize: '12px',
        fontWeight: '600',
        color: 'white'
    },
    priceText: {
        fontSize: '16px',
        fontWeight: '700',
        color: '#10b981',
        cursor: 'pointer'
    },
    statusBadge: {
        display: 'inline-block',
        padding: '4px 12px',
        borderRadius: '12px',
        fontSize: '12px',
        fontWeight: '600',
        color: 'white'
    },
    actionSelect: {
        padding: '6px 12px',
        border: '1px solid #cbd5e1',
        borderRadius: '6px',
        fontSize: '13px',
        outline: 'none',
        cursor: 'pointer'
    },
    inlineEditContainer: {
        display: 'flex',
        gap: '4px',
        alignItems: 'center'
    },
    inlineEditInput: {
        width: '80px',
        padding: '4px 8px',
        border: '1px solid #667eea',
        borderRadius: '4px',
        fontSize: '14px',
        outline: 'none'
    },
    inlineEditSaveButton: {
        width: '28px',
        height: '28px',
        backgroundColor: '#22c55e',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '16px'
    },
    inlineEditCancelButton: {
        width: '28px',
        height: '28px',
        backgroundColor: '#ef4444',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '16px'
    },
    emptyCell: {
        padding: '40px',
        textAlign: 'center',
        color: '#64748b',
        fontSize: '16px'
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
    }
};

export default SeatListTablePage;

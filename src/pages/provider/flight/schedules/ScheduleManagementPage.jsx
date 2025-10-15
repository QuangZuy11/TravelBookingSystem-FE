import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import scheduleService from '../../../../services/scheduleService';

const ScheduleManagementPage = ({ flightIdProp }) => {
    const { flightId: flightIdParam } = useParams();
    const flightId = flightIdProp || flightIdParam; // Use prop if available, otherwise use param
    const navigate = useNavigate();
    
    const [loading, setLoading] = useState(true);
    const [schedules, setSchedules] = useState([]);
    const [viewMode, setViewMode] = useState('timeline'); // 'timeline' or 'calendar'
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState('create'); // 'create', 'edit', 'recurring'
    const [showDelayModal, setShowDelayModal] = useState(false);
    const [selectedSchedule, setSelectedSchedule] = useState(null);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    
    // Form state
    const [formData, setFormData] = useState({
        departure_date: '',
        departure_time: '',
        arrival_date: '',
        arrival_time: '',
        gate_number: '',
        status: 'scheduled',
        actual_departure: '',
        actual_arrival: '',
        delay_reason: ''
    });

    // Recurring form state
    const [recurringConfig, setRecurringConfig] = useState({
        startDate: '',
        endDate: '',
        departureTime: '',
        arrivalTime: '',
        frequency: 'daily',
        daysOfWeek: [],
        gateNumber: ''
    });

    // Filters
    const [dateFilter, setDateFilter] = useState({
        startDate: '',
        endDate: ''
    });

    useEffect(() => {
        fetchSchedules();
    }, [flightId]);

    const fetchSchedules = async () => {
        try {
            setLoading(true);
            const data = await scheduleService.getFlightSchedules(flightId);
            setSchedules(data);
        } catch (error) {
            console.error('Error fetching schedules:', error);
            setError('Failed to load schedules');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenCreateModal = () => {
        setModalMode('create');
        setFormData({
            departure_date: '',
            departure_time: '',
            arrival_date: '',
            arrival_time: '',
            gate_number: '',
            status: 'scheduled',
            actual_departure: '',
            actual_arrival: '',
            delay_reason: ''
        });
        setShowModal(true);
    };

    const handleOpenRecurringModal = () => {
        setModalMode('recurring');
        const today = new Date().toISOString().split('T')[0];
        setRecurringConfig({
            startDate: today,
            endDate: '',
            departureTime: '',
            arrivalTime: '',
            frequency: 'daily',
            daysOfWeek: [],
            gateNumber: ''
        });
        setShowModal(true);
    };

    const handleOpenEditModal = (schedule) => {
        setModalMode('edit');
        setSelectedSchedule(schedule);
        setFormData({
            departure_date: schedule.departure_date,
            departure_time: schedule.departure_time,
            arrival_date: schedule.arrival_date,
            arrival_time: schedule.arrival_time,
            gate_number: schedule.gate_number || '',
            status: schedule.status,
            actual_departure: schedule.actual_departure || '',
            actual_arrival: schedule.actual_arrival || '',
            delay_reason: schedule.delay_reason || ''
        });
        setShowModal(true);
    };

    const handleOpenDelayModal = (schedule) => {
        setSelectedSchedule(schedule);
        setFormData({
            ...formData,
            actual_departure: '',
            actual_arrival: '',
            delay_reason: ''
        });
        setShowDelayModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            if (modalMode === 'create') {
                const validation = scheduleService.validateScheduleData(formData);
                if (!validation.valid) {
                    setError(validation.errors.join('\n'));
                    return;
                }
                
                await scheduleService.createSchedule(flightId, formData);
                setSuccessMessage('Schedule created successfully');
            } else if (modalMode === 'edit') {
                await scheduleService.updateSchedule(flightId, selectedSchedule._id, formData);
                setSuccessMessage('Schedule updated successfully');
            } else if (modalMode === 'recurring') {
                const validation = scheduleService.validateScheduleData({
                    departure_date: recurringConfig.startDate,
                    departure_time: recurringConfig.departureTime,
                    arrival_date: recurringConfig.startDate,
                    arrival_time: recurringConfig.arrivalTime
                });
                
                if (!validation.valid) {
                    setError(validation.errors.join('\n'));
                    return;
                }

                if (!recurringConfig.endDate) {
                    setError('End date is required for recurring schedules');
                    return;
                }

                await scheduleService.createRecurringSchedules(flightId, recurringConfig);
                setSuccessMessage('Recurring schedules created successfully');
            }

            setShowModal(false);
            fetchSchedules();
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (error) {
            console.error('Error saving schedule:', error);
            setError(error.response?.data?.message || 'Failed to save schedule');
        }
    };

    const handleMarkDelayed = async (e) => {
        e.preventDefault();
        
        try {
            await scheduleService.updateScheduleStatus(
                flightId,
                selectedSchedule._id,
                'delayed',
                {
                    actual_departure: formData.actual_departure || null,
                    actual_arrival: formData.actual_arrival || null,
                    delay_reason: formData.delay_reason
                }
            );
            
            setSuccessMessage('Schedule marked as delayed');
            setShowDelayModal(false);
            fetchSchedules();
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (error) {
            console.error('Error marking delayed:', error);
            setError('Failed to update schedule status');
        }
    };

    const handleQuickStatusUpdate = async (schedule, newStatus) => {
        try {
            await scheduleService.updateScheduleStatus(flightId, schedule._id, newStatus);
            setSuccessMessage(`Schedule marked as ${newStatus}`);
            fetchSchedules();
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (error) {
            console.error('Error updating status:', error);
            setError('Failed to update status');
        }
    };

    const handleDelete = async (scheduleId) => {
        if (!window.confirm('Are you sure you want to delete this schedule?')) {
            return;
        }

        try {
            await scheduleService.deleteSchedule(flightId, scheduleId);
            setSuccessMessage('Schedule deleted successfully');
            fetchSchedules();
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (error) {
            console.error('Error deleting schedule:', error);
            setError('Failed to delete schedule');
        }
    };

    const toggleDayOfWeek = (day) => {
        setRecurringConfig(prev => ({
            ...prev,
            daysOfWeek: prev.daysOfWeek.includes(day)
                ? prev.daysOfWeek.filter(d => d !== day)
                : [...prev.daysOfWeek, day]
        }));
    };

    const getFilteredSchedules = () => {
        let filtered = [...schedules];
        
        if (dateFilter.startDate || dateFilter.endDate) {
            filtered = scheduleService.filterSchedulesByDateRange(
                filtered,
                dateFilter.startDate,
                dateFilter.endDate
            );
        }
        
        return filtered;
    };

    const renderTimelineView = () => {
        const filtered = getFilteredSchedules();
        const grouped = scheduleService.groupSchedulesByDate(filtered);
        const dates = Object.keys(grouped).sort();

        if (dates.length === 0) {
            return (
                <div style={styles.emptyState}>
                    <p style={styles.emptyText}>No schedules found</p>
                </div>
            );
        }

        return (
            <div style={styles.timeline}>
                {dates.map(date => (
                    <div key={date} style={styles.timelineDate}>
                        <div style={styles.dateHeader}>
                            <h3 style={styles.dateTitle}>
                                {new Date(date).toLocaleDateString('en-US', {
                                    weekday: 'long',
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}
                            </h3>
                            <span style={styles.scheduleCount}>
                                {grouped[date].length} schedule(s)
                            </span>
                        </div>
                        <div style={styles.scheduleCards}>
                            {grouped[date].map(schedule => (
                                <div key={schedule._id} style={styles.scheduleCard}>
                                    {/* Status Badge */}
                                    <div style={{
                                        ...styles.statusBadge,
                                        backgroundColor: scheduleService.getStatusColor(schedule.status).bg
                                    }}>
                                        {scheduleService.getStatusColor(schedule.status).label}
                                    </div>

                                    {/* Times */}
                                    <div style={styles.cardTimes}>
                                        <div style={styles.timeBlock}>
                                            <div style={styles.timeLabel}>Departure</div>
                                            <div style={styles.timeValue}>
                                                {schedule.departure_time}
                                            </div>
                                            {schedule.actual_departure && (
                                                <div style={styles.actualTime}>
                                                    Actual: {scheduleService.parseISODateTime(schedule.actual_departure).time}
                                                </div>
                                            )}
                                        </div>
                                        <div style={styles.arrow}>→</div>
                                        <div style={styles.timeBlock}>
                                            <div style={styles.timeLabel}>Arrival</div>
                                            <div style={styles.timeValue}>
                                                {schedule.arrival_time}
                                            </div>
                                            {schedule.actual_arrival && (
                                                <div style={styles.actualTime}>
                                                    Actual: {scheduleService.parseISODateTime(schedule.actual_arrival).time}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Gate */}
                                    {schedule.gate_number && (
                                        <div style={styles.gateInfo}>
                                            <span style={styles.gateLabel}>Gate:</span>
                                            <span style={styles.gateValue}>{schedule.gate_number}</span>
                                        </div>
                                    )}

                                    {/* Delay Info */}
                                    {schedule.delay_reason && (
                                        <div style={styles.delayInfo}>
                                            <strong>Delay Reason:</strong> {schedule.delay_reason}
                                        </div>
                                    )}

                                    {/* Actions */}
                                    <div style={styles.cardActions}>
                                        {schedule.status === 'scheduled' && (
                                            <>
                                                <button
                                                    onClick={() => handleOpenDelayModal(schedule)}
                                                    style={{...styles.actionBtn, backgroundColor: '#f59e0b'}}
                                                >
                                                    Mark Delayed
                                                </button>
                                                <button
                                                    onClick={() => handleQuickStatusUpdate(schedule, 'completed')}
                                                    style={{...styles.actionBtn, backgroundColor: '#22c55e'}}
                                                >
                                                    Complete
                                                </button>
                                            </>
                                        )}
                                        {schedule.status === 'delayed' && (
                                            <button
                                                onClick={() => handleQuickStatusUpdate(schedule, 'completed')}
                                                style={{...styles.actionBtn, backgroundColor: '#22c55e'}}
                                            >
                                                Complete
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleOpenEditModal(schedule)}
                                            style={{...styles.actionBtn, backgroundColor: '#3b82f6'}}
                                        >
                                            Edit
                                        </button>
                                        {schedule.status === 'scheduled' && (
                                            <button
                                                onClick={() => handleQuickStatusUpdate(schedule, 'cancelled')}
                                                style={{...styles.actionBtn, backgroundColor: '#ef4444'}}
                                            >
                                                Cancel
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleDelete(schedule._id)}
                                            style={{...styles.actionBtn, backgroundColor: '#dc2626'}}
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    if (loading) {
        return (
            <div style={styles.loadingContainer}>
                <div style={styles.spinner}></div>
                <p style={styles.loadingText}>Loading schedules...</p>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            {/* Header */}
            <div style={styles.header}>
                <div>
                    <h2 style={styles.title}>Flight Schedules</h2>
                    <p style={styles.subtitle}>
                        Manage flight schedules, track delays, and update statuses
                    </p>
                </div>
                <button
                    onClick={() => navigate(`/provider/flights/${flightId}`)}
                    style={styles.backButton}
                >
                    ← Back to Flight
                </button>
            </div>

            {/* Actions Bar */}
            <div style={styles.actionsBar}>
                <div style={styles.actionButtons}>
                    <button
                        onClick={handleOpenCreateModal}
                        style={styles.primaryButton}
                    >
                        + Add Schedule
                    </button>
                    <button
                        onClick={handleOpenRecurringModal}
                        style={styles.secondaryButton}
                    >
                        🔄 Create Recurring
                    </button>
                </div>

                {/* Date Filter */}
                <div style={styles.dateFilters}>
                    <input
                        type="date"
                        value={dateFilter.startDate}
                        onChange={(e) => setDateFilter({...dateFilter, startDate: e.target.value})}
                        style={styles.dateInput}
                        placeholder="From"
                    />
                    <input
                        type="date"
                        value={dateFilter.endDate}
                        onChange={(e) => setDateFilter({...dateFilter, endDate: e.target.value})}
                        style={styles.dateInput}
                        placeholder="To"
                    />
                    <button
                        onClick={() => setDateFilter({startDate: '', endDate: ''})}
                        style={styles.clearButton}
                    >
                        Clear
                    </button>
                </div>
            </div>

            {/* Alerts */}
            {error && (
                <div style={styles.errorAlert}>{error}</div>
            )}
            {successMessage && (
                <div style={styles.successAlert}>{successMessage}</div>
            )}

            {/* Timeline View */}
            {renderTimelineView()}

            {/* Create/Edit Modal */}
            {showModal && (
                <>
                    <div style={styles.overlay} onClick={() => setShowModal(false)}></div>
                    <div style={styles.modal}>
                        <div style={styles.modalHeader}>
                            <h3 style={styles.modalTitle}>
                                {modalMode === 'create' && 'Create Schedule'}
                                {modalMode === 'edit' && 'Edit Schedule'}
                                {modalMode === 'recurring' && 'Create Recurring Schedules'}
                            </h3>
                            <button
                                onClick={() => setShowModal(false)}
                                style={styles.closeButton}
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} style={styles.modalBody}>
                            {modalMode !== 'recurring' ? (
                                <>
                                    {/* Single Schedule Form */}
                                    <div style={styles.formGrid}>
                                        <div style={styles.formGroup}>
                                            <label style={styles.label}>Departure Date *</label>
                                            <input
                                                type="date"
                                                value={formData.departure_date}
                                                onChange={(e) => setFormData({...formData, departure_date: e.target.value})}
                                                style={styles.input}
                                                required
                                            />
                                        </div>

                                        <div style={styles.formGroup}>
                                            <label style={styles.label}>Departure Time *</label>
                                            <input
                                                type="time"
                                                value={formData.departure_time}
                                                onChange={(e) => setFormData({...formData, departure_time: e.target.value})}
                                                style={styles.input}
                                                required
                                            />
                                        </div>

                                        <div style={styles.formGroup}>
                                            <label style={styles.label}>Arrival Date *</label>
                                            <input
                                                type="date"
                                                value={formData.arrival_date}
                                                onChange={(e) => setFormData({...formData, arrival_date: e.target.value})}
                                                style={styles.input}
                                                required
                                            />
                                        </div>

                                        <div style={styles.formGroup}>
                                            <label style={styles.label}>Arrival Time *</label>
                                            <input
                                                type="time"
                                                value={formData.arrival_time}
                                                onChange={(e) => setFormData({...formData, arrival_time: e.target.value})}
                                                style={styles.input}
                                                required
                                            />
                                        </div>

                                        <div style={styles.formGroup}>
                                            <label style={styles.label}>Gate Number</label>
                                            <input
                                                type="text"
                                                value={formData.gate_number}
                                                onChange={(e) => setFormData({...formData, gate_number: e.target.value})}
                                                style={styles.input}
                                                placeholder="e.g., A12"
                                            />
                                        </div>

                                        <div style={styles.formGroup}>
                                            <label style={styles.label}>Status</label>
                                            <select
                                                value={formData.status}
                                                onChange={(e) => setFormData({...formData, status: e.target.value})}
                                                style={styles.input}
                                            >
                                                <option value="scheduled">Scheduled</option>
                                                <option value="delayed">Delayed</option>
                                                <option value="cancelled">Cancelled</option>
                                                <option value="completed">Completed</option>
                                            </select>
                                        </div>
                                    </div>

                                    {formData.status === 'delayed' && (
                                        <>
                                            <h4 style={styles.sectionTitle}>Delay Information</h4>
                                            <div style={styles.formGrid}>
                                                <div style={styles.formGroup}>
                                                    <label style={styles.label}>Actual Departure</label>
                                                    <input
                                                        type="datetime-local"
                                                        value={formData.actual_departure}
                                                        onChange={(e) => setFormData({...formData, actual_departure: e.target.value})}
                                                        style={styles.input}
                                                    />
                                                </div>

                                                <div style={styles.formGroup}>
                                                    <label style={styles.label}>Actual Arrival</label>
                                                    <input
                                                        type="datetime-local"
                                                        value={formData.actual_arrival}
                                                        onChange={(e) => setFormData({...formData, actual_arrival: e.target.value})}
                                                        style={styles.input}
                                                    />
                                                </div>
                                            </div>

                                            <div style={styles.formGroup}>
                                                <label style={styles.label}>Delay Reason *</label>
                                                <textarea
                                                    value={formData.delay_reason}
                                                    onChange={(e) => setFormData({...formData, delay_reason: e.target.value})}
                                                    style={{...styles.input, minHeight: '80px'}}
                                                    placeholder="Explain the reason for delay..."
                                                    required
                                                />
                                            </div>
                                        </>
                                    )}
                                </>
                            ) : (
                                <>
                                    {/* Recurring Schedule Form */}
                                    <div style={styles.formGrid}>
                                        <div style={styles.formGroup}>
                                            <label style={styles.label}>Start Date *</label>
                                            <input
                                                type="date"
                                                value={recurringConfig.startDate}
                                                onChange={(e) => setRecurringConfig({...recurringConfig, startDate: e.target.value})}
                                                style={styles.input}
                                                required
                                            />
                                        </div>

                                        <div style={styles.formGroup}>
                                            <label style={styles.label}>End Date *</label>
                                            <input
                                                type="date"
                                                value={recurringConfig.endDate}
                                                onChange={(e) => setRecurringConfig({...recurringConfig, endDate: e.target.value})}
                                                style={styles.input}
                                                required
                                            />
                                        </div>

                                        <div style={styles.formGroup}>
                                            <label style={styles.label}>Departure Time *</label>
                                            <input
                                                type="time"
                                                value={recurringConfig.departureTime}
                                                onChange={(e) => setRecurringConfig({...recurringConfig, departureTime: e.target.value})}
                                                style={styles.input}
                                                required
                                            />
                                        </div>

                                        <div style={styles.formGroup}>
                                            <label style={styles.label}>Arrival Time *</label>
                                            <input
                                                type="time"
                                                value={recurringConfig.arrivalTime}
                                                onChange={(e) => setRecurringConfig({...recurringConfig, arrivalTime: e.target.value})}
                                                style={styles.input}
                                                required
                                            />
                                        </div>

                                        <div style={styles.formGroup}>
                                            <label style={styles.label}>Gate Number</label>
                                            <input
                                                type="text"
                                                value={recurringConfig.gateNumber}
                                                onChange={(e) => setRecurringConfig({...recurringConfig, gateNumber: e.target.value})}
                                                style={styles.input}
                                                placeholder="e.g., A12"
                                            />
                                        </div>

                                        <div style={styles.formGroup}>
                                            <label style={styles.label}>Frequency *</label>
                                            <select
                                                value={recurringConfig.frequency}
                                                onChange={(e) => setRecurringConfig({...recurringConfig, frequency: e.target.value})}
                                                style={styles.input}
                                            >
                                                <option value="daily">Daily</option>
                                                <option value="weekly">Weekly</option>
                                                <option value="monthly">Monthly</option>
                                            </select>
                                        </div>
                                    </div>

                                    {recurringConfig.frequency === 'weekly' && (
                                        <div style={styles.formGroup}>
                                            <label style={styles.label}>Days of Week *</label>
                                            <div style={styles.daysGrid}>
                                                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
                                                    <button
                                                        key={day}
                                                        type="button"
                                                        onClick={() => toggleDayOfWeek(index)}
                                                        style={{
                                                            ...styles.dayButton,
                                                            ...(recurringConfig.daysOfWeek.includes(index) 
                                                                ? styles.dayButtonActive 
                                                                : {})
                                                        }}
                                                    >
                                                        {day}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <div style={styles.infoBox}>
                                        <strong>Preview:</strong> This will create schedules from{' '}
                                        {recurringConfig.startDate || '...'} to {recurringConfig.endDate || '...'}
                                        {recurringConfig.frequency === 'weekly' && recurringConfig.daysOfWeek.length > 0 && (
                                            <> on selected days of the week</>
                                        )}
                                    </div>
                                </>
                            )}

                            <div style={styles.modalActions}>
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    style={styles.cancelButton}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    style={styles.submitButton}
                                >
                                    {modalMode === 'create' && 'Create Schedule'}
                                    {modalMode === 'edit' && 'Update Schedule'}
                                    {modalMode === 'recurring' && 'Create Schedules'}
                                </button>
                            </div>
                        </form>
                    </div>
                </>
            )}

            {/* Delay Modal */}
            {showDelayModal && (
                <>
                    <div style={styles.overlay} onClick={() => setShowDelayModal(false)}></div>
                    <div style={styles.modal}>
                        <div style={styles.modalHeader}>
                            <h3 style={styles.modalTitle}>Mark as Delayed</h3>
                            <button
                                onClick={() => setShowDelayModal(false)}
                                style={styles.closeButton}
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleMarkDelayed} style={styles.modalBody}>
                            <div style={styles.formGrid}>
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Actual Departure</label>
                                    <input
                                        type="datetime-local"
                                        value={formData.actual_departure}
                                        onChange={(e) => setFormData({...formData, actual_departure: e.target.value})}
                                        style={styles.input}
                                    />
                                </div>

                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Actual Arrival</label>
                                    <input
                                        type="datetime-local"
                                        value={formData.actual_arrival}
                                        onChange={(e) => setFormData({...formData, actual_arrival: e.target.value})}
                                        style={styles.input}
                                    />
                                </div>
                            </div>

                            <div style={styles.formGroup}>
                                <label style={styles.label}>Delay Reason *</label>
                                <textarea
                                    value={formData.delay_reason}
                                    onChange={(e) => setFormData({...formData, delay_reason: e.target.value})}
                                    style={{...styles.input, minHeight: '100px'}}
                                    placeholder="Explain the reason for delay..."
                                    required
                                />
                            </div>

                            <div style={styles.modalActions}>
                                <button
                                    type="button"
                                    onClick={() => setShowDelayModal(false)}
                                    style={styles.cancelButton}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    style={{...styles.submitButton, backgroundColor: '#f59e0b'}}
                                >
                                    Mark as Delayed
                                </button>
                            </div>
                        </form>
                    </div>
                </>
            )}
        </div>
    );
};

const styles = {
    container: {
        padding: '24px',
        maxWidth: '1400px',
        margin: '0 auto'
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '32px'
    },
    title: {
        fontSize: '32px',
        fontWeight: '700',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        marginBottom: '8px'
    },
    subtitle: {
        color: '#64748b',
        fontSize: '16px'
    },
    backButton: {
        padding: '12px 24px',
        backgroundColor: 'white',
        color: '#667eea',
        border: '2px solid #667eea',
        borderRadius: '8px',
        fontSize: '16px',
        fontWeight: '600',
        cursor: 'pointer'
    },
    actionsBar: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px',
        flexWrap: 'wrap',
        gap: '16px'
    },
    actionButtons: {
        display: 'flex',
        gap: '12px'
    },
    primaryButton: {
        padding: '12px 24px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        fontSize: '16px',
        fontWeight: '600',
        cursor: 'pointer'
    },
    secondaryButton: {
        padding: '12px 24px',
        backgroundColor: 'white',
        color: '#667eea',
        border: '2px solid #667eea',
        borderRadius: '8px',
        fontSize: '16px',
        fontWeight: '600',
        cursor: 'pointer'
    },
    dateFilters: {
        display: 'flex',
        gap: '12px',
        alignItems: 'center'
    },
    dateInput: {
        padding: '10px 14px',
        border: '1px solid #cbd5e1',
        borderRadius: '8px',
        fontSize: '14px',
        outline: 'none'
    },
    clearButton: {
        padding: '10px 16px',
        backgroundColor: '#f1f5f9',
        color: '#475569',
        border: 'none',
        borderRadius: '6px',
        fontSize: '14px',
        fontWeight: '600',
        cursor: 'pointer'
    },
    errorAlert: {
        padding: '16px',
        backgroundColor: '#fee2e2',
        border: '1px solid #fecaca',
        borderRadius: '8px',
        color: '#dc2626',
        marginBottom: '24px',
        whiteSpace: 'pre-line'
    },
    successAlert: {
        padding: '16px',
        backgroundColor: '#d1fae5',
        border: '1px solid #a7f3d0',
        borderRadius: '8px',
        color: '#065f46',
        marginBottom: '24px'
    },
    timeline: {
        display: 'flex',
        flexDirection: 'column',
        gap: '32px'
    },
    timelineDate: {
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        overflow: 'hidden'
    },
    dateHeader: {
        padding: '20px 24px',
        backgroundColor: '#f8fafc',
        borderBottom: '2px solid #e2e8f0',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    dateTitle: {
        fontSize: '20px',
        fontWeight: '700',
        color: '#1e293b'
    },
    scheduleCount: {
        fontSize: '14px',
        color: '#64748b',
        fontWeight: '600'
    },
    scheduleCards: {
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
    },
    scheduleCard: {
        padding: '20px',
        backgroundColor: '#f8fafc',
        border: '1px solid #e2e8f0',
        borderRadius: '8px',
        position: 'relative'
    },
    statusBadge: {
        position: 'absolute',
        top: '16px',
        right: '16px',
        padding: '6px 16px',
        borderRadius: '12px',
        fontSize: '13px',
        fontWeight: '700',
        color: 'white'
    },
    cardTimes: {
        display: 'flex',
        alignItems: 'center',
        gap: '24px',
        marginBottom: '16px'
    },
    timeBlock: {
        flex: 1
    },
    timeLabel: {
        fontSize: '13px',
        color: '#64748b',
        marginBottom: '4px',
        fontWeight: '600'
    },
    timeValue: {
        fontSize: '24px',
        fontWeight: '700',
        color: '#1e293b'
    },
    actualTime: {
        fontSize: '12px',
        color: '#f59e0b',
        marginTop: '4px',
        fontWeight: '600'
    },
    arrow: {
        fontSize: '28px',
        color: '#667eea',
        fontWeight: '700'
    },
    gateInfo: {
        marginBottom: '12px',
        padding: '8px 12px',
        backgroundColor: 'white',
        borderRadius: '6px',
        display: 'inline-block'
    },
    gateLabel: {
        fontSize: '13px',
        color: '#64748b',
        marginRight: '8px'
    },
    gateValue: {
        fontSize: '16px',
        fontWeight: '700',
        color: '#1e293b'
    },
    delayInfo: {
        padding: '12px',
        backgroundColor: '#fef3c7',
        border: '1px solid #fde047',
        borderRadius: '6px',
        fontSize: '13px',
        color: '#92400e',
        marginBottom: '12px'
    },
    cardActions: {
        display: 'flex',
        gap: '8px',
        flexWrap: 'wrap'
    },
    actionBtn: {
        padding: '8px 16px',
        border: 'none',
        borderRadius: '6px',
        color: 'white',
        fontSize: '13px',
        fontWeight: '600',
        cursor: 'pointer'
    },
    emptyState: {
        textAlign: 'center',
        padding: '60px 20px',
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
    },
    emptyText: {
        fontSize: '16px',
        color: '#64748b'
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
    modal: {
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
        zIndex: 1000,
        width: '90%',
        maxWidth: '800px',
        maxHeight: '90vh',
        overflow: 'auto'
    },
    modalHeader: {
        padding: '24px',
        borderBottom: '1px solid #e2e8f0',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    modalTitle: {
        fontSize: '24px',
        fontWeight: '700',
        color: '#1e293b'
    },
    closeButton: {
        width: '36px',
        height: '36px',
        borderRadius: '6px',
        border: 'none',
        backgroundColor: '#f1f5f9',
        color: '#475569',
        fontSize: '20px',
        cursor: 'pointer'
    },
    modalBody: {
        padding: '24px'
    },
    formGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '16px',
        marginBottom: '24px'
    },
    formGroup: {
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
    },
    label: {
        fontSize: '14px',
        fontWeight: '600',
        color: '#475569'
    },
    input: {
        padding: '10px 14px',
        border: '1px solid #cbd5e1',
        borderRadius: '8px',
        fontSize: '14px',
        outline: 'none'
    },
    sectionTitle: {
        fontSize: '18px',
        fontWeight: '700',
        color: '#1e293b',
        marginBottom: '16px',
        marginTop: '8px'
    },
    daysGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(7, 1fr)',
        gap: '8px'
    },
    dayButton: {
        padding: '12px',
        border: '2px solid #cbd5e1',
        borderRadius: '8px',
        backgroundColor: 'white',
        fontSize: '13px',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'all 0.2s'
    },
    dayButtonActive: {
        borderColor: '#667eea',
        backgroundColor: '#667eea',
        color: 'white'
    },
    infoBox: {
        padding: '16px',
        backgroundColor: '#f0f9ff',
        border: '1px solid #bae6fd',
        borderRadius: '8px',
        fontSize: '14px',
        color: '#0c4a6e',
        marginTop: '16px'
    },
    modalActions: {
        display: 'flex',
        justifyContent: 'flex-end',
        gap: '12px',
        marginTop: '24px',
        paddingTop: '24px',
        borderTop: '1px solid #e2e8f0'
    },
    cancelButton: {
        padding: '12px 24px',
        backgroundColor: 'white',
        color: '#475569',
        border: '2px solid #cbd5e1',
        borderRadius: '8px',
        fontSize: '16px',
        fontWeight: '600',
        cursor: 'pointer'
    },
    submitButton: {
        padding: '12px 24px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        fontSize: '16px',
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
    }
};

export default ScheduleManagementPage;

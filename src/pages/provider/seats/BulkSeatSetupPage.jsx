import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import flightClassService from '../../../services/flightClassService';
import seatService from '../../../services/seatService';

const BulkSeatSetupPage = ({ flightIdProp }) => {
    const { flightId: flightIdParam } = useParams();
    const flightId = flightIdProp || flightIdParam; // Use prop if available, otherwise use param
    const navigate = useNavigate();
    
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [classes, setClasses] = useState([]);
    const [configurations, setConfigurations] = useState([]);
    const [step, setStep] = useState(1); // 1: Configure, 2: Preview
    const [error, setError] = useState('');

    useEffect(() => {
        fetchClasses();
    }, [flightId]);

    const fetchClasses = async () => {
        try {
            setLoading(true);
            const data = await flightClassService.getFlightClasses(flightId);
            setClasses(data);
            
            // Initialize configurations
            const initialConfigs = data.map(cls => {
                const recommendations = seatService.getSeatLayoutRecommendations(cls.class_type);
                return {
                    classId: cls._id,
                    className: cls.class_name,
                    classType: cls.class_type,
                    rowStart: recommendations.rowStart,
                    rowEnd: recommendations.rowEnd,
                    seatLetters: recommendations.seatLetters,
                    price: cls.price,
                    enabled: true
                };
            });
            setConfigurations(initialConfigs);
        } catch (error) {
            console.error('Error fetching classes:', error);
            setError('Failed to load flight classes');
        } finally {
            setLoading(false);
        }
    };

    const updateConfiguration = (index, field, value) => {
        const updated = [...configurations];
        updated[index][field] = value;
        setConfigurations(updated);
    };

    const toggleSeatLetter = (configIndex, letter) => {
        const updated = [...configurations];
        const letters = updated[configIndex].seatLetters;
        
        if (letters.includes(letter)) {
            updated[configIndex].seatLetters = letters.filter(l => l !== letter);
        } else {
            updated[configIndex].seatLetters = [...letters, letter].sort();
        }
        
        setConfigurations(updated);
    };

    const validateConfigurations = () => {
        const errors = [];
        
        configurations.forEach((config, index) => {
            if (!config.enabled) return;
            
            const validation = seatService.validateSeatConfig(config);
            if (!validation.valid) {
                errors.push(`${config.className}: ${validation.errors.join(', ')}`);
            }
        });

        if (errors.length > 0) {
            setError(errors.join('\n'));
            return false;
        }

        return true;
    };

    const handlePreview = () => {
        if (validateConfigurations()) {
            setError('');
            setStep(2);
        }
    };

    const handleBack = () => {
        setStep(1);
        setError('');
    };

    const handleSubmit = async () => {
        try {
            setSubmitting(true);
            setError('');

            const enabledConfigs = configurations.filter(c => c.enabled);
            const allSeats = seatService.generateAllSeats(flightId, enabledConfigs);

            if (allSeats.length === 0) {
                setError('No seats to create. Enable at least one class configuration.');
                return;
            }

            await seatService.bulkCreateSeats(flightId, allSeats);
            
            // Success - navigate to seat map
            navigate(`/provider/flights/${flightId}/seats`);
        } catch (error) {
            console.error('Error creating seats:', error);
            setError(error.response?.data?.message || 'Failed to create seats');
        } finally {
            setSubmitting(false);
        }
    };

    const calculateTotals = () => {
        const enabled = configurations.filter(c => c.enabled);
        let totalSeats = 0;
        let totalRevenue = 0;

        enabled.forEach(config => {
            const seats = seatService.calculateTotalSeats(config);
            const revenue = seatService.calculateRevenuePotential(config);
            totalSeats += seats;
            totalRevenue += revenue;
        });

        return { totalSeats, totalRevenue };
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
            <div style={styles.container}>
                <div style={styles.loadingContainer}>
                    <div style={styles.spinner}></div>
                    <p style={styles.loadingText}>Loading flight classes...</p>
                </div>
            </div>
        );
    }

    if (classes.length === 0) {
        return (
            <div style={styles.container}>
                <div style={styles.emptyState}>
                    <h3 style={styles.emptyTitle}>No Flight Classes Found</h3>
                    <p style={styles.emptyText}>
                        Please create flight classes before setting up seats.
                    </p>
                    <button
                        onClick={() => navigate(`/provider/flights/${flightId}/classes`)}
                        style={styles.primaryButton}
                    >
                        Go to Classes Management
                    </button>
                </div>
            </div>
        );
    }

    const totals = calculateTotals();

    return (
        <div style={styles.container}>
            {/* Header */}
            <div style={styles.header}>
                <div>
                    <h2 style={styles.title}>Bulk Seat Setup</h2>
                    <p style={styles.subtitle}>
                        Configure seat layouts for all classes at once
                    </p>
                </div>
                <button
                    onClick={() => navigate(`/provider/flights/${flightId}/seats`)}
                    style={styles.secondaryButton}
                >
                    ← Back to Seats
                </button>
            </div>

            {/* Progress Indicator */}
            <div style={styles.progressContainer}>
                <div style={styles.progressSteps}>
                    <div style={{
                        ...styles.progressStep,
                        ...(step === 1 ? styles.progressStepActive : styles.progressStepComplete)
                    }}>
                        <div style={styles.progressStepNumber}>1</div>
                        <div style={styles.progressStepLabel}>Configure</div>
                    </div>
                    <div style={styles.progressLine}></div>
                    <div style={{
                        ...styles.progressStep,
                        ...(step === 2 ? styles.progressStepActive : {})
                    }}>
                        <div style={styles.progressStepNumber}>2</div>
                        <div style={styles.progressStepLabel}>Preview & Create</div>
                    </div>
                </div>
            </div>

            {error && (
                <div style={styles.errorAlert}>
                    <strong>Error:</strong> {error}
                </div>
            )}

            {/* Step 1: Configuration */}
            {step === 1 && (
                <div style={styles.content}>
                    {configurations.map((config, index) => (
                        <div key={config.classId} style={styles.card}>
                            {/* Card Header */}
                            <div style={styles.cardHeader}>
                                <div style={styles.cardHeaderLeft}>
                                    <input
                                        type="checkbox"
                                        checked={config.enabled}
                                        onChange={(e) => updateConfiguration(index, 'enabled', e.target.checked)}
                                        style={styles.checkbox}
                                    />
                                    <div>
                                        <h3 style={styles.cardTitle}>
                                            {config.className}
                                        </h3>
                                        <span style={{
                                            ...styles.badge,
                                            backgroundColor: getClassColor(config.classType)
                                        }}>
                                            {config.classType}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {config.enabled && (
                                <div style={styles.cardBody}>
                                    {/* Row Configuration */}
                                    <div style={styles.formGrid}>
                                        <div style={styles.formGroup}>
                                            <label style={styles.label}>Start Row</label>
                                            <input
                                                type="number"
                                                min="1"
                                                value={config.rowStart}
                                                onChange={(e) => updateConfiguration(index, 'rowStart', parseInt(e.target.value))}
                                                style={styles.input}
                                            />
                                        </div>
                                        <div style={styles.formGroup}>
                                            <label style={styles.label}>End Row</label>
                                            <input
                                                type="number"
                                                min={config.rowStart}
                                                value={config.rowEnd}
                                                onChange={(e) => updateConfiguration(index, 'rowEnd', parseInt(e.target.value))}
                                                style={styles.input}
                                            />
                                        </div>
                                        <div style={styles.formGroup}>
                                            <label style={styles.label}>Price per Seat ($)</label>
                                            <input
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                value={config.price}
                                                onChange={(e) => updateConfiguration(index, 'price', parseFloat(e.target.value))}
                                                style={styles.input}
                                            />
                                        </div>
                                    </div>

                                    {/* Seat Letters */}
                                    <div style={styles.formGroup}>
                                        <label style={styles.label}>Seat Letters (Select columns)</label>
                                        <div style={styles.seatLettersGrid}>
                                            {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K'].map(letter => (
                                                <button
                                                    key={letter}
                                                    onClick={() => toggleSeatLetter(index, letter)}
                                                    style={{
                                                        ...styles.seatLetterButton,
                                                        ...(config.seatLetters.includes(letter) 
                                                            ? { 
                                                                backgroundColor: getClassColor(config.classType),
                                                                color: 'white',
                                                                borderColor: getClassColor(config.classType)
                                                            } 
                                                            : {})
                                                    }}
                                                >
                                                    {letter}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Summary */}
                                    <div style={styles.summaryBox}>
                                        <div style={styles.summaryItem}>
                                            <span style={styles.summaryLabel}>Rows:</span>
                                            <span style={styles.summaryValue}>
                                                {config.rowEnd - config.rowStart + 1} rows
                                            </span>
                                        </div>
                                        <div style={styles.summaryItem}>
                                            <span style={styles.summaryLabel}>Seats per Row:</span>
                                            <span style={styles.summaryValue}>
                                                {config.seatLetters.length} seats
                                            </span>
                                        </div>
                                        <div style={styles.summaryItem}>
                                            <span style={styles.summaryLabel}>Total Seats:</span>
                                            <span style={styles.summaryValue}>
                                                {seatService.calculateTotalSeats(config)} seats
                                            </span>
                                        </div>
                                        <div style={styles.summaryItem}>
                                            <span style={styles.summaryLabel}>Revenue Potential:</span>
                                            <span style={{...styles.summaryValue, color: '#10b981', fontWeight: '700'}}>
                                                ${seatService.calculateRevenuePotential(config).toLocaleString()}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}

                    {/* Overall Summary */}
                    <div style={styles.overallSummaryCard}>
                        <h3 style={styles.overallSummaryTitle}>Overall Summary</h3>
                        <div style={styles.overallSummaryGrid}>
                            <div style={styles.overallSummaryItem}>
                                <div style={styles.overallSummaryLabel}>Total Seats</div>
                                <div style={styles.overallSummaryValue}>{totals.totalSeats}</div>
                            </div>
                            <div style={styles.overallSummaryItem}>
                                <div style={styles.overallSummaryLabel}>Total Revenue Potential</div>
                                <div style={{...styles.overallSummaryValue, color: '#10b981'}}>
                                    ${totals.totalRevenue.toLocaleString()}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div style={styles.actions}>
                        <button
                            onClick={handlePreview}
                            style={styles.primaryButton}
                            disabled={totals.totalSeats === 0}
                        >
                            Preview Seats →
                        </button>
                    </div>
                </div>
            )}

            {/* Step 2: Preview */}
            {step === 2 && (
                <div style={styles.content}>
                    <div style={styles.previewCard}>
                        <h3 style={styles.previewTitle}>Preview: Seats to be Created</h3>
                        
                        {configurations.filter(c => c.enabled).map(config => {
                            const totalSeats = seatService.calculateTotalSeats(config);
                            const revenue = seatService.calculateRevenuePotential(config);
                            
                            return (
                                <div key={config.classId} style={styles.previewClassSection}>
                                    <div style={styles.previewClassHeader}>
                                        <h4 style={styles.previewClassName}>
                                            {config.className}
                                            <span style={{
                                                ...styles.badge,
                                                backgroundColor: getClassColor(config.classType),
                                                marginLeft: '12px'
                                            }}>
                                                {config.classType}
                                            </span>
                                        </h4>
                                    </div>
                                    
                                    <div style={styles.previewDetails}>
                                        <div style={styles.previewDetailItem}>
                                            <span style={styles.previewLabel}>Rows:</span>
                                            <span style={styles.previewValue}>
                                                {config.rowStart} - {config.rowEnd}
                                            </span>
                                        </div>
                                        <div style={styles.previewDetailItem}>
                                            <span style={styles.previewLabel}>Columns:</span>
                                            <span style={styles.previewValue}>
                                                {config.seatLetters.join(', ')}
                                            </span>
                                        </div>
                                        <div style={styles.previewDetailItem}>
                                            <span style={styles.previewLabel}>Price:</span>
                                            <span style={styles.previewValue}>
                                                ${config.price}
                                            </span>
                                        </div>
                                        <div style={styles.previewDetailItem}>
                                            <span style={styles.previewLabel}>Total Seats:</span>
                                            <span style={{...styles.previewValue, fontWeight: '700'}}>
                                                {totalSeats}
                                            </span>
                                        </div>
                                        <div style={styles.previewDetailItem}>
                                            <span style={styles.previewLabel}>Revenue Potential:</span>
                                            <span style={{...styles.previewValue, color: '#10b981', fontWeight: '700'}}>
                                                ${revenue.toLocaleString()}
                                            </span>
                                        </div>
                                    </div>
                                    
                                    {/* Sample Seat Preview */}
                                    <div style={styles.sampleSeats}>
                                        <div style={styles.sampleSeatsLabel}>Sample seats:</div>
                                        <div style={styles.sampleSeatsGrid}>
                                            {config.seatLetters.slice(0, 6).map(letter => (
                                                <div key={letter} style={styles.sampleSeat}>
                                                    {config.rowStart}{letter}
                                                </div>
                                            ))}
                                            {config.seatLetters.length > 6 && (
                                                <div style={styles.sampleSeatMore}>
                                                    +{(config.rowEnd - config.rowStart + 1) * config.seatLetters.length - 6} more
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}

                        {/* Grand Total */}
                        <div style={styles.grandTotalBox}>
                            <div style={styles.grandTotalItem}>
                                <span style={styles.grandTotalLabel}>Grand Total Seats:</span>
                                <span style={styles.grandTotalValue}>{totals.totalSeats}</span>
                            </div>
                            <div style={styles.grandTotalItem}>
                                <span style={styles.grandTotalLabel}>Grand Total Revenue:</span>
                                <span style={{...styles.grandTotalValue, color: '#10b981'}}>
                                    ${totals.totalRevenue.toLocaleString()}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div style={styles.actions}>
                        <button
                            onClick={handleBack}
                            style={styles.secondaryButton}
                            disabled={submitting}
                        >
                            ← Back to Configuration
                        </button>
                        <button
                            onClick={handleSubmit}
                            style={{...styles.primaryButton, ...styles.successButton}}
                            disabled={submitting}
                        >
                            {submitting ? 'Creating Seats...' : 'Create All Seats'}
                        </button>
                    </div>
                </div>
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
        fontSize: '28px',
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
    progressContainer: {
        marginBottom: '32px'
    },
    progressSteps: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '16px'
    },
    progressStep: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '8px'
    },
    progressStepActive: {
        color: '#667eea'
    },
    progressStepComplete: {
        color: '#10b981'
    },
    progressStepNumber: {
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        border: '2px solid currentColor',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: '700',
        fontSize: '18px'
    },
    progressStepLabel: {
        fontSize: '14px',
        fontWeight: '600'
    },
    progressLine: {
        flex: 1,
        height: '2px',
        backgroundColor: '#e2e8f0',
        maxWidth: '200px'
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
    content: {
        display: 'flex',
        flexDirection: 'column',
        gap: '24px'
    },
    card: {
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        overflow: 'hidden'
    },
    cardHeader: {
        padding: '20px',
        borderBottom: '1px solid #e2e8f0',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    cardHeaderLeft: {
        display: 'flex',
        alignItems: 'center',
        gap: '16px'
    },
    checkbox: {
        width: '20px',
        height: '20px',
        cursor: 'pointer'
    },
    cardTitle: {
        fontSize: '20px',
        fontWeight: '700',
        color: '#1e293b',
        marginBottom: '8px'
    },
    badge: {
        display: 'inline-block',
        padding: '4px 12px',
        borderRadius: '12px',
        fontSize: '12px',
        fontWeight: '600',
        color: 'white'
    },
    cardBody: {
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px'
    },
    formGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px'
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
        outline: 'none',
        transition: 'border-color 0.2s'
    },
    seatLettersGrid: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '8px'
    },
    seatLetterButton: {
        width: '48px',
        height: '48px',
        border: '2px solid #cbd5e1',
        borderRadius: '8px',
        backgroundColor: 'white',
        fontSize: '16px',
        fontWeight: '700',
        cursor: 'pointer',
        transition: 'all 0.2s'
    },
    summaryBox: {
        backgroundColor: '#f8fafc',
        padding: '16px',
        borderRadius: '8px',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '12px'
    },
    summaryItem: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    summaryLabel: {
        fontSize: '14px',
        color: '#64748b'
    },
    summaryValue: {
        fontSize: '16px',
        fontWeight: '600',
        color: '#1e293b'
    },
    overallSummaryCard: {
        backgroundColor: '#f1f5f9',
        padding: '24px',
        borderRadius: '12px',
        border: '2px solid #cbd5e1'
    },
    overallSummaryTitle: {
        fontSize: '20px',
        fontWeight: '700',
        color: '#1e293b',
        marginBottom: '16px'
    },
    overallSummaryGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '16px'
    },
    overallSummaryItem: {
        textAlign: 'center'
    },
    overallSummaryLabel: {
        fontSize: '14px',
        color: '#64748b',
        marginBottom: '8px'
    },
    overallSummaryValue: {
        fontSize: '32px',
        fontWeight: '700',
        color: '#1e293b'
    },
    previewCard: {
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        padding: '24px'
    },
    previewTitle: {
        fontSize: '22px',
        fontWeight: '700',
        color: '#1e293b',
        marginBottom: '24px'
    },
    previewClassSection: {
        marginBottom: '24px',
        padding: '20px',
        backgroundColor: '#f8fafc',
        borderRadius: '8px',
        border: '1px solid #e2e8f0'
    },
    previewClassHeader: {
        marginBottom: '16px'
    },
    previewClassName: {
        fontSize: '18px',
        fontWeight: '700',
        color: '#1e293b',
        display: 'flex',
        alignItems: 'center'
    },
    previewDetails: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '12px',
        marginBottom: '16px'
    },
    previewDetailItem: {
        display: 'flex',
        justifyContent: 'space-between',
        padding: '8px 0'
    },
    previewLabel: {
        fontSize: '14px',
        color: '#64748b'
    },
    previewValue: {
        fontSize: '14px',
        fontWeight: '600',
        color: '#1e293b'
    },
    sampleSeats: {
        marginTop: '12px'
    },
    sampleSeatsLabel: {
        fontSize: '12px',
        color: '#64748b',
        marginBottom: '8px',
        fontWeight: '600'
    },
    sampleSeatsGrid: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '8px'
    },
    sampleSeat: {
        padding: '8px 12px',
        backgroundColor: '#22c55e',
        color: 'white',
        borderRadius: '6px',
        fontSize: '12px',
        fontWeight: '700'
    },
    sampleSeatMore: {
        padding: '8px 12px',
        backgroundColor: '#cbd5e1',
        color: '#475569',
        borderRadius: '6px',
        fontSize: '12px',
        fontWeight: '600'
    },
    grandTotalBox: {
        backgroundColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '24px',
        borderRadius: '12px',
        display: 'flex',
        justifyContent: 'space-around',
        marginTop: '24px'
    },
    grandTotalItem: {
        textAlign: 'center'
    },
    grandTotalLabel: {
        fontSize: '16px',
        color: 'rgba(255,255,255,0.9)',
        display: 'block',
        marginBottom: '8px'
    },
    grandTotalValue: {
        fontSize: '36px',
        fontWeight: '700',
        color: 'white'
    },
    actions: {
        display: 'flex',
        justifyContent: 'flex-end',
        gap: '12px',
        marginTop: '24px'
    },
    primaryButton: {
        padding: '12px 32px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        fontSize: '16px',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'transform 0.2s, box-shadow 0.2s'
    },
    secondaryButton: {
        padding: '12px 32px',
        backgroundColor: 'white',
        color: '#667eea',
        border: '2px solid #667eea',
        borderRadius: '8px',
        fontSize: '16px',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'all 0.2s'
    },
    successButton: {
        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
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
        color: '#64748b',
        marginBottom: '24px'
    }
};

export default BulkSeatSetupPage;

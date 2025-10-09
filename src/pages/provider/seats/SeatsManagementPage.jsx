import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import BulkSeatSetupPage from './BulkSeatSetupPage';
import SeatMapVisualizationPage from './SeatMapVisualizationPage';
import SeatListTablePage from './SeatListTablePage';

const SeatsManagementPage = ({ flightIdProp }) => {
    const { flightId: flightIdParam } = useParams();
    const flightId = flightIdProp || flightIdParam; // Use prop if available, otherwise use param
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('map'); // 'bulk', 'map', 'list'

    const tabs = [
        { id: 'bulk', label: 'Bulk Setup', icon: '⚙️', description: 'Generate seats in bulk' },
        { id: 'map', label: 'Seat Map', icon: '💺', description: 'Visual seat map' },
        { id: 'list', label: 'List View', icon: '📋', description: 'Table view with filters' }
    ];

    return (
        <div style={styles.container}>
            {/* Header */}
            <div style={styles.header}>
                <div>
                    <h2 style={styles.title}>Seat Management</h2>
                    <p style={styles.subtitle}>
                        Manage flight seats with bulk setup, visualization, and detailed list view
                    </p>
                </div>
                <button
                    onClick={() => navigate(`/provider/flights/${flightId}`)}
                    style={styles.backButton}
                >
                    ← Back to Flight
                </button>
            </div>

            {/* Tab Navigation */}
            <div style={styles.tabsContainer}>
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        style={{
                            ...styles.tab,
                            ...(activeTab === tab.id ? styles.tabActive : {})
                        }}
                    >
                        <span style={styles.tabIcon}>{tab.icon}</span>
                        <div style={styles.tabContent}>
                            <div style={styles.tabLabel}>{tab.label}</div>
                            <div style={styles.tabDescription}>{tab.description}</div>
                        </div>
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div style={styles.tabPanel}>
                {activeTab === 'bulk' && <BulkSeatSetupPage flightIdProp={flightId} />}
                {activeTab === 'map' && <SeatMapVisualizationPage flightIdProp={flightId} />}
                {activeTab === 'list' && <SeatListTablePage flightIdProp={flightId} />}
            </div>
        </div>
    );
};

const styles = {
    container: {
        padding: '24px',
        maxWidth: '1600px',
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
        cursor: 'pointer',
        transition: 'all 0.2s'
    },
    tabsContainer: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '16px',
        marginBottom: '32px'
    },
    tab: {
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        padding: '20px',
        backgroundColor: 'white',
        border: '2px solid #e2e8f0',
        borderRadius: '12px',
        cursor: 'pointer',
        transition: 'all 0.2s',
        textAlign: 'left'
    },
    tabActive: {
        border: '2px solid #667eea',
        backgroundColor: '#f8fafc',
        boxShadow: '0 4px 12px rgba(102, 126, 234, 0.2)'
    },
    tabIcon: {
        fontSize: '32px'
    },
    tabContent: {
        flex: 1
    },
    tabLabel: {
        fontSize: '18px',
        fontWeight: '700',
        color: '#1e293b',
        marginBottom: '4px'
    },
    tabDescription: {
        fontSize: '13px',
        color: '#64748b'
    },
    tabPanel: {
        backgroundColor: '#f8fafc',
        borderRadius: '12px',
        padding: '24px',
        minHeight: '400px'
    }
};

export default SeatsManagementPage;

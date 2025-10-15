import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null
        };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        this.setState({
            error,
            errorInfo
        });

        // You can log error to an error reporting service here
        // Example: logErrorToService(error, errorInfo);
    }

    handleReset = () => {
        this.setState({
            hasError: false,
            error: null,
            errorInfo: null
        });

        if (this.props.onReset) {
            this.props.onReset();
        }
    };

    render() {
        if (this.state.hasError) {
            // Custom fallback UI
            if (this.props.fallback) {
                return this.props.fallback;
            }

            // Default fallback UI
            return (
                <div style={styles.container}>
                    <div style={styles.content}>
                        <div style={styles.iconContainer}>
                            <span style={styles.icon}>⚠️</span>
                        </div>
                        
                        <h1 style={styles.title}>Oops! Something went wrong</h1>
                        
                        <p style={styles.message}>
                            We're sorry, but something unexpected happened. 
                            Please try refreshing the page or contact support if the problem persists.
                        </p>

                        {this.state.error && process.env.NODE_ENV === 'development' && (
                            <details style={styles.details}>
                                <summary style={styles.summary}>Error Details (Development Only)</summary>
                                <div style={styles.errorDetails}>
                                    <p style={styles.errorMessage}>
                                        <strong>Error:</strong> {this.state.error.toString()}
                                    </p>
                                    {this.state.errorInfo && (
                                        <pre style={styles.stack}>
                                            {this.state.errorInfo.componentStack}
                                        </pre>
                                    )}
                                </div>
                            </details>
                        )}

                        <div style={styles.actions}>
                            <button
                                onClick={this.handleReset}
                                style={styles.resetButton}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                    e.currentTarget.style.boxShadow = '0 8px 20px rgba(102, 126, 234, 0.5)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.4)';
                                }}
                            >
                                Try Again
                            </button>
                            
                            <button
                                onClick={() => window.location.href = '/'}
                                style={styles.homeButton}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = '#f3f4f6';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = 'white';
                                }}
                            >
                                Go to Home
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

const styles = {
    container: {
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '2rem'
    },
    content: {
        background: 'white',
        borderRadius: '16px',
        padding: '3rem',
        maxWidth: '600px',
        width: '100%',
        textAlign: 'center',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
    },
    iconContainer: {
        marginBottom: '1.5rem'
    },
    icon: {
        fontSize: '4rem',
        display: 'inline-block',
        animation: 'bounce 2s infinite'
    },
    title: {
        fontSize: '2rem',
        fontWeight: '700',
        color: '#1f2937',
        marginBottom: '1rem'
    },
    message: {
        fontSize: '1rem',
        color: '#6b7280',
        lineHeight: '1.6',
        marginBottom: '2rem'
    },
    details: {
        marginTop: '2rem',
        textAlign: 'left',
        background: '#f9fafb',
        borderRadius: '10px',
        padding: '1rem',
        border: '2px solid #e5e7eb'
    },
    summary: {
        cursor: 'pointer',
        fontWeight: '600',
        color: '#374151',
        marginBottom: '1rem'
    },
    errorDetails: {
        marginTop: '1rem'
    },
    errorMessage: {
        color: '#ef4444',
        fontSize: '0.875rem',
        marginBottom: '1rem'
    },
    stack: {
        background: '#1f2937',
        color: '#f3f4f6',
        padding: '1rem',
        borderRadius: '8px',
        fontSize: '0.75rem',
        overflow: 'auto',
        maxHeight: '200px'
    },
    actions: {
        display: 'flex',
        gap: '1rem',
        justifyContent: 'center',
        marginTop: '2rem'
    },
    resetButton: {
        padding: '0.75rem 2rem',
        fontSize: '1rem',
        fontWeight: '600',
        color: 'white',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        border: 'none',
        borderRadius: '10px',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)'
    },
    homeButton: {
        padding: '0.75rem 2rem',
        fontSize: '1rem',
        fontWeight: '600',
        color: '#6b7280',
        background: 'white',
        border: '2px solid #e5e7eb',
        borderRadius: '10px',
        cursor: 'pointer',
        transition: 'all 0.3s ease'
    }
};

export default ErrorBoundary;
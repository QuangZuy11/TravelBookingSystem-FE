import { Component } from 'react';
import toast from 'react-hot-toast';

/**
 * Enhanced Error Boundary for AI Itinerary Components
 * Provides consistent error handling and recovery options
 */
class AIItineraryErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null,
            retryCount: 0
        };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        this.setState({
            error: error,
            errorInfo: errorInfo
        });

        // Log error for monitoring
        console.error('🚨 AI Itinerary Error Boundary Caught:', {
            error: error.message,
            stack: error.stack,
            componentStack: errorInfo.componentStack,
            timestamp: new Date().toISOString()
        });

        // Show user-friendly error toast
        toast.error('Something went wrong. Please try refreshing the page.');
    }

    handleRetry = () => {
        this.setState(prevState => ({
            hasError: false,
            error: null,
            errorInfo: null,
            retryCount: prevState.retryCount + 1
        }));
    };

    handleGoHome = () => {
        window.location.href = '/';
    };

    handleReloadPage = () => {
        window.location.reload();
    };

    render() {
        if (this.state.hasError) {
            const styles = {
                container: {
                    minHeight: '100vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#f8fafc',
                    padding: '2rem'
                },
                errorCard: {
                    maxWidth: '600px',
                    backgroundColor: 'white',
                    borderRadius: '1rem',
                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
                    padding: '3rem',
                    textAlign: 'center'
                },
                errorIcon: {
                    fontSize: '4rem',
                    marginBottom: '1.5rem',
                    filter: 'grayscale(1)'
                },
                errorTitle: {
                    fontSize: '2rem',
                    fontWeight: '700',
                    color: '#1f2937',
                    marginBottom: '1rem'
                },
                errorMessage: {
                    color: '#6b7280',
                    fontSize: '1rem',
                    lineHeight: '1.6',
                    marginBottom: '2rem'
                },
                buttonGroup: {
                    display: 'flex',
                    gap: '1rem',
                    justifyContent: 'center',
                    flexWrap: 'wrap'
                },
                button: (variant = 'primary') => {
                    const variants = {
                        primary: {
                            backgroundColor: '#10b981',
                            color: 'white'
                        },
                        secondary: {
                            backgroundColor: '#6b7280',
                            color: 'white'
                        },
                        danger: {
                            backgroundColor: '#ef4444',
                            color: 'white'
                        }
                    };

                    return {
                        ...variants[variant],
                        padding: '0.75rem 1.5rem',
                        border: 'none',
                        borderRadius: '0.75rem',
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    };
                },
                details: {
                    marginTop: '2rem',
                    padding: '1rem',
                    backgroundColor: '#fef2f2',
                    borderRadius: '0.5rem',
                    border: '1px solid #fecaca',
                    textAlign: 'left'
                },
                detailsTitle: {
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    color: '#991b1b',
                    marginBottom: '0.5rem'
                },
                detailsContent: {
                    fontSize: '0.75rem',
                    color: '#7f1d1d',
                    fontFamily: 'monospace',
                    whiteSpace: 'pre-wrap',
                    overflowX: 'auto'
                }
            };

            return (
                <div style={styles.container}>
                    <div style={styles.errorCard}>
                        <div style={styles.errorIcon}>🚨</div>

                        <h1 style={styles.errorTitle}>Oops! Something went wrong</h1>

                        <p style={styles.errorMessage}>
                            We encountered an unexpected error while loading your itinerary.
                            This is usually temporary and can be fixed by refreshing the page.
                        </p>

                        <div style={styles.buttonGroup}>
                            <button
                                onClick={this.handleRetry}
                                style={styles.button('primary')}
                                disabled={this.state.retryCount >= 3}
                            >
                                <span>🔄</span>
                                <span>
                                    {this.state.retryCount >= 3 ? 'Max retries reached' : 'Try Again'}
                                </span>
                            </button>

                            <button
                                onClick={this.handleReloadPage}
                                style={styles.button('secondary')}
                            >
                                <span>🔁</span>
                                <span>Reload Page</span>
                            </button>

                            <button
                                onClick={this.handleGoHome}
                                style={styles.button('secondary')}
                            >
                                <span>🏠</span>
                                <span>Go Home</span>
                            </button>
                        </div>

                        {/* Error Details (only in development) */}
                        {process.env.NODE_ENV === 'development' && this.state.error && (
                            <details style={styles.details}>
                                <summary style={styles.detailsTitle}>
                                    🔍 Error Details (Development Only)
                                </summary>
                                <div style={styles.detailsContent}>
                                    <strong>Error:</strong> {this.state.error.message}
                                    {this.state.error.stack && (
                                        <>
                                            <br /><br />
                                            <strong>Stack Trace:</strong>
                                            <br />
                                            {this.state.error.stack}
                                        </>
                                    )}
                                    {this.state.errorInfo?.componentStack && (
                                        <>
                                            <br /><br />
                                            <strong>Component Stack:</strong>
                                            <br />
                                            {this.state.errorInfo.componentStack}
                                        </>
                                    )}
                                </div>
                            </details>
                        )}
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

/**
 * Hook for consistent API error handling
 */
export const useApiErrorHandler = () => {
    const handleApiError = (error, context = '') => {
        console.error(`❌ API Error ${context}:`, error);

        let message = 'An unexpected error occurred';
        let shouldRedirect = false;

        if (error.response) {
            // Server responded with error status
            const status = error.response.status;
            const data = error.response.data;

            switch (status) {
                case 400:
                    message = data.message || 'Invalid request. Please check your input.';
                    break;
                case 401:
                    message = 'Authentication required. Please login again.';
                    shouldRedirect = true;
                    break;
                case 403:
                    message = 'Access denied. You don\'t have permission for this action.';
                    break;
                case 404:
                    message = 'Resource not found. It may have been deleted.';
                    break;
                case 409:
                    message = data.message || 'Conflict. This action conflicts with existing data.';
                    break;
                case 429:
                    message = 'Too many requests. Please try again in a moment.';
                    break;
                case 500:
                case 502:
                case 503:
                case 504:
                    message = 'Server error. Please try again later.';
                    break;
                default:
                    message = data.message || `Server error (${status})`;
            }
        } else if (error.request) {
            // Network error
            message = 'Network error. Please check your internet connection.';
        } else {
            // Other error
            message = error.message || 'An unexpected error occurred';
        }

        return { message, shouldRedirect, status: error.response?.status };
    };

    return { handleApiError };
};

/**
 * Loading state component
 */
export const LoadingSpinner = ({ message = 'Loading...', size = 'medium' }) => {
    const sizes = {
        small: { spinner: '24px', text: '0.875rem' },
        medium: { spinner: '32px', text: '1rem' },
        large: { spinner: '48px', text: '1.125rem' }
    };

    const currentSize = sizes[size];

    const styles = {
        container: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
            minHeight: '200px'
        },
        spinner: {
            width: currentSize.spinner,
            height: currentSize.spinner,
            border: '3px solid #f3f4f6',
            borderTopColor: '#10b981',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            marginBottom: '1rem'
        },
        message: {
            color: '#6b7280',
            fontSize: currentSize.text,
            textAlign: 'center'
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.spinner} />
            <p style={styles.message}>{message}</p>
            <style>
                {`
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
                `}
            </style>
        </div>
    );
};

/**
 * Error alert component
 */
export const ErrorAlert = ({ error, onRetry, onDismiss }) => {
    const styles = {
        container: {
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            borderLeft: '4px solid #ef4444',
            borderRadius: '0.5rem',
            padding: '1rem',
            marginBottom: '1rem'
        },
        header: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '0.5rem'
        },
        title: {
            color: '#991b1b',
            fontSize: '0.875rem',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
        },
        message: {
            color: '#7f1d1d',
            fontSize: '0.875rem',
            marginBottom: '0.75rem'
        },
        actions: {
            display: 'flex',
            gap: '0.5rem'
        },
        button: {
            padding: '0.25rem 0.75rem',
            fontSize: '0.75rem',
            fontWeight: '600',
            borderRadius: '0.25rem',
            cursor: 'pointer',
            transition: 'all 0.2s'
        },
        retryButton: {
            backgroundColor: '#dc2626',
            color: 'white',
            border: 'none'
        },
        dismissButton: {
            backgroundColor: 'transparent',
            color: '#991b1b',
            border: '1px solid #fecaca'
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <div style={styles.title}>
                    <span>⚠️</span>
                    <span>Error</span>
                </div>
            </div>

            <div style={styles.message}>
                {error}
            </div>

            <div style={styles.actions}>
                {onRetry && (
                    <button
                        onClick={onRetry}
                        style={{ ...styles.button, ...styles.retryButton }}
                    >
                        Try Again
                    </button>
                )}
                {onDismiss && (
                    <button
                        onClick={onDismiss}
                        style={{ ...styles.button, ...styles.dismissButton }}
                    >
                        Dismiss
                    </button>
                )}
            </div>
        </div>
    );
};

/**
 * Success alert component
 */
export const SuccessAlert = ({ message, onDismiss, autoHide = true }) => {
    const styles = {
        container: {
            backgroundColor: '#f0fdf4',
            border: '1px solid #bbf7d0',
            borderLeft: '4px solid #22c55e',
            borderRadius: '0.5rem',
            padding: '1rem',
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
        },
        content: {
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
        },
        message: {
            color: '#166534',
            fontSize: '0.875rem',
            fontWeight: '500'
        },
        dismissButton: {
            backgroundColor: 'transparent',
            color: '#166534',
            border: 'none',
            fontSize: '1.25rem',
            cursor: 'pointer',
            padding: '0.25rem',
            borderRadius: '0.25rem'
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.content}>
                <span style={{ fontSize: '1.25rem' }}>✅</span>
                <span style={styles.message}>{message}</span>
            </div>
            {onDismiss && (
                <button
                    onClick={onDismiss}
                    style={styles.dismissButton}
                    title="Dismiss"
                >
                    ×
                </button>
            )}
        </div>
    );
};

export default AIItineraryErrorBoundary;
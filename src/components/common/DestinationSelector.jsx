import { useState, useEffect } from 'react';
import axios from 'axios';

const DestinationSelector = ({ selectedId, onChange, error }) => {
    const [destinations, setDestinations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [fetchError, setFetchError] = useState(null);

    useEffect(() => {
        // Fetch all destinations from API
        const fetchDestinations = async () => {
            try {
                setLoading(true);
                setFetchError(null);

                const response = await axios.get('http://localhost:3000/api/destinations');

                if (response.data && response.data.success) {
                    setDestinations(response.data.data || []);
                } else {
                    throw new Error('Failed to fetch destinations');
                }
            } catch (err) {
                console.error('Error fetching destinations:', err);
                setFetchError('Không thể tải danh sách điểm đến. Vui lòng thử lại sau.');
            } finally {
                setLoading(false);
            }
        };

        fetchDestinations();
    }, []);

    // Find selected destination for display info
    const selectedDestination = destinations.find(dest => dest._id === selectedId);

    return (
        <div className="destination-selector-wrapper" style={{ marginBottom: '20px' }}>
            <label
                htmlFor="destination"
                style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#374151'
                }}
            >
                📍 Chọn Destination (Tùy chọn)
            </label>

            {loading ? (
                <div style={{
                    padding: '12px',
                    backgroundColor: '#f9fafb',
                    borderRadius: '8px',
                    color: '#6b7280',
                    fontSize: '14px'
                }}>
                    Đang tải danh sách điểm đến...
                </div>
            ) : fetchError ? (
                <div style={{
                    padding: '12px',
                    backgroundColor: '#fef2f2',
                    borderRadius: '8px',
                    color: '#dc2626',
                    fontSize: '14px',
                    border: '1px solid #fecaca'
                }}>
                    {fetchError}
                </div>
            ) : (
                <>
                    <select
                        id="destination"
                        value={selectedId || ''}
                        onChange={(e) => onChange(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '12px 14px',
                            fontSize: '14px',
                            border: error ? '1px solid #dc2626' : '1px solid #d1d5db',
                            borderRadius: '8px',
                            backgroundColor: 'white',
                            color: '#111827',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            outline: 'none'
                        }}
                        onFocus={(e) => {
                            if (!error) {
                                e.target.style.borderColor = '#3b82f6';
                                e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                            }
                        }}
                        onBlur={(e) => {
                            e.target.style.borderColor = error ? '#dc2626' : '#d1d5db';
                            e.target.style.boxShadow = 'none';
                        }}
                    >
                        <option value="">-- Không chọn destination --</option>
                        {destinations.map((dest) => (
                            <option key={dest._id} value={dest._id}>
                                {dest.name}, {dest.country}
                                {dest.city && ` - ${dest.city}`}
                            </option>
                        ))}
                    </select>

                    {error && (
                        <p style={{
                            marginTop: '8px',
                            fontSize: '13px',
                            color: '#dc2626'
                        }}>
                            {error}
                        </p>
                    )}

                    {selectedId && selectedDestination && (
                        <div style={{
                            marginTop: '12px',
                            padding: '12px 16px',
                            backgroundColor: '#f0fdf4',
                            border: '1px solid #bbf7d0',
                            borderRadius: '8px',
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: '8px'
                        }}>
                            <span style={{ fontSize: '16px', marginTop: '2px' }}>✅</span>
                            <div style={{ flex: 1 }}>
                                <p style={{
                                    margin: 0,
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    color: '#166534'
                                }}>
                                    Đã chọn: {selectedDestination.name}
                                </p>
                                <p style={{
                                    margin: '4px 0 0 0',
                                    fontSize: '13px',
                                    color: '#15803d'
                                }}>
                                    Hotel sẽ hiển thị POIs (Points of Interest) của {selectedDestination.name}
                                    cho khách hàng xem các địa điểm gần khách sạn.
                                </p>
                                {selectedDestination.description && (
                                    <p style={{
                                        margin: '8px 0 0 0',
                                        fontSize: '13px',
                                        color: '#22c55e',
                                        fontStyle: 'italic'
                                    }}>
                                        "{selectedDestination.description}"
                                    </p>
                                )}
                            </div>
                        </div>
                    )}

                    {!selectedId && (
                        <p style={{
                            marginTop: '8px',
                            fontSize: '13px',
                            color: '#6b7280',
                            fontStyle: 'italic'
                        }}>
                            💡 Nếu không chọn, hotel sẽ không hiển thị POIs gần đó.
                        </p>
                    )}
                </>
            )}
        </div>
    );
};

export default DestinationSelector;

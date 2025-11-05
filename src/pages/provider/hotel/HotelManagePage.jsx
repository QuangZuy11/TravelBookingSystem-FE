import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Spinner } from '../../../components/ui/Spinner';
import { ErrorAlert } from '../../../components/shared/ErrorAlert';

const HotelManagePage = () => {
    const navigate = useNavigate();
    const [hotels, setHotels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [hoveredRow, setHoveredRow] = useState(null);

    const provider = localStorage.getItem('provider');
    const providerId = provider ? JSON.parse(provider)._id : null;
    const token = localStorage.getItem('token');

    useEffect(() => {
        fetchHotels();
    }, []);

    const fetchHotels = async () => {
        try {
            setLoading(true);
            if (!providerId) {
                setError('Provider ID not found');
                return;
            }

            const response = await axios.get(`/api/hotel/provider/${providerId}/hotels`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const hotelList = response.data.data || [];
            setHotels(hotelList);
        } catch (err) {
            setError('Failed to fetch hotels');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <Spinner />;
    if (error) return <ErrorAlert message={error} />;

    const containerStyle = {
        minHeight: '100vh',
        background: '#f8f9fa',
        padding: '2rem',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    };

    const hotelsListStyle = {
        background: 'white',
        borderRadius: '20px',
        padding: '2rem',
        boxShadow: '0 10px 30px rgba(0,0,0,0.15)'
    };

    const headerStyle = {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2rem'
    };

    const sectionTitleStyle = {
        fontSize: '1.75rem',
        fontWeight: '700',
        color: '#1f2937',
        margin: 0
    };

    const buttonPrimaryStyle = {
        background: 'linear-gradient(135deg, #0a5757 0%, #2d6a4f 100%)',
        color: 'white',
        padding: '0.875rem 1.5rem',
        borderRadius: '12px',
        border: 'none',
        fontSize: '1rem',
        fontWeight: '600',
        cursor: 'pointer',
        boxShadow: '0 4px 15px rgba(10, 87, 87, 0.4)',
        transition: 'all 0.3s ease',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem'
    };

    const tableStyle = {
        width: '100%',
        borderCollapse: 'separate',
        borderSpacing: '0 0.5rem'
    };

    const theadStyle = {
        background: 'linear-gradient(135deg, #0a5757 0%, #2d6a4f 100%)',
        color: 'white'
    };

    const thStyle = {
        padding: '1rem',
        textAlign: 'left',
        fontWeight: '600',
        fontSize: '0.875rem',
        textTransform: 'uppercase',
        letterSpacing: '0.05em'
    };

    const thFirstStyle = {
        ...thStyle,
        borderTopLeftRadius: '12px',
        borderBottomLeftRadius: '12px'
    };

    const thLastStyle = {
        ...thStyle,
        borderTopRightRadius: '12px',
        borderBottomRightRadius: '12px'
    };

    const trStyle = {
        background: '#f9fafb',
        transition: 'all 0.3s ease'
    };

    const tdStyle = {
        padding: '1.25rem 1rem',
        fontSize: '0.95rem',
        color: '#374151'
    };

    const tdFirstStyle = {
        ...tdStyle,
        borderTopLeftRadius: '12px',
        borderBottomLeftRadius: '12px',
        fontWeight: '600'
    };

    const tdLastStyle = {
        ...tdStyle,
        borderTopRightRadius: '12px',
        borderBottomRightRadius: '12px'
    };

    const occupancyBarStyle = {
        width: '100px',
        height: '8px',
        background: '#e5e7eb',
        borderRadius: '4px',
        overflow: 'hidden'
    };

    const occupancyFillStyle = (percent) => ({
        height: '100%',
        background: percent > 80 ? 'linear-gradient(90deg, #10b981 0%, #059669 100%)' :
            percent > 50 ? 'linear-gradient(90deg, #f59e0b 0%, #d97706 100%)' :
                'linear-gradient(90deg, #ef4444 0%, #dc2626 100%)',
        borderRadius: '4px',
        transition: 'width 0.3s ease'
    });

    const actionButtonStyle = {
        padding: '0.5rem 1rem',
        borderRadius: '8px',
        border: 'none',
        fontSize: '0.875rem',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        marginRight: '0.5rem'
    };

    const editButtonStyle = {
        ...actionButtonStyle,
        background: 'linear-gradient(135deg, #0a5757 0%, #2d6a4f 100%)',
        color: 'white',
        boxShadow: '0 2px 8px rgba(10, 87, 87, 0.3)'
    };

    const viewButtonStyle = {
        ...actionButtonStyle,
        background: 'white',
        color: '#0a5757',
        border: '2px solid #0a5757'
    };

    const emptyStateStyle = {
        textAlign: 'center',
        padding: '4rem 2rem'
    };

    return (
        <div style={containerStyle}>
            <div style={hotelsListStyle}>
                <div style={headerStyle}>
                    <h2 style={sectionTitleStyle}>Your Hotels</h2>
                    <button
                        style={buttonPrimaryStyle}
                        onClick={() => navigate('/provider/hotels/new')}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = '0 6px 20px rgba(10, 87, 87, 0.5)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 4px 15px rgba(10, 87, 87, 0.4)';
                        }}
                    >
                        <span style={{ fontSize: '1.5rem' }}>+</span> Add New Hotel
                    </button>
                </div>

                {hotels.length === 0 ? (
                    <div style={emptyStateStyle}>
                        <div style={{ fontSize: '4rem', marginBottom: '1rem', opacity: '0.3' }}>🏨</div>
                        <p style={{ fontSize: '1.25rem', color: '#6b7280', marginBottom: '1.5rem' }}>
                            No hotels found
                        </p>
                        <button
                            style={buttonPrimaryStyle}
                            onClick={() => navigate('/provider/hotels/new')}
                        >
                            Add your first hotel
                        </button>
                    </div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={tableStyle}>
                            <thead style={theadStyle}>
                                <tr>
                                    <th style={thFirstStyle}>Hotel Name</th>
                                    <th style={thStyle}>Location</th>
                                    <th style={thStyle}>Rooms</th>
                                    <th style={thStyle}>Occupancy</th>
                                    <th style={thStyle}>Base Price</th>
                                    <th style={thStyle}>Rating</th>
                                    <th style={thLastStyle}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {hotels.map((hotel, index) => {
                                    const occupancyPercent = (hotel.occupiedRooms && hotel.totalRooms)
                                        ? (hotel.occupiedRooms / hotel.totalRooms) * 100
                                        : 0;

                                    return (
                                        <tr
                                            key={hotel._id}
                                            style={{
                                                ...trStyle,
                                                ...(hoveredRow === index ? {
                                                    background: 'white',
                                                    boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
                                                } : {})
                                            }}
                                            onMouseEnter={() => setHoveredRow(index)}
                                            onMouseLeave={() => setHoveredRow(null)}
                                        >
                                            <td style={tdFirstStyle}>{hotel.name}</td>
                                            <td style={tdStyle}>{hotel.location}</td>
                                            <td style={tdStyle}>
                                                <span style={{ fontWeight: '600' }}>{hotel.occupiedRooms || 0}</span>
                                                <span style={{ color: '#9ca3af' }}> / {hotel.totalRooms || 0}</span>
                                            </td>
                                            <td style={tdStyle}>
                                                <div style={occupancyBarStyle}>
                                                    <div style={{
                                                        ...occupancyFillStyle(occupancyPercent),
                                                        width: `${occupancyPercent}%`
                                                    }} />
                                                </div>
                                            </td>
                                            <td style={tdStyle}>
                                                <span style={{ fontWeight: '600', color: '#10b981' }}>
                                                    {hotel.basePrice}đ
                                                </span>
                                            </td>
                                            <td style={tdStyle}>
                                                <span style={{ fontSize: '1.1rem' }}>⭐</span> {hotel.rating || 0}
                                            </td>
                                            <td style={tdLastStyle}>
                                                <button
                                                    style={editButtonStyle}
                                                    onClick={() => navigate(`/provider/hotels/${hotel._id}`)}
                                                    onMouseEnter={(e) => {
                                                        e.currentTarget.style.transform = 'scale(1.05)';
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.currentTarget.style.transform = 'scale(1)';
                                                    }}
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    style={viewButtonStyle}
                                                    onClick={() => navigate(`/provider/hotels/${hotel._id}/rooms`)}
                                                    onMouseEnter={(e) => {
                                                        e.currentTarget.style.background = '#0a5757';
                                                        e.currentTarget.style.color = 'white';
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.currentTarget.style.background = 'white';
                                                        e.currentTarget.style.color = '#0a5757';
                                                    }}
                                                >
                                                    Rooms
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default HotelManagePage;

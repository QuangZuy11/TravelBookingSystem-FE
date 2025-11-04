import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Spinner } from '../../../components/ui/Spinner';
import { ErrorAlert } from '../../../components/shared/ErrorAlert';

const OverviewPage = () => {
    const [hotels, setHotels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [stats, setStats] = useState({
        totalHotels: 0,
        totalRooms: 0,
        occupancyRate: '0%',
        averageRating: 0
    });
    const [hoveredCard, setHoveredCard] = useState(null);

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

            if (hotelList.length > 0) {
                const totalRooms = hotelList.reduce((sum, hotel) => sum + (hotel.totalRooms || 0), 0);
                const occupiedRooms = hotelList.reduce((sum, hotel) => sum + (hotel.occupiedRooms || 0), 0);
                const totalRatings = hotelList.reduce((sum, hotel) => sum + (hotel.rating || 0), 0);

                setStats({
                    totalHotels: hotelList.length,
                    totalRooms,
                    occupancyRate: totalRooms ? `${Math.round((occupiedRooms / totalRooms) * 100)}%` : '0%',
                    averageRating: hotelList.length ? (totalRatings / hotelList.length).toFixed(1) : 0
                });
            }
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

    const headerStyle = {
        marginBottom: '2rem'
    };

    const titleStyle = {
        fontSize: '2.5rem',
        fontWeight: '700',
        color: '#09412aff',
        marginBottom: '0.5rem'
    };

    const statsContainerStyle = {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2rem'
    };

    const statCardStyle = {
        background: 'white',
        borderRadius: '20px',
        padding: '2rem',
        height: '200px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
        transition: 'all 0.3s ease',
        cursor: 'pointer',
        position: 'relative',
        overflow: 'hidden'
    };

    const statCardHoverStyle = {
        transform: 'translateY(-5px)',
        boxShadow: '0 15px 40px rgba(0,0,0,0.2)'
    };

    const statTitleStyle = {
        fontSize: '0.875rem',
        fontWeight: '600',
        color: '#6b7280',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        marginBottom: '0.75rem'
    };

    const statValueStyle = {
        fontSize: '2.5rem',
        fontWeight: '700',
        background: 'linear-gradient(135deg, #0a5757 0%, #2d6a4f 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text'
    };


    return (
        <div style={containerStyle}>
            <div style={headerStyle}>
                <h1 style={titleStyle}>Tổng quan khách sạn của bạn </h1>
                <p style={{ fontSize: '1rem', color: '#033a1aff' }}>Quản lý và giám sát hiệu suất khách sạn của bạn</p>
            </div>

            {/* Stats Section */}
            <div style={statsContainerStyle}>
                {[
                    { title: 'Total Hotels', value: stats.totalHotels, icon: '🏨' },
                    { title: 'Total Rooms', value: stats.totalRooms, icon: '🛏️' },
                    { title: 'Occupancy Rate', value: stats.occupancyRate, icon: '📊' },
                    { title: 'Average Rating', value: `⭐ ${stats.averageRating}`, icon: '⭐' }
                ].map((stat, index) => (
                    <div
                        key={index}
                        style={{
                            ...statCardStyle,
                            ...(hoveredCard === index ? statCardHoverStyle : {})
                        }}
                        onMouseEnter={() => setHoveredCard(index)}
                        onMouseLeave={() => setHoveredCard(null)}
                    >
                        <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{stat.icon}</div>
                        <h3 style={statTitleStyle}>{stat.title}</h3>
                        <p style={statValueStyle}>{stat.value}</p>
                    </div>
                ))}
            </div>

        </div>
    );
};

export default OverviewPage;

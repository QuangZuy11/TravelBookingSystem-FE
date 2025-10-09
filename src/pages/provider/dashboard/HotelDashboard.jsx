import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { Spinner } from '../../../components/ui/Spinner';
import { ErrorAlert } from '../../../components/shared/ErrorAlert';

const HotelDashboard = () => {
  const navigate = useNavigate();
  const { providerId } = useParams();
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
  const [hoveredRow, setHoveredRow] = useState(null);

  const getProviderId = () => {
    return providerId || localStorage.getItem('providerId');
  };

  const fetchHotels = async () => {
    try {
      setLoading(true);
      const currentProviderId = getProviderId();
      if (!currentProviderId) {
        setError('Provider ID not found');
        return;
      }
      
      const response = await axios.get(`/api/hotel/provider/${currentProviderId}/hotels`);
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
      } else {
        setStats({
          totalHotels: 0,
          totalRooms: 0,
          occupancyRate: '0%',
          averageRating: 0
        });
      }
    } catch (err) {
      setError('Failed to fetch hotels');
      console.error(err);
      setHotels([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHotels();
  }, [providerId]);

  if (loading) return <Spinner />;
  if (error) return <ErrorAlert message={error} />;

  const containerStyle = {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    padding: '2rem',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
  };

  const headerStyle = {
    marginBottom: '2rem',
    color: 'white'
  };

  const titleStyle = {
    fontSize: '2.5rem',
    fontWeight: '700',
    marginBottom: '0.5rem',
    textShadow: '0 2px 4px rgba(0,0,0,0.1)'
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
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text'
  };

  const actionsContainerStyle = {
    display: 'flex',
    gap: '1rem',
    marginBottom: '2rem',
    flexWrap: 'wrap'
  };

  const buttonPrimaryStyle = {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    padding: '1rem 2rem',
    borderRadius: '12px',
    border: 'none',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
    transition: 'all 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
  };

  const buttonSecondaryStyle = {
    background: 'white',
    color: '#667eea',
    padding: '1rem 2rem',
    borderRadius: '12px',
    border: '2px solid #667eea',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease'
  };

  const hotelsListStyle = {
    background: 'white',
    borderRadius: '20px',
    padding: '2rem',
    boxShadow: '0 10px 30px rgba(0,0,0,0.15)'
  };

  const sectionTitleStyle = {
    fontSize: '1.75rem',
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: '1.5rem'
  };

  const tableStyle = {
    width: '100%',
    borderCollapse: 'separate',
    borderSpacing: '0 0.5rem'
  };

  const theadStyle = {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
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
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    boxShadow: '0 2px 8px rgba(102, 126, 234, 0.3)'
  };

  const viewButtonStyle = {
    ...actionButtonStyle,
    background: 'white',
    color: '#667eea',
    border: '2px solid #667eea'
  };

  const emptyStateStyle = {
    textAlign: 'center',
    padding: '4rem 2rem'
  };

  const emptyIconStyle = {
    fontSize: '4rem',
    marginBottom: '1rem',
    opacity: '0.3'
  };

  const emptyTextStyle = {
    fontSize: '1.25rem',
    color: '#6b7280',
    marginBottom: '1.5rem'
  };

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <h1 style={titleStyle}>Hotel Management Dashboard</h1>
        <p style={{ fontSize: '1rem', opacity: '0.9' }}>Manage your hotels and monitor performance</p>
      </div>

      {/* Stats Section */}
      <div style={statsContainerStyle}>
        {[
          { title: 'Total Hotels', value: stats.totalHotels, icon: '🏨' },
          { title: 'Total Rooms', value: stats.totalRooms, icon: '🛏️' },
          { title: 'Occupancy Rate', value: stats.occupancyRate, icon: '📊' },
          { title: 'Average Rating', value: `⭐ ${stats.averageRating}`, icon: '' }
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

      {/* Actions */}
      <div style={actionsContainerStyle}>
        <button
          style={buttonPrimaryStyle}
          onClick={() => navigate('/provider/hotels/new')}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.5)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.4)';
          }}
        >
          <span style={{ fontSize: '1.5rem' }}>+</span> Add New Hotel
        </button>
        <button
          style={buttonSecondaryStyle}
          onClick={() => navigate('/provider/bookings')}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#667eea';
            e.currentTarget.style.color = 'white';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'white';
            e.currentTarget.style.color = '#667eea';
          }}
        >
          View All Bookings
        </button>
      </div>

      {/* Hotels List */}
      <div style={hotelsListStyle}>
        <h2 style={sectionTitleStyle}>Your Hotels</h2>
        {hotels.length === 0 ? (
          <div style={emptyStateStyle}>
            <div style={emptyIconStyle}>🏨</div>
            <p style={emptyTextStyle}>No hotels found</p>
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
                            e.currentTarget.style.background = '#667eea';
                            e.currentTarget.style.color = 'white';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'white';
                            e.currentTarget.style.color = '#667eea';
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

export default HotelDashboard;
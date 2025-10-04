import React from 'react';
import { useNavigate } from 'react-router-dom';
import './TourDashboard.css';

const TourDashboard = () => {
  const navigate = useNavigate();
  // Mock data for demonstration
  const stats = {
    totalTours: 12,
    activeBookings: 45,
    totalRevenue: '63,100,000',
    averageRating: 4.7
  };

  const recentTours = [
    {
      id: 1,
      name: 'Trekking Sapa - Fansipan 3N2Đ',
      location: 'Sapa, Lào Cai',
      price: '3,200,000',
      bookings: 8,
      rating: 4.6
    },
    // Add more tour items here
  ];

  return (
    <div className="tour-dashboard">
      <div className="dashboard-stats">
        <div className="stat-card">
          <h3>Total Tours</h3>
          <p className="stat-value">{stats.totalTours}</p>
        </div>
        <div className="stat-card">
          <h3>Active Bookings</h3>
          <p className="stat-value">{stats.activeBookings}</p>
        </div>
        <div className="stat-card">
          <h3>Total Revenue</h3>
          <p className="stat-value">{stats.totalRevenue}đ</p>
        </div>
        <div className="stat-card">
          <h3>Average Rating</h3>
          <p className="stat-value">⭐ {stats.averageRating}</p>
        </div>
      </div>

      <div className="dashboard-actions">
        <button 
          className="action-button primary"
          onClick={() => navigate('/provider/tours/new')}
        >
          + Add New Tour
        </button>
        <button className="action-button">View All Bookings</button>
      </div>

      <div className="tours-list">
        <h2>Your Tours</h2>
        <div className="tours-table">
          <table>
            <thead>
              <tr>
                <th>Tour Name</th>
                <th>Location</th>
                <th>Price</th>
                <th>Bookings</th>
                <th>Rating</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {recentTours.map((tour) => (
                <tr key={tour.id}>
                  <td>{tour.name}</td>
                  <td>{tour.location}</td>
                  <td>{tour.price}đ</td>
                  <td>{tour.bookings}</td>
                  <td>⭐ {tour.rating}</td>
                  <td>
                    <button 
                      className="table-action edit"
                      onClick={() => navigate(`/provider/tours/${tour.id}`)}
                    >
                      Edit
                    </button>
                    <button 
                      className="table-action delete"
                      onClick={() => {
                        // Handle delete action
                        if (window.confirm('Are you sure you want to delete this tour?')) {
                          console.log('Delete tour:', tour.id);
                        }
                      }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TourDashboard;
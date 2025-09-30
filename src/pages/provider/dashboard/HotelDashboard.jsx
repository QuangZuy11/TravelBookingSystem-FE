import React from 'react';
import { useNavigate } from 'react-router-dom';
import './HotelDashboard.css';

const HotelDashboard = () => {
  const navigate = useNavigate();
  // Mock data for demonstration
  const stats = {
    totalHotels: 8,
    totalRooms: 120,
    occupancyRate: '75%',
    averageRating: 4.5
  };

  const hotelsList = [
    {
      id: 1,
      name: 'Luxury Palace Hotel',
      location: 'District 1, Ho Chi Minh City',
      rooms: 45,
      occupiedRooms: 32,
      rating: 4.8,
      price: '1,200,000'
    },
    // Add more hotel items here
  ];

  return (
    <div className="hotel-dashboard">
      <div className="dashboard-stats">
        <div className="stat-card">
          <h3>Total Hotels</h3>
          <p className="stat-value">{stats.totalHotels}</p>
        </div>
        <div className="stat-card">
          <h3>Total Rooms</h3>
          <p className="stat-value">{stats.totalRooms}</p>
        </div>
        <div className="stat-card">
          <h3>Occupancy Rate</h3>
          <p className="stat-value">{stats.occupancyRate}</p>
        </div>
        <div className="stat-card">
          <h3>Average Rating</h3>
          <p className="stat-value">⭐ {stats.averageRating}</p>
        </div>
      </div>

      <div className="dashboard-actions">
        <button 
          className="action-button primary"
          onClick={() => navigate('/provider/hotels/new')}
        >
          + Add New Hotel
        </button>
        <button className="action-button">View All Bookings</button>
        <button className="action-button">Manage Room Types</button>
      </div>

      <div className="hotels-list">
        <h2>Your Hotels</h2>
        <div className="hotels-table">
          <table>
            <thead>
              <tr>
                <th>Hotel Name</th>
                <th>Location</th>
                <th>Rooms</th>
                <th>Occupancy</th>
                <th>Base Price</th>
                <th>Rating</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {hotelsList.map((hotel) => (
                <tr key={hotel.id}>
                  <td>{hotel.name}</td>
                  <td>{hotel.location}</td>
                  <td>{hotel.occupiedRooms}/{hotel.rooms}</td>
                  <td>
                    <div className="occupancy-bar">
                      <div 
                        className="occupancy-fill"
                        style={{width: `${(hotel.occupiedRooms/hotel.rooms)*100}%`}}
                      ></div>
                    </div>
                  </td>
                  <td>{hotel.price}đ</td>
                  <td>⭐ {hotel.rating}</td>
                  <td>
                    <button 
                      className="table-action edit"
                      onClick={() => navigate(`/provider/hotels/${hotel.id}`)}
                    >
                      Edit
                    </button>
                    <button 
                      className="table-action view"
                      onClick={() => navigate(`/provider/hotels/${hotel.id}/rooms`)}
                    >
                      View Rooms
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

export default HotelDashboard;
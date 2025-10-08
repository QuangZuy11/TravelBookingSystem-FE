import React from 'react';
import { useNavigate } from 'react-router-dom';
import './FlightDashboard.css';

const FlightDashboard = () => {
  const navigate = useNavigate();
  // Mock data for demonstration
  const stats = {
    totalFlights: 32,
    todayFlights: 8,
    occupancyRate: '82%',
    revenue: '245,600,000'
  };

  const flightsList = [
    {
      id: 1,
      flightNumber: 'VN1234',
      route: 'Ho Chi Minh City → Ha Noi',
      departure: '2025-10-01 08:00',
      arrival: '2025-10-01 10:10',
      capacity: 180,
      booked: 145,
      status: 'Scheduled'
    },
    // Add more flight items here
  ];

  const getStatusClass = (status) => {
    const statusMap = {
      'Scheduled': 'status-scheduled',
      'In Progress': 'status-in-progress',
      'Completed': 'status-completed',
      'Delayed': 'status-delayed',
      'Cancelled': 'status-cancelled'
    };
    return statusMap[status] || '';
  };

  return (
    <div className="flight-dashboard">
      <div className="dashboard-stats">
        <div className="stat-card">
          <h3>Total Flights</h3>
          <p className="stat-value">{stats.totalFlights}</p>
        </div>
        <div className="stat-card">
          <h3>Today's Flights</h3>
          <p className="stat-value">{stats.todayFlights}</p>
        </div>
        <div className="stat-card">
          <h3>Average Occupancy</h3>
          <p className="stat-value">{stats.occupancyRate}</p>
        </div>
        <div className="stat-card">
          <h3>Total Revenue</h3>
          <p className="stat-value">{stats.revenue}đ</p>
        </div>
      </div>

      <div className="dashboard-actions">
        <button 
          className="action-button primary"
          onClick={() => navigate('/provider/flights/new')}
        >
          + Add New Flight
        </button>
        <button className="action-button">Flight Schedule</button>
        <button className="action-button">Manage Routes</button>
      </div>

      <div className="flights-list">
        <h2>Flight Management</h2>
        <div className="flights-table">
          <table>
            <thead>
              <tr>
                <th>Flight No.</th>
                <th>Route</th>
                <th>Departure</th>
                <th>Arrival</th>
                <th>Capacity</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {flightsList.map((flight) => (
                <tr key={flight.id}>
                  <td>{flight.flightNumber}</td>
                  <td>{flight.route}</td>
                  <td>{flight.departure}</td>
                  <td>{flight.arrival}</td>
                  <td>
                    <div className="capacity-info">
                      <div className="capacity-bar">
                        <div 
                          className="capacity-fill"
                          style={{width: `${(flight.booked/flight.capacity)*100}%`}}
                        ></div>
                      </div>
                      <span>{flight.booked}/{flight.capacity}</span>
                    </div>
                  </td>
                  <td>
                    <span className={`status-badge ${getStatusClass(flight.status)}`}>
                      {flight.status}
                    </span>
                  </td>
                  <td>
                    <button 
                      className="table-action edit"
                      onClick={() => navigate(`/provider/flights/${flight.id}`)}
                    >
                      Edit
                    </button>
                    <button 
                      className="table-action view"
                      onClick={() => navigate(`/provider/flights/${flight.id}`)}
                    >
                      View Details
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

export default FlightDashboard;
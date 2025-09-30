import React, { useState } from 'react';
import './FlightDetails.css';

const FlightDetails = () => {
  const [flightData, setFlightData] = useState({
    flightNumber: 'VN1234',
    route: {
      departure: 'Ho Chi Minh City',
      arrival: 'Ha Noi',
      departureAirport: 'Tan Son Nhat International Airport',
      arrivalAirport: 'Noi Bai International Airport'
    },
    schedule: {
      departureTime: '2025-10-01T08:00',
      arrivalTime: '2025-10-01T10:10',
      frequency: 'daily'
    },
    aircraft: {
      model: 'Airbus A321',
      registration: 'VN-A321',
    },
    seating: {
      firstClass: {
        rows: '1-2',
        seatsPerRow: 4,
        price: '5500000',
        available: 8
      },
      business: {
        rows: '3-7',
        seatsPerRow: 6,
        price: '3200000',
        available: 30
      },
      economy: {
        rows: '8-32',
        seatsPerRow: 6,
        price: '1200000',
        available: 150
      }
    },
    services: [
      'Bữa ăn nóng',
      'Giải trí trên máy bay',
      'Wifi',
      'Hành lý ký gửi 23kg'
    ],
    status: 'Scheduled'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission
    console.log('Flight data:', flightData);
  };

  return (
    <div className="flight-details">
      <div className="flight-header">
        <h2>Flight {flightData.flightNumber}</h2>
        <button className="save-button" onClick={handleSubmit}>Save Changes</button>
      </div>

      <div className="flight-content">
        <div className="main-info">
          <div className="form-section">
            <h3>Flight Information</h3>
            <div className="form-group">
              <label>Flight Number</label>
              <input
                type="text"
                value={flightData.flightNumber}
                onChange={(e) => setFlightData({...flightData, flightNumber: e.target.value})}
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Departure City</label>
                <input
                  type="text"
                  value={flightData.route.departure}
                  onChange={(e) => setFlightData({
                    ...flightData,
                    route: {...flightData.route, departure: e.target.value}
                  })}
                />
              </div>
              <div className="form-group">
                <label>Arrival City</label>
                <input
                  type="text"
                  value={flightData.route.arrival}
                  onChange={(e) => setFlightData({
                    ...flightData,
                    route: {...flightData.route, arrival: e.target.value}
                  })}
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Departure Airport</label>
                <input
                  type="text"
                  value={flightData.route.departureAirport}
                  onChange={(e) => setFlightData({
                    ...flightData,
                    route: {...flightData.route, departureAirport: e.target.value}
                  })}
                />
              </div>
              <div className="form-group">
                <label>Arrival Airport</label>
                <input
                  type="text"
                  value={flightData.route.arrivalAirport}
                  onChange={(e) => setFlightData({
                    ...flightData,
                    route: {...flightData.route, arrivalAirport: e.target.value}
                  })}
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>Schedule</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Departure Time</label>
                <input
                  type="datetime-local"
                  value={flightData.schedule.departureTime}
                  onChange={(e) => setFlightData({
                    ...flightData,
                    schedule: {...flightData.schedule, departureTime: e.target.value}
                  })}
                />
              </div>
              <div className="form-group">
                <label>Arrival Time</label>
                <input
                  type="datetime-local"
                  value={flightData.schedule.arrivalTime}
                  onChange={(e) => setFlightData({
                    ...flightData,
                    schedule: {...flightData.schedule, arrivalTime: e.target.value}
                  })}
                />
              </div>
            </div>
            <div className="form-group">
              <label>Frequency</label>
              <select
                value={flightData.schedule.frequency}
                onChange={(e) => setFlightData({
                  ...flightData,
                  schedule: {...flightData.schedule, frequency: e.target.value}
                })}
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="custom">Custom Schedule</option>
              </select>
            </div>
          </div>

          <div className="form-section">
            <h3>Aircraft Details</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Aircraft Model</label>
                <input
                  type="text"
                  value={flightData.aircraft.model}
                  onChange={(e) => setFlightData({
                    ...flightData,
                    aircraft: {...flightData.aircraft, model: e.target.value}
                  })}
                />
              </div>
              <div className="form-group">
                <label>Registration Number</label>
                <input
                  type="text"
                  value={flightData.aircraft.registration}
                  onChange={(e) => setFlightData({
                    ...flightData,
                    aircraft: {...flightData.aircraft, registration: e.target.value}
                  })}
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>Seating Configuration</h3>
            <div className="seating-config">
              <div className="cabin-class">
                <h4>First Class</h4>
                <div className="form-row">
                  <div className="form-group">
                    <label>Rows (e.g., 1-2)</label>
                    <input
                      type="text"
                      value={flightData.seating.firstClass.rows}
                      onChange={(e) => setFlightData({
                        ...flightData,
                        seating: {
                          ...flightData.seating,
                          firstClass: {...flightData.seating.firstClass, rows: e.target.value}
                        }
                      })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Seats per Row</label>
                    <input
                      type="number"
                      value={flightData.seating.firstClass.seatsPerRow}
                      onChange={(e) => setFlightData({
                        ...flightData,
                        seating: {
                          ...flightData.seating,
                          firstClass: {...flightData.seating.firstClass, seatsPerRow: e.target.value}
                        }
                      })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Price (VND)</label>
                    <input
                      type="number"
                      value={flightData.seating.firstClass.price}
                      onChange={(e) => setFlightData({
                        ...flightData,
                        seating: {
                          ...flightData.seating,
                          firstClass: {...flightData.seating.firstClass, price: e.target.value}
                        }
                      })}
                    />
                  </div>
                </div>
              </div>

              <div className="cabin-class">
                <h4>Business Class</h4>
                <div className="form-row">
                  <div className="form-group">
                    <label>Rows (e.g., 3-7)</label>
                    <input
                      type="text"
                      value={flightData.seating.business.rows}
                      onChange={(e) => setFlightData({
                        ...flightData,
                        seating: {
                          ...flightData.seating,
                          business: {...flightData.seating.business, rows: e.target.value}
                        }
                      })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Seats per Row</label>
                    <input
                      type="number"
                      value={flightData.seating.business.seatsPerRow}
                      onChange={(e) => setFlightData({
                        ...flightData,
                        seating: {
                          ...flightData.seating,
                          business: {...flightData.seating.business, seatsPerRow: e.target.value}
                        }
                      })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Price (VND)</label>
                    <input
                      type="number"
                      value={flightData.seating.business.price}
                      onChange={(e) => setFlightData({
                        ...flightData,
                        seating: {
                          ...flightData.seating,
                          business: {...flightData.seating.business, price: e.target.value}
                        }
                      })}
                    />
                  </div>
                </div>
              </div>

              <div className="cabin-class">
                <h4>Economy Class</h4>
                <div className="form-row">
                  <div className="form-group">
                    <label>Rows (e.g., 8-32)</label>
                    <input
                      type="text"
                      value={flightData.seating.economy.rows}
                      onChange={(e) => setFlightData({
                        ...flightData,
                        seating: {
                          ...flightData.seating,
                          economy: {...flightData.seating.economy, rows: e.target.value}
                        }
                      })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Seats per Row</label>
                    <input
                      type="number"
                      value={flightData.seating.economy.seatsPerRow}
                      onChange={(e) => setFlightData({
                        ...flightData,
                        seating: {
                          ...flightData.seating,
                          economy: {...flightData.seating.economy, seatsPerRow: e.target.value}
                        }
                      })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Price (VND)</label>
                    <input
                      type="number"
                      value={flightData.seating.economy.price}
                      onChange={(e) => setFlightData({
                        ...flightData,
                        seating: {
                          ...flightData.seating,
                          economy: {...flightData.seating.economy, price: e.target.value}
                        }
                      })}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>Services</h3>
            <div className="services-container">
              {flightData.services.map((service, index) => (
                <div key={index} className="service-item">
                  <input
                    type="text"
                    value={service}
                    onChange={(e) => {
                      const newServices = [...flightData.services];
                      newServices[index] = e.target.value;
                      setFlightData({...flightData, services: newServices});
                    }}
                  />
                  <button
                    onClick={() => {
                      const newServices = flightData.services.filter((_, i) => i !== index);
                      setFlightData({...flightData, services: newServices});
                    }}
                  >
                    Remove
                  </button>
                </div>
              ))}
              <button
                className="add-button"
                onClick={() => setFlightData({
                  ...flightData,
                  services: [...flightData.services, '']
                })}
              >
                + Add Service
              </button>
            </div>
          </div>
        </div>

        <div className="side-panel">
          <div className="status-section">
            <h3>Flight Status</h3>
            <select
              value={flightData.status}
              onChange={(e) => setFlightData({...flightData, status: e.target.value})}
            >
              <option value="Scheduled">Scheduled</option>
              <option value="On Time">On Time</option>
              <option value="Delayed">Delayed</option>
              <option value="Cancelled">Cancelled</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          <div className="seat-map-section">
            <h3>Seat Map</h3>
            <div className="seat-map-placeholder">
              {/* Add interactive seat map component here */}
              <p>Interactive seat map will be displayed here</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlightDetails;
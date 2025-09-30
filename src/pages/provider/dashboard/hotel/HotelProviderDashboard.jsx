import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const HotelProviderDashboard = () => {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Replace with actual API call
    const fetchHotels = async () => {
      try {
        // Simulated data for now
        const mockHotels = [
          {
            id: 1,
            name: "Grand Hotel",
            location: "City Center",
            rooms: 45,
            rating: 4.5,
            status: "active"
          },
          {
            id: 2,
            name: "Beach Resort",
            location: "Beachfront",
            rooms: 30,
            rating: 4.8,
            status: "active"
          }
        ];
        setHotels(mockHotels);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching hotels:', error);
        setLoading(false);
      }
    };

    fetchHotels();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Hotels</h1>
        <Link
          to="/provider/hotels/new"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Add New Hotel
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {hotels.map((hotel) => (
          <div
            key={hotel.id}
            className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow"
          >
            <h2 className="text-xl font-semibold mb-2">{hotel.name}</h2>
            <div className="text-gray-600 mb-4">
              <p>Location: {hotel.location}</p>
              <p>Total Rooms: {hotel.rooms}</p>
              <p>Rating: {hotel.rating} / 5</p>
              <p className="capitalize">Status: {hotel.status}</p>
            </div>
            <div className="flex justify-end space-x-2">
              <Link
                to={`/provider/hotels/${hotel.id}`}
                className="text-blue-500 hover:text-blue-700"
              >
                Manage
              </Link>
              <button
                onClick={() => console.log('View statistics for hotel:', hotel.id)}
                className="text-green-500 hover:text-green-700"
              >
                Statistics
              </button>
            </div>
          </div>
        ))}
      </div>

      {hotels.length === 0 && (
        <div className="text-center text-gray-500 mt-8">
          <p>No hotels found. Add your first hotel to get started!</p>
        </div>
      )}
    </div>
  );
};

export default HotelProviderDashboard;
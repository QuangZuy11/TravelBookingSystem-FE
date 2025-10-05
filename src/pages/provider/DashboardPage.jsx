import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import ErrorAlert from '../../components/shared/ErrorAlert';

const DashboardPage = () => {
    const { providerId } = useParams();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchDashboardStats = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`/api/provider/${providerId}/dashboard-stats`);
                setStats(response.data.data);
            } catch (err) {
                setError('Failed to fetch dashboard statistics.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        
        fetchDashboardStats();
    }, [providerId]);

    if (loading) return <LoadingSpinner />;
    if (error) return <ErrorAlert message={error} />;
    if (!stats) return <div className="p-6 text-center text-gray-500">No data available.</div>;

    const { statistics, roomOccupancy, recentBookings } = stats;

    return (
        <div className="p-6 bg-gray-100 min-h-screen">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Provider Dashboard</h1>

            {/* Quick Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-lg font-semibold text-gray-900">Total Hotels</h2>
                    <p className="text-4xl font-bold text-blue-600">{statistics?.totalHotels || 0}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-lg font-semibold text-gray-900">Total Rooms</h2>
                    <p className="text-4xl font-bold text-green-600">{statistics?.totalRooms || 0}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-lg font-semibold text-gray-900">Total Revenue</h2>
                    <p className="text-4xl font-bold text-purple-600">${(statistics?.totalRevenue || 0).toLocaleString()}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-lg font-semibold text-gray-900">Avg. Rating</h2>
                    <p className="text-4xl font-bold text-yellow-600">{(statistics?.averageRating || 0).toFixed(1)}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Bookings Card */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-4">Recent Bookings</h2>
                    {recentBookings && recentBookings.length > 0 ? (
                        <ul className="space-y-4">
                            {recentBookings.map((booking) => (
                                <li key={booking._id} className="border-b pb-4 last:border-b-0 last:pb-0">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="font-medium text-gray-900">Booking ID: {booking._id}</span>
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                            booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                                            booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                            'bg-red-100 text-red-800'
                                        }`}>
                                            {booking.status}
                                        </span>
                                    </div>
                                    <p className="text-gray-900">Customer: {booking.customerName}</p>
                                    <p className="text-gray-900">Hotel: {booking.hotelName}</p>
                                    <p className="text-sm text-gray-600">Check-in: {new Date(booking.checkInDate).toLocaleDateString()}</p>
                                    <p className="text-sm text-gray-600">Check-out: {new Date(booking.checkOutDate).toLocaleDateString()}</p>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-gray-500">No recent bookings found.</p>
                    )}
                </div>

                {/* Room Occupancy Card */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-4">Room Occupancy</h2>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <span className="text-gray-900">Available</span>
                            <span className="font-bold text-green-600">{roomOccupancy?.available || 0}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-900">Occupied</span>
                            <span className="font-bold text-red-600">{roomOccupancy?.occupied || 0}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-900">Reserved</span>
                            <span className="font-bold text-blue-600">{roomOccupancy?.reserved || 0}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-900">Maintenance</span>
                            <span className="font-bold text-yellow-600">{roomOccupancy?.maintenance || 0}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;
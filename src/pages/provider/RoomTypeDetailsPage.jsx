import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import LoadingSpinner from '../../components/ui/Spinner';
import ErrorAlert from '../../components/shared/ErrorAlert';
import Modal from '../../components/shared/Modal';
import RoomForm from '../../components/provider/forms/RoomForm';
import PricingRuleForm from '../../components/provider/forms/PricingRuleForm';
import MaintenanceRecordForm from '../../components/provider/forms/MaintenanceRecordForm';

const RoomTypeDetailsPage = () => {
    const { providerId, hotelId, roomId } = useParams();
    const navigate = useNavigate();
    
    // State management
    const [room, setRoom] = useState(null);
    const [pricingRules, setPricingRules] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [maintenanceRecords, setMaintenanceRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('pricing');
    
    // Modal states
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);
    const [isMaintenanceModalOpen, setIsMaintenanceModalOpen] = useState(false);
    const [editingPricingRule, setEditingPricingRule] = useState(null);

    // Fetch room details
    const fetchRoomDetails = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`/api/provider/${providerId}/hotels/${hotelId}/rooms/${roomId}`);
            setRoom(response.data.data);
            setLoading(false);
        } catch (err) {
            setError('Failed to fetch room details');
            setLoading(false);
            console.error(err);
        }
    };

    // Fetch pricing rules
    const fetchPricingRules = async () => {
        try {
            const response = await axios.get(`/api/room-prices/${roomId}`);
            setPricingRules(response.data.data);
        } catch (err) {
            console.error('Failed to fetch pricing rules:', err);
        }
    };

    // Fetch bookings
    const fetchBookings = async () => {
        try {
            const response = await axios.get(`/api/provider/${providerId}/hotels/${hotelId}/rooms/${roomId}/bookings`);
            setBookings(response.data.data);
        } catch (err) {
            console.error('Failed to fetch bookings:', err);
        }
    };

    // Fetch maintenance records
    const fetchMaintenanceRecords = async () => {
        try {
            const response = await axios.get(`/api/provider/${providerId}/hotels/${hotelId}/rooms/${roomId}/maintenance`);
            setMaintenanceRecords(response.data.data);
        } catch (err) {
            console.error('Failed to fetch maintenance records:', err);
        }
    };

    useEffect(() => {
        fetchRoomDetails();
    }, [providerId, hotelId, roomId]);

    useEffect(() => {
        if (room) {
            if (activeTab === 'pricing') fetchPricingRules();
            else if (activeTab === 'bookings') fetchBookings();
            else if (activeTab === 'maintenance') fetchMaintenanceRecords();
        }
    }, [activeTab, room]);

    // Room management handlers
    const handleEditRoom = () => {
        setIsEditModalOpen(true);
    };

    const handleUpdateRoomSubmit = async (formData) => {
        try {
            await axios.put(`/api/provider/${providerId}/hotels/${hotelId}/rooms/${roomId}`, formData);
            alert('Room type updated successfully!');
            setIsEditModalOpen(false);
            fetchRoomDetails();
        } catch (err) {
            alert('Failed to update room type');
            console.error(err);
        }
    };

    const handleDeleteRoom = async () => {
        if (window.confirm('Are you sure you want to delete this room type? This action cannot be undone.')) {
            try {
                await axios.delete(`/api/provider/${providerId}/hotels/${hotelId}/rooms/${roomId}`);
                alert('Room type deleted successfully!');
                navigate(`/provider/${providerId}/hotels/${hotelId}`);
            } catch (err) {
                alert('Failed to delete room type');
                console.error(err);
            }
        }
    };

    // Pricing rule handlers
    const handleAddPricingRule = () => {
        setEditingPricingRule(null);
        setIsPricingModalOpen(true);
    };

    const handleEditPricingRule = (rule) => {
        setEditingPricingRule(rule);
        setIsPricingModalOpen(true);
    };

    const handlePricingRuleSubmit = async (formData) => {
        try {
            if (editingPricingRule) {
                await axios.put(`/api/room-prices/${editingPricingRule._id}`, formData);
                alert('Pricing rule updated successfully!');
            } else {
                await axios.post('/api/room-prices', { ...formData, roomId });
                alert('Pricing rule created successfully!');
            }
            setIsPricingModalOpen(false);
            fetchPricingRules();
        } catch (err) {
            alert('Failed to save pricing rule');
            console.error(err);
        }
    };

    const handleDeletePricingRule = async (ruleId) => {
        if (window.confirm('Are you sure you want to delete this pricing rule?')) {
            try {
                await axios.delete(`/api/room-prices/${ruleId}`);
                alert('Pricing rule deleted successfully!');
                fetchPricingRules();
            } catch (err) {
                alert('Failed to delete pricing rule');
                console.error(err);
            }
        }
    };

    // Maintenance record handlers
    const handleAddMaintenanceRecord = () => {
        setIsMaintenanceModalOpen(true);
    };

    const handleMaintenanceRecordSubmit = async (formData) => {
        try {
            await axios.post(`/api/provider/${providerId}/hotels/${hotelId}/rooms/${roomId}/maintenance`, formData);
            alert('Maintenance record added successfully!');
            setIsMaintenanceModalOpen(false);
            fetchMaintenanceRecords();
        } catch (err) {
            alert('Failed to add maintenance record');
            console.error(err);
        }
    };

    if (loading) return <LoadingSpinner />;
    if (error) return <ErrorAlert message={error} />;
    if (!room) return <div className="p-6 text-center text-gray-500">Room type not found.</div>;

    return (
        <div className="p-6 bg-gray-100 min-h-screen">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">{room.room_type_name}</h1>
                <div>
                    <button
                        onClick={handleEditRoom}
                        className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition-colors mr-3"
                    >
                        Edit Room Type
                    </button>
                    <button
                        onClick={handleDeleteRoom}
                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                    >
                        Delete Room Type
                    </button>
                </div>
            </div>

            {/* Room Summary */}
            <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        {room.images && room.images.length > 0 ? (
                            <div className="relative h-64 mb-4">
                                <img
                                    src={room.images[0]}
                                    alt={room.room_type_name}
                                    className="w-full h-full object-cover rounded-md"
                                />
                            </div>
                        ) : (
                            <div className="h-64 bg-gray-200 flex items-center justify-center rounded-md mb-4">
                                <span className="text-gray-500">No Image Available</span>
                            </div>
                        )}
                        <p className="text-gray-700 text-sm mb-4">{room.description}</p>
                    </div>
                    <div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <h3 className="text-sm font-medium text-gray-700">Base Price</h3>
                                <p className="mt-1">${room.base_price_per_night}/night</p>
                            </div>
                            <div>
                                <h3 className="text-sm font-medium text-gray-700">Capacity</h3>
                                <p className="mt-1">{room.capacity} adults</p>
                            </div>
                            <div>
                                <h3 className="text-sm font-medium text-gray-700">Bed Type</h3>
                                <p className="mt-1">{room.bed_type}</p>
                            </div>
                            <div>
                                <h3 className="text-sm font-medium text-gray-700">Room Size</h3>
                                <p className="mt-1">{room.room_size}</p>
                            </div>
                        </div>
                        <div className="mt-4">
                            <h3 className="text-sm font-medium text-gray-700 mb-2">Amenities</h3>
                            <div className="flex flex-wrap gap-2">
                                {room.amenities && room.amenities.map((amenity, index) => (
                                    <span
                                        key={index}
                                        className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                                    >
                                        {amenity}
                                    </span>
                                ))}
                            </div>
                        </div>
                        <div className="mt-4">
                            <h3 className="text-sm font-medium text-gray-700">Available Rooms</h3>
                            <p className="mt-1">{room.number_of_rooms_available_for_this_type} rooms</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex border-b border-gray-200 mb-4">
                    <button
                        className={`px-4 py-2 text-sm font-medium ${
                            activeTab === 'pricing' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'
                        }`}
                        onClick={() => setActiveTab('pricing')}
                    >
                        Pricing Rules
                    </button>
                    <button
                        className={`px-4 py-2 text-sm font-medium ${
                            activeTab === 'bookings' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'
                        }`}
                        onClick={() => setActiveTab('bookings')}
                    >
                        Bookings
                    </button>
                    <button
                        className={`px-4 py-2 text-sm font-medium ${
                            activeTab === 'maintenance' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'
                        }`}
                        onClick={() => setActiveTab('maintenance')}
                    >
                        Maintenance Records
                    </button>
                </div>

                {/* Tab Content */}
                <div>
                    {/* Pricing Rules Tab */}
                    {activeTab === 'pricing' && (
                        <div>
                            <div className="flex justify-end mb-4">
                                <button
                                    onClick={handleAddPricingRule}
                                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                                >
                                    + Add Pricing Rule
                                </button>
                            </div>
                            {pricingRules.length === 0 ? (
                                <p className="text-center text-gray-500">No pricing rules found.</p>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Range</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">New Price</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Discount</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {pricingRules.map(rule => (
                                                <tr key={rule._id}>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        {new Date(rule.startDate).toLocaleDateString()} - {new Date(rule.endDate).toLocaleDateString()}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        ${rule.newPrice}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        {rule.discountPercentage}%
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                        <button
                                                            onClick={() => handleEditPricingRule(rule)}
                                                            className="text-indigo-600 hover:text-indigo-900 mr-4"
                                                        >
                                                            Edit
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeletePricingRule(rule._id)}
                                                            className="text-red-600 hover:text-red-900"
                                                        >
                                                            Delete
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Bookings Tab */}
                    {activeTab === 'bookings' && (
                        <div>
                            {bookings.length === 0 ? (
                                <p className="text-center text-gray-500">No bookings found for this room type.</p>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Booking ID</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Guest Name</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check-in</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check-out</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Price</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {bookings.map(booking => (
                                                <tr key={booking._id}>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                        {booking._id}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {booking.guestName}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {new Date(booking.checkInDate).toLocaleDateString()}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {new Date(booking.checkOutDate).toLocaleDateString()}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        ${booking.totalPrice}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                            booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                                                            booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                            'bg-red-100 text-red-800'
                                                        }`}>
                                                            {booking.status}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Maintenance Records Tab */}
                    {activeTab === 'maintenance' && (
                        <div>
                            <div className="flex justify-end mb-4">
                                <button
                                    onClick={handleAddMaintenanceRecord}
                                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                                >
                                    + Add Maintenance Record
                                </button>
                            </div>
                            {maintenanceRecords.length === 0 ? (
                                <p className="text-center text-gray-500">No maintenance records found.</p>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {maintenanceRecords.map(record => (
                                                <tr key={record._id}>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        {new Date(record.date).toLocaleDateString()}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-gray-900">
                                                        {record.description}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                            record.status === 'completed' ? 'bg-green-100 text-green-800' :
                                                            record.status === 'in-progress' ? 'bg-yellow-100 text-yellow-800' :
                                                            'bg-red-100 text-red-800'
                                                        }`}>
                                                            {record.status}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Room Edit Modal */}
            <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Room Type">
                <RoomForm initialData={room} onSubmit={handleUpdateRoomSubmit} hotelId={hotelId} />
            </Modal>

            {/* Pricing Rule Modal */}
            <Modal isOpen={isPricingModalOpen} onClose={() => setIsPricingModalOpen(false)} title={editingPricingRule ? 'Edit Pricing Rule' : 'Add Pricing Rule'}>
                <PricingRuleForm initialData={editingPricingRule} onSubmit={handlePricingRuleSubmit} />
            </Modal>

            {/* Maintenance Record Modal */}
            <Modal isOpen={isMaintenanceModalOpen} onClose={() => setIsMaintenanceModalOpen(false)} title="Add Maintenance Record">
                <MaintenanceRecordForm onSubmit={handleMaintenanceRecordSubmit} />
            </Modal>
        </div>
    );
};

export default RoomTypeDetailsPage;
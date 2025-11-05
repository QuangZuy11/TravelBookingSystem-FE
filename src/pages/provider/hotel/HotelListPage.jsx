import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import LoadingSpinner from '../../../components/shared/LoadingSpinner';
import ErrorAlert from '../../../components/shared/ErrorAlert';
import HotelForm from '../../../components/provider/forms/HotelForm';
import Modal from '../../../components/shared/Modal';

const HotelListPage = () => {
    const { providerId } = useParams();
    const [hotels, setHotels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [editingHotel, setEditingHotel] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const token = localStorage.getItem('token');
    const fetchHotels = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`/api/provider/${providerId}/hotels`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setHotels(response.data.data);
        } catch (err) {
            setError('Failed to fetch hotels.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHotels();
    }, [providerId]);

    const handleAddHotel = () => {
        if (hotels.length >= 1) {
            alert('❌ Bạn chỉ được phép tạo 1 khách sạn! Nếu muốn thay đổi, vui lòng xóa khách sạn hiện tại trước.');
            return;
        }
        setEditingHotel(null);
        setIsFormModalOpen(true);
    };

    const handleEditHotel = (hotel) => {
        setEditingHotel(hotel);
        setIsFormModalOpen(true);
    };

    const handleDeleteHotel = async (hotelId) => {
        if (window.confirm('Are you sure you want to delete this hotel?')) {
            try {
                await axios.delete(`/api/provider/${providerId}/hotels/${hotelId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                await fetchHotels();
                alert('Hotel deleted successfully!');
            } catch (err) {
                alert('Failed to delete hotel.');
                console.error(err);
            }
        }
    };

    const handleFormSubmit = async (formData) => {
        try {
            if (editingHotel) {
                await axios.put(`/api/provider/${providerId}/hotels/${editingHotel._id}`, formData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                alert('Hotel updated successfully!');
            } else {
                await axios.post(`/api/provider/${providerId}/hotels`, formData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                alert('Hotel created successfully!');
            }
            setIsFormModalOpen(false);
            fetchHotels();
        } catch (err) {
            alert('Failed to save hotel.');
            console.error(err);
        }
    };

    const filteredHotels = hotels.filter(hotel =>
        hotel.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <LoadingSpinner />;
    if (error) return <ErrorAlert message={error} />;

    return (
        <div className="p-6 bg-gray-100 min-h-screen">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Manage Hotels</h1>

            <div className="flex justify-between items-center mb-6">
                <input
                    type="text"
                    placeholder="Search by hotel name..."
                    className="p-2 border border-gray-300 rounded-md w-1/3"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <button
                    onClick={handleAddHotel}
                    disabled={hotels.length >= 1}
                    className={`px-4 py-2 rounded-md ${hotels.length >= 1
                            ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                            : 'bg-blue-600 text-white hover:bg-blue-700'
                        }`}
                    title={hotels.length >= 1 ? 'Bạn chỉ được phép tạo 1 khách sạn' : 'Thêm khách sạn mới'}
                >
                    + Add New Hotel {hotels.length >= 1 && '(Đã đạt giới hạn)'}
                </button>
            </div>

            {filteredHotels.length === 0 ? (
                <p className="text-center text-gray-500">No hotels found.</p>
            ) : (
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase">Hotel Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase">Address</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase">Star Rating</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase">Total Rooms</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredHotels.map((hotel) => (
                                <tr key={hotel._id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{hotel.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{hotel.address}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{hotel.starRating}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{hotel.totalRooms || 'N/A'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${hotel.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                            }`}>
                                            {hotel.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <Link
                                            to={`/provider/${providerId}/hotels/${hotel._id}`}
                                            className="text-blue-600 hover:text-blue-900 mr-4"
                                        >
                                            View
                                        </Link>
                                        <button
                                            onClick={() => handleEditHotel(hotel)}
                                            className="text-yellow-600 hover:text-yellow-900 mr-4"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDeleteHotel(hotel._id)}
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

            <Modal
                isOpen={isFormModalOpen}
                onClose={() => setIsFormModalOpen(false)}
                title={editingHotel ? 'Edit Hotel' : 'Add New Hotel'}
            >
                <HotelForm
                    initialData={editingHotel}
                    onSubmit={handleFormSubmit}
                />
            </Modal>
        </div>
    );
};

export default HotelListPage;
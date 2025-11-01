import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { tourApi } from '@api/tourApi';
import { formatCurrency } from '@utils/tourHelpers';
import toast from 'react-hot-toast';
import LoadingSpinner from '@components/shared/LoadingSpinner';
import Modal from '@components/shared/Modal';

/**
 * Tour List Page - Provider
 * Displays all tours in table format similar to Hotel List
 */
const TourList = () => {
    const navigate = useNavigate();
    const [tours, setTours] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, tour: null });

    // Get provider _id from localStorage
    const provider = localStorage.getItem('provider')
        ? JSON.parse(localStorage.getItem('provider'))
        : null;
    const providerId = provider?._id || null;

    useEffect(() => {
        if (providerId) {
            fetchTours();
        }
    }, [providerId]);

    const fetchTours = async () => {
        try {
            setLoading(true);
            const response = await tourApi.getProviderTours(providerId, {});
            const toursData = response.data || response.tours || response || [];
            setTours(Array.isArray(toursData) ? toursData : []);
        } catch (error) {
            console.error('Error fetching tours:', error);
            toast.error('Không thể tải danh sách tours');
            setTours([]);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteClick = (tour) => {
        setDeleteModal({ isOpen: true, tour });
    };

    const handleDeleteConfirm = async () => {
        try {
            await tourApi.deleteTour(providerId, deleteModal.tour._id);
            toast.success('Xóa tour thành công!');
            setDeleteModal({ isOpen: false, tour: null });
            fetchTours();
        } catch (error) {
            console.error('Error deleting tour:', error);
            toast.error('Không thể xóa tour');
        }
    };

    const filteredTours = tours.filter(tour => {
        const searchLower = searchTerm.toLowerCase();
        const tourTitle = tour.title?.toLowerCase() || '';
        const tourLocation = tour.location?.toLowerCase() || '';

        // Search in destinations array
        const destinationNames = tour.destinations && tour.destinations.length > 0
            ? tour.destinations.map(dest => (dest.name || dest).toLowerCase()).join(' ')
            : Array.isArray(tour.destination_id) && tour.destination_id.length > 0
                ? tour.destination_id.map(dest => (typeof dest === 'object' ? dest.name : dest).toLowerCase()).join(' ')
                : '';

        return tourTitle.includes(searchLower) ||
            tourLocation.includes(searchLower) ||
            destinationNames.includes(searchLower);
    });

    if (loading) return <LoadingSpinner />;

    return (
        <div className="p-6 bg-gray-100 min-h-screen">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Quản Lý Tours</h1>

            <div className="flex justify-between items-center mb-6">
                <input
                    type="text"
                    placeholder="Tìm kiếm theo tên tour, địa điểm..."
                    className="p-2 border border-gray-300 rounded-md w-1/3"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <button
                    onClick={() => navigate('/provider/tours/create')}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                    + Tạo Tour Mới
                </button>
            </div>

            {filteredTours.length === 0 ? (
                <p className="text-center text-gray-500">Không tìm thấy tour nào.</p>
            ) : (
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase">Tên Tour</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase">Địa điểm</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase">Thời lượng</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase">Giá</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase">Độ khó</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase">Trạng thái</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase">Hành động</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredTours.map((tour) => (
                                <tr key={tour._id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {tour.title}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {tour.destinations && tour.destinations.length > 0
                                            ? tour.destinations.map(dest => dest.name || dest).join(', ')
                                            : Array.isArray(tour.destination_id) && tour.destination_id.length > 0
                                                ? tour.destination_id.map(dest => typeof dest === 'object' ? dest.name : dest).join(', ')
                                                : tour.location || 'Chưa có địa điểm'
                                        }
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {tour.duration_hours} giờ
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {formatCurrency(tour.pricing?.adult || tour.pricing?.base_price || tour.price)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${tour.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                                            tour.difficulty === 'moderate' ? 'bg-yellow-100 text-yellow-800' :
                                                tour.difficulty === 'challenging' ? 'bg-orange-100 text-orange-800' :
                                                    'bg-red-100 text-red-800'
                                            }`}>
                                            {tour.difficulty === 'easy' ? 'Dễ' :
                                                tour.difficulty === 'moderate' ? 'Trung bình' :
                                                    tour.difficulty === 'challenging' ? 'Khó' :
                                                        tour.difficulty === 'expert' ? 'Chuyên gia' : tour.difficulty}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${tour.status === 'active' ? 'bg-green-100 text-green-800' :
                                            tour.status === 'draft' ? 'bg-gray-100 text-gray-800' :
                                                'bg-red-100 text-red-800'
                                            }`}>
                                            {tour.status === 'active' ? 'Hoạt động' :
                                                tour.status === 'draft' ? 'Bản nháp' :
                                                    tour.status === 'inactive' ? 'Tạm dừng' : tour.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <button
                                            onClick={() => navigate(`/provider/tours/${tour._id}`)}
                                            className="text-blue-600 hover:text-blue-900 mr-4"
                                        >
                                            Xem
                                        </button>
                                        <button
                                            onClick={() => navigate(`/provider/tours/${tour._id}/edit`)}
                                            className="text-yellow-600 hover:text-yellow-900 mr-4"
                                        >
                                            Sửa
                                        </button>
                                        <button
                                            onClick={() => handleDeleteClick(tour)}
                                            className="text-red-600 hover:text-red-900"
                                        >
                                            Xóa
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ isOpen: false, tour: null })}
                title="Xác Nhận Xóa Tour"
            >
                <div className="space-y-4">
                    <p className="text-gray-600">
                        Bạn có chắc chắn muốn xóa tour <strong>{deleteModal.tour?.title}</strong>?
                    </p>
                    <p className="text-sm text-red-600">
                        ⚠️ Hành động này không thể hoàn tác!
                    </p>
                    <div className="flex gap-3 justify-end">
                        <button
                            onClick={() => setDeleteModal({ isOpen: false, tour: null })}
                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                        >
                            Hủy
                        </button>
                        <button
                            onClick={handleDeleteConfirm}
                            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                        >
                            Xóa Tour
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default TourList;

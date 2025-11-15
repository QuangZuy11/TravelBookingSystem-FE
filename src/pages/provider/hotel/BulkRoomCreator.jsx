import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import Breadcrumb from '../../../components/shared/Breadcrumb';

const BulkRoomCreator = () => {
    const { hotelId } = useParams();
    const navigate = useNavigate();
    const token = localStorage.getItem('token');

    // Get provider _id from localStorage
    const provider = localStorage.getItem('provider');
    const providerId = provider ? JSON.parse(provider)._id : null;

    const [formData, setFormData] = useState({
        startFloor: 1,
        endFloor: 5,
        roomsPerFloor: 10,
        roomPrefix: 'A',
        roomType: 'single',
        capacity: 2,
        pricePerNight: 500000,
        amenities: [],
        status: 'available',
        images: [],
        description: ''
    });

    const [preview, setPreview] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showPreview, setShowPreview] = useState(false);

    // Reset form when component mounts or hotelId changes
    React.useEffect(() => {
        // Reset all states to initial values
        setPreview([]);
        setShowPreview(false);
        setLoading(false);
        setFormData({
            startFloor: 1,
            endFloor: 5,
            roomsPerFloor: 10,
            roomPrefix: 'A',
            roomType: 'single',
            capacity: 2,
            pricePerNight: 500000,
            amenities: [],
            status: 'available',
            images: [],
            description: ''
        });
    }, [hotelId]); // Reset when hotelId changes

    const roomTypes = [
        { value: 'single', label: '🛏️ Single Room ( 1 giường )', capacity: 1 },
        { value: 'double', label: '🛏️🛏️ Double Room ( 2 giường )', capacity: 4 },
        { value: 'twin', label: '👥 Twin Room ( 1 giường lớn)', capacity: 2 },
        { value: 'suite', label: '👑 Suite (Phòng hạng sang)', capacity: 3 },
        { value: 'deluxe', label: '✨ Deluxe (Phòng cao cấp)', capacity: 4 },
        { value: 'family', label: '👨‍👩‍👧‍👦 Family Room (Phòng gia đình)', capacity: 5 }
    ];

    const amenitiesList = [
        'Wi-Fi', 'TV', 'Điều Hòa 2 chiều ', 'Quầy bar mini', 'Két sắt',
        'Ban công', 'View thành phố', 'View biển', 'View núi',
        'Bồn tắm', 'Vòi sen', 'Máy sấy tóc', 'Bàn ủi', 'Máy pha cà phê',
        'Bàn làm việc', 'Ghế sofa', 'Tủ quần áo'
    ];

    const statusOptions = [
        { value: 'available', label: '✅ Available', color: '#10b981' },
        { value: 'occupied', label: '🔒 Occupied', color: '#ef4444' },
        { value: 'maintenance', label: '🔧 Maintenance', color: '#f59e0b' },
        { value: 'reserved', label: '📅 Reserved', color: '#3b82f6' }
    ];

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;

        if (name === 'amenities') {
            setFormData(prev => ({
                ...prev,
                amenities: checked
                    ? [...prev.amenities, value]
                    : prev.amenities.filter(item => item !== value)
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: type === 'number' ? parseInt(value) || 0 : value
            }));
        }
    };

    const generateRoomPreview = () => {
        const rooms = [];
        const { startFloor, endFloor, roomsPerFloor, roomPrefix } = formData;

        for (let floor = startFloor; floor <= endFloor; floor++) {
            for (let roomNum = 1; roomNum <= roomsPerFloor; roomNum++) {
                const paddedRoomNum = roomNum.toString().padStart(2, '0');
                const roomNumber = `${roomPrefix}${floor}${paddedRoomNum}`;

                rooms.push({
                    roomNumber,
                    floor,
                    type: formData.roomType, // Backend expects 'type' field
                    capacity: formData.capacity,
                    pricePerNight: formData.pricePerNight,
                    amenities: formData.amenities,
                    status: formData.status,
                    images: formData.images, // Shared images for all rooms
                    description: formData.description
                });
            }
        }

        setPreview(rooms);
        setShowPreview(true);
    };

    const handleCreateRooms = async () => {
        if (preview.length === 0) {
            toast.error('Vui lòng tạo preview trước khi tạo phòng!');
            return;
        }

        setLoading(true);
        try {
            // Prepare rooms data for bulk creation
            const roomsData = preview.map(room => ({
                hotelId: hotelId,
                roomNumber: room.roomNumber,
                type: room.type,
                capacity: room.capacity,
                pricePerNight: room.pricePerNight,
                amenities: room.amenities,
                status: room.status,
                floor: room.floor,
                description: room.description || '',
                images: [] // Individual room images (empty for bulk shared images)
            }));

            console.log('Sending bulk rooms data:', roomsData);

            // Check if we have shared images to upload
            const hasSharedImages = formData.images && formData.images.length > 0;
            let response;

            if (hasSharedImages) {
                // Use FormData for multipart/form-data when we have images
                const formDataToSend = new FormData();

                // Add rooms data as JSON string
                formDataToSend.append('roomsData', JSON.stringify(roomsData));

                // Add shared image files
                formData.images.forEach(img => {
                    if (img.file && img.file instanceof File) {
                        formDataToSend.append('images', img.file);
                    }
                });

                console.log(`📸 Uploading ${formData.images.length} shared images for ${roomsData.length} rooms`);

                response = await axios.post(
                    `/api/hotel/provider/${providerId}/hotels/${hotelId}/rooms/bulk`,
                    formDataToSend,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            'Content-Type': 'multipart/form-data'
                        }
                    }
                );
            } else {
                // Use JSON when no images - wrap in rooms object
                response = await axios.post(
                    `/api/hotel/provider/${providerId}/hotels/${hotelId}/rooms/bulk`,
                    { rooms: roomsData },
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    }
                );
            }

            console.log('Bulk create response:', response.data);

            if (response.data && response.data.success) {
                const { count, sharedImagesCount } = response.data;
                const message = sharedImagesCount > 0
                    ? `✅ Đã tạo thành công ${count} phòng với ${sharedImagesCount} hình ảnh chung!`
                    : `✅ Đã tạo thành công ${count} phòng!`;

                toast.success(message);

                // Ask user what they want to do next
                const shouldCreateMore = window.confirm(
                    `Đã tạo thành công ${count} phòng! Bạn có muốn tạo tiếp không?\n\n` +
                    `• OK: Tạo thêm phòng\n` +
                    `• Cancel: Xem danh sách phòng`
                );

                if (shouldCreateMore) {
                    // Reset form for next batch
                    setPreview([]);
                    setShowPreview(false);
                    setFormData(prev => ({
                        ...prev,
                        images: [], // Clear images for next batch
                        description: '' // Clear description
                    }));
                    toast('📝 Form đã được reset để tạo batch tiếp theo', {
                        icon: 'ℹ️',
                        duration: 3000
                    });
                } else {
                    // Navigate to hotel overview instead of rooms list (since 1 hotel per provider)
                    navigate(`/provider/hotels/${hotelId}/overview`);
                }
            }
        } catch (error) {
            console.error('Error creating rooms:', error);
            console.error('Error response:', error.response?.data);

            // Enhanced error handling
            let errorMessage = 'Có lỗi xảy ra khi tạo phòng!';

            if (error.response?.data) {
                const { error: errorText, details } = error.response.data;
                errorMessage = errorText || errorMessage;

                // Show detailed validation errors if available
                if (details && Array.isArray(details)) {
                    const detailsText = details.map(d => `${d.field}: ${d.message}`).join(', ');
                    errorMessage += ` (${detailsText})`;
                }
            }

            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const containerStyle = {
        minHeight: '100vh',
        background: '#10b981',
        padding: '2rem',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    };

    const formContainerStyle = {
        maxWidth: '1200px',
        margin: '0 auto',
        background: 'white',
        borderRadius: '24px',
        padding: '3rem',
        boxShadow: '0 20px 60px rgba(0,0,0,0.2)'
    };

    const headerStyle = {
        marginBottom: '2.5rem',
        borderBottom: '3px solid #10b981',
        paddingBottom: '1.5rem'
    };

    const titleStyle = {
        fontSize: '2.5rem',
        fontWeight: '700',
        background: '#10b981',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        marginBottom: '0.5rem'
    };

    const sectionStyle = {
        marginBottom: '2rem',
        padding: '2rem',
        background: '#f9fafb',
        borderRadius: '16px',
        border: '2px solid #e5e7eb'
    };

    const sectionTitleStyle = {
        fontSize: '1.5rem',
        fontWeight: '700',
        color: '#1f2937',
        marginBottom: '1.5rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem'
    };

    const gridStyle = {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '1.5rem',
        marginBottom: '1.5rem'
    };

    const inputStyle = {
        width: '100%',
        padding: '0.875rem 1rem',
        fontSize: '1rem',
        border: '2px solid #e5e7eb',
        borderRadius: '12px',
        transition: 'all 0.3s ease',
        outline: 'none'
    };

    const labelStyle = {
        display: 'block',
        fontSize: '0.875rem',
        fontWeight: '600',
        color: '#374151',
        marginBottom: '0.5rem'
    };

    const buttonStyle = {
        padding: '1rem 2rem',
        fontSize: '1rem',
        fontWeight: '600',
        borderRadius: '12px',
        border: 'none',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        marginRight: '1rem'
    };

    const primaryButtonStyle = {
        ...buttonStyle,
        background: '#10b981',
        color: 'white',
        boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)'
    };

    const secondaryButtonStyle = {
        ...buttonStyle,
        background: 'white',
        color: '#10b981',
        border: '2px solid #10b981'
    };

    const previewContainerStyle = {
        marginTop: '2rem',
        background: 'white',
        borderRadius: '16px',
        padding: '2rem',
        border: '2px solid #10b981'
    };

    const previewGridStyle = {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: '1rem',
        maxHeight: '400px',
        overflowY: 'auto'
    };

    const roomCardStyle = {
        padding: '1rem',
        background: '#f0f9ff',
        border: '2px solid #0ea5e9',
        borderRadius: '8px',
        textAlign: 'center'
    };

    const breadcrumbItems = [
        { label: 'Dashboard', path: '/provider' },
        { label: 'Hotel Management', path: `/provider/hotels/${hotelId}` },
        { label: 'Bulk Create Rooms' }
    ];

    return (
        <div style={containerStyle}>
            <Breadcrumb items={breadcrumbItems} />

            <div style={formContainerStyle}>
                <div style={headerStyle}>
                    <h1 style={titleStyle}>🏗️ Tạo phòng hàng loạt</h1>
                    <p style={{ fontSize: '1rem', color: '#6b7280' }}>
                        Tạo nhiều phòng cùng lúc theo ma trận tầng và số phòng
                    </p>
                </div>

                {/* Configuration Form */}
                <div style={sectionStyle}>
                    <h2 style={sectionTitleStyle}>
                        <span style={{ fontSize: '1.75rem' }}>⚙️</span>
                        Cấu hình phòng
                    </h2>

                    {/* Floor Configuration */}
                    <div style={gridStyle}>
                        <div>
                            <label style={labelStyle}>Tầng bắt đầu</label>
                            <input
                                type="number"
                                name="startFloor"
                                value={formData.startFloor}
                                onChange={handleInputChange}
                                min="1"
                                style={inputStyle}
                                placeholder="1"
                            />
                        </div>
                        <div>
                            <label style={labelStyle}>Tầng kết thúc</label>
                            <input
                                type="number"
                                name="endFloor"
                                value={formData.endFloor}
                                onChange={handleInputChange}
                                min={formData.startFloor}
                                style={inputStyle}
                                placeholder="5"
                            />
                        </div>
                        <div>
                            <label style={labelStyle}>Số phòng mỗi tầng</label>
                            <input
                                type="number"
                                name="roomsPerFloor"
                                value={formData.roomsPerFloor}
                                onChange={handleInputChange}
                                min="1"
                                max="50"
                                style={inputStyle}
                                placeholder="10"
                            />
                        </div>
                        <div>
                            <label style={labelStyle}>Ký hiệu phòng</label>
                            <input
                                type="text"
                                name="roomPrefix"
                                value={formData.roomPrefix}
                                onChange={handleInputChange}
                                maxLength="5"
                                style={inputStyle}
                                placeholder="A"
                            />
                            <small style={{ color: '#6b7280' }}>
                                VD: A → A101, A102... | VIP → VIP101, VIP102...
                            </small>
                        </div>
                    </div>

                    {/* Room Details */}
                    <div style={gridStyle}>
                        <div>
                            <label style={labelStyle}>Loại phòng</label>
                            <select
                                name="roomType"
                                value={formData.roomType}
                                onChange={handleInputChange}
                                style={inputStyle}
                            >
                                {roomTypes.map(type => (
                                    <option key={type.value} value={type.value}>
                                        {type.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label style={labelStyle}>Sức chứa (người)</label>
                            <input
                                type="number"
                                name="capacity"
                                value={formData.capacity}
                                onChange={handleInputChange}
                                min="1"
                                max="10"
                                style={inputStyle}
                                placeholder="2"
                            />
                        </div>
                        <div>
                            <label style={labelStyle}>Giá mỗi đêm (VNĐ)</label>
                            <input
                                type="number"
                                name="pricePerNight"
                                value={formData.pricePerNight}
                                onChange={handleInputChange}
                                min="100000"
                                style={inputStyle}
                                placeholder="500000"
                            />
                        </div>
                    </div>

                    {/* Description */}
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={labelStyle}>Mô tả (tùy chọn)</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            rows="3"
                            style={inputStyle}
                            placeholder="Mô tả chung cho tất cả các phòng..."
                        />
                    </div>

                    {/* Status */}
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={labelStyle}>Trạng thái</label>
                        <select
                            name="status"
                            value={formData.status}
                            onChange={handleInputChange}
                            style={inputStyle}
                        >
                            {statusOptions.map(option => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Images */}
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={labelStyle}>Hình ảnh chung (cho tất cả phòng)</label>
                        <input
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={(e) => {
                                const files = Array.from(e.target.files);
                                // Wrap files like RoomForm does
                                const wrappedFiles = files.map(file => ({
                                    file: file,
                                    preview: URL.createObjectURL(file),
                                    name: file.name
                                }));
                                setFormData(prev => ({
                                    ...prev,
                                    images: wrappedFiles
                                }));
                            }}
                            style={inputStyle}
                        />
                        {formData.images.length > 0 && (
                            <div style={{
                                marginTop: '0.5rem',
                                fontSize: '0.9rem',
                                color: '#666'
                            }}>
                                Đã chọn {formData.images.length} hình ảnh
                            </div>
                        )}
                    </div>

                    {/* Amenities */}
                    <div>
                        <label style={labelStyle}>Tiện nghi</label>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                            gap: '0.5rem'
                        }}>
                            {amenitiesList.map(amenity => (
                                <label
                                    key={amenity}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        padding: '0.5rem',
                                        background: formData.amenities.includes(amenity) ? '#e0e7ff' : 'white',
                                        border: '2px solid',
                                        borderColor: formData.amenities.includes(amenity) ? '#10b981' : '#e5e7eb',
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        transition: 'all 0.3s ease'
                                    }}
                                >
                                    <input
                                        type="checkbox"
                                        name="amenities"
                                        value={amenity}
                                        checked={formData.amenities.includes(amenity)}
                                        onChange={handleInputChange}
                                    />
                                    <span style={{ fontSize: '0.875rem' }}>{amenity}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Summary & Actions */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '1.5rem',
                    background: '#e0e7ff',
                    borderRadius: '12px',
                    border: '2px solid #10b981',
                    marginBottom: '2rem'
                }}>
                    <div>
                        <p style={{ fontSize: '1.1rem', fontWeight: '600', color: '#1f2937' }}>
                            📊 Sẽ tạo: {(formData.endFloor - formData.startFloor + 1) * formData.roomsPerFloor} phòng
                        </p>
                        <p style={{ fontSize: '0.9rem', color: '#6b7280' }}>
                            Từ tầng {formData.startFloor} đến {formData.endFloor} • {formData.roomsPerFloor} phòng/tầng • Ký hiệu: {formData.roomPrefix}
                        </p>
                    </div>
                    <div>
                        <button
                            onClick={generateRoomPreview}
                            style={secondaryButtonStyle}
                        >
                            👁️ Xem trước
                        </button>
                        <button
                            onClick={handleCreateRooms}
                            disabled={loading || preview.length === 0}
                            style={{
                                ...primaryButtonStyle,
                                opacity: loading || preview.length === 0 ? 0.5 : 1,
                                cursor: loading || preview.length === 0 ? 'not-allowed' : 'pointer'
                            }}
                        >
                            {loading ? '⏳ Đang tạo...' : '✨ Tạo tất cả phòng'}
                        </button>
                    </div>
                </div>

                {/* Preview Section */}
                {showPreview && preview.length > 0 && (
                    <div style={previewContainerStyle}>
                        <h3 style={{
                            fontSize: '1.5rem',
                            fontWeight: '700',
                            color: '#1f2937',
                            marginBottom: '1.5rem'
                        }}>
                            👁️ Xem trước {preview.length} phòng
                        </h3>
                        <div style={previewGridStyle}>
                            {preview.map((room, index) => (
                                <div key={index} style={roomCardStyle}>
                                    <div style={{ fontWeight: '700', fontSize: '1.1rem', color: '#0ea5e9' }}>
                                        {room.roomNumber}
                                    </div>
                                    <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>
                                        Tầng {room.floor} • {room.type}
                                    </div>
                                    <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>
                                        {room.capacity} người • {room.pricePerNight.toLocaleString()}đ
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Cancel Button */}
                <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                    <button
                        onClick={() => navigate(`/provider/hotels/${hotelId}/overview`)}
                        style={{
                            ...secondaryButtonStyle,
                            background: '#f3f4f6',
                            color: '#6b7280',
                            border: '2px solid #d1d5db'
                        }}
                    >
                        ← Quay lại tổng quan
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BulkRoomCreator;
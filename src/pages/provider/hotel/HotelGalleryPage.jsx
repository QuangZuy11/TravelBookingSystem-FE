import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import Breadcrumb from '../../../components/shared/Breadcrumb';
import { getProxiedGoogleDriveUrl } from '../../../utils/googleDriveImageHelper';

const HotelGalleryPage = () => {
    const { hotelId } = useParams();
    const navigate = useNavigate();
    const token = localStorage.getItem('token');
    const provider = localStorage.getItem('provider');
    const providerId = provider ? JSON.parse(provider)._id : null;

    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [hotel, setHotel] = useState(null);
    const [gallery, setGallery] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedImage, setSelectedImage] = useState(null);
    const [newImages, setNewImages] = useState([]);

    const categories = [
        { value: 'all', label: '🎨 Tất cả', color: '#10b981' },
        { value: 'exterior', label: '🏢 Bên ngoài', color: '#10b981' },
        { value: 'lobby', label: '🚪 Sảnh', color: '#f59e0b' },
        { value: 'rooms', label: '🛏️ Phòng', color: '#3b82f6' },
        { value: 'restaurant', label: '🍽️ Nhà hàng', color: '#ef4444' },
        { value: 'pool', label: '🏊 Hồ bơi', color: '#06b6d4' },
        { value: 'gym', label: '💪 Phòng gym', color: '#8b5cf6' },
        { value: 'spa', label: '🧖 Spa', color: '#ec4899' },
        { value: 'facilities', label: '🏛️ Cơ sở vật chất', color: '#14b8a6' },
        { value: 'events', label: '🎉 Sự kiện', color: '#f97316' },
        { value: 'other', label: '📷 Khác', color: '#6b7280' }
    ];

    useEffect(() => {
        fetchHotelGallery();
    }, [hotelId]);

    const fetchHotelGallery = async () => {
        try {
            setLoading(true);
            const response = await axios.get(
                `/api/hotel/provider/${providerId}/hotels/${hotelId}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.data.success) {
                const hotelData = response.data.data || response.data.hotel;
                setHotel(hotelData);
                // Convert hotel.images array to gallery format if gallery doesn't exist
                if (!hotelData.gallery || hotelData.gallery.length === 0) {
                    if (hotelData.images && hotelData.images.length > 0) {
                        const imageGallery = hotelData.images.map((url, index) => ({
                            url: url,
                            category: 'other',
                            caption: `Hình ảnh ${index + 1}`,
                            _id: `img-${index}`
                        }));
                        setGallery(imageGallery);
                    } else {
                        setGallery([]);
                    }
                } else {
                    setGallery(hotelData.gallery);
                }
            }
        } catch (error) {
            console.error('Error fetching hotel gallery:', error);
            toast.error('Không thể tải thư viện ảnh!');
        } finally {
            setLoading(false);
        }
    };

    const handleFileSelect = (e) => {
        const files = Array.from(e.target.files);
        const imageFiles = files.map(file => ({
            file,
            preview: URL.createObjectURL(file),
            category: 'other',
            caption: '',
            isNew: true
        }));
        setNewImages([...newImages, ...imageFiles]);
    };

    const updateNewImageCategory = (index, category) => {
        setNewImages(prev => prev.map((img, i) =>
            i === index ? { ...img, category } : img
        ));
    };

    const updateNewImageCaption = (index, caption) => {
        setNewImages(prev => prev.map((img, i) =>
            i === index ? { ...img, caption } : img
        ));
    };

    const removeNewImage = (index) => {
        setNewImages(prev => prev.filter((_, i) => i !== index));
    };

    const handleUpload = async () => {
        if (newImages.length === 0) {
            toast.error('Vui lòng chọn ít nhất một ảnh!');
            return;
        }

        try {
            setUploading(true);
            const formData = new FormData();

            newImages.forEach((img, index) => {
                formData.append('images', img.file);
                formData.append(`categories`, img.category);
                formData.append(`captions`, img.caption);
            });

            const response = await axios.post(
                `/api/hotel/provider/${providerId}/hotels/${hotelId}/gallery`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );

            if (response.data.success) {
                toast.success(`✅ Đã tải lên ${newImages.length} ảnh thành công!`);
                setNewImages([]);
                fetchHotelGallery();
            }
        } catch (error) {
            console.error('Error uploading images:', error);
            toast.error('Có lỗi xảy ra khi tải ảnh lên!');
        } finally {
            setUploading(false);
        }
    };

    const handleDeleteImage = async (imageId) => {
        if (!window.confirm('Bạn có chắc muốn xóa ảnh này?')) return;

        try {
            const response = await axios.delete(
                `/api/hotel/provider/${providerId}/hotels/${hotelId}/gallery/${imageId}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.data.success) {
                toast.success('✅ Đã xóa ảnh thành công!');
                fetchHotelGallery();
                setSelectedImage(null);
            }
        } catch (error) {
            console.error('Error deleting image:', error);
            toast.error('Có lỗi xảy ra khi xóa ảnh!');
        }
    };

    const filteredGallery = selectedCategory === 'all'
        ? gallery
        : gallery.filter(img => img.category === selectedCategory);

    const containerStyle = {
        minHeight: '100vh',
        padding: '2rem',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    };

    const contentStyle = {
        maxWidth: '1600px',
        margin: '0 auto',
        background: 'white',
        borderRadius: '24px',
        padding: '3rem',
        boxShadow: '0 20px 60px rgba(0,0,0,0.2)'
    };

    const headerStyle = {
        marginBottom: '2.5rem',
        paddingBottom: '1.5rem',
        borderBottom: '3px solid #10b981'
    };

    const titleStyle = {
        fontSize: '2.5rem',
        fontWeight: '700',
        background: '#10b981',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text'
    };

    const buttonStyle = {
        padding: '0.875rem 1.75rem',
        fontSize: '1rem',
        fontWeight: '600',
        borderRadius: '12px',
        border: 'none',
        cursor: 'pointer',
        transition: 'all 0.3s ease'
    };

    const categoryButtonStyle = (isActive, color) => ({
        padding: '0.75rem 1.5rem',
        fontSize: '0.95rem',
        fontWeight: '600',
        borderRadius: '12px',
        border: '2px solid',
        borderColor: isActive ? color : '#e5e7eb',
        background: isActive ? color : 'white',
        color: isActive ? 'white' : '#6b7280',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        whiteSpace: 'nowrap'
    });

    const breadcrumbItems = [
        { label: 'Dashboard', path: '/provider' },
        { label: 'Hotel Overview', path: `/provider/hotels/${hotelId}/overview` },
        { label: 'Gallery' }
    ];

    if (loading) {
        return (
            <div style={containerStyle}>
                <div style={{ textAlign: 'center', padding: '4rem', color: 'white' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏳</div>
                    <div style={{ fontSize: '1.5rem' }}>Đang tải thư viện ảnh...</div>
                </div>
            </div>
        );
    }

    return (
        <div style={containerStyle}>
            <Breadcrumb items={breadcrumbItems} />

            <div style={contentStyle}>
                {/* Header */}
                <div style={headerStyle}>
                    <h1 style={titleStyle}>📸 Thư viện ảnh</h1>
                    <p style={{ fontSize: '1rem', color: '#6b7280', marginTop: '0.5rem' }}>
                        {hotel?.name} • {gallery.length} ảnh
                    </p>
                </div>

                {/* Upload Section */}
                <div style={{
                    marginBottom: '2rem',
                    padding: '2rem',
                    background: '#f9fafb',
                    borderRadius: '16px',
                    border: '2px dashed #10b981'
                }}>
                    <h2 style={{
                        fontSize: '1.5rem',
                        fontWeight: '700',
                        color: '#1f2937',
                        marginBottom: '1.5rem'
                    }}>
                        📤 Tải ảnh mới
                    </h2>

                    <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleFileSelect}
                        style={{ display: 'none' }}
                        id="gallery-upload"
                    />
                    <label
                        htmlFor="gallery-upload"
                        style={{
                            ...buttonStyle,
                            background: '#10b981',
                            color: 'white',
                            boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
                            display: 'inline-block'
                        }}
                    >
                        📁 Chọn ảnh
                    </label>

                    {/* New Images Preview */}
                    {newImages.length > 0 && (
                        <div style={{ marginTop: '2rem' }}>
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                                gap: '1.5rem'
                            }}>
                                {newImages.map((img, index) => (
                                    <div key={index} style={{
                                        background: 'white',
                                        borderRadius: '12px',
                                        overflow: 'hidden',
                                        border: '2px solid #e5e7eb'
                                    }}>
                                        <div style={{
                                            width: '100%',
                                            height: '200px',
                                            overflow: 'hidden'
                                        }}>
                                            <img
                                                src={img.preview}
                                                alt="Preview"
                                                style={{
                                                    width: '100%',
                                                    height: '100%',
                                                    objectFit: 'cover'
                                                }}
                                            />
                                        </div>
                                        <div style={{ padding: '1rem' }}>
                                            <select
                                                value={img.category}
                                                onChange={(e) => updateNewImageCategory(index, e.target.value)}
                                                style={{
                                                    width: '100%',
                                                    padding: '0.5rem',
                                                    marginBottom: '0.5rem',
                                                    borderRadius: '8px',
                                                    border: '2px solid #e5e7eb'
                                                }}
                                            >
                                                {categories.filter(c => c.value !== 'all').map(cat => (
                                                    <option key={cat.value} value={cat.value}>
                                                        {cat.label}
                                                    </option>
                                                ))}
                                            </select>
                                            <input
                                                type="text"
                                                value={img.caption}
                                                onChange={(e) => updateNewImageCaption(index, e.target.value)}
                                                placeholder="Mô tả ảnh (tùy chọn)"
                                                style={{
                                                    width: '100%',
                                                    padding: '0.5rem',
                                                    marginBottom: '0.5rem',
                                                    borderRadius: '8px',
                                                    border: '2px solid #e5e7eb'
                                                }}
                                            />
                                            <button
                                                onClick={() => removeNewImage(index)}
                                                style={{
                                                    ...buttonStyle,
                                                    background: '#ef4444',
                                                    color: 'white',
                                                    width: '100%',
                                                    padding: '0.5rem'
                                                }}
                                            >
                                                🗑️ Xóa
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <button
                                onClick={handleUpload}
                                disabled={uploading}
                                style={{
                                    ...buttonStyle,
                                    background: '#10b981',
                                    color: 'white',
                                    marginTop: '1.5rem',
                                    opacity: uploading ? 0.6 : 1
                                }}
                            >
                                {uploading ? '⏳ Đang tải lên...' : `⬆️ Tải lên ${newImages.length} ảnh`}
                            </button>
                        </div>
                    )}
                </div>

                {/* Category Filter */}
                <div style={{
                    marginBottom: '2rem',
                    display: 'flex',
                    gap: '1rem',
                    overflowX: 'auto',
                    padding: '0.5rem 0'
                }}>
                    {categories.map(cat => (
                        <button
                            key={cat.value}
                            onClick={() => setSelectedCategory(cat.value)}
                            style={categoryButtonStyle(selectedCategory === cat.value, cat.color)}
                        >
                            {cat.label}
                            {cat.value !== 'all' && (
                                <span style={{ marginLeft: '0.5rem' }}>
                                    ({gallery.filter(img => img.category === cat.value).length})
                                </span>
                            )}
                            {cat.value === 'all' && (
                                <span style={{ marginLeft: '0.5rem' }}>
                                    ({gallery.length})
                                </span>
                            )}
                        </button>
                    ))}
                </div>

                {/* Gallery Grid */}
                {filteredGallery.length > 0 ? (
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                        gap: '1.5rem'
                    }}>
                        {filteredGallery.map((image, index) => (
                            <div
                                key={image._id || index}
                                onClick={() => setSelectedImage(image)}
                                style={{
                                    background: 'white',
                                    borderRadius: '12px',
                                    overflow: 'hidden',
                                    border: '2px solid #e5e7eb',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-4px)';
                                    e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.15)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                                }}
                            >
                                <div style={{
                                    width: '100%',
                                    height: '250px',
                                    overflow: 'hidden',
                                    position: 'relative'
                                }}>
                                    <img
                                        src={getProxiedGoogleDriveUrl(image.url)}
                                        alt={image.caption || 'Hotel image'}
                                        style={{
                                            width: '100%',
                                            height: '100%',
                                            objectFit: 'cover'
                                        }}
                                        onError={(e) => {
                                            e.target.style.display = 'none';
                                            e.target.parentElement.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;width:100%;height:100%;background:#f3f4f6;color:#9ca3af;font-size:3rem;">🖼️</div>';
                                        }}
                                    />
                                    <div style={{
                                        position: 'absolute',
                                        top: '0.5rem',
                                        right: '0.5rem',
                                        padding: '0.25rem 0.75rem',
                                        background: categories.find(c => c.value === image.category)?.color || '#6b7280',
                                        color: 'white',
                                        borderRadius: '8px',
                                        fontSize: '0.85rem',
                                        fontWeight: '600'
                                    }}>
                                        {categories.find(c => c.value === image.category)?.label || '📷 Khác'}
                                    </div>
                                </div>
                                {image.caption && (
                                    <div style={{
                                        padding: '1rem',
                                        fontSize: '0.95rem',
                                        color: '#6b7280'
                                    }}>
                                        {image.caption}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div style={{
                        textAlign: 'center',
                        padding: '4rem',
                        color: '#9ca3af'
                    }}>
                        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📷</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                            Chưa có ảnh nào
                        </div>
                        <div style={{ fontSize: '1rem' }}>
                            {selectedCategory === 'all'
                                ? 'Bắt đầu tải ảnh lên để tạo thư viện cho khách sạn'
                                : `Chưa có ảnh trong danh mục ${categories.find(c => c.value === selectedCategory)?.label}`
                            }
                        </div>
                    </div>
                )}

                {/* Image Preview Modal */}
                {selectedImage && (
                    <div
                        onClick={() => setSelectedImage(null)}
                        style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: 'rgba(0,0,0,0.9)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            zIndex: 1000,
                            padding: '2rem'
                        }}
                    >
                        <div
                            onClick={(e) => e.stopPropagation()}
                            style={{
                                maxWidth: '1200px',
                                maxHeight: '90vh',
                                background: 'white',
                                borderRadius: '16px',
                                overflow: 'hidden',
                                display: 'flex',
                                flexDirection: 'column'
                            }}
                        >
                            <div style={{ flex: 1, overflow: 'hidden' }}>
                                <img
                                    src={getProxiedGoogleDriveUrl(selectedImage.url)}
                                    alt={selectedImage.caption}
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'contain'
                                    }}
                                    onError={(e) => {
                                        e.target.style.display = 'none';
                                        e.target.parentElement.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;width:100%;height:100%;background:#f3f4f6;color:#9ca3af;font-size:4rem;">🖼️<br/><span style="font-size:1rem;">Không thể tải ảnh</span></div>';
                                    }}
                                />
                            </div>
                            <div style={{
                                padding: '1.5rem',
                                background: '#f9fafb',
                                borderTop: '2px solid #e5e7eb'
                            }}>
                                {selectedImage.caption && (
                                    <p style={{
                                        fontSize: '1.1rem',
                                        color: '#1f2937',
                                        marginBottom: '1rem'
                                    }}>
                                        {selectedImage.caption}
                                    </p>
                                )}
                                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                                    <button
                                        onClick={() => handleDeleteImage(selectedImage._id)}
                                        style={{
                                            ...buttonStyle,
                                            background: '#ef4444',
                                            color: 'white'
                                        }}
                                    >
                                        🗑️ Xóa ảnh
                                    </button>
                                    <button
                                        onClick={() => setSelectedImage(null)}
                                        style={{
                                            ...buttonStyle,
                                            background: '#6b7280',
                                            color: 'white'
                                        }}
                                    >
                                        ✕ Đóng
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Back Button */}
                <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                    <button
                        onClick={() => navigate(`/provider/hotels/${hotelId}/overview`)}
                        style={{
                            ...buttonStyle,
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

export default HotelGalleryPage;

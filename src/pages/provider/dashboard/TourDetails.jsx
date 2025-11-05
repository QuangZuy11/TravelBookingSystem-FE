import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { tourApi } from '@api/tourApi';
import { formatCurrency } from '@utils/tourHelpers';
import toast from 'react-hot-toast';
import './TourDetails.css';
import { getProxiedGoogleDriveUrl } from '../../../utils/googleDriveImageHelper';

const TourDetails = () => {
  const { tourId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isEditMode = location.pathname.includes('/edit');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tourData, setTourData] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    location: '',
    price: '',
    duration_hours: '',
    category: 'beach',
    difficulty: 'easy',
    status: 'draft',
    description: [],
    short_description: '',
    image: '',
    capacity: {
      min_participants: 1,
      max_participants: 20,
      current_participants: 0
    },
    pricing: {
      base_price: 0,
      adult: 0,
      child: 0,
      infant: 0,
      currency: 'VND'
    },
    services: {
      included: [],
      excluded: []
    },
    meeting_point: {
      address: '',
      coordinates: { latitude: 0, longitude: 0 }
    },
    highlights: [],
    important_notes: '',
    cancellation_policy: '',
    languages_offered: []
  });

  // Get provider _id from localStorage
  const provider = localStorage.getItem('provider')
    ? JSON.parse(localStorage.getItem('provider'))
    : null;
  const providerId = provider?._id || null;

  // Fetch tour details
  const fetchTourDetails = async () => {
    try {
      setLoading(true);
      if (!providerId || !tourId) {
        toast.error('Missing provider ID or tour ID');
        navigate('/provider/tours');
        return;
      }

      const response = await tourApi.getTourDetails(providerId, tourId);
      const tour = response.data || response;

      setTourData(tour);

      // Populate form data
      setFormData({
        title: tour.title || '',
        location: tour.location || '',
        price: tour.price || '',
        duration_hours: tour.duration_hours || '',
        category: tour.category || 'beach',
        difficulty: tour.difficulty || 'easy',
        status: tour.status || 'draft',
        description: Array.isArray(tour.description) ? tour.description : [],
        short_description: tour.short_description || '',
        image: tour.image || '',
        capacity: {
          min_participants: tour.capacity?.min_participants || 1,
          max_participants: tour.capacity?.max_participants || 20,
          current_participants: tour.capacity?.current_participants || 0
        },
        pricing: {
          base_price: tour.pricing?.base_price || tour.price || 0,
          adult: tour.pricing?.adult || tour.price || 0,
          child: tour.pricing?.child || 0,
          infant: tour.pricing?.infant || 0,
          currency: tour.pricing?.currency || 'VND'
        },
        services: {
          included: tour.services?.included || [],
          excluded: tour.services?.excluded || []
        },
        meeting_point: {
          address: tour.meeting_point?.address || '',
          coordinates: tour.meeting_point?.coordinates || { latitude: 0, longitude: 0 }
        },
        highlights: tour.highlights || [],
        important_notes: tour.important_notes || '',
        cancellation_policy: tour.cancellation_policy || '',
        languages_offered: tour.languages_offered || []
      });
    } catch (error) {
      console.error('Error fetching tour details:', error);
      toast.error('Không thể tải thông tin tour');
      navigate('/provider/tours');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (providerId && tourId) {
      fetchTourDetails();
    }
  }, [providerId, tourId]);

  // Handle form submission (Update)
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isEditMode) {
      toast.error('Chuyển sang chế độ Edit để cập nhật');
      return;
    }

    try {
      setSaving(true);

      // Validate required fields
      if (!formData.title || !formData.location || !formData.image) {
        toast.error('Vui lòng điền đầy đủ thông tin bắt buộc');
        return;
      }

      const response = await tourApi.updateTour(providerId, tourId, formData);

      toast.success('Cập nhật tour thành công!');
      setTourData(response.data || response);
      navigate(`/provider/tours/${tourId}`);
    } catch (error) {
      console.error('Error updating tour:', error);
      toast.error(error.response?.data?.message || 'Không thể cập nhật tour');
    } finally {
      setSaving(false);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa tour này? Hành động này không thể hoàn tác!')) {
      return;
    }

    try {
      await tourApi.deleteTour(providerId, tourId);
      toast.success('Đã xóa tour thành công!');
      navigate('/provider/tours');
    } catch (error) {
      console.error('Error deleting tour:', error);
      toast.error(error.response?.data?.message || 'Không thể xóa tour');
    }
  };

  // Handle status change
  const handleStatusChange = async (newStatus) => {
    try {
      await tourApi.updateTourStatus(providerId, tourId, newStatus);
      toast.success('Đã cập nhật trạng thái tour');
      setFormData({ ...formData, status: newStatus });
      fetchTourDetails();
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Không thể cập nhật trạng thái');
    }
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: '#f3f4f6'
      }}>
        <div style={{ textAlign: 'center', color: 'white' }}>
          <div style={{
            width: '50px',
            height: '50px',
            border: '4px solid rgba(255,255,255,0.3)',
            borderTop: '4px solid white',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem'
          }}></div>
          <p>Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f3f4f6',
      padding: '1rem',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      maxWidth: '100vw',
      overflowX: 'hidden',
      boxSizing: 'border-box'
    }}>
      {/* Header */}
      <div style={{
        background: 'white',
        borderRadius: '15px',
        padding: '1.5rem',
        marginBottom: '1.5rem',
        boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
        maxWidth: '100%'
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          marginBottom: '1rem'
        }}>
          <div style={{ width: '100%' }}>
            <button
              onClick={() => navigate('/provider/tours')}
              style={{
                padding: '0.5rem 1rem',
                background: '#f3f4f6',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                marginBottom: '1rem'
              }}
            >
              ← Quay lại
            </button>
            <h1 style={{
              fontSize: 'clamp(1.5rem, 4vw, 2rem)',
              margin: 0,
              color: '#1f2937',
              wordBreak: 'break-word'
            }}>
              {tourData?.title || 'Chi tiết Tour'}
            </h1>
          </div>
          <div style={{
            display: 'flex',
            gap: '0.75rem',
            flexWrap: 'wrap',
            width: '100%'
          }}>
            {!isEditMode ? (
              <>
                <button
                  onClick={() => navigate(`/provider/tours/${tourId}/edit`)}
                  style={{
                    padding: '0.75rem 1.5rem',
                    background: '#f3f4f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    flex: '1 1 auto',
                    minWidth: '120px'
                  }}
                >
                  Chỉnh sửa
                </button>
                <button
                  onClick={handleDelete}
                  style={{
                    padding: '0.75rem 1.5rem',
                    background: '#ef4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    flex: '1 1 auto',
                    minWidth: '120px'
                  }}
                >
                  Xóa Tour
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => navigate(`/provider/tours/${tourId}`)}
                  style={{
                    padding: '0.75rem 1.5rem',
                    background: '#6b7280',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    flex: '1 1 auto',
                    minWidth: '120px'
                  }}
                >
                  Hủy
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={saving}
                  style={{
                    padding: '0.75rem 1.5rem',
                    background: saving ? '#9ca3af' : '#10b981',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: saving ? 'not-allowed' : 'pointer',
                    fontWeight: '600',
                    flex: '1 1 auto',
                    minWidth: '120px'
                  }}
                >
                  {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
                </button>
              </>
            )}
          </div>
        </div>

        {/* Status badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{
            padding: '0.5rem 1rem',
            borderRadius: '9999px',
            fontSize: '0.875rem',
            fontWeight: '600',
            background: formData.status === 'active' ? '#d1fae5' :
              formData.status === 'draft' ? '#f3f4f6' : '#fecaca',
            color: formData.status === 'active' ? '#065f46' :
              formData.status === 'draft' ? '#374151' : '#991b1b'
          }}>
            {formData.status === 'active' ? '🟢 Hoạt động' :
              formData.status === 'draft' ? '📝 Nháp' : '🔴 Dừng'}
          </span>
          {tourData?.rating && (
            <span style={{ fontSize: '1rem', color: '#6b7280' }}>
              ⭐ {tourData.rating} ({tourData.total_rating} đánh giá)
            </span>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Main Content Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1.5rem',
          maxWidth: '100%',
          width: '100%'
        }}>
          {/* Left Column */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem',
            gridColumn: 'span 1',
            minWidth: 0,
            width: '100%'
          }}>
            {/* Basic Information */}
            <div style={{
              background: 'white',
              borderRadius: '15px',
              padding: '1.5rem',
              boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
              maxWidth: '100%',
              minWidth: 0,
              width: '100%',
              boxSizing: 'border-box'
            }}>
              <h3 style={{ marginTop: 0, color: '#1f2937', marginBottom: '1.5rem' }}>Thông tin cơ bản</h3>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#374151', fontSize: '0.875rem' }}>
                  Tên Tour <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  disabled={!isEditMode}
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    background: isEditMode ? 'white' : '#f9fafb',
                    boxSizing: 'border-box',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}
                  title={formData.title}
                />
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1rem',
                marginBottom: '1.5rem',
                width: '100%'
              }}>
                <div style={{ minWidth: 0 }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#374151', fontSize: '0.875rem' }}>
                    Địa điểm <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    disabled={!isEditMode}
                    required
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '2px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '1rem',
                      background: isEditMode ? 'white' : '#f9fafb',
                      boxSizing: 'border-box',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}
                    title={formData.location}
                  />
                </div>
                <div style={{ minWidth: 0 }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#374151', fontSize: '0.875rem' }}>
                    Thời lượng (giờ) <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.duration_hours}
                    onChange={(e) => setFormData({ ...formData, duration_hours: e.target.value })}
                    disabled={!isEditMode}
                    required
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '2px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '1rem',
                      background: isEditMode ? 'white' : '#f9fafb',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                gap: '1rem',
                marginBottom: '1.5rem',
                width: '100%'
              }}>
                <div style={{ minWidth: 0 }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#374151', fontSize: '0.875rem' }}>
                    Loại tour
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    disabled={!isEditMode}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '2px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '0.875rem',
                      background: isEditMode ? 'white' : '#f9fafb',
                      boxSizing: 'border-box'
                    }}
                  >
                    <option value="beach">🏖️ Beach</option>
                    <option value="mountain">⛰️ Mountain</option>
                    <option value="cultural">🏛️ Cultural</option>
                    <option value="adventure">🎒 Adventure</option>
                    <option value="city">🏙️ City</option>
                    <option value="wildlife">🦁 Wildlife</option>
                  </select>
                </div>
                <div style={{ minWidth: 0 }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#374151', fontSize: '0.875rem' }}>
                    Độ khó
                  </label>
                  <select
                    value={formData.difficulty}
                    onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                    disabled={!isEditMode}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '2px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '0.875rem',
                      background: isEditMode ? 'white' : '#f9fafb',
                      boxSizing: 'border-box'
                    }}
                  >
                    <option value="easy">Dễ</option>
                    <option value="moderate">Trung bình</option>
                    <option value="challenging">Khó</option>
                  </select>
                </div>
                <div style={{ minWidth: 0 }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#374151', fontSize: '0.875rem' }}>
                    Giá (VND)
                  </label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    disabled={!isEditMode}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '2px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '1rem',
                      background: isEditMode ? 'white' : '#f9fafb',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#374151', fontSize: '0.875rem' }}>
                  URL Hình ảnh <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="url"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  disabled={!isEditMode}
                  required
                  placeholder="https://example.com/image.jpg"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    background: isEditMode ? 'white' : '#f9fafb',
                    boxSizing: 'border-box',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}
                  title={formData.image}
                />
                {formData.image && (
                  <img
                    src={getProxiedGoogleDriveUrl(formData.image)}
                    alt="Tour preview"
                    style={{
                      width: '100%',
                      maxHeight: '300px',
                      objectFit: 'cover',
                      borderRadius: '8px',
                      marginTop: '1rem'
                    }}
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                )}
              </div>
            </div>

            {/* Description */}
            <div style={{
              background: 'white',
              borderRadius: '15px',
              padding: '1.5rem',
              boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
              maxWidth: '100%',
              minWidth: 0
            }}>
              <h3 style={{ marginTop: 0, color: '#1f2937', marginBottom: '1.5rem' }}>Mô tả</h3>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#374151', fontSize: '0.875rem' }}>
                  Mô tả ngắn
                </label>
                <textarea
                  value={formData.short_description}
                  onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
                  disabled={!isEditMode}
                  rows="3"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    background: isEditMode ? 'white' : '#f9fafb',
                    resize: 'vertical',
                    boxSizing: 'border-box',
                    fontFamily: 'inherit',
                    lineHeight: '1.5'
                  }}
                />
              </div>
            </div>

            {/* Highlights */}
            <div style={{
              background: 'white',
              borderRadius: '15px',
              padding: '1.5rem',
              boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
              maxWidth: '100%',
              minWidth: 0
            }}>
              <h3 style={{ marginTop: 0, color: '#1f2937', marginBottom: '1.5rem' }}>Điểm nổi bật</h3>
              {formData.highlights && formData.highlights.length > 0 ? (
                <ul style={{ paddingLeft: '1.5rem', margin: 0 }}>
                  {formData.highlights.map((highlight, index) => (
                    <li key={index} style={{
                      marginBottom: '0.5rem',
                      color: '#374151',
                      wordBreak: 'break-word',
                      lineHeight: '1.6'
                    }}>
                      {highlight}
                    </li>
                  ))}
                </ul>
              ) : (
                <p style={{ color: '#6b7280', margin: 0 }}>Chưa có điểm nổi bật nào</p>
              )}
            </div>
          </div>

          {/* Right Column */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem',
            gridColumn: 'span 1',
            minWidth: 0,
            width: '100%'
          }}>
            {/* Pricing */}
            <div style={{
              background: 'white',
              borderRadius: '15px',
              padding: '1.5rem',
              boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
              maxWidth: '100%',
              minWidth: 0
            }}>
              <h3 style={{ marginTop: 0, color: '#1f2937', marginBottom: '1.5rem' }}>Giá</h3>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#374151', fontSize: '0.875rem' }}>
                  Người lớn
                </label>
                <div style={{
                  fontSize: 'clamp(1.25rem, 3vw, 1.5rem)',
                  fontWeight: '700',
                  color: '#10b981',
                  wordBreak: 'break-word'
                }}>
                  {formatCurrency(formData.pricing.adult)}
                </div>
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#374151', fontSize: '0.875rem' }}>
                  Trẻ em
                </label>
                <div style={{
                  fontSize: 'clamp(1rem, 2.5vw, 1.25rem)',
                  fontWeight: '600',
                  color: '#6b7280',
                  wordBreak: 'break-word'
                }}>
                  {formatCurrency(formData.pricing.child)}
                </div>
              </div>
              <div style={{ marginBottom: '0' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#374151', fontSize: '0.875rem' }}>
                  Em bé
                </label>
                <div style={{
                  fontSize: 'clamp(1rem, 2.5vw, 1.25rem)',
                  fontWeight: '600',
                  color: '#6b7280',
                  wordBreak: 'break-word'
                }}>
                  {formatCurrency(formData.pricing.infant)}
                </div>
              </div>
            </div>

            {/* Capacity */}
            <div style={{
              background: 'white',
              borderRadius: '15px',
              padding: '1.5rem',
              boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
              maxWidth: '100%',
              minWidth: 0
            }}>
              <h3 style={{ marginTop: 0, color: '#1f2937', marginBottom: '1.5rem' }}>Sức chứa</h3>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>Tối thiểu:</span>
                <span style={{ fontWeight: '600', fontSize: '0.875rem' }}>{formData.capacity.min_participants} người</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>Tối đa:</span>
                <span style={{ fontWeight: '600', fontSize: '0.875rem' }}>{formData.capacity.max_participants} người</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>Đã đặt:</span>
                <span style={{ fontWeight: '600', color: '#10b981', fontSize: '0.875rem' }}>
                  {formData.capacity.current_participants} người
                </span>
              </div>
            </div>

            {/* Status Control */}
            {!isEditMode && (
              <div style={{
                background: 'white',
                borderRadius: '15px',
                padding: '1.5rem',
                boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
                maxWidth: '100%',
                minWidth: 0
              }}>
                <h3 style={{ marginTop: 0, color: '#1f2937', marginBottom: '1.5rem' }}>Trạng thái Tour</h3>
                <select
                  value={formData.status}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    cursor: 'pointer',
                    boxSizing: 'border-box'
                  }}
                >
                  <option value="draft">📝 Nháp</option>
                  <option value="active">🟢 Hoạt động</option>
                  <option value="inactive">🔴 Dừng</option>
                  <option value="archived">📦 Lưu trữ</option>
                </select>
              </div>
            )}

            {/* Services */}
            <div style={{
              background: 'white',
              borderRadius: '15px',
              padding: '1.5rem',
              boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
              maxWidth: '100%',
              minWidth: 0
            }}>
              <h3 style={{ marginTop: 0, color: '#1f2937', marginBottom: '1.5rem' }}>Dịch vụ</h3>
              <div style={{ marginBottom: '1.5rem' }}>
                <h4 style={{ fontSize: '0.875rem', fontWeight: '600', color: '#10b981', marginBottom: '0.5rem', marginTop: 0 }}>
                  ✅ Bao gồm
                </h4>
                {formData.services.included && formData.services.included.length > 0 ? (
                  <ul style={{ paddingLeft: '1.5rem', margin: 0 }}>
                    {formData.services.included.map((service, index) => (
                      <li key={index} style={{
                        fontSize: '0.875rem',
                        color: '#374151',
                        marginBottom: '0.25rem',
                        wordBreak: 'break-word',
                        lineHeight: '1.6'
                      }}>
                        {service}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: 0 }}>Chưa có dịch vụ</p>
                )}
              </div>
              <div>
                <h4 style={{ fontSize: '0.875rem', fontWeight: '600', color: '#ef4444', marginBottom: '0.5rem', marginTop: 0 }}>
                  ❌ Không bao gồm
                </h4>
                {formData.services.excluded && formData.services.excluded.length > 0 ? (
                  <ul style={{ paddingLeft: '1.5rem', margin: 0 }}>
                    {formData.services.excluded.map((service, index) => (
                      <li key={index} style={{
                        fontSize: '0.875rem',
                        color: '#374151',
                        marginBottom: '0.25rem',
                        wordBreak: 'break-word',
                        lineHeight: '1.6'
                      }}>
                        {service}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: 0 }}>Không có</p>
                )}
              </div>
            </div>

            {/* Meeting Point */}
            <div style={{
              background: 'white',
              borderRadius: '15px',
              padding: '1.5rem',
              boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
              maxWidth: '100%',
              minWidth: 0
            }}>
              <h3 style={{ marginTop: 0, color: '#1f2937', marginBottom: '1.5rem' }}>Điểm hẹn</h3>
              <p style={{
                fontSize: '0.875rem',
                color: '#374151',
                margin: 0,
                wordBreak: 'break-word',
                lineHeight: '1.6'
              }}>
                📍 {formData.meeting_point.address || 'Chưa có thông tin'}
              </p>
            </div>
          </div>
        </div>
      </form>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        * {
          box-sizing: border-box;
        }
        
        input, select, textarea {
          max-width: 100%;
        }
        
        @media (max-width: 768px) {
          [style*="gridTemplateColumns"] {
            grid-template-columns: 1fr !important;
          }
          
          h1 {
            font-size: 1.5rem !important;
          }
          
          button {
            font-size: 0.875rem !important;
            padding: 0.6rem 1rem !important;
          }
        }
        
        @media (max-width: 640px) {
          h3 {
            font-size: 1.125rem !important;
          }
          
          input, select, textarea {
            font-size: 0.875rem !important;
            padding: 0.625rem !important;
          }
        }
      `}</style>
    </div>
  );
};

export default TourDetails;
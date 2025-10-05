import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { RoomForm } from '../../components/provider/forms/RoomForm';
import axios from 'axios';
import { Spinner } from '../../components/ui/Spinner';
import { ErrorAlert } from '../../components/shared/ErrorAlert';

const RoomFormPage = () => {
  const navigate = useNavigate();
  const providerId = localStorage.getItem('providerId');
  if (!providerId) {
    alert('Provider ID not found. Please log in again.');
    navigate('/auth');
  }
  const { hotelId, roomId } = useParams();
  const [initialData, setInitialData] = useState(null);
  const [loading, setLoading] = useState(roomId ? true : false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (roomId) {
      fetchRoomData();
    }
  }, [roomId]);

  const fetchRoomData = async () => {
    try {
      setLoading(true);
      // Thêm log để kiểm tra
      console.log('Fetching room data with:', { providerId, hotelId, roomId });
      
      // Thay đổi URL API để phù hợp với response
      const response = await axios.get(`/api/hotel/provider/${providerId}/hotels/${hotelId}/rooms/${roomId}`);
      
      console.log('Room data response:', response.data);
      
      if (response.data.success && response.data.data) {
        const roomData = response.data.data;  // Lấy trực tiếp object data
        console.log('Setting room data:', roomData);
        setInitialData(roomData);
      } else {
        console.log('No room data found in response');
        setError('Room not found');
      }
    } catch (err) {
      console.error('Error fetching room data:', err);
      setError('Failed to fetch room data: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (formData) => {
    try {
      if (roomId) {
        // Update existing room
        await axios.put(`/api/hotel/provider/${providerId}/hotels/${hotelId}/rooms/${roomId}`, formData);
      } else {
        // Create new room
        await axios.post(`/api/hotel/provider/${providerId}/hotels/${hotelId}/rooms`, formData);
      }
      navigate(`/provider/hotels/${hotelId}`);
    } catch (err) {
      console.error('Error saving room:', err);
      alert('Failed to save room. Please try again.');
    }
  };

  if (loading) return <Spinner />;
  if (error) return <ErrorAlert message={error} />;

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '2rem'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        <button
          onClick={() => navigate(`/provider/hotels/${hotelId}`)}
          style={{
            marginBottom: '2rem',
            padding: '0.75rem 1.5rem',
            background: 'white',
            border: 'none',
            borderRadius: '12px',
            fontSize: '1rem',
            fontWeight: '600',
            color: '#667eea',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
          }}
        >
          ← Back to Hotel Details
        </button>

        <RoomForm 
          initialData={initialData}
          onSubmit={handleSubmit}
          hotelId={hotelId}
        />
      </div>
    </div>
  );
};

export default RoomFormPage;
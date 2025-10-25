import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import HotelForm from '../../../components/provider/forms/HotelForm';
import { Spinner } from '../../../components/ui/Spinner';
import { ErrorAlert } from '../../../components/shared/ErrorAlert';

const EditHotelPage = () => {
    const navigate = useNavigate();
    const { hotelId } = useParams();
    const providerId = localStorage.getItem('providerId');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [hotel, setHotel] = useState(null);
    const token = localStorage.getItem('token');
    useEffect(() => {
        fetchHotelData();
    }, []);

    const fetchHotelData = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`/api/hotel/provider/${providerId}/hotels/${hotelId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.success && response.data.data) {
                setHotel(response.data.data);
            } else {
                setError('Hotel not found');
            }
        } catch (err) {
            console.error('Error fetching hotel:', err);
            setError('Failed to fetch hotel data');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (formData) => {
        try {
            console.log('📤 UPDATE: Sending FormData to backend...');
            await axios.put(`/api/hotel/provider/${providerId}/hotels/${hotelId}`, formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
            alert('Hotel updated successfully!');
            navigate(`/provider/hotels/${hotelId}`);
        } catch (err) {
            console.error('Error updating hotel:', err);
            alert('Failed to update hotel. Please try again.');
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
                {hotel && (
                    <HotelForm
                        initialData={hotel}
                        onSubmit={handleSubmit}
                        isEdit={true}
                    />
                )}
            </div>
        </div>
    );
};

export default EditHotelPage;
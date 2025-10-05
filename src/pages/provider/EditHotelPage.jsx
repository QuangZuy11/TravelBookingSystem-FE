import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import HotelForm from '../../components/provider/forms/HotelForm';
import { Spinner } from '../../components/ui/Spinner';
import { ErrorAlert } from '../../components/shared/ErrorAlert';

const EditHotelPage = () => {
    const navigate = useNavigate();
    const { hotelId } = useParams();
    const providerId = localStorage.getItem('providerId');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [hotel, setHotel] = useState(null);

    useEffect(() => {
        fetchHotelData();
    }, []);

    const fetchHotelData = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`/api/hotel/provider/${providerId}/hotels/${hotelId}`);
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
            await axios.put(`/api/hotel/provider/${providerId}/hotels/${hotelId}`, formData);
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
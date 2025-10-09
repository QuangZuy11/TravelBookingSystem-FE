import React from 'react';
import { useNavigate } from 'react-router-dom';
import { HotelForm } from '../../components/provider/forms/HotelForm';
import axios from 'axios';
import Breadcrumb from '../../components/shared/Breadcrumb';

const CreateHotelPage = () => {
  const navigate = useNavigate();

  const handleSubmitHotel = async (formData) => {
    try {
      const providerId = localStorage.getItem('providerId');
      if (!providerId) {
        alert('Provider ID not found. Please log in again.');
        return;
      }

      await axios.post(`/api/hotel/provider/${providerId}/hotels`, formData);
      alert('Hotel added successfully!');
      navigate('/provider/hotels'); // Quay lại trang danh sách hotel
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add hotel');
      console.error(err);
    }
  };

  

  return (
    <div className="create-hotel-page p-6">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-2">
        <HotelForm onSubmit={handleSubmitHotel} />
      </div>
    </div>
  );
};

export default CreateHotelPage;
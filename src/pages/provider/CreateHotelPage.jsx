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

  const breadcrumbItems = [
    { label: 'Dashboard', path: '/provider' },
    { label: 'Hotels', path: '/provider/hotels' },
    { label: 'Add New Hotel' }
  ];

  return (
    <div className="create-hotel-page p-6">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
        <Breadcrumb items={breadcrumbItems} />
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Add New Hotel</h1>
          <p className="text-gray-600">Fill in the details below to create a new hotel</p>
        </div>
        <HotelForm onSubmit={handleSubmitHotel} />
        <div className="mt-4">
          <button
            onClick={() => navigate('/provider/hotels')}
            className="text-gray-600 hover:text-gray-900"
          >
            ← Back to Hotels
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateHotelPage;
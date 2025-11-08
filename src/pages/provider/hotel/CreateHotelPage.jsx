import React from 'react';
import { useNavigate } from 'react-router-dom';
import { HotelForm } from '../../../components/provider/forms/HotelForm';
import hotelService from '../../../services/hotelService';
import toast from 'react-hot-toast';
import Breadcrumb from '../../../components/shared/Breadcrumb';

const CreateHotelPage = () => {
  const navigate = useNavigate();

  const handleSubmitHotel = async (formData) => {
    try {
      const token = localStorage.getItem('token');
      const providerStr = localStorage.getItem('provider');
      let providerId = null;

      // ✅ ALWAYS prioritize provider._id from provider object (this is the CORRECT provider ID)
      if (providerStr) {
        try {
          const provider = JSON.parse(providerStr);
          if (provider && provider._id) {
            providerId = provider._id;
            // Sync localStorage for future use
            localStorage.setItem('providerId', providerId);
            console.log('✅ Using provider._id from provider object:', providerId);
          }
        } catch (e) {
          console.error('Error parsing provider:', e);
        }
      }

      // Fallback to localStorage - get from provider object
      if (!providerId) {
        const provider = localStorage.getItem('provider');
        if (provider) {
          try {
            providerId = JSON.parse(provider)._id;
            console.log('✅ Got providerId from provider object:', providerId);
          } catch (e) {
            console.error('Error parsing provider:', e);
          }
        }
      }

      if (!providerId) {
        toast.error('❌ Provider ID không tìm thấy. Backend cần thêm serviceProviderId vào JWT token khi login.');
        toast.error('Giải pháp tạm: Đăng xuất và đăng nhập lại để backend cấp token mới.');
        return;
      }

      if (!token) {
        toast.error('Authentication token not found. Please log in again.');
        navigate('/auth');
        return;
      }

      const response = await hotelService.createHotel(providerId, formData);
      toast.success('Hotel added successfully!');

      // 🔄 Trigger refresh: Set a flag in localStorage to tell DashboardLayout to re-fetch
      localStorage.setItem('hotelJustCreated', 'true');

      // Navigate to hotel overview
      if (response.data?._id) {
        navigate(`/provider/hotels/${response.data._id}/overview`);
      } else {
        navigate('/provider/hotels');
      }
    } catch (err) {
      if (err.response?.status === 403 && err.response?.data?.error?.includes('Service provider ID not found')) {
        toast.error('⚠️ TOKEN THIẾU serviceProviderId - Backend cần fix:', { duration: 6000 });
        toast.error('Backend phải thêm serviceProviderId vào JWT khi user ServiceProvider login', { duration: 6000 });
      } else {
        toast.error(err.response?.data?.message || 'Failed to add hotel');
      }
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
import React, { useState, useEffect } from 'react';

const HotelEditModal = ({ hotel, isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState(hotel || {
    name: '',
    location: '',
    description: '',
    amenities: [],
    images: [],
    policies: {
      checkIn: '14:00',
      checkOut: '12:00',
      cancellation: '',
      children: '',
      pets: ''
    }
  });

  useEffect(() => {
    if (hotel) {
      setFormData(hotel);
    }
  }, [hotel]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  if (!isOpen) return null;

  const handleImageUpload = (e) => {
    // TODO: Implement image upload
    console.log('File uploaded:', e.target.files[0]);
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center">
      <div className="bg-white rounded-lg p-6 w-full max-w-6xl h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">Edit Hotel Details</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Info Column */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-lg p-6 shadow-sm border">
                <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Hotel Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Location</label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData({...formData, location: e.target.value})}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      rows="4"
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-sm border">
                <h3 className="text-lg font-semibold mb-4">Amenities</h3>
                <div className="space-y-2">
                  {formData.amenities.map((amenity, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={amenity}
                        onChange={(e) => {
                          const newAmenities = [...formData.amenities];
                          newAmenities[index] = e.target.value;
                          setFormData({...formData, amenities: newAmenities});
                        }}
                        className="flex-1 rounded-md border border-gray-300 px-3 py-2"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const newAmenities = formData.amenities.filter((_, i) => i !== index);
                          setFormData({...formData, amenities: newAmenities});
                        }}
                        className="text-red-500 hover:text-red-700"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => setFormData({
                      ...formData,
                      amenities: [...formData.amenities, '']
                    })}
                    className="mt-2 w-full py-2 px-4 border border-blue-500 text-blue-500 rounded-md hover:bg-blue-50"
                  >
                    + Add Amenity
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-sm border">
                <h3 className="text-lg font-semibold mb-4">Policies</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Check-in Time</label>
                      <input
                        type="time"
                        value={formData.policies.checkIn}
                        onChange={(e) => setFormData({
                          ...formData,
                          policies: {...formData.policies, checkIn: e.target.value}
                        })}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Check-out Time</label>
                      <input
                        type="time"
                        value={formData.policies.checkOut}
                        onChange={(e) => setFormData({
                          ...formData,
                          policies: {...formData.policies, checkOut: e.target.value}
                        })}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Cancellation Policy</label>
                    <textarea
                      value={formData.policies.cancellation}
                      onChange={(e) => setFormData({
                        ...formData,
                        policies: {...formData.policies, cancellation: e.target.value}
                      })}
                      rows="2"
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Children Policy</label>
                    <textarea
                      value={formData.policies.children}
                      onChange={(e) => setFormData({
                        ...formData,
                        policies: {...formData.policies, children: e.target.value}
                      })}
                      rows="2"
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Pet Policy</label>
                    <textarea
                      value={formData.policies.pets}
                      onChange={(e) => setFormData({
                        ...formData,
                        policies: {...formData.policies, pets: e.target.value}
                      })}
                      rows="2"
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Side Column */}
            <div className="space-y-6">
              <div className="bg-white rounded-lg p-6 shadow-sm border">
                <h3 className="text-lg font-semibold mb-4">Status</h3>
                <select
                  value={formData.status || 'active'}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                  className="block w-full rounded-md border border-gray-300 px-3 py-2"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="maintenance">Under Maintenance</option>
                </select>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-sm border">
                <h3 className="text-lg font-semibold mb-4">Hotel Images</h3>
                <div className="space-y-4">
                  {formData.images.map((image, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={image}
                        alt={`Hotel ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const newImages = formData.images.filter((_, i) => i !== index);
                          setFormData({...formData, images: newImages});
                        }}
                        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="hotel-image-upload"
                    />
                    <label
                      htmlFor="hotel-image-upload"
                      className="block text-center cursor-pointer text-blue-500 hover:text-blue-700"
                    >
                      <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                      </svg>
                      <span className="mt-2 block">Add Image</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 sticky bottom-0 bg-white p-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default HotelEditModal;
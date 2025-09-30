import React, { useState, useEffect } from 'react';

const RoomEditModal = ({ room, isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    type: '',
    capacity: 1,
    quantity: 1,
    price: 0,
    amenities: [],
    images: []
  });

  useEffect(() => {
    if (room) {
      setFormData({
        type: room.type || '',
        capacity: room.capacity || 1,
        quantity: room.quantity || 1,
        price: room.price || 0,
        amenities: room.amenities || [],
        images: room.images || []
      });
    }
  }, [room]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAmenityChange = (e) => {
    const value = e.target.value;
    if (e.target.checked) {
      setFormData(prev => ({
        ...prev,
        amenities: [...prev.amenities, value]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        amenities: prev.amenities.filter(a => a !== value)
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...room,
      ...formData,
      price: Number(formData.price),
      capacity: Number(formData.capacity),
      quantity: Number(formData.quantity)
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">
            {room ? 'Edit Room' : 'Add New Room'}
          </h2>
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
          <div>
            <label className="block text-sm font-medium text-gray-700">Room Type</label>
            <input
              type="text"
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Capacity</label>
              <input
                type="number"
                name="capacity"
                min="1"
                value={formData.capacity}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Quantity</label>
              <input
                type="number"
                name="quantity"
                min="1"
                value={formData.quantity}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Price (VND)</label>
              <input
                type="number"
                name="price"
                min="0"
                step="100000"
                value={formData.price}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Amenities</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[
                'WiFi', 'TV', 'Air Conditioning', 'Mini Bar', 'Safe',
                'Bath Tub', 'Shower', 'King Bed', 'Queen Bed', 'Twin Beds',
                'City View', 'Ocean View', 'Balcony', 'Kitchen', 'Living Room'
              ].map(amenity => (
                <label key={amenity} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    value={amenity}
                    checked={formData.amenities.includes(amenity)}
                    onChange={handleAmenityChange}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm">{amenity}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="pt-4 flex justify-end space-x-3">
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
              Save Room
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RoomEditModal;
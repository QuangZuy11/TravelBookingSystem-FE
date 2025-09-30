import React, { useState } from 'react';
import './HotelDetails.css';

const HotelDetails = () => {
  const [hotelData, setHotelData] = useState({
    name: 'Luxury Palace Hotel',
    location: 'District 1, Ho Chi Minh City',
    description: 'Khách sạn 5 sao với tầm nhìn panorama ra thành phố',
    rating: 4.8,
    amenities: [
      'Hồ bơi vô cực',
      'Nhà hàng 5 sao',
      'Spa & Massage',
      'Phòng gym',
      'Quầy bar trên sân thượng'
    ],
    rooms: [
      {
        id: 1,
        type: 'Deluxe Double',
        capacity: 2,
        price: '1200000',
        quantity: 20,
        amenities: ['Tivi LCD', 'Mini bar', 'Ban công', 'Bồn tắm'],
        images: ['/path/to/room1.jpg']
      },
      {
        id: 2,
        type: 'Executive Suite',
        capacity: 4,
        price: '2500000',
        quantity: 10,
        amenities: ['Phòng khách riêng', 'Bồn tắm spa', 'View thành phố', 'Minibar cao cấp'],
        images: ['/path/to/room2.jpg']
      }
    ],
    images: [
      '/path/to/hotel1.jpg',
      '/path/to/hotel2.jpg',
      '/path/to/hotel3.jpg'
    ],
    policies: {
      checkIn: '14:00',
      checkOut: '12:00',
      cancellation: 'Miễn phí hủy phòng trước 24 giờ',
      children: 'Trẻ em dưới 6 tuổi ở miễn phí',
      pets: 'Không cho phép vật nuôi'
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission
    console.log('Hotel data:', hotelData);
  };

  const handleImageUpload = (e) => {
    // Handle image upload
    console.log('File uploaded:', e.target.files[0]);
  };

  return (
    <div className="hotel-details">
      <div className="hotel-header">
        <h2>{hotelData.name}</h2>
        <button className="save-button" onClick={handleSubmit}>Save Changes</button>
      </div>

      <div className="hotel-content">
        <div className="main-info">
          <div className="form-section">
            <h3>Basic Information</h3>
            <div className="form-group">
              <label>Hotel Name</label>
              <input
                type="text"
                value={hotelData.name}
                onChange={(e) => setHotelData({...hotelData, name: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label>Location</label>
              <input
                type="text"
                value={hotelData.location}
                onChange={(e) => setHotelData({...hotelData, location: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea
                value={hotelData.description}
                onChange={(e) => setHotelData({...hotelData, description: e.target.value})}
                rows="4"
              />
            </div>
          </div>

          <div className="form-section">
            <h3>Hotel Amenities</h3>
            <div className="amenities-container">
              {hotelData.amenities.map((amenity, index) => (
                <div key={index} className="amenity-item">
                  <input
                    type="text"
                    value={amenity}
                    onChange={(e) => {
                      const newAmenities = [...hotelData.amenities];
                      newAmenities[index] = e.target.value;
                      setHotelData({...hotelData, amenities: newAmenities});
                    }}
                  />
                  <button
                    onClick={() => {
                      const newAmenities = hotelData.amenities.filter((_, i) => i !== index);
                      setHotelData({...hotelData, amenities: newAmenities});
                    }}
                  >
                    Remove
                  </button>
                </div>
              ))}
              <button
                className="add-button"
                onClick={() => setHotelData({
                  ...hotelData,
                  amenities: [...hotelData.amenities, '']
                })}
              >
                + Add Amenity
              </button>
            </div>
          </div>

          <div className="form-section">
            <h3>Room Types</h3>
            <div className="rooms-container">
              {hotelData.rooms.map((room, index) => (
                <div key={room.id} className="room-card">
                  <div className="room-header">
                    <h4>Room Type</h4>
                    <button
                      onClick={() => {
                        const newRooms = hotelData.rooms.filter((_, i) => i !== index);
                        setHotelData({...hotelData, rooms: newRooms});
                      }}
                    >
                      Remove Room Type
                    </button>
                  </div>
                  <div className="room-form">
                    <div className="form-row">
                      <div className="form-group">
                        <label>Room Type Name</label>
                        <input
                          type="text"
                          value={room.type}
                          onChange={(e) => {
                            const newRooms = [...hotelData.rooms];
                            newRooms[index].type = e.target.value;
                            setHotelData({...hotelData, rooms: newRooms});
                          }}
                        />
                      </div>
                      <div className="form-group">
                        <label>Capacity</label>
                        <input
                          type="number"
                          value={room.capacity}
                          onChange={(e) => {
                            const newRooms = [...hotelData.rooms];
                            newRooms[index].capacity = e.target.value;
                            setHotelData({...hotelData, rooms: newRooms});
                          }}
                        />
                      </div>
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Price per Night (VND)</label>
                        <input
                          type="number"
                          value={room.price}
                          onChange={(e) => {
                            const newRooms = [...hotelData.rooms];
                            newRooms[index].price = e.target.value;
                            setHotelData({...hotelData, rooms: newRooms});
                          }}
                        />
                      </div>
                      <div className="form-group">
                        <label>Number of Rooms</label>
                        <input
                          type="number"
                          value={room.quantity}
                          onChange={(e) => {
                            const newRooms = [...hotelData.rooms];
                            newRooms[index].quantity = e.target.value;
                            setHotelData({...hotelData, rooms: newRooms});
                          }}
                        />
                      </div>
                    </div>
                    <div className="room-amenities">
                      <label>Room Amenities</label>
                      <div className="amenities-list">
                        {room.amenities.map((amenity, amenityIndex) => (
                          <div key={amenityIndex} className="amenity-item">
                            <input
                              type="text"
                              value={amenity}
                              onChange={(e) => {
                                const newRooms = [...hotelData.rooms];
                                newRooms[index].amenities[amenityIndex] = e.target.value;
                                setHotelData({...hotelData, rooms: newRooms});
                              }}
                            />
                            <button
                              onClick={() => {
                                const newRooms = [...hotelData.rooms];
                                newRooms[index].amenities = room.amenities.filter((_, i) => i !== amenityIndex);
                                setHotelData({...hotelData, rooms: newRooms});
                              }}
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                        <button
                          className="add-button"
                          onClick={() => {
                            const newRooms = [...hotelData.rooms];
                            newRooms[index].amenities.push('');
                            setHotelData({...hotelData, rooms: newRooms});
                          }}
                        >
                          + Add Room Amenity
                        </button>
                      </div>
                    </div>
                    <div className="room-images">
                      <label>Room Images</label>
                      <div className="images-grid">
                        {room.images.map((image, imageIndex) => (
                          <div key={imageIndex} className="image-item">
                            <img src={image} alt={`Room ${imageIndex + 1}`} />
                            <button
                              onClick={() => {
                                const newRooms = [...hotelData.rooms];
                                newRooms[index].images = room.images.filter((_, i) => i !== imageIndex);
                                setHotelData({...hotelData, rooms: newRooms});
                              }}
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                        <div className="image-upload">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            id={`room-image-upload-${index}`}
                          />
                          <label htmlFor={`room-image-upload-${index}`}>+ Add Image</label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              <button
                className="add-button full-width"
                onClick={() => {
                  const newRoom = {
                    id: hotelData.rooms.length + 1,
                    type: '',
                    capacity: 2,
                    price: '',
                    quantity: 1,
                    amenities: [],
                    images: []
                  };
                  setHotelData({
                    ...hotelData,
                    rooms: [...hotelData.rooms, newRoom]
                  });
                }}
              >
                + Add New Room Type
              </button>
            </div>
          </div>

          <div className="form-section">
            <h3>Hotel Policies</h3>
            <div className="policies-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Check-in Time</label>
                  <input
                    type="time"
                    value={hotelData.policies.checkIn}
                    onChange={(e) => setHotelData({
                      ...hotelData,
                      policies: {...hotelData.policies, checkIn: e.target.value}
                    })}
                  />
                </div>
                <div className="form-group">
                  <label>Check-out Time</label>
                  <input
                    type="time"
                    value={hotelData.policies.checkOut}
                    onChange={(e) => setHotelData({
                      ...hotelData,
                      policies: {...hotelData.policies, checkOut: e.target.value}
                    })}
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Cancellation Policy</label>
                <textarea
                  value={hotelData.policies.cancellation}
                  onChange={(e) => setHotelData({
                    ...hotelData,
                    policies: {...hotelData.policies, cancellation: e.target.value}
                  })}
                  rows="2"
                />
              </div>
              <div className="form-group">
                <label>Children Policy</label>
                <textarea
                  value={hotelData.policies.children}
                  onChange={(e) => setHotelData({
                    ...hotelData,
                    policies: {...hotelData.policies, children: e.target.value}
                  })}
                  rows="2"
                />
              </div>
              <div className="form-group">
                <label>Pet Policy</label>
                <textarea
                  value={hotelData.policies.pets}
                  onChange={(e) => setHotelData({
                    ...hotelData,
                    policies: {...hotelData.policies, pets: e.target.value}
                  })}
                  rows="2"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="side-panel">
          <div className="status-section">
            <h3>Hotel Status</h3>
            <select>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="maintenance">Under Maintenance</option>
            </select>
          </div>
          
          <div className="gallery-section">
            <h3>Hotel Gallery</h3>
            <div className="images-container">
              {hotelData.images.map((image, index) => (
                <div key={index} className="image-item">
                  <img src={image} alt={`Hotel ${index + 1}`} />
                  <button
                    onClick={() => {
                      const newImages = hotelData.images.filter((_, i) => i !== index);
                      setHotelData({...hotelData, images: newImages});
                    }}
                  >
                    Remove
                  </button>
                </div>
              ))}
              <div className="image-upload">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  id="hotel-image-upload"
                />
                <label htmlFor="hotel-image-upload">+ Add Image</label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HotelDetails;
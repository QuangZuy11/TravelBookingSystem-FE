import React from 'react';
import './RoomCard.css';

const RoomCard = ({ room, onEdit }) => {
  return (
    <div className="room-card">
      <div className="room-card-image">
        {room.images && room.images.length > 0 ? (
          <img src={room.images[0]} alt={room.type} />
        ) : (
          <div className="room-card-image-placeholder">No Image</div>
        )}
      </div>
      <div className="room-card-content">
        <h3 className="room-type">{room.type}</h3>
        <div className="room-info">
          <div className="info-item">
            <span className="label">Capacity:</span>
            <span className="value">{room.capacity} Guests</span>
          </div>
          <div className="info-item">
            <span className="label">Price:</span>
            <span className="value">{parseInt(room.price).toLocaleString()}đ/night</span>
          </div>
          <div className="info-item">
            <span className="label">Available:</span>
            <span className="value">{room.quantity} rooms</span>
          </div>
        </div>
        <div className="room-amenities">
          {room.amenities.map((amenity, index) => (
            <span key={index} className="amenity-tag">
              {amenity}
            </span>
          ))}
        </div>
      </div>
      <div className="room-card-actions">
        <button className="edit-button" onClick={() => onEdit(room)}>
          Edit Room
        </button>
        <button className="view-button">View Bookings</button>
      </div>
    </div>
  );
};

export default RoomCard;
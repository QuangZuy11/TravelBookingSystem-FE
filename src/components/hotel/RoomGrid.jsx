import React from 'react';
import RoomCard from './RoomCard';
import './RoomGrid.css';

const RoomGrid = ({ rooms, onEditRoom }) => {
  return (
    <div className="room-grid">
      {rooms.map((room) => (
        <div key={room.id} className="room-grid-item">
          <RoomCard room={room} onEdit={onEditRoom} />
        </div>
      ))}
      <div className="room-grid-item add-room">
        <div className="add-room-card" onClick={() => onEditRoom(null)}>
          <div className="add-icon">+</div>
          <span>Add New Room</span>
        </div>
      </div>
    </div>
  );
};

export default RoomGrid;
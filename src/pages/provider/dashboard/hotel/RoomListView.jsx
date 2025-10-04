import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';

const RoomListView = () => {
  const { hotelId } = useParams();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const mockRooms = [
          {
            id: 1,
            type: "Deluxe Double",
            description: "Spacious room with city view and modern amenities",
            quantity: 20,
            available: 15,
            price: 2000000,
            capacity: 2,
            size: "32m²",
            bedType: "1 King Bed",
            thumbnailImage: "room1.jpg"
          },
          {
            id: 2,
            type: "Executive Suite",
            description: "Luxury suite with separate living area and premium services",
            quantity: 10,
            available: 8,
            price: 3500000,
            capacity: 4,
            size: "55m²",
            bedType: "1 King Bed + 1 Sofa Bed",
            thumbnailImage: "room2.jpg"
          },
          {
            id: 3,
            type: "Standard Twin",
            description: "Comfortable room with two beds and basic amenities",
            quantity: 15,
            available: 10,
            price: 1200000,
            capacity: 2,
            size: "28m²",
            bedType: "2 Twin Beds",
            thumbnailImage: "room3.jpg"
          }
        ];
        setRooms(mockRooms);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching rooms:', error);
        setLoading(false);
      }
    };

    fetchRooms();
  }, [hotelId]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <div style={{
          animation: 'spin 1s linear infinite',
          borderRadius: '50%',
          height: '32px',
          width: '32px',
          borderBottom: '2px solid #3b82f6'
        }} />
      </div>
    );
  }

  return (
    <div style={{ padding: '32px', width: '100%' }}>
      <div style={{ marginBottom: '24px' }}>
        <Link 
          to={`/provider/hotels/${hotelId}`} 
          style={{ 
            color: '#2563eb', 
            marginBottom: '16px', 
            display: 'block',
            textDecoration: 'none'
          }}
        >
          Back to Hotel
        </Link>
        <h1 style={{ fontSize: '24px', fontWeight: '500', marginBottom: '24px', color: '#111827' }}>
          Room Types
        </h1>
      </div>

      <div style={{ marginBottom: '24px' }}>
        <Link 
          to={`/provider/hotels/${hotelId}/rooms/new`}
          style={{
            display: 'inline-block',
            backgroundColor: '#2563eb',
            color: 'white',
            padding: '8px 16px',
            borderRadius: '6px',
            textDecoration: 'none'
          }}
        >
          + Add New Room
        </Link>
      </div>

      {/* Grid layout: 3 cards per row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '20px'
      }}>
        {rooms.map(room => (
          <Link 
            key={room.id} 
            to={`/provider/hotels/${hotelId}/rooms/${room.id}`}
            style={{
              display: 'block',
              backgroundColor: 'white',
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              padding: '20px',
              textDecoration: 'none',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 6px 12px rgba(0,0,0,0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
            }}
          >
            <div style={{ marginBottom: '16px' }}>
              <h3 style={{ 
                fontSize: '20px', 
                fontWeight: '600', 
                color: '#2563eb', 
                marginBottom: '8px' 
              }}>
                {room.type}
              </h3>
              <p style={{ color: '#4b5563', fontSize: '14px', lineHeight: '1.5' }}>
                {room.description}
              </p>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px' }}>
              <div>
                <p style={{ color: '#6b7280', fontSize: '13px' }}>Total</p>
                <p style={{ fontSize: '16px', fontWeight: '500' }}>{room.quantity}</p>
              </div>
              <div>
                <p style={{ color: '#6b7280', fontSize: '13px' }}>Available</p>
                <p style={{ fontSize: '16px', fontWeight: '500' }}>{room.available}</p>
              </div>
              <div>
                <p style={{ color: '#6b7280', fontSize: '13px' }}>Price</p>
                <p style={{ fontSize: '16px', fontWeight: '600', color: '#2563eb' }}>
                  {formatPrice(room.price)}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default RoomListView;

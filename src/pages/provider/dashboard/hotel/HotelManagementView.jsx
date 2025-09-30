import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import RoomEditModal from "../../../../components/hotel/RoomEditModal";

const HotelManagementView = () => {
  const { hotelId } = useParams();
  const [hotel, setHotel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("details");
  const [editingRoom, setEditingRoom] = useState(null);
  const [isRoomModalOpen, setIsRoomModalOpen] = useState(false);

  useEffect(() => {
    const fetchHotelDetails = async () => {
      try {
        // TODO: Replace with actual API call
        const mockHotel = {
          id: hotelId,
          name: "Luxury Palace Hotel",
          description: "Experience unparalleled luxury in the heart of the city with breathtaking views and world-class amenities.",
          location: "Ho Chi Minh City",
          address: "123 Le Loi Street, District 1",
          amenities: ["Swimming Pool", "Spa & Massage", "Restaurant", "Fitness Center", "24/7 Room Service"],
          rating: 4.8,
          rooms: [
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
              amenities: ["King Bed", "City View", "Mini Bar", "Free WiFi", "Air Conditioning", "Safe"],
              images: ["room1.jpg"]
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
              amenities: ["King Bed", "Ocean View", "Living Room", "Jacuzzi", "Mini Bar", "Free WiFi", "Kitchen"],
              images: ["room2.jpg"]
            }
          ]
        };
        setHotel(mockHotel);
      } catch (error) {
        console.error('Error fetching hotel details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHotelDetails();
  }, [hotelId]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
      </div>
    );
  }

  if (!hotel) {
    return <div className="text-center py-8 text-gray-600">Hotel not found</div>;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <Link to="/provider/hotels" className="inline-flex items-center text-blue-500 hover:text-blue-700">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
          </svg>
          Back to Hotels
        </Link>
        <h1 className="text-3xl font-bold mt-3">{hotel.name}</h1>
      </div>

      <div className="mb-6">
        <nav className="flex space-x-4">
          <button
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'details'
                ? 'bg-blue-500 text-white'
                : 'text-blue-500 hover:bg-blue-50'
            }`}
            onClick={() => setActiveTab('details')}
          >
            Hotel Details
          </button>
          <button
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'rooms'
                ? 'bg-blue-500 text-white'
                : 'text-blue-500 hover:bg-blue-50'
            }`}
            onClick={() => setActiveTab('rooms')}
          >
            Rooms
          </button>
        </nav>
      </div>

      {activeTab === 'details' && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
              <div className="space-y-4">
                <div>
                  <span className="font-medium text-gray-600">Location:</span>
                  <p className="mt-1">{hotel.location}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Address:</span>
                  <p className="mt-1">{hotel.address}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Rating:</span>
                  <p className="mt-1">
                    {hotel.rating} / 5
                    <span className="text-yellow-400 ml-2">★</span>
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-4">Description</h2>
              <p className="text-gray-600 leading-relaxed">{hotel.description}</p>
            </div>
          </div>

          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">Amenities</h2>
            <div className="flex flex-wrap gap-2">
              {hotel.amenities.map((amenity, index) => (
                <span
                  key={index}
                  className="bg-blue-50 text-blue-600 px-4 py-2 rounded-full text-sm"
                >
                  {amenity}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-8 flex justify-end">
            <button
              onClick={() => console.log('Edit hotel details')}
              className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
            >
              Edit Details
            </button>
          </div>
        </div>
      )}

      {activeTab === 'rooms' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold">Room Types</h2>
            <button
              onClick={() => setIsRoomModalOpen(true)}
              className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
            >
              Add Room Type
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {hotel.rooms.map(room => (
              <div key={room.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="h-48 bg-gray-200">
                  {/* Room image will go here */}
                  <div className="w-full h-full flex items-center justify-center text-gray-500">
                    Room Image Placeholder
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-semibold">{room.type}</h3>
                      <p className="text-gray-600 text-sm mt-1">{room.description}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-blue-600">{formatPrice(room.price)}</p>
                      <p className="text-sm text-gray-500">per night</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                    <div>
                      <p className="text-gray-600">Room Size</p>
                      <p className="font-medium">{room.size}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Bed Type</p>
                      <p className="font-medium">{room.bedType}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Total Rooms</p>
                      <p className="font-medium">{room.quantity}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Available</p>
                      <p className="font-medium">{room.available}</p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-gray-600 text-sm mb-2">Amenities</p>
                    <div className="flex flex-wrap gap-1">
                      {room.amenities.map((amenity, index) => (
                        <span
                          key={index}
                          className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs"
                        >
                          {amenity}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end space-x-2 pt-4 border-t">
                    <button
                      onClick={() => handleEditRoom(room)}
                      className="text-blue-500 hover:text-blue-700"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteRoom(room.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <RoomEditModal
        room={editingRoom}
        isOpen={isRoomModalOpen}
        onClose={handleCloseRoomModal}
        onSave={handleSaveRoom}
      />
    </div>
  );
};

export default HotelManagementView;

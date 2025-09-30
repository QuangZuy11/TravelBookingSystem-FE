import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";

const RoomDetailView = () => {
  const { hotelId, roomId } = useParams();
  const [loading, setLoading] = useState(true);
  const [room, setRoom] = useState(null);

  useEffect(() => {
    const fetchRoomDetails = async () => {
      try {
        // TODO: Replace with API call
        const mockRoom = {
          id: roomId,
          type: "Executive Suite",
          description: "Luxury suite with separate living area and premium services",
          quantity: 10,
          price: 3500000,
          capacity: 4,
          size: "55m²",
          bedType: "1 King Bed + 1 Sofa Bed",
          amenities: [
            "King Bed",
            "Ocean View",
            "Living Room",
            "Jacuzzi",
            "Mini Bar",
            "Free WiFi",
            "Kitchen",
          ],
          features: {
            view: "Ocean View",
            bathroom: "En-suite bathroom with jacuzzi",
            entertainment: "55-inch Smart TV with Netflix",
            workspace: "Dedicated work desk with ergonomic chair",
            kitchen: "Fully equipped kitchenette",
            climate: "Individual climate control",
          },
        };
        setRoom(mockRoom);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching room:", error);
        setLoading(false);
      }
    };

    fetchRoomDetails();
  }, [roomId]);

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
        <div
          style={{
            animation: "spin 1s linear infinite",
            borderRadius: "50%",
            height: "32px",
            width: "32px",
            borderBottom: "2px solid #3b82f6",
          }}
        />
      </div>
    );
  }

  if (!room) {
    return <div style={{ padding: "24px" }}>Room not found</div>;
  }

  return (
    <div style={{ padding: "24px", maxWidth: "1000px", margin: "0 auto", color: "#000000" }}>
      <Link
        to={`/provider/hotels/${hotelId}/rooms`}
        style={{ display: "inline-flex", alignItems: "center", color: "#3b82f6", textDecoration: "none" }}
      >
        <svg style={{ width: "16px", height: "16px", marginRight: "8px" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back
      </Link>

      <h1 style={{ fontSize: "28px", fontWeight: "bold", marginTop: "16px", marginBottom: "16px" }}>
        {room.type}
      </h1>
      <p style={{ color: "#000000", marginBottom: "20px" }}>{room.description}</p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "24px" }}>
        <div>
          <strong>Size:</strong> {room.size}
        </div>
        <div>
          <strong>Bed Type:</strong> {room.bedType}
        </div>
        <div>
          <strong>Capacity:</strong> {room.capacity} guests
        </div>
        <div>
          <strong>Quantity:</strong> {room.quantity}
        </div>
        <div>
          <strong>Price:</strong> {room.price.toLocaleString()} VND / night
        </div>
      </div>

      <h3 style={{ fontSize: "20px", fontWeight: "600", marginBottom: "8px" }}>Features</h3>
      <ul style={{ marginBottom: "20px", paddingLeft: "20px" }}>
        {Object.entries(room.features).map(([key, value]) => (
          <li key={key}>
            <strong style={{ textTransform: "capitalize" }}>{key}:</strong> {value}
          </li>
        ))}
      </ul>

      <h3 style={{ fontSize: "20px", fontWeight: "600", marginBottom: "8px" }}>Amenities</h3>
      <ul style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", paddingLeft: "20px" }}>
        {room.amenities.map((a) => (
          <li key={a}>{a}</li>
        ))}
      </ul>

      <div style={{ marginTop: "24px" }}>
        <Link
          to={`/provider/hotels/${hotelId}/rooms/${room.id}/edit`}
          style={{
            padding: "10px 20px",
            backgroundColor: "#3b82f6",
            color: "white",
            borderRadius: "6px",
            textDecoration: "none",
          }}
        >
          Edit Room
        </Link>
      </div>
    </div>
  );
};

export default RoomDetailView;

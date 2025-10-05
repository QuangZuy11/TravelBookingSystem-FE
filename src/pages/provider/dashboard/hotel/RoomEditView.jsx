import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";

const RoomEditView = () => {
  const { hotelId, roomId } = useParams();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState(null);

  useEffect(() => {
    // Fake fetch API
    const mockRoom = {
      type: "Executive Suite",
      description: "Luxury suite with separate living area and premium services",
      quantity: 10,
      price: 3500000,
      capacity: 4,
      size: "55m²",
      bedType: "1 King Bed + 1 Sofa Bed",
      amenities: ["King Bed", "Ocean View", "Living Room", "Jacuzzi", "Free WiFi"],
      features: {
        view: "Ocean View",
        bathroom: "En-suite bathroom with jacuzzi",
        entertainment: "55-inch Smart TV with Netflix",
        workspace: "Dedicated work desk with ergonomic chair",
        kitchen: "Fully equipped kitchenette",
        climate: "Individual climate control",
      },
    };
    setFormData(mockRoom);
  }, [roomId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFeatureChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      features: { ...formData.features, [name]: value },
    });
  };

  const handleAmenityToggle = (amenity) => {
    setFormData((prev) => {
      const exists = prev.amenities.includes(amenity);
      return {
        ...prev,
        amenities: exists
          ? prev.amenities.filter((a) => a !== amenity)
          : [...prev.amenities, amenity],
      };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      alert("Room saved successfully!");
      navigate(`/provider/hotels/${hotelId}/rooms`);
    }, 1000);
  };

  if (!formData) return <p style={{ textAlign: "center", marginTop: "50px" }}>Loading...</p>;

  const inputStyle = {
    width: "100%",
    padding: "10px",
    borderRadius: "6px",
    border: "1px solid #ccc",
    marginTop: "5px",
    marginBottom: "15px",
    fontSize: "14px",
  };

  const labelStyle = {
    fontWeight: "500",
    color: "#000",
    display: "block",
    marginBottom: "4px",
  };

  return (
    <div style={{ padding: "20px", maxWidth: "900px", margin: "0 auto" }}>
      <Link to={`/provider/hotels/${hotelId}/rooms`} style={{ color: "#2563eb", textDecoration: "none" }}>
        ← Back
      </Link>
      <h1 style={{ fontSize: "24px", fontWeight: "bold", margin: "20px 0" }}>Edit Room</h1>

      <form
        onSubmit={handleSubmit}
        style={{
          background: "#fff",
          padding: "25px",
          borderRadius: "10px",
          boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
          color: "#000"
        }}
      >
        {/* Room Info */}
        <h2 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "10px" }}>Room Info</h2>
        <label style={labelStyle}>Room Type</label>
        <input
          type="text"
          name="type"
          value={formData.type}
          onChange={handleChange}
          style={inputStyle}
        />

        <label style={labelStyle}>Description</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows="3"
          style={{ ...inputStyle, resize: "vertical" }}
        />

        <div style={{ display: "flex", gap: "20px" }}>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Room Size</label>
            <input
              type="text"
              name="size"
              value={formData.size}
              onChange={handleChange}
              style={inputStyle}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Bed Type</label>
            <input
              type="text"
              name="bedType"
              value={formData.bedType}
              onChange={handleChange}
              style={inputStyle}
            />
          </div>
        </div>

        <div style={{ display: "flex", gap: "20px" }}>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Quantity</label>
            <input
              type="number"
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              style={inputStyle}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Capacity</label>
            <input
              type="number"
              name="capacity"
              value={formData.capacity}
              onChange={handleChange}
              style={inputStyle}
            />
          </div>
        </div>

        <label style={labelStyle}>Price per Night (VND)</label>
        <input
          type="number"
          name="price"
          value={formData.price}
          onChange={handleChange}
          style={inputStyle}
        />

        {/* Room Features */}
        <h2 style={{ fontSize: "18px", fontWeight: "600", margin: "20px 0 10px" }}>Room Features</h2>
        {Object.entries(formData.features).map(([key, value]) => (
          <div key={key}>
            <label style={labelStyle}>{key.charAt(0).toUpperCase() + key.slice(1)}</label>
            <input
              type="text"
              name={key}
              value={value}
              onChange={handleFeatureChange}
              style={inputStyle}
            />
          </div>
        ))}

        {/* Amenities */}
        <h2 style={{ fontSize: "18px", fontWeight: "600", margin: "20px 0 10px" }}>Amenities</h2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
          {["King Bed", "Ocean View", "Living Room", "Jacuzzi", "Mini Bar", "Free WiFi", "Kitchen"].map(
            (amenity) => (
              <label key={amenity} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <input
                  type="checkbox"
                  checked={formData.amenities.includes(amenity)}
                  onChange={() => handleAmenityToggle(amenity)}
                />
                {amenity}
              </label>
            )
          )}
        </div>

        {/* Actions */}
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "30px", gap: "10px" }}>
          <button
            type="button"
            onClick={() => navigate(`/provider/hotels/${hotelId}/rooms`)}
            style={{
              padding: "10px 16px",
              borderRadius: "6px",
              border: "1px solid #ccc",
              background: "#f9f9f9",
              color: "#000",
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            style={{
              padding: "10px 16px",
              borderRadius: "6px",
              background: saving ? "#93c5fd" : "#2563eb",
              color: "white",
              border: "none",
              cursor: "pointer",
            }}
          >
            {saving ? "Saving..." : "Save Room"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default RoomEditView;

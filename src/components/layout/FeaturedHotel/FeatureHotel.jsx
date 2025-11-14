import React, { useEffect, useState } from "react";
import "./FeatureHotel.css";
import "../../../../src/pages/traveler/components/BookTour/TourCard.css";
import { MapPin, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { getProxiedGoogleDriveUrl } from "../../../utils/googleDriveImageHelper";
import {
  calculateDiscountedPrice,
  formatPromotionDiscount,
} from "../../../utils/promotionHelpers";
import { Rating } from "@mui/material";

// Amenities icons mapping (same as HotelResult.jsx)
import {
  Wifi as WifiIcon,
  DirectionsCar as ParkingIcon,
  Pool as PoolIcon,
  FitnessCenter as GymIcon,
  Restaurant as RestaurantIcon,
  Spa as SpaIcon,
  Liquor as BarIcon,
  Work as BusinessCenterIcon,
  FlightTakeoff as AirportShuttleIcon,
  AcUnit as AirConditioningIcon,
  LocalLaundryService as LaundryServiceIcon,
} from "@mui/icons-material";

const amenityIconMap = {
  Wifi: WifiIcon,
  "Bãi đậu xe": ParkingIcon,
  "Hồ bơi": PoolIcon,
  "Phòng gym": GymIcon,
  "Nhà hàng": RestaurantIcon,
  Spa: SpaIcon,
  "Quầy bar": BarIcon,
  "Trung tâm thương mại": BusinessCenterIcon,
  "Thang máy": BusinessCenterIcon,
  "Đưa đón sân bay": AirportShuttleIcon,
  "Điều hòa": AirConditioningIcon,
  "Dịch vụ giặt là": LaundryServiceIcon,
};

const formatPrice = (price) =>
  new Intl.NumberFormat("vi-VN").format(price) + " VNĐ";

export default function FeaturedHotel() {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);

  // Normalize hotel data (same logic as HotelResult.jsx)
  // Support both ad-booking format and regular hotel format
  const normalizeHotel = (h) => {
    // Handle ad-booking format (from /api/ad-bookings/active?type=hotel)
    // Ad-booking returns: { _id, id, type, name, address (object), city (string), description, amenities, images, rating, reviews_count, ... }
    const isAdBookingFormat = h.type === "hotel";

    // Location handling - support both formats
    let locationParts = [];
    if (isAdBookingFormat) {
      // Ad-booking format: address is an object { street, city, state, country }
      // Backend also provides city as separate field
      if (h.address && typeof h.address === "object") {
        locationParts = [
          h.address.street,
          h.address.state,
          h.address.city,
        ].filter(Boolean);
      }
      // Fallback to city field if address object doesn't have city
      if (locationParts.length === 0 && h.city) {
        locationParts = [h.city];
      }
    } else {
      // Regular format: address is an object
      locationParts = [
        h?.address?.street,
        h?.address?.state,
        h?.address?.city,
      ].filter(Boolean);
    }

    const stars = (() => {
      if (isAdBookingFormat) {
        // Ad-booking format might have rating as number of stars
        return typeof h.rating === "number" ? h.rating : 0;
      }
      const raw = String(h?.category || "").trim(); // '3_star'
      const n = Number(raw.split("_")[0]);
      return Number.isFinite(n) ? n : 0;
    })();

    // Backend đã chuẩn hóa amenities
    const rawAmenities = Array.isArray(h.amenities)
      ? h.amenities.map((a) => String(a))
      : [];
    const uniqueAmenities = [...new Set(rawAmenities)];

    // Promotion - use the one passed from fetchHotels (already fetched)
    const activePromotion = h.promotion || null;
    const discountPercent =
      activePromotion?.discountValue &&
      activePromotion?.discountType === "percent"
        ? activePromotion.discountValue
        : 0;

    // Get price - ad-booking format might not have priceRange
    let price = 0;
    if (h?.realPriceRange?.min) {
      price = h.realPriceRange.min;
    } else if (h?.priceRange?.min) {
      price = h.priceRange.min;
    } else if (h?.cheapestRoom?.price) {
      price = h.cheapestRoom.price;
    }

    // Get bookingsCount (may be from model field or calculated)
    const bookingsCount =
      typeof h.bookingsCount === "number"
        ? h.bookingsCount
        : typeof h.reviews_count === "number"
        ? h.reviews_count
        : 0;

    // Image handling
    let imageUrl = "";
    if (isAdBookingFormat) {
      // Ad-booking format: images is an array
      imageUrl =
        Array.isArray(h.images) && h.images[0]
          ? getProxiedGoogleDriveUrl(h.images[0])
          : "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&h=800&fit=crop";
    } else {
      imageUrl =
        Array.isArray(h.images) && h.images[0]
          ? getProxiedGoogleDriveUrl(h.images[0])
          : "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&h=800&fit=crop";
    }

    const normalized = {
      id: h._id || h.id,
      name: h.name || "Khách sạn",
      location: locationParts.join(", ") || "—",
      rating: stars, // FE rating = số sao (map từ category)
      reviews: bookingsCount, // số lượt book
      price: price,
      discount: discountPercent,
      promotion: activePromotion,
      freeCancel: false,
      image: imageUrl,
      amenities: uniqueAmenities,
      availableRooms: h?.availableRooms != null ? Number(h.availableRooms) : 0,
    };

    return normalized;
  };

  useEffect(() => {
    const fetchHotels = async () => {
      try {
        setLoading(true);
        // Fetch hotels from ad-bookings (chỉ hiển thị hotels được book quảng cáo)
        const res = await fetch(
          "http://localhost:3000/api/ad-bookings/active?type=hotel"
        );
        const hotelsData = await res.json();

        // Fetch promotions and price for all hotels
        const hotelsWithPromotions = await Promise.all(
          hotelsData.map(async (hotel) => {
            try {
              // Fetch active promotions for this hotel
              const promoRes = await fetch(
                `http://localhost:3000/api/traveler/promotions?targetType=hotel&targetId=${hotel._id}`
              );
              const promoData = await promoRes.json();

              // Get the first active promotion
              let activePromotion = null;
              if (
                promoData.success &&
                promoData.data &&
                promoData.data.length > 0
              ) {
                // Filter active promotions (check dates)
                const now = new Date();
                activePromotion = promoData.data.find((promo) => {
                  const startDate = new Date(promo.startDate);
                  const endDate = new Date(promo.endDate);
                  return (
                    now >= startDate &&
                    now <= endDate &&
                    promo.status === "active"
                  );
                });

                // If no active promotion found by date, use the first one
                if (!activePromotion && promoData.data[0].status === "active") {
                  activePromotion = promoData.data[0];
                }
              }

              // Fetch hotel detail to get price information
              let hotelWithPrice = { ...hotel };
              try {
                // Use hotel details endpoint that includes price information
                const hotelDetailRes = await fetch(
                  `http://localhost:3000/api/hotel/${hotel._id}/details`
                );
                const hotelDetailData = await hotelDetailRes.json();

                if (hotelDetailData.success && hotelDetailData.data) {
                  const hotelDetail =
                    hotelDetailData.data.hotel || hotelDetailData.data;
                  // Add price information from hotel detail
                  hotelWithPrice = {
                    ...hotelWithPrice,
                    realPriceRange: hotelDetail.realPriceRange,
                    priceRange: hotelDetail.priceRange,
                    cheapestRoom: hotelDetail.cheapestRoom,
                    availableRooms: hotelDetail.availableRooms,
                  };
                }
              } catch (priceError) {
                console.error(
                  `Error fetching price for hotel ${hotel._id}:`,
                  priceError
                );
                // Continue without price information
              }

              return {
                ...hotelWithPrice,
                promotion: activePromotion,
              };
            } catch (error) {
              console.error(
                `Error fetching promotions for hotel ${hotel._id}:`,
                error
              );
              return {
                ...hotel,
                promotion: null,
              };
            }
          })
        );

        // Normalize hotel data
        const normalized = hotelsWithPromotions.map(normalizeHotel);
        setHotels(normalized);
      } catch (error) {
        console.error("Lỗi khi tải danh sách khách sạn:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchHotels();
  }, []);

  return (
    <div className="featured-hotels-wrapper">
      <div className="featured-hotels-container">
        {/* Header */}
        <div className="featured-hotels-header">
          <h2>Khách sạn Nổi Bật</h2>
          <p>
            Khám phá những khách sạn tuyệt vời nhất Việt Nam với dịch vụ chất
            lượng cao
          </p>
        </div>

        {/* Hotel Grid */}
        <div className="featured-hotels-grid">
          {loading ? (
            <p className="no-data">Đang tải dữ liệu...</p>
          ) : hotels.length === 0 ? (
            <p className="no-data">Không có khách sạn nổi bật</p>
          ) : (
            hotels.map((hotel) => {
              // Calculate discounted price
              const discountPrice = calculateDiscountedPrice(
                hotel.price,
                hotel.promotion
              );

              // Availability status
              const rooms = Number(hotel?.availableRooms) || 0;
              const isNone = rooms <= 0;
              const isLow = rooms > 0 && rooms <= 3;
              const availabilityText = isNone
                ? "Tạm hết phòng"
                : isLow
                ? `Chỉ còn ${rooms} phòng`
                : `Còn ${rooms} phòng trống`;

              return (
                <div key={hotel.id || hotel._id} className="tour-card">
                  <div
                    className="tour-image-container"
                    style={{ position: "relative" }}
                  >
                    <img
                      src={hotel.image}
                      alt={hotel.name}
                      className="tour-image"
                      onError={(e) => {
                        e.target.src =
                          "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&h=800&fit=crop";
                      }}
                    />

                    {/* Promotion badge */}
                    {hotel.promotion && (
                      <div
                        className="promotion-badge"
                        style={{
                          position: "absolute",
                          top: "12px",
                          left: "12px",
                          backgroundColor: "#dc2626",
                          color: "white",
                          padding: "4px 8px",
                          borderRadius: "6px",
                          fontSize: "0.75rem",
                          fontWeight: "700",
                          boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                          whiteSpace: "nowrap",
                          width: "fit-content",
                          display: "inline-block",
                        }}
                      >
                        {formatPromotionDiscount(hotel.promotion)}
                      </div>
                    )}

                    {/* Featured badge */}
                    <div
                      className="promotion-badge"
                      style={{
                        position: "absolute",
                        top: "12px",
                        right: "12px",
                        backgroundColor: "#2d6a4f",
                        color: "white",
                        padding: "4px 8px",
                        borderRadius: "6px",
                        fontSize: "0.75rem",
                        fontWeight: "700",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                        whiteSpace: "nowrap",
                        width: "fit-content",
                        display: "inline-block",
                      }}
                    >
                      Nổi bật
                    </div>
                  </div>

                  <div className="tour-info">
                    <h3 className="tour-name">
                      {hotel.name || "Khách sạn chưa đặt tên"}
                    </h3>

                    <div className="tour-meta">
                      <div className="tour-destination">
                        <MapPin size={16} />
                        <span>{hotel.location}</span>
                      </div>
                    </div>

                    {/* Rating and Reviews */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        marginTop: "8px",
                      }}
                    >
                      <Rating
                        value={hotel.rating}
                        readOnly
                        size="small"
                        precision={0.5}
                      />
                      <span style={{ fontSize: "14px", color: "#666" }}>
                        ({hotel.reviews} lượt book)
                      </span>
                    </div>

                    {/* Amenities */}
                    {hotel.amenities && hotel.amenities.length > 0 && (
                      <div
                        style={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: "6px",
                          marginTop: "12px",
                          marginBottom: "12px",
                        }}
                      >
                        {hotel.amenities.slice(0, 4).map((amenity, index) => {
                          const IconComponent = amenityIconMap[amenity];
                          return (
                            <span
                              key={index}
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "4px",
                                fontSize: "12px",
                                color: "#666",
                                backgroundColor: "#f3f4f6",
                                padding: "4px 8px",
                                borderRadius: "4px",
                              }}
                            >
                              {IconComponent ? (
                                <IconComponent sx={{ fontSize: "14px" }} />
                              ) : (
                                <Star size={14} />
                              )}
                              {amenity}
                            </span>
                          );
                        })}
                      </div>
                    )}

                    {/* Availability */}
                    {!isNone && (
                      <div
                        style={{
                          fontSize: "13px",
                          color: isLow ? "#f59e0b" : "#10b981",
                          fontWeight: "600",
                          marginBottom: "8px",
                        }}
                      >
                        {availabilityText}
                      </div>
                    )}

                    <div
                      className="tour-footer"
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginTop: "auto",
                        paddingTop: "12px",
                      }}
                    >
                      <div className="tour-price">
                        {hotel.price > 0 ? (
                          <>
                            {/* Hiển thị giá gốc bị gạch đi nếu có promotion */}
                            {hotel.promotion && (
                              <span
                                style={{
                                  textDecoration: "line-through",
                                  color: "#999",
                                  fontSize: "14px",
                                  marginRight: "8px",
                                }}
                              >
                                {formatPrice(hotel.price)}
                              </span>
                            )}
                            {/* Hiển thị giá sau giảm giá (hoặc giá gốc nếu không có promotion) */}
                            <span
                              style={{
                                color: "#2d6a4f",
                                fontWeight: "700",
                                fontSize: "18px",
                              }}
                            >
                              {formatPrice(discountPrice)}
                              <span
                                style={{
                                  fontSize: "12px",
                                  fontWeight: "400",
                                  marginLeft: "4px",
                                }}
                              >
                                /đêm
                              </span>
                            </span>
                          </>
                        ) : (
                          <span
                            style={{
                              color: "#2d6a4f",
                              fontWeight: "700",
                              fontSize: "18px",
                            }}
                          >
                            Liên hệ
                          </span>
                        )}
                      </div>
                      <Link
                        to={`/hotel-detail/${hotel.id || hotel._id}`}
                        className="btn-book"
                        style={{
                          backgroundColor: "#2d6a4f",
                          color: "white",
                          padding: "8px 16px",
                          borderRadius: "6px",
                          textDecoration: "none",
                          fontWeight: "600",
                          fontSize: "14px",
                          transition: "all 0.3s ease",
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.backgroundColor = "#1b4332";
                          e.target.style.transform = "translateY(-1px)";
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.backgroundColor = "#2d6a4f";
                          e.target.style.transform = "translateY(0)";
                        }}
                      >
                        Đặt Ngay
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="featured-hotels-view-all">
          <Link to="/hotel-list" className="featured-hotels-button">
            Xem Tất Cả Khách sạn
          </Link>
        </div>
      </div>
    </div>
  );
}

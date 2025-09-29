import React, { useState } from 'react';
import {
    Box,
    Container,
    Typography,
    Card,
    CardMedia,
    CardContent,
    Button,
    Rating,
    Chip,
    IconButton,
    Grid,
    Skeleton,
    Fade,
    Tooltip
} from '@mui/material';
import {
    LocationOn,
    Favorite,
    FavoriteBorder,
    Wifi,
    Pool,
    Restaurant,
    Spa,
    FitnessCenter,
    LocalParking,
    RoomService,
    BusinessCenter,
    Share,
    Visibility
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

// ✅ Container với CSS isolation
const HotelContainer = styled('section')(() => ({
    isolation: 'isolate',
    contain: 'style',
    fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
    fontSize: '16px',

    // Override MUI styles
    '& .MuiTypography-root': {
        fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif !important',
    },
    '& .MuiButton-root': {
        fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif !important',
        fontSize: '16px !important',
    },
    '& .MuiChip-root': {
        fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif !important',
    }
}));

// ✅ Custom Grid Container để đảm bảo 3 items/hàng
const HotelsGrid = styled(Box)(() => ({
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)', // ✅ Cố định 3 cột
    gap: '2rem',
    width: '100%',

    // Responsive breakpoints
    '@media (max-width: 1024px)': {
        gridTemplateColumns: 'repeat(2, 1fr)', // 2 cột trên tablet
    },
    '@media (max-width: 768px)': {
        gridTemplateColumns: '1fr', // 1 cột trên mobile
        gap: '1.5rem'
    }
}));

const StyledCard = styled(Card)(() => ({
    borderRadius: '16px',
    overflow: 'hidden',
    boxShadow: '0 8px 30px rgba(0, 0, 0, 0.08)',
    transition: 'all 0.3s ease',
    border: '1px solid #f1f3f4',
    height: '100%', // ✅ Chiều cao bằng nhau
    display: 'flex',
    flexDirection: 'column',
    minHeight: '480px', // ✅ Chiều cao tối thiểu
    '&:hover': {
        transform: 'translateY(-8px)',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.12)',
    }
}));

const StyledCardMedia = styled('div')(() => ({
    position: 'relative',
    height: '240px', // ✅ Chiều cao cố định cho ảnh
    overflow: 'hidden',
    '& img': {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        transition: 'transform 0.3s ease',
    },
    '&:hover img': {
        transform: 'scale(1.05)'
    }
}));

const ImageOverlay = styled(Box)(() => ({
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(45deg, transparent 0%, rgba(0, 0, 0, 0.1) 100%)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: '16px'
}));

const ActionButton = styled(IconButton)(() => ({
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    backdropFilter: 'blur(10px)',
    width: '40px',
    height: '40px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    '&:hover': {
        backgroundColor: 'rgba(255, 255, 255, 1)',
        transform: 'scale(1.1)'
    },
    transition: 'all 0.3s ease'
}));

const PriceButton = styled(Button)(() => ({
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important',
    borderRadius: '8px !important',
    fontWeight: '600 !important',
    textTransform: 'none !important',
    transition: 'all 0.3s ease !important',
    width: '100%',
    '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: '0 8px 25px rgba(102, 126, 234, 0.3) !important'
    }
}));

const DiscountBadge = styled(Chip)(() => ({
    position: 'absolute',
    top: '16px',
    left: '16px',
    backgroundColor: '#ff4757 !important',
    color: 'white !important',
    fontWeight: '600 !important',
    fontSize: '12px !important',
    boxShadow: '0 2px 8px rgba(255, 71, 87, 0.3)'
}));

const FeatureChip = styled(Chip)(() => ({
    backgroundColor: '#e3f2fd !important',
    color: '#1565c0 !important',
    fontSize: '12px !important',
    fontWeight: '500 !important',
    margin: '2px !important',
    height: '24px !important', // ✅ Chiều cao cố định
    '&:hover': {
        backgroundColor: '#bbdefb !important'
    }
}));

// ✅ Content wrapper để đảm bảo kích thước đồng đều
const CardContentWrapper = styled(CardContent)(() => ({
    padding: '1.5rem !important',
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'column',
    height: '240px', // ✅ Chiều cao cố định cho content
    justifyContent: 'space-between'
}));

const HotelHighlight = ({ hotels = [], loading = false }) => {
    const [favorites, setFavorites] = useState(new Set());
    const [visibleCount, setVisibleCount] = useState(6); // 2 hàng × 3 items = 6

    // ✅ Default hotels data
    const defaultHotels = [
        {
            id: 1,
            name: 'Sunrise Hotel',
            image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80',
            rating: 4.9,
            location: 'Hà Nội',
            totalBookings: 350,
            price: 3200000,
            originalPrice: 4000000,
            currency: 'VNĐ',
            priceUnit: 'Đêm',
            discount: 20,
            features: ['WiFi miễn phí', 'Bể bơi', 'Spa'],
            amenities: [
                { icon: <Wifi />, name: 'WiFi' },
                { icon: <Pool />, name: 'Bể bơi' },
                { icon: <Spa />, name: 'Spa' },
                { icon: <Restaurant />, name: 'Nhà hàng' }
            ],
            isPopular: true
        },
        {
            id: 2,
            name: 'Blue Ocean Resort',
            image: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80',
            rating: 4.8,
            location: 'Đà Nẵng',
            totalBookings: 280,
            price: 2800000,
            originalPrice: 3500000,
            currency: 'VNĐ',
            priceUnit: 'Đêm',
            discount: 15,
            features: ['Bãi biển riêng', 'Phòng gym', 'Bar'],
            amenities: [
                { icon: <Pool />, name: 'Bãi biển' },
                { icon: <FitnessCenter />, name: 'Gym' },
                { icon: <Restaurant />, name: 'Bar' },
                { icon: <RoomService />, name: '24/7' }
            ],
            isPopular: false
        },
        {
            id: 3,
            name: 'Luxury Saigon',
            image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80',
            rating: 5.0,
            location: 'TP. Hồ Chí Minh',
            totalBookings: 420,
            price: 4500000,
            originalPrice: 5200000,
            currency: 'VNĐ',
            priceUnit: 'Đêm',
            discount: 13,
            features: ['Luxury suite', 'Rooftop bar', 'Spa premium'],
            amenities: [
                { icon: <Spa />, name: 'Spa' },
                { icon: <Restaurant />, name: 'Rooftop' },
                { icon: <BusinessCenter />, name: 'Business' },
                { icon: <LocalParking />, name: 'Parking' }
            ],
            isPopular: true
        },
        {
            id: 4,
            name: 'Mountain View Resort',
            image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80',
            rating: 4.7,
            location: 'Sapa',
            totalBookings: 195,
            price: 1800000,
            originalPrice: 2200000,
            currency: 'VNĐ',
            priceUnit: 'Đêm',
            discount: 18,
            features: ['View núi', 'Trekking tour', 'BBQ'],
            amenities: [
                { icon: <Wifi />, name: 'WiFi' },
                { icon: <Restaurant />, name: 'BBQ' },
                { icon: <FitnessCenter />, name: 'Trekking' },
                { icon: <RoomService />, name: 'Room service' }
            ],
            isPopular: false
        },
        {
            id: 5,
            name: 'Beach Paradise Hotel',
            image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80',
            rating: 4.6,
            location: 'Nha Trang',
            totalBookings: 320,
            price: 2500000,
            originalPrice: 3000000,
            currency: 'VNĐ',
            priceUnit: 'Đêm',
            discount: 17,
            features: ['Bãi biển', 'Water sports', 'Kids club'],
            amenities: [
                { icon: <Pool />, name: 'Beach' },
                { icon: <FitnessCenter />, name: 'Sports' },
                { icon: <Restaurant />, name: 'All-inclusive' },
                { icon: <Spa />, name: 'Kids club' }
            ],
            isPopular: true
        },
        {
            id: 6,
            name: 'Heritage Boutique Hotel',
            image: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80',
            rating: 4.8,
            location: 'Hội An',
            totalBookings: 265,
            price: 2200000,
            originalPrice: 2800000,
            currency: 'VNĐ',
            priceUnit: 'Đêm',
            discount: 21,
            features: ['Phố cổ', 'Bicycle rental', 'Cooking class'],
            amenities: [
                { icon: <Wifi />, name: 'WiFi' },
                { icon: <Restaurant />, name: 'Cooking' },
                { icon: <BusinessCenter />, name: 'Culture' },
                { icon: <RoomService />, name: 'Concierge' }
            ],
            isPopular: false
        },
        {
            id: 7,
            name: 'Golden Bay Resort',
            image: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80',
            rating: 4.9,
            location: 'Phú Quốc',
            totalBookings: 385,
            price: 3800000,
            originalPrice: 4500000,
            currency: 'VNĐ',
            priceUnit: 'Đêm',
            discount: 16,
            features: ['All-inclusive', 'Water villa', 'Sunset bar'],
            amenities: [
                { icon: <Pool />, name: 'Water villa' },
                { icon: <Restaurant />, name: 'All-inclusive' },
                { icon: <Spa />, name: 'Spa' },
                { icon: <FitnessCenter />, name: 'Diving' }
            ],
            isPopular: true
        },
        {
            id: 8,
            name: 'City Central Hotel',
            image: 'https://images.unsplash.com/photo-1445019980597-93fa8acb246c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80',
            rating: 4.5,
            location: 'Hà Nội',
            totalBookings: 290,
            price: 1500000,
            originalPrice: 1800000,
            currency: 'VNĐ',
            priceUnit: 'Đêm',
            discount: 17,
            features: ['Trung tâm', 'Rooftop pool', 'Meeting rooms'],
            amenities: [
                { icon: <Wifi />, name: 'WiFi' },
                { icon: <Pool />, name: 'Rooftop pool' },
                { icon: <BusinessCenter />, name: 'Business' },
                { icon: <LocalParking />, name: 'Shuttle' }
            ],
            isPopular: false
        },
        {
            id: 9,
            name: 'Eco Lodge Retreat',
            image: 'https://images.unsplash.com/photo-1587985064135-0366536eab42?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80',
            rating: 4.7,
            location: 'Đà Lạt',
            totalBookings: 155,
            price: 2100000,
            originalPrice: 2600000,
            currency: 'VNĐ',
            priceUnit: 'Đêm',
            discount: 19,
            features: ['Eco-friendly', 'Garden view', 'Organic food'],
            amenities: [
                { icon: <Spa />, name: 'Yoga' },
                { icon: <Restaurant />, name: 'Organic' },
                { icon: <Wifi />, name: 'WiFi' },
                { icon: <FitnessCenter />, name: 'Garden' }
            ],
            isPopular: false
        }
    ];

    const hotelData = hotels.length > 0 ? hotels : defaultHotels;

    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN').format(price);
    };

    const toggleFavorite = (hotelId) => {
        setFavorites(prev => {
            const newFavorites = new Set(prev);
            if (newFavorites.has(hotelId)) {
                newFavorites.delete(hotelId);
            } else {
                newFavorites.add(hotelId);
            }
            return newFavorites;
        });
    };

    const handleShare = (hotel) => {
        if (navigator.share) {
            navigator.share({
                title: hotel.name,
                text: `Khám phá ${hotel.name} tại ${hotel.location}`,
                url: window.location.href
            });
        } else {
            navigator.clipboard.writeText(window.location.href);
        }
    };

    const loadMore = () => {
        setVisibleCount(prev => prev + 3); // Load thêm 3 items (1 hàng)
    };

    const visibleHotels = hotelData.slice(0, visibleCount);

    if (loading) {
        return (
            <HotelContainer>
                <Box sx={{ py: 8, backgroundColor: '#f8f9fa' }}>
                    <Container maxWidth="lg">
                        <HotelsGrid>
                            {[...Array(6)].map((_, index) => (
                                <Card key={index} sx={{ borderRadius: '16px', minHeight: '480px' }}>
                                    <Skeleton variant="rectangular" height={240} />
                                    <CardContent sx={{ p: 3 }}>
                                        <Skeleton variant="text" width="80%" height={32} />
                                        <Skeleton variant="text" width="60%" height={24} />
                                        <Skeleton variant="text" width="40%" height={20} />
                                        <Box sx={{ mt: 2 }}>
                                            <Skeleton variant="rectangular" width="100%" height={40} />
                                        </Box>
                                    </CardContent>
                                </Card>
                            ))}
                        </HotelsGrid>
                    </Container>
                </Box>
            </HotelContainer>
        );
    }

    return (
        <HotelContainer>
            <Box sx={{ py: 8, backgroundColor: '#f8f9fa' }}>
                <Container maxWidth="lg">
                    {/* Section Header */}
                    <Fade in timeout={1000}>
                        <Box sx={{ textAlign: 'center', mb: 6 }}>
                            <Typography
                                variant="h3"
                                sx={{
                                    fontWeight: 'bold',
                                    mb: 2,
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    backgroundClip: 'text',
                                    fontSize: { xs: '2rem', md: '2.5rem' }
                                }}
                            >
                                Khách sạn nổi bật
                            </Typography>
                            <Typography
                                variant="h6"
                                sx={{
                                    color: '#6c757d',
                                    maxWidth: '600px',
                                    mx: 'auto',
                                    fontSize: '18px',
                                    mb: 3
                                }}
                            >
                                Những lựa chọn tuyệt vời được khách hàng yêu thích nhất
                            </Typography>

                            {/* Filter/Sort Options */}
                            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                                <Chip label="Tất cả" variant="filled" color="primary" />
                                <Chip label="Khách sạn 5⭐" variant="outlined" />
                                <Chip label="Resort" variant="outlined" />
                                <Chip label="Boutique" variant="outlined" />
                                <Chip label="Giá tốt nhất" variant="outlined" />
                            </Box>
                        </Box>
                    </Fade>

                    {/* ✅ Hotels Grid - Custom CSS Grid cho 3 items/hàng */}
                    <HotelsGrid>
                        {visibleHotels.map((hotel, index) => (
                            <Fade key={hotel.id} in timeout={1000 + index * 200}>
                                <StyledCard>
                                    <StyledCardMedia>
                                        <img src={hotel.image} alt={hotel.name} />

                                        {/* Discount Badge */}
                                        {hotel.discount && (
                                            <DiscountBadge label={`-${hotel.discount}%`} />
                                        )}

                                        {/* Popular Badge */}
                                        {hotel.isPopular && (
                                            <Chip
                                                label="🔥 Phổ biến"
                                                sx={{
                                                    position: 'absolute',
                                                    top: '16px',
                                                    right: '60px',
                                                    backgroundColor: '#4caf50 !important',
                                                    color: 'white !important',
                                                    fontWeight: '600 !important',
                                                    fontSize: '12px !important'
                                                }}
                                            />
                                        )}

                                        {/* Action Buttons Overlay */}
                                        <ImageOverlay>
                                            <Box sx={{ display: 'flex', gap: 1 }}>
                                                <Tooltip title="Xem chi tiết">
                                                    <ActionButton size="small">
                                                        <Visibility sx={{ fontSize: '18px' }} />
                                                    </ActionButton>
                                                </Tooltip>
                                            </Box>

                                            <Box sx={{ display: 'flex', gap: 1 }}>
                                                <Tooltip title="Chia sẻ">
                                                    <ActionButton
                                                        size="small"
                                                        onClick={() => handleShare(hotel)}
                                                    >
                                                        <Share sx={{ fontSize: '18px' }} />
                                                    </ActionButton>
                                                </Tooltip>

                                                <Tooltip title={favorites.has(hotel.id) ? "Bỏ yêu thích" : "Yêu thích"}>
                                                    <ActionButton
                                                        size="small"
                                                        onClick={() => toggleFavorite(hotel.id)}
                                                    >
                                                        {favorites.has(hotel.id) ? (
                                                            <Favorite sx={{ fontSize: '18px', color: '#ff4757' }} />
                                                        ) : (
                                                            <FavoriteBorder sx={{ fontSize: '18px' }} />
                                                        )}
                                                    </ActionButton>
                                                </Tooltip>
                                            </Box>
                                        </ImageOverlay>
                                    </StyledCardMedia>

                                    <CardContentWrapper>
                                        {/* ✅ Top Section */}
                                        <Box>
                                            {/* Hotel Header */}
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                                                <Typography
                                                    variant="h6"
                                                    sx={{
                                                        fontWeight: 'bold',
                                                        fontSize: '18px',
                                                        color: '#2c3e50',
                                                        flex: 1,
                                                        mr: 1,
                                                        lineHeight: 1.3,
                                                        // ✅ Text truncation cho title dài
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis',
                                                        whiteSpace: 'nowrap'
                                                    }}
                                                >
                                                    {hotel.name}
                                                </Typography>
                                                <Box sx={{ textAlign: 'right', minWidth: '80px' }}>
                                                    <Rating
                                                        value={hotel.rating}
                                                        precision={0.1}
                                                        size="small"
                                                        readOnly
                                                        sx={{
                                                            '& .MuiRating-icon': {
                                                                fontSize: '14px'
                                                            }
                                                        }}
                                                    />
                                                    <Typography sx={{ fontSize: '12px', color: '#6c757d', mt: 0.3 }}>
                                                        ({hotel.rating})
                                                    </Typography>
                                                </Box>
                                            </Box>

                                            {/* Location */}
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1.5 }}>
                                                <LocationOn sx={{ color: '#6c757d', fontSize: '14px' }} />
                                                <Typography sx={{
                                                    color: '#6c757d',
                                                    fontSize: '14px',
                                                    fontWeight: 500
                                                }}>
                                                    {hotel.location}
                                                </Typography>
                                            </Box>

                                            {/* Amenities */}
                                            <Box sx={{ mb: 1.5 }}>
                                                <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                                                    {hotel.amenities?.slice(0, 4).map((amenity, idx) => (
                                                        <Tooltip key={idx} title={amenity.name}>
                                                            <Box sx={{
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                p: 0.3,
                                                                borderRadius: '4px',
                                                                backgroundColor: '#f5f5f5',
                                                                minWidth: '28px',
                                                                justifyContent: 'center'
                                                            }}>
                                                                {React.cloneElement(amenity.icon, {
                                                                    sx: { fontSize: '12px', color: '#667eea' }
                                                                })}
                                                            </Box>
                                                        </Tooltip>
                                                    ))}
                                                </Box>
                                            </Box>

                                            {/* Features */}
                                            <Box sx={{ mb: 1 }}>
                                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.3 }}>
                                                    {hotel.features?.slice(0, 3).map((feature, idx) => (
                                                        <FeatureChip
                                                            key={idx}
                                                            label={feature}
                                                            size="small"
                                                        />
                                                    ))}
                                                </Box>
                                            </Box>

                                            {/* Bookings */}
                                            <Typography sx={{
                                                fontSize: '12px',
                                                color: '#28a745',
                                                fontWeight: 600,
                                                mb: 1
                                            }}>
                                                📖 {hotel.totalBookings} lượt đặt
                                            </Typography>
                                        </Box>

                                        {/* ✅ Bottom Section - Price & Button */}
                                        <Box sx={{ mt: 'auto' }}>
                                            {/* Price */}
                                            <Box sx={{ mb: 1.5 }}>
                                                <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mb: 0.5 }}>
                                                    <Typography
                                                        variant="h6"
                                                        sx={{
                                                            fontWeight: 'bold',
                                                            color: '#667eea',
                                                            fontSize: '18px'
                                                        }}
                                                    >
                                                        {formatPrice(hotel.price)} {hotel.currency}
                                                    </Typography>
                                                    {hotel.originalPrice && (
                                                        <Typography
                                                            variant="body2"
                                                            sx={{
                                                                textDecoration: 'line-through',
                                                                color: '#999',
                                                                fontSize: '12px'
                                                            }}
                                                        >
                                                            {formatPrice(hotel.originalPrice)}
                                                        </Typography>
                                                    )}
                                                </Box>
                                                <Typography
                                                    variant="body2"
                                                    sx={{
                                                        color: '#6c757d',
                                                        fontSize: '12px',
                                                        fontWeight: 500
                                                    }}
                                                >
                                                    /{hotel.priceUnit} • Đã bao gồm thuế
                                                </Typography>
                                            </Box>

                                            {/* Button */}
                                            <PriceButton variant="contained" size="large">
                                                Đặt ngay
                                            </PriceButton>
                                        </Box>
                                    </CardContentWrapper>
                                </StyledCard>
                            </Fade>
                        ))}
                    </HotelsGrid>

                    {/* ✅ Load More Button */}
                    {visibleCount < hotelData.length && (
                        <Fade in timeout={1000}>
                            <Box sx={{ textAlign: 'center', mt: 6 }}>
                                <Button
                                    variant="outlined"
                                    size="large"
                                    onClick={loadMore}
                                    sx={{
                                        borderColor: '#667eea',
                                        color: '#667eea',
                                        fontSize: '16px',
                                        fontWeight: 600,
                                        padding: '12px 48px',
                                        borderRadius: '25px',
                                        '&:hover': {
                                            backgroundColor: '#667eea',
                                            color: 'white',
                                            transform: 'translateY(-2px)',
                                            boxShadow: '0 8px 25px rgba(102, 126, 234, 0.3)'
                                        }
                                    }}
                                >
                                    Xem thêm ({Math.min(3, hotelData.length - visibleCount)} khách sạn)
                                </Button>
                            </Box>
                        </Fade>
                    )}

                    {/* ✅ Show total count */}
                    <Box sx={{ textAlign: 'center', mt: 4 }}>
                        <Typography sx={{
                            color: '#6c757d',
                            fontSize: '16px'
                        }}>
                            Hiển thị {visibleCount} trên {hotelData.length} khách sạn
                        </Typography>
                    </Box>
                </Container>
            </Box>
        </HotelContainer>
    );
};

export default HotelHighlight;
import React, { useState } from 'react';
import {
    Box,
    Container,
    Typography,
    Card,
    Rating,
    Tooltip,
    Fade,
    Skeleton,
} from '@mui/material';
import {
    LocationOn,
    Wifi,
    Pool,
    Restaurant,
    Spa,
    FitnessCenter,
    LocalParking,
    RoomService,
    BusinessCenter,
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';

// LƯU Ý: Không import COLORS/SPACING từ file styles để tránh vi phạm rule.
// Thay vào đó dùng theme hoặc literal màu.
import {
    HotelContainer,
    HotelsGrid,
    StyledCard,
    StyledCardMedia,
    ImageOverlay,
    DiscountBadge,
    PopularBadge,
    FeatureChip,
    CardContentWrapper,
    PriceButton,
} from './hotel-highlight.styles';

const HotelHighlight = ({ hotels = [], loading = false }) => {
    const theme = useTheme(); // Dùng theme cho màu nền, màu chữ…
    const [visibleCount] = useState(6);

    // Dữ liệu mẫu (giữ nguyên như bạn)
    const defaultHotels = [
        {
            id: 1,
            name: 'Sunrise Hotel',
            image:
                'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80',
            rating: 4.9,
            location: 'Hà Nội',
            totalBookings: 350,
            price: 3200000,
            originalPrice: 4000000,
            currency: 'VND',
            priceUnit: 'Đêm',
            discount: 20,
            features: ['WiFi miễn phí', 'Bể bơi', 'Spa'],
            amenities: [
                { icon: <Wifi />, name: 'WiFi' },
                { icon: <Pool />, name: 'Bể bơi' },
                { icon: <Spa />, name: 'Spa' },
                { icon: <Restaurant />, name: 'Nhà hàng' },
            ],
            isPopular: true,
        },
        {
            id: 2,
            name: 'Blue Ocean Resort',
            image:
                'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80',
            rating: 4.8,
            location: 'Đà Nẵng',
            totalBookings: 280,
            price: 2800000,
            originalPrice: 3500000,
            currency: 'VND',
            priceUnit: 'Đêm',
            discount: 15,
            features: ['Bãi biển riêng', 'Phòng gym', 'Bar'],
            amenities: [
                { icon: <Pool />, name: 'Bãi biển' },
                { icon: <FitnessCenter />, name: 'Gym' },
                { icon: <Restaurant />, name: 'Bar' },
                { icon: <RoomService />, name: '24/7' },
            ],
            isPopular: false,
        },
        {
            id: 3,
            name: 'Luxury Saigon',
            image:
                'https://images.unsplash.com/photo-1571896349842-33c89424de2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80',
            rating: 5.0,
            location: 'TP. Hồ Chí Minh',
            totalBookings: 420,
            price: 4500000,
            originalPrice: 5200000,
            currency: 'VND',
            priceUnit: 'Đêm',
            discount: 13,
            features: ['Luxury suite', 'Rooftop bar', 'Spa premium'],
            amenities: [
                { icon: <Spa />, name: 'Spa' },
                { icon: <Restaurant />, name: 'Rooftop' },
                { icon: <BusinessCenter />, name: 'Business' },
                { icon: <LocalParking />, name: 'Parking' },
            ],
            isPopular: true,
        },
    ];

    const hotelData = hotels.length > 0 ? hotels : defaultHotels;
    const visibleHotels = hotelData.slice(0, visibleCount);

    // Format tiền tệ VND 
    const formatCurrency = (value, currency = 'VND') =>
        new Intl.NumberFormat('vi-VN', { style: 'currency', currency }).format(value);

    if (loading) {
        return (
            <HotelContainer>
                {/* Dùng theme.palette.background.default hoặc grey[50] để có nền nhẹ */}
                <Box sx={{ py: 8, backgroundColor: theme.palette.background.default }}>
                    <Container maxWidth="lg">
                        <HotelsGrid>
                            {[...Array(6)].map((_, index) => (
                                <Card
                                    key={index}
                                    sx={{
                                        borderRadius: 2,
                                        minHeight: 500,
                                        border: `1px solid ${theme.palette.divider}`,
                                    }}
                                >
                                    <Box sx={{ width: '100%', aspectRatio: '16/9' }}>
                                        <Skeleton variant="rectangular" width="100%" height="100%" />
                                    </Box>
                                    <Box sx={{ p: 3 }}>
                                        <Skeleton variant="text" width="80%" height={32} />
                                        <Skeleton variant="text" width="60%" height={24} />
                                        <Skeleton variant="text" width="40%" height={20} />
                                        <Box sx={{ mt: 2 }}>
                                            <Skeleton variant="rectangular" width="100%" height={44} />
                                        </Box>
                                    </Box>
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
            <Box sx={{ py: 8, backgroundColor: theme.palette.background.default }}>
                <Container maxWidth="lg">
                    <Fade in timeout={800}>
                        <Box sx={{ textAlign: 'center', mb: 6 }}>
                            <Typography
                                variant="h3"
                                sx={{
                                    fontWeight: 'bold',
                                    mb: 2,
                                    background: 'linear-gradient(135deg, #023d3eff 0%, #03373aff 100%)',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    backgroundClip: 'text',
                                    fontSize: { xs: '2rem', md: '2.5rem' },
                                }}
                            >
                                Khách sạn nổi bật
                            </Typography>
                            <Typography
                                variant="h6"
                                sx={{
                                    color: theme.palette.text.secondary, // thay COLORS.textSecondary
                                    maxWidth: 600,
                                    mx: 'auto',
                                    fontSize: 18,
                                }}
                            >
                                Những lựa chọn tuyệt vời được khách hàng yêu thích nhất
                            </Typography>
                        </Box>
                    </Fade>

                    <HotelsGrid>
                        {visibleHotels.map((hotel, index) => (
                            <Fade key={hotel.id} in timeout={800 + index * 150}>
                                <StyledCard>
                                    <StyledCardMedia>
                                        <img src={hotel.image} alt={hotel.name} loading="lazy" />
                                        {!!hotel.discount && <DiscountBadge label={`-${hotel.discount}%`} />}
                                        {hotel.isPopular && <PopularBadge label="🔥 Phổ biến" />}
                                        <ImageOverlay />
                                    </StyledCardMedia>

                                    <CardContentWrapper>
                                        <Box>
                                            {/* Header: tên + rating */}
                                            <Box
                                                sx={{
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: { xs: 'flex-start', md: 'center' },
                                                    gap: 1.5,
                                                    mb: 1.5,
                                                }}
                                            >
                                                <Typography
                                                    variant="h6"
                                                    sx={{
                                                        fontWeight: 'bold',
                                                        fontSize: 18,
                                                        color: '#2c3e50', // thay COLORS.textPrimary
                                                        lineHeight: 1.3,
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis',
                                                        whiteSpace: 'nowrap',
                                                    }}
                                                    title={hotel.name}
                                                >
                                                    {hotel.name}
                                                </Typography>

                                                <Box sx={{ textAlign: 'right', minWidth: 84 }}>
                                                    <Rating
                                                        value={Number(hotel.rating) || 0}
                                                        precision={0.1}
                                                        size="small"
                                                        readOnly
                                                        sx={{ '& .MuiRating-icon': { fontSize: 16 } }}
                                                    />
                                                    <Typography sx={{ fontSize: 12, color: theme.palette.text.secondary, mt: 0.25 }}>
                                                        ({Number(hotel.rating)?.toFixed(1)})
                                                    </Typography>
                                                </Box>
                                            </Box>

                                            {/* Địa điểm */}
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1.25 }}>
                                                <LocationOn sx={{ color: theme.palette.text.secondary, fontSize: 16 }} />
                                                <Typography sx={{ color: theme.palette.text.secondary, fontSize: 14, fontWeight: 500 }}>
                                                    {hotel.location}
                                                </Typography>
                                            </Box>

                                            {/* Amenities */}
                                            <Box sx={{ mb: 1.25 }}>
                                                <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                                                    {hotel.amenities?.slice(0, 4).map((amenity, idx) => (
                                                        <Tooltip key={idx} title={amenity.name}>
                                                            <Box
                                                                sx={{
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    p: 0.5,
                                                                    borderRadius: '6px',
                                                                    backgroundColor: theme.palette.action.hover,
                                                                    minWidth: 28,
                                                                    justifyContent: 'center',
                                                                }}
                                                                aria-label={amenity.name}
                                                            >
                                                                {React.cloneElement(amenity.icon, {
                                                                    sx: { fontSize: 14, color: '#667eea' }, // accent
                                                                    role: 'img',
                                                                    'aria-hidden': false,
                                                                })}
                                                            </Box>
                                                        </Tooltip>
                                                    ))}
                                                </Box>
                                            </Box>

                                            {/* Features */}
                                            <Box sx={{ mb: 1 }}>
                                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                                    {hotel.features?.slice(0, 3).map((feature, idx) => (
                                                        <FeatureChip key={idx} label={feature} size="small" />
                                                    ))}
                                                </Box>
                                            </Box>

                                            {/* Lượt đặt */}
                                            {!!hotel.totalBookings && (
                                                <Typography sx={{ fontSize: 12, color: '#28a745', fontWeight: 600, mb: 1 }}>
                                                    📖 {hotel.totalBookings} lượt đặt
                                                </Typography>
                                            )}
                                        </Box>

                                        {/* Giá + Nút */}
                                        <Box sx={{ mt: 'auto' }}>
                                            <Box sx={{ mb: 1.25 }}>
                                                <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mb: 0.5, flexWrap: 'wrap' }}>
                                                    <Typography
                                                        variant="h6"
                                                        sx={{ fontWeight: 'bold', color: '#667eea', fontSize: 18 }}
                                                    >
                                                        {formatCurrency(hotel.price, hotel.currency || 'VND')}
                                                    </Typography>


                                                </Box>


                                            </Box>

                                            <PriceButton variant="contained" size="large">
                                                Đặt ngay
                                            </PriceButton>
                                        </Box>
                                    </CardContentWrapper>
                                </StyledCard>
                            </Fade>
                        ))}
                    </HotelsGrid>
                </Container>
            </Box>
        </HotelContainer>
    );
};

export default HotelHighlight;
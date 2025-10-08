import React, { useEffect, useMemo, useState } from 'react';
import {
    Box,
    Card,
    CardContent,
    CardMedia,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Button,
    Grid,
    Typography,
    Chip,
    Rating,
    Paper,
    Tooltip,
    Stack,
    Badge,
    Pagination,
    Skeleton,
} from '@mui/material';
import {
    Favorite as FavoriteIcon,
    FavoriteBorder as FavoriteBorderIcon,
    LocationOn as LocationOnIcon,
    Spa as SpaIcon,
    Pool as PoolIcon,
    FitnessCenter as GymIcon,
    Wifi as WifiIcon,
    LocalOffer as LocalOfferIcon,
    VerifiedUser as ShieldIcon,
    Star as StarIcon,
} from '@mui/icons-material';
import '../../Hotel/HotelList/HotelList.css';

const amenitiesData = [
    { label: 'Bể bơi', value: 'pool', icon: PoolIcon },
    { label: 'Spa', value: 'spa', icon: SpaIcon },
    { label: 'Phòng Gym', value: 'gym', icon: GymIcon },
    { label: 'Wifi miễn phí', value: 'wifi', icon: WifiIcon },
];

const amenityIconMap = {
    pool: PoolIcon,
    spa: SpaIcon,
    gym: GymIcon,
    wifi: WifiIcon,
};

const seedHotels = [
    {
        id: 1,
        name: 'Tên khách sạn',
        location: 'Vị trí',
        rating: 4,
        reviews: 200,
        price: 1000000,
        discount: 10,
        freeCancel: true,
        image:
            'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&h=800&fit=crop',
        amenities: ['pool', 'gym', 'wifi'],
    },
    {
        id: 2,
        name: 'Khách sạn cao cấp',
        location: 'Trung tâm',
        rating: 5,
        reviews: 450,
        price: 2500000,
        discount: 0,
        freeCancel: false,
        image:
            'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=1200&h=800&fit=crop',
        amenities: ['spa', 'wifi', 'pool'],
    },
    {
        id: 3,
        name: 'Resort biển xanh',
        location: 'Gần biển',
        rating: 4.5,
        reviews: 320,
        price: 1800000,
        discount: 15,
        freeCancel: true,
        image:
            'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1200&h=800&fit=crop',
        amenities: ['pool', 'gym', 'spa'],
    },
    {
        id: 4,
        name: 'Mountain View Lodge',
        location: 'Ngoại ô',
        rating: 4.2,
        reviews: 180,
        price: 1200000,
        discount: 5,
        freeCancel: false,
        image:
            'https://images.unsplash.com/photo-1528909514045-2fa4ac7a08ba?w=1200&h=800&fit=crop',
        amenities: ['wifi'],
    },
];

const formatPrice = (price) =>
    new Intl.NumberFormat('vi-VN').format(price) + ' VNĐ';

function HotelResult({
    priceRange = [0, 20000000],
    selectedAmenities = [],
    selectedRatings = [],
}) {
    const [hotels] = useState(seedHotels);
    const [favorites, setFavorites] = useState(new Set());
    const [page, setPage] = useState(1);
    const [perPage] = useState(5);
    const [sortBy, setSortBy] = useState('popular');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setLoading(true);
        const t = setTimeout(() => setLoading(false), 300);
        return () => clearTimeout(t);
    }, [priceRange, selectedAmenities, selectedRatings, sortBy, page]);

    const filtered = useMemo(() => {
        const [minP, maxP] = priceRange;
        return hotels.filter((h) => {
            const inPrice = h.price >= minP && h.price <= maxP;
            const inAmenity =
                selectedAmenities.length === 0 ||
                selectedAmenities.every((a) => h.amenities.includes(a));
            const inRating =
                selectedRatings.length === 0 ||
                selectedRatings.some((r) => Math.floor(h.rating) === r);
            return inPrice && inAmenity && inRating;
        });
    }, [hotels, priceRange, selectedAmenities, selectedRatings]);

    const sorted = useMemo(() => {
        const arr = [...filtered];
        switch (sortBy) {
            case 'priceAsc':
                arr.sort((a, b) => a.price - b.price);
                break;
            case 'priceDesc':
                arr.sort((a, b) => b.price - a.price);
                break;
            case 'rating':
                arr.sort((a, b) => b.rating - a.rating);
                break;
            default:
                arr.sort((a, b) => b.reviews - a.reviews);
        }
        return arr;
    }, [filtered, sortBy]);

    const total = sorted.length;
    const totalPages = Math.max(1, Math.ceil(total / perPage));
    const paginated = useMemo(() => {
        const start = (page - 1) * perPage;
        return sorted.slice(start, start + perPage);
    }, [sorted, page, perPage]);

    const toggleFavorite = (id) => {
        setFavorites((s) => {
            const n = new Set(s);
            if (n.has(id)) n.delete(id);
            else n.add(id);
            return n;
        });
    };

    const handleBook = (hotel) => {
        console.log(`Đặt: ${hotel.name}`);
    };

    return (
        <Box className="search-content">
            <Paper className="content-header" elevation={1}>
                <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    spacing={2}
                    justifyContent="space-between"
                    alignItems={{ xs: 'flex-start', sm: 'center' }}
                >
                    <Typography variant="h5" className="results-title">
                        Vị trí
                        <Typography component="span" color="text.secondary" fontSize="1rem" ml={1}>
                            {total} chỗ nghỉ
                        </Typography>
                    </Typography>

                    <Stack direction="row" spacing={2} alignItems="center">
                        <FormControl size="small" sx={{ minWidth: 170 }}>
                            <InputLabel>Xếp theo</InputLabel>
                            <Select
                                value={sortBy}
                                label="Xếp theo"
                                onChange={(e) => {
                                    setSortBy(e.target.value);
                                    setPage(1);
                                }}
                            >
                                <MenuItem value="popular">Phổ biến</MenuItem>
                                <MenuItem value="priceAsc">Giá thấp đến cao</MenuItem>
                                <MenuItem value="priceDesc">Giá cao đến thấp</MenuItem>
                                <MenuItem value="rating">Đánh giá cao</MenuItem>
                            </Select>
                        </FormControl>
                    </Stack>
                </Stack>
            </Paper>

            <Box className="hotels-list list">
                {loading
                    ? Array.from({ length: 3 }).map((_, i) => (
                        <Card key={`sk-${i}`} className="hotel-card hotel-card-list" elevation={2}>
                            <Grid container spacing={0}>
                                <Grid item xs={12} sm={4}>
                                    <Skeleton variant="rectangular" className="hotel-image" />
                                </Grid>
                                <Grid item xs={12} sm={8}>
                                    <CardContent>
                                        <Skeleton width="60%" />
                                        <Skeleton width="40%" />
                                        <Skeleton width="80%" />
                                        <Skeleton width="50%" />
                                    </CardContent>
                                </Grid>
                            </Grid>
                        </Card>
                    ))
                    : paginated.map((hotel) => (
                        <HotelCard
                            key={hotel.id}
                            hotel={hotel}
                            isFavorite={favorites.has(hotel.id)}
                            onToggleFavorite={() => toggleFavorite(hotel.id)}
                            onBook={() => handleBook(hotel)}
                        />
                    ))}
            </Box>

            {totalPages > 1 && (
                <Stack alignItems="center" mt={2}>
                    <Pagination
                        color="primary"
                        count={totalPages}
                        page={page}
                        onChange={(_, p) => setPage(p)}
                    />
                </Stack>
            )}
        </Box>
    );
}

function HotelCard({ hotel, isFavorite, onToggleFavorite, onBook }) {
    const discountPrice =
        hotel.discount > 0 ? Math.round(hotel.price * (1 - hotel.discount / 100)) : hotel.price;

    return (
        <Card className="hotel-card hotel-card-list" elevation={2}>
            <Grid container spacing={0} alignItems="stretch" className="hotel-card-grid" wrap="nowrap">
                {/* Cột ảnh */}
                <Grid item xs="auto" className="image-col">
                    <Box className="image-wrap list">
                        <Badge
                            color="error"
                            badgeContent={hotel.discount > 0 ? `-${hotel.discount}%` : null}
                            anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
                            className="discount-badge"
                        >
                            <CardMedia component="img" image={hotel.image} alt={hotel.name} className="hotel-image" />
                        </Badge>

                        <Tooltip title={isFavorite ? 'Bỏ yêu thích' : 'Thêm yêu thích'}>
                            <Button
                                className="favorite-btn"
                                color="error"
                                variant="contained"
                                onClick={onToggleFavorite}
                                size="small"
                            >
                                {isFavorite ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                            </Button>
                        </Tooltip>
                    </Box>
                </Grid>

                {/* Cột nội dung */}
                <Grid item xs className="info-col">
                    <CardContent className="hotel-content list">
                        <Box className="hotel-content-grid list">
                            {/* Thông tin */}
                            <Box className="hotel-info">
                                <Typography variant="h5" className="hotel-name">
                                    {hotel.name}
                                </Typography>

                                <Box display="flex" alignItems="center" gap={1} className="hotel-location">
                                    <LocationOnIcon color="action" fontSize="small" />
                                    <Typography variant="body2" color="text.secondary">
                                        {hotel.location}
                                    </Typography>
                                </Box>

                                <Box display="flex" alignItems="center" gap={1} className="hotel-rating">
                                    <Rating value={hotel.rating} readOnly size="small" precision={0.5} />

                                </Box>
                                <Typography variant="body2" color="text.secondary">
                                    {hotel.reviews} lượt book
                                </Typography>

                                <Box className="hotel-amenities">
                                    {hotel.amenities.map((a) => {
                                        const Icon = amenityIconMap[a] || StarIcon;
                                        const label = amenitiesData.find((x) => x.value === a)?.label || a.toUpperCase();
                                        return (
                                            <Tooltip title={label} key={a}>
                                                <Chip
                                                    icon={<Icon fontSize="small" />}
                                                    label={label}
                                                    size="small"
                                                    variant="outlined"
                                                    className="amenity-chip"
                                                />
                                            </Tooltip>
                                        );
                                    })}
                                    {hotel.freeCancel && (
                                        <Chip
                                            icon={<ShieldIcon fontSize="small" />}
                                            label="Miễn phí hủy"
                                            size="small"
                                            color="success"
                                            variant="outlined"
                                            className="amenity-chip"
                                        />
                                    )}
                                </Box>
                            </Box>

                            {/* Giá + CTA */}
                            <Stack className="booking-col" spacing={1} alignItems="flex-end">
                                <Box textAlign="right">
                                    {hotel.discount > 0 && (
                                        <Typography
                                            variant="body2"
                                            color="text.secondary"
                                            sx={{ textDecoration: 'line-through' }}
                                        >
                                            {formatPrice(hotel.price)}
                                        </Typography>
                                    )}
                                    <Typography variant="h4" className="price-amount">
                                        {formatPrice(discountPrice)}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        /đêm
                                    </Typography>
                                </Box>

                                <Stack direction="row" spacing={1} alignItems="center">
                                    {hotel.discount > 0 && (
                                        <Chip
                                            size="small"
                                            color="primary"
                                            icon={<LocalOfferIcon />}
                                            label="Ưu đãi hôm nay"
                                            variant="filled"
                                        />
                                    )}
                                </Stack>

                                <Button variant="contained" size="medium" className="book-button" onClick={onBook}>
                                    Đặt Ngay
                                </Button>
                            </Stack>
                        </Box>
                    </CardContent>
                </Grid>
            </Grid>
        </Card>
    );
}

export default HotelResult;
import React, { useEffect, useMemo, useState } from 'react';
import {
    Box,
    Card,
    CardContent,
    CardMedia,
    Slider,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    FormControlLabel,
    Checkbox,
    FormGroup,
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
    RestartAlt as RestartAltIcon,
} from '@mui/icons-material';
import '../HotelList/HotelList.css';

// Danh sách tiện nghi (để render checkbox + icon)
const amenitiesData = [
    { label: 'Bể bơi', value: 'pool', icon: PoolIcon },
    { label: 'Spa', value: 'spa', icon: SpaIcon },
    { label: 'Phòng Gym', value: 'gym', icon: GymIcon },
    { label: 'Wifi miễn phí', value: 'wifi', icon: WifiIcon },
];

// Dữ liệu mẫu (bạn có thể thay bằng dữ liệu từ API)
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

const amenityIconMap = {
    pool: PoolIcon,
    spa: SpaIcon,
    gym: GymIcon,
    wifi: WifiIcon,
};

function HotelList() {
    // State filter
    const [priceRange, setPriceRange] = useState([0, 49300000]);
    const [selectedAmenities, setSelectedAmenities] = useState([]);
    const [selectedRatings, setSelectedRatings] = useState([]); // [5,4,...]
    const [sortBy, setSortBy] = useState('popular'); // popular | priceAsc | priceDesc | rating

    // Data
    const [hotels] = useState(seedHotels);
    const [favorites, setFavorites] = useState(new Set());
    const [page, setPage] = useState(1);
    const [perPage] = useState(5);

    // UX loading
    const [loading, setLoading] = useState(false);

    // Mô phỏng loading khi đổi filter/sort/page
    useEffect(() => {
        setLoading(true);
        const t = setTimeout(() => setLoading(false), 300);
        return () => clearTimeout(t);
    }, [priceRange, selectedAmenities, selectedRatings, sortBy, page]);

    // Lọc theo giá, tiện nghi, đánh giá
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

    // Sắp xếp
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
                arr.sort((a, b) => b.reviews - a.reviews); // Phổ biến = nhiều reviews
        }
        return arr;
    }, [filtered, sortBy]);

    // Phân trang
    const total = sorted.length;
    const totalPages = Math.max(1, Math.ceil(total / perPage));
    const paginated = useMemo(() => {
        const start = (page - 1) * perPage;
        return sorted.slice(start, start + perPage);
    }, [sorted, page, perPage]);

    // Handlers
    const toggleAmenity = (value) => {
        setPage(1);
        setSelectedAmenities((prev) =>
            prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
        );
    };

    const toggleRating = (value) => {
        setPage(1);
        setSelectedRatings((prev) =>
            prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
        );
    };

    const clearAll = () => {
        setSelectedAmenities([]);
        setSelectedRatings([]);
        setPriceRange([0, 49300000]);
        setPage(1);
    };

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
        <Box className="hotel-search-container">
            <Grid container spacing={3} alignItems="start">
                {/* Sidebar bộ lọc */}
                <Grid item xs={12} sm={4} md={3} lg={2}>
                    <Box className="search-sidebar">
                        {/* Khoảng giá */}
                        <Paper className="filter-card" elevation={2}>
                            <CardContent>
                                <Stack direction="row" justifyContent="space-between" alignItems="center">
                                    <Typography variant="h6" className="filter-title">
                                        Khoảng giá
                                    </Typography>
                                    <Button
                                        size="small"
                                        color="inherit"
                                        startIcon={<RestartAltIcon />}
                                        onClick={() => setPriceRange([0, 49300000])}
                                    >
                                        Đặt lại
                                    </Button>
                                </Stack>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                    1 phòng, 1 đêm
                                </Typography>
                                <Slider
                                    value={priceRange}
                                    onChange={(e, val) => setPriceRange(val)}
                                    valueLabelDisplay="auto"
                                    min={0}
                                    max={49300000}
                                    step={100000}
                                    valueLabelFormat={formatPrice}
                                    className="price-slider"
                                />
                                <Grid container spacing={1} sx={{ mt: 1 }}>
                                    <Grid item xs={6}>
                                        <TextField
                                            value={priceRange[0].toLocaleString('vi-VN')}
                                            size="small"
                                            fullWidth
                                            InputProps={{ readOnly: true }}
                                        />
                                    </Grid>
                                    <Grid item xs={6}>
                                        <TextField
                                            value={priceRange[1].toLocaleString('vi-VN')}
                                            size="small"
                                            fullWidth
                                            InputProps={{ readOnly: true }}
                                        />
                                    </Grid>
                                </Grid>
                            </CardContent>
                        </Paper>

                        {/* Tiện nghi */}
                        <Paper className="filter-card" elevation={2}>
                            <CardContent>
                                <Typography variant="h6" className="filter-title">
                                    Tiện nghi
                                </Typography>
                                <FormGroup>
                                    {amenitiesData.map(({ label, value, icon: Icon }) => (
                                        <FormControlLabel
                                            key={value}
                                            control={
                                                <Checkbox
                                                    checked={selectedAmenities.includes(value)}
                                                    onChange={() => toggleAmenity(value)}
                                                />
                                            }
                                            label={
                                                <Box display="flex" alignItems="center" gap={1}>
                                                    {Icon && <Icon fontSize="small" />}
                                                    {label}
                                                </Box>
                                            }
                                        />
                                    ))}
                                </FormGroup>
                            </CardContent>
                        </Paper>

                        {/* Đánh giá */}
                        <Paper className="filter-card" elevation={2}>
                            <CardContent>
                                <Typography variant="h6" className="filter-title">
                                    Đánh giá
                                </Typography>
                                <Stack spacing={0.5}>
                                    {[5, 4, 3, 2, 1].map((r) => (
                                        <FormControlLabel
                                            key={r}
                                            control={
                                                <Checkbox
                                                    checked={selectedRatings.includes(r)}
                                                    onChange={() => toggleRating(r)}
                                                />
                                            }
                                            label={<Rating value={r} readOnly size="small" />}
                                        />
                                    ))}
                                </Stack>
                            </CardContent>
                        </Paper>

                        {(selectedAmenities.length > 0 ||
                            selectedRatings.length > 0 ||
                            priceRange[0] > 0 ||
                            priceRange[1] < 49300000) && (
                                <Button variant="outlined" color="primary" fullWidth onClick={clearAll}>
                                    Xóa tất cả bộ lọc
                                </Button>
                            )}
                    </Box>
                </Grid>

                {/* Vùng danh sách kết quả */}
                <Grid item xs={12} sm={8} md={9} lg={10}>
                    <Box className="search-content">
                        <Paper className="content-header" elevation={1}>
                            <Stack
                                direction={{ xs: 'column', sm: 'row' }}
                                spacing={2}
                                justifyContent="space-between"
                                alignItems={{ xs: 'flex-start', sm: 'center' }}
                            >
                                <Typography variant="h5" className="results-title">
                                    Kết quả
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

                        {/* Danh sách thẻ khách sạn - CHỈ LIST VIEW */}
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
                </Grid>
            </Grid>
        </Box>
    );
}

function HotelCard({ hotel, isFavorite, onToggleFavorite, onBook }) {
    const discountPrice =
        hotel.discount > 0 ? Math.round(hotel.price * (1 - hotel.discount / 100)) : hotel.price;

    return (
        <Card className="hotel-card hotel-card-list" elevation={2}>
            <Grid container spacing={0} alignItems="stretch" className="hotel-card-grid">
                {/* Cột ảnh (bên trái trong list) */}
                <Grid item xs={12} sm={4} className="image-col">
                    <Box className="image-wrap list">
                        <Badge
                            color="error"
                            badgeContent={hotel.discount > 0 ? `-${hotel.discount}%` : null}
                            anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
                            className="discount-badge"
                        >
                            <CardMedia component="img" image={hotel.image} alt={hotel.name} className="hotel-image" />
                        </Badge>

                        {/* Nút yêu thích overlay */}
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
                <Grid item xs={12} sm={8} className="info-col">
                    <CardContent className="hotel-content list">
                        <Box className="hotel-content-grid list">
                            {/* Cột trái: Thông tin khách sạn */}
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
                                    <Typography variant="body2" color="text.secondary">
                                        {hotel.reviews} lượt book
                                    </Typography>
                                </Box>

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

                            {/* Cột phải: Giá + CTA (cố định) */}
                            {/* CHANGED: thêm padding-right để số giá không sát/cắt mép phải */}
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
                                    <Typography variant="h5" className="price-amount">
                                        {formatPrice(discountPrice)}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
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

                                <Button variant="contained" size="large" className="book-button" onClick={onBook}>
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

export default HotelList;
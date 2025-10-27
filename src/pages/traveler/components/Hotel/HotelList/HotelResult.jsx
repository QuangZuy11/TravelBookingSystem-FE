import React, { useEffect, useMemo, useState, useEffect as ReactUseEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Card,
    CardContent,
    CardMedia,
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
    Alert,
} from '@mui/material';
import SmartImage from '../../../../../components/common/SmartImage';
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
    Liquor as BarIcon,
    BookmarkAdded,
    Hotel as BedIcon, // dùng cho badge phòng trống
    SearchOff, // NEW: empty state icon
    DirectionsCar as ParkingIcon,
    Restaurant as RestaurantIcon,
    RoomPreferences as RoomServiceIcon, // Thay RoomService bằng RoomPreferences
    Work as BusinessCenterIcon, // Thay Business bằng Work
    FlightTakeoff as AirportShuttleIcon,
    AcUnit as AirConditioningIcon,
    MeetingRoom as ConferenceRoomIcon,
    LocalLaundryService as LaundryServiceIcon
} from '@mui/icons-material';
import '../../Hotel/HotelList/HotelList.css';
import { getProxiedGoogleDriveUrl } from '../../../../../utils/googleDriveImageHelper';

const amenitiesData = [
    { label: 'Bể bơi', value: 'Pool', icon: PoolIcon },
    { label: 'Spa', value: 'Spa', icon: SpaIcon },
    { label: 'Phòng Gym', value: 'Gym', icon: GymIcon },
    { label: 'Wi-Fi', value: 'Wi-Fi', icon: WifiIcon },
    { label: 'Quầy bar', value: 'Bar', icon: BarIcon },
    { label: 'Chỗ đậu xe', value: 'Parking', icon: ParkingIcon },
    { label: 'Nhà hàng', value: 'Restaurant', icon: RestaurantIcon },
    { label: 'Dịch vụ phòng', value: 'Room Service', icon: RoomServiceIcon },
    { label: 'Trung tâm thương mại', value: 'Business Center', icon: BusinessCenterIcon },
    { label: 'Đưa đón sân bay', value: 'Airport Shuttle', icon: AirportShuttleIcon },
    { label: 'Điều hòa', value: 'Air Conditioning', icon: AirConditioningIcon },
    { label: 'Phòng hội nghị', value: 'Conference Room', icon: ConferenceRoomIcon },
    { label: 'Dịch vụ giặt ủi', value: 'Laundry Service', icon: LaundryServiceIcon },
];

const amenityIconMap = {
    // Lowercase versions (for consistency with old data)
    pool: PoolIcon,
    spa: SpaIcon,
    gym: GymIcon,
    wifi: WifiIcon,
    bar: BarIcon,
    parking: ParkingIcon,
    restaurant: RestaurantIcon,
    room_service: RoomServiceIcon,
    business_center: BusinessCenterIcon,
    airport_shuttle: AirportShuttleIcon,
    air_conditioning: AirConditioningIcon,
    conference_room: ConferenceRoomIcon,
    laundry_service: LaundryServiceIcon,

    // Backend format (Title Case with spaces)
    'Pool': PoolIcon,
    'Spa': SpaIcon,
    'Gym': GymIcon,
    'Wifi': WifiIcon,
    'Wi-Fi': WifiIcon, // Backend trả về Wi-Fi
    'Bar': BarIcon,
    'Parking': ParkingIcon,
    'Restaurant': RestaurantIcon,
    'Room Service': RoomServiceIcon,
    'Business Center': BusinessCenterIcon,
    'Airport Shuttle': AirportShuttleIcon,
    'Air Conditioning': AirConditioningIcon,
    'Conference Room': ConferenceRoomIcon,
    'Laundry Service': LaundryServiceIcon,
};

const formatPrice = (price) =>
    new Intl.NumberFormat('vi-VN').format(price) + ' VNĐ';

function HotelResult({
    // NEW: nhận tham số search từ parent (SearchSection)
    searchParams,
    priceRange = [0, 20000000],
    selectedAmenities = [],
    selectedRatings = [], // FE "rating" = số sao, map từ BE.category
}) {
    const navigate = useNavigate();
    const [hotels, setHotels] = useState([]);
    const [favorites, setFavorites] = useState(new Set());
    const [page, setPage] = useState(1);
    const [perPage] = useState(5);// Số khách sạn mỗi trang 
    const [sortBy, setSortBy] = useState('popular');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Chuẩn hóa dữ liệu từ BE về shape của UI
    const normalizeHotel = (h) => {
        const locationParts = [
            h?.address?.city,
            h?.address?.state,
        ].filter(Boolean);
        const stars = (() => {
            const raw = String(h?.category || '').trim(); // '3_star'
            const n = Number(raw.split('_')[0]);
            return Number.isFinite(n) ? n : 0;
        })();

        const normalized = {
            id: h._id,
            name: h.name || 'Khách sạn',
            location: locationParts.join(', ') || '—',
            rating: stars, // FE rating = số sao (map từ category)
            reviews: typeof h.bookingsCount === 'number' ? h.bookingsCount : 0, // dùng cho "Phổ biến"
            price: typeof h?.priceRange?.min === 'number' ? h.priceRange.min : 0,
            discount: 0, // chưa có trường discount ở BE
            freeCancel: false, // có thể map từ policies nếu có quy ước
            image: Array.isArray(h.images) && h.images[0]
                ? getProxiedGoogleDriveUrl(h.images[0])
                : 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&h=800&fit=crop',
            amenities: Array.isArray(h.amenities) ? h.amenities.map(a => String(a)) : [], // Giữ nguyên format từ backend
            availableRooms: h?.availableRooms != null ? Number(h.availableRooms) : 0, // map số phòng trống
        };

        // DEBUG: log từng khách sạn sau normalize
        // Lưu ý: có thể comment console này sau khi kiểm tra xong
        console.log('Normalized hotel:', {
            id: normalized.id,
            name: normalized.name,
            availableRooms_raw: h?.availableRooms,
            availableRooms: normalized.availableRooms
        });

        return normalized;
    };

    // NEW: Gọi API theo search + filter + sort (giữ nguyên các phần còn lại)
    useEffect(() => {
        let aborted = false;

        async function fetchHotels() {
            try {
                setLoading(true);
                setError(null);

                const params = new URLSearchParams();

                // Search params
                if (searchParams?.location) params.set('location', searchParams.location.trim());
                if (searchParams?.checkIn) params.set('checkIn', searchParams.checkIn);
                if (searchParams?.checkOut) params.set('checkOut', searchParams.checkOut);
                if (searchParams?.rooms) params.set('rooms', String(searchParams.rooms));
                const guests = (searchParams?.adults || 0) + (searchParams?.children || 0);
                if (guests) params.set('guests', String(guests));

                // Filter params
                if (Array.isArray(priceRange) && priceRange.length === 2) {
                    params.set('priceMin', String(priceRange[0]));
                    params.set('priceMax', String(priceRange[1]));
                }
                if (selectedAmenities.length) {
                    // Giữ nguyên format amenities từ frontend (Title Case)
                    params.set('amenities', selectedAmenities.join(','));
                }
                if (selectedRatings.length) {
                    params.set('category', selectedRatings.map(n => `${n}_star`).join(','));
                }

                // Sort mapping
                switch (sortBy) {
                    case 'priceAsc':
                        params.set('sortBy', 'price');
                        params.set('sortOrder', 'asc');
                        break;
                    case 'priceDesc':
                        params.set('sortBy', 'price');
                        params.set('sortOrder', 'desc');
                        break;
                    case 'popular':
                        params.set('sortBy', 'popularity');
                        params.set('sortOrder', 'desc');
                        break;
                    default:
                        params.set('sortBy', 'rating');
                        params.set('sortOrder', 'desc');
                }

                // Tải "gần như tất cả", phân trang cục bộ giữ nguyên
                params.set('page', '1');
                params.set('limit', '1000');

                const url = `http://localhost:3000/api/traveler/hotels/search?${params.toString()}`;
                console.log('Search URL:', url);

                const res = await fetch(url);
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const json = await res.json();

                // DEBUG: log raw từ API
                console.log('API hotels (raw):', (json?.data?.hotels || []).map(h => ({
                    id: h._id,
                    name: h.name,
                    availableRooms: h.availableRooms
                })));

                const rawHotels = json?.data?.hotels || [];
                const normalized = rawHotels.map(normalizeHotel);

                if (!aborted) {
                    setHotels(normalized);
                    setPage(1);
                    // DEBUG: sau set state
                    console.log('Hotels state set:', normalized.map(h => ({
                        id: h.id,
                        name: h.name,
                        availableRooms: h.availableRooms
                    })));
                }
            } catch (e) {
                if (!aborted) setError(e.message || 'Lỗi tải danh sách khách sạn');
            } finally {
                if (!aborted) setLoading(false);
            }
        }

        fetchHotels();
        return () => { aborted = true; };
        // Gọi lại khi search/filter/sort thay đổi
    }, [searchParams, priceRange, selectedAmenities, selectedRatings, sortBy]);

    // Lọc cục bộ theo price, amenities, "rating" (số sao)
    const filtered = useMemo(() => {
        const [minP, maxP] = priceRange;
        return hotels.filter((h) => {
            const inPrice = h.price >= minP && h.price <= maxP;
            const inAmenity =
                selectedAmenities.length === 0 ||
                selectedAmenities.every((a) => h.amenities.includes(a));
            const inStars =
                selectedRatings.length === 0 ||
                selectedRatings.some((r) => Number(h.rating) === Number(r));
            return inPrice && inAmenity && inStars;
        });
    }, [hotels, priceRange, selectedAmenities, selectedRatings]);

    // Sắp xếp cục bộ
    const sorted = useMemo(() => {
        const arr = [...filtered];
        switch (sortBy) {
            case 'priceAsc':
                arr.sort((a, b) => a.price - b.price);
                break;
            case 'priceDesc':
                arr.sort((a, b) => b.price - a.price);
                break;
            default:
                // "Phổ biến" = nhiều lượt book hơn
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
        console.log(`Điều hướng đến chi tiết: ${hotel.name}`);
        navigate(`/hotel-detail/${hotel.id}`);
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
                    <Typography variant="h6" className="results-title">
                        Đã tìm thấy
                        <Typography component="span" color="text.secondary" fontSize="1rem" ml={1}>
                            {loading ? 'Đang tải...' : `${total} chỗ nghỉ`}
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
                            </Select>
                        </FormControl>
                    </Stack>
                </Stack>
            </Paper>

            {error && (
                <Box mt={2}>
                    <Alert severity="error">Không tải được danh sách khách sạn: {error}</Alert>
                </Box>
            )}

            {/* NEW: Hiển thị khi không có kết quả */}
            {!loading && total === 0 ? (
                <Paper elevation={0} sx={{ p: 4, textAlign: 'center' }}>
                    <Stack alignItems="center" spacing={1}>
                        <SearchOff sx={{ fontSize: 56, color: 'text.disabled' }} />
                        <Typography variant="h6" sx={{ fontWeight: 700 }}>
                            Không tìm thấy chỗ nghỉ phù hợp
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Hãy thử thay đổi bộ lọc, điều chỉnh khoảng giá, hoặc chọn địa điểm/ngày khác.
                        </Typography>
                    </Stack>
                </Paper>
            ) : (
                <>
                    <Box className="hotels-list list">
                        {loading
                            ? Array.from({ length: 3 }).map((_, i) => (
                                <Card key={`sk-${i}`} className="hotel-card hotel-card-list" elevation={2}>
                                    <Grid container spacing={0}>
                                        <Grid item xs={12} sm={4}>
                                            <Skeleton variant="rectangular" className="hotel-result-image" />
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

                    {!loading && totalPages > 1 && (
                        <Stack alignItems="center" mt={2}>
                            <Pagination
                                color="primary"
                                count={totalPages}
                                page={page}
                                onChange={(_, p) => setPage(p)}
                            />
                        </Stack>
                    )}
                </>
            )}
        </Box>
    );
}

function HotelCard({ hotel, isFavorite, onToggleFavorite, onBook }) {
    const navigate = useNavigate();
    const discountPrice =
        hotel.discount > 0 ? Math.round(hotel.price * (1 - hotel.discount / 100)) : hotel.price;

    // DEBUG: Log khi hotel/availableRooms thay đổi
    ReactUseEffect(() => {
        console.log('HotelCard render:', { id: hotel?.id, name: hotel?.name, availableRooms: hotel?.availableRooms });
    }, [hotel?.id, hotel?.name, hotel?.availableRooms]);

    // Trạng thái số phòng trống (đẹp + chuyên nghiệp)
    const rooms = Number(hotel?.availableRooms) || 0;
    const isNone = rooms <= 0;
    const isLow = rooms > 0 && rooms <= 3;
    const availabilityText = isNone
        ? 'Tạm hết phòng'
        : isLow
            ? `Chỉ còn ${rooms} phòng`
            : `Còn ${rooms} phòng trống`;
    const availabilityClass = isNone ? 'error' : isLow ? 'warning' : 'success';

    // Handle click vào tên khách sạn hoặc ảnh
    const handleHotelClick = () => {
        navigate(`/hotel-detail/${hotel.id}`);
    };

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
                            className="hotel-result-badge"
                        >
                            <SmartImage
                                src={hotel.image}
                                alt={hotel.name}
                                className="hotel-result-image"
                                onClick={handleHotelClick}
                                style={{ cursor: 'pointer' }}
                            />
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
                                <Typography
                                    variant="h5"
                                    className="hotel-name"
                                    onClick={handleHotelClick}
                                    sx={{
                                        cursor: 'pointer',
                                        '&:hover': {
                                            color: '#1565c0',
                                            textDecoration: 'underline'
                                        }
                                    }}
                                >
                                    {hotel.name}
                                </Typography>

                                <Box display="flex" alignItems="center" gap={1} className="hotel-location">
                                    <LocationOnIcon color="action" fontSize="small" />
                                    <Typography variant="body2" color="text.secondary">
                                        {hotel.location}
                                    </Typography>
                                </Box>

                                <Box display="flex" alignItems="center" gap={1} className="hotel-rating">
                                    <Rating value={hotel.rating} readOnly size="small" precision={1} />
                                </Box>

                                <Typography variant="body2" color="text.secondary">
                                    <BookmarkAdded /> {hotel.reviews} lượt book
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

                                {/* Availability pill (đẹp + chuyên nghiệp) */}
                                <Box className={`availability-pill ${availabilityClass}`}>
                                    <span className="dot" />

                                    <span className="text">{availabilityText}</span>
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

                                <Button
                                    variant="contained"
                                    size="medium"
                                    className="book-button"
                                    onClick={onBook}
                                    disabled={rooms <= 0}
                                >
                                    {rooms <= 0 ? 'Hết phòng' : 'Đặt Ngay'}
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
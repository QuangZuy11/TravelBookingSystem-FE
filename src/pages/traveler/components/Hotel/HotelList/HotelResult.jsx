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
import { calculateDiscountedPrice, formatPromotionDiscount } from '../../../../../utils/promotionHelpers';

// 12 Amenities chuẩn từ Backend API
// Backend đã chuẩn hóa và luôn trả về format tiếng Việt này
const amenitiesData = [
    { label: 'Wifi', value: 'Wifi', icon: WifiIcon },
    { label: 'Bãi đậu xe', value: 'Bãi đậu xe', icon: ParkingIcon },
    { label: 'Hồ bơi', value: 'Hồ bơi', icon: PoolIcon },
    { label: 'Phòng gym', value: 'Phòng gym', icon: GymIcon },
    { label: 'Nhà hàng', value: 'Nhà hàng', icon: RestaurantIcon },
    { label: 'Spa', value: 'Spa', icon: SpaIcon },
    { label: 'Quầy bar', value: 'Quầy bar', icon: BarIcon },
    { label: 'Trung tâm thương mại', value: 'Trung tâm thương mại', icon: BusinessCenterIcon },
    { label: 'Thang máy', value: 'Thang máy', icon: BusinessCenterIcon },
    { label: 'Đưa đón sân bay', value: 'Đưa đón sân bay', icon: AirportShuttleIcon },
    { label: 'Điều hòa', value: 'Điều hòa', icon: AirConditioningIcon },
    { label: 'Dịch vụ giặt là', value: 'Dịch vụ giặt là', icon: LaundryServiceIcon },
];

// Icon mapping - Backend đã chuẩn hóa, giữ map này cho backward compatibility
const amenityIconMap = {
    // 12 amenities chuẩn
    'Wifi': WifiIcon,
    'Bãi đậu xe': ParkingIcon,
    'Hồ bơi': PoolIcon,
    'Phòng gym': GymIcon,
    'Nhà hàng': RestaurantIcon,
    'Spa': SpaIcon,
    'Quầy bar': BarIcon,
    'Trung tâm thương mại': BusinessCenterIcon,
    'Thang máy': BusinessCenterIcon,
    'Đưa đón sân bay': AirportShuttleIcon,
    'Điều hòa': AirConditioningIcon,
    'Dịch vụ giặt là': LaundryServiceIcon,

    // Legacy support (old data might still exist)
    'Wi-Fi': WifiIcon,
    'Pool': PoolIcon,
    'Gym': GymIcon,
    'Bar': BarIcon,
    'Parking': ParkingIcon,
    'Restaurant': RestaurantIcon,
    'Room Service': RoomServiceIcon,
    'Business Center': BusinessCenterIcon,
    'Airport Shuttle': AirportShuttleIcon,
    'Air Conditioning': AirConditioningIcon,
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
            h?.address?.street,
            h?.address?.state,
            h?.address?.city,
        ].filter(Boolean);
        const stars = (() => {
            const raw = String(h?.category || '').trim(); // '3_star'
            const n = Number(raw.split('_')[0]);
            return Number.isFinite(n) ? n : 0;
        })();

        // Backend đã chuẩn hóa amenities, chỉ cần lấy trực tiếp
        // 12 amenities chuẩn: 'Wifi', 'Bãi đậu xe', 'Hồ bơi', 'Phòng gym', 'Nhà hàng', 'Spa',
        // 'Quầy bar', 'Trung tâm thương mại', 'Thang máy', 'Đưa đón sân bay', 'Điều hòa', 'Dịch vụ giặt là'
        const rawAmenities = Array.isArray(h.amenities) ? h.amenities.map(a => String(a)) : [];

        // Remove duplicates (phòng trường hợp data cũ vẫn còn tồn tại)
        const uniqueAmenities = [...new Set(rawAmenities)];

        // Lấy promotion đầu tiên nếu có (active promotions from backend)
        const promotions = Array.isArray(h.promotions) ? h.promotions : [];
        const activePromotion = promotions.length > 0 ? promotions[0] : null;
        const discountPercent = activePromotion?.discountValue && activePromotion?.discountType === 'percent'
            ? activePromotion.discountValue
            : 0;

        const normalized = {
            id: h._id,
            name: h.name || 'Khách sạn',
            location: locationParts.join(', ') || '—',
            rating: stars, // FE rating = số sao (map từ category)
            reviews: typeof h.bookingsCount === 'number' ? h.bookingsCount : 0, // dùng cho "Phổ biến"
            price: typeof h?.priceRange?.min === 'number' ? h.priceRange.min : 0,
            discount: discountPercent, // Lấy từ promotions
            promotion: activePromotion, // Lưu toàn bộ promotion object
            freeCancel: false, // có thể map từ policies nếu có quy ước
            image: Array.isArray(h.images) && h.images[0]
                ? getProxiedGoogleDriveUrl(h.images[0])
                : 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&h=800&fit=crop',
            amenities: uniqueAmenities, // Đã normalize và loại bỏ duplicate
            availableRooms: h?.availableRooms != null ? Number(h.availableRooms) : 0, // map số phòng trống
        };

        // DEBUG: log từng khách sạn sau normalize
        // Lưu ý: có thể comment console này sau khi kiểm tra xong
        console.log('Normalized hotel:', {
            id: normalized.id,
            name: normalized.name,
            amenities_raw: rawAmenities,
            amenities_final: uniqueAmenities,
            promotion: normalized.promotion,
            discount: normalized.discount,
            availableRooms_raw: h?.availableRooms,
            availableRooms: normalized.availableRooms
        });

        return normalized;
    };

    // ============================================================================
    // USING REAL BACKEND PROMOTIONS DATA
    // ============================================================================
    // Backend already returns filtered active promotions, no need for mock data
    // ============================================================================

    // NEW: Gọi API theo search + filter + sort (giữ nguyên các phần còn lại)
    useEffect(() => {
        let aborted = false;

        async function fetchHotels() {
            try {
                setLoading(true);
                setError(null);

                const params = new URLSearchParams();

                // Search params - chỉ thêm nếu có giá trị
                if (searchParams?.location?.trim()) {
                    params.set('location', searchParams.location.trim());
                }
                if (searchParams?.checkIn) {
                    params.set('checkIn', searchParams.checkIn);
                }
                if (searchParams?.checkOut) {
                    params.set('checkOut', searchParams.checkOut);
                }
                const guests = (searchParams?.adults || 0) + (searchParams?.children || 0);
                if (guests > 0) {
                    params.set('guests', String(guests));
                }

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

                // ============================================================================
                // USING REAL BACKEND PROMOTIONS DATA - No mock data needed
                // ============================================================================

                if (!aborted) {
                    setHotels(normalized);
                    setPage(1);
                    // DEBUG: after set state
                    console.log('Hotels state set:', normalized.map(h => ({
                        id: h.id,
                        name: h.name,
                        promotion: h.promotion,
                        discount: h.discount,
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

    // Use the utility function for price calculation
    const discountPrice = calculateDiscountedPrice(hotel.price, hotel.promotion);

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
                    <Box className="image-wrap list" sx={{ position: 'relative' }}>
                        <Badge
                            color="error"
                            badgeContent={hotel.promotion ? formatPromotionDiscount(hotel.promotion) : null}
                            anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
                            className="hotel-result-badge"
                            sx={{
                                '& .MuiBadge-badge': {
                                    left: '20px', // Đẩy badge sang phải để tránh border radius và không bị che
                                    top: '12px',
                                }
                            }}
                        >
                            <SmartImage
                                src={hotel.image}
                                alt={hotel.name}
                                className="hotel-result-image"
                                onClick={handleHotelClick}
                                style={{ cursor: 'pointer' }}
                            />
                        </Badge>

                        {/* Mã giảm giá - góc trái dưới */}
                        {hotel.promotion && hotel.promotion.code && (
                            <Box
                                sx={{
                                    position: 'absolute',
                                    bottom: '8px',
                                    left: '8px',
                                    backgroundColor: '#10b981',
                                    color: 'white',
                                    padding: '4px 12px',
                                    borderRadius: '6px',
                                    fontSize: '0.75rem',
                                    fontWeight: '700',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    zIndex: 2
                                }}
                            >
                                <LocalOfferIcon sx={{ fontSize: '14px' }} />
                                {hotel.promotion.code}
                            </Box>
                        )}

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
                                    {hotel.promotion && (
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
                                    {hotel.promotion && (
                                        <Chip
                                            size="small"
                                            color="primary"
                                            icon={<LocalOfferIcon />}
                                            label={`Ưu đãi: ${hotel.promotion.name || 'Khuyến mãi'}`}
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
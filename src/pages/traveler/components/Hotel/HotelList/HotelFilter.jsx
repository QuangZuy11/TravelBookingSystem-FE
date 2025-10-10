import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
    Box,
    Paper,
    CardContent,
    Slider,
    TextField,
    Typography,
    FormGroup,
    FormControlLabel,
    Checkbox,
    Stack,
    Button,
    CircularProgress,
    Alert,
} from '@mui/material';
import {
    Spa as SpaIcon,
    Pool as PoolIcon,
    FitnessCenter as GymIcon,
    Wifi as WifiIcon,
    RestartAlt as RestartAltIcon,
} from '@mui/icons-material';
import '../HotelList/HotelList.css';

// Map icon & nhãn (đồng bộ với Hotel List)
const AMENITY_ICON_MAP = {
    pool: PoolIcon,
    spa: SpaIcon,
    gym: GymIcon,
    wifi: WifiIcon,
};

const AMENITY_LABEL_MAP = {
    pool: 'Bể bơi',
    spa: 'Spa',
    gym: 'Phòng Gym',
    wifi: 'Wifi',
};

// Cố định khoảng giá filter: 300.000 - 10.000.000
const DEFAULT_MIN = 300000;
const DEFAULT_MAX = 10000000;

// Chuẩn hóa format số, không có phần thập phân
const nf = new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 0 });
const formatPrice = (price) => nf.format(Number(price) || 0) + ' VNĐ';

// Hàm kẹp giá trị vào trong [min,max]
function clampRange([minVal, maxVal], min, max) {
    const lo = Math.max(min, Number(minVal) || 0);
    const hi = Math.min(max, Number(maxVal) || 0);
    return [Math.min(lo, hi), Math.max(lo, hi)];
}

function HotelFilter({
    priceRange,
    onChangePriceRange,
    selectedAmenities,
    onToggleAmenity,
    selectedRatings,
    onToggleRating,
    onClearAll,
}) {
    // Dùng bounds cố định 300k - 10M
    const [priceBounds, setPriceBounds] = useState({ min: DEFAULT_MIN, max: DEFAULT_MAX });
    const [loadingPrice, setLoadingPrice] = useState(false);
    const [errorPrice, setErrorPrice] = useState(null);

    const [amenities, setAmenities] = useState([]);
    const [loadingAmenities, setLoadingAmenities] = useState(false);
    const [errorAmenities, setErrorAmenities] = useState(null);

    // Cờ để chỉ init priceRange parent đúng 1 lần
    const didInitPriceFromBE = useRef(false);

    // Nếu trước đây bạn fetch price-range từ BE, ở đây ta ép về 300k - 10M
    useEffect(() => {
        let aborted = false;
        async function initPriceBounds() {
            try {
                setLoadingPrice(true);
                setErrorPrice(null);

                // Nếu vẫn muốn gọi BE, có thể giữ fetch ở đây. Nhưng ta sẽ ép min/max về DEFAULT_*.
                // const res = await fetch('http://localhost:3000/api/traveler/hotels/price-range');
                // if (!res.ok) throw new Error(`HTTP ${res.status}`);
                // await res.json();

                if (aborted) return;

                const min = DEFAULT_MIN;
                const max = DEFAULT_MAX;

                setPriceBounds({ min, max });

                if (!didInitPriceFromBE.current) {
                    onChangePriceRange([min, max]); // init parent đúng 1 lần
                    didInitPriceFromBE.current = true;
                } else {
                    const [curMin, curMax] = clampRange(priceRange, min, max);
                    if (curMin !== priceRange[0] || curMax !== priceRange[1]) {
                        onChangePriceRange([curMin, curMax]);
                    }
                }
            } catch (e) {
                if (!aborted) setErrorPrice(e.message || 'Lỗi thiết lập khoảng giá');
            } finally {
                if (!aborted) setLoadingPrice(false);
            }
        }
        initPriceBounds();
        return () => { aborted = true; };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // chỉ chạy khi mount

    // Amenities từ BE (không đổi API prop)
    useEffect(() => {
        let aborted = false;
        async function fetchAmenities() {
            try {
                setLoadingAmenities(true);
                setErrorAmenities(null);
                const res = await fetch('http://localhost:3000/api/traveler/hotels/amenities');
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const json = await res.json();
                const list = (json?.data || [])
                    .filter((x) => typeof x === 'string' && x.trim() !== '')
                    .map((x) => x.trim().toLowerCase());
                if (!aborted) setAmenities(list);
            } catch (e) {
                if (!aborted) setErrorAmenities(e.message || 'Lỗi tải tiện nghi');
            } finally {
                if (!aborted) setLoadingAmenities(false);
            }
        }
        fetchAmenities();
        return () => { aborted = true; };
    }, []);

    const amenityOptions = useMemo(() => {
        const unique = Array.from(new Set(amenities));
        const toLabel = (value) => AMENITY_LABEL_MAP[value] || value.charAt(0).toUpperCase() + value.slice(1);
        return unique
            .map((value) => ({
                value,
                label: toLabel(value),
                Icon: AMENITY_ICON_MAP[value] || null,
            }))
            .sort((a, b) => a.label.localeCompare(b.label, 'vi'));
    }, [amenities]);

    const sliderMin = priceBounds.min;
    const sliderMax = priceBounds.max;

    const showClearAll =
        selectedAmenities.length > 0 ||
        selectedRatings.length > 0 ||
        (Array.isArray(priceRange) &&
            (priceRange[0] > sliderMin || priceRange[1] < sliderMax));

    return (
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
                            onClick={() => onChangePriceRange([sliderMin, sliderMax])}
                            disabled={loadingPrice}
                        >
                            Đặt lại
                        </Button>
                    </Stack>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        1 phòng, 1 đêm
                    </Typography>

                    {errorPrice && (
                        <Alert severity="warning" sx={{ mb: 1 }}>
                            Không lấy được khoảng giá động. Chi tiết: {errorPrice}
                        </Alert>
                    )}

                    <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                        {loadingPrice && <CircularProgress size={18} />}
                    </Stack>

                    <Slider
                        value={priceRange}
                        onChange={(e, val) => {
                            const arr = Array.isArray(val) ? val : [sliderMin, sliderMax];
                            onChangePriceRange(clampRange(arr, sliderMin, sliderMax));
                        }}
                        valueLabelDisplay="auto"
                        min={sliderMin}
                        max={sliderMax}
                        step={100000}
                        valueLabelFormat={formatPrice}
                        className="price-slider"
                        disabled={loadingPrice}
                    />
                    <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                        <TextField
                            value={nf.format(priceRange[0] || 0)}
                            size="small"
                            fullWidth
                            InputProps={{ readOnly: true }}
                        />
                        <TextField
                            value={nf.format(priceRange[1] || 0)}
                            size="small"
                            fullWidth
                            InputProps={{ readOnly: true }}
                        />
                    </Stack>
                </CardContent>
            </Paper>

            {/* Tiện nghi */}
            <Paper className="filter-card" elevation={2}>
                <CardContent>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                        <Typography variant="h6" className="filter-title">
                            Tiện nghi
                        </Typography>
                        {loadingAmenities && <CircularProgress size={18} />}
                    </Stack>

                    {errorAmenities && (
                        <Alert severity="warning" sx={{ mb: 1 }}>
                            Không lấy được tiện nghi động. Chi tiết: {errorAmenities}
                        </Alert>
                    )}

                    <FormGroup>
                        {amenityOptions.length === 0 && !loadingAmenities && (
                            <Typography variant="body2" color="text.secondary">
                                Không có dữ liệu tiện nghi
                            </Typography>
                        )}
                        {amenityOptions.map(({ label, value, Icon }) => (
                            <FormControlLabel
                                key={value}
                                control={
                                    <Checkbox
                                        checked={selectedAmenities.includes(value)}
                                        onChange={() => onToggleAmenity(value)}
                                        disabled={loadingAmenities}
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

            {/* Tiêu chuẩn */}
            <Paper className="filter-card" elevation={2}>
                <CardContent>
                    <Typography variant="h6" className="filter-title">
                        Tiêu chuẩn
                    </Typography>
                    <Stack spacing={0.5}>
                        {[5, 4, 3, 2, 1].map((r) => (
                            <FormControlLabel
                                key={r}
                                control={
                                    <Checkbox
                                        checked={selectedRatings.includes(r)}
                                        onChange={() => onToggleRating(r)}
                                    />
                                }
                                label={<Typography variant="body2">{'★'.repeat(r)}</Typography>}
                            />
                        ))}
                    </Stack>
                </CardContent>
            </Paper>

            {showClearAll && (
                <Button variant="outlined" color="primary" fullWidth onClick={onClearAll}>
                    Xóa tất cả bộ lọc
                </Button>
            )}
        </Box>
    );
}

export default HotelFilter;
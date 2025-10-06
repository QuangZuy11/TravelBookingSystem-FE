import React from 'react';
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
} from '@mui/material';
import {
    Spa as SpaIcon,
    Pool as PoolIcon,
    FitnessCenter as GymIcon,
    Wifi as WifiIcon,
    RestartAlt as RestartAltIcon,
} from '@mui/icons-material';
import '../HotelList/HotelList.css';

const MAX_PRICE = 49300000;

const amenitiesData = [
    { label: 'Bể bơi', value: 'pool', icon: PoolIcon },
    { label: 'Spa', value: 'spa', icon: SpaIcon },
    { label: 'Phòng Gym', value: 'gym', icon: GymIcon },
    { label: 'Wifi miễn phí', value: 'wifi', icon: WifiIcon },
];

const formatPrice = (price) =>
    new Intl.NumberFormat('vi-VN').format(price) + ' VNĐ';

function HotelFilter({
    priceRange,
    onChangePriceRange,
    selectedAmenities,
    onToggleAmenity,
    selectedRatings,
    onToggleRating,
    onClearAll,
}) {
    const showClearAll =
        selectedAmenities.length > 0 ||
        selectedRatings.length > 0 ||
        priceRange[0] > 0 ||
        priceRange[1] < MAX_PRICE;

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
                            onClick={() => onChangePriceRange([0, MAX_PRICE])}
                        >
                            Đặt lại
                        </Button>
                    </Stack>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        1 phòng, 1 đêm
                    </Typography>
                    <Slider
                        value={priceRange}
                        onChange={(e, val) => onChangePriceRange(val)}
                        valueLabelDisplay="auto"
                        min={0}
                        max={MAX_PRICE}
                        step={100000}
                        valueLabelFormat={formatPrice}
                        className="price-slider"
                    />
                    <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                        <TextField
                            value={priceRange[0].toLocaleString('vi-VN')}
                            size="small"
                            fullWidth
                            InputProps={{ readOnly: true }}
                        />
                        <TextField
                            value={priceRange[1].toLocaleString('vi-VN')}
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
                                        onChange={() => onToggleAmenity(value)}
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
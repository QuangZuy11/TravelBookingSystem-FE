import React, { useState } from 'react';
import {
    Box,
    Container,
    Typography,
    InputAdornment,
    Popover,
    IconButton,
    Divider,
    Fade,
    Button
} from '@mui/material';
import {
    LocationOn,
    CalendarToday,
    Person,
    Search,
    Add,
    Remove,
    Refresh
} from '@mui/icons-material';

import {
    SearchContainer,
    StyledHeroSection,
    StyledSearchForm,
    StyledTextField,
    StyledButton,
    ClearButton,
    SingleRowGrid
} from './search-section.styles';
import { useNavigate } from 'react-router-dom'; // ADD: điều hướng

const SearchSection = ({ onSearch }) => {
    const [searchData, setSearchData] = useState({
        location: '',
        checkIn: '',
        checkOut: '',
        adults: 1,
        children: 0
    });

    const [anchorEl, setAnchorEl] = useState(null);
    const [errors, setErrors] = useState({});
    const navigate = useNavigate(); // ADD

    const handleInputChange = (field) => (event) => {
        setSearchData({
            ...searchData,
            [field]: event.target.value
        });

        if (errors[field]) {
            setErrors({
                ...errors,
                [field]: null
            });
        }
    };

    const handleGuestClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleGuestClose = () => {
        setAnchorEl(null);
    };

    const handleGuestChange = (type, operation) => {
        setSearchData(prev => {
            const newValue = operation === 'increase'
                ? prev[type] + 1
                : Math.max(type === 'children' ? 0 : 1, prev[type] - 1);
            return { ...prev, [type]: newValue };
        });
    };

    const handleClear = () => {
        // Reset local state
        setSearchData({
            location: '',
            checkIn: '',
            checkOut: '',
            adults: 1,
            children: 0
        });
        setErrors({});
        setAnchorEl(null);

        // NEW: báo cho parent reset HotelResult về trạng thái "chưa áp dụng search"
        onSearch?.(null);

        // NEW: điều hướng về /hotel-list
        navigate('/hotel-list');
    };

    const validateForm = () => {
        const newErrors = {};

        if (!searchData.location.trim()) {
            newErrors.location = 'Vui lòng nhập điểm đến';
        }

        if (!searchData.checkIn) {
            newErrors.checkIn = 'Vui lòng chọn ngày nhận phòng';
        }

        if (!searchData.checkOut) {
            newErrors.checkOut = 'Vui lòng chọn ngày trả phòng';
        }

        if (searchData.checkIn && searchData.checkOut) {
            const checkInDate = new Date(searchData.checkIn);
            const checkOutDate = new Date(searchData.checkOut);
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            if (checkInDate < today) {
                newErrors.checkIn = 'Ngày nhận phòng không thể là quá khứ';
            }

            if (checkOutDate <= checkInDate) {
                newErrors.checkOut = 'Ngày trả phòng phải sau ngày nhận phòng';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSearch = () => {
        if (validateForm()) {
            onSearch?.(searchData);
            console.log('Search data:', searchData);
        }
    };

    const formatGuestText = () => {
        const parts = [];
        if (searchData.adults > 0) parts.push(`${searchData.adults} người lớn`);
        if (searchData.children > 0) parts.push(`${searchData.children} trẻ nhỏ`);
        return parts.join(', ') || '0 người';
    };

    const open = Boolean(anchorEl);

    return (
        <SearchContainer>
            <StyledHeroSection>
                <Container maxWidth="xl">
                    <Fade in timeout={1000}>
                        <Box sx={{ textAlign: 'center', mb: 4 }}>
                            <Typography
                                variant="h2"
                                sx={{
                                    fontWeight: 'bold',
                                    mb: 2,
                                    fontSize: { xs: '2.5rem', md: '3.5rem' },
                                    textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
                                    color: 'white'
                                }}
                            >
                                Tìm Kiếm Khách Sạn Tốt Nhất
                            </Typography>
                            <Typography
                                variant="h3"
                                sx={{
                                    color: '#90EE90',
                                    fontWeight: 'bold',
                                    mb: 3,
                                    fontSize: { xs: '2rem', md: '3rem' },
                                    textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
                                }}
                            >
                                Cùng VietTravel
                            </Typography>
                        </Box>
                    </Fade>

                    <Fade in timeout={1500}>
                        <StyledSearchForm elevation={0}>
                            <SingleRowGrid>
                                <Box sx={{ flex: '2.5', minWidth: '200px' }}>
                                    <StyledTextField
                                        fullWidth
                                        label="VỊ TRÍ"
                                        placeholder="Nhập thành phố, địa điểm..."
                                        value={searchData.location}
                                        onChange={handleInputChange('location')}
                                        error={!!errors.location}
                                        helperText={errors.location}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <LocationOn sx={{ color: '#ff1744', fontSize: '20px' }} />
                                                </InputAdornment>
                                            ),
                                        }}
                                    />
                                </Box>

                                <Box sx={{ flex: '1.8', minWidth: '150px' }}>
                                    <StyledTextField
                                        fullWidth
                                        label="CHECK-IN"
                                        type="date"
                                        value={searchData.checkIn}
                                        onChange={handleInputChange('checkIn')}
                                        error={!!errors.checkIn}
                                        helperText={errors.checkIn}
                                        InputLabelProps={{ shrink: true }}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <CalendarToday sx={{ color: '#2196f3', fontSize: '20px' }} />
                                                </InputAdornment>
                                            ),
                                        }}
                                    />
                                </Box>

                                <Box sx={{ flex: '1.8', minWidth: '150px' }}>
                                    <StyledTextField
                                        fullWidth
                                        label="CHECK-OUT"
                                        type="date"
                                        value={searchData.checkOut}
                                        onChange={handleInputChange('checkOut')}
                                        error={!!errors.checkOut}
                                        helperText={errors.checkOut}
                                        InputLabelProps={{ shrink: true }}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <CalendarToday sx={{ color: '#2196f3', fontSize: '20px' }} />
                                                </InputAdornment>
                                            ),
                                        }}
                                    />
                                </Box>

                                <Box sx={{ flex: '2.2', minWidth: '180px' }}>
                                    <StyledTextField
                                        fullWidth
                                        label="SỐ NGƯỜI"
                                        value={formatGuestText()}
                                        onClick={handleGuestClick}
                                        InputProps={{
                                            readOnly: true,
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <Person sx={{ color: '#024032ff', fontSize: '20px' }} />
                                                </InputAdornment>
                                            ),
                                        }}
                                        sx={{ cursor: 'pointer' }}
                                    />
                                </Box>

                                <Box sx={{ flex: '0 0 auto', minWidth: '100px' }}>
                                    <ClearButton
                                        fullWidth
                                        variant="outlined"
                                        startIcon={<Refresh />}
                                        onClick={handleClear}
                                    >
                                        Xóa
                                    </ClearButton>
                                </Box>

                                <Box sx={{ flex: '0 0 auto', minWidth: '120px' }}>
                                    <StyledButton
                                        fullWidth
                                        variant="contained"
                                        startIcon={<Search />}
                                        onClick={handleSearch}
                                    >
                                        Tìm kiếm
                                    </StyledButton>
                                </Box>
                            </SingleRowGrid>
                        </StyledSearchForm>
                    </Fade>

                    <Popover
                        open={open}
                        anchorEl={anchorEl}
                        onClose={handleGuestClose}
                        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
                        PaperProps={{
                            sx: {
                                p: 3,
                                borderRadius: '12px',
                                mt: 1,
                                minWidth: '320px',
                                boxShadow: '0 10px 40px rgba(0, 0, 0, 0.15)'
                            }
                        }}
                    >
                        {[
                            { key: 'adults', label: 'Người lớn', subtitle: '13 tuổi trở lên', min: 1 },
                            { key: 'children', label: 'Trẻ em', subtitle: '2-12 tuổi', min: 0 }
                        ].map((item, index) => (
                            <Box key={item.key}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 2 }}>
                                    <Box>
                                        <Typography sx={{ fontSize: '16px', fontWeight: 600, color: '#2c3e50' }}>
                                            {item.label}
                                        </Typography>
                                        <Typography sx={{ fontSize: '14px', color: '#6c757d' }}>
                                            {item.subtitle}
                                        </Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <IconButton
                                            size="small"
                                            onClick={() => handleGuestChange(item.key, 'decrease')}
                                            disabled={searchData[item.key] <= item.min}
                                            sx={{
                                                border: '2px solid #032d27ff',
                                                color: '#032d27ff',
                                                width: '36px',
                                                height: '36px',
                                                '&:hover': {
                                                    backgroundColor: '#032d27ff',
                                                    color: 'white'
                                                },
                                                '&:disabled': {
                                                    borderColor: '#e0e0e0',
                                                    color: '#e0e0e0'
                                                }
                                            }}
                                        >
                                            <Remove fontSize="small" />
                                        </IconButton>
                                        <Typography sx={{ minWidth: '32px', textAlign: 'center', fontSize: '18px', fontWeight: 600, color: '#2c3e50' }}>
                                            {searchData[item.key]}
                                        </Typography>
                                        <IconButton
                                            size="small"
                                            onClick={() => handleGuestChange(item.key, 'increase')}
                                            sx={{
                                                border: '2px solid #032d27ff',
                                                color: '#032d27ff',
                                                width: '36px',
                                                height: '36px',
                                                '&:hover': {
                                                    backgroundColor: '#032d27ff',
                                                    color: 'white'
                                                }
                                            }}
                                        >
                                            <Add fontSize="small" />
                                        </IconButton>
                                    </Box>
                                </Box>
                                {index < 1 && <Divider sx={{ my: 1 }} />}
                            </Box>
                        ))}

                        <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid #f0f0f0', display: 'flex', gap: 2 }}>
                            <Button
                                variant="outlined"
                                onClick={handleClear}
                                sx={{
                                    flex: 1,
                                    borderColor: '#6c757d',
                                    color: '#6c757d',
                                    '&:hover': {
                                        borderColor: '#495057',
                                        backgroundColor: '#f8f9fa'
                                    }
                                }}
                            >
                                Đặt lại
                            </Button>
                            <Button
                                variant="contained"
                                onClick={handleGuestClose}
                                sx={{
                                    flex: 1,
                                    backgroundColor: '#032d27ff',
                                    '&:hover': {
                                        backgroundColor: '#043f36ff'
                                    }
                                }}
                            >
                                Xác nhận
                            </Button>
                        </Box>
                    </Popover>
                </Container>
            </StyledHeroSection>
        </SearchContainer>
    );
};

export default SearchSection;
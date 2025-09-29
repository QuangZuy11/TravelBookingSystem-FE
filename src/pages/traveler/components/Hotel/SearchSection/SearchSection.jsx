import React, { useState } from 'react';
import {
    Box,
    Container,
    Typography,
    TextField,
    Button,
    Paper,
    InputAdornment,
    Grid,
    Popover,
    IconButton,
    Divider,
    Fade,
    Chip
} from '@mui/material';
import {
    LocationOn,
    CalendarToday,
    Person,
    Search,
    Add,
    Remove,
    PlayArrow,
    TravelExplore,
    Star,
    Clear,
    Refresh
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

// ✅ Container với CSS isolation
const SearchContainer = styled('section')(() => ({
    isolation: 'isolate',
    contain: 'style',
    fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
    fontSize: '16px',

    // Override MUI styles chỉ trong component này
    '& .MuiTypography-root': {
        fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif !important',
    },
    '& .MuiButton-root': {
        fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif !important',
        fontSize: '16px !important',
    },
    '& .MuiTextField-root': {
        fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif !important',
    },
    '& .MuiInputBase-root': {
        fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif !important',
        fontSize: '36px !important',
    },
    '& .MuiInputLabel-root': {
        fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif !important',
        fontSize: '18px !important',
    },
    '& .MuiPopover-paper': {
        fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif !important',
    }
}));

const StyledHeroSection = styled(Box)(() => ({
    minHeight: '80vh',
    backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url('https://t4.ftcdn.net/jpg/08/15/78/47/360_F_815784772_RJWNG7S80zkl2j5SARZkHQ2GEX6rk8jw.jpg')`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundAttachment: 'fixed',
    display: 'flex',
    alignItems: 'center',
    position: 'relative',
    color: 'white',
    '@media (max-width: 768px)': {
        minHeight: '60vh',
        backgroundAttachment: 'scroll'
    }
}));

const StyledSearchForm = styled(Paper)(() => ({
    background: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(20px)',
    borderRadius: '16px',
    padding: '32px',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.1)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    marginTop: '2rem',
    transition: 'all 0.3s ease',
    maxWidth: '1400px', // ✅ Tăng width để chứa đủ 6 elements
    margin: '2rem auto 0',
    '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: '0 25px 70px rgba(0, 0, 0, 0.15)'
    }
}));

const StyledTextField = styled(TextField)(() => ({
    '& .MuiOutlinedInput-root': {
        backgroundColor: 'white',
        borderRadius: '12px',
        transition: 'all 0.3s ease',
        height: '56px', // ✅ Fixed height
        '& fieldset': {
            borderColor: '#e0e0e0',
            borderWidth: '2px'
        },
        '&:hover fieldset': {
            borderColor: '#032d27ff'
        },
        '&.Mui-focused fieldset': {
            borderColor: '#032d27ff',
            boxShadow: '0 0 0 3px rgba(3, 45, 39, 0.1)'
        }
    },
    '& .MuiInputLabel-root': {
        fontWeight: '600 !important',
        color: '#495057 !important',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        fontSize: '12px !important'
    },
    '& .MuiInputBase-input': {
        fontSize: '16px !important'
    },
    // ✅ Hide helper text to keep consistent height
    '& .MuiFormHelperText-root': {
        position: 'absolute',
        top: '100%',
        marginTop: '4px',
        marginLeft: 0
    }
}));

const StyledButton = styled(Button)(() => ({
    background: 'linear-gradient(135deg, #032d27ff 0%, #043f36ff 100%) !important',
    borderRadius: '12px !important',
    padding: '0 20px !important', // ✅ Remove vertical padding
    fontWeight: '600 !important',
    textTransform: 'none !important',
    boxShadow: '0 4px 15px rgba(3, 45, 39, 0.3) !important',
    transition: 'all 0.3s ease !important',
    height: '56px !important', // ✅ Fixed height same as inputs
    '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: '0 8px 25px rgba(3, 45, 39, 0.4) !important'
    }
}));

const ClearButton = styled(Button)(() => ({
    borderRadius: '12px !important',
    padding: '0 20px !important', // ✅ Remove vertical padding
    fontWeight: '600 !important',
    textTransform: 'none !important',
    transition: 'all 0.3s ease !important',
    height: '56px !important', // ✅ Fixed height same as inputs
    borderColor: '#6c757d !important',
    color: '#6c757d !important',
    '&:hover': {
        borderColor: '#495057 !important',
        backgroundColor: '#f8f9fa !important',
        transform: 'translateY(-2px)'
    }
}));

// ✅ Custom Grid Container để force single row
const SingleRowGrid = styled(Box)(() => ({
    display: 'flex',
    gap: '16px',
    alignItems: 'center',
    flexWrap: 'nowrap', // ✅ Không cho wrap
    '@media (max-width: 1200px)': {
        flexWrap: 'wrap',
        '& > *': {
            minWidth: 'calc(50% - 8px)'
        }
    },
    '@media (max-width: 768px)': {
        flexDirection: 'column',
        '& > *': {
            width: '100%',
            minWidth: '100%'
        }
    }
}));

const SearchSection = ({ onSearch }) => {
    const [searchData, setSearchData] = useState({
        location: '',
        checkIn: '',
        checkOut: '',
        adults: 2,
        children: 1,
        rooms: 1
    });

    const [anchorEl, setAnchorEl] = useState(null);
    const [errors, setErrors] = useState({});

    const handleInputChange = (field) => (event) => {
        setSearchData({
            ...searchData,
            [field]: event.target.value
        });

        // Clear error when user starts typing
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
            const newValue = operation === 'increase' ? prev[type] + 1 : Math.max(type === 'children' ? 0 : 1, prev[type] - 1);
            return {
                ...prev,
                [type]: newValue
            };
        });
    };

    // ✅ Clear function
    const handleClear = () => {
        setSearchData({
            location: '',
            checkIn: '',
            checkOut: '',
            adults: 2,
            children: 1,
            rooms: 1
        });
        setErrors({});
        setAnchorEl(null);
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
            if (onSearch) {
                onSearch(searchData);
            }
            console.log('Search data:', searchData);
        }
    };

    const formatGuestText = () => {
        const parts = [];
        if (searchData.adults > 0) parts.push(`${searchData.adults} người lớn`);
        if (searchData.children > 0) parts.push(`${searchData.children} trẻ nhỏ`);
        parts.push(`${searchData.rooms} phòng`);
        return parts.join(', ');
    };

    const open = Boolean(anchorEl);

    return (
        <SearchContainer>
            <StyledHeroSection>
                <Container maxWidth="xl"> {/* ✅ Sử dụng xl container */}
                    {/* Hero Content */}
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

                    {/* Search Form */}
                    <Fade in timeout={1500}>
                        <StyledSearchForm elevation={0}>
                            {/* ✅ Custom Flex Layout - Force single row */}
                            <SingleRowGrid>
                                {/* Location */}
                                <Box sx={{ flex: '2.5', minWidth: '200px' }}>
                                    <StyledTextField
                                        fullWidth
                                        label="VỊ TRÍ"
                                        placeholder="Nhập thành phố, khách sạn..."
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

                                {/* Check-in */}
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

                                {/* Check-out */}
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

                                {/* Guests & Rooms */}
                                <Box sx={{ flex: '2.2', minWidth: '180px' }}>
                                    <StyledTextField
                                        fullWidth
                                        label="KHÁCH & PHÒNG"
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

                                {/* ✅ Clear Button */}
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

                                {/* ✅ Search Button */}
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

                    {/* Guest Picker Popover */}
                    <Popover
                        open={open}
                        anchorEl={anchorEl}
                        onClose={handleGuestClose}
                        anchorOrigin={{
                            vertical: 'bottom',
                            horizontal: 'left',
                        }}
                        transformOrigin={{
                            vertical: 'top',
                            horizontal: 'left',
                        }}
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
                            { key: 'children', label: 'Trẻ em', subtitle: '2-12 tuổi', min: 0 },
                            { key: 'rooms', label: 'Phòng', subtitle: 'Số phòng cần đặt', min: 1 }
                        ].map((item, index) => (
                            <Box key={item.key}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 2 }}>
                                    <Box>
                                        <Typography sx={{
                                            fontSize: '16px',
                                            fontWeight: 600,
                                            color: '#2c3e50'
                                        }}>
                                            {item.label}
                                        </Typography>
                                        <Typography sx={{
                                            fontSize: '14px',
                                            color: '#6c757d'
                                        }}>
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
                                        <Typography sx={{
                                            minWidth: '32px',
                                            textAlign: 'center',
                                            fontSize: '18px',
                                            fontWeight: 600,
                                            color: '#2c3e50'
                                        }}>
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
                                {index < 2 && <Divider sx={{ my: 1 }} />}
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
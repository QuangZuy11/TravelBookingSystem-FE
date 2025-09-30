import { styled } from '@mui/material/styles';
import { Box, Paper, Button, TextField } from '@mui/material';

// Container với CSS isolation
export const SearchContainer = styled('section')(() => ({
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

export const StyledHeroSection = styled(Box)(() => ({
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

export const StyledSearchForm = styled(Paper)(() => ({
  background: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(20px)',
  borderRadius: '16px',
  padding: '32px',
  boxShadow: '0 20px 60px rgba(0, 0, 0, 0.1)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  transition: 'all 0.3s ease',
  maxWidth: '1400px',
  margin: '2rem auto 0',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 25px 70px rgba(0, 0, 0, 0.15)'
  }
}));

export const StyledTextField = styled(TextField)(() => ({
  '& .MuiOutlinedInput-root': {
    backgroundColor: 'white',
    borderRadius: '12px',
    transition: 'all 0.3s ease',
    height: '56px',
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
  // Hide helper text to keep consistent height
  '& .MuiFormHelperText-root': {
    position: 'absolute',
    top: '100%',
    marginTop: '4px',
    marginLeft: 0
  }
}));

export const StyledButton = styled(Button)(() => ({
  background: 'linear-gradient(135deg, #032d27ff 0%, #043f36ff 100%) !important',
  borderRadius: '12px !important',
  padding: '0 20px !important',
  fontWeight: '600 !important',
  textTransform: 'none !important',
  boxShadow: '0 4px 15px rgba(3, 45, 39, 0.3) !important',
  transition: 'all 0.3s ease !important',
  height: '56px !important',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 25px rgba(3, 45, 39, 0.4) !important'
  }
}));

export const ClearButton = styled(Button)(() => ({
  borderRadius: '12px !important',
  padding: '0 20px !important',
  fontWeight: '600 !important',
  textTransform: 'none !important',
  transition: 'all 0.3s ease !important',
  height: '56px !important',
  borderColor: '#6c757d !important',
  color: '#6c757d !important',
  '&:hover': {
    borderColor: '#495057 !important',
    backgroundColor: '#f8f9fa !important',
    transform: 'translateY(-2px)'
  }
}));

// Custom Grid Container để force single row
export const SingleRowGrid = styled(Box)(() => ({
  display: 'flex',
  gap: '16px',
  alignItems: 'center',
  flexWrap: 'nowrap',
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
import { styled } from '@mui/material/styles';
import { Box, Card, CardContent, Button, Chip } from '@mui/material';

/**
 * QUAN TRỌNG: Không export bất kỳ thứ gì ngoài COMPONENTS để không vi phạm
 * react-refresh/only-export-components. Vì vậy COLORS và SPACING là biến cục bộ (không export).
 */
const COLORS = {
    primaryStart: '#055727ff',
    primaryEnd: '#053e23ff',
    accent: '#667eea',
    success: '#4caf50',
    discount: '#ff4757',
    textPrimary: '#2c3e50',
    textSecondary: '#6c757d',
    price: '#667eea',
    bgCard: '#fff',
    border: '#f1f3f4',
};

const SPACING = {
    cardRadius: 16,
    mediaRadius: 16,
    gap: 16,
};

// Container có isolation để tránh ảnh hưởng global
export const HotelContainer = styled('section')(() => ({
    isolation: 'isolate',
    contain: 'style',
    fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
    fontSize: '16px',
    '& .MuiTypography-root, & .MuiButton-root, & .MuiChip-root': {
        fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif !important',
    },
}));

// Lưới 3 cột desktop, xuống 2/1 cột khi nhỏ
export const HotelsGrid = styled(Box)(() => ({
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '2rem',
    width: '100%',
    '@media (max-width: 1024px)': {
        gridTemplateColumns: 'repeat(2, 1fr)',
    },
    '@media (max-width: 768px)': {
        gridTemplateColumns: '1fr',
        gap: '1.5rem',
    },
}));

/**
 * Card:
 * - overflow: 'visible' để KHÔNG cắt nút và bóng đổ ở cạnh dưới.
 * - Bo góc và hover mượt.
 */
export const StyledCard = styled(Card)(() => ({
    borderRadius: `${SPACING.cardRadius}px`,
    backgroundColor: COLORS.bgCard,
    border: `1px solid ${COLORS.border}`,
    boxShadow: '0 8px 30px rgba(0, 0, 0, 0.08)',
    transition: 'all 0.3s ease',
    display: 'flex',
    flexDirection: 'column',
    minHeight: 500,
    overflow: 'visible',
    '&:hover': {
        transform: 'translateY(-8px)',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.12)',
    },
}));

/**
 * Ảnh dùng aspect-ratio để đồng nhất chiều cao, bo góc phía trên,
 * không cần overflow hidden ở Card.
 */
export const StyledCardMedia = styled('div')(() => ({
    position: 'relative',
    width: '100%',
    aspectRatio: '16 / 9',
    borderTopLeftRadius: `${SPACING.mediaRadius}px`,
    borderTopRightRadius: `${SPACING.mediaRadius}px`,
    overflow: 'hidden',
    '& img': {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        display: 'block',
        transition: 'transform 0.3s ease',
    },
    '&:hover img': {
        transform: 'scale(1.05)',
    },
}));

export const ImageOverlay = styled(Box)(() => ({
    position: 'absolute',
    inset: 0,
    background: 'linear-gradient(45deg, transparent 0%, rgba(0, 0, 0, 0.1) 100%)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 16,
    pointerEvents: 'none',
}));

export const DiscountBadge = styled(Chip)(() => ({
    position: 'absolute',
    top: 16,
    left: 16,
    backgroundColor: `${COLORS.discount} !important`,
    color: 'white !important',
    fontWeight: '600 !important',
    fontSize: '12px !important',
    boxShadow: '0 2px 8px rgba(255, 71, 87, 0.3)',
}));

export const PopularBadge = styled(Chip)(() => ({
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: `${COLORS.success} !important`,
    color: 'white !important',
    fontWeight: '600 !important',
    fontSize: '12px !important',
}));

export const FeatureChip = styled(Chip)(() => ({
    backgroundColor: '#e3f2fd !important',
    color: '#1565c0 !important',
    fontSize: '12px !important',
    fontWeight: '500 !important',
    margin: '2px !important',
    height: '24px !important',
    '&:hover': {
        backgroundColor: '#bbdefb !important',
    },
}));

/**
 * BỎ height cố định -> tránh tràn nội dung.
 * Dùng flexGrow + mt:'auto' ở block giá để nút “Đặt ngay” luôn dồn xuống đáy.
 */
export const CardContentWrapper = styled(CardContent)(() => ({
    padding: '1.5rem !important',
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1,
    minHeight: 240,
}));

export const PriceButton = styled(Button)(() => ({
    background: `linear-gradient(135deg, ${COLORS.primaryStart} 0%, ${COLORS.primaryEnd} 100%) !important`,
    borderRadius: '10px !important',
    fontWeight: '600 !important',
    textTransform: 'none !important',
    transition: 'all 0.25s ease !important',
    width: '100%',
    height: 48,
    boxShadow: '0 8px 20px rgba(102, 126, 234, 0.25) !important',
    '&:hover': {
        transform: 'translateY(-1.5px)',
        boxShadow: '0 12px 28px rgba(102, 126, 234, 0.35) !important',
    },
}));
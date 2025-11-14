import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom"; // NEW
import TopBar from "../../components/layout/Topbar/Topbar";
import Header from "../../components/layout/Header/Header";
import SearchSection from "./components/Hotel/SearchSection/SearchSection";
import HotelFilter from "./components/Hotel/HotelList/HotelFilter";
import HotelResult from "./components/Hotel/HotelList/HotelResult";
import Footer from "../../components/layout/Footer/Footer";

function HotelListPage() {
    const [priceRange, setPriceRange] = useState([100000, 10000000]);
    const [selectedAmenities, setSelectedAmenities] = useState([]);
    const [selectedRatings, setSelectedRatings] = useState([]);

    // NEW: lưu tham số tìm kiếm từ SearchSection / từ URL
    const [searchParams, setSearchParams] = useState(null);

    const location = useLocation(); // NEW

    // NEW: đọc query từ URL để khởi tạo searchParams khi vào từ Homepage
    useEffect(() => {
        const qs = new URLSearchParams(location.search);
        if (!qs.toString()) {
            // Không có query => trạng thái chưa áp dụng search
            setSearchParams(null);
            return;
        }
        const toInt = (v, def) => {
            const n = parseInt(v, 10);
            return Number.isFinite(n) ? n : def;
        };
        const params = {
            location: qs.get('location') || '',
            checkIn: qs.get('checkIn') || '',
            checkOut: qs.get('checkOut') || '',
            adults: toInt(qs.get('adults'), 2),
            children: toInt(qs.get('children'), 0),
        };
        setSearchParams(params);
    }, [location.search]);

    const toggleAmenity = (value) =>
        setSelectedAmenities((prev) =>
            prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
        );
    const toggleRating = (value) =>
        setSelectedRatings((prev) =>
            prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
        );
    const clearAll = () => {
        setSelectedAmenities([]);
        setSelectedRatings([]);
        setPriceRange([100000, 10000000]);
        // Giữ nguyên searchParams hiện tại ở Result; nếu muốn reset kết quả luôn,
        // bạn có thể điều hướng xóa query: navigate('/hotel-list') trong SearchSection Clear
        // hoặc setSearchParams(null) ở đây nếu cần reset khi bấm Clear ở Filter.
    };

    const containerStyle = {
        display: 'flex',
        gap: '20px',
        padding: '10px'
    };

    const filterStyle = {
        flex: '0 0 25%', // Tương đương md={3}
        minWidth: '250px'
    };

    const resultStyle = {
        flex: '1' // Chiếm phần còn lại, tương đương md={9}
    };

    return (
        <>
            <TopBar />
            <Header />
            {/* Trên trang list, bạn có thể vẫn cho phép search lại.
                Nếu muốn mỗi lần tìm kiếm ở đây cũng đồng bộ URL, 
                trong onSearch bạn có thể setSearchParams và cập nhật URL. */}
            <SearchSection onSearch={(data) => setSearchParams(data)} />
            <div style={containerStyle}>
                <div style={filterStyle}>
                    <HotelFilter
                        priceRange={priceRange}
                        onChangePriceRange={setPriceRange}
                        selectedAmenities={selectedAmenities}
                        onToggleAmenity={toggleAmenity}
                        selectedRatings={selectedRatings}
                        onToggleRating={toggleRating}
                        onClearAll={clearAll}
                    />
                </div>
                <div style={resultStyle}>
                    <HotelResult
                        // NEW: truyền tham số search xuống result
                        searchParams={searchParams}
                        priceRange={priceRange}
                        selectedAmenities={selectedAmenities}
                        selectedRatings={selectedRatings}
                    />
                </div>
            </div>
            <Footer />
        </>
    );
}

export default HotelListPage
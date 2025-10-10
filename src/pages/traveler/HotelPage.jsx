import TopBar from "../../components/layout/Topbar/Topbar"
import Header from "../../components/layout/Header/Header"
import HotelHighlights from "./components/Hotel/HotelHighlight/HotelHighlights"
import SearchSection from "./components/Hotel/SearchSection/SearchSection"
import Footer from "../../components/layout/Footer/Footer.jsx";
import WhyVietTravel from "../../components/layout/WhyVietTravel/WhyVietTravel.jsx";
import { useNavigate } from "react-router-dom"; // NEW

function HotelPage() {
    const navigate = useNavigate(); // NEW

    // NEW: Điều hướng sang /hotel-list và đính query theo form search
    const handleSearch = (data) => {
        const params = new URLSearchParams();
        const { location, checkIn, checkOut, adults, children, rooms } = data || {};

        if (location) params.set('location', location.trim());
        if (checkIn) params.set('checkIn', checkIn);
        if (checkOut) params.set('checkOut', checkOut);

        if (Number.isFinite(Number(adults))) params.set('adults', String(adults));
        if (Number.isFinite(Number(children))) params.set('children', String(children));
        if (Number.isFinite(Number(rooms))) params.set('rooms', String(rooms));

        const qs = params.toString();
        navigate(qs ? `/hotel-list?${qs}` : `/hotel-list`);
    };

    return (
        <>
            <TopBar />
            <Header />
            <SearchSection onSearch={handleSearch} /> {/* NEW: truyền onSearch để điều hướng */}
            <HotelHighlights />
            <WhyVietTravel />
            <Footer />
        </>
    )
}

export default HotelPage
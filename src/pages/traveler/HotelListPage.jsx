import { useState } from "react";
import TopBar from "../../components/layout/Topbar/Topbar";
import Header from "../../components/layout/Header/Header";
import SearchSection from "./components/Hotel/SearchSection/SearchSection";
import HotelFilter from "./components/Hotel/HotelList/HotelFilter";
import HotelResult from "./components/Hotel/HotelList/HotelResult";
import Footer from "../../components/layout/Footer/Footer";

function HotelListPage() {
    const [priceRange, setPriceRange] = useState([0, 49300000]);
    const [selectedAmenities, setSelectedAmenities] = useState([]);
    const [selectedRatings, setSelectedRatings] = useState([]);

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
        setPriceRange([0, 49300000]);
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
            <SearchSection />
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

export default HotelListPage;
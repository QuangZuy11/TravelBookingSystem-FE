import { useState } from "react";
import TopBar from "../../components/layout/Topbar/Topbar";
import Header from "../../components/layout/Header/Header";
import SearchSection from "./components/Hotel/SearchSection/SearchSection";
import HotelFilter from "./components/Hotel/HotelList/HotelFilter";
import { Row, Col } from "react-bootstrap";
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

    return (
        <>
            <TopBar />
            <Header />
            <SearchSection />
            <Row style={{ padding: "10px" }}>
                <Col md={3}>
                    <HotelFilter
                        priceRange={priceRange}
                        onChangePriceRange={setPriceRange}
                        selectedAmenities={selectedAmenities}
                        onToggleAmenity={toggleAmenity}
                        selectedRatings={selectedRatings}
                        onToggleRating={toggleRating}
                        onClearAll={clearAll}
                    />
                </Col>
                <Col md={9}>
                    <HotelResult
                        priceRange={priceRange}
                        selectedAmenities={selectedAmenities}
                        selectedRatings={selectedRatings}
                    />
                </Col>
            </Row>
            <Footer />
        </>
    );
}

export default HotelListPage;
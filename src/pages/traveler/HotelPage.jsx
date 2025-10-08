
import TopBar from "../../components/layout/Topbar/Topbar"
import Header from "../../components/layout/Header/Header"
import HotelHighlights from "./components/Hotel/HotelHighlight/HotelHighlights"
import SearchSection from "./components/Hotel/SearchSection/SearchSection"
import Footer from "../../components/layout/Footer/Footer.jsx";
import WhyVietTravel from "../../components/layout/WhyVietTravel/WhyVietTravel.jsx";

function HotelPage() {
    return (
        <>
            <TopBar />
            <Header />
            <SearchSection />
            <HotelHighlights />
            <WhyVietTravel />
            <Footer />

        </>
    )
}

export default HotelPage
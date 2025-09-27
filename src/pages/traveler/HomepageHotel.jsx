import TopBar from "../../components/layout/Topbar/Topbar"
import Header from "../../components/layout/Header/Header"
import HotelHighlights from "./components/Hotel/HotelHighlight/HotelHighlights"
import SearchSection from "./components/Hotel/SearchSection/SearchSection"

function HomepageHotel() {
    return (
        <>
            <TopBar />
            <Header />
            <SearchSection />
            <HotelHighlights />

        </>
    ) 
}

export default HomepageHotel
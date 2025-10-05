
import TopBar from "../../components/layout/Topbar/Topbar"
import Header from "../../components/layout/Header/Header"
import SearchSection from "./components/Hotel/SearchSection/SearchSection"
import HotelList from "./components/Hotel/HotelList/HotelList"

function HotelListPage() {
    return (
        <>
            <TopBar />
            <Header />
            <SearchSection />
            <HotelList />

        </>
    )
}

export default HotelListPage
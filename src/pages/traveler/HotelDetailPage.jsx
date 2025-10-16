import TopBar from "../../components/layout/Topbar/Topbar";
import Header from "../../components/layout/Header/Header";
import Footer from "../../components/layout/Footer/Footer";
import HotelDetail from "./components/Hotel/HotelDetail/HotelDetail";

const HotelDetailPage = () => {
    return (
        <>
            <TopBar />
            <Header />
            <HotelDetail />
            <Footer />
        </>
    );
}

export default HotelDetailPage;
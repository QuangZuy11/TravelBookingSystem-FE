import React from "react";
import BookTourDetail from "./components/BookTour/BookTourDetail";
import TopBar from "../../components/layout/Topbar/Topbar";
import Header from "../../components/layout/Header/Header";
import Footer from "../../components/layout/Footer/Footer";
const BookTourDetailPage = () => {
    return (
        <div>
            <TopBar />
            <Header />
            <BookTourDetail />
            <Footer />
        </div>
    );
};

export default BookTourDetailPage;
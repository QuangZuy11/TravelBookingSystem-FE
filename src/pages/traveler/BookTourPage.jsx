import React from "react";
import ToursPage from "./components/BookTour/ToursPage";
import TopBar from "../../components/layout/Topbar/Topbar";
import Header from "../../components/layout/Header/Header";
import Footer from "../../components/layout/Footer/Footer";
const BookTourPage = () => {
  return (
    <div>
      <TopBar />
      <Header />
      <h2>Danh sách các tour</h2>
      <ToursPage />
      <Footer />
    </div>
  );
};

export default BookTourPage;

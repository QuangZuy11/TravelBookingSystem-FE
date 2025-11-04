import React from "react";
import MyTourDetail from "./components/BookTour/MyTourDetail";
import TopBar from "../../components/layout/Topbar/Topbar";
import Header from "../../components/layout/Header/Header";
import Footer from "../../components/layout/Footer/Footer";

const MyTourDetailPage = () => {
  return (
    <div>
      <TopBar />
      <Header />
      <MyTourDetail />
      <Footer />
    </div>
  );
};

export default MyTourDetailPage;

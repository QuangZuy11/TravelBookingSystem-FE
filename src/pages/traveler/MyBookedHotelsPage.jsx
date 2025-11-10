import React from "react";
import MyBookedHotels from "./components/Hotel/MyBookedHotels/MyBookedHotels";
import TopBar from "../../components/layout/Topbar/Topbar";
import Header from "../../components/layout/Header/Header";
import Footer from "../../components/layout/Footer/Footer";

const MyBookedHotelsPage = () => {
  return (
    <div>
      <TopBar />
      <Header />
      <MyBookedHotels />
      <Footer />
    </div>
  );
};

export default MyBookedHotelsPage;


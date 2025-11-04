import React from "react";
import MyTours from "./components/BookTour/MyTours";
import TopBar from "../../components/layout/Topbar/Topbar";
import Header from "../../components/layout/Header/Header";
import Footer from "../../components/layout/Footer/Footer";

const MyToursPage = () => {
  return (
    <div>
      <TopBar />
      <Header />
      <MyTours />
      <Footer />
    </div>
  );
};

export default MyToursPage;

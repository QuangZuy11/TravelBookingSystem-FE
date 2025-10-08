import TopBar from "../../components/layout/Topbar/Topbar";
import Header from "../../components/layout/Header/Header";
import HeroSection from "../../components/layout/HeroSection/HeroSection";
import TourSearchForm from "../../components/layout/TourSearchForm/TourSearchForm";
import Footer from "../../components/layout/Footer/Footer.jsx";
import AITitle from "../../components/layout/AITitle/AITitle.jsx";
import WhyVietTravel from "../../components/layout/WhyVietTravel/WhyVietTravel.jsx";
import F
function Homepage() {
  return (
    <>
      <TopBar />
      <Header />
      <HeroSection />
      <TourSearchForm />
      <AITitle />
      <WhyVietTravel />
      <Footer />

    </>
  );
}

export default Homepage;

import TopBar from "../../components/layout/Topbar/Topbar";
import Header from "../../components/layout/Header/Header";
import HeroSection from "../../components/layout/HeroSection/HeroSection";
import TourSearchForm from "../../components/layout/TourSearchForm/TourSearchForm";
import Footer from "../../components/layout/Footer/Footer.jsx";
function Homepage() {
  return (
    <>
      <TopBar />
      <Header />
      <HeroSection />
      <TourSearchForm />
      <Footer />
    </>
  );
}

export default Homepage;

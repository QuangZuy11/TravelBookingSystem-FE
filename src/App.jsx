import "./App.css";
import Topbar from "./components/Topbar/Topbar";
import Header from "./components/Header/Header";
import HeroSection from "./components/HeroSection/HeroSection";
function App() {
  return (
    <div className="app">
      <Topbar />
      <Header />
      <HeroSection />
    </div>
  );
}

export default App;

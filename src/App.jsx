import "./App.css";
import Homepage from "./pages/traveler/Homepage";

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HotelList from "./pages/traveler/HotelList";

function App() {
  return (
    <Router>
      <Routes>
        {/* Trang homepage cho Traveler*/}
        <Route path="/" element={<Homepage />} />
        {/* Trang Hotel cho Traveler*/}
        <Route path="/hotel" element={<HotelList />} />

        {/* Trang login */}

      </Routes>
    </Router>
  );
}

export default App;

import "./App.css";
import Homepage from "./pages/traveler/Homepage";
import HomepageHotel from "./pages/traveler/HomepageHotel";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/homepage" element={<Homepage />} />
        <Route path="/homepage-hotel" element={<HomepageHotel />} />
      </Routes>
    </Router>
  );
}

export default App;

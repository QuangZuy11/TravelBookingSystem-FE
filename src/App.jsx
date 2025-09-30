import "./App.css";
import Homepage from "./pages/traveler/Homepage";
import HotelListPage from "./pages/traveler/HotelListPage";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HotelPage from "./pages/traveler/HotelPage";
import AuthPage from "./pages/auth/AuthPage";
import { AuthProvider } from './contexts/AuthContext';
import Profile from "./pages/traveler/Profile";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Trang homepage cho Traveler*/}
          <Route path="/" element={<Homepage />} />
          {/* Trang Hotel cho Traveler*/}
          <Route path="/hotel-page" element={<HotelPage />} />
          {/* Trang List Hotel cho Traveler*/}
          <Route path="/hotel-list" element={<HotelListPage />} />
          {/* Trang List Hotel cho Traveler*/}
          <Route path="/profile" element={< Profile />} />

          {/* Trang login */}
          <Route path="/auth" element={<AuthPage />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;

import "./App.css";
import Homepage from "./pages/traveler/Homepage";
import Profile from "./pages/traveler/Profile";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
// import HomepageHotel from "./pages/traveler/HomepageHotel";
import AuthPage from "./pages/auth/AuthPage";
import { AuthProvider } from './contexts/AuthContext';


function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Trang homepage cho Traveler*/}
          <Route path="/" element={<Homepage />} />
          {/* Trang Hotel cho Traveler*/}
          {/* <Route path="/hotel" element={<HomepageHotel />} /> */}
          {/* Trang Profile cho Traveler */}
          <Route path="/profile" element={<Profile />} />
          {/* Trang login */}
          <Route path="/auth" element={<AuthPage />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;

import "./App.css";
import Homepage from "./pages/traveler/Homepage";

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

          {/* Trang login */}
          <Route path="/auth" element={<AuthPage />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;

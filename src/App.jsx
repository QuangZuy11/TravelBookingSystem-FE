import "./App.css";
import Homepage from "./pages/traveler/Homepage";
import HotelListPage from "./pages/traveler/HotelListPage";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HotelPage from "./pages/traveler/HotelPage";
import AuthPage from "./pages/auth/AuthPage";
import { AuthProvider } from './contexts/AuthContext';
import DashboardLayout from "./components/layout/ProviderDashboard/DashboardLayout";
import TourDashboard from "./pages/provider/dashboard/TourDashboard";
import HotelDashboard from "./pages/provider/dashboard/HotelDashboard";
import FlightDashboard from "./pages/provider/dashboard/FlightDashboard";
import TourDetails from "./pages/provider/dashboard/TourDetails";
import HotelDetails from "./pages/provider/dashboard/HotelDetails";
import FlightDetails from "./pages/provider/dashboard/FlightDetails";
import RoomListView from "./pages/provider/dashboard/hotel/RoomListView";
import RoomDetailView from "./pages/provider/dashboard/hotel/RoomDetailView";
import RoomEditView from "./pages/provider/dashboard/hotel/RoomEditView";

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

        {/* Trang login */}
        <Route path="/auth" element={<AuthPage />} />

        {/* Provider Dashboard Routes */}
        <Route path="/provider" element={<DashboardLayout />}>
          <Route index element={<TourDashboard />} />
          <Route path="tours" element={<TourDashboard />} />
          <Route path="tours/:id" element={<TourDetails />} />
          <Route path="tours/new" element={<TourDetails />} />
          
          <Route path="hotels" element={<HotelDashboard />} />
          <Route path="hotels/:id" element={<HotelDetails />} />
          <Route path="hotels/new" element={<HotelDetails />} />

          <Route path="hotels/:hotelId/rooms" element={<RoomListView />} />
          <Route path="hotels/:hotelId/rooms/:roomId" element={<RoomDetailView />} />
          <Route path="hotels/:hotelId/rooms/:roomId/edit" element={<RoomEditView />} />
          
          <Route path="flights" element={<FlightDashboard />} />
          <Route path="flights/:id" element={<FlightDetails />} />
          <Route path="flights/new" element={<FlightDetails />} />
        </Route>
      </Routes>
    </Router>
    </AuthProvider>
  );
}

export default App;

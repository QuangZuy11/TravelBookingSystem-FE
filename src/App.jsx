import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Homepage from "./pages/traveler/Homepage";
import AuthPage from "./pages/auth/AuthPage";
import { AuthProvider } from './contexts/AuthContext';
import DashboardLayout from "./components/layout/ProviderDashboard/DashboardLayout";
import TourDashboard from "./pages/provider/dashboard/TourDashboard";
import FlightDashboard from "./pages/provider/dashboard/FlightDashboard";
import TourDetails from "./pages/provider/dashboard/TourDetails";
import FlightDetails from "./pages/provider/dashboard/FlightDetails";
import HotelDashboard from "./pages/provider/dashboard/HotelDashboard";
import HotelDetailsPage from "./pages/provider/HotelDetailsPage";
import RoomTypeDetailsPage from "./pages/provider/RoomTypeDetailsPage";
import ProviderLayout from "./pages/provider/ProviderLayout";
import CreateHotelPage from "./pages/provider/CreateHotelPage";
import EditHotelPage from "./pages/provider/EditHotelPage";
import RoomFormPage from "./pages/provider/RoomFormPage";
import BookingManagementPage from "./pages/provider/BookingManagementPage";
import RoomListPage from "./pages/provider/RoomListPage";
import HotelPage from "./pages/traveler/HotelPage";
import HotelListPage from "./pages/traveler/HotelListPage";

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Trang homepage cho Traveler*/}
          <Route path="/" element={<Homepage />} />
          {/* Trang Hotel cho Traveler*/}
          <Route path="/hotel-page" element={<HotelPage />} />
          {/* Trang List Hotel cho Traveler*/}
          <Route path="/hotel-list" element={<HotelListPage />} />

          {/* Trang login */}
          <Route path="/auth" element={<AuthPage />} />

          {/* Provider Routes */}
          <Route path="/provider" element={<ProviderLayout />}>
            {/* Provider Dashboard Routes */}
            <Route element={<DashboardLayout />}>
              <Route index element={<TourDashboard />} />
              <Route path="/provider/bookings" element={<BookingManagementPage />} />

              {/* Tour Management */}
              <Route path="tours">
                <Route index element={<TourDashboard />} />
                <Route path=":id" element={<TourDetails />} />
                <Route path="new" element={<TourDetails />} />
              </Route>

              {/* Flight Management */}
              <Route path="flights">
                <Route index element={<FlightDashboard />} />
                <Route path=":id" element={<FlightDetails />} />
                <Route path="new" element={<FlightDetails />} />
              </Route>

              {/* Hotel Management */}
              <Route path="hotels">
                <Route index element={<HotelDashboard />} />
                <Route path="new" element={<CreateHotelPage />} />
                <Route path=":hotelId/edit" element={<EditHotelPage />} />
                <Route path=":hotelId" element={<HotelDetailsPage />} />
                <Route path=":hotelId/rooms" element={<RoomListPage />} />
                <Route path=":hotelId/rooms/new" element={<RoomFormPage />} />
                <Route path=":hotelId/rooms/:roomId" element={<RoomTypeDetailsPage />} />
                <Route path=":hotelId/rooms/:roomId/edit" element={<RoomFormPage />} />
              </Route>
            </Route>
          </Route>
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
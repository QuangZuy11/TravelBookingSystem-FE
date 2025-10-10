import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Homepage from "./pages/traveler/Homepage";
import AuthPage from "./pages/auth/AuthPage";
import { AuthProvider } from './contexts/AuthContext';
import { FlightProvider } from './contexts/FlightContext';
import ErrorBoundary from './components/common/ErrorBoundary';
import ProtectedRoute from './components/common/ProtectedRoute';
import NotFoundPage from './pages/NotFoundPage';
import UnauthorizedPage from './pages/UnauthorizedPage';
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
// NEW Flight Management System
import FlightListPageNew from "./pages/provider/FlightListPageNew";
import FlightFormPage from "./pages/provider/FlightFormPage";
import FlightDetailsPageNew from "./pages/provider/FlightDetailsPageNew";
import FlightClassesManagementPage from "./pages/provider/FlightClassesManagementPage";
import SeatsManagementPage from "./pages/provider/seats/SeatsManagementPage";
import BulkSeatSetupPage from "./pages/provider/seats/BulkSeatSetupPage";
import ScheduleManagementPage from "./pages/provider/schedules/ScheduleManagementPage";

// OLD - Keep for backward compatibility (can be removed later)
import FlightStatisticsPage from "./pages/provider/FlightStatisticsPage";
import FlightBookingListPage from "./pages/provider/FlightBookingListPage";
import FlightBookingDetailsPage from "./pages/provider/FlightBookingDetailsPage";
import FlightBookingFormPage from "./pages/provider/FlightBookingFormPage";
import HotelPage from "./pages/traveler/HotelPage";
import HotelListPage from "./pages/traveler/HotelListPage";
import Profile from "./pages/traveler/components/Hotel/Profile/Profile";

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <AuthProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Homepage />} />
            <Route path="/hotel-page" element={<HotelPage />} />
            <Route path="/hotel-list" element={<HotelListPage />} />
            <Route path="/auth" element={<AuthPage />} />

            {/* Error Pages */}
            <Route path="/unauthorized" element={<UnauthorizedPage />} />

            {/* Protected Routes - Traveler */}
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />

            {/* Protected Routes - Provider */}
            <Route
              path="/provider"
              element={
                <ProtectedRoute requiredRole="PROVIDER">
                  <FlightProvider>
                    <ProviderLayout />
                  </FlightProvider>
                </ProtectedRoute>
              }
            >
              <Route element={<DashboardLayout />}>
                <Route index element={<TourDashboard />} />
                <Route path="bookings" element={<BookingManagementPage />} />

                {/* Tour Management */}
                <Route path="tours">
                  <Route index element={<TourDashboard />} />
                  <Route path=":id" element={<TourDetails />} />
                  <Route path="new" element={<TourDetails />} />
                </Route>

                {/* Flight Management - NEW SYSTEM */}
                <Route path="flights">
                  <Route index element={<FlightListPageNew />} />
                  <Route path="new" element={<FlightFormPage />} />
                  <Route path=":flightId/edit" element={<FlightFormPage />} />
                  <Route path=":flightId" element={<FlightDetailsPageNew />} />

                  {/* Flight Classes (nested in flight details, but also accessible directly) */}
                  <Route path=":flightId/classes" element={<FlightClassesManagementPage />} />

                  {/* Flight Seats */}
                  <Route path=":flightId/seats" element={<SeatsManagementPage />} />
                  <Route path=":flightId/seats/setup" element={<BulkSeatSetupPage />} />

                  {/* Flight Schedules */}
                  <Route path=":flightId/schedules" element={<ScheduleManagementPage />} />
                </Route>

                {/* Flight Statistics - Keep for backward compatibility */}
                <Route path="flight-statistics" element={<FlightStatisticsPage />} />

                {/* Flight Bookings - Keep for backward compatibility */}
                <Route path="flight-bookings">
                  <Route index element={<FlightBookingListPage />} />
                  <Route path="new" element={<FlightBookingFormPage />} />
                  <Route path=":bookingId" element={<FlightBookingDetailsPage />} />
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

            {/* 404 - Must be last */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </AuthProvider>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
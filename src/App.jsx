import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Homepage from "./pages/traveler/Homepage";
import AuthPage from "./pages/auth/AuthPage";
import ServiceProviderRegistration from "./pages/auth/ServiceProviderRegistration";
import PendingVerificationPage from "./pages/auth/PendingVerificationPage";
import { AuthProvider } from "./contexts/AuthContext";
import ErrorBoundary from "./components/common/ErrorBoundary";
import ProtectedRoute from "./components/common/ProtectedRoute";
import NotFoundPage from "./pages/NotFoundPage";
import UnauthorizedPage from "./pages/UnauthorizedPage";
import DashboardLayout from "./components/layout/ProviderDashboard/DashboardLayout";
import TourDashboard from "./pages/provider/dashboard/TourDashboard";

// Tour Management
import TourDashboardPage from "./pages/provider/tour/TourDashboard";
import TourListPage from "./pages/provider/tour/TourList";
import CreateTourWizard from "./pages/provider/tour/CreateTourWizard";
import TourDetailsPage from "./pages/provider/tour/TourDetailsPage";
import TermsAndConditions from "./pages/terms/TermsOfService";

// Hotel Management
import HotelDashboard from "./pages/provider/hotel/HotelDashboard";
import HotelDetailsPage from "./pages/provider/hotel/HotelDetailsPage";
import RoomTypeDetailsPage from "./pages/provider/hotel/RoomTypeDetailsPage";
import CreateHotelPage from "./pages/provider/hotel/CreateHotelPage";
import EditHotelPage from "./pages/provider/hotel/EditHotelPage";
import RoomFormPage from "./pages/provider/hotel/RoomFormPage";
import BookingManagementPage from "./pages/provider/hotel/BookingManagementPage";
import RoomListPage from "./pages/provider/hotel/RoomListPage";
import PromotionListPage from "./pages/provider/promotions/PromotionListPage";
import PromotionCreatePage from "./pages/provider/promotions/PromotionCreatePage";
import PromotionEditPage from "./pages/provider/promotions/PromotionEditPage";

// Provider Layout
import ProviderLayout from "./pages/provider/ProviderLayout";
import ProviderGeneralDashboard from "./pages/provider/ProviderGeneralDashboard";

// Provider Routes
import ProviderTypeRouter from "./components/routes/ProviderTypeRouter";
import ProtectedProviderRoute from "./components/routes/ProtectedProviderRoute";

// Traveler Pages
import HotelPage from "./pages/traveler/HotelPage";
import HotelListPage from "./pages/traveler/HotelListPage";
import Profile from "./pages/traveler/components/Hotel/Profile/Profile";
import BookTourPage from "./pages/traveler/BookTourPage";
import HotelDetailPage from "./pages/traveler/HotelDetailPage";
import BookTourDetailPage from "./pages/traveler/BookTourDetailPage";

// Admin Pages
import PendingProvidersList from "./pages/admin/PendingProvidersList";
import ProviderDetailPage from "./pages/admin/ProviderDetailPage";
import AdminDashboardPage from "./pages/admin/AdminDashboardPage";
import UserListPage from "./pages/admin/UserListPage";
import AIItineraryGenerator from "./components/ai/AIItineraryGenerator";
import MyItineraries from "./components/ai/MyItineraries";
import ItineraryDetail from "./components/ai/ItineraryDetail";

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <AuthProvider>
          {/* Toast Notifications - Top Right Position */}
          <Toaster
            position="top-right"
            reverseOrder={false}
            gutter={8}
            toastOptions={{
              // Default options
              duration: 4000,
              style: {
                background: "#363636",
                color: "#fff",
                padding: "16px",
                borderRadius: "8px",
                fontSize: "14px",
                maxWidth: "500px",
              },
              // Success toast style
              success: {
                duration: 3000,
                iconTheme: {
                  primary: "#10b981",
                  secondary: "#fff",
                },
                style: {
                  background: "#10b981",
                  color: "#fff",
                },
              },
              // Error toast style
              error: {
                duration: 5000,
                iconTheme: {
                  primary: "#ef4444",
                  secondary: "#fff",
                },
                style: {
                  background: "#ef4444",
                  color: "#fff",
                },
              },
            }}
          />

          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Homepage />} />
            <Route path="/hotel-page" element={<HotelPage />} />
            <Route path="/hotel-list" element={<HotelListPage />} />
            <Route path="/hotel-detail/:id" element={<HotelDetailPage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/terms-of-service" element={<TermsAndConditions />} />
            {/* Trang List Tour cho Traveler*/}
            <Route path="/tour" element={<BookTourPage />} />
            <Route path="/tour/:id" element={<BookTourDetailPage />} />

            {/* Provider Registration - Must be accessible without full authentication */}
            <Route
              path="/register/service-provider"
              element={<ServiceProviderRegistration />}
            />

            {/* Provider Pending Verification Page */}
            <Route
              path="/provider/pending-verification"
              element={<PendingVerificationPage />}
            />

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

            <Route path="/ai-itinerary" element={<AIItineraryGenerator />} />
            <Route path="/my-itineraries" element={<MyItineraries />} />
            <Route
              path="/ai-itinerary/:itineraryId"
              element={<ItineraryDetail />}
            />

            {/* Protected Routes - Admin */}
            <Route
              path="/admin/providers"
              element={
                <ProtectedRoute requiredRole="Admin">
                  <PendingProvidersList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/providers/:id"
              element={
                <ProtectedRoute requiredRole="Admin">
                  <ProviderDetailPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/dashboard"
              element={
                // <ProtectedRoute requiredRole="Admin">
                <AdminDashboardPage />
                // </ProtectedRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                // <ProtectedRoute requiredRole="Admin">
                <UserListPage />
                // </ProtectedRoute>
              }
            />

            {/* Protected Routes - Provider */}
            <Route
              path="/provider"
              element={
                <ProtectedProviderRoute>
                  <ProviderLayout />
                </ProtectedProviderRoute>
              }
            >
              <Route element={<DashboardLayout />}>
                {/* Provider Type Router - Auto-redirect based on provider type */}
                <Route index element={<ProviderTypeRouter />} />

                {/* General Dashboard for multi-service providers */}
                <Route
                  path="dashboard"
                  element={<ProviderGeneralDashboard />}
                />

                <Route path="bookings" element={<BookingManagementPage />} />

                {/* Tour Management - NEW MODULE */}
                <Route path="tours">
                  <Route index element={<TourDashboardPage />} />
                  <Route path="create" element={<CreateTourWizard />} />
                  <Route path=":tourId" element={<TourDetailsPage />} />
                  <Route path=":tourId/edit" element={<CreateTourWizard />} />
                  <Route path="bookings" element={<BookingManagementPage />} />
                  <Route path="statistics" element={<TourDashboard />} />
                </Route>
                {/* Hotel Management */}
                <Route path="hotels">
                  <Route index element={<HotelDashboard />} />
                  <Route path="new" element={<CreateHotelPage />} />
                  <Route path=":hotelId/edit" element={<EditHotelPage />} />
                  <Route path=":hotelId" element={<HotelDetailsPage />} />
                  <Route path=":hotelId/rooms" element={<RoomListPage />} />
                  <Route path=":hotelId/rooms/new" element={<RoomFormPage />} />
                  <Route
                    path=":hotelId/rooms/:roomId"
                    element={<RoomTypeDetailsPage />}
                  />
                  <Route
                    path=":hotelId/rooms/:roomId/edit"
                    element={<RoomFormPage />}
                  />
                </Route>

                <Route path="promotions">
                  <Route index element={<PromotionListPage />} />
                  <Route path="create" element={<PromotionCreatePage />} />
                  <Route path=":promotionId/edit" element={<PromotionEditPage />} />
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

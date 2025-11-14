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
// Tour Management
import TourDashboardPage from "./pages/provider/tour/TourDashboard";
import TourListPage from "./pages/provider/tour/TourList";
import CreateTourWizard from "./pages/provider/tour/CreateTourWizard";
import TourDetailsPage from "./pages/provider/tour/TourDetailsPage";
import TourBookingsPage from "./pages/provider/tour/TourBookingsPage";
import TourBookingManagementPage from "./pages/provider/tour/TourBookingManagementPage";
import TermsAndConditions from "./pages/terms/TermsOfService";

// Hotel Management
import OverviewPage from "./pages/provider/hotel/OverviewPage";
import HotelManagePage from "./pages/provider/hotel/HotelManagePage";
import HotelDetailsPage from "./pages/provider/hotel/HotelDetailsPage";
import RoomTypeDetailsPage from "./pages/provider/hotel/RoomTypeDetailsPage";
import CreateHotelPage from "./pages/provider/hotel/CreateHotelPage";
import EditHotelPage from "./pages/provider/hotel/EditHotelPage";
import RoomFormPage from "./pages/provider/hotel/RoomFormPage";
import BookingManagementPage from "./pages/provider/hotel/BookingManagementPage";
import RevenueStatisticsPage from "./pages/provider/hotel/RevenueStatisticsPage";
import RoomListPage from "./pages/provider/hotel/RoomListPage";
import RoomAvailabilityPage from "./pages/provider/hotel/RoomAvailabilityPage";
import BulkRoomCreator from "./pages/provider/hotel/BulkRoomCreator";
import PromotionListPage from "./pages/provider/promotions/PromotionListPage";
import PromotionCreatePage from "./pages/provider/promotions/PromotionCreatePage";
import PromotionEditPage from "./pages/provider/promotions/PromotionEditPage";
import HotelAdsPage from "./pages/provider/promotions/HotelAdsPage";
import TourAdsPage from "./pages/provider/promotions/TourAdsPage";

// Hotel Management - New Modular Pages
import HotelOverviewPage from "./pages/provider/hotel/HotelOverviewPage";
import HotelInfoPage from "./pages/provider/hotel/HotelInfoPage";
import HotelLocationPage from "./pages/provider/hotel/HotelLocationPage";
import HotelPoliciesPage from "./pages/provider/hotel/HotelPoliciesPage";
import HotelContactPage from "./pages/provider/hotel/HotelContactPage";
import HotelAmenitiesPage from "./pages/provider/hotel/HotelAmenitiesPage";
import HotelGalleryPage from "./pages/provider/hotel/HotelGalleryPage";
import HotelBookingsPage from "./pages/provider/hotel/HotelBookingsPage";

// Provider Layout
import ProviderLayout from "./pages/provider/ProviderLayout";

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
import MyToursPage from "./pages/traveler/MyToursPage";
import MyTourDetailPage from "./pages/traveler/MyTourDetailPage";
import MyBookedHotelsPage from "./pages/traveler/MyBookedHotelsPage";
import ChatPage from "./pages/traveler/ChatPage";
import ChatWidget from "./pages/traveler/ChatWidget";

// Admin Pages
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboardPage from "./pages/admin/AdminDashboardPage";
import UserListPage from "./pages/admin/UserListPage";
import PendingProvidersList from "./pages/admin/PendingProvidersList";
import ProviderDetailPage from "./pages/admin/ProviderDetailPage";
import AdminPolicyTermsPage from "./pages/admin/AdminPolicyTermsPage";
import AdminPolicyTermCreatePage from "./pages/admin/AdminPolicyTermCreatePage";
import AdminPolicyTermDetailPage from "./pages/admin/AdminPolicyTermDetailPage";
import AdminPolicyTermEditPage from "./pages/admin/AdminPolicyTermEditPage";
import AIItineraryGenerator from "./components/ai/AIItineraryGenerator";
import MyItineraries from "./components/ai/MyItineraries";
import AIItineraryErrorBoundary from "./components/ai/AIItineraryErrorBoundary";
import TourItineraryManager from "./components/tour/TourItineraryManager";

// AI Itinerary Booking Pages
import MyAIBookings from "./components/ai/MyAIBookings";
import ProviderAIBookingsPage from "./pages/provider/ProviderAIBookingsPage";
import AdminAIBookingsPage from "./pages/admin/AdminAIBookingsPage";

// Auth Pages
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";
import ResetPasswordPage from "./pages/auth/ResetPasswordPage";
import ItineraryDetailNew from "./components/ai/ItineraryDetailNew";
import ItineraryCustomize from "./components/ai/ItineraryCustomize";

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
            <Route path="/chat" element={<ChatPage />} />

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

            <Route
              path="/my-tours"
              element={
                <ProtectedRoute>
                  <MyToursPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-tours/:bookingId"
              element={
                <ProtectedRoute>
                  <MyTourDetailPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/my-booked-hotels"
              element={
                <ProtectedRoute>
                  <MyBookedHotelsPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/ai-itinerary"
              element={
                <AIItineraryErrorBoundary>
                  <AIItineraryGenerator />
                </AIItineraryErrorBoundary>
              }
            />
            <Route
              path="/my-itineraries"
              element={
                <AIItineraryErrorBoundary>
                  <MyItineraries />
                </AIItineraryErrorBoundary>
              }
            />
            <Route
              path="/ai-itinerary/:itineraryId"
              element={
                <AIItineraryErrorBoundary>
                  <ItineraryDetailNew />
                </AIItineraryErrorBoundary>
              }
            />
            <Route
              path="/ai-itinerary/:itineraryId/customize"
              element={
                <AIItineraryErrorBoundary>
                  <ItineraryCustomize />
                </AIItineraryErrorBoundary>
              }
            />

            {/* AI Itinerary Bookings - Traveler */}
            <Route
              path="/my-booking-itineraries"
              element={
                <ProtectedRoute>
                  <AIItineraryErrorBoundary>
                    <MyAIBookings />
                  </AIItineraryErrorBoundary>
                </ProtectedRoute>
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

                <Route path="bookings" element={<BookingManagementPage />} />
                <Route
                  path="revenue-statistics"
                  element={<RevenueStatisticsPage />}
                />

                {/* AI Itinerary Bookings - Provider */}
                <Route
                  path="ai-bookings"
                  element={<ProviderAIBookingsPage />}
                />

                {/* Tour Management - NEW MODULE */}
                <Route path="tours">
                  <Route index element={<TourDashboardPage />} />
                  <Route path="create" element={<CreateTourWizard />} />
                  <Route path=":tourId" element={<TourDetailsPage />} />
                  <Route path=":tourId/edit" element={<CreateTourWizard />} />
                  <Route
                    path=":tourId/itinerary-manager"
                    element={<TourItineraryManager />}
                  />
                  <Route
                    path="bookings"
                    element={<TourBookingManagementPage />}
                  />
                  <Route path="check-in" element={<TourBookingsPage />} />
                </Route>
                {/* Hotel Management */}
                <Route path="hotels">
                  <Route index element={<OverviewPage />} />
                  <Route path="manage" element={<HotelManagePage />} />
                  <Route path="new" element={<CreateHotelPage />} />
                  <Route path=":hotelId/edit" element={<EditHotelPage />} />
                  <Route path=":hotelId" element={<HotelDetailsPage />} />

                  {/* New Modular Hotel Pages */}
                  <Route
                    path=":hotelId/overview"
                    element={<HotelOverviewPage />}
                  />
                  <Route path=":hotelId/info" element={<HotelInfoPage />} />
                  <Route
                    path=":hotelId/location"
                    element={<HotelLocationPage />}
                  />
                  <Route
                    path=":hotelId/policies"
                    element={<HotelPoliciesPage />}
                  />
                  <Route
                    path=":hotelId/contact"
                    element={<HotelContactPage />}
                  />
                  <Route
                    path=":hotelId/amenities"
                    element={<HotelAmenitiesPage />}
                  />
                  <Route
                    path=":hotelId/gallery"
                    element={<HotelGalleryPage />}
                  />
                  <Route
                    path=":hotelId/bookings"
                    element={<HotelBookingsPage />}
                  />

                  {/* Room Management */}
                  <Route path=":hotelId/rooms" element={<RoomListPage />} />
                  <Route
                    path=":hotelId/rooms/availability"
                    element={<RoomAvailabilityPage />}
                  />
                  <Route path=":hotelId/rooms/new" element={<RoomFormPage />} />
                  <Route
                    path=":hotelId/rooms/bulk-create"
                    element={<BulkRoomCreator />}
                  />
                  <Route
                    path=":hotelId/rooms/:roomId"
                    element={<RoomTypeDetailsPage />}
                  />
                  <Route
                    path=":hotelId/rooms/:roomId/edit"
                    element={<RoomFormPage />}
                  />
                </Route>
                <Route path="hotel-ads" element={<HotelAdsPage />} />
                <Route path="tour-ads" element={<TourAdsPage />} />

                <Route path="promotions">
                  <Route index element={<PromotionListPage />} />
                  <Route path="create" element={<PromotionCreatePage />} />
                  <Route
                    path=":promotionId/edit"
                    element={<PromotionEditPage />}
                  />
                </Route>
              </Route>
            </Route>

            {/* Admin Routes (Navbar trái giữ nguyên, nội dung đổi qua Outlet) */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute requiredRole="Admin">
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<AdminDashboardPage />} />
              <Route path="dashboard" element={<AdminDashboardPage />} />
              <Route path="users" element={<UserListPage />} />
              <Route path="providers" element={<PendingProvidersList />} />
              <Route path="providers/:id" element={<ProviderDetailPage />} />
              <Route path="terms-policies" element={<AdminPolicyTermsPage />} />
              <Route
                path="terms-policies/create"
                element={<AdminPolicyTermCreatePage />}
              />
              <Route
                path="terms-policies/:id"
                element={<AdminPolicyTermDetailPage />}
              />
              <Route
                path="terms-policies/:id/edit"
                element={<AdminPolicyTermEditPage />}
              />

              {/* AI Itinerary Bookings - Admin */}
              <Route path="ai-bookings" element={<AdminAIBookingsPage />} />
            </Route>

            {/* Auth flows */}
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />

            {/* 404 - Must be last */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
          <ChatWidget />
        </AuthProvider>
      </Router>
    </ErrorBoundary>
  );
}

export default App;

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
import RoomListPage from "./pages/provider/hotel/RoomListPage";
import PromotionListPage from "./pages/provider/promotions/PromotionListPage";
import PromotionCreatePage from "./pages/provider/promotions/PromotionCreatePage";
import PromotionEditPage from "./pages/provider/promotions/PromotionEditPage";
import HotelAdsPage from "./pages/provider/promotions/HotelAdsPage";
import TourAdsPage from "./pages/provider/promotions/TourAdsPage";

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
import ChatPage from "./pages/traveler/ChatPage";
import ChatWidget from "./pages/traveler/ChatWidget";

// Admin Pages
import PendingProvidersList from "./pages/admin/PendingProvidersList";
import ProviderDetailPage from "./pages/admin/ProviderDetailPage";
import AdminDashboardPage from "./pages/admin/AdminDashboardPage";
import UserListPage from "./pages/admin/UserListPage";
import AdminPolicyTermsPage from "./pages/admin/AdminPolicyTermsPage";
import AdminPolicyTermCreatePage from "./pages/admin/AdminPolicyTermCreatePage";
import AdminPolicyTermDetailPage from "./pages/admin/AdminPolicyTermDetailPage";
import AdminPolicyTermEditPage from "./pages/admin/AdminPolicyTermEditPage";
import AIItineraryGenerator from "./components/ai/AIItineraryGenerator";
import MyItineraries from "./components/ai/MyItineraries";
import AIItineraryErrorBoundary from "./components/ai/AIItineraryErrorBoundary";
import TourItineraryManager from "./components/tour/TourItineraryManager";

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
            <Route
              path="/admin/terms-policies"
              element={
                <ProtectedRoute requiredRole="Admin">
                  <AdminPolicyTermsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/terms-policies/create"
              element={
                <ProtectedRoute requiredRole="Admin">
                  <AdminPolicyTermCreatePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/terms-policies/:id"
              element={
                <ProtectedRoute requiredRole="Admin">
                  <AdminPolicyTermDetailPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/terms-policies/:id/edit"
              element={
                <ProtectedRoute requiredRole="Admin">
                  <AdminPolicyTermEditPage />
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
                  <Route path="bookings" element={<BookingManagementPage />} />
                </Route>
                {/* Hotel Management */}
                <Route path="hotels">
                  <Route index element={<OverviewPage />} />
                  <Route path="manage" element={<HotelManagePage />} />
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

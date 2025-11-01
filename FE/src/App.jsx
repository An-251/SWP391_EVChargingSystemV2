import 'bootstrap/dist/css/bootstrap.min.css';
import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import Home from "./Page/HomePage/Home";
import { useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { initializeAuth } from "./redux/auth/authSlice";
import backgroundMusic from "./assets/backgroundmusic.mp3";

import StaffSession from "./Page/Staff/StaffSession/Session";
import LoginPage from "./Page/AuthPage/Login";
import StaffLayout from "./Layout/Staff/StaffLayout";
import StaffHome from "./Page/Staff/StaffHome/Home";
import DriverPage from "./Page/DriverPage";
import DriverProfile from "./Page/DriverPage/DriverProfile";
import DriverVehicles from "./Page/DriverPage/DriverVehicles";
import DriverReservations from "./Page/DriverPage/DriverReservations/DriverReservations";
import ActiveSession from "./Page/DriverPage/DriverSession/ActiveSession";
import SessionHistory from "./Page/DriverPage/DriverSession/SessionHistory";
import SessionCompleted from "./Page/DriverPage/DriverSession/SessionCompleted";
import InvoicePayment from "./Page/DriverPage/DriverInvoice/InvoicePayment";
import SubscriptionSelectionPage from "./Page/DriverPage/SubscriptionSelection/SubscriptionSelectionPage";
import RoleBasedRoute from "./Components/RoleBasedRoute";
import SubscriptionGuard from "./Components/SubscriptionGuard";
import AdminLayout from "./Layout/Admin/AdminLayout";
import { 
  Dashboard,
  FacilityList, 
  StationList, 
  ChargingPointList, 
  AccountList,
  AdminRegistration, 
  SubscriptionList,
  Reports
} from "./Page/AdminPage";
import ErrorBoundary from "./Components/ErrorBoundary";

// Error boundary component for Map
function MapErrorBoundary({ children }) {
  try {
    return children;
  } catch (error) {
    return <div>Map is currently unavailable. Please try again later.</div>;
  }
}

// Protected Route Component
function ProtectedRoute({ children }) {
  const { isAuthenticated, isAuthInitialized } = useSelector((state) => state.auth);
  
  if (!isAuthInitialized) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }
  
  return children;
}

function App() {
  const location = useLocation();
  const audioRef = useRef(null);
  const dispatch = useDispatch();
  
  // Initialize auth when app starts
  useEffect(() => {
    dispatch(initializeAuth());
  }, [dispatch]);

  return (
    <>
      <audio ref={audioRef} src={backgroundMusic} loop />
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route
            path="/auth/login"
            element={
              <motion.div
                initial={{ opacity: 0, y: 20, backgroundColor: "#46F062" }}
                animate={{ opacity: 1, y: 0, backgroundColor: "#46F062" }}
                exit={{ opacity: 0, y: -20, backgroundColor: "#46F062" }}
                transition={{ duration: 0.5 }}
                style={{ minHeight: "100vh" }}
              >
                <LoginPage />
              </motion.div>
            }
          />

          {/* Subscription Selection Route - Protected but not guarded */}
          <Route 
            path="/driver/select-subscription" 
            element={
              <RoleBasedRoute allowedRoles={["Driver"]}>
                <ErrorBoundary>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.5 }}
                    style={{ minHeight: "100vh" }}
                  >
                    <SubscriptionSelectionPage />
                  </motion.div>
                </ErrorBoundary>
              </RoleBasedRoute>
            } 
          />

          {/* Driver Routes - Protected and Subscription Guarded */}
          <Route 
            path="/driver" 
            element={
              <RoleBasedRoute allowedRoles={["Driver"]}>
                <SubscriptionGuard>
                  <ErrorBoundary>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.5 }}
                      style={{ minHeight: "100vh" }}
                    >
                      <DriverPage />
                    </motion.div>
                  </ErrorBoundary>
                </SubscriptionGuard>
              </RoleBasedRoute>
            } 
          />

          {/* Driver Profile Route - Protected and Subscription Guarded */}
          <Route 
            path="/driver/profile" 
            element={
              <RoleBasedRoute allowedRoles={["Driver"]}>
                <SubscriptionGuard>
                  <ErrorBoundary>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.5 }}
                      style={{ minHeight: "100vh" }}
                    >
                      <DriverProfile />
                    </motion.div>
                  </ErrorBoundary>
                </SubscriptionGuard>
              </RoleBasedRoute>
            } 
          />

          {/* Driver Vehicles Route - Protected and Subscription Guarded */}
          <Route 
            path="/driver/vehicles" 
            element={
              <RoleBasedRoute allowedRoles={["Driver"]}>
                <SubscriptionGuard>
                  <ErrorBoundary>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.5 }}
                      style={{ minHeight: "100vh" }}
                    >
                      <DriverVehicles />
                    </motion.div>
                  </ErrorBoundary>
                </SubscriptionGuard>
              </RoleBasedRoute>
            } 
          />

          {/* Driver Reservations Route - Protected and Subscription Guarded */}
          <Route 
            path="/driver/reservations" 
            element={
              <RoleBasedRoute allowedRoles={["Driver"]}>
                <SubscriptionGuard>
                  <ErrorBoundary>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.5 }}
                      style={{ minHeight: "100vh" }}
                    >
                      <DriverReservations />
                    </motion.div>
                  </ErrorBoundary>
                </SubscriptionGuard>
              </RoleBasedRoute>
            } 
          />

          {/* Driver Active Session Route - Protected and Subscription Guarded */}
          <Route 
            path="/driver/session" 
            element={
              <RoleBasedRoute allowedRoles={["Driver"]}>
                <SubscriptionGuard>
                  <ErrorBoundary>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.5 }}
                      style={{ minHeight: "100vh" }}
                    >
                      <ActiveSession />
                    </motion.div>
                  </ErrorBoundary>
                </SubscriptionGuard>
              </RoleBasedRoute>
            } 
          />

          {/* Driver Session History Route - Protected and Subscription Guarded */}
          <Route 
            path="/driver/history" 
            element={
              <RoleBasedRoute allowedRoles={["Driver"]}>
                <SubscriptionGuard>
                  <ErrorBoundary>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.5 }}
                      style={{ minHeight: "100vh" }}
                    >
                      <SessionHistory />
                    </motion.div>
                  </ErrorBoundary>
                </SubscriptionGuard>
              </RoleBasedRoute>
            } 
          />

          {/* Driver Session Completed Route - Protected and Subscription Guarded */}
          <Route 
            path="/driver/session/:sessionId/completed" 
            element={
              <RoleBasedRoute allowedRoles={["Driver"]}>
                <SubscriptionGuard>
                  <ErrorBoundary>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.5 }}
                      style={{ minHeight: "100vh" }}
                    >
                      <SessionCompleted />
                    </motion.div>
                  </ErrorBoundary>
                </SubscriptionGuard>
              </RoleBasedRoute>
            } 
          />

          {/* Driver Invoice Payment Route - Protected and Subscription Guarded */}
          <Route 
            path="/driver/invoice/:invoiceId" 
            element={
              <RoleBasedRoute allowedRoles={["Driver"]}>
                <SubscriptionGuard>
                  <ErrorBoundary>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.5 }}
                      style={{ minHeight: "100vh" }}
                    >
                      <InvoicePayment />
                    </motion.div>
                  </ErrorBoundary>
                </SubscriptionGuard>
              </RoleBasedRoute>
            } 
          />

          {/* Admin Routes - Protected */}
          <Route 
            path="/admin" 
            element={
              <RoleBasedRoute allowedRoles={["Admin"]}>
                <AdminLayout />
              </RoleBasedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="facilities" element={<FacilityList />} />
            <Route path="stations" element={<StationList />} />
            <Route path="charging-points" element={<ChargingPointList />} />
            <Route path="accounts" element={<AccountList />} />
            <Route path="admin-registration" element={<AdminRegistration />} />
            <Route path="subscriptions" element={<SubscriptionList />} />
            <Route path="reports" element={<Reports />} />
          </Route>

          {/* Staff Routes - Protected */}
          <Route path="/staff" element={
            <RoleBasedRoute allowedRoles={["Staff", "StationEmployee"]}>
              <StaffLayout />
            </RoleBasedRoute>
          }>
            <Route index element={<StaffHome />} />
            <Route path="dashboard" element={<StaffHome />} />
            <Route path="sessions" element={<StaffSession />} />
            <Route
              path="map"
              element={
                <MapErrorBoundary>
                  <div>Map component temporarily disabled</div>
                </MapErrorBoundary>
              }
            />
          </Route>

          {/* Redirect root to login if not authenticated */}
          <Route 
            path="/" 
            element={<Navigate to="/auth/login" replace />} 
          />
        </Routes>
      </AnimatePresence>
    </>
  );
}

export default App;

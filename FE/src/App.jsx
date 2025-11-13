import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import { useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { initializeAuth } from "./redux/auth/authSlice";
import LoginPage from "./Page/AuthPage/Login";
import ForgotPassword from "./Page/AuthPage/ForgotPassword";
import VerifyEmail from "./Page/AuthPage/VerifyEmail";
import FirstAdminRegistration from "./Page/AuthPage/FirstAdminRegistration";
import DriverPage from "./Page/DriverPage";
import DriverProfile from "./Page/DriverPage/DriverProfile";
import DriverVehicles from "./Page/DriverPage/DriverVehicles";
import { ActiveSession, SessionHistory, SessionCompleted } from "./Page/DriverPage/DriverSession";
import { InvoiceList as DriverInvoiceList, InvoiceDetail as DriverInvoiceDetail } from "./Page/DriverPage/DriverInvoice";
import SubscriptionSelectionPage from "./Page/DriverPage/SubscriptionSelection";
import { ActiveReservations, ReservationHistory, StartCharging } from "./Page/DriverPage/DriverReservations";
import MySubscription from "./Page/DriverPage/DriverSubscription";
import RoleBasedRoute from "./Components/RoleBasedRoute";
import SubscriptionGuard from "./Components/SubscriptionGuard";
import AdminLayout from "./Layout/Admin/AdminLayout";
import { 
  Dashboard,
  FacilityList, 
  StationList, 
  ChargingPointList,
  ChargersList,
  AccountList,
  AdminRegistration, 
  SubscriptionList,
  InvoiceList,
  AdminInvoicesDashboard,
  AdminInvoiceDetail,
  Reports
} from "./Page/AdminPage";
import AdminIncidents from "./Page/AdminPage/Incidents";
import AdminEmployees from "./Page/AdminPage/Employees";
import EmployeeLayout from "./Layout/Employee/EmployeeLayout";
import { 
  EmployeeProfile, 
  EmployeeMonitor 
} from "./Page/EmployeePage";
import EmployeeCashPayments from "./Page/EmployeePage/EmployeeCashPayments";
import EmployeeIncidentReports from "./Page/EmployeePage/EmployeeIncidentReports";
import VNPayCallback from "./Page/Payment/VNPayCallback";
import ErrorBoundary from "./Components/ErrorBoundary";
import LandingPage from "./Page/LandingPage/LandingPage";

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
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          {/* First Admin Registration Route - Public */}
          <Route
            path="/auth/first-admin-setup"
            element={
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                style={{ minHeight: "100vh" }}
              >
                <FirstAdminRegistration />
              </motion.div>
            }
          />

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

          <Route
            path="/forgot-password"
            element={
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                style={{ minHeight: "100vh" }}
              >
                <ForgotPassword />
              </motion.div>
            }
          />

          {/* VNPay Payment Callback */}
          <Route path="/payment/vnpay/callback" element={<VNPayCallback />} />

          <Route
            path="/verify-email"
            element={
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                style={{ minHeight: "100vh" }}
              >
                <VerifyEmail />
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

          {/* Driver Invoices List Route - Protected and Subscription Guarded */}
          <Route 
            path="/driver/invoices" 
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
                      <DriverInvoiceList />
                    </motion.div>
                  </ErrorBoundary>
                </SubscriptionGuard>
              </RoleBasedRoute>
            } 
          />

          {/* Driver Invoice Detail Route - Protected and Subscription Guarded */}
          <Route 
            path="/driver/invoices/:invoiceId" 
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
                      <DriverInvoiceDetail />
                    </motion.div>
                  </ErrorBoundary>
                </SubscriptionGuard>
              </RoleBasedRoute>
            } 
          />

          {/* Driver Active Reservations Route - Protected and Subscription Guarded */}
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
                      <ActiveReservations />
                    </motion.div>
                  </ErrorBoundary>
                </SubscriptionGuard>
              </RoleBasedRoute>
            } 
          />

          {/* Driver Reservation History Route - Protected and Subscription Guarded */}
          <Route 
            path="/driver/reservations/history" 
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
                      <ReservationHistory />
                    </motion.div>
                  </ErrorBoundary>
                </SubscriptionGuard>
              </RoleBasedRoute>
            } 
          />

          {/* Driver Start Charging Route - Protected and Subscription Guarded */}
          <Route 
            path="/driver/start-charging" 
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
                      <StartCharging />
                    </motion.div>
                  </ErrorBoundary>
                </SubscriptionGuard>
              </RoleBasedRoute>
            } 
          />

          {/* Driver My Subscription Route - Protected and Subscription Guarded */}
          <Route 
            path="/driver/my-subscription" 
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
                      <MySubscription />
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
            <Route path="chargers" element={<ChargersList />} />
            <Route path="accounts" element={<AccountList />} />
            <Route path="admin-registration" element={<AdminRegistration />} />
            <Route path="employees" element={<AdminEmployees />} /> {/* NEW: Employee Management */}
            <Route path="subscriptions" element={<SubscriptionList />} />
            <Route path="invoices" element={<AdminInvoicesDashboard />} />
            <Route path="invoices/:id" element={<AdminInvoiceDetail />} />
            <Route path="invoices-old" element={<InvoiceList />} /> {/* Keep old for reference */}
            <Route path="incidents" element={<AdminIncidents />} /> {/* NEW: Incident Reports */}
            <Route path="reports" element={<Reports />} />
          </Route>

          {/* Employee Routes - Protected */}
          <Route 
            path="/employee" 
            element={
              <RoleBasedRoute allowedRoles={["STATION_EMPLOYEE"]}>
                <ErrorBoundary>
                  <EmployeeLayout />
                </ErrorBoundary>
              </RoleBasedRoute>
            }
          >
            <Route index element={<Navigate to="/employee/monitor" replace />} />
            <Route path="monitor" element={
              <ErrorBoundary>
                <EmployeeMonitor />
              </ErrorBoundary>
            } />
            <Route path="cash-payments" element={
              <ErrorBoundary>
                <EmployeeCashPayments />
              </ErrorBoundary>
            } />
            <Route path="incidents" element={
              <ErrorBoundary>
                <EmployeeIncidentReports />
              </ErrorBoundary>
            } />
            <Route path="profile" element={
              <ErrorBoundary>
                <EmployeeProfile />
              </ErrorBoundary>
            } />
          </Route>



          {/* Redirect root to landing page */}
          <Route 
            path="/" 
            element={<LandingPage />} 
          />
        </Routes>
      </AnimatePresence>
    </>
  );
}

export default App;

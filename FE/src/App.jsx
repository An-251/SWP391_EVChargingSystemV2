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
import AdminPage from "./Page/AdminPage";
import RoleBasedRoute from "./Components/RoleBasedRoute";

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

          {/* Driver Routes - Protected */}
          <Route 
            path="/driver" 
            element={
              <RoleBasedRoute allowedRoles={["Driver"]}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                  style={{ minHeight: "100vh" }}
                >
                  <DriverPage />
                </motion.div>
              </RoleBasedRoute>
            } 
          />

          {/* Admin Routes - Protected */}
          <Route 
            path="/admin/dashboard" 
            element={
              <RoleBasedRoute allowedRoles={["Admin"]}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                  style={{ minHeight: "100vh" }}
                >
                  <AdminPage />
                </motion.div>
              </RoleBasedRoute>
            } 
          />

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

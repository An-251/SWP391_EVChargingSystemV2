import 'bootstrap/dist/css/bootstrap.min.css';
import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import Home from "./Page/HomePage/Home";
import { useRef } from "react";
import backgroundMusic from "./assets/backgroundmusic.mp3";
import Map from "./Component/Map";
import StaffSession from "./Page/Staff/StaffSession/Session";
import LoginPage from "./Page/AuthPage/Login";
import StaffLayout from "./Layout/Staff/StaffLayout";
import StaffHome from "./Page/Staff/StaffHome/Home";

// Error boundary component for Map
function MapErrorBoundary({ children }) {
  try {
    return children;
  } catch (error) {
    return <div>Map is currently unavailable. Please try again later.</div>;
  }
}

function App() {
  const location = useLocation();
  const audioRef = useRef(null);

  return (
    <>
      <audio ref={audioRef} src={backgroundMusic} loop />
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route
            path="/"
            element={
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                style={{ minHeight: "100vh" }}
              >
                <Home />
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

          {/* Staff Routes */}
          <Route path="/staff" element={<StaffLayout />}>
            <Route index path="dashboard" element={<StaffHome />} />
            <Route path="sessions" element={<StaffSession />} />
            <Route
              path="map"
              element={
                <MapErrorBoundary>
                  <Map />
                </MapErrorBoundary>
              }
            />
          </Route>
        </Routes>
      </AnimatePresence>
    </>
  );
}

export default App;

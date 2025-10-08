import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import Home from "./Page/HomePage/Home";
import LoginPage from "./Page/AuthPage/Login";
import MusicPlayer from "./Component/MusicPlayer";
import { useEffect, useRef, useState } from "react";
import backgroundMusic from "./assets/backgroundmusic.mp3";
import Header from "./Page/HomePage/Header";
function App() {
  const location = useLocation();
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = 0.3;
      if (isPlaying) audioRef.current.play();
      else audioRef.current.pause();
    }
  }, [isPlaying]);

  const toggleMusic = () => setIsPlaying((prev) => !prev);
  return (
    <>
      <audio ref={audioRef} src={backgroundMusic} loop />
      <Header isPlaying={isPlaying} toggleMusic={toggleMusic} />
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
        </Routes>
      </AnimatePresence>
    </>
  );
}

export default App;

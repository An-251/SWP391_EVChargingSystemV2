import React, { useRef, useEffect } from "react";
import backgroundMusic from "../assets/backgroundmusic.mp3";
import { Music4 } from "lucide-react";

export default function MusicPlayer() {
  const audioRef = useRef(null);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = 0.3; // 30% âm lượng
    }
  }, []);

  const toggleMusic = () => {
    if (audioRef.current.paused) {
      audioRef.current.play();
    } else {
      audioRef.current.pause();
    }
  };

  return (
    <div className="flex justify-center items-center mt-6">
      <audio ref={audioRef} src={backgroundMusic} loop />
      <button onClick={toggleMusic} className="mb-6 ">
        <Music4 />
      </button>
    </div>
  );
}

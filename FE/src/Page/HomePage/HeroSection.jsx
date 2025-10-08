"use client";

import { Zap, MapPin } from "lucide-react";
import { useEffect, useState } from "react";
import BlurText from "../../Animation/BlurText";
import VideoTest from "./VideoTest";

export default function HeroSection() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <section className="relative min-h-[90vh] flex items-center px-6 py-20 font-sans overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0 bg-[url('https://i.pinimg.com/736x/93/cf/3a/93cf3ac40353492577b3af94dc78c914.jpg')] bg-cover bg-center">
        <VideoTest />
      </div>

      <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/40 via-teal-800/30 to-blue-900/40"></div>
      <div className="absolute inset-0 backdrop-blur-[2px]"></div>

      <div className="absolute top-20 left-10 w-20 h-20 bg-emerald-400/20 rounded-full blur-2xl animate-pulse"></div>
      <div className="absolute bottom-32 right-20 w-32 h-32 bg-teal-400/20 rounded-full blur-3xl animate-pulse delay-700"></div>
      <div className="absolute top-1/2 right-1/4 w-16 h-16 bg-blue-400/20 rounded-full blur-xl animate-bounce"></div>

      {/* Content */}
      <div className="relative max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center w-full z-10">
        {/* Left side - Info with glassmorphism */}
        <div
          className={`flex flex-col items-start md:col-span-1 transition-all duration-1000 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20 shadow-2xl">
            {/* Badge */}
            <div className="mb-6 px-4 py-2 bg-emerald-400/20 backdrop-blur-sm rounded-full border border-emerald-300/30 flex items-center gap-2 w-fit">
              <Zap className="w-4 h-4 text-emerald-300" />
              <span className="text-emerald-100 text-sm font-semibold">
                Smart EV Charging Solutions
              </span>
            </div>

            <BlurText
              as="h1"
              text={`Find & Reserve EV Charging Stations`}
              className="text-4xl sm:text-6xl font-bold text-white leading-tight"
            />

            {/* Subheading */}
            <p className="mt-6 text-lg text-gray-100 max-w-xl leading-relaxed">
              Discover nearby charging stations, check real-time availability,
              and reserve your spot with our intelligent EV charging management
              system.
            </p>

            <div className="mt-8">
              <button className="group relative px-8 py-4 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-white font-semibold rounded-xl shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-emerald-500/50 hover:shadow-2xl flex items-center gap-2 cursor-pointer">
                <MapPin className="w-5 h-5 group-hover:animate-bounce" />
                Find a Station
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-300"></div>
              </button>
            </div>
          </div>
        </div>

        {/* Right side - Illustration */}
        <div
          className={`flex justify-center md:justify-end md:col-span-1 w-full transition-all duration-1000 delay-300 ${
            isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8"
          }`}
        >
          <div className="relative overflow-hidden w-full max-w-full p-3 rounded-3xl shadow-2xl bg-white/10 backdrop-blur-lg border border-white/20">
            <img
              src="https://i.pinimg.com/736x/93/cf/3a/93cf3ac40353492577b3af94dc78c914.jpg"
              alt="EV Charging Station with modern electric vehicle"
              className="w-full h-[500px] object-cover rounded-2xl"
            />
            {/* Subtle inner glow */}
            <div className="absolute inset-3 rounded-2xl bg-gradient-to-tr from-emerald-500/10 to-transparent pointer-events-none"></div>
          </div>
        </div>
      </div>
    </section>
  );
}

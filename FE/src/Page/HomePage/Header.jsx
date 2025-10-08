/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Music4Icon, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import { use } from "react";
import { motion } from "motion/react";
import { label } from "framer-motion/client";
import MusicPlayer from "../../Component/MusicPlayer";
export default function Header({ isPlaying, toggleMusic }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const navigate = useNavigate();

  const navLinks = [
    { href: "/#features", label: "Features" },
    { href: "/#pricing", label: "Pricing" },
    { href: "/#about", label: "About" },
    { href: "/#contact", label: "Contact" },
    {
      href: "#music",
      label: (
        <Music4Icon
          size={24}
          className={`cursor-pointer transition-colors duration-300 ${
            isPlaying ? "text-green-500" : "text-gray-500"
          }`}
          onClick={toggleMusic}
        />
      ),
    },
  ];

  const goToLoginTab = () => {
    navigate("/auth/login", { state: "signup" });
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-white/80 backdrop-blur-lg shadow-lg border-b border-emerald-100/20"
          : "bg-white/60 backdrop-blur-sm"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center flex-shrink-0 group">
            <motion.div
              className="flex items-center gap-2 cursor-pointer"
              whileHover={{ scale: 1.1, rotate: 10 }}
              whileTap={{ scale: 0.95, rotate: 0 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Zap
                size={36}
                className="text-emerald-500 group-hover:text-teal-500 transition-all duration-300 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full blur-lg opacity-0 group-hover:opacity-50 transition-opacity duration-300"></div>
              <span className="text-2xl font-bold bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">
                ChargePro
              </span>
            </motion.div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="flex items-center gap-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="relative px-4 py-2 text-gray-700 font-medium text-sm group overflow-hidden"
              >
                <span className="relative z-10 group-hover:text-emerald-600 transition-colors duration-300">
                  {link.label}
                </span>
                {/* Sliding underline effect */}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 group-hover:w-full transition-all duration-300 ease-out"></span>
              </Link>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="flex items-center gap-3">
            <button
              className="px-5 py-2 text-emerald-600 font-semibold text-sm rounded-lg hover:bg-emerald-50 transition-all duration-300 cursor-pointer"
              onClick={() => navigate("/auth/login")}
            >
              Login
            </button>

            <button
              onClick={goToLoginTab}
              className="group relative px-5 py-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-white font-semibold text-sm rounded-lg shadow-md transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-emerald-500/30 overflow-hidden cursor-pointer"
            >
              <span className="relative z-10">Sign Up</span>
              {/* Glow effect on hover */}
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 opacity-0 group-hover:opacity-30 blur-xl transition-opacity duration-300"></div>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

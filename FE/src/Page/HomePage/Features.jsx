"use client";

import { useEffect, useState } from "react";
import {
  ThunderboltOutlined,
  SafetyCertificateOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import {
  HandPlatter as ChartScatter,
  ReceiptText,
  Workflow,
  Zap,
} from "lucide-react";

export default function Features() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const features = [
    {
      icon: <ThunderboltOutlined className="text-3xl" />,
      title: "Fast & Smart Charging",
      desc: "Charge your EV quickly with optimized load balancing and smart scheduling.",
      gradient: "from-emerald-500 to-teal-500",
      glowColor: "emerald",
    },
    {
      icon: <SafetyCertificateOutlined className="text-3xl" />,
      title: "Secure & Reliable",
      desc: "End-to-end encrypted data and monitoring to ensure safety for all users.",
      gradient: "from-blue-500 to-cyan-500",
      glowColor: "blue",
    },
    {
      icon: <ClockCircleOutlined className="text-3xl" />,
      title: "24/7 Availability",
      desc: "Find and reserve charging stations anytime, anywhere without waiting.",
      gradient: "from-amber-500 to-orange-500",
      glowColor: "amber",
    },
    {
      icon: <ReceiptText className="w-7 h-7" />,
      title: "Digital Invoices",
      desc: "Automatically receive detailed invoices and track your charging history and expenses.",
      gradient: "from-indigo-500 to-purple-500",
      glowColor: "indigo",
    },
    {
      icon: <ChartScatter className="w-7 h-7" />,
      title: "Usage Analytics",
      desc: "Monitor your charging patterns, costs, and carbon footprint with detailed analytics.",
      gradient: "from-violet-500 to-fuchsia-500",
      glowColor: "violet",
    },
    {
      icon: <Workflow className="w-7 h-7" />,
      title: "Mobile App Integration",
      desc: "Control everything from your smartphone with our intuitive mobile application.",
      gradient: "from-pink-500 to-rose-500",
      glowColor: "pink",
    },
  ];

  return (
    <section className="relative py-20 px-6 overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Background decorative elements */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-emerald-400/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 right-10 w-40 h-40 bg-teal-400/10 rounded-full blur-3xl"></div>
      <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-cyan-400/5 rounded-full blur-3xl"></div>

      <div className="relative max-w-7xl mx-auto">
        {/* Header */}
        <div
          className={`text-center mb-16 transition-all duration-1000 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          {/* Badge */}
          <div className="custom-tag">
            <Zap className="w-6 h-6 text-emerald-500 text-2xl" />
            Smart Features
          </div>

          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4 mt-6">
            Everything You Need for{" "}
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
              Smart Charging
            </span>
          </h2>
          <p className="text-lg text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Our comprehensive platform provides all the tools you need to make
            EV charging simple, efficient, and reliable.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {features.map((feature, index) => (
            <div
              key={index}
              className={`group relative bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10 shadow-xl transition-all duration-500 hover:scale-105 hover:bg-white/10 hover:border-white/20 hover:shadow-2xl ${
                isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-8"
              }`}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              {/* Hover glow effect */}
              <div
                className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-10 blur-xl transition-opacity duration-500`}
              ></div>

              {/* Icon container with gradient */}
              <div
                className={`relative w-16 h-16 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-5 shadow-lg group-hover:shadow-${feature.glowColor}-500/50 transition-shadow duration-300`}
              >
                <div className="text-white">{feature.icon}</div>
              </div>

              {/* Content */}
              <h3 className="text-xl font-bold text-white mb-3 group-hover:text-emerald-300 transition-colors duration-300">
                {feature.title}
              </h3>
              <p className="text-gray-300 leading-relaxed">{feature.desc}</p>

              {/* Bottom accent line */}
              <div
                className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-b-2xl`}
              ></div>
            </div>
          ))}
        </div>

        {/* Bottom CTA Card */}
        <div
          className={`relative bg-white/5 backdrop-blur-md rounded-2xl p-8 border border-white/10 shadow-xl transition-all duration-1000 delay-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg">
                <SafetyCertificateOutlined className="text-2xl text-white" />
              </div>
              <span className="text-white font-semibold text-lg">
                Trusted by thousands of EV drivers worldwide
              </span>
            </div>
            <p className="text-gray-300 text-base max-w-2xl">
              Join our growing community and experience the future of EV
              charging today.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

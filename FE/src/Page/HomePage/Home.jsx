/* eslint-disable react/no-unknown-property */
/* eslint-disable no-unused-vars */

import CustomerStories from "./CustomerStories";
import Features from "./Features";
import AppFooter from "./Footer";
import Header from "./Header";
import HeroSection from "./HeroSection";
import PricingPlan from "./PricingPlan";
import VideoTest from "./VideoTest";
export default function Home() {
  return (
    <>
      <div>
        <HeroSection />
        <Features />
        <CustomerStories />
        <PricingPlan />
        <AppFooter />
      </div>

      <style jsx>{`
        section {
          font-family: "Poppins", sans-serif; /* áp dụng toàn bộ text trong section */
        }

        .custom-tag {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          background-color: rgb(209 250 229) !important;
          border-color: rgb(187 247 208) !important;
          color: rgb(5 150 105) !important;
          border-radius: 9999px !important;
          padding: 20px 30px !important;
          font-weight: 500 !important;
          font-size: 18px !important;
        }

        .custom-card {
          margin-top: 50px;
          margin-bottom: 50px;
          background: linear-gradient(to right, #ecfdf5, #eff6ff);
          font-family: "Poppins", sans-serif;
        }

        .custom-card:hover {
          border: 1px solid #10b981;
          box-shadow: 0 12px 24px rgba(16, 185, 129, 0.25); /* shadow xanh lá */
          transform: translateY(-6px); /* nổi lên */
        }

        .ant-typography {
          font-family: "Poppins", sans-serif !important;
        }

        .ant-btn {
          border-radius: 8px;
          background-color: #111827;
          transition: all 0.3s ease; /* hiệu ứng mượt */
        }

        .ant-btn-primary:hover {
          background: #10b981 !important;
          color: #fff !important;
        }
      `}</style>
    </>
  );
}

"use client";

import { motion } from "framer-motion";

import { Card } from "antd";
import { ClockCircleOutlined } from "@ant-design/icons";
import { TruckElectric } from "lucide-react";
import SessionInformation from "../Components/Session-Component/SessionInformation";
import PaymentInformation from "../Components/Session-Component/PaymentInformation";
import StaffNotes from "../Components/Session-Component/StaffNote";

export default function ChargingSessionDetail() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="p-6 space-y-6"
    >
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <div className="p-3 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-xl shadow-lg">
          <TruckElectric className="w-7 h-7 text-white" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">
          Charging Session Details
        </h1>
      </div>

      {/* Grid 60/40 */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left column (Session Info + Timeline) */}
        <div className="lg:col-span-3 space-y-6">
          <SessionInformation />

          {/* Session Timeline */}
          <div className="mt-6">
            <Card
              title={
                <div className="flex items-center gap-2">
                  <ClockCircleOutlined className="text-blue-500" />
                  <span>Session Timeline</span>
                </div>
              }
              className="shadow-md rounded-xl"
            >
              <div className="space-y-4">
                <div>
                  <div className="flex items-center">
                    <span className="w-3 h-3 bg-green-500 rounded-full mr-2" />
                    <strong>Session Initiated</strong>
                  </div>
                  <p className="text-gray-500 ml-6">
                    User authenticated and charging session started at Downtown
                    Charging Hub.
                  </p>
                </div>

                <div>
                  <div className="flex items-center">
                    <span className="w-3 h-3 bg-blue-500 rounded-full mr-2" />
                    <strong>Charging in Progress</strong>
                  </div>
                  <p className="text-gray-500 ml-6">
                    Vehicle charging at an average rate of 23.8 kW. Total energy
                    delivered: 35.7 kWh.
                  </p>
                </div>

                <div>
                  <div className="flex items-center">
                    <span className="w-3 h-3 bg-green-500 rounded-full mr-2" />
                    <strong>Session Completed</strong>
                  </div>
                  <p className="text-gray-500 ml-6">
                    Charging session ended normally. Payment processed
                    successfully.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Right column (Payment Info) */}
        <div className="lg:col-span-2 space-y-6">
          <PaymentInformation />
          <StaffNotes />
        </div>
      </div>
    </motion.div>
  );
}

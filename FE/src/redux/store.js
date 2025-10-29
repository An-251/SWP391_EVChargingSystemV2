// src/redux/store.js
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./auth/authSlice"; // Import reducer từ authSlice
import stationReducer from "./station/stationSlice"; // Import station reducer
import adminReducer from "./admin/adminSlice"; // Import admin reducer
import vehicleReducer from "./vehicle/vehicleSlice"; // Import vehicle reducer
import sessionReducer from "./session/sessionSlice"; // Import session reducer
import subscriptionReducer from "./subscription/subscriptionSlice"; // Import subscription reducer

const store = configureStore({
  reducer: {
    auth: authReducer, // Đăng ký authReducer dưới key 'auth'
    station: stationReducer, // Đăng ký stationReducer dưới key 'station'
    admin: adminReducer, // Đăng ký adminReducer dưới key 'admin'
    vehicle: vehicleReducer, // Đăng ký vehicleReducer dưới key 'vehicle'
    session: sessionReducer, // Đăng ký sessionReducer dưới key 'session'
    subscription: subscriptionReducer, // Đăng ký subscriptionReducer dưới key 'subscription'
  },
  // DevTools được bật mặc định trong môi trường phát triển
});

export default store;

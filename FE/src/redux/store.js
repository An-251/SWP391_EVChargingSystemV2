// src/redux/store.js
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./auth/authSlice"; // Import reducer từ authSlice
import stationReducer from "./station/stationSlice"; // Import station reducer
import adminReducer from "./admin/adminSlice"; // Import admin reducer

const store = configureStore({
  reducer: {
    auth: authReducer, // Đăng ký authReducer dưới key 'auth'
    station: stationReducer, // Đăng ký stationReducer dưới key 'station'
    admin: adminReducer, // Đăng ký adminReducer dưới key 'admin'
  },
  // DevTools được bật mặc định trong môi trường phát triển
});

export default store;

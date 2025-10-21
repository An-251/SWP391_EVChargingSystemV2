import axios from "axios";

// Create API instance
const api = axios.create({
  baseURL: "http://localhost:8080/api",
  headers: {
    "Content-Type": "application/json",
  },
  // withCredentials: true, // Temporarily disabled for testing
});

// Interceptor để thêm Authorization token vào mỗi request
api.interceptors.request.use(
  (config) => {
    // Simplified logging - only essential info
    console.log(`🚀 [AXIOS] ${config.method?.toUpperCase()} ${config.url}`);
    if (config.data) {
      console.log("� [AXIOS] Request body:", config.data);
    }
    
    const accessToken = localStorage.getItem("accessToken");

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
  },
  (error) => {
    console.error("❌ [AXIOS] Request error:", error);
    return Promise.reject(error);
  }
);

// Interceptor để xử lý lỗi response (ví dụ: logout nếu token hết hạn)
api.interceptors.response.use(
  (response) => {
    // Log response briefly - show data structure
    console.log(`✅ [AXIOS] ${response.config.method?.toUpperCase()} ${response.config.url} → Status ${response.status}`);
    console.log("📥 [AXIOS] Response data:", response.data);
    
    // IMPORTANT: Do NOT modify response.data here!
    // Return original response to preserve BE structure
    return response;
  },
  (error) => {
    console.error("❌ [AXIOS] Response error:", error.message);
    if (error.response) {
      console.error("❌ [AXIOS] Error status:", error.response.status);
      console.error("❌ [AXIOS] Error data:", error.response.data);
    }
    
    if (error.response && error.response.status === 401) {
      // Token hết hạn hoặc không hợp lệ, chuyển hướng về trang đăng nhập
      localStorage.removeItem("accessToken");
      localStorage.removeItem("currentUser");
      // window.location.href = '/login'; // Có thể dùng navigate nếu trong component React
    }
    return Promise.reject(error);
  }
);

export default api;

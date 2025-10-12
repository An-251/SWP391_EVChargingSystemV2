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
    console.log("🚀 [AXIOS] Request config:", config);
    console.log("🚀 [AXIOS] Request URL:", config.url);
    console.log("🚀 [AXIOS] Request method:", config.method);
    console.log("🚀 [AXIOS] Request data:", config.data);
    
    const accessToken = localStorage.getItem("accessToken");

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
  },
  (error) => {
    console.error("❌ [AXIOS] Request interceptor error:", error);
    return Promise.reject(error);
  }
);

// Interceptor để xử lý lỗi response (ví dụ: logout nếu token hết hạn)
api.interceptors.response.use(
  (response) => {
    console.log("✅ [AXIOS] Response received:", response);
    return response;
  },
  (error) => {
    console.error("❌ [AXIOS] Response interceptor error:", error);
    console.error("❌ [AXIOS] Error details:", {
      message: error.message,
      code: error.code,
      config: error.config,
      response: error.response
    });
    
    if (error.response && error.response.status === 401) {
      // Token hết hạn hoặc không hợp lệ, chuyển hướng về trang đăng nhập
      localStorage.removeItem("accessToken");
      localStorage.removeItem("currentUser"); // Hoặc 'user'
      // window.location.href = '/login'; // Có thể dùng navigate nếu trong component React
    }
    return Promise.reject(error);
  }
);

export default api;

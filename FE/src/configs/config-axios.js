import axios from "axios";

// Create API instance
const api = axios.create({
  baseURL: "http://localhost:5173//api",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: false,
});

// Interceptor để thêm Authorization token vào mỗi request
api.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem("accessToken");

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor để xử lý lỗi response (ví dụ: logout nếu token hết hạn)
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
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

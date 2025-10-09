// src/redux/auth/authSlice.js (Hoặc src/store/authSlice.js)
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../configs/config-axios";

const initialState = {
  user: null,
  isAuthenticated: false,
  isAuthInitialized: false,
  loading: false,
  error: null,
  notificationMessage: null,
  notificationType: null, // 'success', 'error', 'info', 'warning'
  success: false,
};

export const loginUser = createAsyncThunk("loginUser", async (values, { rejectWithValue }) => {
  try {
    const response = await api.post("/login", values);

    // Giả sử API trả về user info và token
    const { token, user } = response.data;

    // Lưu token vào localStorage (hoặc sessionStorage) để duy trì trạng thái đăng nhập
    localStorage.setItem("accessToken", token);
    localStorage.setItem("currentUser", JSON.stringify(user));

    return { user, token };
  } catch (error) {
    // Xử lý lỗi từ API
    let errorMessage = "Đăng nhập thất bại. Vui lòng thử lại.";

    if (error.response) {
      if (error.response.status === 401) {
        errorMessage = "Sai tài khoản hoặc mật khẩu. Vui lòng kiểm tra lại!";
      } else if (error.response.data && error.response.data.message) {
        errorMessage = error.response.data.message;
      }
    }

    return rejectWithValue(errorMessage);
  }
});

export const sendOtp = createAsyncThunk("auth/sendOtp", async (credentials, { rejectWithValue }) => {
  try {
    console.log("Sending forgot password request:", credentials);

    // Xử lý dựa trên loại định danh (email hoặc phone)
    const { identifier } = credentials;
    const trimmedIdentifier = identifier.trim();

    // Tạo request data dựa trên loại
    const requestData = { username: trimmedIdentifier };

    console.log("Formatted request data:", requestData);

    // This endpoint will check if the email/phone exists and send a reset token
    const response = await api.post("/login/forgot-password", requestData);
    console.log("Success response:", response.data);

    // Store userId from response for reset password step
    if (response.data && response.data.userId) {
      localStorage.setItem("resetUserId", response.data.userId);
    }

    return response.data;
  } catch (error) {
    let errorMessage = "Không thể gửi yêu cầu khôi phục mật khẩu. Vui lòng thử lại.";

    console.log("Error response:", error);
    console.log("Error response details:", {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });

    if (error.response) {
      if (error.response.status === 404) {
        errorMessage = "Không tìm thấy tài khoản với thông tin này.";
      } else if (error.response.status === 400) {
        errorMessage = error.response.data.message || "Định dạng không hợp lệ.";
      } else if (error.response.data && error.response.data.message) {
        errorMessage = error.response.data.message;
      }
    }

    return rejectWithValue(errorMessage);
  }
});

export const resetPassword = createAsyncThunk("auth/resetPassword", async (credentials, { rejectWithValue }) => {
  try {
    // Get userId from localStorage that was saved during sendOtp
    const userId = localStorage.getItem("resetUserId");

    if (!userId) {
      return rejectWithValue("Phiên làm việc đã hết hạn. Vui lòng thực hiện lại quá trình quên mật khẩu.");
    }

    const requestData = {
      user_id: parseInt(userId),
      newPass: credentials.password,
      confirmPass: credentials.confirmPassword,
    };

    console.log("Sending reset password request:", requestData);

    const response = await api.post("/login/reset-password", requestData);
    return response.data;
  } catch (error) {
    let errorMessage = "Không thể đặt lại mật khẩu. Vui lòng thử lại.";

    console.log("Reset password error:", error);

    if (error.response && error.response.data && error.response.data.message) {
      errorMessage = error.response.data.message;
    }
    return rejectWithValue(errorMessage);
  }
});

// initializeAuth thunk của bạn
export const initializeAuth = createAsyncThunk("auth/initializeAuth", async (_, { dispatch, rejectWithValue }) => {
  // Added rejectWithValue here
  try {
    const accessToken = localStorage.getItem("accessToken");
    const currentUser = localStorage.getItem("currentUser");

    console.log(currentUser);

    if (accessToken && currentUser) {
      const user = JSON.parse(currentUser);
      dispatch(authSlice.actions.setAuth({ user, accessToken }));
    }
    dispatch(authSlice.actions.finishAuthInitialization());
    return true; // Mark as fulfilled
  } catch (error) {
    console.error("Failed to initialize auth from localStorage", error);
    localStorage.removeItem("accessToken");
    localStorage.removeItem("currentUser");
    dispatch(authSlice.actions.finishAuthInitialization());
    return rejectWithValue("Không thể tải thông tin đăng nhập. Vui lòng đăng nhập lại.");
  }
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAuth: (state, action) => {
      state.user = action.payload.user;
      state.isAuthenticated = true;
      state.isAuthInitialized = true;
      state.loading = false;
      state.authInitializationError = null;
    },
    // Reducer để đánh dấu quá trình khởi tạo đã hoàn tất (dù thành công hay thất bại)
    finishAuthInitialization: (state) => {
      state.isAuthInitialized = true;
    },
    // Reducer để đặt thông báo lỗi cụ thể cho quá trình khởi tạo xác thực
    setAuthInitializationError: (state, action) => {
      state.authInitializationError = action.payload;
      state.isAuthInitialized = true; // Also mark as initialized to prevent UI from hanging
    },
    clearNotification: (state) => {
      state.notificationMessage = null;
      state.notificationType = null;
    },
    logout: (state) => {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("currentUser");
      state.user = null;
      state.isAuthenticated = false;
      state.error = null;
      state.notificationMessage = null;
      state.notificationType = null;
      state.isAuthInitialized = true; // Keep true after logout to prevent initial loading state issues
      state.authInitializationError = null; // Clear error on logout
    },
    // Keep clearAuthError (if you intend to use it specifically for auth-related errors)
    clearAuthError: (state) => {
      state.error = null;
    },
    clearAuthSuccess: (state) => {
      state.success = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.notificationMessage = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.error = action.payload;
        state.notificationMessage = action.payload;
        state.notificationType = "error";
      })
      // Cases for initializeAuth thunk - these are also important!
      .addCase(initializeAuth.pending, (state) => {
        state.isAuthInitialized = false; // Reset to false when re-initializing
        state.authInitializationError = null;
      })
      .addCase(initializeAuth.fulfilled, (state, action) => {
        state.isAuthInitialized = true;
        state.authInitializationError = null;
        // If user data was returned, update the state
        if (action.payload?.user) {
          state.user = action.payload.user;
          state.isAuthenticated = true;
        }
      })
      .addCase(initializeAuth.rejected, (state, action) => {
        state.isAuthInitialized = true; // Mark as initialized even on rejection to prevent hanging UI
        state.authInitializationError = action.payload || "Lỗi khởi tạo xác thực không xác định.";
      })

      .addCase(sendOtp.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(sendOtp.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
        state.success = true;
      })
      .addCase(sendOtp.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Không thể gửi email khôi phục";
        state.success = false;
      })

      // Add cases for resetPassword
      .addCase(resetPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(resetPassword.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
        state.success = true;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Đặt lại mật khẩu thất bại";
      });
  },
});

// EXPORT ALL NEW ACTIONS
export const {
  logout,
  clearAuthError,
  clearAuthSuccess,
  finishAuthInitialization, // <-- NEWLY EXPORTED
} = authSlice.actions;

export default authSlice.reducer;

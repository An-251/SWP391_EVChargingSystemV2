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
    console.log("🚀 [LOGIN] Starting login request with values:", values);
    
    // Chuyển đổi email thành username và gọi đúng endpoint
    const loginData = {
      username: values.username, // BE mong đợi username field, không phải email
      password: values.password
    };
    
    console.log("📤 [LOGIN] Sending request to /auth/login with data:", loginData);
    console.log("📍 [LOGIN] Full URL:", "http://localhost:8080/api/auth/login");
    
    const response = await api.post("/auth/login", loginData);

    console.log("✅ [LOGIN] Response received:", response);
    console.log("📥 [LOGIN] Response data:", response.data);

    // BE trả về cấu trúc: { success, message, data: { token, account } }
    const { token, account } = response.data.data;

    console.log("🔑 [LOGIN] Token:", token);
    console.log("👤 [LOGIN] Account:", account);
    console.log("🚗 [LOGIN] Driver ID:", account.driverId);

    // Lưu token vào localStorage (hoặc sessionStorage) để duy trì trạng thái đăng nhập
    localStorage.setItem("accessToken", token);
    localStorage.setItem("currentUser", JSON.stringify(account));

    console.log("💾 [LOGIN] Saved to localStorage successfully");

    return { user: account, token };
  } catch (error) {
    console.error("❌ [LOGIN] Error occurred:", error);
    console.error("📄 [LOGIN] Error response:", error.response?.data);
    console.error("🔢 [LOGIN] Error status:", error.response?.status);
    console.error("📍 [LOGIN] Error config:", error.config);

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

export const registerUser = createAsyncThunk("registerUser", async (values, { rejectWithValue }) => {
  try {
    console.log("🚀 [REGISTER] Starting register request with values:", values);
    
    // Tạo register data theo format BE expect
    const registerData = {
      username: values.username,
      email: values.email,
      password: values.password
    };
    
    console.log("📤 [REGISTER] Sending request to /auth/register with data:", registerData);
    console.log("📍 [REGISTER] Full URL:", "http://localhost:8080/api/auth/register");
    
    const response = await api.post("/auth/register", registerData);

    console.log("✅ [REGISTER] Response received:", response);
    console.log("📥 [REGISTER] Response data:", response.data);
    
    // BE trả về: { success, message, data: { message, id, username, email, role, token, driverId } }
    const registrationResult = response.data.data;
    console.log("🚗 [REGISTER] Driver ID created:", registrationResult?.driverId);

    return response.data;
  } catch (error) {
    console.error("❌ [REGISTER] Error occurred:", error);
    console.error("📄 [REGISTER] Error response:", error.response?.data);
    console.error("🔢 [REGISTER] Error status:", error.response?.status);
    console.error("📍 [REGISTER] Error config:", error.config);

    // Xử lý lỗi từ API
    let errorMessage = "Đăng ký thất bại. Vui lòng thử lại.";

    if (error.response) {
      if (error.response.status === 400) {
        errorMessage = error.response.data.message || "Username đã tồn tại!";
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

// Get Current User Profile thunk
export const getCurrentProfile = createAsyncThunk("auth/getCurrentProfile", async (_, { rejectWithValue }) => {
  try {
    console.log("🚀 [GET_PROFILE] Fetching current user profile...");
    
    const response = await api.get("/accounts/profile");
    
    console.log("✅ [GET_PROFILE] Response received:", response);
    console.log("📥 [GET_PROFILE] Response data:", response.data);
    
    // Backend returns { success, message, data: { account } }
    const accountData = response.data.data || response.data;
    
    // Update localStorage
    localStorage.setItem("currentUser", JSON.stringify(accountData));
    
    console.log("💾 [GET_PROFILE] Updated localStorage successfully");
    
    return accountData;
  } catch (error) {
    console.error("❌ [GET_PROFILE] Error occurred:", error);
    console.error("📄 [GET_PROFILE] Error response:", error.response?.data);
    
    let errorMessage = "Không thể tải thông tin profile.";
    
    if (error.response) {
      if (error.response.status === 401) {
        errorMessage = "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.";
      } else if (error.response.data && error.response.data.message) {
        errorMessage = error.response.data.message;
      }
    }
    
    return rejectWithValue(errorMessage);
  }
});

// Update Driver Profile thunk
export const updateDriverProfile = createAsyncThunk("auth/updateDriverProfile", async (profileData, { rejectWithValue }) => {
  try {
    console.log("� [UPDATE_PROFILE] Starting update profile request with data:", profileData);
    
    console.log("📤 [UPDATE_PROFILE] Sending request to /accounts/profile");
    
    const response = await api.put("/accounts/profile", profileData);
    
    console.log("✅ [UPDATE_PROFILE] Response received:", response);
    console.log("📥 [UPDATE_PROFILE] Response data:", response.data);
    
    // Backend returns { success, message, data: { account } }
    const updatedUser = response.data.data || response.data;
    
    // Update localStorage with new user data
    localStorage.setItem("currentUser", JSON.stringify(updatedUser));
    
    console.log("💾 [UPDATE_PROFILE] Updated localStorage successfully");
    
    return updatedUser;
  } catch (error) {
    console.error("❌ [UPDATE_PROFILE] Error occurred:", error);
    console.error("📄 [UPDATE_PROFILE] Error response:", error.response?.data);
    console.error("🔢 [UPDATE_PROFILE] Error status:", error.response?.status);
    
    let errorMessage = "Cập nhật thông tin thất bại. Vui lòng thử lại.";
    
    if (error.response) {
      if (error.response.status === 400) {
        errorMessage = error.response.data.message || "Dữ liệu không hợp lệ!";
      } else if (error.response.status === 401) {
        errorMessage = "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.";
      } else if (error.response.status === 404) {
        errorMessage = "Không tìm thấy tài khoản!";
      } else if (error.response.data && error.response.data.message) {
        errorMessage = error.response.data.message;
      }
    }
    
    return rejectWithValue(errorMessage);
  }
});

// Delete Driver Profile thunk
export const deleteDriverProfile = createAsyncThunk("auth/deleteDriverProfile", async (_, { rejectWithValue }) => {
  try {
    console.log("🚀 [DELETE_PROFILE] Starting delete profile request...");
    
    const response = await api.delete("/accounts/profile");
    
    console.log("✅ [DELETE_PROFILE] Response received:", response);
    console.log("📥 [DELETE_PROFILE] Response data:", response.data);
    
    // Clear localStorage
    localStorage.removeItem("accessToken");
    localStorage.removeItem("currentUser");
    
    console.log("💾 [DELETE_PROFILE] Cleared localStorage successfully");
    
    return true;
  } catch (error) {
    console.error("❌ [DELETE_PROFILE] Error occurred:", error);
    console.error("📄 [DELETE_PROFILE] Error response:", error.response?.data);
    
    let errorMessage = "Không thể xóa tài khoản. Vui lòng thử lại.";
    
    if (error.response) {
      if (error.response.status === 401) {
        errorMessage = "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.";
      } else if (error.response.data && error.response.data.message) {
        errorMessage = error.response.data.message;
      }
    }
    
    return rejectWithValue(errorMessage);
  }
});

// Logout thunk để call API logout
export const logoutUser = createAsyncThunk("auth/logoutUser", async (_, { rejectWithValue }) => {
  try {
    console.log("🚀 [LOGOUT] Starting logout request");
    
    const token = localStorage.getItem("accessToken");
    if (token) {
      // Call logout API if available
      try {
        await api.post("/auth/logout");
        console.log("✅ [LOGOUT] API logout successful");
      } catch (error) {
        console.warn("⚠️ [LOGOUT] API logout failed, but continuing with local logout:", error);
      }
    }
    
    // Clear localStorage regardless of API call result
    localStorage.removeItem("accessToken");
    localStorage.removeItem("currentUser");
    console.log("✅ [LOGOUT] Cleared localStorage");
    
    return true;
  } catch (error) {
    console.error("❌ [LOGOUT] Error occurred:", error);
    // Even if there's an error, clear localStorage
    localStorage.removeItem("accessToken");
    localStorage.removeItem("currentUser");
    return rejectWithValue("Đăng xuất thành công nhưng có lỗi nhỏ xảy ra.");
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
    clearAuthError: (state) => {
      state.error = null;
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
        console.log("✅ [REDUX] loginUser.fulfilled - payload:", action.payload);
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.error = null;
        console.log("✅ [REDUX] Updated state - user:", state.user);
        console.log("✅ [REDUX] Updated state - isAuthenticated:", state.isAuthenticated);
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.error = action.payload;
        state.notificationMessage = action.payload;
        state.notificationType = "error";
      })
      
      // Register User Cases
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        console.log("✅ [REDUX] registerUser.fulfilled - payload:", action.payload);
        state.loading = false;
        state.error = null;
        state.success = true;
        console.log("✅ [REDUX] Registration successful");
      })
      .addCase(registerUser.rejected, (state, action) => {
        console.log("❌ [REDUX] registerUser.rejected - error:", action.payload);
        state.loading = false;
        state.error = action.payload;
        state.success = false;
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
      })

      // Add cases for logoutUser
      .addCase(logoutUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.loading = false;
        state.user = null;
        state.isAuthenticated = false;
        state.error = null;
        state.notificationMessage = null;
        state.notificationType = null;
        state.success = false;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.loading = false;
        // Still logout locally even if API fails
        state.user = null;
        state.isAuthenticated = false;
        state.error = null;
        state.notificationMessage = action.payload;
        state.notificationType = "warning";
      })

      // Get Current Profile
      .addCase(getCurrentProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getCurrentProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.error = null;
      })
      .addCase(getCurrentProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Update Driver Profile
      .addCase(updateDriverProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateDriverProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.error = null;
        state.success = true;
      })
      .addCase(updateDriverProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })
      
      // Delete Driver Profile
      .addCase(deleteDriverProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteDriverProfile.fulfilled, (state) => {
        state.loading = false;
        state.user = null;
        state.isAuthenticated = false;
        state.error = null;
      })
      .addCase(deleteDriverProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
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

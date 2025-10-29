import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../configs/config-axios";

const initialState = {
  availablePlans: [],
  currentSubscription: null,
  registrationHistory: [],
  loading: false,
  error: null,
  hasActiveSubscription: false,
  subscriptionCheckCompleted: false, // Track if we've checked subscription status
};

/**
 * Fetch all available subscription plans for drivers to choose from
 */
export const fetchAvailablePlans = createAsyncThunk(
  "subscription/fetchAvailablePlans",
  async (_, { rejectWithValue }) => {
    try {
      console.log("🚀 [FETCH_PLANS] Fetching available subscription plans...");
      
      const response = await api.get("/subscriptions/profile");
      
      console.log("✅ [FETCH_PLANS] Response received:", response);
      console.log("📥 [FETCH_PLANS] Response data:", response.data);
      
      // Backend returns array of SubscriptionPlanResponse
      const plans = response.data.data || response.data || [];
      
      console.log(`💾 [FETCH_PLANS] Fetched ${plans.length} plans`);
      
      return plans;
    } catch (error) {
      console.error("❌ [FETCH_PLANS] Error occurred:", error);
      console.error("📄 [FETCH_PLANS] Error response:", error.response?.data);
      
      let errorMessage = "Không thể tải danh sách gói đăng ký. Vui lòng thử lại.";
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      return rejectWithValue(errorMessage);
    }
  }
);

/**
 * Register driver for a subscription plan
 */
export const registerForPlan = createAsyncThunk(
  "subscription/registerForPlan",
  async ({ planId, driverId, paymentMethod }, { rejectWithValue }) => {
    try {
      console.log("🚀 [REGISTER_PLAN] Starting plan registration...");
      console.log("📤 [REGISTER_PLAN] Request data:", { planId, driverId, paymentMethod });
      
      const requestData = {
        planId,
        driverId,
        paymentMethod: paymentMethod || "VNPAY"
      };
      
      const response = await api.post("/driver/subscriptions/register", requestData);
      
      console.log("✅ [REGISTER_PLAN] Response received:", response);
      console.log("📥 [REGISTER_PLAN] Response data:", response.data);
      
      // Backend returns PlanRegistrationResponse
      const registrationResult = response.data.data || response.data;
      
      console.log("💾 [REGISTER_PLAN] Registration successful:", registrationResult);
      
      return registrationResult;
    } catch (error) {
      console.error("❌ [REGISTER_PLAN] Error occurred:", error);
      console.error("📄 [REGISTER_PLAN] Error response:", error.response?.data);
      
      let errorMessage = "Đăng ký gói thất bại. Vui lòng thử lại.";
      
      if (error.response) {
        if (error.response.status === 400) {
          errorMessage = error.response.data.message || "Dữ liệu không hợp lệ!";
        } else if (error.response.status === 404) {
          errorMessage = "Không tìm thấy gói đăng ký hoặc tài xế!";
        } else if (error.response.data?.message) {
          errorMessage = error.response.data.message;
        }
      }
      
      return rejectWithValue(errorMessage);
    }
  }
);

/**
 * Check driver's current subscription status
 */
export const checkSubscriptionStatus = createAsyncThunk(
  "subscription/checkSubscriptionStatus",
  async (driverId, { rejectWithValue }) => {
    try {
      console.log("🚀 [CHECK_SUBSCRIPTION] Checking subscription status for driver:", driverId);
      
      if (!driverId) {
        console.log("⚠️ [CHECK_SUBSCRIPTION] No driverId provided, skipping check");
        return null;
      }
      
      const response = await api.get(`/driver/subscriptions/my-subscription?driverId=${driverId}`);
      
      console.log("✅ [CHECK_SUBSCRIPTION] Response received:", response);
      console.log("📥 [CHECK_SUBSCRIPTION] Response data:", response.data);
      
      // Backend returns PlanRegistrationResponse or null if no subscription
      const subscription = response.data.data || response.data;
      
      console.log("💾 [CHECK_SUBSCRIPTION] Current subscription:", subscription);
      
      return subscription;
    } catch (error) {
      console.error("❌ [CHECK_SUBSCRIPTION] Error occurred:", error);
      console.error("📄 [CHECK_SUBSCRIPTION] Error response:", error.response?.data);
      
      // If 404, it means no active subscription - this is not really an error
      if (error.response?.status === 404) {
        console.log("ℹ️ [CHECK_SUBSCRIPTION] Driver has no active subscription");
        return null;
      }
      
      let errorMessage = "Không thể kiểm tra trạng thái đăng ký.";
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      return rejectWithValue(errorMessage);
    }
  }
);

/**
 * Get driver's subscription registration history
 */
export const fetchRegistrationHistory = createAsyncThunk(
  "subscription/fetchRegistrationHistory",
  async (driverId, { rejectWithValue }) => {
    try {
      console.log("🚀 [FETCH_HISTORY] Fetching registration history for driver:", driverId);
      
      const response = await api.get(`/driver/subscriptions/history?driverId=${driverId}`);
      
      console.log("✅ [FETCH_HISTORY] Response received:", response);
      console.log("📥 [FETCH_HISTORY] Response data:", response.data);
      
      const history = response.data.data || response.data || [];
      
      console.log(`💾 [FETCH_HISTORY] Fetched ${history.length} registration records`);
      
      return history;
    } catch (error) {
      console.error("❌ [FETCH_HISTORY] Error occurred:", error);
      console.error("📄 [FETCH_HISTORY] Error response:", error.response?.data);
      
      let errorMessage = "Không thể tải lịch sử đăng ký.";
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      return rejectWithValue(errorMessage);
    }
  }
);

/**
 * Cancel driver's active subscription
 */
export const cancelSubscription = createAsyncThunk(
  "subscription/cancelSubscription",
  async (driverId, { rejectWithValue }) => {
    try {
      console.log("🚀 [CANCEL_SUBSCRIPTION] Canceling subscription for driver:", driverId);
      
      const response = await api.put(`/driver/subscriptions/cancel?driverId=${driverId}`);
      
      console.log("✅ [CANCEL_SUBSCRIPTION] Response received:", response);
      console.log("📥 [CANCEL_SUBSCRIPTION] Response data:", response.data);
      
      const cancelResult = response.data.data || response.data;
      
      console.log("💾 [CANCEL_SUBSCRIPTION] Subscription canceled:", cancelResult);
      
      return cancelResult;
    } catch (error) {
      console.error("❌ [CANCEL_SUBSCRIPTION] Error occurred:", error);
      console.error("📄 [CANCEL_SUBSCRIPTION] Error response:", error.response?.data);
      
      let errorMessage = "Không thể hủy gói đăng ký.";
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      return rejectWithValue(errorMessage);
    }
  }
);

const subscriptionSlice = createSlice({
  name: "subscription",
  initialState,
  reducers: {
    clearSubscriptionError: (state) => {
      state.error = null;
    },
    resetSubscriptionState: (state) => {
      state.availablePlans = [];
      state.currentSubscription = null;
      state.registrationHistory = [];
      state.loading = false;
      state.error = null;
      state.hasActiveSubscription = false;
      state.subscriptionCheckCompleted = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Available Plans
      .addCase(fetchAvailablePlans.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAvailablePlans.fulfilled, (state, action) => {
        state.loading = false;
        state.availablePlans = action.payload;
        state.error = null;
      })
      .addCase(fetchAvailablePlans.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Register for Plan
      .addCase(registerForPlan.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerForPlan.fulfilled, (state, action) => {
        state.loading = false;
        state.currentSubscription = action.payload;
        state.hasActiveSubscription = true;
        state.error = null;
      })
      .addCase(registerForPlan.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Check Subscription Status
      .addCase(checkSubscriptionStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.subscriptionCheckCompleted = false;
      })
      .addCase(checkSubscriptionStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.currentSubscription = action.payload;
        state.hasActiveSubscription = !!action.payload && 
          (action.payload.status === 'ACTIVE' || action.payload.status === 'PENDING');
        state.subscriptionCheckCompleted = true;
        state.error = null;
      })
      .addCase(checkSubscriptionStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.hasActiveSubscription = false;
        state.subscriptionCheckCompleted = true;
      })
      
      // Fetch Registration History
      .addCase(fetchRegistrationHistory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRegistrationHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.registrationHistory = action.payload;
        state.error = null;
      })
      .addCase(fetchRegistrationHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Cancel Subscription
      .addCase(cancelSubscription.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(cancelSubscription.fulfilled, (state, action) => {
        state.loading = false;
        state.currentSubscription = action.payload;
        state.hasActiveSubscription = false;
        state.error = null;
      })
      .addCase(cancelSubscription.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearSubscriptionError, resetSubscriptionState } = subscriptionSlice.actions;

export default subscriptionSlice.reducer;

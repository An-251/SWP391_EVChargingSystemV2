import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../configs/config-axios";

const initialState = {
  // Dashboard
  dashboardData: null,
  
  // Accounts
  accounts: [],
  selectedAccount: null,
  
  // Stations
  stations: [],
  selectedStation: null,
  
  // Charging Points
  chargingPoints: [],
  selectedChargingPoint: null,
  
  // Facilities
  facilities: [],
  
  // Subscriptions
  subscriptions: [],
  selectedSubscription: null,
  
  // UI State
  loading: false,
  error: null,
  successMessage: null,
};

// ==================== DASHBOARD ====================
export const fetchDashboard = createAsyncThunk(
  "admin/fetchDashboard",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/admin/dashboard");
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch dashboard");
    }
  }
);

// ==================== ACCOUNTS ====================
export const fetchAccounts = createAsyncThunk(
  "admin/fetchAccounts",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/admin/accounts");
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch accounts");
    }
  }
);

export const updateAccount = createAsyncThunk(
  "admin/updateAccount",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/admin/accounts/${id}`, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to update account");
    }
  }
);

export const deleteAccount = createAsyncThunk(
  "admin/deleteAccount",
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/admin/accounts/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to delete account");
    }
  }
);

// ==================== STATIONS ====================
export const fetchStations = createAsyncThunk(
  "admin/fetchStations",
  async (_, { rejectWithValue }) => {
    try {
      // Backend uses /charging-stations for both Admin and Driver
      // Backend has fixed circular reference issue
      const response = await api.get("/charging-stations");
      
      // Use response data directly
      const stations = Array.isArray(response.data) 
        ? response.data 
        : (response.data?.data || response.data?.content || []);
      
      return stations;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch stations");
    }
  }
);

export const createStation = createAsyncThunk(
  "admin/createStation",
  async (data, { rejectWithValue }) => {
    try {
      // Backend uses /charging-stations for both Admin and Driver
      const response = await api.post("/charging-stations", data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to create station");
    }
  }
);

export const updateStation = createAsyncThunk(
  "admin/updateStation",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      // Backend uses /charging-stations for both Admin and Driver
      const response = await api.put(`/charging-stations/${id}`, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to update station");
    }
  }
);

export const deleteStation = createAsyncThunk(
  "admin/deleteStation",
  async (id, { rejectWithValue }) => {
    try {
      // Backend uses /charging-stations for both Admin and Driver
      await api.delete(`/charging-stations/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to delete station");
    }
  }
);

// ==================== FACILITIES ====================
export const fetchFacilities = createAsyncThunk(
  "admin/fetchFacilities",
  async (_, { rejectWithValue }) => {
    try {
      // Backend uses /facilities (not /admin/facilities)
      const response = await api.get("/facilities");
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch facilities");
    }
  }
);

export const createFacility = createAsyncThunk(
  "admin/createFacility",
  async (data, { rejectWithValue }) => {
    try {
      const response = await api.post("/facilities", data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to create facility");
    }
  }
);

export const updateFacility = createAsyncThunk(
  "admin/updateFacility",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/facilities/${id}`, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to update facility");
    }
  }
);

export const deleteFacility = createAsyncThunk(
  "admin/deleteFacility",
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/facilities/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to delete facility");
    }
  }
);

// ==================== CHARGING POINTS ====================
export const fetchChargingPoints = createAsyncThunk(
  "admin/fetchChargingPoints",
  async (_, { rejectWithValue }) => {
    try {
      // Backend uses /charging-points (not /admin/charging-points)
      const response = await api.get("/charging-points");
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch charging points");
    }
  }
);

export const createChargingPoint = createAsyncThunk(
  "admin/createChargingPoint",
  async (data, { rejectWithValue }) => {
    try {
      // Backend uses /charging-points (not /admin/charging-points)
      const response = await api.post("/charging-points", data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to create charging point");
    }
  }
);

export const updateChargingPoint = createAsyncThunk(
  "admin/updateChargingPoint",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      // Backend uses /charging-points (not /admin/charging-points)
      const response = await api.put(`/charging-points/${id}`, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to update charging point");
    }
  }
);

export const deleteChargingPoint = createAsyncThunk(
  "admin/deleteChargingPoint",
  async (id, { rejectWithValue }) => {
    try {
      // Backend uses /charging-points (not /admin/charging-points)
      await api.delete(`/charging-points/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to delete charging point");
    }
  }
);

export const fetchChargingPointById = createAsyncThunk(
  "admin/fetchChargingPointById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/admin/charging-points/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch charging point");
    }
  }
);

// ==================== SUBSCRIPTIONS ====================
export const fetchSubscriptions = createAsyncThunk(
  "admin/fetchSubscriptions",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/admin/subscriptions");
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch subscriptions");
    }
  }
);

export const searchSubscriptions = createAsyncThunk(
  "admin/searchSubscriptions",
  async (query, { rejectWithValue }) => {
    try {
      const response = await api.get("/admin/subscriptions/search", { params: query });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to search subscriptions");
    }
  }
);

export const createSubscription = createAsyncThunk(
  "admin/createSubscription",
  async (data, { rejectWithValue }) => {
    try {
      const response = await api.post("/admin/subscriptions", data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to create subscription");
    }
  }
);

export const updateSubscription = createAsyncThunk(
  "admin/updateSubscription",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/admin/subscriptions/${id}`, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to update subscription");
    }
  }
);

export const deleteSubscription = createAsyncThunk(
  "admin/deleteSubscription",
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/admin/subscriptions/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to delete subscription");
    }
  }
);

export const fetchSubscriptionById = createAsyncThunk(
  "admin/fetchSubscriptionById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/admin/subscriptions/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch subscription");
    }
  }
);

const adminSlice = createSlice({
  name: "admin",
  initialState,
  reducers: {
    setSelectedAccount: (state, action) => {
      state.selectedAccount = action.payload;
    },
    setSelectedStation: (state, action) => {
      state.selectedStation = action.payload;
    },
    setSelectedChargingPoint: (state, action) => {
      state.selectedChargingPoint = action.payload;
    },
    setSelectedSubscription: (state, action) => {
      state.selectedSubscription = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Dashboard
      .addCase(fetchDashboard.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchDashboard.fulfilled, (state, action) => {
        state.loading = false;
        state.dashboardData = action.payload;
      })
      .addCase(fetchDashboard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Accounts
      .addCase(fetchAccounts.fulfilled, (state, action) => {
        state.accounts = action.payload;
      })
      .addCase(updateAccount.fulfilled, (state, action) => {
        state.successMessage = "Account updated successfully";
        const index = state.accounts.findIndex(acc => acc.id === action.payload.id);
        if (index !== -1) {
          state.accounts[index] = action.payload;
        }
      })
      .addCase(deleteAccount.fulfilled, (state, action) => {
        state.successMessage = "Account deleted successfully";
        state.accounts = state.accounts.filter(acc => acc.id !== action.payload);
      })
      
      // Stations
      .addCase(fetchStations.fulfilled, (state, action) => {
        // Ensure stations is always an array
        state.stations = Array.isArray(action.payload) 
          ? action.payload 
          : (action.payload?.data || action.payload?.content || []);
      })
      .addCase(createStation.fulfilled, (state, action) => {
        state.successMessage = "Station created successfully";
        // Ensure stations is an array before pushing
        if (!Array.isArray(state.stations)) {
          state.stations = [];
        }
        state.stations.push(action.payload);
      })
      .addCase(updateStation.fulfilled, (state, action) => {
        state.successMessage = "Station updated successfully";
        // Ensure stations is an array
        if (!Array.isArray(state.stations)) {
          state.stations = [];
        }
        const index = state.stations.findIndex(s => s.id === action.payload.id);
        if (index !== -1) {
          state.stations[index] = action.payload;
        }
      })
      .addCase(deleteStation.fulfilled, (state, action) => {
        state.successMessage = "Station deleted successfully";
        // Ensure stations is an array
        if (!Array.isArray(state.stations)) {
          state.stations = [];
        }
        state.stations = state.stations.filter(s => s.id !== action.payload);
      })
      
      // Facilities
      .addCase(fetchFacilities.fulfilled, (state, action) => {
        state.facilities = action.payload;
      })
      .addCase(createFacility.fulfilled, (state, action) => {
        state.successMessage = "Facility created successfully";
        state.facilities.push(action.payload);
      })
      .addCase(updateFacility.fulfilled, (state, action) => {
        state.successMessage = "Facility updated successfully";
        const index = state.facilities.findIndex(f => f.id === action.payload.id);
        if (index !== -1) {
          state.facilities[index] = action.payload;
        }
      })
      .addCase(deleteFacility.fulfilled, (state, action) => {
        state.successMessage = "Facility deleted successfully";
        state.facilities = state.facilities.filter(f => f.id !== action.payload);
      })
      
      // Charging Points
      .addCase(fetchChargingPoints.fulfilled, (state, action) => {
        state.chargingPoints = action.payload;
      })
      .addCase(createChargingPoint.fulfilled, (state, action) => {
        state.successMessage = "Charging point created successfully";
        state.chargingPoints.push(action.payload);
      })
      .addCase(updateChargingPoint.fulfilled, (state, action) => {
        state.successMessage = "Charging point updated successfully";
        const index = state.chargingPoints.findIndex(cp => cp.id === action.payload.id);
        if (index !== -1) {
          state.chargingPoints[index] = action.payload;
        }
      })
      .addCase(deleteChargingPoint.fulfilled, (state, action) => {
        state.successMessage = "Charging point deleted successfully";
        state.chargingPoints = state.chargingPoints.filter(cp => cp.id !== action.payload);
      })
      .addCase(fetchChargingPointById.fulfilled, (state, action) => {
        state.selectedChargingPoint = action.payload;
      })
      
      // Subscriptions
      .addCase(fetchSubscriptions.fulfilled, (state, action) => {
        state.subscriptions = action.payload;
      })
      .addCase(searchSubscriptions.fulfilled, (state, action) => {
        state.subscriptions = action.payload;
      })
      .addCase(createSubscription.fulfilled, (state, action) => {
        state.successMessage = "Subscription created successfully";
        state.subscriptions.push(action.payload);
      })
      .addCase(updateSubscription.fulfilled, (state, action) => {
        state.successMessage = "Subscription updated successfully";
        const index = state.subscriptions.findIndex(s => s.id === action.payload.id);
        if (index !== -1) {
          state.subscriptions[index] = action.payload;
        }
      })
      .addCase(deleteSubscription.fulfilled, (state, action) => {
        state.successMessage = "Subscription deleted successfully";
        state.subscriptions = state.subscriptions.filter(s => s.id !== action.payload);
      })
      .addCase(fetchSubscriptionById.fulfilled, (state, action) => {
        state.selectedSubscription = action.payload;
      });
  },
});

export const {
  setSelectedAccount,
  setSelectedStation,
  setSelectedChargingPoint,
  setSelectedSubscription,
  clearError,
  clearSuccess,
} = adminSlice.actions;

export default adminSlice.reducer;

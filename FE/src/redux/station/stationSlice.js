import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../configs/config-axios";

const initialState = {
  stations: [],
  selectedStation: null,
  loading: false,
  error: null,
};

// Fetch all charging stations
export const fetchStations = createAsyncThunk(
  "station/fetchStations",
  async (_, { rejectWithValue }) => {
    try {
      console.log("🚀 [STATIONS] Fetching all charging stations...");
      const response = await api.get("/drivers/stations");
      console.log("✅ [STATIONS] Response:", response.data);
      
      return response.data;
    } catch (error) {
      console.error("❌ [STATIONS] Error fetching stations:", error);
      return rejectWithValue(
        error.response?.data?.message || "Không thể tải danh sách trạm sạc"
      );
    }
  }
);

// Fetch charging points for a station
export const fetchChargingPoints = createAsyncThunk(
  "station/fetchChargingPoints",
  async (stationId, { rejectWithValue }) => {
    try {
      console.log(`🚀 [CHARGING_POINTS] Fetching points for station ${stationId}...`);
      const response = await api.get("/drivers/charging-points");
      console.log("✅ [CHARGING_POINTS] Response:", response.data);
      
      // Filter by station ID if needed
      const filteredPoints = stationId 
        ? response.data.filter(point => point.station?.id === stationId)
        : response.data;
      
      return filteredPoints;
    } catch (error) {
      console.error("❌ [CHARGING_POINTS] Error fetching points:", error);
      return rejectWithValue(
        error.response?.data?.message || "Không thể tải thông tin điểm sạc"
      );
    }
  }
);

const stationSlice = createSlice({
  name: "station",
  initialState,
  reducers: {
    setSelectedStation: (state, action) => {
      state.selectedStation = action.payload;
    },
    clearSelectedStation: (state) => {
      state.selectedStation = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch stations
      .addCase(fetchStations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStations.fulfilled, (state, action) => {
        state.loading = false;
        state.stations = action.payload;
        state.error = null;
      })
      .addCase(fetchStations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch charging points
      .addCase(fetchChargingPoints.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchChargingPoints.fulfilled, (state, action) => {
        state.loading = false;
        // You can store charging points separately if needed
        state.error = null;
      })
      .addCase(fetchChargingPoints.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setSelectedStation, clearSelectedStation, clearError } = stationSlice.actions;
export default stationSlice.reducer;

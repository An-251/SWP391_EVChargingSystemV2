import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../configs/config-axios";

const initialState = {
  stations: [],
  selectedStation: null,
  loading: false,
  error: null,
  filters: {
    connectorType: null,
    powerLevel: null,
    availability: 'all', // 'all', 'available', 'busy'
    maxDistance: null, // in km
    minRating: 0,
  },
};

// Fetch all charging stations (Backend: GET /api/charging-stations)
export const fetchStations = createAsyncThunk(
  "station/fetchStations",
  async (_, { rejectWithValue }) => {
    try {
      console.log("🚀 [STATIONS] Fetching all charging stations...");
      const response = await api.get("/charging-stations");
      console.log("✅ [STATIONS] Response received, count:", response.data?.length || 0);
      
      // Backend has fixed circular reference issue
      // Now we can use response.data directly
      const stations = Array.isArray(response.data) 
        ? response.data 
        : (response.data?.data || response.data?.content || []);
      
      console.log("✅ [STATIONS] Stations loaded:", stations.length);
      console.log("📊 [STATIONS] Sample station data:", stations[0]);
      console.log("📊 [STATIONS] Has facility?", !!stations[0]?.facility);
      console.log("📊 [STATIONS] Has chargingPoints?", !!stations[0]?.chargingPoints);
      console.log("📊 [STATIONS] Has coordinates?", { 
        lat: stations[0]?.latitude, 
        lng: stations[0]?.longitude 
      });
      
      return stations;
      
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
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    resetFilters: (state) => {
      state.filters = {
        connectorType: null,
        powerLevel: null,
        availability: 'all',
        maxDistance: null,
        minRating: 0,
      };
    },
    // Real-time update handlers
    updateStationInList: (state, action) => {
      const { stationId, newStatus, data, chargingPointUpdate } = action.payload;
      
      const stationIndex = state.stations.findIndex(s => s.id === stationId);
      if (stationIndex !== -1) {
        // Update station status if provided
        if (newStatus) {
          state.stations[stationIndex].status = newStatus;
        }
        
        // Update charging point if provided
        if (chargingPointUpdate) {
          const { pointId, newStatus: pointStatus } = chargingPointUpdate;
          const points = state.stations[stationIndex].chargingPoints || [];
          const pointIndex = points.findIndex(p => p.id === pointId);
          if (pointIndex !== -1) {
            state.stations[stationIndex].chargingPoints[pointIndex].status = pointStatus;
          }
        }
        
        // Update with full data if provided
        if (data) {
          state.stations[stationIndex] = { ...state.stations[stationIndex], ...data };
        }
        
        // Update selected station if it's the one being updated
        if (state.selectedStation && state.selectedStation.id === stationId) {
          state.selectedStation = state.stations[stationIndex];
        }
      }
    },
    updateFacilityInList: (state, action) => {
      const { facilityId, newStatus, data } = action.payload;
      
      // Update all stations that belong to this facility
      state.stations = state.stations.map(station => {
        if (station.facility && station.facility.id === facilityId) {
          return {
            ...station,
            facility: {
              ...station.facility,
              status: newStatus || station.facility.status,
              ...(data || {})
            }
          };
        }
        return station;
      });
      
      // Update selected station if its facility was updated
      if (state.selectedStation && state.selectedStation.facility?.id === facilityId) {
        state.selectedStation = {
          ...state.selectedStation,
          facility: {
            ...state.selectedStation.facility,
            status: newStatus || state.selectedStation.facility.status,
            ...(data || {})
          }
        };
      }
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
        // Ensure stations is always an array
        state.stations = Array.isArray(action.payload) 
          ? action.payload 
          : (action.payload?.data || action.payload?.content || []);
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

export const { 
  setSelectedStation, 
  clearSelectedStation, 
  clearError,
  setFilters,
  resetFilters,
  updateStationInList,
  updateFacilityInList
} = stationSlice.actions;

export default stationSlice.reducer;

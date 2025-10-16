import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../configs/config-axios";

const initialState = {
  vehicles: [],
  currentVehicle: null,
  loading: false,
  error: null,
};

// Fetch driver's vehicles
export const fetchDriverVehicles = createAsyncThunk(
  "vehicle/fetchDriverVehicles",
  async (_, { rejectWithValue }) => {
    try {
      console.log("🚀 [VEHICLE] Fetching my vehicles...");
      const response = await api.get("/vehicles/my-vehicles");
      console.log("✅ [VEHICLE] Vehicles fetched:", response.data);
      // Backend returns: { success, message, data: { vehicles: [], totalVehicles, remainingSlots } }
      return response.data.data?.vehicles || [];
    } catch (error) {
      console.error("❌ [VEHICLE] Fetch error:", error);
      return rejectWithValue(error.response?.data?.message || "Failed to fetch vehicles");
    }
  }
);

// Add a new vehicle
export const addVehicle = createAsyncThunk(
  "vehicle/addVehicle",
  async (vehicleData, { rejectWithValue }) => {
    try {
      console.log("🚀 [VEHICLE] Adding vehicle:", vehicleData);
      const response = await api.post("/vehicles/register", vehicleData);
      console.log("✅ [VEHICLE] Vehicle added:", response.data);
      // Backend returns: { success, message, data: { vehicle: {...}, remainingSlots } }
      return response.data.data?.vehicle || response.data.data || response.data;
    } catch (error) {
      console.error("❌ [VEHICLE] Add error:", error);
      return rejectWithValue(error.response?.data?.message || "Failed to add vehicle");
    }
  }
);

// Update vehicle
export const updateVehicle = createAsyncThunk(
  "vehicle/updateVehicle",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      console.log("🚀 [VEHICLE] Updating vehicle:", id, data);
      const response = await api.put(`/vehicles/${id}`, data);
      console.log("✅ [VEHICLE] Vehicle updated:", response.data);
      return response.data.data || response.data;
    } catch (error) {
      console.error("❌ [VEHICLE] Update error:", error);
      return rejectWithValue(error.response?.data?.message || "Failed to update vehicle");
    }
  }
);

// Delete vehicle
export const deleteVehicle = createAsyncThunk(
  "vehicle/deleteVehicle",
  async (id, { rejectWithValue }) => {
    try {
      console.log("🚀 [VEHICLE] Deleting vehicle:", id);
      await api.delete(`/vehicles/${id}`);
      console.log("✅ [VEHICLE] Vehicle deleted");
      return id;
    } catch (error) {
      console.error("❌ [VEHICLE] Delete error:", error);
      return rejectWithValue(error.response?.data?.message || "Failed to delete vehicle");
    }
  }
);

const vehicleSlice = createSlice({
  name: "vehicle",
  initialState,
  reducers: {
    setCurrentVehicle: (state, action) => {
      state.currentVehicle = action.payload;
      console.log("✅ [VEHICLE] Set current vehicle:", action.payload);
    },
    clearVehicleError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch vehicles
      .addCase(fetchDriverVehicles.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDriverVehicles.fulfilled, (state, action) => {
        state.loading = false;
        state.vehicles = action.payload;
      })
      .addCase(fetchDriverVehicles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Add vehicle
      .addCase(addVehicle.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addVehicle.fulfilled, (state, action) => {
        state.loading = false;
        state.vehicles.push(action.payload);
      })
      .addCase(addVehicle.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Update vehicle
      .addCase(updateVehicle.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateVehicle.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.vehicles.findIndex(v => v.id === action.payload.id);
        if (index !== -1) {
          state.vehicles[index] = action.payload;
        }
      })
      .addCase(updateVehicle.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Delete vehicle
      .addCase(deleteVehicle.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteVehicle.fulfilled, (state, action) => {
        state.loading = false;
        state.vehicles = state.vehicles.filter(v => v.id !== action.payload);
      })
      .addCase(deleteVehicle.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setCurrentVehicle, clearVehicleError } = vehicleSlice.actions;
export default vehicleSlice.reducer;

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../configs/config-axios";

const initialState = {
  activeSession: null,
  hasActiveSession: false,
  sessions: [],
  totalSessions: 0,
  totalCost: 0,
  loading: false,
  error: null,
  successMessage: null,
};

/**
 * Bắt đầu phiên sạc mới
 * POST /api/charging-sessions/start
 * BE Response: { success: boolean, message: string, data: ChargingSessionResponse }
 */
export const startSession = createAsyncThunk(
  "session/startSession",
  async (data, { rejectWithValue }) => {
    try {
      console.log('🚀 [START SESSION] Request:', data);
      const response = await api.post("/charging-sessions/start", data);
      
      // Parse BE ApiResponse format
      const sessionData = response.data?.data;
      console.log('✅ [START SESSION] Session data:', sessionData);
      
      if (!sessionData || !sessionData.sessionId) {
        throw new Error('Invalid session data received from server');
      }
      
      return sessionData; // Return only the session object
    } catch (error) {
      console.error('❌ [START SESSION] Error:', error.response?.data);
      return rejectWithValue(
        error.response?.data?.message || error.response?.data || "Failed to start charging session"
      );
    }
  }
);

/**
 * Dừng phiên sạc
 * POST /api/charging-sessions/{sessionId}/stop
 * BE Response: { success: boolean, message: string, data: ChargingSessionResponse }
 */
export const stopSession = createAsyncThunk(
  "session/stopSession",
  async ({ sessionId, endPercentage }, { rejectWithValue }) => {
    try {
      console.log('🛑 [STOP SESSION] Request:', { sessionId, endPercentage });
      const response = await api.post(`/charging-sessions/${sessionId}/stop`, {
        endPercentage,
      });
      
      // Parse BE ApiResponse format
      const sessionData = response.data?.data;
      console.log('✅ [STOP SESSION] Response data:', sessionData);
      
      return sessionData; // Return only the session object (can be null if BE returns it)
    } catch (error) {
      console.error('❌ [STOP SESSION] Error:', error.response?.data || error.message);
      return rejectWithValue(
        error.response?.data?.message || error.message || "Failed to stop charging session"
      );
    }
  }
);

/**
 * Hủy phiên sạc (emergency stop)
 * DELETE /api/charging-sessions/{sessionId}
 */
export const cancelSession = createAsyncThunk(
  "session/cancelSession",
  async (sessionId, { rejectWithValue }) => {
    try {
      await api.delete(`/charging-sessions/${sessionId}`);
      return sessionId;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to cancel charging session"
      );
    }
  }
);

/**
 * Lấy phiên sạc đang ACTIVE của driver
 * GET /api/charging-sessions/driver/{driverId}/active
 * BE Response: { success: boolean, message: string, data: ChargingSessionResponse | null }
 */
export const fetchActiveSession = createAsyncThunk(
  "session/fetchActiveSession",
  async (driverId, { rejectWithValue }) => {
    try {
      console.log('🔍 [FETCH ACTIVE SESSION] Fetching for driver:', driverId);
      const response = await api.get(`/charging-sessions/driver/${driverId}/active`);
      
      // Parse BE ApiResponse format
      const sessionData = response.data?.data;
      
      console.log('✅ [FETCH ACTIVE SESSION] BE response.data:', response.data);
      console.log('📊 [FETCH ACTIVE SESSION] Extracted sessionData:', sessionData);
      
      // Check if data is null (no active session)
      if (sessionData === null || sessionData === undefined) {
        console.log('ℹ️ [FETCH ACTIVE SESSION] No active session found');
        return null;
      }
      
      // Validate that we have sessionId
      if (!sessionData.sessionId) {
        console.error('❌ [FETCH ACTIVE SESSION] sessionId missing in:', sessionData);
        return null;
      }
      
      console.log(`✅ [FETCH ACTIVE SESSION] Active session found: ${sessionData.sessionId}`);
      return sessionData;
    } catch (error) {
      // 404 means no active session - not an error
      if (error.response?.status === 404) {
        console.log('ℹ️ [FETCH ACTIVE SESSION] No active session (404)');
        return null;
      }
      console.error('❌ [FETCH ACTIVE SESSION] Error:', error.response?.data);
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch active session"
      );
    }
  }
);

/**
 * Lấy lịch sử phiên sạc của driver (có pagination)
 * GET /api/charging-sessions/driver/{driverId}?page=0&size=10
 * BE Response: { success: boolean, message: string, data: { sessions: [...], totalSessions: number } }
 */
export const fetchSessionHistory = createAsyncThunk(
  "session/fetchSessionHistory",
  async ({ driverId, page = 0, size = 10 }, { rejectWithValue }) => {
    try {
      const response = await api.get(`/charging-sessions/driver/${driverId}`, {
        params: { page, size },
      });
      // Extract data from BE ApiResponse
      return response.data?.data || { sessions: [], totalSessions: 0 };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch session history"
      );
    }
  }
);

/**
 * Lấy tất cả sessions của driver (không pagination)
 * GET /api/charging-sessions/driver/{driverId}/all
 * BE Response: { success: boolean, message: string, data: { sessions: [...], totalSessions: number } }
 */
export const fetchAllSessions = createAsyncThunk(
  "session/fetchAllSessions",
  async (driverId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/charging-sessions/driver/${driverId}/all`);
      console.log('📥 [FETCH ALL SESSIONS] BE response:', response.data);
      
      // BE trả về: { success: true, data: { sessions: [...], totalSessions: 5 } }
      const data = response.data?.data;
      
      if (data && data.sessions) {
        // Có nested object sessions
        return data;
      } else if (Array.isArray(data)) {
        // Trường hợp BE trả trực tiếp array
        return { sessions: data, totalSessions: data.length };
      } else {
        // Fallback
        return { sessions: [], totalSessions: 0 };
      }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch all sessions"
      );
    }
  }
);

/**
 * Lấy tổng chi phí của driver
 * GET /api/charging-sessions/driver/{driverId}/total-cost
 * BE Response: { success: boolean, message: string, data: number }
 */
export const fetchTotalCost = createAsyncThunk(
  "session/fetchTotalCost",
  async (driverId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/charging-sessions/driver/${driverId}/total-cost`);
      // Extract number from BE ApiResponse
      return response.data?.data ?? 0;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch total cost"
      );
    }
  }
);

const sessionSlice = createSlice({
  name: "session",
  initialState,
  reducers: {
    clearSessionError: (state) => {
      state.error = null;
    },
    clearSessionSuccess: (state) => {
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Start Session
      .addCase(startSession.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(startSession.fulfilled, (state, action) => {
        state.loading = false;
        state.activeSession = action.payload;
        state.hasActiveSession = true;
        state.successMessage = "Đã bắt đầu phiên sạc!";
      })
      .addCase(startSession.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Stop Session
      .addCase(stopSession.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(stopSession.fulfilled, (state, action) => {
        state.loading = false;
        state.activeSession = null;
        state.hasActiveSession = false;
        state.successMessage = "Đã dừng phiên sạc thành công!";
        // Add to sessions list
        if (action.payload) {
          state.sessions.unshift(action.payload);
        }
      })
      .addCase(stopSession.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Cancel Session
      .addCase(cancelSession.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(cancelSession.fulfilled, (state) => {
        state.loading = false;
        state.activeSession = null;
        state.hasActiveSession = false;
        state.successMessage = "Đã hủy phiên sạc";
      })
      .addCase(cancelSession.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch Active Session
      .addCase(fetchActiveSession.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchActiveSession.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) {
          state.activeSession = action.payload;
          state.hasActiveSession = true;
        } else {
          state.activeSession = null;
          state.hasActiveSession = false;
        }
      })
      .addCase(fetchActiveSession.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.hasActiveSession = false;
      })

      // Fetch Session History
      .addCase(fetchSessionHistory.fulfilled, (state, action) => {
        const data = action.payload;
        state.sessions = data?.sessions || data || [];
        state.totalSessions = data?.totalSessions || state.sessions.length;
      })

      // Fetch All Sessions
      .addCase(fetchAllSessions.fulfilled, (state, action) => {
        const payload = action.payload;
        console.log('✅ [FETCH ALL SESSIONS] Payload:', payload);
        
        // Handle both formats: { sessions: [...], totalSessions: 5 } hoặc [...]
        if (payload && payload.sessions) {
          state.sessions = payload.sessions;
          state.totalSessions = payload.totalSessions || payload.sessions.length;
        } else if (Array.isArray(payload)) {
          state.sessions = payload;
          state.totalSessions = payload.length;
        } else {
          state.sessions = [];
          state.totalSessions = 0;
        }
        
        console.log('📊 [SESSIONS STATE] sessions:', state.sessions.length, 'totalSessions:', state.totalSessions);
      })

      // Fetch Total Cost
      .addCase(fetchTotalCost.fulfilled, (state, action) => {
        state.totalCost = action.payload;
      });
  },
});

export const { clearSessionError, clearSessionSuccess } = sessionSlice.actions;
export default sessionSlice.reducer;

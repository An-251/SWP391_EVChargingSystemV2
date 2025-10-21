import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../configs/config-axios';

const initialState = {
  dashboardStats: {
    totalRevenue: 0,
    totalFacilities: 0,
    totalStations: 0,
    totalChargingPoints: 0,
    totalUsers: 0,
    activeSessions: 0,
    loading: false,
    error: null,
  },
  facilities: {
    list: [],
    currentFacility: null,
    loading: false,
    error: null,
    pagination: { page: 0, size: 10, totalElements: 0, totalPages: 0 },
  },
  stations: {
    list: [],
    currentStation: null,
    loading: false,
    error: null,
    pagination: { page: 0, size: 10, totalElements: 0, totalPages: 0 },
  },
  chargingPoints: {
    list: [],
    currentChargingPoint: null,
    loading: false,
    error: null,
    pagination: { page: 0, size: 10, totalElements: 0, totalPages: 0 },
  },
  accounts: {
    list: [],
    currentAccount: null,
    loading: false,
    error: null,
    pagination: { page: 0, size: 10, totalElements: 0, totalPages: 0 },
  },
  subscriptions: {
    list: [],
    currentSubscription: null,
    loading: false,
    error: null,
    pagination: { page: 0, size: 10, totalElements: 0, totalPages: 0 },
  },
  reports: {
    revenueData: [],
    usageData: [],
    loading: false,
    error: null,
  },
  notification: {
    message: null,
    type: null,
  },
};

// ==================== DASHBOARD THUNKS ====================
// Note: Backend does not have /admin/dashboard/stats endpoint yet
// This will need to be implemented or removed
export const fetchDashboardStats = createAsyncThunk(
  'admin/fetchDashboardStats',
  async (_, { rejectWithValue }) => {
    try {
      // TODO: Backend needs to implement this endpoint
      // const response = await api.get('/api/admin/dashboard/stats');
      // return response.data.data || response.data;
      
      // Temporary: Return mock data to prevent errors
      return {
        totalRevenue: 0,
        totalFacilities: 0,
        totalStations: 0,
        totalChargingPoints: 0,
        totalUsers: 0,
        activeSessions: 0,
      };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Cannot load dashboard stats');
    }
  }
);

// ==================== FACILITIES THUNKS ====================
export const fetchFacilities = createAsyncThunk(
  'admin/fetchFacilities',
  async ({ page = 0, size = 10, search = '' }, { rejectWithValue }) => {
    try {
      const response = await api.get('/facilities/profile', { params: { page, size, search } });
      return response.data.data || response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Cannot load facilities');
    }
  }
);

export const fetchFacilityById = createAsyncThunk(
  'admin/fetchFacilityById',
  async (facilityId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/facilities/${facilityId}`);
      return response.data.data || response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Cannot load facility');
    }
  }
);

export const createFacility = createAsyncThunk(
  'admin/createFacility',
  async (facilityData, { rejectWithValue }) => {
    try {
      const response = await api.post('/facilities/profile', facilityData);
      return response.data.data || response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Cannot create facility');
    }
  }
);

export const updateFacility = createAsyncThunk(
  'admin/updateFacility',
  async ({ facilityId, facilityData }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/facilities/${facilityId}`, facilityData);
      return response.data.data || response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Cannot update facility');
    }
  }
);

export const deleteFacility = createAsyncThunk(
  'admin/deleteFacility',
  async (facilityId, { rejectWithValue }) => {
    try {
      await api.delete(`/facilities/${facilityId}`);
      return facilityId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Cannot delete facility');
    }
  }
);

// ==================== STATIONS THUNKS ====================
export const fetchStations = createAsyncThunk(
  'admin/fetchStations',
  async ({ page = 0, size = 10, search = '', facilityId = null }, { rejectWithValue }) => {
    try {
      const response = await api.get('/charging-stations', { params: { page, size, search, facilityId } });
      return response.data.data || response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Cannot load stations');
    }
  }
);

export const fetchStationById = createAsyncThunk(
  'admin/fetchStationById',
  async (stationId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/charging-stations/${stationId}`);
      return response.data.data || response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Cannot load station');
    }
  }
);

export const createStation = createAsyncThunk(
  'admin/createStation',
  async (stationData, { rejectWithValue }) => {
    try {
      const response = await api.post('/charging-stations', stationData);
      return response.data.data || response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Cannot create station');
    }
  }
);

export const updateStation = createAsyncThunk(
  'admin/updateStation',
  async ({ stationId, stationData }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/charging-stations/${stationId}`, stationData);
      return response.data.data || response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Cannot update station');
    }
  }
);

export const deleteStation = createAsyncThunk(
  'admin/deleteStation',
  async (stationId, { rejectWithValue }) => {
    try {
      await api.delete(`/charging-stations/${stationId}`);
      return stationId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Cannot delete station');
    }
  }
);

// ==================== CHARGING POINTS THUNKS ====================
export const fetchChargingPoints = createAsyncThunk(
  'admin/fetchChargingPoints',
  async ({ page = 0, size = 10, search = '', stationId = null }, { rejectWithValue }) => {
    try {
      const response = await api.get('/charging-points', { params: { page, size, search, stationId } });
      return response.data.data || response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Cannot load charging points');
    }
  }
);

export const fetchChargingPointById = createAsyncThunk(
  'admin/fetchChargingPointById',
  async (chargingPointId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/charging-points/${chargingPointId}`);
      return response.data.data || response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Cannot load charging point');
    }
  }
);

export const createChargingPoint = createAsyncThunk(
  'admin/createChargingPoint',
  async (chargingPointData, { rejectWithValue }) => {
    try {
      const response = await api.post('/charging-points', chargingPointData);
      return response.data.data || response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Cannot create charging point');
    }
  }
);

export const updateChargingPoint = createAsyncThunk(
  'admin/updateChargingPoint',
  async ({ chargingPointId, chargingPointData }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/charging-points/${chargingPointId}`, chargingPointData);
      return response.data.data || response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Cannot update charging point');
    }
  }
);

export const deleteChargingPoint = createAsyncThunk(
  'admin/deleteChargingPoint',
  async (chargingPointId, { rejectWithValue }) => {
    try {
      await api.delete(`/charging-points/${chargingPointId}`);
      return chargingPointId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Cannot delete charging point');
    }
  }
);

// ==================== ACCOUNTS THUNKS ====================
export const fetchAccounts = createAsyncThunk(
  'admin/fetchAccounts',
  async ({ page = 0, size = 10, search = '', role = null }, { rejectWithValue }) => {
    try {
      const response = await api.get('/admin/accounts', { params: { page, size, search, role } });
      const data = response.data.data || response.data;
      
      // Handle circular reference: extract only needed fields from accounts
      if (Array.isArray(data)) {
        return data.map(account => ({
          id: account.id,
          username: account.username,
          email: account.email,
          phone: account.phone,
          fullName: account.fullName,
          role: account.accountRole || account.role,
          status: account.status,
          createdDate: account.createdDate,
        }));
      }
      
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Cannot load accounts');
    }
  }
);

export const fetchAccountById = createAsyncThunk(
  'admin/fetchAccountById',
  async (accountId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/admin/accounts/${accountId}`);
      return response.data.data || response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Không thể tải tài khoản');
    }
  }
);

export const createAccount = createAsyncThunk(
  'admin/createAccount',
  async (accountData, { rejectWithValue }) => {
    try {
      const response = await api.post('/admin/accounts', accountData);
      return response.data.data || response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Không thể tạo tài khoản');
    }
  }
);

export const updateAccount = createAsyncThunk(
  'admin/updateAccount',
  async ({ accountId, accountData }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/admin/accounts/${accountId}`, accountData);
      return response.data.data || response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Không thể cập nhật tài khoản');
    }
  }
);

export const deleteAccount = createAsyncThunk(
  'admin/deleteAccount',
  async (accountId, { rejectWithValue }) => {
    try {
      await api.delete(`/admin/accounts/${accountId}`);
      return accountId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Không thể xóa tài khoản');
    }
  }
);

export const toggleAccountStatus = createAsyncThunk(
  'admin/toggleAccountStatus',
  async (accountId, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/admin/accounts/${accountId}/toggle-status`);
      return response.data.data || response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Không thể thay đổi trạng thái');
    }
  }
);

// ==================== SUBSCRIPTIONS THUNKS ====================
export const fetchSubscriptions = createAsyncThunk(
  'admin/fetchSubscriptions',
  async ({ page = 0, size = 10 }, { rejectWithValue }) => {
    try {
      const response = await api.get('/subscriptions/profile', { params: { page, size } });
      return response.data.data || response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Cannot load subscriptions');
    }
  }
);

export const fetchSubscriptionById = createAsyncThunk(
  'admin/fetchSubscriptionById',
  async (subscriptionId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/subscriptions/${subscriptionId}`);
      return response.data.data || response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Cannot load subscription');
    }
  }
);

export const createSubscription = createAsyncThunk(
  'admin/createSubscription',
  async (subscriptionData, { rejectWithValue }) => {
    try {
      const response = await api.post('/subscriptions/profile', subscriptionData);
      return response.data.data || response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Cannot create subscription');
    }
  }
);

export const updateSubscription = createAsyncThunk(
  'admin/updateSubscription',
  async ({ subscriptionId, subscriptionData }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/subscriptions/${subscriptionId}`, subscriptionData);
      return response.data.data || response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Cannot update subscription');
    }
  }
);

export const deleteSubscription = createAsyncThunk(
  'admin/deleteSubscription',
  async (subscriptionId, { rejectWithValue }) => {
    try {
      await api.delete(`/subscriptions/${subscriptionId}`);
      return subscriptionId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Cannot delete subscription');
    }
  }
);

// ==================== REPORTS THUNKS ====================
// Note: Backend does not have /admin/reports endpoints yet
// These will need to be implemented or removed
export const fetchRevenueReport = createAsyncThunk(
  'admin/fetchRevenueReport',
  async ({ startDate, endDate, groupBy = 'day' }, { rejectWithValue }) => {
    try {
      // TODO: Backend needs to implement this endpoint
      // const response = await api.get('/api/admin/reports/revenue', { params: { startDate, endDate, groupBy } });
      // return response.data.data || response.data;
      
      // Temporary: Return empty data
      return [];
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Cannot load revenue report');
    }
  }
);

export const fetchUsageReport = createAsyncThunk(
  'admin/fetchUsageReport',
  async ({ startDate, endDate, stationId = null }, { rejectWithValue }) => {
    try {
      // TODO: Backend needs to implement this endpoint
      // const response = await api.get('/api/admin/reports/usage', { params: { startDate, endDate, stationId } });
      // return response.data.data || response.data;
      
      // Temporary: Return empty data
      return [];
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Cannot load usage report');
    }
  }
);

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    clearNotification: (state) => {
      state.notification.message = null;
      state.notification.type = null;
    },
    clearFacilityError: (state) => {
      state.facilities.error = null;
    },
    clearStationError: (state) => {
      state.stations.error = null;
    },
    clearChargingPointError: (state) => {
      state.chargingPoints.error = null;
    },
    clearAccountError: (state) => {
      state.accounts.error = null;
    },
    clearSubscriptionError: (state) => {
      state.subscriptions.error = null;
    },
    setCurrentFacility: (state, action) => {
      state.facilities.currentFacility = action.payload;
    },
    setCurrentStation: (state, action) => {
      state.stations.currentStation = action.payload;
    },
    setCurrentChargingPoint: (state, action) => {
      state.chargingPoints.currentChargingPoint = action.payload;
    },
    setCurrentAccount: (state, action) => {
      state.accounts.currentAccount = action.payload;
    },
    setCurrentSubscription: (state, action) => {
      state.subscriptions.currentSubscription = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Dashboard
    builder
      .addCase(fetchDashboardStats.pending, (state) => {
        state.dashboardStats.loading = true;
        state.dashboardStats.error = null;
      })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.dashboardStats.loading = false;
        Object.assign(state.dashboardStats, action.payload);
      })
      .addCase(fetchDashboardStats.rejected, (state, action) => {
        state.dashboardStats.loading = false;
        state.dashboardStats.error = action.payload;
      });

    // Facilities
    builder
      .addCase(fetchFacilities.pending, (state) => {
        state.facilities.loading = true;
        state.facilities.error = null;
      })
      .addCase(fetchFacilities.fulfilled, (state, action) => {
        state.facilities.loading = false;
        state.facilities.list = action.payload.content || action.payload;
        if (action.payload.number !== undefined) {
          state.facilities.pagination = {
            page: action.payload.number,
            size: action.payload.size,
            totalElements: action.payload.totalElements,
            totalPages: action.payload.totalPages,
          };
        }
      })
      .addCase(fetchFacilities.rejected, (state, action) => {
        state.facilities.loading = false;
        state.facilities.error = action.payload;
      })
      .addCase(fetchFacilityById.fulfilled, (state, action) => {
        state.facilities.currentFacility = action.payload;
      })
      .addCase(createFacility.fulfilled, (state, action) => {
        state.facilities.list.unshift(action.payload);
        state.notification = { message: 'Tạo cơ sở thành công!', type: 'success' };
      })
      .addCase(createFacility.rejected, (state, action) => {
        state.facilities.error = action.payload;
        state.notification = { message: action.payload, type: 'error' };
      })
      .addCase(updateFacility.fulfilled, (state, action) => {
        const index = state.facilities.list.findIndex((f) => f.id === action.payload.id);
        if (index !== -1) state.facilities.list[index] = action.payload;
        state.facilities.currentFacility = action.payload;
        state.notification = { message: 'Cập nhật cơ sở thành công!', type: 'success' };
      })
      .addCase(updateFacility.rejected, (state, action) => {
        state.facilities.error = action.payload;
        state.notification = { message: action.payload, type: 'error' };
      })
      .addCase(deleteFacility.fulfilled, (state, action) => {
        state.facilities.list = state.facilities.list.filter((f) => f.id !== action.payload);
        state.notification = { message: 'Xóa cơ sở thành công!', type: 'success' };
      })
      .addCase(deleteFacility.rejected, (state, action) => {
        state.facilities.error = action.payload;
        state.notification = { message: action.payload, type: 'error' };
      });

    // Stations
    builder
      .addCase(fetchStations.pending, (state) => {
        state.stations.loading = true;
        state.stations.error = null;
      })
      .addCase(fetchStations.fulfilled, (state, action) => {
        state.stations.loading = false;
        state.stations.list = action.payload.content || action.payload;
        if (action.payload.number !== undefined) {
          state.stations.pagination = {
            page: action.payload.number,
            size: action.payload.size,
            totalElements: action.payload.totalElements,
            totalPages: action.payload.totalPages,
          };
        }
      })
      .addCase(fetchStations.rejected, (state, action) => {
        state.stations.loading = false;
        state.stations.error = action.payload;
      })
      .addCase(fetchStationById.fulfilled, (state, action) => {
        state.stations.currentStation = action.payload;
      })
      .addCase(createStation.fulfilled, (state, action) => {
        state.stations.list.unshift(action.payload);
        state.notification = { message: 'Tạo trạm sạc thành công!', type: 'success' };
      })
      .addCase(createStation.rejected, (state, action) => {
        state.stations.error = action.payload;
        state.notification = { message: action.payload, type: 'error' };
      })
      .addCase(updateStation.fulfilled, (state, action) => {
        const index = state.stations.list.findIndex((s) => s.id === action.payload.id);
        if (index !== -1) state.stations.list[index] = action.payload;
        state.stations.currentStation = action.payload;
        state.notification = { message: 'Cập nhật trạm sạc thành công!', type: 'success' };
      })
      .addCase(updateStation.rejected, (state, action) => {
        state.stations.error = action.payload;
        state.notification = { message: action.payload, type: 'error' };
      })
      .addCase(deleteStation.fulfilled, (state, action) => {
        state.stations.list = state.stations.list.filter((s) => s.id !== action.payload);
        state.notification = { message: 'Xóa trạm sạc thành công!', type: 'success' };
      })
      .addCase(deleteStation.rejected, (state, action) => {
        state.stations.error = action.payload;
        state.notification = { message: action.payload, type: 'error' };
      });

    // Charging Points
    builder
      .addCase(fetchChargingPoints.pending, (state) => {
        state.chargingPoints.loading = true;
        state.chargingPoints.error = null;
      })
      .addCase(fetchChargingPoints.fulfilled, (state, action) => {
        state.chargingPoints.loading = false;
        state.chargingPoints.list = action.payload.content || action.payload;
        if (action.payload.number !== undefined) {
          state.chargingPoints.pagination = {
            page: action.payload.number,
            size: action.payload.size,
            totalElements: action.payload.totalElements,
            totalPages: action.payload.totalPages,
          };
        }
      })
      .addCase(fetchChargingPoints.rejected, (state, action) => {
        state.chargingPoints.loading = false;
        state.chargingPoints.error = action.payload;
      })
      .addCase(fetchChargingPointById.fulfilled, (state, action) => {
        state.chargingPoints.currentChargingPoint = action.payload;
      })
      .addCase(createChargingPoint.fulfilled, (state, action) => {
        state.chargingPoints.list.unshift(action.payload);
        state.notification = { message: 'Tạo điểm sạc thành công!', type: 'success' };
      })
      .addCase(createChargingPoint.rejected, (state, action) => {
        state.chargingPoints.error = action.payload;
        state.notification = { message: action.payload, type: 'error' };
      })
      .addCase(updateChargingPoint.fulfilled, (state, action) => {
        const index = state.chargingPoints.list.findIndex((cp) => cp.id === action.payload.id);
        if (index !== -1) state.chargingPoints.list[index] = action.payload;
        state.chargingPoints.currentChargingPoint = action.payload;
        state.notification = { message: 'Cập nhật điểm sạc thành công!', type: 'success' };
      })
      .addCase(updateChargingPoint.rejected, (state, action) => {
        state.chargingPoints.error = action.payload;
        state.notification = { message: action.payload, type: 'error' };
      })
      .addCase(deleteChargingPoint.fulfilled, (state, action) => {
        state.chargingPoints.list = state.chargingPoints.list.filter((cp) => cp.id !== action.payload);
        state.notification = { message: 'Xóa điểm sạc thành công!', type: 'success' };
      })
      .addCase(deleteChargingPoint.rejected, (state, action) => {
        state.chargingPoints.error = action.payload;
        state.notification = { message: action.payload, type: 'error' };
      });

    // Accounts
    builder
      .addCase(fetchAccounts.pending, (state) => {
        state.accounts.loading = true;
        state.accounts.error = null;
      })
      .addCase(fetchAccounts.fulfilled, (state, action) => {
        state.accounts.loading = false;
        // Handle both paginated response and direct array response
        const payload = action.payload;
        if (Array.isArray(payload)) {
          // Direct array response from backend
          state.accounts.list = payload;
          state.accounts.pagination = {
            page: 0,
            size: payload.length,
            totalElements: payload.length,
            totalPages: 1,
          };
        } else if (payload.content && Array.isArray(payload.content)) {
          // Paginated response
          state.accounts.list = payload.content;
          state.accounts.pagination = {
            page: payload.number || 0,
            size: payload.size || 10,
            totalElements: payload.totalElements || 0,
            totalPages: payload.totalPages || 0,
          };
        } else {
          // Fallback: empty array
          console.error('Invalid accounts payload:', payload);
          state.accounts.list = [];
        }
      })
      .addCase(fetchAccounts.rejected, (state, action) => {
        state.accounts.loading = false;
        state.accounts.error = action.payload;
      })
      .addCase(fetchAccountById.fulfilled, (state, action) => {
        state.accounts.currentAccount = action.payload;
      })
      .addCase(createAccount.fulfilled, (state, action) => {
        state.accounts.list.unshift(action.payload);
        state.notification = { message: 'Tạo tài khoản thành công!', type: 'success' };
      })
      .addCase(createAccount.rejected, (state, action) => {
        state.accounts.error = action.payload;
        state.notification = { message: action.payload, type: 'error' };
      })
      .addCase(updateAccount.fulfilled, (state, action) => {
        const index = state.accounts.list.findIndex((a) => a.id === action.payload.id);
        if (index !== -1) state.accounts.list[index] = action.payload;
        state.accounts.currentAccount = action.payload;
        state.notification = { message: 'Cập nhật tài khoản thành công!', type: 'success' };
      })
      .addCase(updateAccount.rejected, (state, action) => {
        state.accounts.error = action.payload;
        state.notification = { message: action.payload, type: 'error' };
      })
      .addCase(deleteAccount.fulfilled, (state, action) => {
        state.accounts.list = state.accounts.list.filter((a) => a.id !== action.payload);
        state.notification = { message: 'Xóa tài khoản thành công!', type: 'success' };
      })
      .addCase(deleteAccount.rejected, (state, action) => {
        state.accounts.error = action.payload;
        state.notification = { message: action.payload, type: 'error' };
      })
      .addCase(toggleAccountStatus.fulfilled, (state, action) => {
        const index = state.accounts.list.findIndex((a) => a.id === action.payload.id);
        if (index !== -1) state.accounts.list[index] = action.payload;
        state.notification = { message: 'Thay đổi trạng thái thành công!', type: 'success' };
      })
      .addCase(toggleAccountStatus.rejected, (state, action) => {
        state.accounts.error = action.payload;
        state.notification = { message: action.payload, type: 'error' };
      });

    // Subscriptions
    builder
      .addCase(fetchSubscriptions.pending, (state) => {
        state.subscriptions.loading = true;
        state.subscriptions.error = null;
      })
      .addCase(fetchSubscriptions.fulfilled, (state, action) => {
        state.subscriptions.loading = false;
        state.subscriptions.list = action.payload.content || action.payload;
        if (action.payload.number !== undefined) {
          state.subscriptions.pagination = {
            page: action.payload.number,
            size: action.payload.size,
            totalElements: action.payload.totalElements,
            totalPages: action.payload.totalPages,
          };
        }
      })
      .addCase(fetchSubscriptions.rejected, (state, action) => {
        state.subscriptions.loading = false;
        state.subscriptions.error = action.payload;
      })
      .addCase(fetchSubscriptionById.fulfilled, (state, action) => {
        state.subscriptions.currentSubscription = action.payload;
      })
      .addCase(createSubscription.fulfilled, (state, action) => {
        state.subscriptions.list.unshift(action.payload);
        state.notification = { message: 'Tạo gói dịch vụ thành công!', type: 'success' };
      })
      .addCase(createSubscription.rejected, (state, action) => {
        state.subscriptions.error = action.payload;
        state.notification = { message: action.payload, type: 'error' };
      })
      .addCase(updateSubscription.fulfilled, (state, action) => {
        const index = state.subscriptions.list.findIndex((s) => s.id === action.payload.id);
        if (index !== -1) state.subscriptions.list[index] = action.payload;
        state.subscriptions.currentSubscription = action.payload;
        state.notification = { message: 'Cập nhật gói dịch vụ thành công!', type: 'success' };
      })
      .addCase(updateSubscription.rejected, (state, action) => {
        state.subscriptions.error = action.payload;
        state.notification = { message: action.payload, type: 'error' };
      })
      .addCase(deleteSubscription.fulfilled, (state, action) => {
        state.subscriptions.list = state.subscriptions.list.filter((s) => s.id !== action.payload);
        state.notification = { message: 'Xóa gói dịch vụ thành công!', type: 'success' };
      })
      .addCase(deleteSubscription.rejected, (state, action) => {
        state.subscriptions.error = action.payload;
        state.notification = { message: action.payload, type: 'error' };
      });

    // Reports
    builder
      .addCase(fetchRevenueReport.pending, (state) => {
        state.reports.loading = true;
        state.reports.error = null;
      })
      .addCase(fetchRevenueReport.fulfilled, (state, action) => {
        state.reports.loading = false;
        state.reports.revenueData = action.payload;
      })
      .addCase(fetchRevenueReport.rejected, (state, action) => {
        state.reports.loading = false;
        state.reports.error = action.payload;
      })
      .addCase(fetchUsageReport.pending, (state) => {
        state.reports.loading = true;
        state.reports.error = null;
      })
      .addCase(fetchUsageReport.fulfilled, (state, action) => {
        state.reports.loading = false;
        state.reports.usageData = action.payload;
      })
      .addCase(fetchUsageReport.rejected, (state, action) => {
        state.reports.loading = false;
        state.reports.error = action.payload;
      });
  },
});

export const {
  clearNotification,
  clearFacilityError,
  clearStationError,
  clearChargingPointError,
  clearAccountError,
  clearSubscriptionError,
  setCurrentFacility,
  setCurrentStation,
  setCurrentChargingPoint,
  setCurrentAccount,
  setCurrentSubscription,
} = adminSlice.actions;

export default adminSlice.reducer;

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as apiInvoice from "../../services/apiInvoice";
import * as apiPayment from "../../services/apiPayment";

// ==================== ASYNC THUNKS ====================

/**
 * Fetch all invoices for current driver
 */
export const fetchDriverInvoices = createAsyncThunk(
  "invoice/fetchDriverInvoices",
  async (driverId, { rejectWithValue }) => {
    try {
      const response = await apiInvoice.getDriverInvoices(driverId);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

/**
 * Fetch pending invoices (UNPAID + OVERDUE)
 */
export const fetchPendingInvoices = createAsyncThunk(
  "invoice/fetchPendingInvoices",
  async (driverId, { rejectWithValue }) => {
    try {
      const response = await apiPayment.getPendingInvoices(driverId);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

/**
 * Fetch current invoice (most recent unpaid/overdue)
 */
export const fetchCurrentInvoice = createAsyncThunk(
  "invoice/fetchCurrentInvoice",
  async (driverId, { rejectWithValue }) => {
    try {
      const response = await apiInvoice.getCurrentInvoice(driverId);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

/**
 * Fetch invoice detail with sessions breakdown
 */
export const fetchInvoiceDetail = createAsyncThunk(
  "invoice/fetchInvoiceDetail",
  async (invoiceId, { rejectWithValue }) => {
    try {
      const response = await apiInvoice.getInvoiceDetail(invoiceId);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

/**
 * Fetch payment timeline for invoice
 */
export const fetchPaymentTimeline = createAsyncThunk(
  "invoice/fetchPaymentTimeline",
  async (invoiceId, { rejectWithValue }) => {
    try {
      const response = await apiPayment.getPaymentTimeline(invoiceId);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

/**
 * Pay invoice
 */
export const payInvoice = createAsyncThunk(
  "invoice/payInvoice",
  async ({ invoiceId, paymentMethod }, { rejectWithValue, dispatch }) => {
    try {
      const response = await apiPayment.payInvoice({ invoiceId, paymentMethod });
      
      // After payment, refresh invoices list
      const currentUser = JSON.parse(localStorage.getItem("currentUser"));
      if (currentUser?.id) {
        dispatch(fetchDriverInvoices(currentUser.id));
        dispatch(fetchPendingInvoices(currentUser.id));
      }
      
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

/**
 * Check if driver needs payment
 */
export const checkNeedsPayment = createAsyncThunk(
  "invoice/checkNeedsPayment",
  async (driverId, { rejectWithValue }) => {
    try {
      const response = await apiInvoice.needsPayment(driverId);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

/**
 * Get unbilled sessions count
 */
export const fetchUnbilledSessionsCount = createAsyncThunk(
  "invoice/fetchUnbilledSessionsCount",
  async (driverId, { rejectWithValue }) => {
    try {
      const response = await apiInvoice.getUnbilledSessionsCount(driverId);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// ==================== SLICE ====================

const initialState = {
  // Invoice lists
  invoices: [], // All invoices
  pendingInvoices: [], // UNPAID + OVERDUE invoices
  currentInvoice: null, // Most recent unpaid/overdue invoice
  
  // Invoice detail
  selectedInvoice: null, // Full detail of selected invoice
  paymentTimeline: null, // Timeline for selected invoice
  
  // Unbilled sessions
  unbilledSessionsCount: 0,
  
  // Flags
  needsPayment: false, // True if has unpaid/overdue invoices
  
  // Loading states
  loading: {
    invoices: false,
    pendingInvoices: false,
    currentInvoice: false,
    invoiceDetail: false,
    paymentTimeline: false,
    paying: false,
    checkingPayment: false,
    unbilledSessions: false,
  },
  
  // Error states
  error: {
    invoices: null,
    pendingInvoices: null,
    currentInvoice: null,
    invoiceDetail: null,
    paymentTimeline: null,
    paying: null,
    checkingPayment: null,
    unbilledSessions: null,
  },
};

const invoiceSlice = createSlice({
  name: "invoice",
  initialState,
  reducers: {
    // Clear selected invoice
    clearSelectedInvoice: (state) => {
      state.selectedInvoice = null;
      state.paymentTimeline = null;
      state.error.invoiceDetail = null;
      state.error.paymentTimeline = null;
    },
    
    // Clear all errors
    clearErrors: (state) => {
      state.error = {
        invoices: null,
        pendingInvoices: null,
        currentInvoice: null,
        invoiceDetail: null,
        paymentTimeline: null,
        paying: null,
        checkingPayment: null,
        unbilledSessions: null,
      };
    },
    
    // Reset invoice state (on logout)
    resetInvoiceState: () => initialState,
  },
  extraReducers: (builder) => {
    // Fetch driver invoices
    builder
      .addCase(fetchDriverInvoices.pending, (state) => {
        state.loading.invoices = true;
        state.error.invoices = null;
      })
      .addCase(fetchDriverInvoices.fulfilled, (state, action) => {
        state.loading.invoices = false;
        state.invoices = action.payload;
      })
      .addCase(fetchDriverInvoices.rejected, (state, action) => {
        state.loading.invoices = false;
        state.error.invoices = action.payload;
      });
    
    // Fetch pending invoices
    builder
      .addCase(fetchPendingInvoices.pending, (state) => {
        state.loading.pendingInvoices = true;
        state.error.pendingInvoices = null;
      })
      .addCase(fetchPendingInvoices.fulfilled, (state, action) => {
        state.loading.pendingInvoices = false;
        state.pendingInvoices = action.payload;
      })
      .addCase(fetchPendingInvoices.rejected, (state, action) => {
        state.loading.pendingInvoices = false;
        state.error.pendingInvoices = action.payload;
      });
    
    // Fetch current invoice
    builder
      .addCase(fetchCurrentInvoice.pending, (state) => {
        state.loading.currentInvoice = true;
        state.error.currentInvoice = null;
      })
      .addCase(fetchCurrentInvoice.fulfilled, (state, action) => {
        state.loading.currentInvoice = false;
        state.currentInvoice = action.payload;
      })
      .addCase(fetchCurrentInvoice.rejected, (state, action) => {
        state.loading.currentInvoice = false;
        state.error.currentInvoice = action.payload;
      });
    
    // Fetch invoice detail
    builder
      .addCase(fetchInvoiceDetail.pending, (state) => {
        state.loading.invoiceDetail = true;
        state.error.invoiceDetail = null;
      })
      .addCase(fetchInvoiceDetail.fulfilled, (state, action) => {
        state.loading.invoiceDetail = false;
        state.selectedInvoice = action.payload;
      })
      .addCase(fetchInvoiceDetail.rejected, (state, action) => {
        state.loading.invoiceDetail = false;
        state.error.invoiceDetail = action.payload;
      });
    
    // Fetch payment timeline
    builder
      .addCase(fetchPaymentTimeline.pending, (state) => {
        state.loading.paymentTimeline = true;
        state.error.paymentTimeline = null;
      })
      .addCase(fetchPaymentTimeline.fulfilled, (state, action) => {
        state.loading.paymentTimeline = false;
        state.paymentTimeline = action.payload;
      })
      .addCase(fetchPaymentTimeline.rejected, (state, action) => {
        state.loading.paymentTimeline = false;
        state.error.paymentTimeline = action.payload;
      });
    
    // Pay invoice
    builder
      .addCase(payInvoice.pending, (state) => {
        state.loading.paying = true;
        state.error.paying = null;
      })
      .addCase(payInvoice.fulfilled, (state, action) => {
        state.loading.paying = false;
        
        // Update invoice in lists
        const updatedInvoice = action.payload.invoice;
        if (updatedInvoice) {
          // Update in invoices list
          const index = state.invoices.findIndex(inv => inv.id === updatedInvoice.id);
          if (index !== -1) {
            state.invoices[index] = updatedInvoice;
          }
          
          // Remove from pending invoices if paid
          if (updatedInvoice.status === "PAID") {
            state.pendingInvoices = state.pendingInvoices.filter(
              inv => inv.id !== updatedInvoice.id
            );
          }
          
          // Update selected invoice
          if (state.selectedInvoice?.id === updatedInvoice.id) {
            state.selectedInvoice = updatedInvoice;
          }
          
          // Update current invoice
          if (state.currentInvoice?.id === updatedInvoice.id) {
            state.currentInvoice = null; // No longer current if paid
          }
        }
      })
      .addCase(payInvoice.rejected, (state, action) => {
        state.loading.paying = false;
        state.error.paying = action.payload;
      });
    
    // Check needs payment
    builder
      .addCase(checkNeedsPayment.pending, (state) => {
        state.loading.checkingPayment = true;
        state.error.checkingPayment = null;
      })
      .addCase(checkNeedsPayment.fulfilled, (state, action) => {
        state.loading.checkingPayment = false;
        state.needsPayment = action.payload;
      })
      .addCase(checkNeedsPayment.rejected, (state, action) => {
        state.loading.checkingPayment = false;
        state.error.checkingPayment = action.payload;
      });
    
    // Fetch unbilled sessions count
    builder
      .addCase(fetchUnbilledSessionsCount.pending, (state) => {
        state.loading.unbilledSessions = true;
        state.error.unbilledSessions = null;
      })
      .addCase(fetchUnbilledSessionsCount.fulfilled, (state, action) => {
        state.loading.unbilledSessions = false;
        state.unbilledSessionsCount = action.payload;
      })
      .addCase(fetchUnbilledSessionsCount.rejected, (state, action) => {
        state.loading.unbilledSessions = false;
        state.error.unbilledSessions = action.payload;
      });
  },
});

// Export actions
export const { clearSelectedInvoice, clearErrors, resetInvoiceState } = invoiceSlice.actions;

// Export selectors
export const selectInvoices = (state) => state.invoice.invoices;
export const selectPendingInvoices = (state) => state.invoice.pendingInvoices;
export const selectCurrentInvoice = (state) => state.invoice.currentInvoice;
export const selectSelectedInvoice = (state) => state.invoice.selectedInvoice;
export const selectPaymentTimeline = (state) => state.invoice.paymentTimeline;
export const selectUnbilledSessionsCount = (state) => state.invoice.unbilledSessionsCount;
export const selectNeedsPayment = (state) => state.invoice.needsPayment;
export const selectInvoiceLoading = (state) => state.invoice.loading;
export const selectInvoiceError = (state) => state.invoice.error;

export default invoiceSlice.reducer;

import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  fetchUnbilledSessionsCount,
  fetchCurrentInvoice,
  selectUnbilledSessionsCount,
  selectCurrentInvoice,
  selectInvoiceLoading,
} from "../../../redux/invoice/invoiceSlice";

/**
 * UnbilledSessionsWidget Component - Show unbilled sessions count and payment alerts
 * 
 * Features:
 * - Display count of unbilled charging sessions
 * - Show current unpaid/overdue invoice alert
 * - Quick link to invoices page
 * - Visual indicator for payment urgency
 * 
 * This widget appears on driver dashboard to keep them aware of:
 * 1. How many sessions are waiting for billing (postpaid model)
 * 2. Any urgent payments needed
 */
const UnbilledSessionsWidget = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  // Redux state
  const unbilledCount = useSelector(selectUnbilledSessionsCount);
  const currentInvoice = useSelector(selectCurrentInvoice);
  const loading = useSelector(selectInvoiceLoading);
  
  // Get current user
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  const driverId = currentUser?.driverId || currentUser?.id;
  
  // Fetch data on mount
  useEffect(() => {
    if (driverId) {
      dispatch(fetchUnbilledSessionsCount(driverId));
      dispatch(fetchCurrentInvoice(driverId));
    }
  }, [dispatch, driverId]);
  
  // Format currency
  const formatCurrency = (amount) => {
    if (!amount) return "0 VNĐ";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };
  
  // Calculate days until due/overdue
  const getDaysInfo = (invoice) => {
    if (!invoice?.dueDate) return null;
    
    const now = new Date();
    const dueDate = new Date(invoice.dueDate);
    const daysUntilDue = Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24));
    
    if (invoice.status === "OVERDUE") {
      const daysOverdue = Math.abs(daysUntilDue);
      return {
        text: `Quá hạn ${daysOverdue} ngày`,
        color: "text-red-600",
        urgent: true,
      };
    }
    
    if (daysUntilDue <= 2) {
      return {
        text: `Còn ${daysUntilDue} ngày đến hạn`,
        color: "text-orange-600",
        urgent: true,
      };
    }
    
    return {
      text: `Còn ${daysUntilDue} ngày đến hạn`,
      color: "text-blue-600",
      urgent: false,
    };
  };
  
  const daysInfo = currentInvoice ? getDaysInfo(currentInvoice) : null;
  
  // Loading state
  if (loading.unbilledSessions || loading.currentInvoice) {
    return (
      <div className="bg-white rounded-lg shadow-md p-4 animate-pulse">
        <div className="h-6 bg-gray-200 rounded mb-3"></div>
        <div className="h-4 bg-gray-200 rounded"></div>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {/* Current Invoice Alert (if exists) */}
      {currentInvoice && (
        <div
          className={`rounded-lg shadow-md p-4 cursor-pointer transition-all hover:shadow-lg ${
            daysInfo?.urgent
              ? currentInvoice.status === "OVERDUE"
                ? "bg-red-50 border-2 border-red-500"
                : "bg-orange-50 border-2 border-orange-500"
              : "bg-blue-50 border border-blue-200"
          }`}
          onClick={() => navigate(`/driver/invoices/${currentInvoice.id}`)}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                {daysInfo?.urgent && (
                  <span className="text-2xl">
                    {currentInvoice.status === "OVERDUE" ? "🚨" : "⏰"}
                  </span>
                )}
                <h3 className="font-bold text-gray-800">
                  {currentInvoice.status === "OVERDUE" 
                    ? "⚠️ Hóa đơn quá hạn!" 
                    : "💳 Hóa đơn cần thanh toán"}
                </h3>
              </div>
              
              <p className="text-2xl font-bold text-gray-900 mb-1">
                {formatCurrency(currentInvoice.totalCost)}
              </p>
              
              {daysInfo && (
                <p className={`text-sm font-medium ${daysInfo.color}`}>
                  {daysInfo.text}
                </p>
              )}
              
              <p className="text-xs text-gray-500 mt-2">
                Hóa đơn #{currentInvoice.id}
              </p>
            </div>
            
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/driver/invoices/${currentInvoice.id}`);
              }}
              className={`px-4 py-2 rounded-lg font-medium text-white transition-colors ${
                currentInvoice.status === "OVERDUE"
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              Thanh toán
            </button>
          </div>
        </div>
      )}
      
      {/* Unbilled Sessions Info */}
      <div
        className="bg-white rounded-lg shadow-md p-4 cursor-pointer hover:shadow-lg transition-all"
        onClick={() => navigate("/driver/invoices")}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 rounded-full p-3">
              <span className="text-2xl">⚡</span>
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">Phiên sạc chưa thanh toán</h3>
              <p className="text-sm text-gray-500">
                {unbilledCount === 0 
                  ? "Không có phiên sạc nào đang chờ thanh toán"
                  : "Sẽ được tổng hợp vào hóa đơn sau 30 ngày"}
              </p>
            </div>
          </div>
          
          <div className="text-right">
            <p className="text-3xl font-bold text-blue-600">
              {unbilledCount}
            </p>
            <p className="text-xs text-gray-500">phiên</p>
          </div>
        </div>
        
        {unbilledCount > 0 && (
          <div className="mt-3 pt-3 border-t">
            <p className="text-xs text-gray-500">
              💡 <strong>Postpaid billing:</strong> Bạn sạc trước, thanh toán sau.
              Admin sẽ tạo hóa đơn tổng hợp sau 30 ngày.
            </p>
          </div>
        )}
      </div>
      
      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => navigate("/driver/invoices")}
          className="bg-white border-2 border-gray-200 rounded-lg p-3 hover:border-blue-500 hover:bg-blue-50 transition-all"
        >
          <div className="text-center">
            <div className="text-2xl mb-1">📋</div>
            <p className="text-sm font-medium text-gray-700">Xem tất cả hóa đơn</p>
          </div>
        </button>
        
        <button
          onClick={() => navigate("/driver/sessions")}
          className="bg-white border-2 border-gray-200 rounded-lg p-3 hover:border-blue-500 hover:bg-blue-50 transition-all"
        >
          <div className="text-center">
            <div className="text-2xl mb-1">⚡</div>
            <p className="text-sm font-medium text-gray-700">Lịch sử sạc</p>
          </div>
        </button>
      </div>
    </div>
  );
};

export default UnbilledSessionsWidget;

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Receipt } from "lucide-react";
import {
  fetchDriverInvoices,
  selectInvoices,
  selectInvoiceLoading,
  selectInvoiceError,
} from "../../../redux/invoice/invoiceSlice";
import { getStatusColor, getStatusText } from "../../../services/apiPayment";
import { INVOICE_STATUS } from '../../../constants/paymentStatus';
import PageHeader from '../../../Components/Common/PageHeader';

/**
 * InvoiceList Component - Display all invoices for driver
 * 
 * Features:
 * - List all invoices with status badges
 * - Filter by status (ALL, UNPAID, OVERDUE, PAID)
 * - Sort by due date
 * - Click to view detail
 * - Highlight urgent invoices (overdue, near suspension)
 */
const InvoiceList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  // Redux state
  const invoices = useSelector(selectInvoices);
  const loading = useSelector(selectInvoiceLoading);
  const error = useSelector(selectInvoiceError);
  
  // Local state
  const [filter, setFilter] = useState("ALL"); // ALL, UNPAID, OVERDUE, PAID
  const [sortedInvoices, setSortedInvoices] = useState([]);
  
  // Get current user
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  const driverId = currentUser?.driverId || currentUser?.id;
  
  // Fetch invoices on mount
  useEffect(() => {
    if (driverId) {
      dispatch(fetchDriverInvoices(driverId));
    }
  }, [dispatch, driverId]);
  
  // Filter and sort invoices
  useEffect(() => {
    let filtered = [...invoices];
    
    // Apply filter
    if (filter !== "ALL") {
      filtered = filtered.filter(invoice => invoice.status === filter);
    }
    
    // Sort by due date (oldest first, then by status priority)
    filtered.sort((a, b) => {
      // Priority: overdue > unpaid > paid
      const statusPriority = { overdue: 0, unpaid: 1, paid: 2 };
      const priorityDiff = statusPriority[a.status?.toLowerCase()] - statusPriority[b.status?.toLowerCase()];
      
      if (priorityDiff !== 0) return priorityDiff;
      
      // Within same status, sort by due date
      if (a.dueDate && b.dueDate) {
        return new Date(a.dueDate) - new Date(b.dueDate);
      }
      return 0;
    });
    
    setSortedInvoices(filtered);
  }, [invoices, filter]);
  
  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN");
  };
  
  // Format currency
  const formatCurrency = (amount) => {
    if (!amount) return "0 VNĐ";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };
  
  // Calculate urgency indicator
  const getUrgencyIndicator = (invoice) => {
    if (invoice.status?.toLowerCase() === INVOICE_STATUS.PAID) return null;
    
    const now = new Date();
    const dueDate = new Date(invoice.dueDate);
    const daysUntilDue = Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24));
    
    if (invoice.status?.toLowerCase() === "overdue") {
      const daysOverdue = Math.abs(daysUntilDue);
      if (daysOverdue >= 7) {
        return { text: "🔒 Tài khoản bị khóa", color: "bg-black text-white" };
      }
      return { text: `⚠️ Quá hạn ${daysOverdue} ngày`, color: "bg-red-600 text-white" };
    }
    
    if (daysUntilDue <= 2) {
      return { text: `⏰ Còn ${daysUntilDue} ngày`, color: "bg-orange-500 text-white" };
    }
    
    return null;
  };
  
  // Handle invoice click
  const handleInvoiceClick = (invoiceId) => {
    navigate(`/driver/invoices/${invoiceId}`);
  };
  
  // Loading state
  if (loading.invoices) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        <span className="ml-3 text-gray-600">Đang tải hóa đơn...</span>
      </div>
    );
  }
  
  // Error state
  if (error.invoices) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">❌ Lỗi: {error.invoices}</p>
        <button
          onClick={() => dispatch(fetchDriverInvoices(driverId))}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Thử lại
        </button>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader
        title="Hóa đơn của tôi"
        subtitle="Quản lý và thanh toán hóa đơn sạc xe điện (Phương thức trả sau)"
        showBackButton
        onBack="/driver"
        icon={Receipt}
        iconBgColor="bg-green-100"
        iconColor="text-green-600"
        breadcrumbs={[
          { label: 'Trang chủ', path: '/driver' },
          { label: 'Hóa đơn' }
        ]}
      />
      
      <div className="max-w-7xl mx-auto px-6 py-6">
      {/* Filter tabs */}
      <div className="mb-6 flex gap-2 border-b">
        {["ALL", "unpaid", "overdue", "paid"].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-6 py-3 font-medium transition-colors ${
              filter === status
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {status === "ALL" ? "Tất cả" : getStatusText(status)}
            {status !== "ALL" && (
              <span className="ml-2 px-2 py-0.5 bg-gray-200 rounded-full text-xs">
                {invoices.filter(inv => inv.status?.toLowerCase() === status.toLowerCase()).length}
              </span>
            )}
          </button>
        ))}
      </div>
      
      {/* Invoice list */}
      {sortedInvoices.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500 text-lg">📭 Không có hóa đơn nào</p>
          <p className="text-gray-400 mt-2">
            {filter === "ALL" 
              ? "Bạn chưa có hóa đơn nào được tạo" 
              : `Không có hóa đơn ${getStatusText(filter).toLowerCase()}`}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedInvoices.map((invoice) => {
            const urgency = getUrgencyIndicator(invoice);
            const statusColor = getStatusColor(invoice.status);
            
            return (
              <div
                key={invoice.invoiceId || invoice.id}
                className={`bg-white border rounded-lg p-6 transition-all hover:shadow-md ${
                  urgency ? "border-l-4 border-l-red-500" : ""
                }`}
              >
                <div className="flex justify-between items-start">
                  {/* Left: Invoice info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold text-gray-800">
                        Hóa đơn #{invoice.id}
                      </h3>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium bg-${statusColor}-100 text-${statusColor}-800`}
                      >
                        {getStatusText(invoice.status)}
                      </span>
                      {urgency && (
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${urgency.color}`}>
                          {urgency.text}
                        </span>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 mt-4">
                      <div>
                        <p className="text-gray-400 mb-1">Kỳ thanh toán</p>
                        <p className="font-medium">
                          {formatDate(invoice.billingStartDate)} - {formatDate(invoice.billingEndDate)}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-400 mb-1">Ngày phát hành</p>
                        <p className="font-medium">{formatDate(invoice.issueDate)}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 mb-1">Hạn thanh toán</p>
                        <p className="font-medium text-orange-600">{formatDate(invoice.dueDate)}</p>
                      </div>
                      {invoice.paidDate && (
                        <div>
                          <p className="text-gray-400 mb-1">Ngày thanh toán</p>
                          <p className="font-medium text-green-600">{formatDate(invoice.paidDate)}</p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Right: Amount */}
                  <div className="text-right ml-6">
                    <p className="text-gray-400 text-sm mb-1">Tổng tiền</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {formatCurrency(invoice.totalCost)}
                    </p>
                    {invoice.paymentMethod && (
                      <p className="text-xs text-gray-500 mt-1">
                        Thanh toán: {invoice.paymentMethod}
                      </p>
                    )}
                  </div>
                </div>
                
                {/* Timeline info (if available) */}
                {invoice.timeline && (
                  <div className="mt-4 pt-4 border-t">
                    <div className="flex items-center gap-4 text-sm">
                      {invoice.timeline.daysUntilDue !== null && (
                        <span className="text-gray-600">
                          📅 {invoice.timeline.daysUntilDue > 0 
                            ? `Còn ${invoice.timeline.daysUntilDue} ngày đến hạn`
                            : "Đã đến hạn"}
                        </span>
                      )}
                      {invoice.timeline.daysInGracePeriod !== null && (
                        <span className="text-orange-600">
                          ⚠️ Trong thời gian gia hạn: {invoice.timeline.daysInGracePeriod} ngày
                        </span>
                      )}
                      {invoice.timeline.daysUntilSuspension !== null && (
                        <span className="text-red-600 font-bold">
                          🚨 Tài khoản sẽ bị khóa sau {invoice.timeline.daysUntilSuspension} ngày
                        </span>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Action buttons */}
                <div className="mt-4 pt-4 border-t flex justify-between items-center">
                  <button
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent card click
                      handleInvoiceClick(invoice.invoiceId || invoice.id);
                    }}
                    className="text-blue-600 text-sm hover:underline font-medium"
                  >
                    📄 Xem chi tiết
                  </button>
                  
                  {(invoice.status?.toLowerCase() === "unpaid" || invoice.status?.toLowerCase() === "overdue") && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent card click
                        navigate(`/driver/invoices/${invoice.invoiceId || invoice.id}`);
                      }}
                      className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
                        invoice.status === "OVERDUE"
                          ? "bg-red-600 hover:bg-red-700 text-white"
                          : "bg-blue-600 hover:bg-blue-700 text-white"
                      }`}
                    >
                      💳 Thanh toán ngay
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
      </div>
    </div>
  );
};

export default InvoiceList;

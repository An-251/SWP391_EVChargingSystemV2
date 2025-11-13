import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { Modal, Radio, Card, Tag, Divider, message } from "antd";
import { DollarOutlined, CreditCardOutlined } from "@ant-design/icons";
import api from "../../../configs/config-axios";
import {
  fetchInvoiceDetail,
  fetchPaymentTimeline,
  selectSelectedInvoice,
  selectPaymentTimeline,
  selectInvoiceLoading,
  selectInvoiceError,
  clearSelectedInvoice,
} from "../../../redux/invoice/invoiceSlice";
import {
  getStatusColor,
  getStatusText,
  getUrgencyMessage,
  calculateUrgency,
} from "../../../services/apiPayment";
import { PAYMENT_METHOD } from "../../../constants/paymentStatus";

/**
 * InvoiceDetail Component - Show full invoice with sessions breakdown
 * 
 * Features:
 * - Display invoice header (billing period, dates, amount)
 * - Show all charging sessions included in invoice
 * - Payment timeline visualization (days until due/overdue/suspension)
 * - Payment button (if UNPAID or OVERDUE)
 * - QR code display (if available)
 */
const InvoiceDetail = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { invoiceId } = useParams();
  
  // Redux state
  const currentUser = useSelector((state) => state.auth.user);
  const invoice = useSelector(selectSelectedInvoice);
  const timeline = useSelector(selectPaymentTimeline);
  const loading = useSelector(selectInvoiceLoading);
  const error = useSelector(selectInvoiceError);
  
  // Payment modal state
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState(PAYMENT_METHOD.CASH);
  const [paying, setPaying] = useState(false);
  
  // Fetch invoice detail and timeline
  useEffect(() => {
    if (invoiceId) {
      dispatch(fetchInvoiceDetail(invoiceId));
      dispatch(fetchPaymentTimeline(invoiceId));
    }
    
    return () => {
      dispatch(clearSelectedInvoice());
    };
  }, [dispatch, invoiceId]);
  
  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };
  
  // Format date short
  const formatDateShort = (dateString) => {
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
  
  // Calculate timeline progress
  const getTimelineProgress = () => {
    if (!timeline) return { percent: 0, phase: "safe" };
    
    const urgency = calculateUrgency(timeline);
    
    if (urgency === "critical") return { percent: 100, phase: "critical" };
    if (urgency === "danger") return { percent: 85, phase: "danger" };
    if (urgency === "warning") return { percent: 60, phase: "warning" };
    return { percent: 30, phase: "safe" };
  };
  
  // Handle payment button click
  const handlePaymentClick = () => {
    setPaymentModalVisible(true);
  };
  
  // Handle payment confirmation
  const handleConfirmPayment = async () => {
    // Get invoice ID (handle both 'id' and 'invoiceId' fields)
    const invId = invoice?.id || invoice?.invoiceId;
    
    if (!invoice || !invId) {
      message.error("Thông tin hóa đơn không hợp lệ");
      console.error("❌ [PAYMENT] Invalid invoice:", invoice);
      return;
    }

    const driverId = currentUser?.driverId || invoice.driver?.id;
    
    if (!driverId) {
      message.error("Không tìm thấy thông tin tài xế");
      console.error("❌ [PAYMENT] Missing driverId:", { currentUser, invoice });
      return;
    }

    console.log("💳 [PAYMENT] Starting payment:", {
      invoiceId: invId,
      driverId,
      amount: invoice.totalCost,
      method: paymentMethod
    });

    setPaying(true);
    setPaymentModalVisible(false);

    try {
      if (paymentMethod === PAYMENT_METHOD.CASH) {
        // Create cash payment request
        const facilityId = invoice.sessions?.[0]?.reservation?.chargingPoint?.station?.facility?.id 
          || invoice.sessions?.[0]?.charger?.chargingPoint?.station?.facility?.id
          || 1;

        console.log("💰 [CASH] Creating cash payment request:", {
          requestType: "INVOICE",
          referenceId: invId,
          driverId,
          facilityId,
          amount: invoice.totalCost
        });

        const response = await api.post("/cash-payments/request", {
          requestType: "INVOICE",
          referenceId: invId,
          driverId: driverId,
          facilityId: facilityId,
          amount: invoice.totalCost
        });

        console.log("✅ [CASH] Payment request created:", response.data);
        message.success("Yêu cầu thanh toán tiền mặt đã được gửi! Vui lòng chờ nhân viên duyệt.");
        
        // Refresh invoice
        dispatch(fetchInvoiceDetail(invoiceId));
        setPaying(false);

      } else if (paymentMethod === PAYMENT_METHOD.VNPAY) {
        // Create VNPay payment
        console.log("💳 [VNPAY] Creating VNPay payment:", {
          referenceId: invId,
          driverId,
          amount: invoice.totalCost
        });

        const response = await api.post("/vnpay/invoice/create-payment", {
          referenceId: invId,
          driverId: driverId,
          amount: invoice.totalCost,
          returnUrl: `${window.location.origin}/payment/vnpay/callback`
        });

        const paymentUrl = response.data?.data?.paymentUrl || response.data?.paymentUrl;
        
        if (paymentUrl) {
          message.success("Đang chuyển đến cổng thanh toán VNPay...");
          window.location.href = paymentUrl;
        } else {
          throw new Error("Không nhận được URL thanh toán");
        }
      }
    } catch (error) {
      console.error("❌ Payment error:", error);
      message.error(error.response?.data?.message || "Thanh toán thất bại. Vui lòng thử lại.");
      setPaying(false);
    }
  };
  
  // Loading state
  if (loading.invoiceDetail || loading.paymentTimeline) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        <span className="ml-3 text-gray-600">Đang tải chi tiết hóa đơn...</span>
      </div>
    );
  }
  
  // Error state
  if (error.invoiceDetail) {
    const errorMessage = typeof error.invoiceDetail === 'string' 
      ? error.invoiceDetail 
      : error.invoiceDetail?.message || JSON.stringify(error.invoiceDetail);
    
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <p className="text-red-800 text-lg">❌ Lỗi: {errorMessage}</p>
          <button
            onClick={() => navigate("/driver/invoices")}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Quay lại danh sách hóa đơn
          </button>
        </div>
      </div>
    );
  }
  
  if (!invoice) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">📭 Không tìm thấy hóa đơn</p>
          <button
            onClick={() => navigate("/driver/invoices")}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Quay lại danh sách hóa đơn
          </button>
        </div>
      </div>
    );
  }
  
  const statusColor = getStatusColor(invoice.status);
  const { percent: progressPercent, phase: progressPhase } = getTimelineProgress();
  const urgencyMsg = getUrgencyMessage(timeline);
  const canPay = invoice.status?.toLowerCase() === "unpaid" || invoice.status?.toLowerCase() === "overdue";
  
  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate("/driver/invoices")}
          className="text-blue-600 hover:underline mb-2"
        >
          ← Quay lại danh sách
        </button>
        <h1 className="text-3xl font-bold text-gray-800">Chi tiết hóa đơn #{invoice.invoiceId || invoice.id}</h1>
      </div>
      
      {/* Urgency alert */}
      {urgencyMsg && canPay && (
        <div className={`mb-6 p-4 rounded-lg ${
          progressPhase === "critical" ? "bg-black text-white" :
          progressPhase === "danger" ? "bg-red-50 border border-red-200" :
          progressPhase === "warning" ? "bg-orange-50 border border-orange-200" :
          "bg-blue-50 border border-blue-200"
        }`}>
          <p className={`font-medium ${
            progressPhase === "critical" ? "text-white" :
            progressPhase === "danger" ? "text-red-800" :
            progressPhase === "warning" ? "text-orange-800" :
            "text-blue-800"
          }`}>
            {urgencyMsg}
          </p>
        </div>
      )}
      
      {/* Invoice header card */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <h2 className="text-2xl font-bold text-gray-800">Hóa đơn #{invoice.invoiceId || invoice.id}</h2>
              <span
                className={`px-4 py-1 rounded-full text-sm font-medium bg-${statusColor}-100 text-${statusColor}-800`}
              >
                {getStatusText(invoice.status)}
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-400 mb-1">Kỳ thanh toán</p>
                <p className="font-medium text-gray-700">
                  {formatDateShort(invoice.billingStartDate)} - {formatDateShort(invoice.billingEndDate)}
                </p>
              </div>
              <div>
                <p className="text-gray-400 mb-1">Ngày phát hành</p>
                <p className="font-medium text-gray-700">{formatDate(invoice.issueDate)}</p>
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
          
          <div className="text-right">
            <p className="text-gray-400 text-sm mb-1">Tổng tiền</p>
            <p className="text-4xl font-bold text-blue-600">
              {formatCurrency(invoice.totalCost)}
            </p>
            {invoice.paymentMethod && (
              <p className="text-sm text-gray-500 mt-2">
                Phương thức: {invoice.paymentMethod}
              </p>
            )}
          </div>
        </div>
        
        {/* Payment timeline visualization */}
        {timeline && canPay && (
          <div className="mt-6 pt-6 border-t">
            <p className="text-sm text-gray-600 mb-2 font-medium">Tiến trình thanh toán</p>
            <div className="relative pt-1">
              <div className="flex mb-2 items-center justify-between text-xs">
                <span>Phát hành</span>
                <span>Hạn thanh toán (7 ngày)</span>
                <span>Gia hạn (7 ngày)</span>
                <span>Khóa tài khoản</span>
              </div>
              <div className="overflow-hidden h-3 text-xs flex rounded bg-gray-200">
                <div
                  style={{ width: `${progressPercent}%` }}
                  className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${
                    progressPhase === "critical" ? "bg-black" :
                    progressPhase === "danger" ? "bg-red-600" :
                    progressPhase === "warning" ? "bg-orange-500" :
                    "bg-green-500"
                  } transition-all duration-500`}
                ></div>
              </div>
              <div className="flex justify-between text-xs mt-2 text-gray-600">
                {timeline.daysUntilDue !== null && timeline.daysUntilDue > 0 && (
                  <span>Còn {timeline.daysUntilDue} ngày</span>
                )}
                {timeline.daysInGracePeriod !== null && (
                  <span className="text-orange-600">
                    Gia hạn: {timeline.daysInGracePeriod} ngày
                  </span>
                )}
                {timeline.daysUntilSuspension !== null && (
                  <span className="text-red-600 font-bold">
                    Khóa sau: {timeline.daysUntilSuspension} ngày
                  </span>
                )}
              </div>
            </div>
          </div>
        )}
        
        {/* Payment button */}
        {canPay && (
          <div className="mt-6">
            <button
              onClick={handlePaymentClick}
              className={`w-full py-3 rounded-lg font-medium text-white transition-colors ${
                progressPhase === "critical" ? "bg-black hover:bg-gray-900" :
                progressPhase === "danger" ? "bg-red-600 hover:bg-red-700" :
                "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              💳 Thanh toán ngay
            </button>
          </div>
        )}
      </div>
      
      {/* Payment Method Selection Modal */}
      <Modal
        title={
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "24px" }}>💳</span>
            <span>Chọn phương thức thanh toán</span>
          </div>
        }
        open={paymentModalVisible}
        onOk={handleConfirmPayment}
        onCancel={() => setPaymentModalVisible(false)}
        okText="Xác nhận thanh toán"
        cancelText="Hủy"
        okButtonProps={{ size: "large", loading: paying }}
        cancelButtonProps={{ size: "large", disabled: paying }}
        width={600}
      >
        <Card className="mb-4" style={{ backgroundColor: "#f0f5ff", border: "1px solid #d6e4ff" }}>
          <div style={{ textAlign: "center" }}>
            <h4 style={{ marginBottom: "8px", fontSize: "18px", fontWeight: "600" }}>
              Hóa đơn #{invoice?.invoiceId || invoice?.id}
            </h4>
            <h2 style={{ color: "#1890ff", margin: 0, fontSize: "32px", fontWeight: "bold" }}>
              {formatCurrency(invoice?.totalCost)}
            </h2>
            <p style={{ color: "#8c8c8c", marginTop: "4px" }}>Tổng chi phí</p>
          </div>
        </Card>

        <Divider>Chọn phương thức thanh toán</Divider>

        <Radio.Group 
          value={paymentMethod} 
          onChange={(e) => setPaymentMethod(e.target.value)}
          style={{ width: "100%" }}
          size="large"
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <Card 
              hoverable
              onClick={() => setPaymentMethod(PAYMENT_METHOD.CASH)}
              style={{ 
                cursor: "pointer",
                border: paymentMethod === PAYMENT_METHOD.CASH ? "2px solid #1890ff" : "1px solid #d9d9d9"
              }}
            >
              <Radio value={PAYMENT_METHOD.CASH} style={{ width: "100%" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginLeft: "8px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <DollarOutlined style={{ fontSize: "24px", color: "#52c41a" }} />
                    <div>
                      <div style={{ fontWeight: "bold", fontSize: "16px" }}>
                        Tiền mặt
                      </div>
                      <div style={{ fontSize: "13px", color: "#666" }}>
                        Thanh toán tại cơ sở 
                      </div>
                    </div>
                  </div>
                </div>
              </Radio>
            </Card>

            <Card 
              hoverable
              onClick={() => setPaymentMethod(PAYMENT_METHOD.VNPAY)}
              style={{ 
                cursor: "pointer",
                border: paymentMethod === PAYMENT_METHOD.VNPAY ? "2px solid #1890ff" : "1px solid #d9d9d9"
              }}
            >
              <Radio value={PAYMENT_METHOD.VNPAY} style={{ width: "100%" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginLeft: "8px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <CreditCardOutlined style={{ fontSize: "24px", color: "#1890ff" }} />
                    <div>
                      <div style={{ fontWeight: "bold", fontSize: "16px" }}>
                        VNPay
                      </div>
                      <div style={{ fontSize: "13px", color: "#666" }}>
                        Thanh toán online - Xác nhận tự động
                      </div>
                    </div>
                  </div>
                  <Tag color="blue">Nhanh chóng</Tag>
                </div>
              </Radio>
            </Card>
          </div>
        </Radio.Group>

        <Divider />
      </Modal>
      
      {/* Charging sessions breakdown */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">
          Chi tiết phiên sạc ({invoice.sessions?.length || 0} phiên)
        </h3>
        
        {(!invoice.sessions || invoice.sessions.length === 0) ? (
          <p className="text-gray-500 text-center py-8">Không có phiên sạc nào</p>
        ) : (
          <div className="space-y-3">
            {invoice.sessions.map((session, index) => (
              <div
                key={session.id}
                className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-semibold text-gray-700">
                        Phiên #{session.id}
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatDate(session.startTime)}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 text-sm text-gray-600">
                      <div>
                        <p className="text-gray-400 mb-1">Trạm sạc</p>
                        <p className="font-medium">{session.stationName || "N/A"}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 mb-1">Thời lượng</p>
                        <p className="font-medium">{session.duration || "N/A"}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 mb-1">Điện năng</p>
                        <p className="font-medium">{session.energyConsumed || 0} kWh</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right ml-6">
                    <p className="text-lg font-bold text-blue-600">
                      {formatCurrency(session.cost)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Total summary */}
        <div className="mt-6 pt-6 border-t">
          <div className="flex justify-between items-center">
            <span className="text-lg font-medium text-gray-700">
              Tổng cộng ({invoice.sessions?.length || 0} phiên sạc)
            </span>
            <span className="text-2xl font-bold text-blue-600">
              {formatCurrency(invoice.totalCost)}
            </span>
          </div>
        </div>
      </div>
      
      {/* QR Code (if available) */}
      {invoice.qrCode && (
        <div className="bg-white rounded-lg shadow-md p-6 mt-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Mã QR thanh toán</h3>
          <div className="flex justify-center">
            <img src={invoice.qrCode} alt="QR Code" className="w-64 h-64" />
          </div>
        </div>
      )}
    </div>
  );
};

export default InvoiceDetail;

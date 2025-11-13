import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { payInvoice, selectInvoiceLoading, selectInvoiceError } from "../../../redux/invoice/invoiceSlice";
import { formatPaymentMethod } from "../../../services/apiPayment";

/**
 * PaymentInterface Component - Payment method selection and confirmation
 * 
 * Features:
 * - Select payment method (CASH, CARD, EWALLET)
 * - Display payment instructions
 * - Confirm payment
 * - Show QR code (if available)
 * - Success/error feedback
 */
const PaymentInterface = ({ invoice, onClose, onSuccess }) => {
  const dispatch = useDispatch();
  
  // Redux state
  const loading = useSelector(selectInvoiceLoading);
  const error = useSelector(selectInvoiceError);
  
  // Local state
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  
  // Payment methods
  const paymentMethods = [
    {
      id: "CASH",
      name: "Tiền mặt",
      icon: "💵",
      description: "Thanh toán trực tiếp tại trạm sạc hoặc văn phòng",
      instructions: [
        "Đến trạm sạc hoặc văn phòng gần nhất",
        "Cung cấp mã hóa đơn cho nhân viên",
        "Thanh toán và nhận biên lai",
      ],
    },
    {
      id: "CARD",
      name: "Thẻ ngân hàng",
      icon: "💳",
      description: "Thanh toán qua thẻ ATM/Credit Card",
      instructions: [
        "Nhập thông tin thẻ ngân hàng",
        "Xác nhận OTP từ ngân hàng",
        "Hoàn tất thanh toán",
      ],
    },
    {
      id: "EWALLET",
      name: "Ví điện tử",
      icon: "📱",
      description: "Thanh toán qua MoMo, ZaloPay, VNPay",
      instructions: [
        "Quét mã QR bằng ứng dụng ví điện tử",
        "Xác nhận thanh toán trên ứng dụng",
        "Chờ xác nhận từ hệ thống",
      ],
    },
  ];
  
  // Format currency
  const formatCurrency = (amount) => {
    if (!amount) return "0 VNĐ";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };
  
  // Handle payment method selection
  const handleMethodSelect = (methodId) => {
    setSelectedMethod(methodId);
    setShowConfirmation(true);
  };
  
  // Handle payment confirmation
  const handleConfirmPayment = async () => {
    if (!selectedMethod) return;
    
    try {
      await dispatch(
        payInvoice({
          invoiceId: invoice.invoiceId || invoice.id,
          paymentMethod: selectedMethod,
        })
      ).unwrap();
      
      setPaymentSuccess(true);
      
      // Wait 2 seconds then close and callback
      setTimeout(() => {
        if (onSuccess) onSuccess();
        onClose();
      }, 2000);
    } catch (err) {
      console.error("Payment failed:", err);
    }
  };
  
  // Handle back to method selection
  const handleBackToSelection = () => {
    setShowConfirmation(false);
    setSelectedMethod(null);
  };
  
  // Get selected method details
  const selectedMethodData = paymentMethods.find(m => m.id === selectedMethod);
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b p-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">
            {paymentSuccess ? "✅ Thanh toán thành công" : "💳 Thanh toán hóa đơn"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
          >
            ×
          </button>
        </div>
        
        <div className="p-6">
          {/* Payment success */}
          {paymentSuccess ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">✅</div>
              <h3 className="text-2xl font-bold text-green-600 mb-2">
                Thanh toán thành công!
              </h3>
              <p className="text-gray-600">
                Hóa đơn #{invoice.invoiceId || invoice.id} đã được thanh toán
              </p>
              <p className="text-gray-600 mt-2">
                Số tiền: {formatCurrency(invoice.totalCost)}
              </p>
              <p className="text-sm text-gray-400 mt-4">
                Đang chuyển hướng...
              </p>
            </div>
          ) : (
            <>
              {/* Invoice summary */}
              <div className="bg-blue-50 rounded-lg p-4 mb-6">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-600">Hóa đơn #{invoice.invoiceId || invoice.id}</p>
                    <p className="text-xs text-gray-500">
                      Kỳ thanh toán: {new Date(invoice.billingStartDate).toLocaleDateString("vi-VN")} 
                      {" - "}
                      {new Date(invoice.billingEndDate).toLocaleDateString("vi-VN")}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-blue-600">
                      {formatCurrency(invoice.totalCost)}
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Payment method selection */}
              {!showConfirmation ? (
                <>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    Chọn phương thức thanh toán
                  </h3>
                  
                  <div className="space-y-3">
                    {paymentMethods.map((method) => (
                      <button
                        key={method.id}
                        onClick={() => handleMethodSelect(method.id)}
                        className="w-full border-2 rounded-lg p-4 hover:border-blue-500 hover:bg-blue-50 transition-all text-left"
                      >
                        <div className="flex items-start gap-4">
                          <div className="text-4xl">{method.icon}</div>
                          <div className="flex-1">
                            <h4 className="text-lg font-semibold text-gray-800 mb-1">
                              {method.name}
                            </h4>
                            <p className="text-sm text-gray-600">
                              {method.description}
                            </p>
                          </div>
                          <div className="text-blue-600 text-2xl">→</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <>
                  {/* Payment confirmation */}
                  <button
                    onClick={handleBackToSelection}
                    className="text-blue-600 hover:underline mb-4"
                  >
                    ← Chọn phương thức khác
                  </button>
                  
                  <div className="bg-gray-50 rounded-lg p-6 mb-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="text-5xl">{selectedMethodData?.icon}</div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-800">
                          {selectedMethodData?.name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {selectedMethodData?.description}
                        </p>
                      </div>
                    </div>
                    
                    {/* Payment instructions */}
                    <div className="mb-6">
                      <p className="font-semibold text-gray-700 mb-2">Hướng dẫn thanh toán:</p>
                      <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600">
                        {selectedMethodData?.instructions.map((instruction, index) => (
                          <li key={index}>{instruction}</li>
                        ))}
                      </ol>
                    </div>
                    
                    {/* QR Code for EWALLET */}
                    {selectedMethod === "EWALLET" && invoice.qrCode && (
                      <div className="bg-white rounded-lg p-4 mb-4">
                        <p className="text-center text-sm text-gray-600 mb-3">
                          Quét mã QR để thanh toán
                        </p>
                        <div className="flex justify-center">
                          <img
                            src={invoice.qrCode}
                            alt="QR Code"
                            className="w-48 h-48"
                          />
                        </div>
                      </div>
                    )}
                    
                    {/* Amount confirmation */}
                    <div className="bg-white rounded-lg p-4 border-2 border-blue-200">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Số tiền thanh toán:</span>
                        <span className="text-2xl font-bold text-blue-600">
                          {formatCurrency(invoice.totalCost)}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Error message */}
                  {error.paying && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                      <p className="text-red-800">❌ {error.paying}</p>
                    </div>
                  )}
                  
                  {/* Confirm button */}
                  <button
                    onClick={handleConfirmPayment}
                    disabled={loading.paying}
                    className="w-full bg-green-600 hover:bg-green-700 text-white py-4 rounded-lg font-semibold text-lg transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {loading.paying ? (
                      <span className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Đang xử lý...
                      </span>
                    ) : (
                      `✅ Xác nhận thanh toán ${formatCurrency(invoice.totalCost)}`
                    )}
                  </button>
                  
                  <p className="text-xs text-gray-400 text-center mt-3">
                    Bằng cách xác nhận, bạn đồng ý thanh toán hóa đơn này
                  </p>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentInterface;

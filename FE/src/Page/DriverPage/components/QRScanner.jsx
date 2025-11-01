import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Camera, X, CheckCircle, AlertCircle } from 'lucide-react';
import { Button, Modal, Spin, Alert } from 'antd';

/**
 * Component để quét QR code của driver trước khi sạc
 * Sử dụng html5-qrcode library
 */
const QRScanner = ({ 
  isOpen, 
  onClose, 
  onScanSuccess, 
  expectedDriverId = null 
}) => {
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState(null);
  const [scanResult, setScanResult] = useState(null);
  const scannerRef = useRef(null);
  const html5QrCodeRef = useRef(null);
  const isProcessingRef = useRef(false); // Flag to prevent multiple scans
  const hasSuccessRef = useRef(false); // Track if already succeeded

  useEffect(() => {
    if (isOpen && !scanning) {
      // Reset flags when opening modal
      isProcessingRef.current = false;
      hasSuccessRef.current = false;
      startScanner();
    }

    return () => {
      stopScanner();
    };
  }, [isOpen]);

  const startScanner = async () => {
    try {
      setScanning(true);
      setError(null);

      // Check if browser supports camera
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('BROWSER_NOT_SUPPORTED');
      }

      // Request camera permission first
      try {
        await navigator.mediaDevices.getUserMedia({ video: true });
      } catch (permErr) {
        console.error('Camera permission denied:', permErr);
        throw new Error('PERMISSION_DENIED');
      }

      // Initialize scanner
      html5QrCodeRef.current = new Html5Qrcode('qr-reader');

      const config = {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
      };

      // Start scanning
      await html5QrCodeRef.current.start(
        { facingMode: 'environment' }, // Use back camera
        config,
        handleScanSuccess,
        handleScanError
      );
    } catch (err) {
      console.error('Error starting scanner:', err);
      
      let errorMessage = 'Không thể khởi động camera.';
      
      if (err.message === 'PERMISSION_DENIED' || err.name === 'NotAllowedError') {
        errorMessage = (
          <div className="space-y-2">
            <p className="font-semibold">❌ Không có quyền truy cập camera</p>
            <p className="text-sm">Vui lòng làm theo hướng dẫn:</p>
            <ol className="text-sm list-decimal list-inside space-y-1 ml-2">
              <li>Click vào biểu tượng 🔒 hoặc 🛡️ bên trái thanh địa chỉ</li>
              <li>Tìm mục "Camera" → Chọn "Allow/Cho phép"</li>
              <li>Reload lại trang (F5)</li>
              <li>Thử quét QR lại</li>
            </ol>
            <p className="text-xs text-gray-500 mt-2">
              <strong>Microsoft Edge:</strong> Settings → Site permissions → Camera → Allow this site
            </p>
          </div>
        );
      } else if (err.message === 'BROWSER_NOT_SUPPORTED') {
        errorMessage = (
          <div className="space-y-2">
            <p className="font-semibold">❌ Trình duyệt không hỗ trợ camera</p>
            <p className="text-sm">Vui lòng sử dụng Chrome, Edge, hoặc Firefox phiên bản mới nhất.</p>
          </div>
        );
      } else if (err.name === 'NotFoundError') {
        errorMessage = 'Không tìm thấy camera. Vui lòng kiểm tra kết nối camera.';
      }
      
      setError(errorMessage);
      setScanning(false);
    }
  };

  const stopScanner = async () => {
    if (html5QrCodeRef.current && scanning) {
      try {
        await html5QrCodeRef.current.stop();
        html5QrCodeRef.current.clear();
      } catch (err) {
        console.error('Error stopping scanner:', err);
      }
      setScanning(false);
    }
  };

  const handleScanSuccess = async (decodedText) => {
    // Prevent multiple scans - CRITICAL FIX
    if (isProcessingRef.current || hasSuccessRef.current) {
      console.log('⏸️ [QR] Already processed, ignoring duplicate scan');
      return;
    }

    // Double check modal is still open
    if (!isOpen) {
      console.log('🚫 [QR] Modal closed, ignoring scan');
      return;
    }

    isProcessingRef.current = true;
    hasSuccessRef.current = true; // Mark as succeeded
    console.log('🔒 [QR] Processing scan started');

    try {
      // Stop scanner immediately to prevent continuous scanning
      await stopScanner();
      console.log('⏹️ [QR] Scanner stopped');

      // Decode base64 QR data
      const decoded = atob(decodedText);
      const parts = decoded.split('|');

      // Validate QR format: EV_CHARGING|DRIVER|{driverId}|{timestamp}
      if (parts.length !== 4 || parts[0] !== 'EV_CHARGING' || parts[1] !== 'DRIVER') {
        setError('Mã QR không hợp lệ. Vui lòng quét mã QR của driver.');
        isProcessingRef.current = false;
        return;
      }

      const scannedDriverId = parseInt(parts[2]);
      const timestamp = parseInt(parts[3]);

      // Check if QR is expired (24 hours)
      const now = Math.floor(Date.now() / 1000);
      if (now - timestamp > 86400) {
        setError('Mã QR đã hết hạn. Vui lòng tạo mã QR mới.');
        isProcessingRef.current = false;
        return;
      }

      // Verify driver ID if provided
      if (expectedDriverId && scannedDriverId !== expectedDriverId) {
        setError(`Mã QR không khớp với tài khoản hiện tại (Driver ID: ${scannedDriverId})`);
        isProcessingRef.current = false;
        return;
      }

      // Success
      console.log('✅ [QR] Verification successful');
      setScanResult({
        driverId: scannedDriverId,
        timestamp,
        verified: true,
      });

      // Call success callback immediately and close
      onScanSuccess({
        driverId: scannedDriverId,
        qrCode: decodedText,
        timestamp,
      });
      
      // Close modal after short delay to show success state
      setTimeout(() => {
        handleClose();
      }, 800);

    } catch (err) {
      console.error('Error parsing QR code:', err);
      setError('Không thể đọc mã QR. Vui lòng thử lại.');
      isProcessingRef.current = false;
    }
  };

  const handleScanError = (errorMessage) => {
    // Ignore common scanning errors (camera adjusting, no QR in view, etc.)
    // Only log critical errors
    if (errorMessage.includes('NotFoundException') === false) {
      console.warn('Scan error:', errorMessage);
    }
  };

  const handleClose = () => {
    stopScanner();
    setScanResult(null);
    setError(null);
    isProcessingRef.current = false; // Reset flag when closing
    onClose();
  };

  return (
    <Modal
      title={
        <div className="flex items-center space-x-2">
          <Camera className="w-5 h-5" />
          <span>Quét mã QR Driver</span>
        </div>
      }
      open={isOpen}
      onCancel={handleClose}
      footer={null}
      width={500}
      centered
    >
      <div className="space-y-4">
        {/* Instructions */}
        <Alert
          message="Hướng dẫn"
          description="Đưa mã QR của driver vào khung hình để quét"
          type="info"
          showIcon
        />

        {/* Scanner Container */}
        <div className="relative">
          {scanning && !scanResult && (
            <div 
              id="qr-reader" 
              ref={scannerRef}
              className="w-full rounded-lg overflow-hidden border-2 border-gray-300"
            />
          )}

          {/* Loading State */}
          {!scanning && !scanResult && !error && (
            <div className="flex justify-center items-center h-64 bg-gray-100 rounded-lg">
              <Spin size="large" tip="Đang khởi động camera..." />
            </div>
          )}

          {/* Success State */}
          {scanResult && (
            <div className="flex flex-col items-center justify-center h-64 bg-green-50 rounded-lg border-2 border-green-300">
              <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
              <p className="text-lg font-semibold text-green-700">Xác thực thành công!</p>
              <p className="text-sm text-gray-600 mt-2">Driver ID: {scanResult.driverId}</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="mt-4 p-4 bg-red-50 border-2 border-red-200 rounded-lg">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-semibold text-red-800 mb-2">Lỗi quét QR</h3>
                  <div className="text-red-700">
                    {typeof error === 'string' ? <p>{error}</p> : error}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-2 pt-4 border-t">
          <Button onClick={handleClose}>
            Đóng
          </Button>
          {error && !scanning && (
            <Button type="primary" onClick={startScanner}>
              Thử lại
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default QRScanner;

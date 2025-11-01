import React, { useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Download, QrCode } from 'lucide-react';
import { Button, message, Card } from 'antd';

/**
 * Component hiển thị QR code của driver để xác thực khi sạc
 * QR code chứa format: EV_CHARGING|DRIVER|{driverId}|{timestamp}
 */
const DriverQRCode = ({ driverId, driverName, size = 200, showDownload = true }) => {
  const qrRef = useRef(null);

  // Generate QR data theo format giống BE
  const generateQRData = () => {
    const timestamp = Math.floor(Date.now() / 1000);
    const qrData = `EV_CHARGING|DRIVER|${driverId}|${timestamp}`;
    
    // Encode base64 để match với BE format
    return btoa(qrData);
  };

  const qrValue = generateQRData();

  // Download QR code as image
  const handleDownload = () => {
    try {
      const svg = qrRef.current.querySelector('svg');
      const svgData = new XMLSerializer().serializeToString(svg);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      canvas.width = size;
      canvas.height = size;

      img.onload = () => {
        ctx.drawImage(img, 0, 0);
        const pngFile = canvas.toDataURL('image/png');

        const downloadLink = document.createElement('a');
        downloadLink.download = `driver-qr-${driverId}.png`;
        downloadLink.href = pngFile;
        downloadLink.click();

        message.success('QR Code đã được tải xuống!');
      };

      img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
    } catch (error) {
      console.error('Error downloading QR code:', error);
      message.error('Không thể tải xuống QR code!');
    }
  };

  return (
    <Card className="driver-qr-code-card">
      <div className="flex flex-col items-center space-y-4">
        {/* Header */}
        <div className="flex items-center space-x-2 text-gray-700">
          <QrCode className="w-5 h-5" />
          <h3 className="text-lg font-semibold">Mã QR của tôi</h3>
        </div>

        {/* QR Code */}
        <div 
          ref={qrRef}
          className="p-4 bg-white rounded-lg border-2 border-gray-200 shadow-sm"
        >
          <QRCodeSVG
            value={qrValue}
            size={size}
            level="H"
            includeMargin={true}
            imageSettings={{
              src: '/logo.png', // Optional: Add logo in center
              x: undefined,
              y: undefined,
              height: 24,
              width: 24,
              excavate: true,
            }}
          />
        </div>

        {/* Driver Info */}
        <div className="text-center">
          <p className="text-sm font-medium text-gray-900">{driverName}</p>
          <p className="text-xs text-gray-500">Driver ID: {driverId}</p>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 max-w-md">
          <p className="text-xs text-blue-900 text-center">
            Quét mã QR này để xác thực trước khi bắt đầu sạc xe
          </p>
        </div>

        {/* Download Button */}
        {showDownload && (
          <Button
            type="primary"
            icon={<Download className="w-4 h-4" />}
            onClick={handleDownload}
            className="w-full max-w-xs"
          >
            Tải xuống QR Code
          </Button>
        )}
      </div>
    </Card>
  );
};

export default DriverQRCode;

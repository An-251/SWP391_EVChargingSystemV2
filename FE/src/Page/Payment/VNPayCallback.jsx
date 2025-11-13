import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Result, Spin, Button } from 'antd';
import { CheckCircleOutlined, LoadingOutlined } from '@ant-design/icons';
import axiosInstance from '../../configs/config-axios';

const VNPayCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [processing, setProcessing] = useState(true);
  // State `success` không còn thực sự cần thiết cho UI,
  // nhưng chúng ta giữ lại để logic dễ đọc hơn
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const processVNPayCallback = async () => {
      try {
        const responseCode = searchParams.get('vnp_ResponseCode');
        const txnRef = searchParams.get('vnp_TxnRef');

        console.log('💳 [VNPAY CALLBACK] Processing...', { responseCode, txnRef });

        // Convert searchParams to object for API call
        const callbackParams = {};
        searchParams.forEach((value, key) => {
          callbackParams[key] = value;
        });

        // ⭐ CRITICAL: Call backend to process payment and update database
        const response = await axiosInstance.get('/vnpay/callback', {
          params: callbackParams,
        });

        console.log('✅ [BACKEND RESPONSE]', response.data);

        // Check success: vnp_ResponseCode=00 AND backend returns success
        const isSuccess =
          responseCode === '00' &&
          (response.data.status === 'success' || response.data?.data?.status === 'success');

        if (isSuccess) {
          // --- CHỈ XỬ LÝ TRƯỜNG HỢP THÀNH CÔNG ---
          setSuccess(true);
          setMessage('Thanh toán thành công! Gói đăng ký của bạn đã được kích hoạt.');
          setProcessing(false); // Dừng loading để hiển thị UI thành công

          // Auto redirect after 3 seconds
          setTimeout(() => {
            navigate('/driver', { replace: true });
          }, 3000);
        } else {
          // --- TRƯỜNG HỢP THẤT BẠI: Điều hướng ngay lập tức ---
          const errorMsg =
            response.data.message ||
            response.data?.data?.message ||
            'Đã xảy ra lỗi trong quá trình thanh toán.';
          console.warn('💳 [VNPAY FAILURE]', errorMsg);
          navigate('/driver', { replace: true });
        }
      } catch (error) {
        // --- TRƯỜNG HỢP LỖI: Điều hướng ngay lập tức ---
        console.error('❌ [VNPAY CALLBACK ERROR]', error);
        console.error('❌ [ERROR DETAILS]', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
        });
        // Không setProcessing(false), chỉ điều hướng đi
        navigate('/driver', { replace: true });
      }
    };

    processVNPayCallback();
  }, [searchParams, navigate]);

  // Giao diện Loading vẫn được giữ nguyên
  if (processing) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        }}
      >
        <div
          style={{
            background: 'white',
            padding: '60px 80px',
            borderRadius: '20px',
            textAlign: 'center',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
            minWidth: '400px',
          }}
        >
          <Spin
            indicator={<LoadingOutlined style={{ fontSize: 48, color: '#667eea' }} spin />}
            size="large"
          />
          <p style={{ marginTop: '24px', fontSize: '18px', color: '#666', fontWeight: '500' }}>
            Đang xử lý thanh toán...
          </p>
          <p style={{ marginTop: '8px', fontSize: '14px', color: '#999' }}>
            Vui lòng không tắt trang này
          </p>
        </div>
      </div>
    );
  }

  // --- GIAO DIỆN KHI KHÔNG CÒN PROCESSING ---
  // Do logic ở trên, component này sẽ CHỈ hiển thị khi thành công
  // (vì trường hợp lỗi/thất bại đã bị điều hướng đi)
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        // Hardcode màu nền thành công
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      }}
    >
      <div
        style={{
          background: 'white',
          padding: '60px 80px',
          borderRadius: '20px',
          maxWidth: '650px',
          width: '100%',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        }}
      >
        <Result
          // Hardcode status và icon thành công
          status={'success'}
          icon={<CheckCircleOutlined style={{ color: '#52c41a', fontSize: '80px' }} />}
          title={
            <span style={{ fontSize: '28px', fontWeight: 'bold' }}>
              🎉 Thanh toán thành công!
            </span>
          }
          subTitle={
            <div style={{ fontSize: '16px', lineHeight: '1.6', marginTop: '16px' }}>
              {message}
              <br />
              <span style={{ color: '#999', fontSize: '14px', marginTop: '8px', display: 'block' }}>
                Bạn sẽ được chuyển hướng trong giây lát...
              </span>
            </div>
          }
          extra={
            <Button
              type="primary"
              size="large"
              onClick={() => {
                navigate('/driver', { replace: true });
              }}
              style={{
                height: '48px',
                fontSize: '16px',
                fontWeight: '600',
                borderRadius: '12px',
                minWidth: '200px',
                // Hardcode màu nút thành công
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: 'none',
              }}
            >
              Về trang chính
            </Button>
          }
        />
      </div>
    </div>
  );
};

export default VNPayCallback;
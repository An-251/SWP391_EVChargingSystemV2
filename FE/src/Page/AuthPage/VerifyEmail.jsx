import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Card, message, Steps } from 'antd';
import { MailOutlined, SafetyCertificateOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../../configs/config-axios';

const { Step } = Steps;

const VerifyEmail = () => {
  const [loading, setLoading] = useState(false);
  const [verified, setVerified] = useState(false);
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get email from sessionStorage or navigation state
  const email = sessionStorage.getItem('verifyEmail') || location.state?.email || '';
  console.log('🔍 VerifyEmail - Email value:', email);
  console.log('🔍 VerifyEmail - sessionStorage value:', sessionStorage.getItem('verifyEmail'));
  console.log('🔍 VerifyEmail - location.state:', location.state);
  
  useEffect(() => {
    if (!email) {
      message.warning('Vui lòng đăng ký trước khi xác thực email');
      // Redirect to login page with signup tab active
      navigate('/auth/login', { state: 'signup', replace: true });
    }
    
    // Cleanup: Remove email from sessionStorage when component unmounts
    return () => {
      // Only clear if user navigated away without verifying
      if (!verified) {
        sessionStorage.removeItem('verifyEmail');
      }
    };
  }, [email, navigate, verified]);

  // Handle verify email
  const handleVerify = async (values) => {
    try {
      setLoading(true);
      
      const response = await api.post('/auth/verify-email', {
        email: email,
        verificationCode: values.code
      });
      
      if (response.data.success) {
        message.success('Xác thực email thành công!');
        setVerified(true);
        
        // Clear email from sessionStorage
        sessionStorage.removeItem('verifyEmail');
        
        // Redirect to login after 2 seconds
        setTimeout(() => {
          navigate('/auth/login', { replace: true });
        }, 2000);
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Mã xác thực không hợp lệ';
      message.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Handle resend code
  const handleResend = async () => {
    try {
      setLoading(true);
      
      const response = await api.post('/auth/resend-verification', {
        email: email
      });
      
      if (response.data.success) {
        message.success('Mã xác thực mới đã được gửi đến email của bạn!');
        form.resetFields();
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Không thể gửi lại mã xác thực';
      message.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  if (verified) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-xl rounded-2xl text-center">
          <CheckCircleOutlined className="text-6xl text-green-500 mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Email đã được xác thực!
          </h2>
          <p className="text-gray-600 mb-4">
            Tài khoản của bạn đã được kích hoạt thành công.
          </p>
          <p className="text-sm text-gray-500">
            Đang chuyển đến trang đăng nhập...
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <Card className="shadow-xl rounded-2xl">
          <div className="text-center mb-6">
            <MailOutlined className="text-5xl text-blue-600 mb-4" />
            <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
              Xác thực Email
            </h2>
            <p className="text-gray-500 mt-2">
              Chúng tôi đã gửi mã xác thực 6 số đến email của bạn
            </p>
          </div>

          <Steps current={1} className="mb-8 px-4">
            <Step title="Đăng ký" icon={<CheckCircleOutlined />} />
            <Step title="Xác thực Email" icon={<SafetyCertificateOutlined />} />
            <Step title="Hoàn thành" />
          </Steps>

          <div className="bg-blue-50 rounded-lg p-4 mb-6 text-center">
            <p className="text-gray-700">
              Email được gửi đến:
            </p>
            <p className="font-semibold text-blue-600 text-lg">{email}</p>
          </div>

          <Form 
            form={form}
            onFinish={handleVerify} 
            layout="vertical"
            className="px-4"
          >
            <Form.Item
              name="code"
              label={<span className="text-gray-700 font-medium">Mã xác thực (6 số)</span>}
              rules={[
                { required: true, message: 'Vui lòng nhập mã xác thực!' },
                { len: 6, message: 'Mã xác thực phải có đúng 6 số!' },
                { pattern: /^\d+$/, message: 'Mã xác thực chỉ bao gồm các chữ số!' }
              ]}
            >
              <Input 
                prefix={<SafetyCertificateOutlined className="text-gray-400" />} 
                placeholder="123456"
                maxLength={6}
                size="large"
                className="rounded-lg text-center text-2xl tracking-widest"
                autoFocus
              />
            </Form.Item>

            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 rounded">
              <p className="text-yellow-800 text-sm">
                <strong>⚠️ Lưu ý:</strong> Mã xác thực có hiệu lực trong 15 phút. 
                Nếu không nhận được email, hãy kiểm tra thư mục spam.
              </p>
            </div>

            <Button 
              type="primary" 
              htmlType="submit" 
              loading={loading}
              disabled={loading}
              block
              size="large"
              className="rounded-lg h-12 font-semibold mb-4"
            >
              Xác thực Email
            </Button>

            <div className="text-center">
              <Button 
                type="link" 
                onClick={handleResend}
                disabled={loading}
                className="text-blue-500"
              >
                Không nhận được email? Gửi lại mã
              </Button>
            </div>
          </Form>

          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 text-center">
              <strong>Hướng dẫn:</strong>
            </p>
            <ol className="text-sm text-gray-600 mt-2 space-y-1 pl-4">
              <li>1. Kiểm tra email (và thư mục spam)</li>
              <li>2. Copy mã xác thực 6 số</li>
              <li>3. Dán vào ô bên trên và nhấn "Xác thực Email"</li>
              <li>4. Sau khi xác thực, bạn có thể đăng nhập</li>
            </ol>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default VerifyEmail;

import React, { useState } from 'react';
import { Form, Input, Button, Steps, message, Card } from 'antd';
import { MailOutlined, LockOutlined, SafetyCertificateOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import api from '../../configs/config-axios';

const { Step } = Steps;

const ForgotPassword = () => {
  const [current, setCurrent] = useState(0);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const navigate = useNavigate();

  // Step 1: Send OTP
  const handleSendOTP = async (values) => {
    try {
      setLoading(true);
      setEmail(values.email);
      
      const response = await api.post('/auth/forgot-password', {
        email: values.email
      });
      
      if (response.data.success) {
        message.success('OTP đã được gửi đến email của bạn! Vui lòng kiểm tra hộp thư.');
        setCurrent(1);
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Không thể gửi OTP. Vui lòng kiểm tra email.';
      message.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOTP = async (values) => {
    try {
      setLoading(true);
      setOtp(values.otp);
      
      const response = await api.post('/auth/verify-otp', {
        email: email,
        otp: values.otp
      });
      
      if (response.data.success) {
        message.success('OTP xác thực thành công!');
        setCurrent(2);
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'OTP không hợp lệ hoặc đã hết hạn';
      message.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Reset Password
  const handleResetPassword = async (values) => {
    try {
      setLoading(true);
      
      const response = await api.post('/auth/reset-password', {
        email: email,
        otp: otp,
        newPassword: values.newPassword
      });
      
      if (response.data.success) {
        message.success('Đặt lại mật khẩu thành công! Đang chuyển đến trang đăng nhập...');
        setTimeout(() => {
          navigate('/auth/login');
        }, 1500);
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Không thể đặt lại mật khẩu';
      message.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    try {
      setLoading(true);
      const response = await api.post('/auth/forgot-password', { email });
      
      if (response.data.success) {
        message.success('OTP mới đã được gửi đến email của bạn!');
      }
    } catch (error) {
      message.error('Không thể gửi lại OTP');
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    {
      title: 'Nhập Email',
      icon: <MailOutlined />,
      content: (
        <Form form={form} onFinish={handleSendOTP} layout="vertical" className="mt-8">
          <Form.Item
            name="email"
            label={<span className="text-gray-700 font-medium">Email đã đăng ký</span>}
            rules={[
              { required: true, message: 'Vui lòng nhập email!' },
              { type: 'email', message: 'Email không hợp lệ!' }
            ]}
          >
            <Input 
              prefix={<MailOutlined className="text-gray-400" />} 
              placeholder="your-email@example.com"
              size="large"
              className="rounded-lg"
            />
          </Form.Item>
          
          <Button 
            type="primary" 
            htmlType="submit" 
            loading={loading}
            block
            size="large"
            className="rounded-lg h-12 font-semibold"
          >
            Gửi mã OTP
          </Button>
        </Form>
      )
    },
    {
      title: 'Xác thực OTP',
      icon: <SafetyCertificateOutlined />,
      content: (
        <Form form={form} onFinish={handleVerifyOTP} layout="vertical" className="mt-8">
          <div className="text-center mb-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-gray-700">
              Mã OTP đã được gửi đến email
            </p>
            <p className="font-semibold text-blue-600 mt-1">{email}</p>
          </div>
          
          <Form.Item
            name="otp"
            label={<span className="text-gray-700 font-medium">Mã OTP (6 số)</span>}
            rules={[
              { required: true, message: 'Vui lòng nhập OTP!' },
              { len: 6, message: 'OTP phải có đúng 6 số!' },
              { pattern: /^\d+$/, message: 'OTP chỉ bao gồm các chữ số!' }
            ]}
          >
            <Input 
              prefix={<SafetyCertificateOutlined className="text-gray-400" />} 
              placeholder="123456"
              maxLength={6}
              size="large"
              className="rounded-lg text-center text-2xl tracking-widest"
            />
          </Form.Item>
          
          <Button 
            type="primary" 
            htmlType="submit" 
            loading={loading}
            block
            size="large"
            className="rounded-lg h-12 font-semibold"
          >
            Xác thực OTP
          </Button>
          
          <div className="text-center mt-4">
            <Button 
              type="link" 
              onClick={handleResendOTP}
              disabled={loading}
              className="text-blue-500"
            >
              Không nhận được OTP? Gửi lại
            </Button>
          </div>
        </Form>
      )
    },
    {
      title: 'Đặt lại mật khẩu',
      icon: <LockOutlined />,
      content: (
        <Form form={form} onFinish={handleResetPassword} layout="vertical" className="mt-8">
          <div className="mb-6 p-4 bg-green-50 rounded-lg text-center">
            <p className="text-green-700">
              ✓ OTP đã được xác thực thành công
            </p>
          </div>
          
          <Form.Item
            name="newPassword"
            label={<span className="text-gray-700 font-medium">Mật khẩu mới</span>}
            rules={[
              { required: true, message: 'Vui lòng nhập mật khẩu mới!' },
              { min: 8, message: 'Mật khẩu phải có ít nhất 8 ký tự!' },
              { 
                pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 
                message: 'Mật khẩu phải chứa chữ hoa, chữ thường và số!' 
              }
            ]}
            hasFeedback
          >
            <Input.Password 
              prefix={<LockOutlined className="text-gray-400" />} 
              placeholder="Nhập mật khẩu mới"
              size="large"
              className="rounded-lg"
            />
          </Form.Item>
          
          <Form.Item
            name="confirmPassword"
            label={<span className="text-gray-700 font-medium">Xác nhận mật khẩu</span>}
            dependencies={['newPassword']}
            hasFeedback
            rules={[
              { required: true, message: 'Vui lòng xác nhận mật khẩu!' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('newPassword') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'));
                },
              }),
            ]}
          >
            <Input.Password 
              prefix={<LockOutlined className="text-gray-400" />} 
              placeholder="Nhập lại mật khẩu mới"
              size="large"
              className="rounded-lg"
            />
          </Form.Item>
          
          <Button 
            type="primary" 
            htmlType="submit" 
            loading={loading}
            block
            size="large"
            className="rounded-lg h-12 font-semibold"
          >
            Đặt lại mật khẩu
          </Button>
        </Form>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <Button 
          icon={<ArrowLeftOutlined />}
          onClick={() => current === 0 ? navigate('/auth/login') : setCurrent(current - 1)}
          className="mb-4"
          type="text"
        >
          {current === 0 ? 'Quay lại đăng nhập' : 'Quay lại'}
        </Button>
        
        <Card className="shadow-xl rounded-2xl">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
              Quên mật khẩu
            </h2>
            <p className="text-gray-500 mt-2">
              Làm theo các bước để khôi phục mật khẩu của bạn
            </p>
          </div>
          
          <Steps current={current} className="mb-8 px-4">
            {steps.map((item, index) => (
              <Step 
                key={item.title} 
                title={<span className="text-sm">{item.title}</span>}
                icon={item.icon}
              />
            ))}
          </Steps>
          
          <div className="steps-content px-4">
            {steps[current].content}
          </div>
        </Card>
        
        <div className="text-center mt-4 text-gray-500 text-sm">
          <p>Cần hỗ trợ? Liên hệ: support@evcharging.com</p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;

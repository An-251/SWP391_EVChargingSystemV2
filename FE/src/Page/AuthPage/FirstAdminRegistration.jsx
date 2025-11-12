import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Input, Button, Card, Typography, message, Space, Alert } from 'antd';
import { UserAddOutlined, LockOutlined, MailOutlined, UserOutlined } from '@ant-design/icons';
import axios from 'axios';
import { motion } from 'framer-motion';

const { Title, Text } = Typography;

const FirstAdminRegistration = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [adminExists, setAdminExists] = useState(false);
  const navigate = useNavigate();

  // Check if admin already exists
  useEffect(() => {
    checkAdminExists();
  }, []);

  const checkAdminExists = async () => {
    try {
      setChecking(true);
      const response = await axios.get('http://localhost:8080/api/auth/has-admin');
      
      if (response.data.success && response.data.data === true) {
        setAdminExists(true);
        message.info('Admin account already exists. Redirecting to login...');
        setTimeout(() => {
          navigate('/auth/login');
        }, 2000);
      }
    } catch (error) {
      console.error('Error checking admin:', error);
      message.error('Failed to check admin status');
    } finally {
      setChecking(false);
    }
  };

  const onFinish = async (values) => {
    try {
      setLoading(true);

      // Call first admin registration API
      const response = await axios.post('http://localhost:8080/api/auth/register-first-admin', {
        username: values.username,
        email: values.email,
        password: values.password
      });

      if (response.data.success) {
        message.success('First admin account created successfully!');
        message.info('Redirecting to login page...');
        
        // Redirect to login after 2 seconds
        setTimeout(() => {
          navigate('/auth/login');
        }, 2000);
      }
    } catch (error) {
      console.error('Registration error:', error);
      
      if (error.response?.data?.message) {
        message.error(error.response.data.message);
      } else if (error.response?.status === 403) {
        message.error('Admin already exists. Please login instead.');
        setTimeout(() => navigate('/auth/login'), 1500);
      } else {
        message.error('Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const validatePassword = (_, value) => {
    if (!value) {
      return Promise.reject(new Error('Please input your password!'));
    }
    if (value.length < 6) {
      return Promise.reject(new Error('Password must be at least 6 characters!'));
    }
    if (value.length > 40) {
      return Promise.reject(new Error('Password must not exceed 40 characters!'));
    }
    return Promise.resolve();
  };

  const validateConfirmPassword = (_, value) => {
    if (!value) {
      return Promise.reject(new Error('Please confirm your password!'));
    }
    if (value !== form.getFieldValue('password')) {
      return Promise.reject(new Error('Passwords do not match!'));
    }
    return Promise.resolve();
  };

  if (checking) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <Card loading={true} style={{ width: 400 }}>
          <Title level={4}>Checking system status...</Title>
        </Card>
      </div>
    );
  }

  if (adminExists) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <Card style={{ width: 400, textAlign: 'center' }}>
          <Alert
            message="Admin Already Exists"
            description="An admin account has already been created. Redirecting to login..."
            type="info"
            showIcon
          />
        </Card>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px'
    }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Card 
          style={{ 
            width: '100%', 
            maxWidth: 500,
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
            borderRadius: '16px'
          }}
        >
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            {/* Header */}
            <div style={{ textAlign: 'center' }}>
              <UserAddOutlined style={{ fontSize: 64, color: '#667eea', marginBottom: 16 }} />
              <Title level={2} style={{ margin: 0, color: '#667eea' }}>
                First Admin Setup
              </Title>
              <Text type="secondary" style={{ fontSize: 16 }}>
                Create the first administrator account for your EV Charging System
              </Text>
            </div>

            {/* Alert */}
            <Alert
              message="Important"
              description="This account will have full administrative privileges. Please use a strong password and keep your credentials secure."
              type="warning"
              showIcon
            />

            {/* Registration Form */}
            <Form
              form={form}
              name="first_admin_registration"
              onFinish={onFinish}
              layout="vertical"
              size="large"
              autoComplete="off"
            >
              {/* Username */}
              <Form.Item
                name="username"
                label="Username"
                rules={[
                  { required: true, message: 'Please input username!' },
                  { min: 3, message: 'Username must be at least 3 characters!' },
                  { max: 20, message: 'Username must not exceed 20 characters!' },
                  { pattern: /^[a-zA-Z0-9_]+$/, message: 'Username can only contain letters, numbers, and underscores!' }
                ]}
              >
                <Input 
                  prefix={<UserOutlined style={{ color: '#667eea' }} />}
                  placeholder="Enter username (3-20 characters)"
                  autoComplete="off"
                />
              </Form.Item>

              {/* Email */}
              <Form.Item
                name="email"
                label="Email"
                rules={[
                  { required: true, message: 'Please input email!' },
                  { type: 'email', message: 'Please enter a valid email!' },
                  { max: 50, message: 'Email must not exceed 50 characters!' }
                ]}
              >
                <Input 
                  prefix={<MailOutlined style={{ color: '#667eea' }} />}
                  placeholder="admin@evcharging.com"
                  type="email"
                  autoComplete="off"
                />
              </Form.Item>

              {/* Password */}
              <Form.Item
                name="password"
                label="Password"
                rules={[
                  { validator: validatePassword }
                ]}
                hasFeedback
              >
                <Input.Password
                  prefix={<LockOutlined style={{ color: '#667eea' }} />}
                  placeholder="Enter password (6-40 characters)"
                  autoComplete="new-password"
                />
              </Form.Item>

              {/* Confirm Password */}
              <Form.Item
                name="confirmPassword"
                label="Confirm Password"
                dependencies={['password']}
                rules={[
                  { validator: validateConfirmPassword }
                ]}
                hasFeedback
              >
                <Input.Password
                  prefix={<LockOutlined style={{ color: '#667eea' }} />}
                  placeholder="Re-enter password"
                  autoComplete="new-password"
                />
              </Form.Item>

              {/* Submit Button */}
              <Form.Item style={{ marginTop: 24, marginBottom: 0 }}>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  block
                  size="large"
                  style={{
                    height: 50,
                    fontSize: 18,
                    fontWeight: 600,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    border: 'none',
                    borderRadius: 8
                  }}
                  icon={<UserAddOutlined />}
                >
                  {loading ? 'Creating Admin Account...' : 'Create Admin Account'}
                </Button>
              </Form.Item>
            </Form>

            {/* Footer */}
            <div style={{ textAlign: 'center', marginTop: 16 }}>
              <Text type="secondary" style={{ fontSize: 14 }}>
                Already have an admin account?{' '}
                <a 
                  onClick={() => navigate('/auth/login')}
                  style={{ color: '#667eea', fontWeight: 600, cursor: 'pointer' }}
                >
                  Login here
                </a>
              </Text>
            </div>

            {/* Database Info */}
            <Alert
              message="Post-Setup Instructions"
              description={
                <div>
                  <p style={{ margin: '8px 0' }}>After creating the admin account:</p>
                  <ol style={{ marginLeft: 20, marginBottom: 0 }}>
                    <li>Login with your credentials</li>
                    <li>Run the SQL restore script to populate database</li>
                    <li>Verify subscription plans and charging stations</li>
                  </ol>
                </div>
              }
              type="info"
              showIcon
            />
          </Space>
        </Card>
      </motion.div>
    </div>
  );
};

export default FirstAdminRegistration;

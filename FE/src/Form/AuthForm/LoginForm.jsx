/* eslint-disable react/prop-types */
import { Form, Input, Button, Checkbox, message, Divider, Modal } from "antd";
import { useForm } from "antd/es/form/Form";
import { User, Lock, Building2 } from "lucide-react";
import { GoogleOutlined } from "@ant-design/icons";
import { loginUser } from "../../redux/auth/authSlice";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../../configs/firebase";
import api from "../../configs/config-axios";

export default function LoginForm() {
  const [loginForm] = useForm(); // ✅ destructure
  const dispatch = useDispatch(); // Sử dụng useDispatch để dispatch action
  const navigate = useNavigate();
  const [socialLoading, setSocialLoading] = useState(false);
  
  // Get auth state từ Redux
  const { isAuthenticated, loading, error, user } = useSelector((state) => state.auth);
  
  const onLoginFinish = async (values) => {
    console.log("🔑 [FORM] Login form values:", values);
    console.log("🔑 [FORM] Form validation passed, dispatching loginUser...");
    dispatch(loginUser(values)); // Dispatch action login với values từ form
  };

  // Handle Google Login
  const handleGoogleLogin = async () => {
    try {
      setSocialLoading(true);
      console.log("🔵 Starting Google login...");
      
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      console.log("✅ Google authentication successful:", user.email);
      
      // Get Firebase ID token
      const idToken = await user.getIdToken();
      
      // Send to backend for verification and account creation/login
      const response = await api.post('/auth/social-login', {
        provider: 'GOOGLE',
        idToken: idToken,
        email: user.email,
        fullName: user.displayName,
        photoURL: user.photoURL
      });
      
      if (response.data.success) {
        const { token, account } = response.data.data;
        console.log("✅ Backend response - account:", account);
        message.success(`Chào mừng ${user.displayName}!`);
        
        // Store token and user info (cùng format với regular login)
        localStorage.setItem('accessToken', token);
        localStorage.setItem('currentUser', JSON.stringify(account));
        
        // Navigate based on role
        const userRole = account.role?.toUpperCase();
        console.log("✅ User role:", userRole);
        
        // Force navigation with window.location for immediate effect
        switch(userRole) {
          case "DRIVER":
            window.location.href = "/driver";
            break;
          case "ADMIN":
            window.location.href = "/admin";
            break;
          case "STAFF":
          case "STATIONEMPLOYEE":
          case "STATION_EMPLOYEE":
            window.location.href = "/employee/monitor";
            break;
          default:
            window.location.href = "/driver";
        }
      }
    } catch (error) {
      console.error("❌ Google login error:", error);
      
      if (error.code === 'auth/popup-closed-by-user') {
        message.warning('Đăng nhập bị hủy');
      } else if (error.code === 'auth/popup-blocked') {
        message.error('Popup bị chặn. Vui lòng cho phép popup và thử lại.');
      } else {
        message.error(error.response?.data?.message || 'Đăng nhập Google thất bại');
      }
    } finally {
      setSocialLoading(false);
    }
  };



  // Effect để handle navigation sau khi login thành công (chỉ cho regular login, không cho social login)
  useEffect(() => {
    if (isAuthenticated && user && !socialLoading) {
      console.log("✅ Login successful, user role:", user.role);
      
      // Navigation based on user role (support both formats)
      const roleUpper = user.role?.toUpperCase();
      
      switch(roleUpper) {
        case "STAFF":
        case "STATIONEMPLOYEE":
        case "STATION_EMPLOYEE":
          navigate("/employee/monitor");
          break;
        case "ADMIN":
          navigate("/admin");
          break;
        case "DRIVER":
          navigate("/driver");
          break;
        default:
          console.warn("Unknown role:", user.role, "redirecting to driver page");
          navigate("/driver");
      }
    }
  }, [isAuthenticated, user, navigate, socialLoading]);

  // Effect để handle error messages
  useEffect(() => {
    if (error) {
      console.error("❌ Login error:", error);
      message.error(error);
    }
  }, [error]);

  return (
    <Form
      form={loginForm} // ✅ đúng chỗ
      name="loginForm"
      layout="vertical"
      onFinish={onLoginFinish}
      onFinishFailed={(error) => {
        console.log("❌ Validation Failed:", error);
      }}
      autoComplete="off"
      className="modern-form"
    >
      <Form.Item
        label={
          <span className="flex items-center gap-2 text-slate-300">
            <User size={16} />
            Username
          </span>
        }
        name="username"
        rules={[
          { required: true, message: "Please input your username!" },
        ]}
      >
        <Input
          placeholder="Enter your username (e.g. Huy12345)"
          size="large"
          className="modern-input"
        />
      </Form.Item>

      <Form.Item
        label={
          <span className="flex items-center gap-2 text-slate-300">
            <Lock size={16} />
            Password
          </span>
        }
        name="password"
        rules={[{ required: true, message: "Please input your password!" }]}
      >
        <Input.Password
          placeholder="••••••••"
          size="large"
          className="modern-input"
        />
      </Form.Item>

      <Form.Item name="remember" valuePropName="checked" initialValue={false}>
        <Checkbox className="modern-checkbox">
          <span className="text-slate-400">Remember me</span>
        </Checkbox>
      </Form.Item>

      <Form.Item>
        <Button
          type="primary"
          htmlType="submit"
          size="large"
          className="modern-button w-full"
          loading={loading}
          disabled={loading}
        >
          {loading ? "Đang đăng nhập..." : "Login to Dashboard"}
        </Button>
      </Form.Item>

      <div className="text-center">
        {/* ✅ Backend endpoints now available! */}
        <a
          href="/forgot-password"
          className="text-sm text-emerald-400 hover:text-emerald-300 transition-colors"
        >
          Forgot your password?
        </a>
      </div>

      <Divider className="my-6">
        <span className="text-slate-400 text-sm">Or continue with</span>
      </Divider>

      <Button
        icon={<GoogleOutlined />}
        size="large"
        onClick={handleGoogleLogin}
        loading={socialLoading}
        disabled={loading || socialLoading}
        className="w-full flex items-center justify-center gap-2 bg-white hover:bg-gray-50 border border-gray-300 text-gray-700"
      >
        Continue with Google
      </Button>
    </Form>
  );
}

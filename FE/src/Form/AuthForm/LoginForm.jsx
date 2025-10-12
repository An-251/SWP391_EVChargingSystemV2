/* eslint-disable react/prop-types */
import { Form, Input, Button, Checkbox, message } from "antd";
import { useForm } from "antd/es/form/Form";
import { User, Lock } from "lucide-react";
import { loginUser } from "../../redux/auth/authSlice";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

export default function LoginForm() {
  const [loginForm] = useForm(); // ✅ destructure
  const dispatch = useDispatch(); // Sử dụng useDispatch để dispatch action
  const navigate = useNavigate();
  
  // Get auth state từ Redux
  const { isAuthenticated, loading, error, user } = useSelector((state) => state.auth);
  
  const onLoginFinish = async (values) => {
    console.log("🔑 [FORM] Login form values:", values);
    console.log("🔑 [FORM] Form validation passed, dispatching loginUser...");
    dispatch(loginUser(values)); // Dispatch action login với values từ form
  };

  // Effect để handle navigation sau khi login thành công
  useEffect(() => {
    if (isAuthenticated && user) {
      console.log("✅ Login successful, user role:", user.role);
      message.success("Đăng nhập thành công!");
      
      // Navigation based on user role
      switch(user.role) {
        case "Staff":
        case "StationEmployee":
          navigate("/staff/dashboard");
          break;
        case "Admin":
          navigate("/admin/dashboard");
          break;
        case "Driver":
          navigate("/driver");
          break;
        case "Enterprise":
          navigate("/enterprise/dashboard");
          break;
        default:
          console.warn("Unknown role:", user.role, "redirecting to staff dashboard");
          navigate("/staff/dashboard");
      }
    }
  }, [isAuthenticated, user, navigate]);

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
        <a
          href="#"
          className="text-sm text-emerald-400 hover:text-emerald-300 transition-colors"
        >
          Forgot your password?
        </a>
      </div>
    </Form>
  );
}

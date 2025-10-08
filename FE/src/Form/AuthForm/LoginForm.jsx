/* eslint-disable react/prop-types */
import { Form, Input, Button, Checkbox } from "antd";
import { useForm } from "antd/es/form/Form";
import { Mail, Lock } from "lucide-react";
import { loginUser } from "../../redux/auth/authSlice";
import { useDispatch } from "react-redux";

export default function LoginForm() {
  const [loginForm] = useForm(); // ✅ destructure
  const dispatch = useDispatch(); // Sử dụng useDispatch để dispatch action
  const onLoginFinish = async (values) => {
    dispatch(loginUser(values)); // Dispatch action login với values từ form
  };

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
            <Mail size={16} />
            Email
          </span>
        }
        name="email"
        rules={[
          { required: true, message: "Please input your email!" },
          { type: "email", message: "Invalid email!" },
        ]}
      >
        <Input
          placeholder="your@email.com"
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

      <Form.Item name="remember" valuePropName="checked">
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
        >
          Login to Dashboard
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

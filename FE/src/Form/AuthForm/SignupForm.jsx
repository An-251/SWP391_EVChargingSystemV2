/* eslint-disable react/prop-types */
import { Form, Input, Button } from "antd";
import { useForm } from "antd/es/form/Form";
import { User, Mail, Lock } from "lucide-react";

export default function SignupForm() {
  const [signupForm] = useForm();

  const onFinishSignup = async (values) => {
    console.log("Signup Success:", values);
  };

  return (
    <Form
      name={signupForm}
      layout="vertical"
      onFinish={onFinishSignup}
      autoComplete="off"
      className="modern-form"
    >
      <Form.Item
        label={
          <span className="flex items-center gap-2 text-slate-300">
            <User size={16} />
            Full Name
          </span>
        }
        name="name"
        rules={[{ required: true, message: "Please input your name!" }]}
      >
        <Input placeholder="John Doe" size="large" className="modern-input" />
      </Form.Item>

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

      <Form.Item>
        <Button
          type="primary"
          htmlType="submit"
          size="large"
          className="modern-button w-full"
        >
          Create Account
        </Button>
      </Form.Item>

      <p className="text-xs text-slate-400 text-center">
        By signing up, you agree to our{" "}
        <a
          href="#"
          className="text-emerald-400 hover:text-emerald-300 transition-colors"
        >
          Terms of Service
        </a>{" "}
        and{" "}
        <a
          href="#"
          className="text-emerald-400 hover:text-emerald-300 transition-colors"
        >
          Privacy Policy
        </a>
      </p>
    </Form>
  );
}

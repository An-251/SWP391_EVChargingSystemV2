/* eslint-disable react/prop-types */
import { Form, Input, Button, message } from "antd";
import { useForm } from "antd/es/form/Form";
import { User, Mail, Lock } from "lucide-react";
import { registerUser, clearAuthSuccess, clearAuthError } from "../../redux/auth/authSlice";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function SignupForm() {
  const [signupForm] = useForm();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  // Get auth state từ Redux
  const { loading, error, success, registrationData } = useSelector((state) => state.auth);

  const onFinishSignup = async (values) => {
    console.log("🔑 [SIGNUP] Register form values:", values);
    dispatch(registerUser(values));
  };

  // Effect để handle success message và redirect to email verification
  useEffect(() => {
    if (success) {
      // Priority 1: Get from registrationData (backend response)
      const emailFromResponse = registrationData?.email;
      // Priority 2: Get from form
      const emailFromForm = signupForm.getFieldValue('email');
      // Use the first available email
      const emailToSave = emailFromResponse || emailFromForm;
      
      console.log('🔍 SignupForm - Email from response:', emailFromResponse);
      console.log('🔍 SignupForm - Email from form:', emailFromForm);
      console.log('🔍 SignupForm - Final email to save:', emailToSave);
      
      if (!emailToSave) {
        console.error('❌ SignupForm - No email found!');
        message.error('Không tìm thấy email. Vui lòng đăng ký lại.');
        return;
      }
      
      message.success("Đăng ký thành công! Vui lòng kiểm tra email để xác thực tài khoản.");
      
      // Save email to sessionStorage for verification page
      sessionStorage.setItem('verifyEmail', emailToSave);
      console.log('✅ SignupForm - Saved to sessionStorage:', sessionStorage.getItem('verifyEmail'));
      
      // Clear success state BEFORE navigation to prevent re-trigger
      dispatch(clearAuthSuccess());
      
      // Navigate to email verification page
      setTimeout(() => {
        navigate('/verify-email', { replace: true });
      }, 1500);
    }
  }, [success, registrationData, signupForm, navigate, dispatch]);

  // Effect để handle error messages  
  useEffect(() => {
    if (error) {
      console.error("❌ Register error:", error);
      message.error(error);
    }
  }, [error]);

  // Cleanup effect - clear state when component unmounts
  useEffect(() => {
    return () => {
      dispatch(clearAuthSuccess());
      dispatch(clearAuthError());
    };
  }, [dispatch]);

  return (
    <Form
      form={signupForm}
      layout="vertical"
      onFinish={onFinishSignup}
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
          { min: 3, message: "Username must be at least 3 characters!" },
        ]}
      >
        <Input placeholder="Enter username (e.g. Huy12345)" size="large" className="modern-input" />
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
          placeholder="Enter email (e.g. Huy@gmail.com)"
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
        rules={[
          { required: true, message: "Please input your password!" },
          { min: 6, message: "Password must be at least 6 characters!" },
        ]}
      >
        <Input.Password
          placeholder="Enter password (min 6 chars)"
          size="large"
          className="modern-input"
        />
      </Form.Item>

      <Form.Item
        label={
          <span className="flex items-center gap-2 text-slate-300">
            <Lock size={16} />
            Confirm Password
          </span>
        }
        name="confirmPassword"
        dependencies={['password']}
        rules={[
          { required: true, message: "Please confirm your password!" },
          ({ getFieldValue }) => ({
            validator(_, value) {
              if (!value || getFieldValue('password') === value) {
                return Promise.resolve();
              }
              return Promise.reject(new Error('Passwords do not match!'));
            },
          }),
        ]}
      >
        <Input.Password
          placeholder="Confirm your password"
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
          loading={loading}
          disabled={loading}
        >
          {loading ? "Creating Account..." : "Create Account"}
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

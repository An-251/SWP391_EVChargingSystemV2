/* eslint-disable react/no-unknown-property */
"use client";

import { Zap, Mail, Lock, User } from "lucide-react";
import { Form, Input, Button, Checkbox, Tabs } from "antd";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const [activeTab, setActiveTab] = useState("login");

  useEffect(() => {
    if (location.state === "signup") {
      setActiveTab("signup");
    }
  }, [location.state, location.pathname, navigate]);

  const onLoginFinish = (values) => {
    console.log("Login Success:", values);
  };

  const onSignupFinish = (values) => {
    console.log("Signup Success:", values);
  };

  return (
    <>
      <section className="min-h-screen flex flex-col lg:flex-row font-sans">
        {/* Left Image Section - 70% on desktop */}
        <div
          className="flex-[7] min-h-[40vh] lg:min-h-screen bg-cover bg-center relative"
          style={{
            backgroundImage:
              "url('https://i.pinimg.com/736x/93/cf/3a/93cf3ac40353492577b3af94dc78c914.jpg')",
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/70 via-teal-900/60 to-cyan-900/70 backdrop" />

          <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center">
            <div className="animate-fade-in-up space-y-6">
              <h2 className="text-white text-4xl md:text-5xl lg:text-6xl font-bold drop-shadow-2xl leading-tight">
                Welcome to{" "}
                <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
                  ChargePro
                </span>
              </h2>
              <p className="text-white/90 text-lg md:text-xl max-w-md mx-auto drop-shadow-lg backdrop-blur-sm bg-white/10 px-6 py-3 rounded-2xl border border-white/20">
                Power your journey with smart EV charging solutions
              </p>
            </div>
          </div>
        </div>

        {/* Right Form Section - 30% on desktop */}
        <div className="flex-[3] flex flex-col justify-center items-center p-6 lg:p-10 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
          <div className="absolute top-20 right-20 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-20 left-20 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl animate-float-delayed" />

          <div className="w-full max-w-md relative z-10">
            <div className="flex flex-col items-center gap-3 mb-8 animate-fade-in">
              <Link
                to="/"
                className="flex items-center gap-2 group cursor-pointer"
              >
                <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg group-hover:scale-110 group-hover:rotate-12 transition-all duration-300 shadow-lg shadow-emerald-500/50">
                  <Zap size={28} className="text-white" />
                </div>
                <h1 className="text-2xl lg:text-3xl font-bold text-white">
                  EV Charge Connect
                </h1>
              </Link>
              <p className="text-slate-400 text-center text-lg">
                Access your charging station dashboard
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 lg:p-8 border border-white/10 shadow-2xl animate-fade-in-up">
              <Tabs
                activeKey={activeTab}
                onChange={(key) => setActiveTab(key)}
                centered
                animated={{ inkBar: true, tabPane: true }}
                className="modern-tabs"
              >
                {/* Login Tab */}
                <Tabs.TabPane tab="Login" key="login">
                  <Form
                    name="login"
                    layout="vertical"
                    initialValues={{ remember: true }}
                    onFinish={onLoginFinish}
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
                      rules={[
                        {
                          required: true,
                          message: "Please input your password!",
                        },
                      ]}
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
                </Tabs.TabPane>

                {/* Sign Up Tab */}
                <Tabs.TabPane tab="Sign Up" key="signup">
                  <Form
                    name="signup"
                    layout="vertical"
                    onFinish={onSignupFinish}
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
                      rules={[
                        { required: true, message: "Please input your name!" },
                      ]}
                    >
                      <Input
                        placeholder="John Doe"
                        size="large"
                        className="modern-input"
                      />
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
                      rules={[
                        {
                          required: true,
                          message: "Please input your password!",
                        },
                      ]}
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
                </Tabs.TabPane>
              </Tabs>
            </div>
          </div>
        </div>
      </section>

      <style jsx global>{`
        /* Modern Tabs Styling */
        .modern-tabs .ant-tabs-nav {
          margin-bottom: 24px;
        }

        .modern-tabs .ant-tabs-nav::before {
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .modern-tabs .ant-tabs-tab {
          color: rgb(148, 163, 184);
          font-weight: 600;
          font-size: 16px;
          padding: 12px 24px;
          transition: all 0.3s ease;
        }

        .modern-tabs .ant-tabs-tab:hover {
          color: rgb(203, 213, 225);
        }

        .modern-tabs .ant-tabs-tab-active .ant-tabs-tab-btn {
          color: white !important;
          text-shadow: 0 0 20px rgba(16, 185, 129, 0.5);
        }

        .modern-tabs .ant-tabs-ink-bar {
          background: linear-gradient(
            to right,
            rgb(16, 185, 129),
            rgb(20, 184, 166),
            rgb(6, 182, 212)
          );
          height: 3px;
          border-radius: 3px;
          box-shadow: 0 0 20px rgba(16, 185, 129, 0.6);
        }

        /* Modern Form Styling */
        .modern-form .ant-form-item {
          margin-bottom: 20px;
        }

        .modern-form .ant-form-item-label > label {
          color: rgb(203, 213, 225);
          font-weight: 500;
          font-size: 14px;
        }

        /* Modern Input Styling */
        .modern-input,
        .modern-input.ant-input,
        .modern-input.ant-input-password {
          background: rgba(255, 255, 255, 0.05) !important;
          border: 1px solid rgba(255, 255, 255, 0.1) !important;
          border-radius: 12px !important;
          color: white !important;
          padding: 12px 16px !important;
          font-size: 15px !important;
          transition: all 0.3s ease !important;
        }

        .modern-input::placeholder,
        .modern-input.ant-input::placeholder {
          color: rgb(100, 116, 139) !important;
        }

        .modern-input:hover,
        .modern-input.ant-input:hover,
        .modern-input.ant-input-password:hover {
          background: rgba(255, 255, 255, 0.08) !important;
          border-color: rgba(16, 185, 129, 0.3) !important;
        }

        .modern-input:focus,
        .modern-input.ant-input:focus,
        .modern-input.ant-input-password:focus,
        .modern-input.ant-input-affix-wrapper-focused {
          background: rgba(255, 255, 255, 0.08) !important;
          border-color: rgb(16, 185, 129) !important;
          box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1) !important;
        }

        /* Password Input Icon Color */
        .modern-input .ant-input-password-icon {
          color: rgb(148, 163, 184) !important;
        }

        .modern-input .ant-input-password-icon:hover {
          color: rgb(203, 213, 225) !important;
        }

        /* Modern Checkbox Styling */
        .modern-checkbox .ant-checkbox-inner {
          background: rgba(255, 255, 255, 0.05) !important;
          border: 1px solid rgba(255, 255, 255, 0.2) !important;
          border-radius: 4px !important;
          transition: all 0.3s ease !important;
        }

        .modern-checkbox .ant-checkbox-checked .ant-checkbox-inner {
          background: linear-gradient(
            135deg,
            rgb(16, 185, 129),
            rgb(20, 184, 166)
          ) !important;
          border-color: rgb(16, 185, 129) !important;
        }

        .modern-checkbox:hover .ant-checkbox-inner {
          border-color: rgb(16, 185, 129) !important;
        }

        /* Modern Button Styling */
        .modern-button.ant-btn-primary {
          background: linear-gradient(
            to right,
            rgb(16, 185, 129),
            rgb(20, 184, 166),
            rgb(6, 182, 212)
          ) !important;
          border: none !important;
          border-radius: 12px !important;
          font-weight: 600 !important;
          font-size: 16px !important;
          height: 48px !important;
          box-shadow: 0 10px 25px -5px rgba(16, 185, 129, 0.3) !important;
          transition: all 0.3s ease !important;
        }

        .modern-button.ant-btn-primary:hover {
          transform: scale(1.02) !important;
          box-shadow: 0 20px 40px -10px rgba(16, 185, 129, 0.5) !important;
        }

        .modern-button.ant-btn-primary:active {
          transform: scale(0.98) !important;
        }

        /* Error Message Styling */
        .modern-form .ant-form-item-explain-error {
          color: rgb(248, 113, 113);
          font-size: 13px;
        }

        /* Responsive adjustments */
        @media (max-width: 1024px) {
          .modern-tabs .ant-tabs-tab {
            padding: 10px 16px;
            font-size: 15px;
          }
        }
      `}</style>
    </>
  );
}

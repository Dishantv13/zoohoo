import "@ant-design/v5-patch-for-react-19";
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Form,
  Input,
  Button,
  Card,
  Spin,
  notification,
  Typography,
} from "antd";

const { Text } = Typography;

import {
  UserOutlined,
  LockOutlined,
  MailOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
} from "@ant-design/icons";
import { phoneValidator } from "../validation/validation";
import { useRegisterMutation } from "../features/auth/authApi";
import "./Auth.css";

export default function Register() {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [phone, setPhone] = useState("");

  const [registerUser, { isLoading }] = useRegisterMutation();

  const onFinish = async (data) => {
    try {
      const response = await registerUser(data).unwrap();

      notification.success({
        message: "Registration Successful",
        description: response?.message || "You have successfully registered.",
      });

      navigate("/login");
    } catch (error) {
      console.error("Registration failed:", error);

      notification.error({
        message: "Registration Failed",
        description:
          error?.data?.message || "Something went wrong. Please try again.",
      });
    }
  };

  return (
    <div className="auth-container">
      <Card className="auth-card" title="Register">
        <Spin spinning={isLoading}>
          <Form
            form={form}
            onFinish={onFinish}
            layout="vertical"
            autoComplete="off"
          >
            <Form.Item
              name="name"
              label="Full Name"
              rules={[{ required: true, message: "Please enter your name" }]}
            >
              <Input
                prefix={<UserOutlined />}
                placeholder="Enter your name"
                size="large"
              />
            </Form.Item>

            <Form.Item
              name="email"
              label="Email"
              rules={[
                { required: true, message: "Please enter your email" },
                { type: "email", message: "Invalid email format" },
              ]}
            >
              <Input
                prefix={<MailOutlined />}
                placeholder="Enter your email"
                size="large"
              />
            </Form.Item>

            <Form.Item
              name="phonenumber"
              label="Phone Number"
              rules={[
                { required: true, message: "Please enter your phonenumber" },
                { validator: phoneValidator },
              ]}
            >
              <Input
                prefix={<PhoneOutlined />}
                value={phone}
                maxLength={10}
                placeholder="Enter your phone number"
                size="large"
                onInput={(e) => {
                  e.target.value = e.target.value.replace(/[^0-9]/g, "");
                }}
              />
            </Form.Item>

            <Form.Item
              name="address"
              label="Address"
              rules={[
                { required: false, message: "Please enter your address" },
              ]}
            >
              <Input.TextArea
                prefix={<EnvironmentOutlined />}
                placeholder="Enter your address"
                rows={2}
              />
            </Form.Item>

            <Form.Item
              name="password"
              label="Password"
              rules={[
                { required: true, message: "Please enter your password" },
                { min: 6, message: "Password must be at least 6 characters" },
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Enter your password"
                size="large"
              />
            </Form.Item>

            <Form.Item
              name="confirmPassword"
              label="Confirm Password"
              dependencies={["password"]}
              rules={[
                { required: true, message: "Please confirm your password" },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue("password") === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error("Passwords do not match"));
                  },
                }),
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Confirm your password"
                size="large"
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                block
                loading={isLoading}
                style={{ marginTop: 5 }}
              >
                Register
              </Button>
            </Form.Item>
          </Form>

          <p style={{ textAlign: "center" }}>
            Already have an account? <Link to="/login">Login here</Link>
          </p>
        </Spin>
      </Card>
    </div>
  );
}

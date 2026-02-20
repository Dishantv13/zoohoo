import "@ant-design/v5-patch-for-react-19";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
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
import { register } from "../features/auth/authSlice";
import "./Auth.css";

export default function Register() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);
  const [form] = Form.useForm();
  const [phone, setPhone] = useState("");

  const onFinish = async (values) => {
    const { confirmPassword, ...dataToSend } = values;
    const result = await dispatch(register(dataToSend));

    if (result.type === "auth/register/fulfilled") {
      notification.success({
        message: "User Register success",
        description: "User Register Successfull",
      });
      navigate("/");
    } else {
      notification.error({
        message: "registration failed",
        description: result.payload || error || "User Registration Failed",
      });
    }
  };

  return (
    <div className="auth-container">
      <Card className="auth-card" title="Register">
        <Spin spinning={loading}>
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
              rules={[{ required: true, message: "Please enter your address" }]}
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

            <Text style={{ color: "red" }}>
              Field Indicate with * are required
            </Text>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                block
                loading={loading}
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

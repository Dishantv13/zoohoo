import "@ant-design/v5-patch-for-react-19";
import { useDispatch } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { Form, Input, Button, Card, Spin, notification } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import { useVendorLoginMutation } from "../service/vendorApi";
import { setCredentials } from "../slice/authSlice";
import "./Auth.css";

export default function VendorLogin() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [vendorLogin, { isLoading }] = useVendorLoginMutation();

  const handleLogin = async (values) => {
    try {
      const response = await vendorLogin(values).unwrap();

      dispatch(
        setCredentials({
          user: response.data.user,
          token: response.data.token,
        }),
      );

      notification.success({
        message: "Vendor Login Successful",
        description: "Welcome back.",
      });

      navigate("/vendor/inventory");
    } catch (error) {
      notification.error({
        message: "Login Failed",
        description: error?.data?.message || "Invalid vendor credentials",
      });
    }
  };

  return (
    <div className="auth-container">
      <Card className="auth-card" title="Vendor Login">
        <Spin spinning={isLoading}>
          <Form form={form} onFinish={handleLogin} layout="vertical" autoComplete="off">
            <Form.Item
              name="email"
              label="Email"
              rules={[
                { required: true, message: "Please enter your email" },
                { type: "email", message: "Invalid email format" },
              ]}
            >
              <Input
                prefix={<UserOutlined />}
                placeholder="Enter your email"
                size="large"
              />
            </Form.Item>

            <Form.Item
              name="password"
              label="Password"
              rules={[{ required: true, message: "Please enter your password" }]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Enter your password"
                size="large"
              />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" size="large" block loading={isLoading}>
                Vendor Login
              </Button>
            </Form.Item>
          </Form>

          <p style={{ textAlign: "center" }}>
            Login as user/admin? <Link to="/login">Go to Login</Link>
          </p>
        </Spin>
      </Card>
    </div>
  );
}

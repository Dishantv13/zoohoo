import "@ant-design/v5-patch-for-react-19";
import { useDispatch } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { Form, Input, Button, Card, Spin, notification } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import "./Auth.css";
import { useLoginMutation } from "../service/authApi";
import { setCredentials } from "../slice/authSlice";

export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const [login, { isLoading }] = useLoginMutation();

  const handleLogin = async (data) => {
    try {
      const response = await login(data).unwrap();
      dispatch(
        setCredentials({
          user: response.data.user,
          token: response.data.token,
        }),
      );
      notification.success({
        message: "Login Successful",
        description: "You have successfully logged in.",
      });
      if(response.data.user.role === "vendor") {
        navigate("/vendor/inventory");
      } else {
        navigate("/");
      }
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  return (
    <div className="auth-container">
      <Card className="auth-card" title="Login">
        <Spin spinning={isLoading}>
          <Form
            form={form}
            onFinish={handleLogin}
            layout="vertical"
            autoComplete="off"
          >
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
              rules={[
                { required: true, message: "Please enter your password" },
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Enter your password"
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
              >
                Login
              </Button>
            </Form.Item>
          </Form>

          <p style={{ textAlign: "center" }}>
            Don't have an account? <Link to="/register">Register here</Link>
          </p>
          <p style={{ textAlign: "center" }}>
            Are you an admin?{" "}
            <Link to="/admin/register">Register your company</Link>
          </p>
        </Spin>
      </Card>
    </div>
  );
}

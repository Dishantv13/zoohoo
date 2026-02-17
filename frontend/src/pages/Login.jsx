import "@ant-design/v5-patch-for-react-19";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { Form, Input, Button, Card, Spin, notification } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import { login } from "../features/auth/authSlice";
import "./Auth.css";

export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);
  const [form] = Form.useForm();

  const onFinish = async (values) => {
    const result = await dispatch(login(values));

    if (result.type === "auth/login/fulfilled") {
      notification.success({
        message: "Login Success",
        description: "Login Successful",
      });
      navigate("/");
    } else {
      notification.error({
        message: "Login Failed",
        description: result.payload || error || "Login Failed",
      });
    }
  };

  return (
    <div className="auth-container">
      <Card className="auth-card" title="Login">
        <Spin spinning={loading}>
          <Form
            form={form}
            onFinish={onFinish}
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
                loading={loading}
              >
                Login
              </Button>
            </Form.Item>
          </Form>

          <p style={{ textAlign: "center" }}>
            Don't have an account? <Link to="/register">Register here</Link>
          </p>
        </Spin>
      </Card>
    </div>
  );
}

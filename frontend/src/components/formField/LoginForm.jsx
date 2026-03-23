import { Card, Form, Input, Button, Spin } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";
import { ROUTE_PATHS } from "../../enum/apiUrl";

const LoginForm = ({
  title = "Auth",
  onFinish,
  isLoading = false,
  form,
  showRegisterLink = true,
  showAdminLink = true,
  submitText = "Submit",
}) => {
  return (
    <Card className="auth-card" title={title}>
      <Spin spinning={isLoading}>
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
              loading={isLoading}
            >
              {submitText}
            </Button>
          </Form.Item>
        </Form>

        {showRegisterLink && (
          <p style={{ textAlign: "center" }}>
            Don't have an account? <Link to={ROUTE_PATHS.REGISTER}>Register here</Link>
          </p>
        )}

        {showAdminLink && (
          <p style={{ textAlign: "center" }}>
            Are you an admin?{" "}
            <Link to={ROUTE_PATHS.ADMIN_REGISTER}>Register your company</Link>
          </p>
        )}
      </Spin>
    </Card>
  );
};

export default LoginForm;
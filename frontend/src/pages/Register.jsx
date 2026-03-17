import "@ant-design/v5-patch-for-react-19";
import { useNavigate } from "react-router-dom";
import { Form, Button, Card, notification } from "antd";
import { useRegisterMutation } from "../service/authApi";
import UserFields from "../components/UserField";
import { ROUTE_PATHS } from "../enum/apiUrl";

import "../css/Auth.css";

export default function Register() {
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const [registerUser, { isLoading }] = useRegisterMutation();

  const onFinish = async (data) => {
    try {
      const response = await registerUser(data).unwrap();

      notification.success({
        message: "Registration Successful",
        description: response?.message || "You have successfully registered.",
      });

      navigate(ROUTE_PATHS.LOGIN);
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
        <Form
          form={form}
          onFinish={onFinish}
          layout="vertical"
          autoComplete="off"
        >
          <UserFields />

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
      </Card>
    </div>
  );
}

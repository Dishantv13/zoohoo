import "@ant-design/v5-patch-for-react-19";
import { useNavigate, Link } from "react-router-dom";
import {
  Form,
  Button,
  Card,
  Spin,
  notification,
  Tabs,
  Divider,
} from "antd";
import { useAdminRegisterMutation } from "../service/authApi";
import { AdminFields, CompanyFields } from "../components/AdminField";
import { ROUTE_PATHS } from "../enum/apiUrl";
import "../css/Auth.css";

export default function AdminRegister() {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [adminRegisterUser, { isLoading }] = useAdminRegisterMutation();

  const onFinish = async (data) => {
    try {
      const response = await adminRegisterUser(data).unwrap();
      notification.success({
        message: "Admin Registration Success",
        description:
          response?.message ||
          "Your company and admin account have been created successfully",
      });
      navigate(ROUTE_PATHS.LOGIN);
    } catch (error) {
      notification.error({
        message: "Registration Failed",
        description: error?.data?.message || "Admin Registration Failed",
      });
    }
  };

  return (
    <div className="auth-container">
      <Card
        className="auth-card"
        title="Admin Registration - Create Your Company"
      >
        <Spin spinning={isLoading}>
          <Form
            form={form}
            onFinish={onFinish}
            layout="vertical"
            autoComplete="off"
          >
            <Tabs
              items={[
                {
                  key: "admin",
                  label: "Admin Details",
                  children: <AdminFields />,
                },
                {
                  key: "company",
                  label: "Company Details",
                  children: <CompanyFields />,
                },
              ]}
            />

            <Divider />

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                block
                loading={isLoading}
              >
                Register Admin & Company
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

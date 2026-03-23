import "@ant-design/v5-patch-for-react-19";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Form, notification } from "antd";

import { useLoginMutation } from "../service/authApi";
import { setCredentials } from "../slice/authSlice";
import { ROUTE_PATHS } from "../enum/apiUrl";
import LoginForm from "../components/formField/LoginForm";

import "../css/Auth.css";

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
      if (response.data.user.role === "vendor") {
        navigate(ROUTE_PATHS.VENDOR_INVENTORY);
      } else if (response.data.user.role === "admin") {
        navigate(ROUTE_PATHS.CUSTOMER_MANAGEMENT);
      } else {
        navigate(ROUTE_PATHS.HOME);
      }
    } catch (error) {
      notification.error({
        message: "Login Failed",
        description:
          error?.data?.message || "Something went wrong. Please try again.",
      });
    }
  };

  return (
    <div className="auth-container">
      <LoginForm
        title="Login"
        onFinish={handleLogin}
        isLoading={isLoading}
        form={form}
        showRegisterLink={true}
        showAdminLink={true}
        submitText="Login"
      />
    </div>
  );
}

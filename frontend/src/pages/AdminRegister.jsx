import "@ant-design/v5-patch-for-react-19";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import {
  Form,
  Input,
  Button,
  Card,
  Spin,
  notification,
  Tabs,
  Divider,
} from "antd";
import {
  UserOutlined,
  LockOutlined,
  MailOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  HomeOutlined,
  GlobalOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import { adminRegister } from "../features/auth/authSlice";
import "./Auth.css";

export default function AdminRegister() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);
  const [form] = Form.useForm();

  const onFinish = async (values) => {
    const result = await dispatch(adminRegister(values));

    if (result.type === "auth/adminRegister/fulfilled") {
      notification.success({
        message: "Admin Registration Success",
        description:
          "Your company and admin account have been created successfully",
      });
      navigate("/");
    } else {
      notification.error({
        message: "Registration Failed",
        description: result.payload || error || "Admin Registration Failed",
      });
    }
  };

  const adminFields = (
    <>
      <Form.Item
        name="adminName"
        label="Admin Full Name"
        rules={[{ required: true, message: "Please enter admin name" }]}
      >
        <Input
          prefix={<UserOutlined />}
          placeholder="Enter your full name"
          size="large"
        />
      </Form.Item>

      <Form.Item
        name="adminEmail"
        label="Admin Email"
        rules={[
          { required: true, message: "Please enter admin email" },
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
        name="adminPassword"
        label="Password"
        rules={[
          { required: true, message: "Please enter password" },
          { min: 6, message: "Password must be at least 6 characters" },
        ]}
      >
        <Input.Password
          prefix={<LockOutlined />}
          placeholder="Enter password"
          size="large"
        />
      </Form.Item>

      <Form.Item
        name="adminPhone"
        label="Admin Phone Number"
        rules={[{ required: false, message: "Please enter phone number" }]}
      >
        <Input
          prefix={<PhoneOutlined />}
          maxLength={10}
          onInput={(e) => {
            e.target.value = e.target.value.replace(/[^0-9]/g, "");
          }}
          placeholder="Enter your phone number"
          size="large"
        />
      </Form.Item>
    </>
  );

  const companyFields = (
    <>
      <Form.Item
        name="companyName"
        label="Company Name"
        rules={[{ required: true, message: "Please enter company name" }]}
      >
        <Input
          prefix={<HomeOutlined />}
          placeholder="Enter company name"
          size="large"
        />
      </Form.Item>

      <Form.Item
        name="companyEmail"
        label="Company Email"
        rules={[
          { required: true, message: "Please enter company email" },
          { type: "email", message: "Invalid email format" },
        ]}
      >
        <Input
          prefix={<MailOutlined />}
          placeholder="Enter company email"
          size="large"
        />
      </Form.Item>

      <Form.Item
        name="companyPhone"
        label="Company Phone"
        rules={[{ required: false }]}
      >
        <Input
          prefix={<PhoneOutlined />}
          maxLength={10}
          onInput={(e) => {
            e.target.value = e.target.value.replace(/[^0-9]/g, "");
          }}
          placeholder="Enter company phone"
          size="large"
        />
      </Form.Item>

      <Form.Item
        name="companyAddress"
        label="Company Address"
        rules={[{ required: true, message: "Please enter company address" }]}
      >
        <Input
          prefix={<EnvironmentOutlined />}
          placeholder="Enter company address"
          size="large"
        />
      </Form.Item>

      <div
        style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}
      >
        <Form.Item name="city" label="City" rules={[{ required: false }]}>
          <Input placeholder="Enter city" size="large" />
        </Form.Item>

        <Form.Item name="state" label="State" rules={[{ required: false }]}>
          <Input placeholder="Enter state" size="large" />
        </Form.Item>

        <Form.Item
          name="zipcode"
          label="Zip Code"
          rules={[{ required: false }]}
        >
          <Input placeholder="Enter zip code" type="number" size="large" />
        </Form.Item>

        <Form.Item name="country" label="Country" rules={[{ required: false }]}>
          <Input placeholder="Enter country" size="large" />
        </Form.Item>
      </div>

      <Form.Item name="website" label="Website" rules={[{ required: false }]}>
        <Input
          prefix={<GlobalOutlined />}
          placeholder="Enter company website"
          size="large"
        />
      </Form.Item>

      <Form.Item name="industry" label="Industry" rules={[{ required: false }]}>
        <Input placeholder="Enter industry type" size="large" />
      </Form.Item>

      <div
        style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}
      >
        <Form.Item
          name="gstNumber"
          label="GST Number"
          rules={[{ required: false }]}
        >
          <Input
            prefix={<FileTextOutlined />}
            placeholder="Enter GST number"
            size="large"
          />
        </Form.Item>

        <Form.Item
          name="panNumber"
          label="PAN Number"
          rules={[{ required: false }]}
        >
          <Input
            prefix={<FileTextOutlined />}
            placeholder="Enter PAN number"
            size="large"
          />
        </Form.Item>
      </div>
    </>
  );

  return (
    <div className="auth-container">
      <Card
        className="auth-card"
        title="Admin Registration - Create Your Company"
      >
        <Spin spinning={loading}>
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
                  children: adminFields,
                },
                {
                  key: "company",
                  label: "Company Details",
                  children: companyFields,
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
                loading={loading}
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

import { Form, Input } from "antd";
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

import {
  phoneValidator,
  gstValidator,
  panValidator,
} from "../../validation/validation";

export const AdminFields = () => {
  return (
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
        rules={[{ required: true }, { validator: phoneValidator }]}
      >
        <Input
          prefix={<PhoneOutlined />}
          maxLength={10}
          placeholder="Enter phone number"
          size="large"
        />
      </Form.Item>
    </>
  );
};

export const CompanyFields = () => {
  return (
    <>
      <Form.Item
        name="companyName"
        label="Company Name"
        rules={[{ required: true }]}
      >
        <Input
          prefix={<HomeOutlined />}
          placeholder="Company Name"
          size="large"
        />
      </Form.Item>

      <Form.Item
        name="companyEmail"
        label="Company Email"
        rules={[{ required: true }, { type: "email" }]}
      >
        <Input
          prefix={<MailOutlined />}
          placeholder="Company Email"
          size="large"
        />
      </Form.Item>

      <Form.Item
        name="companyPhone"
        label="Company Phone"
        rules={[{ required: true }, { validator: phoneValidator }]}
      >
        <Input prefix={<PhoneOutlined />} maxLength={10} size="large" />
      </Form.Item>

      <Form.Item
        name="companyAddress"
        label="Company Address"
        rules={[{ required: true }]}
      >
        <Input prefix={<EnvironmentOutlined />} size="large" />
      </Form.Item>

      <Form.Item name="website" label="Website">
        <Input prefix={<GlobalOutlined />} size="large" />
      </Form.Item>

      <Form.Item
        name="gstNumber"
        label="GST Number"
        rules={[{ validator: gstValidator }]}
      >
        <Input prefix={<FileTextOutlined />} size="large" />
      </Form.Item>

      <Form.Item
        name="panNumber"
        label="PAN Number"
        rules={[{ validator: panValidator }]}
      >
        <Input prefix={<FileTextOutlined />} size="large" />
      </Form.Item>
    </>
  );
};

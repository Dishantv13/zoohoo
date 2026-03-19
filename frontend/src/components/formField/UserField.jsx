import { Form, Input } from "antd";
import {
  UserOutlined,
  LockOutlined,
  MailOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
} from "@ant-design/icons";
import { phoneValidator } from "../../validation/validation";

const UserFields = () => {
  return (
    <>
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
          { required: true, message: "Please enter your phone number" },
          { validator: phoneValidator },
        ]}
      >
        <Input
          prefix={<PhoneOutlined />}
          maxLength={10}
          placeholder="Enter your phone number"
          size="large"
          onInput={(e) => {
            e.target.value = e.target.value.replace(/[^0-9]/g, "");
          }}
        />
      </Form.Item>

      <Form.Item name="address" label="Address">
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
              return Promise.reject(
                new Error("Passwords do not match")
              );
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
    </>
  );
};

export default UserFields;
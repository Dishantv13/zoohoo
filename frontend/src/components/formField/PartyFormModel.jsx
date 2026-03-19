import { Modal, Form, Input, Switch } from "antd";
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  HomeOutlined,
} from "@ant-design/icons";

export default function PartyFormModal({
  type = "customer",
  form,
  open,
  isEditMode,
  loading,
  onCancel,
  onSubmit,
}) {
  const isCustomer = type === "customer";

  const title = isEditMode
    ? `Edit ${isCustomer ? "Customer" : "Vendor"}`
    : `Create New ${isCustomer ? "Customer" : "Vendor"}`;

  const phoneField = isCustomer ? "phonenumber" : "phone";

  return (
    <Modal
      title={title}
      open={open}
      confirmLoading={loading}
      onCancel={onCancel}
      onOk={() => form.submit()}
    >
      <Form
        form={form}
        layout="vertical"
        autoComplete="off"
        onFinish={onSubmit}
      >
        <Form.Item
          name="name"
          label={`${isCustomer ? "Customer" : "Vendor"} Name`}
          rules={[
            {
              required: true,
              message: `Please enter ${
                isCustomer ? "customer" : "vendor"
              } name`,
            },
          ]}
        >
          <Input
            prefix={<UserOutlined />}
            placeholder={`Enter ${
              isCustomer ? "customer" : "vendor"
            } name`}
          />
        </Form.Item>

        <Form.Item
          name="email"
          label="Email"
          rules={[
            { required: true, message: "Please enter email" },
            { type: "email", message: "Invalid email format" },
          ]}
        >
          <Input
            prefix={<MailOutlined />}
            placeholder={`Enter ${
              isCustomer ? "customer" : "vendor"
            } email`}
            disabled={isEditMode}
          />
        </Form.Item>

        {!isEditMode && (
          <Form.Item
            name="password"
            label="Password"
            rules={[
              { required: true, message: "Please enter password" },
              { min: 6, message: "Password must be at least 6 characters" },
            ]}
          >
            <Input.Password placeholder="Enter password" />
          </Form.Item>
        )}

        <Form.Item name={phoneField} label="Phone Number">
          <Input
            prefix={<PhoneOutlined />}
            maxLength={10}
            onInput={(e) => {
              e.target.value = e.target.value.replace(/[^0-9]/g, "");
            }}
            placeholder="Enter phone number"
          />
        </Form.Item>

        {!isCustomer && (
          <Form.Item name="address" label="Address">
            <Input
              prefix={<HomeOutlined />}
              placeholder="Enter vendor address"
            />
          </Form.Item>
        )}

        {isCustomer && isEditMode && (
          <Form.Item
            name="isActive"
            label="Active Status"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
        )}
      </Form>
    </Modal>
  );
}
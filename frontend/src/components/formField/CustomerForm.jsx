import React from "react";
import {
  Card,
  Form,
  Input,
  Button,
  Space,
  Modal,
  Spin,
} from "antd";
import {
  UserOutlined,
  LockOutlined,
  MailOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
} from "@ant-design/icons";

const CustomerForm = ({
  form,
  onFinish,
  onChangePassword,
  handleDeleteAccount,
  setPasswordModal,
  passwordModal,
  isEditing,
  setIsEditing,
  isLoading,
  updateLoading,
  changePasswordLoading,
  deleteLoading,
  passwordForm,
  currentUser,
}) => {

  return (
    <div>
      <Card
        title="My Profile"
        extra={
          <Space>
            <Button onClick={() => setPasswordModal(true)}>
              Change Password
            </Button>

            {isEditing ? (
              <>
                <Button onClick={() => setIsEditing(false)}>Cancel</Button>
                <Button type="primary" onClick={() => form.submit()}>
                  Save
                </Button>
              </>
            ) : (
              <>
                <Button type="primary" onClick={() => setIsEditing(true)}>
                  Edit
                </Button>
                <Button
                  danger
                  onClick={handleDeleteAccount}
                  loading={deleteLoading}
                >
                  Delete Account
                </Button>
              </>
            )}
          </Space>
        }
      >
        <Spin spinning={isLoading || updateLoading}>
          <Form
            layout="vertical"
            form={form}
            onFinish={onFinish}
            disabled={!isEditing}
          >
            <Form.Item name="name" label="Name" rules={[{ required: true }]}>
              <Input prefix={<UserOutlined />} />
            </Form.Item>

            <Form.Item
              name="email"
              label="Email"
              rules={[{ required: true }, { type: "email" }]}
            >
              <Input prefix={<MailOutlined />} />
            </Form.Item>

            <Form.Item
              name="phonenumber"
              label="Phone Number"
              rules={[
                {
                  required: true,
                  message: "Please enter your phone number",
                },
              ]}
            >
              <Input
                prefix={<PhoneOutlined />}
                maxLength={10}
                placeholder="Enter your phone number"
                onInput={(e) => {
                  e.target.value = e.target.value.replace(/[^0-9]/g, "");
                }}
              />
            </Form.Item>

            <Form.Item
              name="address"
              label="Address"
              rules={[{ required: true, message: "Please enter your address" }]}
            >
              <Input
                prefix={<EnvironmentOutlined />}
                rows={2}
                placeholder="Enter your address"
              />
            </Form.Item>
          </Form>
        </Spin>
      </Card>

      <Modal
        title="Change Password"
        open={passwordModal}
        onCancel={() => {
          setPasswordModal(false);
          passwordForm.resetFields();
        }}
        onOk={() => passwordForm.submit()}
        confirmLoading={changePasswordLoading}
      >
        <Form layout="vertical" form={passwordForm} onFinish={onChangePassword}>
          <Form.Item
            name="currentPassword"
            label="Current Password"
            rules={[{ required: true, message: "Enter current password" }]}
          >
            <Input.Password prefix={<LockOutlined />} />
          </Form.Item>

          <Form.Item
            name="newPassword"
            label="New Password"
            rules={[
              { required: true },
              { min: 6, message: "Minimum 6 characters" },
            ]}
          >
            <Input.Password prefix={<LockOutlined />} />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            label="Confirm Password"
            dependencies={["newPassword"]}
            rules={[
              { required: true },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("newPassword") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error("Passwords do not match"));
                },
              }),
            ]}
          >
            <Input.Password prefix={<LockOutlined />} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CustomerForm;

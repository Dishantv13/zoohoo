import "@ant-design/v5-patch-for-react-19";
import {
  Button,
  Form,
  Input,
  Card,
  Space,
  notification,
  Spin,
  Modal,
} from "antd";
import {
  UserOutlined,
  LockOutlined,
  MailOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
} from "@ant-design/icons";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  useUpdateCustomerProfileMutation,
  useChangePasswordMutation,
  useDeleteCustomerProfileMutation,
} from "../service/customerApi";

import { useGetCurrentUserQuery } from "../service/authApi";
import { ROUTE_PATHS } from "../enum/apiUrl";

export default function Customers() {
  const [form] = Form.useForm();
  const [passwordForm] = Form.useForm();
  const [isEditing, setIsEditing] = useState(false);
  const [passwordModal, setPasswordModal] = useState(false);
  const navigate = useNavigate();

  const { data, refetch, isLoading } = useGetCurrentUserQuery();

  const [updateCustomerProfile, { isLoading: updateLoading }] =
    useUpdateCustomerProfileMutation();
  const [changePassword, { isLoading: changePasswordLoading }] =
    useChangePasswordMutation();
  const [deleteCustomerProfile, { isLoading: deleteLoading }] =
    useDeleteCustomerProfileMutation();

  useEffect(() => {
    if (data?.data) {
      form.setFieldsValue(data.data);
    }
  }, [data, form]);

  const onFinish = async (values) => {
    try {
      await updateCustomerProfile(values).unwrap();

      notification.success({
        message: "Success",
        description: "Profile updated successfully",
      });
      setIsEditing(false);
      refetch();
    } catch (error) {
      notification.error({
        message: "Failed",
        description: error.data?.message || "Profile update failed",
      });
    }
  };

  const onChangePassword = async (values) => {
    try {
      await changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      }).unwrap();
      notification.success({
        message: "Password Changed",
        description: "Please login again",
      });

      setPasswordModal(false);
      passwordForm.resetFields();
      localStorage.removeItem("token");
      navigate(ROUTE_PATHS.LOGIN);
    } catch (error) {
      notification.error({
        message: "Failed",
        description: error.data?.message || "Password change failed",
      });
    }
  };
  const handleDeleteAccount = () => {
    Modal.confirm({
      title: "Delete Account",
      content: "Are you sure? This action cannot be undone.",
      okText: "Delete",
      okType: "danger",
      onOk: async () => {
        try {
          await deleteCustomerProfile().unwrap();

          notification.success({
            message: "Account Deleted",
            description: "Your account has been deleted",
          });

          localStorage.removeItem("token");
          navigate(ROUTE_PATHS.LOGIN);
        } catch (error) {
          notification.error({
            message: "Failed",
            description: "Account deletion failed",
          });
        }
      },
    });
  };

  return (
    <div style={{ maxWidth: 600, margin: "0 auto" }}>
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
}

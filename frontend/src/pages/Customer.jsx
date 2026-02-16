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
} from "@ant-design/icons";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../service/api";

export default function Customers() {
  const [form] = Form.useForm();
  const [passwordForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [passwordModal, setPasswordModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const res = await api.get("/customers/profile");
      form.setFieldsValue(res.data);
    } catch (error) {
      notification.error({
        message: "Failed",
        description: "Unable to load profile",
      });
    } finally {
      setLoading(false);
    }
  };


  const onFinish = async (values) => {
    try {
      setLoading(true);
      await api.put("/customers/profile", values);

      notification.success({
        message: "Success",
        description: "Profile updated successfully",
      });

      setIsEditing(false);
      fetchUserProfile();
    } catch (error) {
      notification.error({
        message: "Failed",
        description: "Profile update failed",
      });
    } finally {
      setLoading(false);
    }
  };

  const onChangePassword = async (values) => {
    try {
      setLoading(true);

      await api.put("/customers/change-password", {
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });

      notification.success({
        message: "Password Changed",
        description: "Please login again",
      });

      setPasswordModal(false);
      passwordForm.resetFields();

      localStorage.removeItem("token");
      navigate("/login");
    } catch (error) {
      notification.error({
        message: "Failed",
        description:
          error.response?.data?.message || "Password change failed",
      });
    } finally {
      setLoading(false);
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
          setLoading(true);
          await api.delete("/customers/profile");

          notification.success({
            message: "Account Deleted",
            description: "Your account has been deleted",
          });

          localStorage.removeItem("token");
          navigate("/login");
        } catch (error) {
          notification.error({
            message: "Failed",
            description: "Account deletion failed",
          });
        } finally {
          setLoading(false);
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
                <Button onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
                <Button type="primary" onClick={() => form.submit()}>
                  Save
                </Button>
              </>
            ) : (
              <>
                <Button
                  type="primary"
                  onClick={() => setIsEditing(true)}
                >
                  Edit
                </Button>
                <Button danger onClick={handleDeleteAccount}>
                  Delete Account
                </Button>
              </>
            )}
          </Space>
        }
      >
        <Spin spinning={loading}>
          <Form
            layout="vertical"
            form={form}
            onFinish={onFinish}
            disabled={!isEditing}
          >
            <Form.Item
              name="name"
              label="Name"
              rules={[{ required: true }]}
            >
              <Input prefix={<UserOutlined />} />
            </Form.Item>

            <Form.Item
              name="email"
              label="Email"
              rules={[
                { required: true },
                { type: "email" },
              ]}
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
                {
                  pattern: /^[0-9]{10}$/,
                  message:"Phone number must be exactly 10 digits",
                },
              ]}
            >
              <Input
                prefix={<PhoneOutlined />}
                maxLength={10}
                placeholder="Enter your phone number"
                onChange={(e) =>
                  form.setFieldsValue({
                    phonenumber: e.target.value.replace(/\D/g,""),
                  })
                }
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
        confirmLoading={loading}
      >
        <Form
          layout="vertical"
          form={passwordForm}
          onFinish={onChangePassword}
        >
          <Form.Item
            name="currentPassword"
            label="Current Password"
            rules={[
              { required: true, message: "Enter current password" },
            ]}
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
                  if (
                    !value ||
                    getFieldValue("newPassword") === value
                  ) {
                    return Promise.resolve();
                  }
                  return Promise.reject(
                    new Error("Passwords do not match")
                  );
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


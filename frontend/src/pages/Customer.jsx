
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
} from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, PhoneOutlined } from '@ant-design/icons';  
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../service/api';

export default function Customers() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const navigate = useNavigate();
   const [phone, setPhone] = useState('')

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const res = await api.get('/customers/profile');
      form.setFieldsValue(res.data);
    } catch (error) {
      notification.error({
        message: 'Failed',
        description: 'Unable to load profile',
      });
    } finally {
      setLoading(false);
    }
  };

  const onFinish = async (values) => {
    try {
      setLoading(true);
      await api.put('/customers/profile', values);
      notification.success({
        message: 'Success',
        description: 'Profile updated successfully',
      });
      setIsEditing(false);
      fetchUserProfile();
    } catch (error) {
      notification.error({
        message: 'Failed',
        description: 'Profile update failed',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = () => {
    Modal.confirm({
      title: 'Delete Account',
      content: 'Are you sure? This action cannot be undone.',
      okText: 'Delete',
      okType: 'danger',
      onOk: async () => {
        try {
          setLoading(true);
          await api.delete('/customers/profile');

          notification.success({
            message: 'Account Deleted',
            description: 'Your account has been deleted',
          });

          localStorage.removeItem('token');
          navigate('/login');
        } catch (error) {
          notification.error({
            message: 'Failed',
            description: 'Account deletion failed',
          });
        } finally {
          setLoading(false);
        }
      },
    });
  };

  return (
    <div style={{ maxWidth: 600, margin: '0 auto' }}>
      <Card
        title="My Profile"
        extra={
          <Space>
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
              <Input 
                prefix={<UserOutlined/>}
              />
            </Form.Item>

            <Form.Item
              name="email"
              label="Email"
              rules={[
                { required: true },
                { type: 'email' },
              ]}
            >
              <Input 
                 prefix={<MailOutlined />}
              />
            </Form.Item>

            <Form.Item
              name="phonenumber"
              label="Phone Number"
              rules={[
                { required: true, message: 'Please enter your phonenumber' },
                { pattern: /^[0-9]{10}$/, message: 'Phone number must be exactly 10 digits' },
                // { type: "number", message: 'Invalid phonenumber format' },
            ]}
        >
            <Input
                prefix={<PhoneOutlined />}
                value={phone}
                maxLength={10}
                placeholder="Enter your phone number"
                size="large"
                onChange={(e) => {
                    const digitsOnly = e.target.value.replace(/\D/g, '');
                    setPhone(digitsOnly);
                }}
            />
            </Form.Item>
          </Form>
        </Spin>
      </Card>
    </div>
  );
}

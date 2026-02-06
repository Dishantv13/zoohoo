import "@ant-design/v5-patch-for-react-19"
import {
  Button,
  Modal,
  Form,
  Input,
  Table,
  Space,
  Popconfirm,
  notification,
  message,
} from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { fetchCustomers } from '../features/customer/customer.slice';

export default function Customers() {
  const dispatch = useDispatch();
  const customers = useSelector(state => state.customers.list);

  const [open, setOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [form] = Form.useForm();
  const [page, setPage] = useState(1);

  useEffect(() => {
    dispatch(fetchCustomers());
  }, [dispatch]);

  const onFinish = async (values) => {
    try {
      if (editingCustomer) {
        await axios.put(
          `/api/customers/${editingCustomer._id}`,
          values
        );
        //message.success('Customer updated');
        notification.success({
          message: 'Success',
          description: 'customer updated successfully',
        })
      } else {
        await axios.post('/api/customers', values);
        //message.success('Customer added');
        notification.success({
          message: 'Success',
          description: 'customer added successfully',
        })
      }

      dispatch(fetchCustomers());
      form.resetFields();
      setEditingCustomer(null);
      setOpen(false);
    } catch (error) {
      //message.error('Something went wrong');
      notification.error({
            message: ' Failed',
            description: 'Failed To create customer'
          });
    }
  };

  const handleEdit = (customer) => {
    setEditingCustomer(customer);
    form.setFieldsValue(customer);
    setOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/customers/${id}`);
      //message.success('Customer deleted');
      notification.success({
          message: 'Success',
          description: 'customer deleted successfully',
        })
      dispatch(fetchCustomers());
    } catch (error) {
      //message.error('Delete failed');
        notification.error({
            message: ' Failed',
            description:'Failed To Delete Customer'
          });
    }
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
    },
    {
      title: 'Email',
      dataIndex: 'email',
    },
    {
      title: 'Phone Number',
      dataIndex: 'phonenumber',
    },
    {
      title: 'Actions',
      render: (_, record) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            Edit
          </Button>

          <Popconfirm
            title="Are you sure you want to delete this customer?"
            onConfirm={() => handleDelete(record._id)}
          >
            <Button danger icon={<DeleteOutlined />}>
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      <Button
        type="primary"
        onClick={() => {
          setEditingCustomer(null);
          form.resetFields();
          setOpen(true);
        }}
      >
        Add Customer
      </Button>

      <Table
        columns={columns}
        dataSource={customers}
        rowKey="_id"
        pagination={{
            current: page,
            pageSize: 10,
            onChange: p => setPage(p),
          }}
        style={{ marginTop: 16 }}
      />

      <Modal
        title={editingCustomer ? 'Edit Customer' : 'Add Customer'}
        open={open}
        onCancel={() => {
          setOpen(false);
          setEditingCustomer(null);
          form.resetFields();
        }}
        onOk={() => form.submit()}
      >
        <Form layout="vertical" form={form} onFinish={onFinish}>
          <Form.Item
            name="name"
            label="Name"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[{ required: true, type: 'email' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="phonenumber"
            label="Phone Number"
            rules={[{ required: true, len: 10 }]}
          >
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}

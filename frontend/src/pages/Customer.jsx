import { Button, Modal, Form, Input, Table } from 'antd';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { fetchCustomers,addCustomer } from '../features/customer/customer.slice';

export default function Customers() {
  const dispatch = useDispatch();
  const customers = useSelector(state => state.customers.list);
  console.log('Customers from Redux:', customers);
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm();



  useEffect(() => {
    dispatch(fetchCustomers());
  }, [dispatch]);

  const onFinish = async values => {
    await axios.post('/api/customers', values);
    dispatch(fetchCustomers());
    form.resetFields();
    setOpen(false);
  };

  const columns = [
    { title: 'Name', dataIndex: 'name' },
    { title: 'Email', dataIndex: 'email' },
    { title: 'PhoneNumber', dataIndex: 'phonenumber' },
  ];


  return (
    <>
      <Button type="primary" onClick={() => setOpen(true)}>
        Add Customer
      </Button>

      <Table
        columns={columns}
        dataSource={customers}
        rowKey="_id"
        style={{ marginTop: 16 }}
      />

      <Modal
        title="Add Customer"
        open={open}
        onCancel={() => setOpen(false)}
        onOk={() => form.submit()}
      >
        <Form layout="vertical" form={form} onFinish={onFinish}>
          <Form.Item name="name" label="Name" rules={[{ required: true }]}>
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
            label="Phonenumber"
            rules={[{ required: true, len: 10 }]}
          >
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}

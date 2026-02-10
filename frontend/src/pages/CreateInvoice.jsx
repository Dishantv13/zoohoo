import "@ant-design/v5-patch-for-react-19"
import {
  Form,
  Input,
  Button,
  Select,
  DatePicker,
  InputNumber,
  notification,
  Spin,
} from 'antd';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import api from '../service/api';
import { useParams, useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';

export default function CreateInvoice() {
  const [form] = Form.useForm();
  const currentUser = useSelector(state => state.auth.user);
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const isEditing = !!id;

  useEffect(() => {
    if (currentUser && !isEditing) {
      form.setFieldsValue({
        customer: currentUser.id
      });
    }
  }, [currentUser, isEditing, form]);

  useEffect(() => {
    if (isEditing) {
      setLoading(true);
      api
        .get(`/invoices/${id}`)
        .then(response => {
          const data = response.data;
          form.setFieldsValue({
            customer: data.customer._id,
            invoiceDate: dayjs(data.invoiceDate),
            dueDate: dayjs(data.dueDate),
            status: data.status,
            items: data.items,
          });
        })
        .catch(error => {
          notification.error({
            message: 'Failed',
            description: 'Failed To Load Invoice'
          });
        })
        .finally(() => setLoading(false));
    }
  }, [id, isEditing, form]);

  const onFinish = async values => {
    try {
      const payload = {
        ...values,
        invoiceDate: values.invoiceDate.format('YYYY-MM-DD'),
        dueDate: values.dueDate.format("YYYY-MM-DD")
      };

      if (isEditing) {
        await api.put(`/invoices/${id}`, payload);
        notification.success({
          message: 'Success',
          description: 'Invoice updated successfully',
        })
      } else {
        await api.post('/invoices', payload);
        notification.success({
          message: 'Success',
          description: 'Invoice created successfully',
        })
      }

      form.resetFields();
      navigate('/invoices');
    } catch (error) {
      notification.error({
        message: 'Failed',
        description: 'Something went wrong'
      });
    }
  };

  if (loading) {
    return <Spin />;
  }

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={onFinish}
    >
      <Form.Item
        name="customer"
        label="Customer"
        // rules={[{ required: true }]}
      >
        <Select placeholder="Select customer" disabled={!isEditing}>
          {currentUser && (
            <Select.Option key={currentUser.id} value={currentUser.id}>
              {currentUser.name}
            </Select.Option>
          )}
        </Select>
      </Form.Item>

      <Form.Item
        name="invoiceDate"
        label="Invoice Date"
        rules={[{ required: true }]}
      >
        <DatePicker />
      </Form.Item>

      <Form.Item 
        name="dueDate"
        label="Due Date"
        rules={[{required: true}]}
      >
         <DatePicker />
      </Form.Item>

      <Form.Item
        name="status"
        label="Status"
        initialValue="PENDING"
      >
        <Select placeholder="Select status">
          <Select.Option value="PENDING">Pending</Select.Option>
          <Select.Option value="CONFIRMED">Confirmed</Select.Option>
          <Select.Option value="PAID">Paid</Select.Option>
          <Select.Option value="CANCELLED">Cancelled</Select.Option>
        </Select>
      </Form.Item>

      <Form.List name="items" initialValue={[{}]}>
        {(fields, { add, remove }) => (
          <>
            {fields.map(({ key, name }) => (
              <div key={key} style={{ display: 'flex', gap: 10, justifyContent: 'space-between' }}>
                <Form.Item
                  name={[name, 'name']}
                  label="Item Name"
                  rules={[{ required: true }]}
                >
                  <Input placeholder='item name' />
                </Form.Item>

                <Form.Item
                  name={[name, 'quantity']}
                  label="Quantity"
                  rules={[{ required: true }]}
                >
                  <InputNumber min={1} placeholder='Qty' />
                </Form.Item>

                <Form.Item
                  name={[name, 'rate']}
                  label="Rate"
                  rules={[{ required: true }]}
                >
                  <InputNumber min={0} placeholder='Rate' />
                </Form.Item>

                <MinusCircleOutlined
                  onClick={() => remove(name)}
                  style={{ marginTop: 35 }}
                />
              </div>
            ))}

            <Button
              type="dashed"
              onClick={() => add()}
              icon={<PlusOutlined />}
              style={{ marginTop: 16, width: '100%' }}
            >
              Add Item
            </Button>
          </>
        )}
      </Form.List>

      <Button type="primary" htmlType="submit" style={{ marginTop: 16, width: '100%' }}>
        {isEditing ? 'Update Invoice' : 'Create Invoice'}
      </Button>
    </Form>
  );
}
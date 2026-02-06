import "@ant-design/v5-patch-for-react-19"
import {
  Form,
  Input,
  Button,
  Select,
  DatePicker,
  InputNumber,
  notification,
  message,
  Spin,
} from 'antd';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { fetchCustomers } from '../features/customer/customer.slice';
import { useParams, useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';

export default function CreateInvoice() {
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const customers = useSelector(state => state.customers.list);
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const isEditing = !!id;

  useEffect(() => {
    dispatch(fetchCustomers());
  }, [dispatch]);

  useEffect(() => {
    if (isEditing) {
      setLoading(true);
      axios
        .get(`/api/invoices/${id}`)
        .then(response => {
          const data = response.data;
          form.setFieldsValue({
            customer: data.customer._id,
            invoiceDate: dayjs(data.invoiceDate),
            items: data.items,
          });
        })
        .catch(error => {
          //message.error('Failed to load invoice');
          notification.error({
            message: ' Failed',
            description: 'Failed To Load Invoice'
          });
          console.error(error);
        })
        .finally(() => setLoading(false));
    }
  }, [id, isEditing, form]);

  const onFinish = async values => {
    try {
      const payload = {
        ...values,
        invoiceDate: values.invoiceDate.format('YYYY-MM-DD'),
      };

      if (isEditing) {
        await axios.put(`/api/invoices/${id}`, payload);
        // message.success('Invoice updated successfully');
        notification.success({
          message: 'Success',
          description: 'Invoice updated successfully',
        })
      } else {
        await axios.post('/api/invoices', payload);
        //message.success('Invoice created successfully');
        notification.success({
          message: 'Success',
          description: 'Invoice created successfully',
        })
      }

      form.resetFields();
      navigate('/invoices');
    } catch (error) {
      //message.error(error.response?.data?.message || 'Something went wrong');
      notification.error({
            message: ' Failed',
            description: 'Something went wrong'
          });
      console.error(error);
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
        rules={[{ required: true }]}
      >
        <Select placeholder="Select customer">
          {customers.map(c => (
            <Select.Option key={c._id} value={c._id}>
              {c.name}
            </Select.Option>
          ))}
        </Select>
      </Form.Item>

      <Form.Item
        name="invoiceDate"
        label="Invoice Date"
        rules={[{ required: true }]}
      >
        <DatePicker />
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
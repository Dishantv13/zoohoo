import {
  Form,
  Input,
  Button,
  Select,
  DatePicker,
  InputNumber,
} from 'antd';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect } from 'react';
import axios from 'axios';
import { fetchCustomers } from '../features/customer/customer.slice';

export default function CreateInvoice() {
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const customers = useSelector(state => state.customers.list);

  useEffect(() => {
    dispatch(fetchCustomers());
  }, [dispatch]);

  const onFinish = async values => {
    const payload = {
      ...values,
      invoiceDate: values.invoiceDate.format('YYYY-MM-DD'),
    };

    await axios.post('/api/invoices', payload);

    form.resetFields(); 
  };

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
              <div key={key} style={{ display: 'flex', gap: 10 }}>
                <Form.Item
                  name={[name, 'name']}
                  label="Item Name"
                  rules={[{ required: true }]}
                  placeholder="Item name"
                >
                  <Input placeholder='item name'/>
                </Form.Item>

                <Form.Item
                  name={[name, 'quantity']}
                  label="Quantity"
                  rules={[{ required: true }]}
                >
                  <InputNumber min={1} placeholder='Qty'/>
                </Form.Item>

                <Form.Item
                  name={[name, 'rate']}
                  label="Rate"
                  rules={[{ required: true }]}
                >
                  <InputNumber min={0} placeholder='Rate'/>
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
            >
              Add Item
            </Button>
          </>
        )}
      </Form.List>

      <Button type="primary" htmlType="submit" style={{ marginTop: 16 }}>
        Create Invoice
      </Button>
    </Form>
  );
}

import { Table, Select, Spin, Typography } from 'antd';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchInvoices } from '../features/invoice/invoice.slice';
import { fetchCustomers } from '../features/customer/customer.slice';
import dayjs from 'dayjs';

const { Option } = Select;
const { Title } = Typography;

export default function InvoiceList() {
  const dispatch = useDispatch();
  const { list: invoices, loading } = useSelector(state => state.invoices);
  const customers = useSelector(state => state.customers.list);

  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    dispatch(fetchInvoices());
    dispatch(fetchCustomers());
  }, [dispatch]);


  // Filter invoices by customer
  const filteredInvoices = selectedCustomer
    ? invoices.filter(inv => inv.customer?._id === selectedCustomer)
    : invoices;

  const columns = [
    {
      title: 'Invoice No',
      dataIndex: 'invoiceNumber',
      key: 'invoiceNumber',
    },
    {
      title: 'Customer',
      dataIndex: ['customer', 'name'],
      key: 'customer',
    },
    {
      title: 'Invoice Date',
      dataIndex: 'invoiceDate',
      key: 'invoiceDate',
      render: date => dayjs(date).format('DD MMM YYYY'),
    },
    // {
    //   title: 'items',
    //   dataIndex: 'items',
    //   key: 'item'
    // },
    {
      title: 'Subtotal (₹)',
      dataIndex: 'subtotal',
      key: 'subtotal',
      render: val => `₹${val}`,
    },
    {
      title: 'Tax (18%)',
      dataIndex: 'tax',
      key: 'tax',
      render: val => `₹${val}`
    },
    {
      title: 'Total Amount (₹)',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      render:  val => `₹${val}`
    },
  ];

  return (
    <>
      <Title level={3}>Invoice List</Title>

      <Select
        placeholder="Filter by customer"
        allowClear
        style={{ width: 300, marginBottom: 16 }}
        onChange={value => setSelectedCustomer(value)}
      >
        {customers.map(c => (
          <Option key={c._id} value={c._id}>
            {c.name}
          </Option>
        ))}
      </Select>

      <Spin spinning={loading}>
        <Table
          columns={columns}
          dataSource={filteredInvoices}
          rowKey="_id"
          pagination={{
            current: page,
            pageSize: 5,
            onChange: p => setPage(p),
          }}
        />
      </Spin>
    </>
  );
}

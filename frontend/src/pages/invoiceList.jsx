import "@ant-design/v5-patch-for-react-19"
import {
  Table,
  Button,
  Space,
  Popconfirm,
  notification,
  Select,
  Spin,
  message,
} from 'antd';
import axios from 'axios';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useEffect,useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchInvoices } from '../features/invoice/invoice.slice';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { fetchCustomers } from "../features/customer/customer.slice";

const { Option } = Select;


export default function InvoiceList() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  // const invoices = useSelector(state => state.invoices.list);
  const customers = useSelector(state => state.customers.list);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const { list: invoices, loading } = useSelector(state => state.invoices);
  const [page, setPage] = useState(1);

  useEffect(() => {
    dispatch(fetchInvoices());
    dispatch(fetchCustomers())
  }, [dispatch]);

  const filteredInvoices = selectedCustomer
    ? invoices.filter(inv => inv.customer?._id === selectedCustomer)
    : invoices;
    
  const handleEdit = (invoice) => {
    navigate(`/invoices/${invoice._id}`);
  };

  const handleDelete = async (id) => {
    await axios.delete(`/api/invoices/${id}`);
    //message.success('Invoice deleted');
    notification.success({
          message: 'Success',
          description: 'Invoice deleted successfully',
        })
    dispatch(fetchInvoices());
  };

  const columns = [
    {
      title: 'Invoice No',
      dataIndex: 'invoiceNumber',
    },
    {
      title: 'Customer',
      // dataIndex: ['customer', 'name'],
      render: (_, r) => r.customer?.name,
    },
    {
      title: 'Date',
      dataIndex: 'invoiceDate',
      render: d => dayjs(d).format('DD MMM YYYY'),
    },
    {
      title: "subTotal",
      dataIndex: "subtotal",
      render: v => `₹${v}`,
    },
     {
      title: "Tax",
      dataIndex: "tax",
      render: v => `₹${v}`,
    },
    {
      title: 'Total',
      dataIndex: 'totalAmount',
      render: v => `₹${v}`,
    },
    
    {
      title: 'Action',
      render: (_, record) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            Edit
          </Button>

          <Popconfirm
            title="Are You Sure You Want Delete invoice?"
            onConfirm={() => handleDelete(record._id)}
          >
            <Button danger icon={<DeleteOutlined />}>
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    }
  ];

  return (
    <>
      <Button
        type="primary"
        onClick={() => navigate('/create-invoice')}
        style={{ marginBottom: 16 }}
      >
        Create Invoice
      </Button>

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
            pageSize: 10,
            onChange: p => setPage(p),
          }}
        />
      </Spin>
    </>
  );
}

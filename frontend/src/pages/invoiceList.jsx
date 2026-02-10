import "@ant-design/v5-patch-for-react-19"
import {
  Table,
  Button,
  Space,
  Popconfirm,
  notification,
  Spin,
  Tag,
  Flex,
  Card,
  Statistic,
  Row,
  Col,
  Dropdown,
  Modal,
  Select,
} from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchInvoices } from '../features/invoice/invoice.slice';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import api from '../service/api';


export default function InvoiceList() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { list: invoices, loading } = useSelector(state => state.invoices);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState(null);

  useEffect(() => {
    dispatch(fetchInvoices());
  }, [dispatch]);
    
  const handleEdit = (invoice) => {
    navigate(`/invoices/${invoice._id}`);
  };

  const handleDelete = async (id) => {
    await api.delete(`/invoices/${id}`);
    //message.success('Invoice deleted');
    notification.success({
          message: 'Success',
          description: 'Invoice deleted successfully',
        })
    dispatch(fetchInvoices());
  };

  const handleStatusChange = async (invoiceId, newStatus) => {
    if (newStatus === 'CANCELLED') {
      Modal.confirm({
        title: 'Cancel Invoice?',
        content: 'This will permanently delete the invoice. Are you sure?',
        okText: 'Yes, Delete',
        okType: 'danger',
        cancelText: 'No',
        onOk: async () => {
          try {
            await api.delete(`/invoices/${invoiceId}`);
            notification.success({
              message: 'Success',
              description: 'Invoice cancelled and deleted successfully',
            });
            dispatch(fetchInvoices());
          } catch (error) {
            notification.error({
              message: 'Failed',
              description: 'Failed to delete invoice',
            });
          }
        },
      });
      return;
    }

    try {
      await api.patch(`/invoices/${invoiceId}/status`, { status: newStatus });
      notification.success({
        message: 'Success',
        description: `Invoice status updated to ${newStatus}`,
      });
      dispatch(fetchInvoices());
    } catch (error) {
      notification.error({
        message: 'Failed',
        description: 'Failed to update invoice status',
      });
    }
  };

  const totalAmount = invoices.reduce((sum, invoice) => sum + (invoice.totalAmount || 0), 0);
  const totalSubtotal = invoices.reduce((sum, invoice) => sum + (invoice.subtotal || 0), 0);
  const totalTax = invoices.reduce((sum, invoice) => sum + (invoice.tax || 0), 0);

  const paidAmount = invoices
    .filter(invoice => invoice.status === 'PAID')
    .reduce((sum, invoice) => sum + (invoice.totalAmount || 0), 0);
  
  const pendingAmount = invoices
    .filter(invoice => invoice.status === 'PENDING')
    .reduce((sum, invoice) => sum + (invoice.totalAmount || 0), 0);
  
  const confirmedAmount = invoices
    .filter(invoice => invoice.status === 'CONFIRMED')
    .reduce((sum, invoice) => sum + (invoice.totalAmount || 0), 0);

  const filteredInvoices = statusFilter
    ? invoices.filter(invoice => invoice.status === statusFilter)
    : invoices;

  const columns = [
    {
      title: 'Invoice No',
      dataIndex: 'invoiceNumber',
      render: (val) => (
        <Flex align="center" gap="small">
          <Tag color="red">{val}</Tag>
        </Flex>
      ),
    },
    {
      title: 'Customer',
      render: (_, r) => {
        const name = r.customer?.name;

        if (!name) {
          return <Tag color="default">UNKNOWN</Tag>;
        }
        return (
          <Tag color="">
            {name.toUpperCase()}
          </Tag>
        );
      }

    },
    {
      title: 'Date',
      dataIndex: 'invoiceDate',
      render: d => dayjs(d).format('DD MMM YYYY'),
    },
    {
    title: 'Due Date',
    dataIndex: 'dueDate',
    render: (date) => dayjs(date).format('DD MMM YYYY')
    },
    {      
      title: 'Status',
      dataIndex: 'status',
      render: (status) => {
        const statusColors = {
          PENDING: 'orange',
          CONFIRMED: 'blue',
          PAID: 'green',
          CANCELLED: 'red'
        };
        return <Tag color={statusColors[status] || 'default'}>{status || 'PENDING'}</Tag>;
      }
    },
    {
    title: "Sub Total",
    dataIndex: "subtotal",
    render: (v = 0) => (
      <Flex align="center" gap="small">
        <Tag color="blue">₹{Number(v).toFixed(2)}</Tag>
      </Flex>
    ),
    },

    {
      title: "Tax (18%)",
      dataIndex: "tax",
      render: (v = 0) => (
      <Flex align="center" gap="small">
        <Tag color="orange">₹{Number(v).toFixed(2)}</Tag>
      </Flex>
    ),
    },
    {
      title: 'Total Amount',
      dataIndex: 'totalAmount',
      render: (v = 0) => (
      <Flex align="center" gap="small">
        <Tag color="blue">₹{Number(v).toFixed(2)}</Tag>
      </Flex>
    ),
    },
    
    {
      title: 'Action',
      render: (_, record) => {
        const statusMenuItems = [
          {
            key: 'PENDING',
            label: 'Pending',
            onClick: () => handleStatusChange(record._id, 'PENDING'),
          },
          {
            key: 'CONFIRMED',
            label: 'Confirmed',
            onClick: () => handleStatusChange(record._id, 'CONFIRMED'),
          },
          {
            key: 'PAID',
            label: 'Paid',
            onClick: () => handleStatusChange(record._id, 'PAID'),
          },
          {
            key: 'CANCELLED',
            label: '🗑️ Cancel & Delete',
            danger: true,
            onClick: () => handleStatusChange(record._id, 'CANCELLED'),
          },
        ];

        return (
          <Space>
            <Dropdown menu={{ items: statusMenuItems }} placement="bottomLeft">
              <Button>Change Status</Button>
            </Dropdown>

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
        );
      },
    }
  ];

  return (
    <>
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Pending Amount"
              value={pendingAmount.toFixed(2)}
              prefix="₹"
              valueStyle={{ color: '#faad14', fontSize: '20px' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Confirmed Amount"
              value={confirmedAmount.toFixed(2)}
              prefix="₹"
              valueStyle={{ color: '#1890ff', fontSize: '20px' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Paid Amount"
              value={paidAmount.toFixed(2)}
              prefix="₹"
              valueStyle={{ color: '#52c41a', fontSize: '20px' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Amount"
              value={totalAmount.toFixed(2)}
              prefix="₹"
              valueStyle={{ color: '#1890ff', fontSize: '20px' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={24}>
          <Space>
            <Button
              type="primary"
              onClick={() => navigate('/create-invoice')}
            >
              Create Invoice
            </Button>

            <Select
              placeholder="Filter by Status"
              style={{ width: 200 }}
              allowClear
              value={statusFilter}
              onChange={setStatusFilter}
              options={[
                { value: null, label: '📋 All Status' },
                { value: 'PENDING', label: '🟡 Pending' },
                { value: 'CONFIRMED', label: '🔵 Confirmed' },
                { value: 'PAID', label: '🟢 Paid' },
              ]}
            />
          </Space>
        </Col>
      </Row>

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

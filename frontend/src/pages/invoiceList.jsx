import "@ant-design/v5-patch-for-react-19";
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
} from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  CreditCardOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchInvoices } from "../features/invoice/invoice.slice";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import api from "../service/api";
import PaymentModal from "../components/PaymentModal";

export default function InvoiceList() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const {
    list: invoices,
    loading,
    pagination,
    summary,
  } = useSelector((state) => state.invoices);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(pagination?.limit || 5);
  const [statusFilter, setStatusFilter] = useState(null);
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [selectedInvoiceForPayment, setSelectedInvoiceForPayment] =
    useState(null);

  useEffect(() => {
    dispatch(fetchInvoices({ page, limit: pageSize }));
  }, [dispatch, page, pageSize]);

  const handleEdit = (invoice) => {
    navigate(`/invoices/${invoice._id}`);
  };

  const handleDelete = async (id) => {
    await api.delete(`/invoices/${id}`);
    notification.success({
      message: "Success",
      description: "Invoice deleted successfully",
    });
    dispatch(fetchInvoices({ page, limit: pageSize }));
  };

  const handlePaymentClick = (invoice) => {
    if (invoice.status === "PAID") {
      notification.warning({
        message: "Already Paid",
        description: "This invoice has already been paid",
      });
      return;
    }
    setSelectedInvoiceForPayment(invoice);
    setPaymentModalVisible(true);
  };

  const handlePaymentSuccess = () => {
    notification.success({
      message: "Success",
      description: "Invoice marked as PAID",
    });
    dispatch(fetchInvoices({ page, limit: pageSize }));
    setPaymentModalVisible(false);
  };

  const handleTableChange = (paginationInfo) => {
    setPage(paginationInfo.current);
    setPageSize(paginationInfo.pageSize);
  };

  const handleStatusChange = async (invoiceId, newStatus) => {
    if (newStatus === "CANCELLED") {
      Modal.confirm({
        title: "Cancel Invoice?",
        content: "This will permanently delete the invoice. Are you sure?",
        okText: "Yes, Delete",
        okType: "danger",
        cancelText: "No",
        onOk: async () => {
          try {
            await api.delete(`/invoices/${invoiceId}`);
            notification.success({
              message: "Success",
              description: "Invoice cancelled and deleted successfully",
            });
            dispatch(fetchInvoices({ page, limit: pageSize }));
          } catch (error) {
            notification.error({
              message: "Failed",
              description: "Failed to delete invoice",
            });
          }
        },
      });
      return;
    }

    try {
      await api.patch(`/invoices/${invoiceId}/status`, { status: newStatus });
      notification.success({
        message: "Success",
        description: `Invoice status updated to ${newStatus}`,
      });
      dispatch(fetchInvoices({ page, limit: pageSize }));
    } catch (error) {
      notification.error({
        message: "Failed",
        description: "Failed to update invoice status",
      });
    }
  };

  const summaryData = summary || {};

  const totalAmount = summaryData.totalAmount || 0;
  const paidAmount = summaryData.paidAmount || 0;
  const pendingAmount = summaryData.pendingAmount || 0;
  const confirmedAmount = summaryData.confirmedAmount || 0;
  const overdueCount = summaryData.overdueCount || 0;

  const filteredInvoices = statusFilter
    ? invoices.filter((invoice) => invoice.status === statusFilter)
    : invoices;

  const columns = [
    {
      title: "Invoice No",
      dataIndex: "invoiceNumber",
      width: 100,
      render: (val) => (
        <Flex align="center" gap="small">
          <Tag color="red">{val}</Tag>
        </Flex>
      ),
    },
    {
      title: "Customer",
      width: 100,
      render: (_, r) => {
        const name = r.customer?.name;

        if (!name) {
          return <Tag color="default">UNKNOWN</Tag>;
        }
        return <Tag color="pink">{name.toUpperCase()}</Tag>;
      },
    },
    {
      title: "Date",
      dataIndex: "invoiceDate",
      width: 100,
      render: (d) => {
        const date = dayjs(d).format("DD MMM YYYY");
        return (
          <Flex align="center" gap="small">
            <Tag color="cyan">{date}</Tag>
          </Flex>
        );
      },
    },
    {
      title: "Due Date",
      dataIndex: "dueDate",
      width: 100,
      render: (d, record) => {
        const date = dayjs(d).format("DD MMM YYYY");
        const isPastDue = dayjs(d).isBefore(dayjs(), "day");
        const isUnpaid =
          record.status !== "PAID" && record.status !== "CANCELLED";
        return (
          <Flex vertical align="flex-start" gap="small">
            <Tag color="red">{date}</Tag>
            {isPastDue && isUnpaid && (
              <Tag color="volcano" icon={<WarningOutlined />}>
                Overdue
              </Tag>
            )}
          </Flex>
        );
      },
    },
    {
      title: "Status",
      dataIndex: "status",
      width: 100,
      render: (status) => {
        const statusColors = {
          PENDING: "orange",
          CONFIRMED: "blue",
          PAID: "green",
          CANCELLED: "red",
        };
        return (
          <Tag color={statusColors[status] || "default"}>
            {status || "PENDING"}
          </Tag>
        );
      },
    },
    {
      title: "Sub Total",
      dataIndex: "subtotal",
      width: 120,
      render: (v = 0) => (
        <Flex align="center" gap="small">
          <Tag color="blue">₹{Number(v).toFixed(2)}</Tag>
        </Flex>
      ),
    },

    {
      title: (
        <div style={{ lineHeight: "1.2" }}>
          <div>Discount</div>
          <div>Rate (%)</div>
        </div>
      ),
      dataIndex: "parseDiscount",
      width: 100,
      render: (v = 0) => (
        <Flex align="center" gap="small">
          <Tag color="cyan">{Number(v).toFixed(2)}%</Tag>
        </Flex>
      ),
    },
    {
      title: "Discount",
      dataIndex: "discount",
      width: 120,
      render: (v = 0) => (
        <Flex align="center" gap="small">
          <Tag color="red">₹{Number(v).toFixed(2)}</Tag>
        </Flex>
      ),
    },
    {
      title: (
        <div style={{ lineHeight: "1.2" }}>
          Amount After <br />
          Discount
        </div>
      ),
      dataIndex: "amountAfterDiscount",
      width: 120,
      render: (v = 0) => (
        <Flex align="center" gap="small">
          <Tag color="purple">₹{Number(v).toFixed(2)}</Tag>
        </Flex>
      ),
    },
    {
      title: (
        <div style={{ lineHeight: "1.2" }}>
          <div>Tax</div>
          <div>Rate (%)</div>
        </div>
      ),
      dataIndex: "parseTaxRate",
      width: 100,
      render: (v = 0) => (
        <Flex align="center" gap="small">
          <Tag color="cyan">{Number(v).toFixed(2)}%</Tag>
        </Flex>
      ),
    },

    {
      title: "Tax",
      dataIndex: "tax",
      width: 120,
      render: (v = 0) => (
        <Flex align="center" gap="small">
          <Tag color="orange">₹{Number(v).toFixed(2)}</Tag>
        </Flex>
      ),
    },
    {
      title: "Total Amount",
      dataIndex: "totalAmount",
      width: 120,
      render: (v = 0) => (
        <Flex align="center" gap="small">
          <Tag color="blue">₹{Number(v).toFixed(2)}</Tag>
        </Flex>
      ),
    },

    {
      title: "Action",
      width: 400,
      render: (_, record) => {
        if (record.status === "PAID") {
          return (
            <Tag
              color="green"
              style={{
                padding: "8px 16px",
                fontSize: "14px",
                fontWeight: "bold",
              }}
            >
              ✓ PAID
            </Tag>
          );
        }

        const statusMenuItems = [
          {
            key: "PENDING",
            label: "Pending",
            onClick: () => handleStatusChange(record._id, "PENDING"),
          },
          {
            key: "CONFIRMED",
            label: "Confirmed",
            onClick: () => handleStatusChange(record._id, "CONFIRMED"),
          },
          {
            key: "CANCELLED",
            label: "🗑️ Cancel & Delete",
            danger: true,
            onClick: () => handleStatusChange(record._id, "CANCELLED"),
          },
        ];

        return (
          <Space wrap>
            <Button
              type="primary"
              size="small"
              icon={<CreditCardOutlined />}
              onClick={() => handlePaymentClick(record)}
            >
              Pay Now
            </Button>

            <Dropdown menu={{ items: statusMenuItems }} placement="bottomLeft">
              <Button size="small">Status</Button>
            </Dropdown>

            <Button
              size="small"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            >
              Edit
            </Button>

            <Popconfirm
              title="Delete this invoice?"
              onConfirm={() => handleDelete(record._id)}
            >
              <Button danger size="small" icon={<DeleteOutlined />}>
                Delete
              </Button>
            </Popconfirm>
          </Space>
        );
      },
    },
  ];

  return (
    <>
      <Row gutter={25} style={{ marginBottom: 24 }}>
        <Col span={4}>
          <Card>
            <Statistic
              title="Overdue Invoices"
              value={overdueCount}
              prefix={<WarningOutlined />}
              valueStyle={{ color: "#fa541c", fontSize: "20px" }}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic
              title="Pending Amount"
              value={pendingAmount.toFixed(2)}
              prefix="₹"
              valueStyle={{ color: "#faad14", fontSize: "20px" }}
            />
          </Card>
        </Col>

        <Col span={4}>
          <Card>
            <Statistic
              title="Confirmed Amount"
              value={confirmedAmount.toFixed(2)}
              prefix="₹"
              valueStyle={{ color: "#1890ff", fontSize: "20px" }}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic
              title="Paid Amount"
              value={paidAmount.toFixed(2)}
              prefix="₹"
              valueStyle={{ color: "#52c41a", fontSize: "20px" }}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic
              title="Total Amount"
              value={totalAmount.toFixed(2)}
              prefix="₹"
              valueStyle={{ color: "#1890ff", fontSize: "20px" }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={24}>
          <Space>
            <Button type="primary" onClick={() => navigate("/create-invoice")}>
              Create Invoice
            </Button>

            <Select
              placeholder="Filter by Status"
              style={{ width: 200 }}
              allowClear
              value={statusFilter}
              onChange={setStatusFilter}
              options={[
                { value: null, label: "📋 All Status" },
                { value: "PENDING", label: "🟡 Pending" },
                { value: "CONFIRMED", label: "🔵 Confirmed" },
                { value: "PAID", label: "🟢 Paid" },
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
          onChange={handleTableChange}
          pagination={{
            current: page,
            pageSize: pageSize,
            total: pagination.totalItems,
            showQuickJumper: true,
            showSizeChanger: true,
            pageSizeOptions: [5, 10, 20, 50],
          }}
        />
      </Spin>

      <PaymentModal
        invoice={selectedInvoiceForPayment}
        visible={paymentModalVisible}
        onClose={() => setPaymentModalVisible(false)}
        onPaymentSuccess={handlePaymentSuccess}
      />
    </>
  );
}

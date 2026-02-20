import "@ant-design/v5-patch-for-react-19";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Table,
  Card,
  notification,
  Select,
  Button,
  Space,
  Tag,
  Drawer,
  Empty,
  Statistic,
  Row,
  Col,
  Alert,
  Spin,
  Modal,
  Form,
  DatePicker,
  Flex,
  Tooltip,
} from "antd";
import {
  EyeOutlined,
  FilePdfOutlined,
  DeleteOutlined,
  EditOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import { invoiceAPI } from "../service/invoiceAPI";
import { authAPI } from "../service/authAPI";
import dayjs from "dayjs";
import "./InvoiceManagement.css";

export default function AdminInvoiceManagement() {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [summary, setSummary] = useState({
    totalAmount: 0,
    paidAmount: 0,
    pendingAmount: 0,
    confirmedAmount: 0,
    overdueCount: 0,
    totalInvoices: 0,
  });
  const [statusFilters, setStatusFilters] = useState({
    status: null,
  });

  const handleTableChange = (paginationInfo) => {
    setPage(paginationInfo.current);
    setPageSize(paginationInfo.pageSize);
  };

  if (!user || user.role !== "admin") {
    return (
      <Card>
        <Empty description="Admin access only. Please login as admin." />
      </Card>
    );
  }

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await authAPI.getCustomers({ limit: 1000 });
        const customersData = response.data?.customers || response.data || [];
        setCustomers(Array.isArray(customersData) ? customersData : []);
      } catch (error) {
        console.error("Failed to fetch customers:", error);
      }
    };
    fetchCustomers();
  }, []);

  const fetchInvoices = async (page = 1, customerId = null) => {
    setLoading(true);
    try {
      let response;
      if (customerId) {
        response = await invoiceAPI.getCustomerInvoices(customerId, {
          page,
          limit: pageSize,
          status: statusFilters.status,
        });
      } else {
        response = await invoiceAPI.getAdminAllInvoices({
          page,
          limit: pageSize,
          status: statusFilters.status,
        });
      }

      setInvoices(response.data.data || []);
      setPagination({
        current: response.data.pagination.page,
        pageSize: response.data.pagination.limit,
        total: response.data.pagination.totalItems,
      });
      setSummary(response.data.summary);
    } catch (error) {
      notification.error({
        message: "Error",
        description:
          error.response?.data?.message || "Failed to fetch invoices",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices(page, selectedCustomer);
  }, [page, pageSize, statusFilters.status, selectedCustomer]);

  const handleViewDetails = (invoice) => {
    setSelectedInvoice(invoice);
    setIsDrawerVisible(true);
  };

  const handleDownload = async (invoiceId, invoiceNumber) => {
    try {
      const response = await invoiceAPI.downloadInvoice(invoiceId);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `invoice-${invoiceNumber || "unknown"}.pdf`,
      );
      document.body.appendChild(link);
      link.click();
      link.parentElement.removeChild(link);
    } catch (error) {
      notification.error({
        message: "Error",
        description: "Failed to download invoice",
      });
    }
  };

  const handleEdit = (invoice) => {
    navigate("/create-invoice", { state: { invoice } });
  };

  //   const handleQuickEdit = (invoice) => {
  //     setSelectedInvoice(invoice);
  //     form.setFieldsValue({
  //       status: invoice.status,
  //       invoiceDate: dayjs(invoice.invoiceDate),
  //       dueDate: dayjs(invoice.dueDate),
  //     });
  //     setIsEditModalVisible(true);
  //   };

  const handleUpdateInvoice = async (values) => {
    try {
      setLoading(true);
      await invoiceAPI.updateInvoice(selectedInvoice._id, {
        status: values.status,
        invoiceDate: values.invoiceDate.toDate(),
        dueDate: values.dueDate.toDate(),
      });
      notification.success({
        message: "Success",
        description: "Invoice updated successfully",
      });
      setIsEditModalVisible(false);
      form.resetFields();
      fetchInvoices(page, selectedCustomer);
    } catch (error) {
      notification.error({
        message: "Error",
        description:
          error.response?.data?.message || "Failed to update invoice",
      });
    } finally {
      setLoading(false);
    }
  };

  const statusColors = {
    PAID: "green",
    CONFIRMED: "blue",
    PENDING: "orange",
    CANCELLED: "red",
  };

  const columns = [
    {
      title: "Invoice #",
      dataIndex: "invoiceNumber",
      key: "invoiceNumber",
      width: 100,
      render: (text) => (
        <Flex align="center" gap="small">
          <Tag color="red">{text}</Tag>
        </Flex>
      ),
    },
    {
      title: "Customer",
      dataIndex: ["customer", "name"],
      key: "customer",
      width: 100,
      render: (_, r) => {
        const isCreatedByCustomer = r.createdBy?._id === r.customer?._id;
        const creatorName = isCreatedByCustomer
          ? r.customer?.name
          : r.createdBy?.name;

        if (!creatorName) {
          return <Tag color="default">UNKNOWN</Tag>;
        }

        const tagColor = isCreatedByCustomer ? "pink" : "purple";
        return (
          <Flex align="center" gap="2px">
            <Tag color={tagColor}>{creatorName.toUpperCase()}</Tag>
          </Flex>
        );
      },
    },
    {
      title: "Email",
      dataIndex: ["customer", "email"],
      key: "email",
      width: 150,
      render: (text) => (
        <Flex align="center" gap="small">
          <Tag color="blue">{text}</Tag>
        </Flex>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (status) => (
        <Tag color={statusColors[status] || "default"}>{status}</Tag>
      ),
    },
    {
      title: "Invoice Date",
      dataIndex: "invoiceDate",
      key: "invoiceDate",
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
      key: "dueDate",
      width: 100,
      render: (d, record) => {
        const date = dayjs(d).format("DD MMM YYYY");
        const isPastDue = dayjs(d).isBefore(dayjs().startOf("start-day"));
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
      title: "Subtotal",
      dataIndex: "subtotal",
      key: "subtotal",
      width: 150,
      render: (amount) => (
        <Flex align="center" gap="small">
          <Tag color="blue">₹{amount?.toFixed(2)}</Tag>
        </Flex>
      ),
    },
    {
      title: "Discount",
      dataIndex: "discount",
      key: "discount",
      width: 150,
      render: (amount) => (
        <Flex align="center" gap="small">
          <Tag color="purple">₹{amount?.toFixed(2)}</Tag>
        </Flex>
      ),
    },
    {
      title: "Amount after Discount",
      dataIndex: "amountAfterDiscount",
      key: "amountAfterDiscount",
      width: 150,
      render: (amount) => (
        <Flex align="center" gap="small">
          <Tag color="geekblue">₹{amount?.toFixed(2)}</Tag>
        </Flex>
      ),
    },
    {
      title: "Tax",
      dataIndex: "tax",
      key: "tax",
      width: 150,
      render: (amount) => (
        <Flex align="center" gap="small">
          <Tag color="orange">₹{amount?.toFixed(2)}</Tag>
        </Flex>
      ),
    },
    {
      title: "Total Amount",
      dataIndex: "totalAmount",
      key: "totalAmount",
      width: 150,
      render: (amount) => (
        <Flex align="center" gap="small">
          <Tag color="green">₹{amount?.toFixed(2)}</Tag>
        </Flex>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      fixed: "right",
      width: 250,
      render: (_, record) => {
        const isCreatedByAdmin = record.createdBy?._id !== record.customer?._id;

        if (record.status === "PAID") {
          return (
            <Space wrap>
              <Tag
                color="green"
                style={{
                  padding: "8px 8px",
                  fontSize: "12px",
                  fontWeight: "bold ",
                }}
              >
                ✓ PAID
              </Tag>

              <Tooltip title="View Invoice">
                <Button
                  size="small"
                  icon={<EyeOutlined />}
                  onClick={() => handleViewDetails(record)}
                  style={{
                    borderRadius: "5px",
                    color: "black",
                  }}
                >
                  View
                </Button>
              </Tooltip>

              <Tooltip title="Download Invoice PDF">
                <Button
                  size="small"
                  icon={<FilePdfOutlined />}
                  onClick={() => handleDownload(record._id, record.invoiceNumber)}
                  style={{
                    borderRadius: "5px",
                    color: "green",
                  }}
                >
                  PDF
                </Button>
              </Tooltip>
            </Space>
          );
        }

        if (isCreatedByAdmin) {
          return (
            <Space wrap>
              <Tooltip title="View Invoice">
                <Button
                  size="small"
                  icon={<EyeOutlined />}
                  onClick={() => handleViewDetails(record)}
                  style={{
                    borderRadius: "5px",
                    color: "black",
                  }}
                >
                  View
                </Button>
              </Tooltip>

              <Tooltip title="Edit Invoice">
                <Button
                  size="small"
                  icon={<EditOutlined />}
                  onClick={() => handleEdit(record)}
                  style={{
                    borderRadius: "5px",
                    color: "blue",
                  }}
                >
                  Edit
                </Button>
              </Tooltip>

              <Tooltip title="Download Invoice PDF">
                <Button
                  icon={<FilePdfOutlined />}
                  size="small"
                  onClick={() => handleDownload(record._id, record.invoiceNumber)}
                  style={{
                    borderRadius: "5px",
                    color: "green",
                  }}
                >
                  PDF
                </Button>
              </Tooltip>
            </Space>
          );
        }
        return (
          <Space wrap>
            <Tooltip title="View Invoice">
              <Button
                size="small"
                icon={<EyeOutlined />}
                onClick={() => handleViewDetails(record)}
                style={{
                  borderRadius: "5px",
                  color: "black",
                }}
              >
                View
              </Button>
            </Tooltip>

            <Tooltip title="Download Invoice PDF">
              <Button
                size="small"
                icon={<FilePdfOutlined />}
                onClick={() => handleDownload(record._id, record.invoiceNumber)}
                style={{
                  borderRadius: "5px",
                  color: "green",
                }}
              >
                PDF
              </Button>
            </Tooltip>
          </Space>
        );
      },
    },
  ];

  return (
    <div className="invoice-management">
      <Row gutter={16} style={{ marginBottom: "24px" }}>
        <Col xs={24} sm={12} lg={4}>
          <Card>
            <Statistic
              title="Total Invoices"
              value={summary.totalInvoices || 0}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={4}>
          <Card>
            <Statistic
              title="Overdue Invoices"
              value={summary.overdueCount || 0}
              valueStyle={{ color: "#ff4d4f" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={5}>
          <Card>
            <Statistic
              title="Pending Amount"
              value={(summary.pendingAmount || 0).toFixed(2)}
              prefix="₹"
              valueStyle={{ color: "#faad14" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={5}>
          <Card>
            <Statistic
              title="Confirmed Amount"
              value={(summary.confirmedAmount || 0).toFixed(2)}
              prefix="₹"
              valueStyle={{ color: "#13c2c2" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={5}>
          <Card>
            <Statistic
              title="Paid Amount"
              value={(summary.paidAmount || 0).toFixed(2)}
              prefix="₹"
              valueStyle={{ color: "#13c2c2" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Amount"
              value={(summary.totalAmount || 0).toFixed(2)}
              prefix="₹"
              valueStyle={{ color: "#52c41a" }}
            />
          </Card>
        </Col>
      </Row>

      <Alert
        message="Company Invoice Management"
        description="This shows all invoices created by you and your customers. Invoices created by customers in their personal login are automatically visible here."
        type="info"
        showIcon
        style={{ marginBottom: "24px" }}
      />

      <Card
        title="Company Invoices"
        extra={
          <Space>
            <Select
              placeholder="Filter by Customer"
              style={{ width: 200 }}
              allowClear
              showSearch
              value={selectedCustomer || undefined}
              onChange={(value) => {
                setPage(1);
                setSelectedCustomer(value || null);
              }}
              filterOption={(input, option) =>
                (option?.label ?? "")
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
              options={customers.map((c) => ({
                label: `${c.name} (${c.email})`,
                value: c._id,
              }))}
            />
            <Select
              placeholder="Filter by Status"
              style={{ width: 150 }}
              allowClear
              value={statusFilters.status || undefined}
              onChange={(value) => {
                setPage(1);
                setStatusFilters({ ...statusFilters, status: value || null });
              }}
              options={[
                { label: "Pending", value: "PENDING" },
                { label: "Confirmed", value: "CONFIRMED" },
                { label: "Paid", value: "PAID" },
                { label: "Cancelled", value: "CANCELLED" },
              ]}
            />
          </Space>
        }
      >
        <Spin spinning={loading}>
          <Table
            columns={columns}
            dataSource={invoices.map((inv) => ({ ...inv, key: inv._id }))}
            rowKey="_id"
            onChange={handleTableChange}
            pagination={{
              current: page,
              pageSize: pageSize,
              total: pagination.total,
              showQuickJumper: true,
              showSizeChanger: true,
              pageSizeOptions: [5, 10, 20, 50],
              showTotal: (total, range) =>
                `Showing ${range[0]}-${range[1]} of ${total} invoices`,
              position: ["bottomRight"],
            }}
            scroll={{ x: "max-content" }}
            size="large"
          />
        </Spin>
      </Card>

      <Drawer
        title="Invoice Details"
        onClose={() => setIsDrawerVisible(false)}
        open={isDrawerVisible}
        width={500}
      >
        {selectedInvoice && (
          <div className="invoice-details">
            <div className="detail-section">
              <h3>Invoice Information</h3>
              <p>
                <strong>Invoice Number:</strong> {selectedInvoice.invoiceNumber}
              </p>
              <p>
                <strong>Status:</strong>{" "}
                <Tag color={statusColors[selectedInvoice.status]}>
                  {selectedInvoice.status}
                </Tag>
              </p>
              <p>
                <strong>Invoice Date:</strong>{" "}
                {new Date(selectedInvoice.invoiceDate).toLocaleDateString(
                  "en-IN",
                )}
              </p>
              <p>
                <strong>Due Date:</strong>{" "}
                {new Date(selectedInvoice.dueDate).toLocaleDateString("en-IN")}
              </p>
            </div>

            <div className="detail-section">
              <h3>Customer Details</h3>
              <p>
                <strong>Name:</strong> {selectedInvoice.customer?.name}
              </p>
              <p>
                <strong>Email:</strong> {selectedInvoice.customer?.email}
              </p>
              <p>
                <strong>Phone:</strong>{" "}
                {selectedInvoice.customer?.phonenumber || "N/A"}
              </p>
            </div>

            <div className="detail-section">
              <h3>Items</h3>
              {selectedInvoice.items && selectedInvoice.items.length > 0 ? (
                <table className="items-table">
                  <thead>
                    <tr>
                      <th>Item Name</th>
                      <th>Qty</th>
                      <th>Rate</th>
                      <th>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedInvoice.items.map((item, idx) => (
                      <tr key={idx}>
                        <td>{item.name}</td>
                        <td>{item.quantity}</td>
                        <td>₹{item.rate?.toFixed(2)}</td>
                        <td>₹{(item.quantity * item.rate)?.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p>No items</p>
              )}
            </div>

            <div className="detail-section">
              <h3>Amount Details</h3>
              <p>
                <strong>Subtotal:</strong> ₹
                {selectedInvoice.subtotal?.toFixed(2)}
              </p>
              <p>
                <strong>Discount:</strong> ₹
                {selectedInvoice.discount?.toFixed(2)} (
                {selectedInvoice.parseDiscount}%)
              </p>
              <p>
                <strong>Amount after Discount:</strong> ₹
                {selectedInvoice.amountAfterDiscount?.toFixed(2)}
              </p>
              <p>
                <strong>Tax:</strong> ₹{selectedInvoice.tax?.toFixed(2)} (
                {selectedInvoice.parseTaxRate}%)
              </p>
              <p style={{ fontSize: "16px", fontWeight: "bold" }}>
                <strong>Total Amount:</strong> ₹
                {selectedInvoice.totalAmount?.toFixed(2)}
              </p>
            </div>
          </div>
        )}
      </Drawer>

      <Modal
        title="Edit Invoice"
        open={isEditModalVisible}
        onCancel={() => {
          setIsEditModalVisible(false);
          form.resetFields();
        }}
        onOk={() => form.submit()}
        confirmLoading={loading}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleUpdateInvoice}
          autoComplete="off"
        >
          <Form.Item
            name="status"
            label="Invoice Status"
            rules={[{ required: true, message: "Please select status" }]}
          >
            <Select>
              <Select.Option value="PENDING">Pending</Select.Option>
              <Select.Option value="CONFIRMED">Confirmed</Select.Option>
              <Select.Option value="PAID">Paid</Select.Option>
              <Select.Option value="CANCELLED">Cancelled</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="invoiceDate"
            label="Invoice Date"
            rules={[{ required: true, message: "Please select invoice date" }]}
          >
            <DatePicker style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item
            name="dueDate"
            label="Due Date"
            rules={[{ required: true, message: "Please select due date" }]}
          >
            <DatePicker style={{ width: "100%" }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

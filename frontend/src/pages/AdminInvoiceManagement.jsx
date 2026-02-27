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
  Spin,
  Form,
  Flex,
  Tooltip,
} from "antd";
import {
  EyeOutlined,
  FilePdfOutlined,
  EditOutlined,
  WarningOutlined,
  SearchOutlined,
  DownloadOutlined,
  DollarOutlined,
} from "@ant-design/icons";
import { apiService } from "../service/apiService";
import CashPaymentModal from "../components/CashPaymentModal";
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
  const [isCashPaymentModalVisible, setIsCashPaymentModalVisible] =
    useState(false);
  const [selectedInvoiceForPayment, setSelectedInvoiceForPayment] =
    useState(null);
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
        const response = await apiService.getCustomers({ limit: 1000 });
        const customersData =
          response.data.data?.customers || response.data || [];
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
        response = await apiService.getCustomerInvoices(customerId, {
          page,
          limit: pageSize,
          status: statusFilters.status,
        });
      } else {
        response = await apiService.getAdminAllInvoices({
          page,
          limit: pageSize,
          status: statusFilters.status,
        });
      }
      const responseData = response.data.data || {};

      setInvoices(responseData.data || []);
      setPagination({
        current: responseData.pagination.page,
        pageSize: responseData.pagination.limit,
        total: responseData.pagination.totalItems,
      });
      setSummary(responseData.summary);
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
      setLoading(true);
      const response = await apiService.downloadInvoice(invoiceId);
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
    } finally {
      setLoading(false);
    }
  };

  const handleExportInvoices = async () => {
    try {
      setLoading(true);
      const params = {};

      if (selectedCustomer) {
        params.customerId = selectedCustomer;
      }
      if (statusFilters.status) {
        params.status = statusFilters.status;
      }

      const response = await apiService.exportInvoice(params);

      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;

      let filename = "invoices";
      if (selectedCustomer) {
        const customer = customers.find((c) => c._id === selectedCustomer);
        filename += `_${customer?.name?.replace(/\s+/g, "_") || "customer"}`;
      }
      if (statusFilters.status) {
        filename += `_${statusFilters.status.toLowerCase()}`;
      }
      filename += `_${new Date().toISOString().split("T")[0]}.xlsx`;

      link.download = filename;

      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      notification.success({
        message: "Success",
        description: "Invoices exported successfully",
      });
    } catch (error) {
      console.error("Export error:", error);
      notification.error({
        message: "Failed",
        description: "Failed to export invoices",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (invoice) => {
    navigate("/create-invoice", { state: { invoice } });
  };

  const handleCashPayment = (invoice) => {
    setSelectedInvoiceForPayment(invoice);
    setIsCashPaymentModalVisible(true);
  };

  const handleCashPaymentSuccess = () => {
    notification.success({
      message: "Success",
      description: "Cash payment recorded successfully",
    });
    fetchInvoices(page, selectedCustomer);
  };

  const statusColors = {
    PAID: "green",
    CONFIRMED: "blue",
    PENDING: "orange",
    PARTIALLY_PAID: "gold",
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
      title: "Amount Paid",
      dataIndex: "amountPaid",
      key: "amountPaid",
      width: 150,
      render: (amount = 0) => (
        <Flex align="center" gap="small">
          <Tag color="cyan">₹{amount?.toFixed(2)}</Tag>
        </Flex>
      ),
    },
    {
      title: "Remaining",
      dataIndex: "remainingAmount",
      key: "remainingAmount",
      width: 150,
      render: (amount = 0) => {
        const color = amount === 0 ? "green" : amount > 0 ? "gold" : "default";
        return (
          <Flex align="center" gap="small">
            <Tag color={color}>₹{amount?.toFixed(2)}</Tag>
          </Flex>
        );
      },
    },
    {
      title: "Actions",
      key: "actions",
      fixed: "right",
      width: 250,
      render: (_, record) => {
        const isCreatedByAdmin = record.createdBy?._id !== record.customer?._id;
        const canReceiveCashPayment =
          record.status === "PENDING" ||
          record.status === "CONFIRMED" ||
          record.status === "PARTIALLY_PAID";

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
                  onClick={() =>
                    handleDownload(record._id, record.invoiceNumber)
                  }
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

              {canReceiveCashPayment && (
                <Tooltip title="Record Cash Payment">
                  <Button
                    size="small"
                    icon={<DollarOutlined />}
                    onClick={() => handleCashPayment(record)}
                    style={{
                      borderRadius: "5px",
                      color: "#52c41a",
                      borderColor: "#52c41a",
                    }}
                  >
                    Cash
                  </Button>
                </Tooltip>
              )}

              <Tooltip title="Download Invoice PDF">
                <Button
                  icon={<FilePdfOutlined />}
                  disabled={loading}
                  size="small"
                  onClick={() =>
                    handleDownload(record._id, record.invoiceNumber)
                  }
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

        // For customer-created invoices, admin can still record cash payments
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

            {canReceiveCashPayment && (
              <Tooltip title="Record Cash Payment">
                <Button
                  size="small"
                  icon={<DollarOutlined />}
                  onClick={() => handleCashPayment(record)}
                  style={{
                    borderRadius: "5px",
                    color: "#52c41a",
                    borderColor: "#52c41a",
                  }}
                >
                  Cash
                </Button>
              </Tooltip>
            )}

            <Tooltip title="Download Invoice PDF">
              <Button
                size="small"
                icon={<FilePdfOutlined />}
                disabled={loading}
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
        <Col xs={24} sm={12} lg={3}>
          <Card>
            <Statistic
              title="Total Invoices"
              value={summary.totalInvoices || 0}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={3}>
          <Card>
            <Statistic
              title="Overdue Invoices"
              prefix={<WarningOutlined />}
              value={summary.overdueCount || 0}
              valueStyle={{ color: "#ff4d4f" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={4}>
          <Card>
            <Statistic
              title="Pending Amount"
              value={(summary.pendingAmount || 0).toFixed(2)}
              prefix="₹"
              valueStyle={{ color: "#faad14" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={4}>
          <Card>
            <Statistic
              title="Confirmed Amount"
              value={(summary.confirmedAmount || 0).toFixed(2)}
              prefix="₹"
              valueStyle={{ color: "#13c2c2" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={4}>
          <Card>
            <Statistic
              title="Paid Amount"
              value={(summary.paidAmount || 0).toFixed(2)}
              prefix="₹"
              valueStyle={{ color: "#13c2c2" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={4}>
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

      <Card
        title="Company Invoices"
        extra={
          <Space wrap>
            <Select
              placeholder="Filter by Customer"
              style={{ width: 200 }}
              prefix={<SearchOutlined />}
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
                { label: "Partially Paid", value: "PARTIALLY_PAID" },
              ]}
            />
            <Button
              icon={<DownloadOutlined />}
              onClick={handleExportInvoices}
              loading={loading}
              disabled={invoices.length === 0 || loading}
              style={{
                borderRadius: "5px",
                backgroundColor: "#52c41a",
                borderColor: "#52c41a",
                color: "white",
              }}
            >
              Export to Excel
            </Button>
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
              {selectedInvoice.amountPaid > 0 && (
                <>
                  <p style={{ color: "#52c41a" }}>
                    <strong>Amount Paid:</strong> ₹
                    {selectedInvoice.amountPaid?.toFixed(2)}
                  </p>
                  <p
                    style={{
                      color:
                        selectedInvoice.remainingAmount > 0
                          ? "#ff9800"
                          : "#52c41a",
                      fontWeight: "bold",
                    }}
                  >
                    <strong>Remaining Amount:</strong> ₹
                    {selectedInvoice.remainingAmount?.toFixed(2) || "0.00"}
                  </p>
                </>
              )}
            </div>

            {selectedInvoice.paymentHistory &&
              selectedInvoice.paymentHistory.length > 0 && (
                <div className="detail-section">
                  <h3>Payment History</h3>
                  {selectedInvoice.paymentHistory.map((payment, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: "10px",
                        marginBottom: "8px",
                        background: "#f0f2f5",
                        borderRadius: "4px",
                      }}
                    >
                      <p style={{ marginBottom: "4px" }}>
                        <strong>Amount:</strong> ₹{payment.amount?.toFixed(2)}
                        <span style={{ marginLeft: "15px" }}>
                          <strong>Method:</strong> {payment.paymentMethod}
                        </span>
                      </p>
                      <p
                        style={{
                          marginBottom: "4px",
                          fontSize: "12px",
                          color: "#666",
                        }}
                      >
                        <strong>Date:</strong>{" "}
                        {new Date(payment.paidAt).toLocaleString()}
                      </p>
                      <p
                        style={{
                          marginBottom: "0",
                          fontSize: "12px",
                          color: "#666",
                        }}
                      >
                        <strong>Transaction ID:</strong> {payment.transactionId}
                      </p>
                    </div>
                  ))}
                </div>
              )}
          </div>
        )}
      </Drawer>

      <CashPaymentModal
        invoice={selectedInvoiceForPayment}
        visible={isCashPaymentModalVisible}
        onClose={() => {
          setIsCashPaymentModalVisible(false);
          setSelectedInvoiceForPayment(null);
        }}
        onPaymentSuccess={handleCashPaymentSuccess}
      />
    </div>
  );
}

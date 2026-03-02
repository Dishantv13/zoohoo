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
  Modal,
  Select,
  Tooltip,
  Drawer,
} from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  CreditCardOutlined,
  WarningOutlined,
  DownloadOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchInvoices } from "../features/invoice/invoice.slice";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { apiService } from "../service/apiService";
import PaymentModal from "../components/PaymentModal";
import "./InvoiceManagement.css";

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
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [selectedInvoiceForPayment, setSelectedInvoiceForPayment] =
    useState(null);
  const [Loading, setLoading] = useState(false);

  useEffect(() => {
    dispatch(fetchInvoices({ page, limit: pageSize, status: statusFilter }));
  }, [dispatch, page, pageSize, statusFilter]);

  const handleEdit = (invoice) => {
    navigate(`/invoices/${invoice._id}`);
  };

  const handleViewDetails = async (invoice) => {
    setIsDrawerVisible(true);
    setSelectedInvoice({ ...invoice, paymentHistory: [] });

    try {
      const response = await apiService.getPaymentHistory(invoice._id);
      const paymentHistory = response.data?.data?.paymentHistory || [];
      setSelectedInvoice({ ...invoice, paymentHistory });
    } catch (error) {
      notification.warning({
        message: "Error",
        description: "Failed to fetch payment history",
      });
    }
  };

  const handleDelete = async (id) => {
    await apiService.deleteInvoice(id);
    notification.success({
      message: "Success",
      description: "Invoice deleted successfully",
    });
    dispatch(fetchInvoices({ page, limit: pageSize, status: statusFilter }));
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

  const handleExportInvoices = async () => {
    try {
      setLoading(true);
      const params = {};
      if (statusFilter) {
        params.status = statusFilter;
      }

      const response = await apiService.exportInvoice(params);

      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = `invoices_${new Date().toISOString().split("T")[0]}.xlsx`;

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

  const handleDownLoad = async (invoice) => {
    try {
      setLoading(true);
      const response = await apiService.downloadInvoice(invoice._id, {
        responseType: "blob",
      });

      const blob = new Blob([response.data], {
        type: "application/pdf",
      });

      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `invoice_${invoice.invoiceNumber}.pdf`;
      document.body.appendChild(a);
      a.click();

      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      notification.error({
        message: "Failed",
        description: "Failed to download invoice",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = () => {
    notification.success({
      message: "Success",
      description: "Invoice marked as PAID",
    });
    dispatch(fetchInvoices({ page, limit: pageSize, status: statusFilter }));
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
            await apiService.deleteInvoice(invoiceId);
            notification.success({
              message: "Success",
              description: "Invoice cancelled and deleted successfully",
            });
            dispatch(
              fetchInvoices({ page, limit: pageSize, status: statusFilter }),
            );
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
      await apiService.updateInvoiceStatus(invoiceId, newStatus);
      notification.success({
        message: "Success",
        description: `Invoice status updated to ${newStatus}`,
      });
      dispatch(fetchInvoices({ page, limit: pageSize, status: statusFilter }));
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
  const totalInvoices = summaryData.totalInvoices || 0;
  const overdueCount = summaryData.overdueCount || 0;

  const filteredInvoices = statusFilter
    ? invoices.filter((invoice) => invoice.status === statusFilter)
    : invoices;

  const statusColors = {
    PAID: "green",
    PENDING: "orange",
    CANCELLED: "red",
  };

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
      title: "Created By",
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
          <Flex vertical gap="2px">
            <Tag color={tagColor}>{creatorName.toUpperCase()}</Tag>
          </Flex>
        );
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
      title: "Status",
      dataIndex: "status",
      width: 100,
      render: (status) => {
        const statusColors = {
          PENDING: "orange",
          PARTIALLY_PAID: "gold",
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
        <div style={{ lineHeight: "1.2", textAlign: "center" }}>
          <div>Discount Rate</div>
          <div>(%)</div>
        </div>
      ),
      dataIndex: "parseDiscount",
      width: 100,
      key: "discountRate",
      render: (v = 0) => (
        <Flex align="center" gap="small" justify="center">
          <Tag color="cyan">{Number(v).toFixed(2)}%</Tag>
        </Flex>
      ),
    },
    {
      title: "Discount ₹",
      dataIndex: "discount",
      width: 120,
      key: "discount",
      render: (v) => {
        const value = Number(v) || 0;
        return (
          <Flex align="center" gap="small">
            <Tag color="red">₹{value.toFixed(2)}</Tag>
          </Flex>
        );
      },
    },
    {
      title: (
        <div style={{ lineHeight: "1.2", textAlign: "center" }}>
          Amount After <br />
          Discount
        </div>
      ),
      dataIndex: "amountAfterDiscount",
      width: 120,
      key: "amountAfterDiscount",
      render: (v = 0) => (
        <Flex align="center" gap="small">
          <Tag color="purple">₹{Number(v).toFixed(2)}</Tag>
        </Flex>
      ),
    },
    {
      title: (
        <div style={{ lineHeight: "1.2", textAlign: "center" }}>
          <div>Tax Rate</div>
          <div>(%)</div>
        </div>
      ),
      dataIndex: "parseTaxRate",
      width: 100,
      key: "taxRate",
      render: (v = 0) => (
        <Flex align="center" gap="small" justify="center">
          <Tag color="cyan">{Number(v).toFixed(2)}%</Tag>
        </Flex>
      ),
    },
    {
      title: "Tax ₹",
      dataIndex: "tax",
      width: 120,
      key: "tax",
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
      key: "totalAmount",
      render: (v = 0) => (
        <Flex align="center" gap="small">
          <Tag color="blue">₹{Number(v).toFixed(2)}</Tag>
        </Flex>
      ),
    },
    {
      title: "Amount Paid",
      dataIndex: "amountPaid",
      width: 120,
      key: "amountPaid",
      render: (v = 0) => (
        <Flex align="center" gap="small">
          <Tag color="green">₹{Number(v).toFixed(2)}</Tag>
        </Flex>
      ),
    },
    {
      title: "Remaining",
      dataIndex: "remainingAmount",
      width: 120,
      key: "remainingAmount",
      render: (v = 0, record) => {
        const remaining = Number(v) || 0;
        const color =
          remaining === 0 ? "green" : remaining > 0 ? "orange" : "default";
        return (
          <Flex align="center" gap="small">
            <Tag color={color}>₹{remaining.toFixed(2)}</Tag>
          </Flex>
        );
      },
    },

    {
      title: "Action",
      width: 200,
      fixed: "right",
      render: (_, record) => {
        const isCreatedByAdmin = record.createdBy?._id !== record.customer?._id;

        if (record.status === "PAID") {
          return (
            <Space wrap>
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

              <Tooltip title="View Invoice">
                <Button
                  size="small"
                  icon={<EyeOutlined />}
                  onClick={() => handleViewDetails(record)}
                  style={{
                    borderRadius: "5px",
                    color: "black",
                  }}
                ></Button>
              </Tooltip>

              <Tooltip title="Download Invoice">
                <Button
                  size="small"
                  icon={<DownloadOutlined />}
                  onClick={() => handleDownLoad(record)}
                  disabled={Loading}
                  style={{
                    borderRadius: "5px",
                    color: "green",
                  }}
                ></Button>
              </Tooltip>
            </Space>
          );
        }

        if (isCreatedByAdmin || record.status === "PARTIALLY_PAID") {
          const hasPartialPayment =
            record.amountPaid > 0 && record.remainingAmount > 0;
          const payButtonText = hasPartialPayment ? "Pay Remaining" : "Pay";

          return (
            <Space wrap>
              <Tooltip
                title={
                  hasPartialPayment
                    ? `Pay Remaining ₹${record.remainingAmount.toFixed(2)}`
                    : "Pay Invoice"
                }
              >
                <Button
                  type="primary"
                  size="small"
                  icon={<CreditCardOutlined />}
                  onClick={() => handlePaymentClick(record)}
                >
                  {payButtonText}
                </Button>
              </Tooltip>

              <Tooltip title="View Invoice">
                <Button
                  size="small"
                  icon={<EyeOutlined />}
                  onClick={() => handleViewDetails(record)}
                  style={{
                    borderRadius: "5px",
                    color: "black",
                  }}
                ></Button>
              </Tooltip>

              <Tooltip title="Download Invoice">
                <Button
                  size="small"
                  icon={<DownloadOutlined />}
                  onClick={() => handleDownLoad(record)}
                  disabled={Loading}
                  style={{
                    borderRadius: "5px",
                    color: "green",
                  }}
                ></Button>
              </Tooltip>
            </Space>
          );
        }

        return (
          <Space wrap>
            <Tooltip title="Pay Invoice">
              <Button
                type="primary"
                size="small"
                icon={<CreditCardOutlined />}
                onClick={() => handlePaymentClick(record)}
              >
                Pay
              </Button>
            </Tooltip>

            <Tooltip title="View Invoice">
              <Button
                size="small"
                icon={<EyeOutlined />}
                onClick={() => handleViewDetails(record)}
                style={{
                  borderRadius: "5px",
                  color: "black",
                }}
              ></Button>
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
              ></Button>
            </Tooltip>

            <Tooltip title="Download Invoice">
              <Button
                size="small"
                icon={<DownloadOutlined />}
                onClick={() => handleDownLoad(record)}
                disabled={Loading}
                style={{
                  borderRadius: "5px",
                  color: "green",
                }}
              ></Button>
            </Tooltip>

            <Tooltip title="Delete Invoice">
              <Popconfirm
                title="Delete this invoice?"
                onConfirm={() => handleDelete(record._id)}
              >
                <Button
                  danger
                  size="small"
                  icon={<DeleteOutlined />}
                  style={{
                    borderRadius: "5px",
                    color: "red",
                  }}
                ></Button>
              </Popconfirm>
            </Tooltip>
          </Space>
        );
      },
    },
  ];

  return (
    <>
      <Row gutter={25} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={3}>
          <Card>
            <Statistic
              title="Total Invoices"
              value={totalInvoices || 0}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={4}>
          <Card>
            <Statistic
              title="Overdue Invoices"
              value={overdueCount}
              prefix={<WarningOutlined />}
              valueStyle={{ color: "#fa541c", fontSize: "20px" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={4}>
          <Card>
            <Statistic
              title="Pending Amount"
              value={pendingAmount.toFixed(2)}
              prefix="₹"
              valueStyle={{ color: "#faad14", fontSize: "20px" }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={4}>
          <Card>
            <Statistic
              title="Paid Amount"
              value={paidAmount.toFixed(2)}
              prefix="₹"
              valueStyle={{ color: "#52c41a", fontSize: "20px" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={4}>
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

      <Row gutter={16} style={{ marginBottom: 16 }} justify="space-between">
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
              onChange={(value) => {
                setPage(1);
                setStatusFilter(value === "ALL" ? null : value);
              }}
              options={[
                { value: "ALL", label: "📋 All Status" },
                { value: "PENDING", label: "🟡 Pending" },
                { value: "PAID", label: "🟢 Paid" },
                { value: "PARTIALLY_PAID", label: "🟠 Partially Paid" },
              ]}
            />
            <Button
              type="primary"
              icon={<DownloadOutlined />}
              onClick={handleExportInvoices}
              loading={Loading}
              disabled={invoices.length === 0 || Loading}
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
        </Col>
      </Row>

      <Spin spinning={loading}>
        <Table
          columns={columns}
          dataSource={filteredInvoices}
          rowKey="_id"
          onChange={handleTableChange}
          scroll={{ x: "max-content" }}
          pagination={{
            current: page,
            pageSize: pageSize,
            total: pagination.totalItems,
            showQuickJumper: true,
            showSizeChanger: true,
            pageSizeOptions: [5, 10, 20, 50],
            showTotal: (total, range) =>
              `Showing ${range[0]}-${range[1]} of ${total} invoices`,
            position: ["bottomRight"],
          }}
          size="large"
        />
      </Spin>

      <PaymentModal
        invoice={selectedInvoiceForPayment}
        visible={paymentModalVisible}
        onClose={() => setPaymentModalVisible(false)}
        onPaymentSuccess={handlePaymentSuccess}
      />

      <Drawer
        title="Invoice Details"
        onClose={() => {
          setIsDrawerVisible(false);
          setSelectedInvoice(null);
        }}
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
                      <th>Item</th>
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
    </>
  );
}

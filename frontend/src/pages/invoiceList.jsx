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
import { useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import PaymentModal from "../components/PaymentModal";
import "./InvoiceManagement.css";
import {
  useGetInvoicesQuery,
  useDeleteInvoiceMutation,
} from "../service/invoiceApi";
import { useGetPaymentHistoryQuery } from "../service/paymentApi";
import { useExportInvoiceMutation } from "../service/invoiceApi";
import { useDownloadInvoiceMutation } from "../service/invoiceApi";

export default function InvoiceList() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState(null);
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [pageSize, setPageSize] = useState(10);
  const [selectedInvoiceForPayment, setSelectedInvoiceForPayment] =
    useState(null);

  const currentUser = useSelector((state) => state.auth.user);
  const currentUserId = currentUser?._id || currentUser?.id || null;

  const { data, isLoading, refetch } = useGetInvoicesQuery({
    page,
    limit: pageSize,
    status: statusFilter,
    customer: currentUserId,
  });

  const invoicesData = data?.data?.data || [];

  const paginationData = {
    current: data?.data?.pagination?.page || 1,
    pageSize: data?.data?.pagination?.limit || 10,
    total: data?.data?.pagination?.totalItems || 0,
  };

  const summary = {
    totalInvoices: data?.data?.summary?.totalInvoices || 0,
    totalAmount: data?.data?.summary?.totalAmount || 0,
    paidAmount: data?.data?.summary?.paidAmount || 0,
    pendingAmount: data?.data?.summary?.pendingAmount || 0,
    overdueCount: data?.data?.summary?.overdueCount || 0,
  };

  const handleEdit = (invoice) => {
    navigate(`/invoices/${invoice._id}`);
  };

  const { data: paymentHistoryData } = useGetPaymentHistoryQuery(
    selectedInvoice?._id,
    { skip: !selectedInvoice?._id },
  );

  const paymentHistory = paymentHistoryData?.data?.paymentHistory || [];

  const handleViewDetails = async (invoice) => {
    setIsDrawerVisible(true);
    setSelectedInvoice({ ...invoice });
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

  const [exportInvoices, { isLoading: exportLoading }] =
    useExportInvoiceMutation();
  const handleExportInvoices = async () => {
    try {
      const params = {};

      const blob = await exportInvoices(params).unwrap();

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = `invoices_${Date.now()}.xlsx`;

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
        message: "Export Failed",
        description: error?.data?.message || "Failed to export invoices",
      });
    }
  };

  const [downloadInvoice, { isLoading: downloadLoading }] =
    useDownloadInvoiceMutation();
  const handleDownLoad = async (invoiceId, invoiceNumber) => {
    const blob = await downloadInvoice(invoiceId).unwrap();

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `invoice-${invoiceNumber}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePaymentSuccess = () => {
    notification.success({
      message: "Success",
      description: "Invoice marked as PAID",
    });
    refetch();
    setPaymentModalVisible(false);
  };

  const handleTableChange = (paginationInfo) => {
    setPage(paginationInfo.current);
    setPageSize(paginationInfo.pageSize);
  };

  const [deleteInvoice, { isLoading: deleteLoading }] =
    useDeleteInvoiceMutation();
  const handleDelete = (invoiceId) => {
    Modal.confirm({
      title: "Delete Invoice?",
      content: "This will permanently delete the invoice. Are you sure?",
      okText: "Yes, Delete",
      okType: "danger",
      cancelText: "Cancel",
      onOk: async () => {
        try {
          await deleteInvoice(invoiceId).unwrap();

          notification.success({
            message: "Success",
            description: "Invoice deleted successfully",
          });
        } catch (error) {
          notification.error({
            message: "Failed",
            description: error?.data?.message || "Failed to delete invoice",
          });
        }
      },
    });
  };

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
    // {
    //   title: (
    //     <div style={{ lineHeight: "1.2", textAlign: "center" }}>
    //       <div>Discount Rate</div>
    //       <div>(%)</div>
    //     </div>
    //   ),
    //   dataIndex: "parseDiscount",
    //   width: 100,
    //   key: "discountRate",
    //   render: (v = 0) => (
    //     <Flex align="center" gap="small" justify="center">
    //       <Tag color="cyan">{Number(v).toFixed(2)}%</Tag>
    //     </Flex>
    //   ),
    // },
    // {
    //   title: "Discount ₹",
    //   dataIndex: "discount",
    //   width: 120,
    //   key: "discount",
    //   render: (v) => {
    //     const value = Number(v) || 0;
    //     return (
    //       <Flex align="center" gap="small">
    //         <Tag color="red">₹{value.toFixed(2)}</Tag>
    //       </Flex>
    //     );
    //   },
    // },
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
    // {
    //   title: (
    //     <div style={{ lineHeight: "1.2", textAlign: "center" }}>
    //       <div>Tax Rate</div>
    //       <div>(%)</div>
    //     </div>
    //   ),
    //   dataIndex: "parseTaxRate",
    //   width: 100,
    //   key: "taxRate",
    //   render: (v = 0) => (
    //     <Flex align="center" gap="small" justify="center">
    //       <Tag color="cyan">{Number(v).toFixed(2)}%</Tag>
    //     </Flex>
    //   ),
    // },
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
                  onClick={() => handleDownLoad(record._id)}
                  disabled={downloadLoading}
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
                  onClick={() => handleDownLoad(record._id)}
                  disabled={downloadLoading}
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
                onClick={() => handleDownLoad(record._id)}
                disabled={downloadLoading}
                style={{
                  borderRadius: "5px",
                  color: "green",
                }}
              ></Button>
            </Tooltip>

            <Tooltip title="Delete Invoice">
              <Popconfirm
                title="Delete this invoice?"
                disabled={deleteLoading}
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
              prefix={<WarningOutlined />}
              valueStyle={{ color: "#fa541c", fontSize: "20px" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={4}>
          <Card>
            <Statistic
              title="Pending Amount"
              value={summary.pendingAmount?.toFixed(2) || 0}
              prefix="₹"
              valueStyle={{ color: "#faad14", fontSize: "20px" }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={4}>
          <Card>
            <Statistic
              title="Paid Amount"
              value={summary.paidAmount?.toFixed(2) || 0}
              prefix="₹"
              valueStyle={{ color: "#52c41a", fontSize: "20px" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={4}>
          <Card>
            <Statistic
              title="Total Amount"
              value={summary.totalAmount?.toFixed(2) || 0}
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
              disabled={invoicesData.length === 0 || exportLoading}
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

      <Spin spinning={isLoading}>
        <Table
          columns={columns}
          dataSource={invoicesData}
          rowKey="_id"
          onChange={handleTableChange}
          scroll={{ x: "max-content" }}
          pagination={{
            current: paginationData.current,
            pageSize: paginationData.pageSize,
            total: paginationData.total,
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

            {paymentHistory && paymentHistory.length > 0 && (
              <div className="detail-section">
                <h3>Payment History</h3>
                {paymentHistory.map((payment, idx) => (
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

import "@ant-design/v5-patch-for-react-19";
import { useState } from "react";
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
  Popconfirm,
  Flex,
} from "antd";
import {
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  WarningOutlined,
  CreditCardOutlined,
  DollarCircleOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import "./InvoiceManagement.css";
import {
  useGetBillsQuery,
  useDeleteBillMutation,
  useGetBillsStatsQuery,
} from "../service/billApi";
import { useGetVendorsQuery } from "../service/vendorApi";
import { useGetBillPaymentHistoryQuery } from "../service/paymentApi";
import PaymentModel from "../components/PaymentModal";
import CashPaymentModel from "../components/CashPaymentModal";

const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
});

export default function AdminBillManagement() {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [selectedBill, setSelectedBill] = useState(null);
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);
  const [statusFilter, setStatusFilter] = useState(null);
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [cashPaymentModalVisible, setCashPaymentModalVisible] = useState(false);
  const [selectedBillForPayment, setSelectedBillForPayment] = useState(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  if (!user || user.role !== "admin") {
    return (
      <Card>
        <Empty description="Admin access only. Please login as admin." />
      </Card>
    );
  }

  const { data: vendorsData } = useGetVendorsQuery({
    page: 1,
    limit: 100,
  });
  const {
    data: billsData,
    isLoading,
    refetch,
  } = useGetBillsQuery({
    vendorId: selectedVendor ? String(selectedVendor) : null,
    status: statusFilter,
    page,
    limit,
  });
  const { data: billStatsData } = useGetBillsStatsQuery();

  const [deleteBill, { isLoading: isDeleting }] = useDeleteBillMutation();

  const vendorsList = vendorsData?.data?.vendors || [];
  const bills = billsData?.data?.bills || [];
  const summaryData = billStatsData?.data?.statistics || {};

  const pagination = billsData?.data?.pagination || {};
  const paginationData = {
    current: pagination.page,
    pageSize: pagination.limit,
    total: pagination.totalItems,
  };

  const statusColors = {
    PAID: "green",
    PENDING: "orange",
    PARTIALLY_PAID: "gold",
  };

  const { data: paymentHistoryData } = useGetBillPaymentHistoryQuery(
    selectedBill?._id,
    {
      skip: !selectedBill?._id,
    },
  );

  const paymentHistory = paymentHistoryData?.data?.paymentHistory || [];

  const handleTableChange = (paginationInfo) => {
    setPage(paginationInfo.current);
    setLimit(paginationInfo.pageSize);
  };

  const handleDelete = async (billId) => {
    try {
      await deleteBill(billId).unwrap();
      notification.success({
        message: "Success",
        description: "Bill deleted successfully",
      });
      refetch();
    } catch (error) {
      notification.error({
        message: "Error",
        description: error?.data?.message || "Failed to delete bill",
      });
    }
  };

  const handleCardPaymentClick = (bill) => {
    if (bill.status === "PAID") {
      notification.warning({
        message: "Already Paid",
        description: "This bill has already been paid",
      });
      return;
    }
    setSelectedBillForPayment(bill);
    setPaymentModalVisible(true);
  };

  const handleCashPaymentClick = (bill) => {
    if (bill.status === "PAID") {
      notification.warning({
        message: "Already Paid",
        description: "This bill has already been paid",
      });
      return;
    }
    setSelectedBillForPayment(bill);
    setCashPaymentModalVisible(true);
  };

  const handlePaymentSuccess = () => {
    refetch();
    notification.success({
      message: "Success",
      description: "Bill payment recorded successfully",
    });
  };

  const columns = [
    {
      title: "Bill Number",
      dataIndex: "billNumber",
      key: "billNumber",
      render: (text) => (
        <Flex align="center" gap="small">
          <Tag color="red">{text}</Tag>
        </Flex>
      ),
    },
    {
      title: "Vendor",
      dataIndex: ["vendorId", "name"],
      key: "vendor",
      render: (name) => <Tag color="purple">{name || "Unknown"}</Tag>,
    },
    {
      title: "Email",
      dataIndex: ["vendorId", "email"],
      key: "email",
      render: (text) => (
        <Flex align="center" gap="small">
          <Tag color="blue">{text}</Tag>
        </Flex>
      ),
    },
    {
      title: "Bill Date",
      dataIndex: "billDate",
      key: "billDate",
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
      title: "Items",
      dataIndex: "items",
      key: "items",
      render: (items) => items?.length || 0,
    },
    {
      title: "Quick Status",
      key: "quickStatus",
      render: (_, record) => (
        <Tag color={statusColors[record.status] || "default"}>
          {record.status}
        </Tag>
      ),
    },
    {
      title: "Amount",
      dataIndex: "totalAmount",
      key: "totalAmount",
      render: (amount) => (
        <Tag color="purple">{currencyFormatter.format(amount || 0)}</Tag>
      ),
    },
    {
      title: "paid Amount",
      dataIndex: "amountPaid",
      render: (amount = 0) => (
        <Flex align="center" gap="small">
          <Tag color="cyan">₹{amount?.toFixed(2)}</Tag>
        </Flex>
      ),
    },
    {
      title: "remaining Amount",
      dataIndex: "remainingAmount",
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
      width: 300,
      render: (_, record) => {
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
              <Button
                icon={<EyeOutlined />}
                onClick={() => {
                  setSelectedBill(record);
                  setIsDrawerVisible(true);
                }}
                size="small"
              >
                View
              </Button>
            </Space>
          );
        }
        if (record.status === "PARTIALLY_PAID") {
          return (
            <Space wrap>
              <Button
                icon={<CreditCardOutlined />}
                type="primary"
                onClick={() => handleCardPaymentClick(record)}
                size="small"
              >
                Card Pay
              </Button>
              <Button
                icon={<DollarCircleOutlined />}
                type="default"
                onClick={() => handleCashPaymentClick(record)}
                size="small"
              >
                Cash
              </Button>
              <Button
                icon={<EyeOutlined />}
                onClick={() => {
                  setSelectedBill(record);
                  setIsDrawerVisible(true);
                }}
                size="small"
              >
                View
              </Button>
            </Space>
          );
        }
        return (
          <Space wrap>
            <Button
              icon={<EditOutlined />}
              onClick={() =>
                navigate("/admin/vendor/create-bill", {
                  state: { bill: record },
                })
              }
              size="small"
            >
              Edit
            </Button>
            <Button
              icon={<CreditCardOutlined />}
              type="primary"
              onClick={() => handleCardPaymentClick(record)}
              size="small"
            >
              Card Pay
            </Button>
            <Button
              icon={<DollarCircleOutlined />}
              type="default"
              onClick={() => handleCashPaymentClick(record)}
              size="small"
            >
              Cash
            </Button>
            <Popconfirm
              title="Delete bill"
              description="Are you sure you want to delete this bill?"
              onConfirm={() => handleDelete(record._id)}
              okText="Yes"
              cancelText="No"
            >
              <Button
                danger
                icon={<DeleteOutlined />}
                loading={isDeleting}
                size="small"
              >
                Delete
              </Button>
            </Popconfirm>
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
              title="Total Bill"
              value={summaryData.billCount || 0}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={3}>
          <Card>
            <Statistic
              title="Pending Bills"
              prefix={<ClockCircleOutlined />}
              value={summaryData.pendingBill || 0}
              valueStyle={{ color: "#ff4d4f" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={3}>
          <Card>
            <Statistic
              title="Overdue Bills"
              prefix={<WarningOutlined />}
              value={summaryData.overdueCount || 0}
              valueStyle={{ color: "#ff4d4f" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={4}>
          <Card>
            <Statistic
              title="Pending Amount"
              value={(summaryData.pendingAmount || 0).toFixed(2)}
              prefix="₹"
              valueStyle={{ color: "#faad14" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={4}>
          <Card>
            <Statistic
              title="Paid Amount"
              value={(summaryData.paidAmount || 0).toFixed(2)}
              prefix="₹"
              valueStyle={{ color: "#13c2c2" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={4}>
          <Card>
            <Statistic
              title="Total Amount"
              value={(summaryData.totalAmount || 0).toFixed(2)}
              prefix="₹"
              valueStyle={{ color: "#52c41a" }}
            />
          </Card>
        </Col>
      </Row>

      <Card
        title="Vendor Bill Management"
        extra={
          <Space>
            <Select
              placeholder="Filter by vendor"
              style={{ width: 240 }}
              prefix={<SearchOutlined />}
              allowClear
              showSearch
              value={selectedVendor}
              onChange={(value) => {
                setPage(1);
                setSelectedVendor(value || null);
              }}
              filterOption={(input, option) =>
                (option?.label ?? "")
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
              options={vendorsList.map((vendor) => ({
                label: `${vendor.name} (${vendor.email})`,
                value: vendor._id,
              }))}
            />
            <Select
              allowClear
              placeholder="Filter by status"
              style={{ width: 180 }}
              value={statusFilter}
              onChange={(value) => setStatusFilter(value || null)}
              options={[
                { label: "Pending", value: "PENDING" },
                { label: "Partially Paid", value: "PARTIALLY_PAID" },
                { label: "Paid", value: "PAID" },
              ]}
            />
            <Button
              type="primary"
              onClick={() => navigate("/admin/vendor/create-bill")}
            >
              Create Bill
            </Button>
          </Space>
        }
      >
        <Table
          rowKey="_id"
          columns={columns}
          dataSource={bills}
          loading={isLoading}
          onChange={handleTableChange}
          pagination={{
            current: paginationData.current,
            pageSize: paginationData.pageSize,
            total: paginationData.total,
            showSizeChanger: true,
            showQuickJumper: true,
            pageSizeOptions: [5, 10, 20, 50],
            showTotal: (total, range) =>
              `Showing ${range[0]}-${range[1]} of ${total} bills`,
          }}
          scroll={{ x: true }}
        />
      </Card>

      <Drawer
        title="Bill Details"
        width={700}
        onClose={() => setIsDrawerVisible(false)}
        open={isDrawerVisible}
      >
        {selectedBill ? (
          <div className="invoice-details">
            <div className="detail-section">
              <h3>Vendor Information</h3>
              <p>
                <strong>Name:</strong> {selectedBill?.vendorId?.name || "-"}
              </p>
              <p>
                <strong>Email:</strong> {selectedBill?.vendorId?.email || "-"}
              </p>
              <p>
                <strong>Phone:</strong> {selectedBill?.vendorId?.phone || "-"}
              </p>
            </div>

            <div className="detail-section">
              <h3>Bill Information</h3>
              <p>
                <strong>Status:</strong> {selectedBill.status}
              </p>
              <p>
                <strong>Total Amount:</strong>{" "}
                {currencyFormatter.format(selectedBill.totalAmount || 0)}
              </p>
              <p>
                <strong>Created At:</strong>{" "}
                {dayjs(selectedBill.createdAt).format("DD MMM YYYY hh:mm A")}
              </p>
            </div>

            <div className="detail-section">
              <h3>Line Items</h3>
              <table className="items-table">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Quantity</th>
                    <th>Rate</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedBill.items?.map((item, index) => {
                    const quantity = Number(item?.quantity) || 0;
                    const rate = Number(item?.rate) || 0;
                    return (
                      <tr
                        key={`${item?._id || item?.itemId?._id || "item"}-${index}`}
                      >
                        <td>{item?.itemId?.name || item?.itemId || "-"}</td>
                        <td>{quantity}</td>
                        <td>{currencyFormatter.format(rate)}</td>
                        <td>{currencyFormatter.format(quantity * rate)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
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
        ) : (
          <Empty description="No bill selected" />
        )}
      </Drawer>

      <PaymentModel
        type="bill"
        data={selectedBillForPayment}
        visible={paymentModalVisible}
        onClose={() => {
          setPaymentModalVisible(false);
          setSelectedBillForPayment(null);
        }}
        onPaymentSuccess={handlePaymentSuccess}
      />

      <CashPaymentModel
        type="bill"
        data={selectedBillForPayment}
        visible={cashPaymentModalVisible}
        onClose={() => {
          setCashPaymentModalVisible(false);
          setSelectedBillForPayment(null);
        }}
        onPaymentSuccess={handlePaymentSuccess}
      />
    </div>
  );
}

import { Drawer, Divider, Card, Row, Col, Statistic } from "antd";

export default function PartyDetailDrawer({
  type = "customer",
  open,
  onClose,
  data,
  summaryData = {},
  loading,
  formatCurrency,
}) {
  const isCustomer = type === "customer";

  if (!data) return null;

  const totalcount = isCustomer
    ? summaryData?.totalInvoices
    : summaryData?.BillCount;

  return (
    <Drawer
      title={isCustomer ? "Customer Details" : "Vendor Details"}
      width={600}
      onClose={onClose}
      open={open}
    >
      <div>
        <p>
          <strong>Name:</strong> {data.name}
        </p>

        <p>
          <strong>Email:</strong> {data.email}
        </p>

        <p>
          <strong>Phone:</strong>{" "}
          {isCustomer ? data.phonenumber || "-" : data.phone || "-"}
        </p>

        {isCustomer ? (
          <p>
            <strong>Status:</strong>{" "}
            <span style={{ color: data.isActive ? "green" : "red" }}>
              {data.isActive ? "Active" : "Inactive"}
            </span>
          </p>
        ) : (
          <p>
            <strong>Address:</strong> {data.address || "-"}
          </p>
        )}

        <Divider />

        <Card
          title={isCustomer ? "Invoice Summary" : "Vendor Bill Summary"}
          size="medium"
          loading={loading}
        >
          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Statistic
                title={isCustomer ? "Total Invoices" : "Total Bills"}
                value={totalcount || 0}
                valueStyle={{ color: "#1890ff" }}
              />
            </Col>

            <Col span={12}>
              <Statistic
                title={isCustomer ? "Overdue Invoices" : "Overdue Bills"}
                value={summaryData?.overdueCount || 0}
                valueStyle={{ color: "#ff4d4f" }}
              />
            </Col>

            <Col span={12}>
              <Statistic
                title="Total Amount"
                value={formatCurrency(summaryData?.totalAmount || 0)}
                prefix="₹"
                valueStyle={{ color: "#1890ff" }}
              />
            </Col>

            <Col span={12}>
              <Statistic
                title="Pending Amount"
                value={formatCurrency(summaryData?.pendingAmount || 0)}
                prefix="₹"
                valueStyle={{ color: "#faad14" }}
              />
            </Col>

            <Col span={12}>
              <Statistic
                title="Paid Amount"
                value={formatCurrency(summaryData?.paidAmount || 0)}
                prefix="₹"
                valueStyle={{ color: "#13c2c2" }}
              />
            </Col>
          </Row>
        </Card>
      </div>
    </Drawer>
  );
}

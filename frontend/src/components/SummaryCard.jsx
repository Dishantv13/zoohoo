import { Row, Col, Card, Statistic, Empty } from "antd";
import { ClockCircleOutlined, WarningOutlined } from "@ant-design/icons";

export default function SummaryCards({ type = "invoice", summaryData }) {
  if (!summaryData) return <Empty description="No data available" />;

  const isInvoice = type === "invoice";

  const totalCount = isInvoice
    ? summaryData?.totalInvoices
    : summaryData?.billCount;

  const pendingCount = isInvoice
    ? summaryData?.pendingInvoices
    : summaryData?.pendingBill;

  return (
    <Row gutter={16} style={{ marginBottom: "24px" }}>
      <Col xs={24} sm={12} lg={4}>
        <Card>
          <Statistic
            title={isInvoice ? "Total Invoices" : "Total Bills"}
            value={totalCount || 0}
            valueStyle={{ color: "#1890ff" }}
          />
        </Card>
      </Col>

      <Col xs={24} sm={12} lg={4}>
        <Card>
          <Statistic
            title={isInvoice ? "Pending Invoices" : "Pending Bills"}
            prefix={<ClockCircleOutlined />}
            value={pendingCount || 0}
            valueStyle={{ color: "#ff4d4f" }}
          />
        </Card>
      </Col>

      <Col xs={24} sm={12} lg={4}>
        <Card>
          <Statistic
            title={isInvoice ? "Overdue Invoices" : "Overdue Bills"}
            prefix={<WarningOutlined />}
            value={summaryData?.overdueCount || 0}
            valueStyle={{ color: "#ff4d4f" }}
          />
        </Card>
      </Col>

      <Col xs={24} sm={12} lg={4}>
        <Card>
          <Statistic
            title="Pending Amount"
            value={(summaryData?.pendingAmount || 0).toFixed(2)}
            prefix="₹"
            valueStyle={{ color: "#faad14" }}
          />
        </Card>
      </Col>

      <Col xs={24} sm={12} lg={4}>
        <Card>
          <Statistic
            title="Paid Amount"
            value={(summaryData?.paidAmount || 0).toFixed(2)}
            prefix="₹"
            valueStyle={{ color: "#13c2c2" }}
          />
        </Card>
      </Col>

      <Col xs={24} sm={12} lg={4}>
        <Card>
          <Statistic
            title="Total Amount"
            value={(summaryData?.totalAmount || 0).toFixed(2)}
            prefix="₹"
            valueStyle={{ color: "#52c41a" }}
          />
        </Card>
      </Col>
    </Row>
  );
}

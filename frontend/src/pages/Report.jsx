import { useState } from "react";
import { Card, Col, Row, Typography, DatePicker, Spin, Statistic } from "antd";
import {
  ArrowUpOutlined,
  ArrowDownOutlined,
  RiseOutlined,
  FallOutlined,
  DollarOutlined,
} from "@ant-design/icons";
import { useGetDashBoardQuery } from "../service/reportApi";

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const Report = () => {
  const [date, setDate] = useState(null);

  const { data, isLoading } = useGetDashBoardQuery({
    startDate:
      date && date.length === 2
        ? date[0].startOf("day").toISOString()
        : undefined,
    endDate:
      date && date.length === 2
        ? date[1].endOf("day").toISOString()
        : undefined,
  });

  const dashboardData = data?.data || {};

  const profit = Number(dashboardData?.profit || 0);
  const loss = Number(dashboardData?.loss || 0);
  const isProfit = profit > 0;
  const value = isProfit ? profit : loss;

  const todayProfit = Number(dashboardData?.todayProfit || 0);
  const todayLoss = Number(dashboardData?.todayLoss || 0);
  const isTodayProfit = todayProfit > 0;
  const todayValue = isTodayProfit ? todayProfit : todayLoss;

  const handleDateChange = (value) => {
    if (!value) {
      setDate([]);
      return;
    }
    setDate(value);
  };

  if (isLoading && !dashboardData) return <Spin size="large" />;

  return (
    <div style={{ padding: 16 }}>
      <Title level={3}>Financial Dashboard</Title>
      <Text type="secondary">
        Overview of your company financial performance
      </Text>

      <Row style={{ marginTop: 20, marginBottom: 20 }}>
        <Col>
          <RangePicker value={date} onChange={handleDateChange} allowClear />
        </Col>
      </Row>

      <Title level={4} style={{ marginTop: 30 }}>
        Total Performance
      </Title>

      <Row gutter={[16, 16]}>
        <Col span={8}>
          <Card hoverable>
            <Statistic
              title="Total Revenue"
              value={Number(dashboardData?.totalRevenue) || 0}
              precision={2}
              prefix={
                <>
                  <RiseOutlined /> ₹
                </>
              }
              valueStyle={{ color: "#3f8600" }}
            />
          </Card>
        </Col>

        <Col span={8}>
          <Card hoverable>
            <Statistic
              title="Total Expense"
              value={Number(dashboardData?.totalExpense) || 0}
              precision={2}
              prefix={
                <>
                  <FallOutlined /> ₹
                </>
              }
              valueStyle={{ color: "#cf1322" }}
            />
          </Card>
        </Col>

        <Col span={8}>
          <Card hoverable>
            <Statistic
              title={isProfit ? "Total Profit" : "Total Loss"}
              value={value}
              precision={2}
              prefix={
                <>{isProfit ? <ArrowUpOutlined /> : <ArrowDownOutlined />} ₹</>
              }
              valueStyle={{ color: isProfit ? "#3f8600" : "#cf1322" }}
            />
          </Card>
        </Col>
      </Row>

      <Title level={4} style={{ marginTop: 30 }}>
        Today Performance
      </Title>

      <Row gutter={[16, 16]}>
        <Col span={8}>
          <Card hoverable>
            <Statistic
              title="Today Revenue"
              value={Number(dashboardData?.todayRevenue) || 0}
              precision={2}
              prefix={
                <>
                  <DollarOutlined /> ₹
                </>
              }
              valueStyle={{ color: "#3f8600" }}
            />
          </Card>
        </Col>

        <Col span={8}>
          <Card hoverable>
            <Statistic
              title="Today Expense"
              value={Number(dashboardData?.todayExpense) || 0}
              precision={2}
              prefix={
                <>
                  <DollarOutlined /> ₹
                </>
              }
              valueStyle={{ color: "#cf1322" }}
            />
          </Card>
        </Col>

        <Col span={8}>
          <Card hoverable>
            <Statistic
              title={isTodayProfit ? "Today Profit" : "Today Loss"}
              value={todayValue}
              precision={2}
              prefix={
                <>{isTodayProfit ? <ArrowUpOutlined /> : <ArrowDownOutlined />} ₹</>
              }
              valueStyle={{ color: isTodayProfit ? "#3f8600" : "#cf1322" }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Report;

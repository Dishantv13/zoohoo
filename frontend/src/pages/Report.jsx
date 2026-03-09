import { useState } from "react";
import { Card, Col, Row, Typography, DatePicker, Spin, Statistic } from "antd";
import {
  BarChartOutlined,
  CalendarOutlined,
  RiseOutlined,
  UserOutlined,
} from "@ant-design/icons";
import MonthlyRevenueReport from "../components/MonthlyRevenueReport";
import YearlyRevenueReport from "../components/YearlyRevenueReport";
import TodayRevenueReport from "../components/TodayRevenueReport";
import TopCustomerReport from "../components/TopCustomerReport";
import { useGetDashBoardQuery } from "../service/reportApi";

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const Report = () => {
  const [activeReport, setActiveReport] = useState("");
  const [dates, setDates] = useState([]);
  const { data, isLoading } = useGetDashBoardQuery({
    startDate:
      dates && dates.length === 2
        ? dates[0].startOf("day").toISOString()
        : undefined,
    endDate:
      dates && dates.length === 2
        ? dates[1].endOf("day").toISOString()
        : undefined,
  });

  const dashboardData = data?.data || {};

  const handleDateChange = (value) => {
    if (!value) {
      setDates([]);
      return;
    }
    setDates(value);
  };

  const handleReportChange = (reportKey) => {
    setActiveReport(reportKey);
    setDates([]);
  };

  if (isLoading && !dashboardData) return <Spin size="large" />;

  const reportMenu = [
    {
      key: "monthly",
      title: "Monthly Report",
      description: "Revenue trends month by month",
      icon: <CalendarOutlined style={{ fontSize: 20 }} />,
    },
    {
      key: "yearly",
      title: "Yearly Report",
      description: "Year-over-year revenue overview",
      icon: <RiseOutlined style={{ fontSize: 20 }} />,
    },
    {
      key: "today",
      title: "Today Report",
      description: "Hourly revenue for current day",
      icon: <BarChartOutlined style={{ fontSize: 20 }} />,
    },
    {
      key: "topCustomer",
      title: "Top Customer Report",
      description: "Highest spending customer insights",
      icon: <UserOutlined style={{ fontSize: 20 }} />,
    },
  ];

  const reports = {
    monthly: <MonthlyRevenueReport dates={dates} />,
    yearly: <YearlyRevenueReport dates={dates} />,
    today: <TodayRevenueReport dates={dates} />,
    topCustomer: <TopCustomerReport dates={dates} />,
  };

  return (
    <div style={{ padding: "8px" }}>
      <Title level={3} style={{ marginBottom: 4 }}>
        Reports Dashboard
      </Title>
      <Text type="secondary">Choose a report to view detailed analytics</Text>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        {reportMenu.map((item) => {
          const isActive = activeReport === item.key;

          return (
            <Col xs={24} sm={12} lg={6} key={item.key}>
              <Card
                hoverable
                onClick={() => handleReportChange(item.key)}
                style={{
                  borderRadius: 10,
                  cursor: "pointer",
                  borderColor: isActive ? "#1677ff" : undefined,
                  boxShadow: isActive
                    ? "0 4px 12px rgba(22,119,255,0.15)"
                    : undefined,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  {item.icon}
                  <div>
                    <div style={{ fontWeight: 600 }}>{item.title}</div>
                    <Text type="secondary">{item.description}</Text>
                  </div>
                </div>
              </Card>
            </Col>
          );
        })}
      </Row>

      <Row style={{ marginBottom: 20, marginTop: 20 }}>
        <Col>
          <RangePicker value={dates} onChange={handleDateChange} allowClear />
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={8}>
          <Card>
            <Statistic
              title="Total Revenue"
              value={dashboardData?.totalRevenue || 0}
              precision={2}
              prefix="₹"
            />
          </Card>
        </Col>

        <Col span={8}>
          <Card>
            <Statistic
              title="Today Revenue"
              value={dashboardData?.todayRevenue || 0}
              precision={2}
              prefix="₹"
            />
          </Card>
        </Col>

        <Col span={8}>
          <Card>
            <Statistic
              title="Pending Invoice"
              value={dashboardData?.pendingInvoices || 0}
              valueStyle={{ color: "#cf1322" }}
            />
          </Card>
        </Col>
      </Row>

      <Card style={{ marginTop: 16, borderRadius: 10 }}>
        {reports[activeReport]}
      </Card>
    </div>
  );
};

export default Report;

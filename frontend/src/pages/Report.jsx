import { useState, useEffect } from "react";
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
import apiService from "../service/apiService";

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const Report = () => {
  const [activeReport, setActiveReport] = useState("monthly");
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dates, setDates] = useState([]);

  const fetchReport = async (filters = {}) => {
    try {
      setLoading(true);
      const response = await apiService.getDashboardData(filters);
      setReport(response.data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, []);

  const handleDateChange = (value) => {
    if (!value) {
      setDates([]);
      fetchReport();
      return;
    }

    const filters = {
      startDate: value[0].startOf("day").toISOString(),
      endDate: value[1].endOf("day").toISOString(),
    };

    setDates(value);
    fetchReport(filters);
  };

  if (loading || !report) return <Spin size="large" />;

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
    yearly: <YearlyRevenueReport />,
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
                onClick={() => setActiveReport(item.key)}
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
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Revenue"
              value={report?.totalRevenue || 0}
              precision={2}
              prefix="₹"
            />
          </Card>
        </Col>

        <Col span={6}>
          <Card>
            <Statistic
              title="Today's Revenue"
              value={report?.todayRevenue || 0}
              precision={2}
              prefix="₹"
            />
          </Card>
        </Col>

        <Col span={6}>
          <Card>
            <Statistic
              title="Pending Invoices"
              value={report?.pendingInvoices || 0}
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

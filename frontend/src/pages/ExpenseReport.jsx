import { useState } from "react";
import { Card, Col, Row, Typography, DatePicker, Spin, Statistic } from "antd";
import {
  BarChartOutlined,
  CalendarOutlined,
  RiseOutlined,
  UserOutlined,
} from "@ant-design/icons";
import MonthlyExpenseModel from "../components/MonthlyExpenseModel";
import YearlyExpenseModel from "../components/YearlyExpenseModel";
import TodayExpenseModel from "../components/TodayExpenseModel";
import TopVendorModel from "../components/TopVendorModel";
import { useGetDashBoardQuery } from "../service/reportApi";

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const ExpenseReport = () => {
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

  const expenseReportData = data?.data || {};

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

  if (isLoading && !expenseReportData) return <Spin size="large" />;

  const reportMenu = [
    {
      key: "monthly",
      title: "Monthly Report",
      description: "Expense trends month by month",
      icon: <CalendarOutlined style={{ fontSize: 20 }} />,
    },
    {
      key: "yearly",
      title: "Yearly Report",
      description: "Year-over-year expense overview",
      icon: <RiseOutlined style={{ fontSize: 20 }} />,
    },
    {
      key: "today",
      title: "Today's Report",
      description: "Expense details for today",
      icon: <BarChartOutlined style={{ fontSize: 20 }} />,
    },
    {
      key: "topVendors",
      title: "Top Vendors",
      description: "Vendors with highest expenses",
      icon: <UserOutlined style={{ fontSize: 20 }} />,
    },
  ];

  const reports = {
    monthly: <MonthlyExpenseModel dates={dates} />,
    yearly: <YearlyExpenseModel dates={dates} />,
    today: <TodayExpenseModel />,
    topVendors: <TopVendorModel dates={dates} />,
  };
  return (
    <div style={{ padding: "8px" }}>
      <Title level={3} style={{ marginBottom: 4 }}>
        Expense Report
      </Title>
      <Text type="secondary" style={{ marginBottom: 20, display: "block" }}>
        Analyze your expenses with customizable reports
      </Text>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        {reportMenu.map((report) => {
          const isActive = activeReport === report.key;

          return (
            <Col xs={24} sm={12} lg={6} key={report.key}>
              <Card
                hoverable
                onClick={() => handleReportChange(report.key)}
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
                  {report.icon}
                  <div>
                    <div style={{ fontWeight: 600 }}>{report.title}</div>
                    <Text type="secondary">{report.description}</Text>
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
              title="Total Expense"
              value={expenseReportData?.totalExpense || 0}
              precision={2}
              prefix="₹"
            />
          </Card>
        </Col>

        <Col span={8}>
          <Card>
            <Statistic
              title="Today Expense"
              value={expenseReportData?.todayExpense || 0}
              precision={2}
              prefix="₹"
            />
          </Card>
        </Col>

        <Col span={8}>
          <Card>
            <Statistic
              title="Pending Bills"
              value={expenseReportData?.pendingBills || 0}
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

export default ExpenseReport;

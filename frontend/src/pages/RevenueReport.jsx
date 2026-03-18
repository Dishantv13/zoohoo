import { useState } from "react";
import { Spin } from "antd";
import {
  BarChartOutlined,
  CalendarOutlined,
  RiseOutlined,
  UserOutlined,
} from "@ant-design/icons";
import ReportDashboard from "../chartModel/ReportDashboard";
import MonthlyRevenueReport from "../chartModel/MonthlyRevenueModel";
import YearlyRevenueReport from "../chartModel/YearlyRevenueModel";
import TodayRevenueReport from "../chartModel/TodayRevenueModel";
import TopCustomerReport from "../chartModel/TopCustomerModel";
import { useGetDashBoardQuery } from "../service/reportApi";

const RevenueReport = () => {
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
      <ReportDashboard
        title="Revenue Report"
        subtitle="Analyze your revenue with customizable reports"
        reportMenu={reportMenu}
        activeReport={activeReport}
        handleReportChange={handleReportChange}
        dates={dates}
        handleDateChange={handleDateChange}
        reports={reports}
        stats={[
          {
            title: "Total Revenue",
            value: dashboardData?.totalRevenue,
            prefix: "₹",
          },
          {
            title: "Today Revenue",
            value: dashboardData?.todayRevenue,
            prefix: "₹",
          },
          {
            title: "Pending Invoice",
            value: dashboardData?.pendingInvoices,
            valueStyle: { color: "#cf1322" },
          },
        ]}
      />
    </div>
  );
};

export default RevenueReport;

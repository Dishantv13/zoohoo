import { useState } from "react";
import { Spin } from "antd";
import {
  BarChartOutlined,
  CalendarOutlined,
  RiseOutlined,
  UserOutlined,
} from "@ant-design/icons";
import ReportDashboard from "../components/chartModel/ReportDashboard";
import MonthlyExpenseModel from "../components/chartModel/MonthlyExpenseModel";
import YearlyExpenseModel from "../components/chartModel/YearlyExpenseModel";
import TodayExpenseModel from "../components/chartModel/TodayExpenseModel";
import TopVendorModel from "../components/chartModel/TopVendorModel";
import { useGetDashBoardQuery } from "../service/reportApi";

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
    today: <TodayExpenseModel dates={dates} />,
    topVendors: <TopVendorModel dates={dates} />,
  };
  return (
    <div style={{ padding: "8px" }}>
      <ReportDashboard
        title="Expense Report"
        subtitle="Analyze your expenses with customizable reports"
        reportMenu={reportMenu}
        activeReport={activeReport}
        handleReportChange={handleReportChange}
        dates={dates}
        handleDateChange={handleDateChange}
        reports={reports}
        stats={[
          {
            title: "Total Expense",
            value: expenseReportData?.totalExpense,
            prefix: "₹",
          },
          {
            title: "Today Expense",
            value: expenseReportData?.todayExpense,
            prefix: "₹",
          },
          {
            title: "Pending Bills",
            value: expenseReportData?.pendingBills,
            valueStyle: { color: "#cf1322" },
          },
        ]}
      />
    </div>
  );
};

export default ExpenseReport;

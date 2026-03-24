import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Spin } from "antd";
import dayjs from "dayjs";
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
  const [searchParams, setSearchParams] = useSearchParams();
  const report = searchParams.get("report") || "";
  const startDateParam = searchParams.get("startDate");
  const endDateParam = searchParams.get("endDate");
  const dates =
    startDateParam && endDateParam
      ? [dayjs(startDateParam), dayjs(endDateParam)]
      : [];

  const queryDates =
    report === "monthly" && dates.length === 2
      ? [dates[0].startOf("month"), dates[0].endOf("month")]
      : dates;

  const { data, isLoading } = useGetDashBoardQuery({
    startDate:
      queryDates && queryDates.length === 2
        ? queryDates[0].startOf("day").toISOString()
        : undefined,
    endDate:
      queryDates && queryDates.length === 2
        ? queryDates[1].endOf("day").toISOString()
        : undefined,
  });

  const expenseReportData = data?.data || {};

  const handleDateChange = (value) => {
    const params = new URLSearchParams(searchParams);

    if (!value || value.length !== 2) {
      params.delete("startDate");
      params.delete("endDate");
      setSearchParams(params);
      return;
    }

    const start =
      report === "monthly"
        ? value[0].startOf("month")
        : value[0].startOf("day");
    const end =
      report === "monthly" ? value[0].endOf("month") : value[1].endOf("day");

    params.set("startDate", start.toISOString());
    params.set("endDate", end.toISOString());
    setSearchParams(params);
  };

  const handleReportChange = (reportKey) => {
    const params = new URLSearchParams(searchParams);
    params.set("report", reportKey);
    params.delete("startDate");
    params.delete("endDate");
    setSearchParams(params);
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
        activeReport={report}
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

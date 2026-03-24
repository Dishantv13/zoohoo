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
import MonthlyRevenueReport from "../components/chartModel/MonthlyRevenueModel";
import YearlyRevenueReport from "../components/chartModel/YearlyRevenueModel";
import TodayRevenueReport from "../components/chartModel/TodayRevenueModel";
import TopCustomerReport from "../components/chartModel/TopCustomerModel";
import { useGetDashBoardQuery } from "../service/reportApi";

const RevenueReport = () => {
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

  const dashboardData = data?.data || {};

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
      report === "monthly"
        ? value[0].endOf("month")
        : value[1].endOf("day");

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
        activeReport={report}
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

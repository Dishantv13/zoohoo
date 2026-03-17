import { useState } from "react";
import { Spin } from "antd";
import { useGetDashBoardQuery } from "../service/reportApi";
import ReportDashboard from "../components/ReportDashboard";

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
      <ReportDashboard
        title="Financial Dashboard"
        subtitle="Overview of your company financial performance"
        dates={date}
        handleDateChange={handleDateChange}
        sections={[
          {
            title: "Total Performance",
            stats: [
              {
                title: "Total Revenue",
                value: dashboardData?.totalRevenue,
                prefix: <>₹</>,
                valueStyle: { color: "#3f8600" },
              },
              {
                title: "Total Expense",
                value: dashboardData?.totalExpense,
                prefix: <>₹</>,
                valueStyle: { color: "#cf1322" },
              },
              {
                title: isProfit ? "Total Profit" : "Total Loss",
                value: value,
                prefix: <>₹</>,
                valueStyle: { color: isProfit ? "#3f8600" : "#cf1322" },
              },
            ],
          },
          {
            title: "Today Performance",
            stats: [
              {
                title: "Today Revenue",
                value: dashboardData?.todayRevenue,
                prefix: <>₹</>,
                valueStyle: { color: "#3f8600" },
              },
              {
                title: "Today Expense",
                value: dashboardData?.todayExpense,
                prefix: <>₹</>,
                valueStyle: { color: "#cf1322" },
              },
              {
                title: isTodayProfit ? "Today Profit" : "Today Loss",
                value: todayValue,
                prefix: <>₹</>,
                valueStyle: {
                  color: isTodayProfit ? "#3f8600" : "#cf1322",
                },
              },
            ],
          },
        ]}
      />
    </div>
  );
};

export default Report;

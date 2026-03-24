import { useSearchParams } from "react-router-dom";
import { Spin } from "antd";
import dayjs from "dayjs";
import { useGetDashBoardQuery } from "../service/reportApi";
import ReportDashboard from "../components/chartModel/ReportDashboard";

const Report = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const startDateParam = searchParams.get("startDate");
  const endDateParam = searchParams.get("endDate");
  const date =
    startDateParam && endDateParam
      ? [dayjs(startDateParam), dayjs(endDateParam)]
      : [];

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
    const params = new URLSearchParams(searchParams);

    if (!value || value.length !== 2) {
      params.delete("startDate");
      params.delete("endDate");
      setSearchParams(params);
      return;
    }

    params.set("startDate", value[0].startOf("day").toISOString());
    params.set("endDate", value[1].endOf("day").toISOString());
    setSearchParams(params);
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

import { Spin } from "antd";
import { useGetTodayRevenueQuery } from "../../service/reportApi";
import TodayLineChart from "./TodayLineChart";

const TodayRevenueReport = ({ dates }) => {
  const { data, isLoading } = useGetTodayRevenueQuery({
    date: dates && dates.length === 2 ? dates[1].toISOString() : undefined,
  });

  const todayData = data?.data || [];

  if (isLoading) return <Spin size="large" />;

  return (
    <TodayLineChart
      title="Today Revenue Graph (1 to 24 hours)"
      data={todayData}
      isLoading={isLoading}
      dataKey="hourlyRevenue"
      valueKey="totalRevenue"
      label="Revenue"
    />
  );
};

export default TodayRevenueReport;

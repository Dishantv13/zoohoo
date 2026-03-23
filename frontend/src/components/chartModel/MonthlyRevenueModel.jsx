import { Spin } from "antd";
import { useGetRevenueByMonthQuery } from "../../service/reportApi";
import CommonBarChart from "./CommonBarChart";

const MonthlyRevenueReport = ({ dates }) => {
  const { data, isLoading } = useGetRevenueByMonthQuery({
    month: dates && dates.length === 2 ? dates[0].month() + 1 : undefined,
    year: dates && dates.length === 2 ? dates[0].year() : undefined,
  });

  const reportData = data?.data || [];

  if (isLoading) return <Spin size="large" />;
  return (
    <CommonBarChart
      title="Monthly Revenue Graph"
      data={reportData}
      isLoading={isLoading}
      dataKey="totalRevenue"
      label="Revenue"
      xAxisTitle="Months"
      labelFormatter={(item) => `Month ${item.month}/${item.year}`}
    />
  );
};

export default MonthlyRevenueReport;

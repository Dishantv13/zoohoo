import { Spin } from "antd";
import { useGetRevenueByYearQuery } from "../../service/reportApi";
import CommonBarChart from "./CommonBarChart";

const YearlyRevenueReport = ({ dates }) => {
  const { data, isLoading } = useGetRevenueByYearQuery({
    year: dates && dates.length === 2 ? dates[0].year() : undefined,
  });

  const yearlyRevenueData = data?.data || [];

  if (isLoading) return <Spin size="large" />;

  return (
    <CommonBarChart
      title="Yearly Revenue Graph"
      data={yearlyRevenueData}
      isLoading={isLoading}
      dataKey="totalRevenue"
      label="Revenue"
      xAxisTitle="Years"
      labelFormatter={(item) => item.year}
      color="rgba(195, 2, 2, 0.6)"
    />
  );
};

export default YearlyRevenueReport;

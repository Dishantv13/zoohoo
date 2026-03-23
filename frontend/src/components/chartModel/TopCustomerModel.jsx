import { Spin } from "antd";
import { useGetTopCustomersQuery } from "../../service/reportApi";
import CommonBarChart from "./CommonBarChart";

const TopCustomerReport = ({ dates }) => {
  const { data, isLoading } = useGetTopCustomersQuery({
    month: dates && dates.length === 2 ? dates[0].month() + 1 : undefined,
    year: dates && dates.length === 2 ? dates[0].year() : undefined,
  });

  const topCustomerData = data?.data || [];

  if (isLoading) return <Spin size="large" />;

  return (
    <CommonBarChart
      title="Top Customers"
      data={topCustomerData}
      isLoading={isLoading}
      dataKey="totalAmount"
      label="Total Spent"
      xAxisTitle="Top Customers"
      labelFormatter={(item) => item.customer}
      color="rgba(206, 126, 8, 0.6)"
    />
  );
};

export default TopCustomerReport;

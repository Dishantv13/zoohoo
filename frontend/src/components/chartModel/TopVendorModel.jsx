import { Spin } from "antd";
import { useGetTopVendorsQuery } from "../../service/reportApi";
import CommonBarChart from "./CommonBarChart";

const TopVendorModel = ({ dates }) => {
  const { data, isLoading } = useGetTopVendorsQuery({
    month: dates && dates.length === 2 ? dates[0].month() + 1 : undefined,
    year: dates && dates.length === 2 ? dates[0].year() : undefined,
  });

  const topVendorData = data?.data || [];

  if (isLoading) return <Spin size="large" />;

  return (
    <CommonBarChart
      title="Top Vendors"
      data={topVendorData}
      isLoading={isLoading}
      dataKey="totalAmount"
      label="Total Received"
      xAxisTitle="Top Vendors"
      labelFormatter={(item) => item.vendor}
      color="rgba(206, 126, 8, 0.6)"
    />
  );
};

export default TopVendorModel;

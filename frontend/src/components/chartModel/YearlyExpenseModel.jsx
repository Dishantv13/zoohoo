import { Spin } from "antd";
import { useGetYearlyExpenseQuery } from "../../service/reportApi";
import CommonBarChart from "./CommonBarChart";

const YearlyExpenseModel = ({ dates }) => {
  const { data, isLoading } = useGetYearlyExpenseQuery({
    year: dates && dates.length === 2 ? dates[0].year() : undefined,
  });

  const yearlyExpenseData = data?.data || [];

  if (isLoading) return <Spin size="large" />;

  return (
    <CommonBarChart
      title="Yearly Expense Graph"
      data={yearlyExpenseData}
      isLoading={isLoading}
      dataKey="totalExpense"
      label="Expense"
      xAxisTitle="Years"
      labelFormatter={(item) => item.year}
      color="rgba(195, 2, 2, 0.6)"
    />
  );
};

export default YearlyExpenseModel;

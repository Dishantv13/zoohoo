import { Spin } from "antd";
import { useGetMonthlyExpenseQuery } from "../../service/reportApi";
import CommonBarChart from "./CommonBarChart";

const MonthlyExpenseReport = ({ dates }) => {
  const { data, isLoading } = useGetMonthlyExpenseQuery({
    month: dates && dates.length === 2 ? dates[0].month() + 1 : undefined,
    year: dates && dates.length === 2 ? dates[0].year() : undefined,
  });

  const reportData = data?.data || [];

  if (isLoading) return <Spin size="large" />;

  return (
    <CommonBarChart
      title="Monthly Expense Graph"
      data={reportData}
      isLoading={isLoading}
      dataKey="totalExpense"
      label="Expense"
      xAxisTitle="Months"
      labelFormatter={(item) => `Month ${item.month}/${item.year}`}
    />
  );
};
export default MonthlyExpenseReport;

import { Spin } from "antd";
import { useGetTodayExpenseQuery } from "../../service/reportApi";
import TodayLineChart from "./TodayLineChart";

const TodayExpenseModel = ({ dates }) => {
  const { data, isLoading } = useGetTodayExpenseQuery({
    date: dates && dates.length === 2 ? dates[1].toISOString() : undefined,
  });

  const todayExpenseData = data?.data || [];

  if (isLoading) return <Spin size="large" />;
  return (
    <TodayLineChart
      title="Today Expense Graph (1 to 24 hours)"
      data={todayExpenseData}
      isLoading={isLoading}
      dataKey="hourlyExpense"
      valueKey="totalExpense"
      label="Expense"
    />
  );
};

export default TodayExpenseModel;

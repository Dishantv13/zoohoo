import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);
import { Row, Col, Card, Spin } from "antd";
import { Bar } from "react-chartjs-2";
import { useGetYearlyExpenseQuery } from "../service/reportApi";

const YearlyExpenseModel = ({ dates }) => {
  const { data, isLoading } = useGetYearlyExpenseQuery({
    year: dates && dates.length === 2 ? dates[0].year() : undefined,
  });

  const yearlyExpenseData = data?.data || [];

  if (isLoading) return <Spin size="large" />;

  return (
    <>
      <Row style={{ marginTop: 20 }}>
        <Col span={24}>
          <Card title="Yearly Expense Graph">
            <Bar
              data={{
                labels: yearlyExpenseData?.map((item) => item.year) || [],
                datasets: [
                  {
                    label: "Expense",
                    data:
                      yearlyExpenseData?.map((item) =>
                        Number(item.totalExpense || 0).toFixed(2),
                      ) || [],
                    backgroundColor: "rgba(2, 117, 195, 0.6)",
                    borderColor: "rgb(0, 0, 0)",
                    borderWidth: 2,
                    borderRadius: 8,
                    minBarLength: 10,
                  },
                ],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: true,
                    position: "top",
                  },
                  tooltip: {
                    backgroundColor: "#001529",
                    titleColor: "#fff",
                    bodyColor: "#fff",
                    padding: 12,
                    callbacks: {
                      label: function (context) {
                        return ` ₹ ${context.raw}`;
                      },
                    },
                  },
                },
                scales: {
                  x: {
                    grid: {
                      display: false,
                    },
                    title: {
                      display: true,
                      text: "Years",
                      color: "#595959",
                      font: {
                        size: 16,
                        weight: "bold",
                      },
                    },
                    ticks: {
                      color: "#595959",
                    },
                  },
                  y: {
                    ticks: {
                      color: "#595959",
                      callback: function (value) {
                        return "₹ " + value;
                      },
                    },
                    beginAtZero: true,
                  },
                },
              }}
              height={280}
            />
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default YearlyExpenseModel;

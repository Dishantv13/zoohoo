import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  LineElement,
  Tooltip,
  Legend,
  PointElement,
);

import { Row, Col, Card, Spin } from "antd";
import { Line } from "react-chartjs-2";
import { useGetTodayExpenseQuery } from "../service/reportApi";

const TodayExpenseModel = ({ dates }) => {
  const { data, isLoading } = useGetTodayExpenseQuery({
    date: dates && dates.length === 2 ? dates[1].toISOString() : undefined,
  });

  const todayExpenseData = data?.data || [];

  if (isLoading) return <Spin size="large" />;
  return (
    <div>
      <Row style={{ marginTop: 20 }}>
        <Col span={24}>
          <Card title="Today Expense Graph (1 to 24 hours)">
            <Line
              data={{
                labels:
                  todayExpenseData?.hourlyExpense?.map((item) => item.hour) ||
                  [],
                datasets: [
                  {
                    label: "Expense",
                    data:
                      todayExpenseData?.hourlyExpense?.map(
                        (item) => item.totalExpense || 0,
                      ) || [],
                    fill: false,
                    borderColor: "rgb(75, 192, 192)",
                    tension: 0.1,
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
                      text: "Hour of the Day",
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
    </div>
  );
};

export default TodayExpenseModel;

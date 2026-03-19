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
import { useGetTodayRevenueQuery } from "../../service/reportApi";

const TodayRevenueReport = ({ dates }) => {
  const { data, isLoading } = useGetTodayRevenueQuery({
    date: dates && dates.length === 2 ? dates[1].toISOString() : undefined,
  });

  const todayData = data?.data || [];

  if (isLoading) return <Spin size="large" />;

  return (
    <>
      <Row style={{ marginTop: 20 }}>
        <Col span={24}>
          <Card title="Today Revenue Graph (1 to 24 hours)">
            <Line
              data={{
                labels:
                  todayData?.hourlyRevenue?.map((item) => item.hour) || [],
                datasets: [
                  {
                    label: "Revenue",
                    data:
                      todayData?.hourlyRevenue?.map(
                        (item) => item.totalRevenue || 0,
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
    </>
  );
};

export default TodayRevenueReport;

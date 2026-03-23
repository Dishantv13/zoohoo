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

const TodayLineChart = ({
  title,
  data,
  isLoading,
  dataKey,
  valueKey,
  label,
}) => {
  if (isLoading) return <Spin size="large" />;

  const chartData = data?.[dataKey] || [];

  return (
    <Row style={{ marginTop: 20 }}>
      <Col span={24}>
        <Card title={title}>
          <Line
            height={280}
            data={{
              labels: chartData.map((item) => item.hour),
              datasets: [
                {
                  label,
                  data: chartData.map((item) => item[valueKey] || 0),
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
                  grid: { display: false },
                  title: {
                    display: true,
                    text: "Hour of the Day",
                    color: "#595959",
                    font: { size: 16, weight: "bold" },
                  },
                  ticks: { color: "#595959" },
                },
                y: {
                  beginAtZero: true,
                  ticks: {
                    color: "#595959",
                    callback: (value) => "₹ " + value,
                  },
                },
              },
            }}
          />
        </Card>
      </Col>
    </Row>
  );
};

export default TodayLineChart;
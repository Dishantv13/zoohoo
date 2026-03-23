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

const CommonBarChart = ({
  title,
  data = [],
  isLoading,
  dataKey,
  label,
  labelFormatter,
  color = "rgba(24, 144, 255, 0.6)",
  xAxisTitle = "Data",
  showLegend = true,
}) => {
  if (isLoading) return <Spin size="large" />;

  return (
    <Row gutter={16} style={{ marginTop: 20 }}>
      <Col span={24}>
        <Card title={title}>
          <Bar
            height={280}
            data={{
              labels: data.map((item) =>
                labelFormatter ? labelFormatter(item) : item.name,
              ),
              datasets: [
                {
                  label,
                  data: data.map((item) =>
                    Number(item[dataKey] || 0).toFixed(2),
                  ),
                  backgroundColor: color,
                  borderColor: color.replace("0.6", "1"),
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
                legend: { display: showLegend },
                tooltip: {
                  backgroundColor: "#001529",
                  titleColor: "#fff",
                  bodyColor: "#fff",
                  padding: 12,
                  callbacks: {
                    label: (context) => ` ₹ ${context.raw}`,
                  },
                },
              },
              scales: {
                x: {
                  grid: { display: false },
                  title: {
                    display: true,
                    text: xAxisTitle,
                    color: "#595959",
                    font: { size: 16, weight: "bold" },
                  },
                  ticks: { color: "#595959" },
                },
                y: {
                  ticks: {
                    color: "#595959",
                    callback: (value) => "₹ " + value,
                  },
                  beginAtZero: true,
                },
              },
            }}
          />
        </Card>
      </Col>
    </Row>
  );
};

export default CommonBarChart;

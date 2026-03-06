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
import { useGetRevenueByMonthQuery } from "../features/report/reportApi";

const MonthlyRevenueReport = ({dates}) => {
  const { data, isLoading } = useGetRevenueByMonthQuery({
    month: dates && dates.length === 2 ? dates[0].month() + 1 : undefined,
    year: dates && dates.length === 2 ? dates[0].year() : undefined,
  });

  const reportData = data?.data || [];

  if (isLoading) return <Spin size="large" />;
  return (
    <>
      <Row gutter={16} style={{ marginTop: 20 }}>
        <Col span={24}>
          <Card title="Monthly Revenue Graph">
            <Bar
              data={{
                labels:
                  reportData?.map((item) => `${item.month}/${item.year}`) || [],
                datasets: [
                  {
                    label: "Revenue",
                    data:
                      reportData?.map((item) =>
                        Number(item.totalRevenue || 0).toFixed(2),
                      ) || [],
                    backgroundColor: "rgba(24, 144, 255, 0.6)",
                    borderColor: "rgba(24, 144, 255, 1)",
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

export default MonthlyRevenueReport;

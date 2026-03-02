import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
);
import { useEffect, useState } from "react";
import { Row, Col, Card, Spin } from "antd";
import { Bar } from "react-chartjs-2";
import apiService from "../service/apiService";

const MonthlyRevenueReport = ({ dates }) => {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchReport = async (filters = {}) => {
    try {
      setLoading(true);
      const response = await apiService.getDashboardData(filters);
      setReport(response.data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (dates && dates.length === 2) {
      const filters = {
        startDate: dates[0].startOf("day").toISOString(),
        endDate: dates[1].endOf("day").toISOString(),
      };

      fetchReport(filters);
    } else {
      fetchReport();
    }
  }, [dates]);

  if (loading || !report) return <Spin size="large" />;
  return (
    <>
      <Row gutter={16} style={{ marginTop: 20 }}>
        <Col span={24}>
          <Card title="Monthly Revenue Graph">
            <Bar
              data={{
                labels:
                  report?.monthlyRevenue?.map(
                    (item) => `${item.month}/${item.year}`,
                  ) || [],
                datasets: [
                  {
                    label: "Revenue",
                    data:
                      report?.monthlyRevenue?.map((item) =>
                        Number(item.totalRevenue || 0).toFixed(2),
                      ) || [],
                    backgroundColor: "rgba(24, 144, 255, 0.6)",
                    borderColor: "rgba(24, 144, 255, 1)",
                    borderWidth: 1,
                    borderRadius: 8,
                    minBarLength: 10,
                  },
                ],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
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

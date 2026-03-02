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

const YearlyRevenueReport = () => {
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
    fetchReport();
  }, []);

  if (loading || !report) return <Spin size="large" />;

  return (
    <>
      <Row style={{ marginTop: 20 }}>
        <Col span={24}>
          <Card title="Yearly Revenue Graph">
            <Bar
              data={{
                labels: report?.yearlyRevenue?.map((item) => item.year) || [],
                datasets: [
                  {
                    label: "Revenue",
                    data:
                      report?.yearlyRevenue?.map((item) =>
                        Number(item.totalRevenue || 0).toFixed(2),
                      ) || [],
                    backgroundColor: "rgba(195, 2, 2, 0.6)",
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
                scales: {
                  x: {
                    grid: {
                      display: false,
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

export default YearlyRevenueReport;

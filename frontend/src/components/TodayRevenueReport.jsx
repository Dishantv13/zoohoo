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
import { Line } from "react-chartjs-2";
import apiService from "../service/apiService";
import dayjs from "dayjs";

const TodayRevenueReport = ({ dates }) => {
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
    let filters = {};

    if (dates && dates.length === 2) {
      filters = {
        startDate: dates[0].startOf("day").toISOString(),
        endDate: dates[1].endOf("day").toISOString(),
      };
    } else {
      const today = dayjs();
      filters = {
        startDate: today.startOf("day").toISOString(),
        endDate: today.endOf("day").toISOString(),
      };
    }

    fetchReport(filters);
  }, [dates]);

  if (loading || !report) return <Spin size="large" />;

  return (
    <>
      <Row style={{ marginTop: 20 }}>
        <Col span={24}>
          <Card title="Today's Revenue Graph">
            <Line
              data={{
                labels:
                  report?.todayRevenueChart?.map((item) => `${item.hour}:00`) ||
                  [],
                datasets: [
                  {
                    label: "Revenue",
                    data:
                      report?.todayRevenueChart?.map(
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

export default TodayRevenueReport;

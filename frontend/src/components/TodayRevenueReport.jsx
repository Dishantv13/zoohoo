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
      const response = await apiService.getTodayRevenue(filters);
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
        date: dates[1].toISOString(),
      };
    } else {
      const today = dayjs();
      filters = {
        date: today.toISOString(),
      };
    }

    fetchReport(filters);
  }, [dates]);

  if (loading || !report) return <Spin size="large" />;

  return (
    <>
      <Row style={{ marginTop: 20 }}>
        <Col span={24}>
          <Card title="Today Revenue Graph (1 to 24 hours)">
            <Line
              data={{
                labels: report?.hourlyRevenue?.map((item) => item.hour) || [],
                datasets: [
                  {
                    label: "Revenue",
                    data:
                      report?.hourlyRevenue?.map(
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

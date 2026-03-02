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

const TopCustomerReport = ({ dates }) => {
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
    }

    fetchReport(filters);
  }, [dates]);

  if (loading || !report) return <Spin size="large" />;

  return (
    <>
      <Row style={{ marginTop: 20 }}>
        <Col span={24}>
          <Card title="Top Customers Graph">
            <Bar
              height={280}
              data={{
                labels:
                  report?.topCustomers?.map((item) => item.customer) || [],
                datasets: [
                  {
                    label: "Total Spent",
                    data:
                      report?.topCustomers?.map((item) =>
                        Number(item.totalSpent || 0).toFixed(2),
                      ) || [],
                    backgroundColor: "rgba(206, 126, 8, 0.6)",
                    borderColor: "rgb(0, 0, 0)",
                    borderWidth: 2,
                    borderRadius: 8,
                    barThickness: 120,
                  },
                ],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: false,
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
                    grid: {
                      color: "#f0f0f0",
                    },
                    ticks: {
                      color: "#595959",
                      callback: function (value) {
                        return "₹ " + value;
                      },
                    },
                  },
                },
              }}
            />
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default TopCustomerReport;

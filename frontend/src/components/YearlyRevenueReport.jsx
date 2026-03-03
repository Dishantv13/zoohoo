import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);
import { useEffect, useState } from "react";
import { Row, Col, Card, Spin } from "antd";
import { Bar } from "react-chartjs-2";
import apiService from "../service/apiService";

const YearlyRevenueReport = ({ dates }) => {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchReport = async (filters = {}) => {
    try {
      setLoading(true);
      const response = await apiService.getYearlyRevenue(filters);
      setReport(response.data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (dates && dates.length === 2) {
      fetchReport({ year: dates[0].year() });
      return;
    }

    fetchReport();
  }, [dates]);

  if (loading || !report) return <Spin size="large" />;

  return (
    <>
      <Row style={{ marginTop: 20 }}>
        <Col span={24}>
          <Card title="Yearly Revenue Graph">
            <Bar
              data={{
                labels: report?.map((item) => item.year) || [],
                datasets: [
                  {
                    label: "Revenue",
                    data:
                      report?.map((item) =>
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
                      text: "Years",
                      color: "rgba(195, 2, 2, 1)",
                      font: {
                        size: 20,
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

export default YearlyRevenueReport;

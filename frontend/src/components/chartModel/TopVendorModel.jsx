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
import { useGetTopVendorsQuery } from "../service/reportApi";

const TopVendorModel = ({ dates }) => {
  const { data, isLoading } = useGetTopVendorsQuery({
    month: dates && dates.length === 2 ? dates[0].month() + 1 : undefined,
    year: dates && dates.length === 2 ? dates[0].year() : undefined,
  });

  const topVendorData = data?.data || [];

  if (isLoading) return <Spin size="large" />;

  return (
    <>
      <Row style={{ marginTop: 20 }}>
        <Col span={24}>
          <Card title="Top Vendors Graph">
            <Bar
              height={280}
              data={{
                labels: topVendorData?.map((item) => item.vendor) || [],
                datasets: [
                  {
                    label: "Total Received",
                    data:
                      topVendorData?.map((item) => item.totalAmount || 0) ||
                      [],
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
                    title: {
                      display: true,
                      text: "Top Vendors",
                      color: "rgba(206, 126, 8, 1)",
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

export default TopVendorModel;

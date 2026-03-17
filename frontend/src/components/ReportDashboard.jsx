import { Card, Row, Col, Typography, Statistic, DatePicker } from "antd";

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const ReportDashboard = ({
  title,
  subtitle,
  reportMenu,
  activeReport,
  handleReportChange,
  dates,
  handleDateChange,
  stats,
  sections,
  reports,
}) => {
  return (
    <>
      <Title level={3}>{title}</Title>
      <Text type="secondary">{subtitle}</Text>

      {reportMenu && (
        <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
          {reportMenu.map((item) => {
            const isActive = activeReport === item.key;

            return (
              <Col xs={24} sm={12} lg={6} key={item.key}>
                <Card
                  hoverable
                  onClick={() => handleReportChange(item.key)}
                  style={{
                    borderRadius: 10,
                    cursor: "pointer",
                    borderColor: isActive ? "#1677ff" : undefined,
                  }}
                >
                  <div style={{ display: "flex", gap: 10 }}>
                    {item.icon}
                    <div>
                      <div style={{ fontWeight: 600 }}>{item.title}</div>
                      <Text type="secondary">{item.description}</Text>
                    </div>
                  </div>
                </Card>
              </Col>
            );
          })}
        </Row>
      )}

      {handleDateChange && (
        <Row style={{ margin: "20px 0" }}>
          <Col>
            <RangePicker value={dates} onChange={handleDateChange} allowClear />
          </Col>
        </Row>
      )}

      {sections &&
        sections.map((section, i) => (
          <div key={i}>
            <Title level={4} style={{ marginTop: 30 }}>
              {section.title}
            </Title>

            <Row gutter={[16, 16]}>
              {section.stats.map((stat, index) => (
                <Col span={8} key={index}>
                  <Card hoverable>
                    <Statistic
                      title={stat.title}
                      value={stat.value || 0}
                      precision={2}
                      prefix={stat.prefix}
                      valueStyle={stat.valueStyle}
                    />
                  </Card>
                </Col>
              ))}
            </Row>
          </div>
        ))}

      {stats && (
        <Row gutter={16}>
          {stats.map((stat, index) => (
            <Col span={8} key={index}>
              <Card>
                <Statistic {...stat} />
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {reports && (
        <Card style={{ marginTop: 16 }}>
          {reports[activeReport]}
        </Card>
      )}
    </>
  );
};

export default ReportDashboard;
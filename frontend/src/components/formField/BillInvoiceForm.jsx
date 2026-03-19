import {
  Card,
  Form,
  Row,
  Col,
  Select,
  Button,
  Space,
  Table,
  Tag,
  DatePicker,
} from "antd";
import { SearchOutlined, PlusOutlined } from "@ant-design/icons";

const BillInvoiceForm = ({
  title,
  form,
  onFinish,
  partyLabel,
  partyList,
  selectedParty,
  setSelectedParty,
  items,
  itemColumns,
  addItem,
  loading,
  submitText,
  cancelHandler,
  dateField = [],
}) => {
  const totalAmount = items.reduce(
    (sum, item) => sum + Number(item.quantity || 0) * Number(item.rate || 0),
    0,
  );

  return (
    <Card title={title}>
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        autoComplete="off"
      >
        <Row gutter={16}>
          <Col xs={24} sm={12} lg={6}>
            <Form.Item label={`Select ${partyLabel}`} required>
              <Select
                placeholder={`Search and select ${partyLabel}`}
                value={selectedParty}
                prefix={<SearchOutlined />}
                onChange={setSelectedParty}
                showSearch
                filterOption={(input, option) =>
                  (option?.label ?? "")
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
                options={partyList.map((p) => ({
                  label: `${p.name} (${p.email})`,
                  value: p._id,
                }))}
              />
            </Form.Item>
          </Col>

          {dateField.map((field) => (
            <Col key={field.name} xs={24} sm={12} lg={6}>
              <Form.Item
                name={field.name}
                label={field.label}
                rules={field.rules}
              >
                <DatePicker style={{ width: "100%" }} />
              </Form.Item>
            </Col>
          ))}

          <Col
            xs={24}
            sm={12}
            lg={6}
            style={{ display: "flex", alignItems: "center" }}
          >
            <Space>
              <span style={{ fontWeight: 500 }}>Total</span>
              <Tag color="geekblue" style={{ fontSize: 16 }}>
                ₹{totalAmount.toFixed(2)}
              </Tag>
            </Space>
          </Col>
        </Row>

        <Table
          rowKey={(record, index) => index}
          dataSource={items}
          columns={itemColumns}
          pagination={false}
          scroll={{ x: true }}
        />

        <Space style={{ marginTop: 16 }}>
          <Button
            icon={<PlusOutlined />}
            onClick={addItem}
            disabled={!selectedParty}
          >
            Add Item
          </Button>

          <Button type="primary" htmlType="submit" loading={loading}>
            {submitText}
          </Button>

          <Button onClick={cancelHandler}>Cancel</Button>
        </Space>
      </Form>
    </Card>
  );
};

export default BillInvoiceForm;

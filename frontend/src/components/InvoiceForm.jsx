import React from "react";
import {
  Form,
  Input,
  InputNumber,
  DatePicker,
  Select,
  Row,
  Col,
  Button,
} from "antd";
import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";

const InvoiceForm = ({
  form,
  onFinish,
  calculateTotals,
  currentUser,
  isEditing,
}) => {
  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={onFinish}
      onValuesChange={(_, allValues) => calculateTotals(allValues)}
    >
      <Form.Item name="customer" hidden>
        <Input />
      </Form.Item>

      <Form.Item label="Customer">
        <Input value={currentUser?.name || ""} disabled />
      </Form.Item>

      {isEditing && (
        <Form.Item name="invoiceNumber" label="Invoice Number">
          <Input disabled />
        </Form.Item>
      )}

      <Row gutter={20}>
        <Col xs={24} sm={8}>
          <Form.Item
            name="invoiceDate"
            label="Invoice Date"
            rules={[{ required: true, message: "Please select invoice date" }]}
          >
            <DatePicker style={{ width: "100%" }} />
          </Form.Item>
        </Col>

        <Col xs={24} sm={8}>
          <Form.Item
            name="dueDate"
            label="Due Date"
            rules={[{ required: true, message: "Please select due date" }]}
          >
            <DatePicker style={{ width: "100%" }} />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={20}>
        <Col xs={24} sm={4}>
          <Form.Item name="status" label="Status" initialValue="PENDING">
            <Select disabled>
              <Select.Option value="PENDING">Pending</Select.Option>
            </Select>
          </Form.Item>
        </Col>

        <Col xs={24} sm={4}>
          <Form.Item
            name="discount"
            label="Discount (%)"
            initialValue={0}
          >
            <InputNumber min={0} max={100} style={{ width: "100%" }} />
          </Form.Item>
        </Col>

        <Col xs={24} sm={4}>
          <Form.Item
            name="tax"
            label="Tax Rate (%)"
            initialValue={18}
          >
            <InputNumber min={0} max={100} style={{ width: "100%" }} />
          </Form.Item>
        </Col>
      </Row>

      <Form.List name="items" initialValue={[{ quantity: 1, rate: 0 }]}>
        {(fields, { add, remove }) => (
          <>
            {fields.map(({ key, name }) => (
              <Row key={key} gutter={20} align="middle" style={{ marginBottom: 16 }}>
                <Col span={5}>
                  <Form.Item
                    name={[name, "name"]}
                    label="Item Name"
                    rules={[{ required: true }]}
                  >
                    <Input placeholder="Enter item name" />
                  </Form.Item>
                </Col>

                <Col span={6}>
                  <Form.Item
                    name={[name, "quantity"]}
                    label="Quantity"
                    rules={[{ required: true }]}
                  >
                    <InputNumber min={1} style={{ width: "100%" }} />
                  </Form.Item>
                </Col>

                <Col span={6}>
                  <Form.Item
                    name={[name, "rate"]}
                    label="Rate"
                    rules={[{ required: true }]}
                  >
                    <InputNumber min={0} style={{ width: "100%" }} />
                  </Form.Item>
                </Col>

                <Col span={2} style={{ paddingTop: 30 }}>
                  {fields.length > 1 && (
                    <MinusCircleOutlined
                      onClick={() => remove(name)}
                      style={{ cursor: "pointer", color: "red" }}
                    />
                  )}
                </Col>
              </Row>
            ))}

            <Button
              type="dashed"
              onClick={() => add()}
              icon={<PlusOutlined />}
              style={{ marginTop: 16, width: "100%" }}
            >
              + Add Item
            </Button>
          </>
        )}
      </Form.List>

      <Row gutter={25} style={{ marginTop: 25 }}>
        <Col xs={24} sm={4}>
          <Form.Item name="subTotal" label="Sub Total">
            <InputNumber disabled style={{ width: "100%" }} />
          </Form.Item>
        </Col>

        <Col xs={24} sm={4}>
          <Form.Item name="discountAmount" label="Discount (₹)">
            <InputNumber disabled style={{ width: "100%" }} />
          </Form.Item>
        </Col>

        <Col xs={24} sm={4}>
          <Form.Item name="amountAfterDiscount" label="After Discount (₹)">
            <InputNumber disabled style={{ width: "100%" }} />
          </Form.Item>
        </Col>

        <Col xs={24} sm={4}>
          <Form.Item name="taxAmount" label="Tax Amount (₹)">
            <InputNumber disabled style={{ width: "100%" }} />
          </Form.Item>
        </Col>

        <Col xs={24} sm={4}>
          <Form.Item name="totalAmount" label="Total Amount (₹)">
            <InputNumber disabled style={{ width: "100%", fontWeight: "bold" }} />
          </Form.Item>
        </Col>
      </Row>

      <Form.Item style={{ marginTop: 24 }}>
        <Button type="primary" htmlType="submit" size="large" style={{ width: "100%" }}>
          {isEditing ? "Update Invoice" : "Create Invoice"}
        </Button>
      </Form.Item>
    </Form>
  );
};

export default InvoiceForm;
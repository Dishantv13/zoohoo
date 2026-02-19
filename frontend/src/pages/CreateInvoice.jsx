import "@ant-design/v5-patch-for-react-19";
import {
  Form,
  Input,
  Button,
  Select,
  DatePicker,
  InputNumber,
  notification,
  Spin,
  Row,
  Col,
} from "antd";
import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
import { useSelector } from "react-redux";
import { useEffect, useState } from "react";
import api from "../service/api";
import { useParams, useNavigate } from "react-router-dom";
import dayjs from "dayjs";

export default function CreateInvoice() {
  const [form] = Form.useForm();
  const currentUser = useSelector((state) => state.auth.user);
  const currentUserId = currentUser?._id || currentUser?.id || null;
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const isEditing = !!id;

  const calculateTotals = (values) => {
    if (!values.items && !values.tax && !values.discount) return;

    const items = values.items || [];
    const taxRate = Number(values.tax) || 18;
    const discountRate = Number(values.discount) || 0;

    const subTotal = items.reduce((sum, item) => {
      const quantity = Number(item?.quantity) || 0;
      const rate = Number(item?.rate) || 0;
      return sum + quantity * rate;
    }, 0);

    const discountAmount = (subTotal * discountRate) / 100;
    const amountAfterDiscount = subTotal - discountAmount;
    const taxAmount = (amountAfterDiscount * taxRate) / 100;
    const totalAmount = amountAfterDiscount + taxAmount;

    form.setFieldsValue({
      subTotal: Number(subTotal.toFixed(2)),
      discountAmount: Number(discountAmount.toFixed(2)),
      amountAfterDiscount: Number(amountAfterDiscount.toFixed(2)),
      taxAmount: Number(taxAmount.toFixed(2)),
      totalAmount: Number(totalAmount.toFixed(2)),
    });
  };

  useEffect(() => {
    if (currentUserId && !isEditing) {
      form.setFieldsValue({
        customer: currentUserId,
        tax: 18,
      });
    }
  }, [currentUserId, isEditing, form]);

  useEffect(() => {
    if (isEditing) {
      setLoading(true);
      api
        .get(`/invoices/${id}`)
        .then((response) => {
          const data = response.data.invoice;
          const formData = {
            customer: data.customer._id,
            invoiceNumber: data.invoiceNumber,
            invoiceDate: dayjs(data.invoiceDate),
            dueDate: dayjs(data.dueDate),
            status: data.status,
            items: data.items,
            tax: data.parseTaxRate,
            discount: data.parseDiscount,
            subTotal: data.subtotal,
            discountAmount: data.discount,
            taxAmount: data.tax,
            amountAfterDiscount: data.amountAfterDiscount,
            totalAmount: data.totalAmount,
          };

          form.setFieldsValue(formData);
          setTimeout(() => calculateTotals(formData), 0);
        })
        .catch((error) => {
          notification.error({
            message: "Failed",
            description:
              error.response?.data?.message || "Failed To Load Invoice",
          });
          navigate("/invoices");
        })
        .finally(() => setLoading(false));
    }
  }, [id, isEditing, form, navigate]);

  const onFinish = async (values) => {
    try {
      const finalValues = {
        ...values,
        tax: values.tax || 18,
        discount: values.discount || 0,
        invoiceDate: values.invoiceDate.format("YYYY-MM-DD"),
        dueDate: values.dueDate.format("YYYY-MM-DD"),
      };

      if (isEditing) {
        await api.put(`/invoices/${id}`, finalValues);
        notification.success({
          message: "Success",
          description: "Invoice updated successfully",
        });
      } else {
        await api.post("/invoices", finalValues);
        notification.success({
          message: "Success",
          description: "Invoice created successfully",
        });
      }

      form.resetFields();
      navigate("/invoices");
    } catch (error) {
      notification.error({
        message: "Failed",
        description: error.response?.data?.message || "Something went wrong",
      });
    }
  };

  if (loading) return <Spin />;

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
        <Input value={currentUser?.name} disabled />
      </Form.Item>

      {isEditing && (
        <Form.Item name="invoiceNumber" label="Invoice Number">
          <Input value={form.getFieldValue("invoiceNumber") || ""} disabled />
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
            <Select placeholder="Select status">
              <Select.Option value="PENDING">Pending</Select.Option>
              <Select.Option value="CONFIRMED">Confirmed</Select.Option>
              <Select.Option value="PAID">Paid</Select.Option>
              <Select.Option value="CANCELLED">Cancelled</Select.Option>
            </Select>
          </Form.Item>
        </Col>

        <Col xs={24} sm={4}>
          <Form.Item
            name="discount"
            label="Discount (%)"
            initialValue={0}
            rules={[{ type: "number", min: 0, max: 100 }]}
          >
            <InputNumber min={0} max={100} style={{ width: "100%" }} />
          </Form.Item>
        </Col>

        <Col xs={24} sm={4}>
          <Form.Item
            name="tax"
            label="Tax Rate (%)"
            initialValue={18}
            rules={[{ type: "number", min: 0, max: 100 }]}
          >
            <InputNumber min={0} max={100} style={{ width: "100%" }} />
          </Form.Item>
        </Col>
      </Row>

      <Form.List name="items" initialValue={[{ quantity: 1, rate: 0 }]}>
        {(fields, { add, remove }) => (
          <>
            {fields.map(({ key, name }) => (
              <Row
                key={key}
                gutter={20}
                align="middle"
                style={{ marginBottom: 16 }}
              >
                <Col span={5}>
                  <Form.Item
                    name={[name, "name"]}
                    label="Item Name"
                    rules={[
                      { required: true, message: "Item name is required" },
                    ]}
                  >
                    <Input
                      placeholder="Enter item name"
                      style={{ width: "100%" }}
                    />
                  </Form.Item>
                </Col>

                <Col span={6}>
                  <Form.Item
                    name={[name, "quantity"]}
                    label="Quantity"
                    rules={[
                      { required: true, message: "Quantity is required" },
                    ]}
                  >
                    <InputNumber
                      placeholder="Quantity"
                      min={1}
                      style={{ width: "100%" }}
                    />
                  </Form.Item>
                </Col>

                <Col span={6}>
                  <Form.Item
                    name={[name, "rate"]}
                    label="Rate"
                    rules={[{ required: true, message: "Rate is required" }]}
                  >
                    <InputNumber
                      placeholder="Rate"
                      min={0}
                      style={{ width: "100%" }}
                    />
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
            <InputNumber
              disabled
              style={{ width: "100%", fontWeight: "bold" }}
            />
          </Form.Item>
        </Col>
      </Row>

      <Form.Item style={{ marginTop: 24 }}>
        <Button
          type="primary"
          htmlType="submit"
          size="large"
          style={{ width: "100%" }}
        >
          {isEditing ? "Update Invoice" : "Create Invoice"}
        </Button>
      </Form.Item>
    </Form>
  );
}

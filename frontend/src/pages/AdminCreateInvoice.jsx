import "@ant-design/v5-patch-for-react-19";
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Form,
  InputNumber,
  Button,
  Card,
  Space,
  Table,
  message,
  DatePicker,
  Select,
  Row,
  Col,
  Empty,
} from "antd";
import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { authAPI } from "../service/authAPI";
import { invoiceAPI } from "../service/invoiceAPI";
import "./CreateInvoice.css";

export default function AdminCreateInvoice() {
  const { user } = useSelector((state) => state.auth);
  const location = useLocation();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [items, setItems] = useState([{ name: "", quantity: 1, rate: 0 }]);
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [loading, setLoading] = useState(false);
  const [discount, setDiscount] = useState(0);
  const [tax, setTax] = useState(18);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editInvoiceId, setEditInvoiceId] = useState(null);

  if (!user || user.role !== "admin") {
    return (
      <Card>
        <Empty description="Admin access only. Please login as admin." />
      </Card>
    );
  }

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await authAPI.getCustomers({ limit: 1000 });
        const customersData = response.data?.customers || response.data || [];
        setCustomers(Array.isArray(customersData) ? customersData : []);
      } catch (error) {
        message.error("Failed to fetch customers");
      }
    };
    fetchCustomers();
  }, []);

  useEffect(() => {
    if (location.state?.invoice) {
      const invoice = location.state.invoice;
      setIsEditMode(true);
      setEditInvoiceId(invoice._id);
      setSelectedCustomer(invoice.customer?._id);
      setItems(invoice.items || [{ name: "", quantity: 1, rate: 0 }]);
      setDiscount(invoice.parseDiscount || 0);
      setTax(invoice.parseTaxRate || 18);
      form.setFieldsValue({
        invoiceDate: dayjs(invoice.invoiceDate),
        dueDate: dayjs(invoice.dueDate),
        status: invoice.status,
      });
    }
  }, [location.state, form]);

  const calculateSubtotal = () => {
    return items.reduce((sum, item) => sum + (item.quantity * item.rate || 0), 0);
  };

  const calculateDiscount = () => {
    return (calculateSubtotal() * discount) / 100;
  };

  const calculateTax = () => {
    return ((calculateSubtotal() - calculateDiscount()) * tax) / 100;
  };

  const calculateTotal = () => {
    return calculateSubtotal() - calculateDiscount() + calculateTax();
  };

  const addItem = () => {
    setItems([...items, { name: "", quantity: 1, rate: 0 }]);
  };

  const removeItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  const onFinish = async (values) => {
    if (!selectedCustomer) {
      message.error("Please select a customer");
      return;
    }

    if (items.length === 0) {
      message.error("Please add at least one item");
      return;
    }

    setLoading(true);
    try {
      const invoiceData = {
        customer: selectedCustomer,
        items,
        invoiceDate: values.invoiceDate?.toDate(),
        dueDate: values.dueDate?.toDate(),
        discount,
        tax,
        status: values.status,
      };

      if (isEditMode) {
        await invoiceAPI.updateInvoice(editInvoiceId, invoiceData);
        message.success("Invoice updated successfully");
        navigate('/admin/invoices');
      } else {
        await invoiceAPI.createInvoice(invoiceData);
        message.success("Invoice created successfully");
        form.resetFields();
        setItems([{ name: "", quantity: 1, rate: 0 }]);
        setSelectedCustomer(null);
        setDiscount(0);
        setTax(18);
      }
    } catch (error) {
      message.error(error.response?.data?.message || `Failed to ${isEditMode ? 'update' : 'create'} invoice`);
    } finally {
      setLoading(false);
    }
  };

  const itemColumns = [
    {
      title: "Item Name",
      dataIndex: "name",
      key: "name",
      render: (text, record, index) => (
        <input
          type="text"
          value={text}
          onChange={(e) => updateItem(index, "name", e.target.value)}
          className="invoice-input"
          placeholder="Enter item name"
        />
      ),
    },
    {
      title: "Quantity",
      dataIndex: "quantity",
      key: "quantity",
      render: (text, record, index) => (
        <input
          type="number"
          value={text}
          onChange={(e) => updateItem(index, "quantity", e.target.value)}
          className="invoice-input"
        />
      ),
    },
    {
      title: "Rate (₹)",
      dataIndex: "rate",
      key: "rate",
      render: (text, record, index) => (
        <input
          type="number"
          value={text}
          onChange={(e) => updateItem(index, "rate", e.target.value)}
          className="invoice-input"
        />
      ),
    },
    {
      title: "Amount (₹)",
      key: "amount",
      render: (_, record) => (
        <span>{(record.quantity * record.rate || 0).toFixed(2)}</span>
      ),
    },
    {
      title: "Action",
      key: "action",
      width: 80,
      render: (_, record, index) => (
        <Button
          danger
          icon={<DeleteOutlined />}
          onClick={() => removeItem(index)}
        />
      ),
    },
  ];

  return (
    <div className="create-invoice-container">
      <Card title={isEditMode ? "Edit Invoice" : "Create Invoice for Customer"}>
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          autoComplete="off"
        >
          <Row gutter={16}>
            <Col xs={24} sm={6}>
              <Form.Item
                label="Select Customer"
                required
                message="Please select a customer"
              >
                <Select
                  placeholder="Search and select customer"
                  value={selectedCustomer}
                  onChange={setSelectedCustomer}
                  showSearch
                  filterOption={(input, option) =>
                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                  }
                  options={(Array.isArray(customers) ? customers : []).map((c) => ({
                    label: `${c.name} (${c.email})`,
                    value: c._id,
                  }))}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={6}>
              <Form.Item
                name="invoiceDate"
                label="Invoice Date"
                initialValue={dayjs()}
                rules={[{ required: true, message: "Please select invoice date" }]}
              >
                <DatePicker style={{ width: "100%" }} />
              </Form.Item>
            </Col>

            <Col xs={24} sm={6}>
              <Form.Item
                name="dueDate"
                label="Due Date"
                initialValue={dayjs().add(30, "days")}
                rules={[{ required: true, message: "Please select due date" }]}
              >
                <DatePicker style={{ width: "100%" }} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            
            <Col xs={24} sm={6 }>
              <Form.Item
                name="status"
                label="Invoice Status"
                initialValue="PENDING"
                rules={[{ required: true, message: "Please select status" }]}
              >
                <Select>
                  <Select.Option value="PENDING">Pending</Select.Option>
                  <Select.Option value="CONFIRMED">Confirmed</Select.Option>
                  <Select.Option value="PAID">Paid</Select.Option>
                  <Select.Option value="CANCELLED">Cancelled</Select.Option>
                </Select>
              </Form.Item>
            </Col>

            <Col xs={24} sm={6}>
              <Form.Item label="Discount (%)">
                <InputNumber
                  value={discount}
                  onChange={setDiscount}
                  min={0}
                  max={100}
                  style={{ width: "100%" }}
                />
              </Form.Item>
            </Col>

            <Col xs={24} sm={6}>
              <Form.Item label="Tax (%)">
                <InputNumber
                  value={tax}
                  onChange={setTax}
                  min={0}
                  max={100}
                  style={{ width: "100%" }}
                />
              </Form.Item>
            </Col>

          </Row>

          <Row gutter={16}>
            
          </Row>

          <Card title="Invoice Items" style={{ marginBottom: 16 }}>
            {items.length > 0 ? (
              <Table
                dataSource={items.map((item, index) => ({ ...item, key: index }))}
                columns={itemColumns}
                pagination={false}
                size="small"
              />
            ) : (
              <Empty description="No items added" />
            )}
            <Button
              type="dashed"
              block
              icon={<PlusOutlined />}
              onClick={addItem}
              style={{ marginTop: 16 }}
            >
              Add Item
            </Button>
          </Card>

          <Card title="Amount Summary" style={{ marginBottom: 16 }}>
            <Row gutter={16}>
              <Col xs={24} sm={6}>
                <div className="summary-box">
                  <div className="summary-label">Subtotal</div>
                  <div className="summary-value">
                    ₹{calculateSubtotal().toFixed(2)}
                  </div>
                </div>
              </Col>
              <Col xs={24} sm={6}>
                <div className="summary-box">
                  <div className="summary-label">Discount</div>
                  <div className="summary-value">
                    ₹{calculateDiscount().toFixed(2)}
                  </div>
                </div>
              </Col>
              <Col xs={24} sm={6}>
                <div className="summary-box">
                  <div className="summary-label">Tax</div>
                  <div className="summary-value">
                    ₹{calculateTax().toFixed(2)}
                  </div>
                </div>
              </Col>
              <Col xs={24} sm={6}>
                <div className="summary-box total">
                  <div className="summary-label">Total</div>
                  <div className="summary-value">
                    ₹{calculateTotal().toFixed(2)}
                  </div>
                </div>
              </Col>
            </Row>
          </Card>

          <Form.Item>
            <Space>
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                loading={loading}
              >
                {isEditMode ? "Update Invoice" : "Create Invoice"}
              </Button>
              <Button
                size="large"
                onClick={() => {
                  if (isEditMode) {
                    navigate('/admin/invoices');
                  } else {
                    form.resetFields();
                    setItems([{ name: "", quantity: 1, rate: 0 }]);
                    setSelectedCustomer(null);
                    setDiscount(0);
                    setTax(18);
                  }
                }}
              >
                {isEditMode ? "Cancel" : "Reset"}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}

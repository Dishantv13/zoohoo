import "@ant-design/v5-patch-for-react-19";
import { useEffect, useMemo, useState } from "react";
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
  Select,
  Row,
  Col,
  Empty,
  Tag,
  Alert,
  DatePicker,
} from "antd";
import {
  DeleteOutlined,
  PlusOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import "./CreateInvoice.css";
import { useGetVendorsQuery } from "../service/vendorApi";
import {
  useCreateBillMutation,
  useUpdateBillMutation,
} from "../service/billApi";
import { useGetVendorAvailabilityQuery } from "../service/itemApi";
import dayjs from "dayjs";

const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
});

export default function AdminCreateBill() {
  const { user } = useSelector((state) => state.auth);
  const location = useLocation();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [items, setItems] = useState([{ itemId: "", quantity: 1, rate: 0 }]);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editBillId, setEditBillId] = useState(null);

  const { data: vendorsData } = useGetVendorsQuery({
    page: 1,
    limit: 100,
  });
  const { data: availabilityData, isLoading: availabilityLoading } =
    useGetVendorAvailabilityQuery(
      selectedVendor ? String(selectedVendor) : null,
      { skip: !selectedVendor },
    );
  const [createBill] = useCreateBillMutation();
  const [updateBill] = useUpdateBillMutation();

  if (!user || user.role !== "admin") {
    return (
      <Card>
        <Empty description="Admin access only. Please login as admin." />
      </Card>
    );
  }

  const vendorsList = vendorsData?.data?.vendors || [];
  const availableItems = availabilityData?.data || [];

  const inventoryById = useMemo(() => {
    const map = new Map();
    availableItems.forEach((item) => {
      map.set(item._id, item);
    });
    return map;
  }, [availableItems]);

  useEffect(() => {
    if (location.state?.bill) {
      const bill = location.state.bill;
      setIsEditMode(true);
      setEditBillId(bill._id);
      setSelectedVendor(bill.vendorId?._id || null);

      form.setFieldsValue({
        billDate: bill.billDate ? dayjs(bill.billDate) : null,
        dueDate: bill.dueDate ? dayjs(bill.dueDate) : null,
      });

      setItems(
        bill.items?.length
          ? bill.items.map((item) => ({
              itemId: item.itemId?._id || item.itemId || "",
              quantity: item.quantity || 1,
              rate: item.rate || 0,
            }))
          : [{ itemId: "", quantity: 1, rate: 0 }],
      );
    }
  }, [location.state]);

  const addItem = () => {
    setItems((prev) => [...prev, { itemId: "", quantity: 1, rate: 0 }]);
  };

  const removeItem = (index) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const updateItem = (index, field, value) => {
    setItems((prev) => {
      const next = [...prev];
      next[index] = {
        ...next[index],
        [field]: value,
      };

      if (field === "itemId") {
        const inventoryItem = inventoryById.get(value);
        next[index].rate = Number(inventoryItem?.rate || 0);
      }

      return next;
    });
  };

  const subtotal = useMemo(() => {
    return items.reduce((sum, item) => {
      return sum + (Number(item.quantity) || 0) * (Number(item.rate) || 0);
    }, 0);
  }, [items]);

  const requestedByItem = useMemo(() => {
    const map = new Map();
    items.forEach((item) => {
      if (!item.itemId) return;
      const current = Number(map.get(item.itemId) || 0);
      map.set(item.itemId, current + Number(item.quantity || 0));
    });
    return map;
  }, [items]);

  const stockIssues = useMemo(() => {
    const issues = [];
    requestedByItem.forEach((requestedQty, itemId) => {
      const inventoryItem = inventoryById.get(itemId);
      const availableQty = Number(inventoryItem?.quantity || 0);
      if (requestedQty > availableQty) {
        issues.push({
          itemId,
          name: inventoryItem?.name || itemId,
          requestedQty,
          availableQty,
        });
      }
    });
    return issues;
  }, [requestedByItem, inventoryById]);

  const onFinish = async (values) => {
    if (!selectedVendor) {
      message.error("Please select a vendor");
      return;
    }

    const hasInvalidItem = items.some(
      (item) =>
        !item.itemId || Number(item.quantity) <= 0 || Number(item.rate) <= 0,
    );

    if (!items.length || hasInvalidItem) {
      message.error("Please add valid items with quantity and rate");
      return;
    }

    if (stockIssues.length > 0) {
      message.error(
        "Some items exceed available stock. Bill cannot be created.",
      );
      return;
    }

    setLoading(true);

    try {
      const payload = {
        vendorId: String(selectedVendor),
        billDate: values.billDate.toISOString(),
        dueDate: values.dueDate.toISOString(),
        items: items.map((item) => ({
          itemId: item.itemId,
          quantity: Number(item.quantity),
          rate: Number(item.rate),
        })),
      };

      if (isEditMode && editBillId) {
        await updateBill({ billId: editBillId, data: payload }).unwrap();
        message.success("Bill updated successfully");
      } else {
        await createBill(payload).unwrap();
        message.success("Bill created successfully");
      }

      navigate("/admin/vendor/bills");
    } catch (error) {
      message.error(
        error?.data?.message ||
          `Failed to ${isEditMode ? "update" : "create"} bill`,
      );
    } finally {
      setLoading(false);
    }
  };

  const itemColumns = [
    {
      title: "Item",
      dataIndex: "itemId",
      key: "itemId",
      render: (value, _, index) => (
        <Select
          value={value || undefined}
          placeholder="Select item"
          loading={availabilityLoading}
          showSearch
          style={{ width: "100%" }}
          optionFilterProp="label"
          onChange={(val) => updateItem(index, "itemId", val)}
          options={availableItems.map((item) => ({
            value: item._id,
            label: `${item.name} (Stock: ${item.quantity})`,
            disabled: Number(item.quantity) <= 0,
          }))}
        />
      ),
    },
    {
      title: "Available",
      key: "available",
      width: 120,
      render: (_, record) => {
        const available = Number(
          inventoryById.get(record.itemId)?.quantity || 0,
        );
        return <Tag color={available > 0 ? "green" : "red"}>{available}</Tag>;
      },
    },
    {
      title: "Quantity",
      dataIndex: "quantity",
      key: "quantity",
      width: 140,
      render: (value, _, index) => (
        <InputNumber
          min={1}
          value={value}
          onChange={(val) => updateItem(index, "quantity", val || 1)}
          style={{ width: "100%" }}
        />
      ),
    },
    {
      title: "Rate",
      dataIndex: "rate",
      key: "rate",
      width: 180,
      render: (value, _, index) => (
        <InputNumber
          min={0}
          value={value}
          onChange={(val) => updateItem(index, "rate", val || 0)}
          style={{ width: "100%" }}
          formatter={(val) => `INR ${val}`}
          parser={(val) => String(val).replace(/INR\s?|,/g, "")}
        />
      ),
    },
    {
      title: "Amount",
      key: "amount",
      width: 180,
      render: (_, record) => {
        const qty = Number(record.quantity) || 0;
        const rate = Number(record.rate) || 0;
        return <Tag color="blue">{currencyFormatter.format(qty * rate)}</Tag>;
      },
    },
    {
      title: "Action",
      key: "action",
      width: 100,
      render: (_, __, index) => (
        <Button
          danger
          icon={<DeleteOutlined />}
          onClick={() => removeItem(index)}
          disabled={items.length <= 1}
        />
      ),
    },
  ];

  return (
    <div className="create-invoice-container">
      <Card title={isEditMode ? "Edit Vendor Bill" : "Create Bill for Vendor"}>
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          autoComplete="off"
          initialValues={{ billDate: dayjs() }}
        >
          <Row gutter={16}>
            <Col xs={24} sm={12} lg={6}>
              <Form.Item label="Select Vendor" required>
                <Select
                  placeholder="Search and select vendor"
                  value={selectedVendor}
                  prefix={<SearchOutlined />}
                  onChange={(value) => {
                    setSelectedVendor(value);
                    setItems([{ itemId: "", quantity: 1, rate: 0 }]);
                  }}
                  showSearch
                  filterOption={(input, option) =>
                    (option?.label ?? "")
                      .toLowerCase()
                      .includes(input.toLowerCase())
                  }
                  options={vendorsList.map((vendor) => ({
                    label: `${vendor.name} (${vendor.email})`,
                    value: vendor._id,
                  }))}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Form.Item
                label="Bill Date"
                name="billDate"
                rules={[{ required: true, message: "please select bill date" }]}
              >
                <DatePicker style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Form.Item
                label="Due Date"
                name="dueDate"
                rules={[{ required: true, message: "please select due date" }]}
              >
                <DatePicker
                  style={{ width: "100%" }}
                  disableDate={(current) =>
                    current && current < form.getFieldValue("billDate")
                  }
                />
              </Form.Item>
            </Col>
            <Col
              xs={24}
              sm={12}
              lg={6}
              style={{ display: "flex", alignItems: "center" }}
            >
              <Space>
                <span style={{ color: "#3f3535" }}>Subtotal</span>
                <Tag color="geekblue" style={{ fontSize: 16 }}>
                  {currencyFormatter.format(subtotal)}
                </Tag>
              </Space>
            </Col>
          </Row>

          {stockIssues.length > 0 && (
            <Alert
              type="error"
              showIcon
              style={{ marginBottom: 12 }}
              message="Some selected quantities exceed availability"
              description={stockIssues
                .map(
                  (issue) =>
                    `${issue.name}: requested ${issue.requestedQty}, available ${issue.availableQty}`,
                )
                .join(" | ")}
            />
          )}

          <Table
            rowKey="itemId"
            dataSource={items}
            columns={itemColumns}
            pagination={false}
            scroll={{ x: true }}
          />

          <Space style={{ marginTop: 16 }}>
            <Button
              icon={<PlusOutlined />}
              onClick={addItem}
              disabled={!selectedVendor}
            >
              Add Item
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              disabled={!selectedVendor || stockIssues.length > 0}
            >
              {isEditMode ? "Update Bill" : "Create Bill"}
            </Button>
            <Button onClick={() => navigate("/admin/vendor/bills")}>
              Cancel
            </Button>
          </Space>

          <div style={{ marginTop: 16, color: "#8c8c8c", fontSize: 12 }}>
            Bill creation is blocked when requested quantity is greater than
            vendor stock.
          </div>
        </Form>
      </Card>
    </div>
  );
}

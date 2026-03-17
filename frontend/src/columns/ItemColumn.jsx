import React from "react";
import { Select, Tag, InputNumber, Button } from "antd";
import { DeleteOutlined } from "@ant-design/icons";

export const getInventoryItemColumns = ({
  availableItems,
  availabilityLoading,
  inventoryById,
  updateItem,
  removeItem,
  items,
  currencyFormatter,
}) => [
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
        inventoryById.get(record.itemId)?.quantity || 0
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

export const getSimpleItemColumns = ({ updateItem, removeItem }) => [
  {
    title: "Item Name",
    dataIndex: "name",
    key: "name",
    render: (text, record, index) => (
      <input
        type="text"
        value={text}
        onChange={(e) => updateItem(index, "name", e.target.value)}
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
import "@ant-design/v5-patch-for-react-19";
import { useState } from "react";
import { useSelector } from "react-redux";
import {
  Card,
  Table,
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  Switch,
  Space,
  Empty,
  notification,
  Popconfirm,
  Tag,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ShopOutlined,
} from "@ant-design/icons";
import {
  useGetInventoryItemsQuery,
  useCreateInventoryItemMutation,
  useUpdateInventoryItemMutation,
  useDeleteInventoryItemMutation,
} from "../service/itemApi";

export default function VendorInventory() {
  const { user } = useSelector((state) => state.auth);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [form] = Form.useForm();

  const { data, isLoading } = useGetInventoryItemsQuery(
    { activeOnly: false },
    { skip: user?.role !== "vendor" },
  );

  const [createItem, { isLoading: isCreating }] = useCreateInventoryItemMutation();
  const [updateItem, { isLoading: isUpdating }] = useUpdateInventoryItemMutation();
  const [deleteItem] = useDeleteInventoryItemMutation();

  if (!user || user.role !== "vendor") {
    return (
      <Card>
        <Empty description="Vendor access only" />
      </Card>
    );
  }

  const items = data?.data || [];

  const handleCreate = () => {
    setIsEditMode(false);
    setSelectedItem(null);
    form.resetFields();
    form.setFieldsValue({ isActive: true, tax: 0, quantity: 0, rate: 0 });
    setIsModalVisible(true);
  };

  const handleEdit = (record) => {
    setIsEditMode(true);
    setSelectedItem(record);
    form.setFieldsValue({
      name: record.name,
      quantity: record.quantity,
      rate: record.rate,
      tax: record.tax,
      isActive: record.isActive,
    });
    setIsModalVisible(true);
  };

  const handleDelete = async (itemId) => {
    try {
      await deleteItem(itemId).unwrap();
      notification.success({
        message: "Deleted",
        description: "Inventory item deleted successfully",
      });
    } catch (error) {
      notification.error({
        message: "Delete failed",
        description: error?.data?.message || "Failed to delete item",
      });
    }
  };

  const handleSubmit = async (values) => {
    try {
      if (isEditMode && selectedItem?._id) {
        await updateItem({ itemId: selectedItem._id, data: values }).unwrap();
        notification.success({
          message: "Updated",
          description: "Inventory item updated successfully",
        });
      } else {
        await createItem(values).unwrap();
        notification.success({
          message: "Created",
          description: "Inventory item added successfully",
        });
      }

      setIsModalVisible(false);
      form.resetFields();
      setSelectedItem(null);
      setIsEditMode(false);
    } catch (error) {
      notification.error({
        message: "Save failed",
        description: error?.data?.message || "Failed to save inventory item",
      });
    }
  };

  const columns = [
    {
      title: "Item Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Stock",
      dataIndex: "quantity",
      key: "quantity",
      render: (qty) => (
        <Tag color={Number(qty) > 0 ? "green" : "red"}>{qty}</Tag>
      ),
    },
    {
      title: "Rate",
      dataIndex: "rate",
      key: "rate",
      render: (rate) => `₹${Number(rate || 0).toFixed(2)}`,
    },
    {
      title: "Tax %",
      dataIndex: "tax",
      key: "tax",
      render: (tax) => Number(tax || 0),
    },
    {
      title: "Status",
      dataIndex: "isActive",
      key: "isActive",
      render: (isActive) => (
        <Tag color={isActive ? "green" : "default"}>
          {isActive ? "Active" : "Inactive"}
        </Tag>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            Edit
          </Button>
          <Popconfirm
            title="Delete inventory item"
            description="Are you sure you want to delete this item?"
            onConfirm={() => handleDelete(record._id)}
            okText="Yes"
            cancelText="No"
          >
            <Button danger size="small" icon={<DeleteOutlined />}>
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="customer-management">
      <Card
        title="Vendor Inventory"
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
            Add Inventory
          </Button>
        }
      >
        <Table
          rowKey="_id"
          columns={columns}
          dataSource={items}
          loading={isLoading}
          pagination={{
            showSizeChanger: true,
            pageSizeOptions: [5, 10, 20, 50],
          }}
          locale={{
            emptyText: (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="No inventory items"
              />
            ),
          }}
        />
      </Card>

      <Modal
        title={isEditMode ? "Edit Inventory Item" : "Add Inventory Item"}
        open={isModalVisible}
        confirmLoading={isCreating || isUpdating}
        onCancel={() => {
          setIsModalVisible(false);
          setIsEditMode(false);
          setSelectedItem(null);
          form.resetFields();
        }}
        onOk={() => form.submit()}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit} autoComplete="off">
          <Form.Item
            name="name"
            label="Item Name"
            rules={[{ required: true, message: "Please enter item name" }]}
          >
            <Input prefix={<ShopOutlined />} placeholder="Enter item name" />
          </Form.Item>

          <Form.Item
            name="quantity"
            label="Stock Quantity"
            rules={[{ required: true, message: "Please enter stock quantity" }]}
          >
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item
            name="rate"
            label="Rate"
            rules={[{ required: true, message: "Please enter rate" }]}
          >
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item name="tax" label="Tax %">
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item name="isActive" label="Active" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

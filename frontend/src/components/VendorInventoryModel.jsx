import React from "react";
import {
  Card,
  Table,
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  Switch,
  Empty,
} from "antd";
import { PlusOutlined, ShopOutlined } from "@ant-design/icons";

const VendorInventoryModel = ({
  columns,
  items,
  isLoading,

  isModalVisible,
  setIsModalVisible,
  isEditMode,
  setIsEditMode,
  selectedItem,
  setSelectedItem,

  form,
  handleSubmit,

  isCreating,
  isUpdating,

  handleCreate,
}) => {
  return (
    <>
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
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          autoComplete="off"
        >
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
    </>
  );
};

export default VendorInventoryModel;

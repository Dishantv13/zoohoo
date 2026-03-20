import "@ant-design/v5-patch-for-react-19";
import { useState } from "react";
import { useSelector } from "react-redux";
import {
  Card,
  Form,
  Empty,
  notification,
} from "antd";
import {
  useGetInventoryItemsQuery,
  useCreateInventoryItemMutation,
  useUpdateInventoryItemMutation,
  useDeleteInventoryItemMutation,
} from "../service/itemApi";
import VendorInventoryColumns from "../columns/VendorInventoryColumn";
import VendorInventoryModel from "../components/managementModel/VendorInventoryModel";

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

  const [createItem, { isLoading: isCreating }] =
    useCreateInventoryItemMutation();
  const [updateItem, { isLoading: isUpdating }] =
    useUpdateInventoryItemMutation();
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

  const columns = VendorInventoryColumns({
    onEdit: handleEdit,
    onDelete: handleDelete,
  });

  return (
    <div className="customer-management">
      <VendorInventoryModel
        columns={columns}
        items={items}
        isLoading={isLoading}
        isModalVisible={isModalVisible}
        setIsModalVisible={setIsModalVisible}
        isEditMode={isEditMode}
        setIsEditMode={setIsEditMode}
        selectedItem={selectedItem}
        setSelectedItem={setSelectedItem}
        form={form}
        handleSubmit={handleSubmit}
        isCreating={isCreating}
        isUpdating={isUpdating}
        handleCreate={handleCreate}
      />
    </div>
  );
}

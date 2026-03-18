import "@ant-design/v5-patch-for-react-19";
import { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { Form, Card, notification, Empty } from "antd";

import PartyDetailDrawer from "../components/PartyDetailDrawer";
import PartyManagementCard from "../components/PartyManagementCard";
import PartyFormModal from "../components/PartyFormModel";

import {
  useGetVendorsQuery,
  useCreateVendorMutation,
  useUpdateVendorMutation,
  useDeleteVendorMutation,
  useGetVendorStatsQuery,
} from "../service/vendorApi";
import { getUserColumns } from "../columns/UserColumn";

import "../css/Dashboard.css";

const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
});

export default function VendorManagement() {
  const { user } = useSelector((state) => state.auth);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [form] = Form.useForm();

  if (!user || user.role !== "admin") {
    return (
      <Card>
        <Empty description="Admin access only. Please login as admin." />
      </Card>
    );
  }

  const { data, isLoading } = useGetVendorsQuery({
    page,
    limit,
  });
  const [createVendor, { isLoading: isCreating }] = useCreateVendorMutation();
  const [updateVendor, { isLoading: isUpdating }] = useUpdateVendorMutation();
  const [deleteVendor] = useDeleteVendorMutation();
  const { data: statsData, isLoading: statsLoading } = useGetVendorStatsQuery(
    selectedVendor?._id,
    { skip: !selectedVendor?._id },
  );

  const vendorsList = data?.data.vendors || [];
  const filteredVendors = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return vendorsList;

    return vendorsList.filter((vendor) => {
      return [vendor.name, vendor.email, vendor.phone, vendor.address]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(term));
    });
  }, [vendorsList, searchTerm]);

  const pagination = data?.data?.pagination || {};
  const paginationData = {
    current: pagination.page || 1,
    pageSize: pagination.limit || 10,
    total: pagination.totalVendors || 0,
  };

  const vendorStats = statsData?.data?.statistics || {};

  const handleTableChange = (paginationInfo) => {
    setPage(paginationInfo.current);
    setLimit(paginationInfo.pageSize);
  };

  const handleSubmit = async (values) => {
    try {
      if (isEditMode && selectedVendor?._id) {
        await updateVendor({
          vendorId: selectedVendor._id,
          data: values,
        }).unwrap();

        notification.success({
          message: "Success",
          description: "Vendor updated successfully",
        });
      } else {
        await createVendor(values).unwrap();

        notification.success({
          message: "Success",
          description: "Vendor created successfully",
        });
      }

      setIsModalVisible(false);
      setIsEditMode(false);
      setSelectedVendor(null);
      form.resetFields();
    } catch (error) {
      notification.error({
        message: "Error",
        description: error?.data?.message || "Operation failed",
      });
    }
  };

  const handleDelete = async (vendorId) => {
    try {
      await deleteVendor(vendorId).unwrap();
      notification.success({
        message: "Success",
        description: "Vendor deleted successfully",
      });
    } catch (error) {
      notification.error({
        message: "Error",
        description: error?.data?.message || "Failed to delete vendor",
      });
    }
  };

  const handleEdit = (vendor) => {
    setSelectedVendor(vendor);
    setIsEditMode(true);
    setIsModalVisible(true);
    form.setFieldsValue({
      name: vendor.name,
      email: vendor.email,
      phone: vendor.phone,
      address: vendor.address,
    });
  };

  const handleCreateClick = () => {
    setSelectedVendor(null);
    setIsEditMode(false);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleViewDetails = (vendor) => {
    setSelectedVendor(vendor);
    setIsDrawerVisible(true);
  };

  const formatCurrency = (value) =>
    currencyFormatter.format(Number(value) || 0);

  const columns = getUserColumns({
    type: "vendor",
    handleEdit,
    handleViewDetails,
    handleDelete,
  });

  return (
    <div className="customer-management">
      <PartyManagementCard
        type="vendor"
        columns={columns}
        dataSource={filteredVendors}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        handleCreateClick={handleCreateClick}
        handleTableChange={handleTableChange}
        isLoading={isLoading}
        paginationData={paginationData}
      />

      <PartyFormModal
        type="vendor"
        form={form}
        open={isModalVisible}
        isEditMode={isEditMode}
        loading={isCreating || isUpdating}
        onCancel={() => {
          setIsModalVisible(false);
          setIsEditMode(false);
          setSelectedVendor(null);
          form.resetFields();
        }}
        onSubmit={handleSubmit}
      />

      <PartyDetailDrawer
        type="vendor"
        open={isDrawerVisible}
        onClose={() => setIsDrawerVisible(false)}
        data={selectedVendor}
        summaryData={vendorStats}
        loading={statsLoading}
        formatCurrency={formatCurrency}
      />
    </div>
  );
}

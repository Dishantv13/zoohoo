import "@ant-design/v5-patch-for-react-19";
import { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { Form, Card, notification, Empty } from "antd";
import { useSearchParams } from "react-router-dom";

import PartyDetailDrawer from "../components/detailDrawer/PartyDetailDrawer";
import PartyManagementCard from "../components/managementModel/PartyManagementCard";
import PartyFormModal from "../components/formField/PartyFormModel";

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
  const [form] = Form.useForm();
  const [searchParams, setSearchParams] = useSearchParams();

  if (!user || user.role !== "admin") {
    return (
      <Card>
        <Empty description="Admin access only. Please login as admin." />
      </Card>
    );
  }

  const page = parseInt(searchParams.get("page")) || 1;
  const limit = parseInt(searchParams.get("limit")) || 10;
  const search = searchParams.get("search") || "";

  const { data, isLoading } = useGetVendorsQuery({
    page,
    limit,
    search,
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
    const term = search.trim().toLowerCase();
    if (!term) return vendorsList;

    return vendorsList.filter((vendor) => {
      return [vendor.name, vendor.email, vendor.phone, vendor.address]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(term));
    });
  }, [vendorsList, search]);

  const pagination = data?.data?.pagination || {};
  const paginationData = {
    current: pagination.page || 1,
    pageSize: pagination.limit || 10,
    total: pagination.totalItems || 0,
  };

  const vendorStats = statsData?.data?.statistics || {};

  const handleTableChange = (paginationInfo) => {
    updateParams({
      page: paginationInfo.current,
      limit: paginationInfo.pageSize,
    });
  };

  const updateParams = (newParams) => {
    const currentParams = Object.fromEntries(searchParams.entries());
    setSearchParams({
      ...currentParams,
      ...newParams,
    });
  };

  const handleSearch = (value) => {
    const params = Object.fromEntries(searchParams.entries());
    if (!value) {
      delete params.search;
    } else {
      params.search = value;
    }
    params.page = 1;

    setSearchParams(params);
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
        searchTerm={search}
        setSearchTerm={handleSearch}
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

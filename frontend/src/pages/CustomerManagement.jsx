import "@ant-design/v5-patch-for-react-19";
import { useState } from "react";
import { useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";
import { Form, Card, notification, Empty } from "antd";
import PartyDetailDrawer from "../components/detailDrawer/PartyDetailDrawer";
import PartyManagementCard from "../components/managementModel/PartyManagementCard";
import PartyFormModal from "../components/formField/PartyFormModel";
import {
  useGetCustomersQuery,
  useAdminCreateCustomerMutation,
  useAdminUpdateCustomerMutation,
  useAdminDeleteCustomerMutation,
} from "../service/customerApi";
import { getUserColumns } from "../columns/UserColumn";

import { useGetCustomerInvoicesQuery } from "../service/invoiceApi";
import "../css/Dashboard.css";

const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
});

export default function CustomerManagement() {
  const { user } = useSelector((state) => state.auth);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [form] = Form.useForm();
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);
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
  const status = searchParams.get("status") || "all";
  const search = searchParams.get("search") || "";

  const { data, isLoading } = useGetCustomersQuery({
    page,
    limit,
    search,
    status,
  });
  const [updateCustomer] = useAdminUpdateCustomerMutation();
  const [deleteCustomer] = useAdminDeleteCustomerMutation();
  const [createCustomer] = useAdminCreateCustomerMutation();

  const customersList = data?.data?.customers || [];

  const paginationData = {
    current: data?.data?.pagination?.page || 1,
    pageSize: data?.data?.pagination?.limit || 10,
    total: data?.data?.pagination?.totalItems || 0,
  };

  const filterData = customersList.map((customer) => ({
    ...customer,
    id: customer._id,
  }));

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

  const handleStatusFilter = (value) => {
    const params = Object.fromEntries(searchParams.entries());

    if (value === "all") {
      params.status = "all";
    } else {
      params.status = value;
    }
    setSearchParams(params);
  };

  const handleSearch = (value) => {
    const params = Object.fromEntries(searchParams.entries());
    if (value) {
      params.search = value;
    } else {
      delete params.search;
    }
    params.page = 1;
    setSearchParams(params);
  };

  const handleSubmit = async (values) => {
    try {
      if (isEditMode) {
        await updateCustomer({
          customerId: selectedCustomer._id,
          data: values,
        }).unwrap();

        notification.success({
          message: "Success",
          description: "Customer updated successfully",
        });
      } else {
        await createCustomer(values).unwrap();

        notification.success({
          message: "Success",
          description: "Customer created successfully",
        });
      }

      setIsModalVisible(false);
      form.resetFields();
      setSelectedCustomer(null);
      setIsEditMode(false);
    } catch (error) {
      notification.error({
        message: "Error",
        description: error?.data?.message || "Operation failed",
      });
    }
  };
  const handleDelete = async (customerId) => {
    try {
      await deleteCustomer(customerId).unwrap();

      notification.success({
        message: "Success",
        description: "Customer deleted successfully",
      });
    } catch (error) {
      notification.error({
        message: "Error",
        description: error?.data?.message || "Failed to delete customer",
      });
    }
  };

  const handleEdit = (record) => {
    setSelectedCustomer(record);
    setIsEditMode(true);
    form.setFieldsValue({
      name: record.name,
      phonenumber: record.phonenumber,
      email: record.email,
      isActive: record.isActive,
    });
    setIsModalVisible(true);
  };

  const handleCreateClick = () => {
    setIsEditMode(false);
    setSelectedCustomer(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleViewDetails = (record) => {
    setSelectedCustomer(record);
    setIsDrawerVisible(true);
  };

  const { data: invoiceData, isLoading: invoiceLoading } =
    useGetCustomerInvoicesQuery(
      { customerId: selectedCustomer?._id, page: 1, limit: 1 },
      { skip: !selectedCustomer?._id },
    );

  const customerSummary = invoiceData?.data?.summary || {};

  const formatCurrency = (value) =>
    currencyFormatter.format(Number(value) || 0);

  const columns = getUserColumns({
    type: "customer",
    handleEdit,
    handleViewDetails,
    handleDelete,
  });

  return (
    <div className="customer-management">
      <PartyManagementCard
        type="customer"
        columns={columns}
        dataSource={filterData}
        searchTerm={search}
        setSearchTerm={handleSearch}
        statusFilter={status}
        setStatusFilter={handleStatusFilter}
        handleCreateClick={handleCreateClick}
        handleTableChange={handleTableChange}
        isLoading={isLoading}
        paginationData={paginationData}
      />

      <PartyFormModal
        type="customer"
        form={form}
        open={isModalVisible}
        isEditMode={isEditMode}
        loading={isLoading}
        onCancel={() => {
          setIsModalVisible(false);
          setIsEditMode(false);
          setSelectedCustomer(null);
          form.resetFields();
        }}
        onSubmit={handleSubmit}
      />

      <PartyDetailDrawer
        type="customer"
        open={isDrawerVisible}
        onClose={() => setIsDrawerVisible(false)}
        data={selectedCustomer}
        summaryData={customerSummary}
        loading={invoiceLoading}
        formatCurrency={formatCurrency}
      />
    </div>
  );
}

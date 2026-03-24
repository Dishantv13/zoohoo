import "@ant-design/v5-patch-for-react-19";
import { useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, notification, Empty, Modal } from "antd";
import CashPaymentModal from "../components/paymentModel/CashPaymentModal";
import DetailDrawer from "../components/detailDrawer/DetailDrawer";
import SummaryCards from "../components/SummaryCard";
import ManagementTableCard from "../components/managementModel/ManagementTableCard";
import {
  useGetAdminAllInvoicesQuery,
  useDownloadInvoiceMutation,
  useExportInvoiceMutation,
  useDeleteInvoiceMutation,
} from "../service/invoiceApi";
import { useGetCustomersQuery } from "../service/customerApi";
import { useGetPaymentHistoryQuery } from "../service/paymentApi";
import { InvoiceColumns } from "../columns/InvoiceColumn";
import { ROUTE_PATHS } from "../enum/apiUrl";

import "../css/InvoiceManagement.css";

export default function AdminInvoiceManagement() {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);
  const [isCashPaymentModalVisible, setIsCashPaymentModalVisible] =
    useState(false);
  const [selectedInvoiceForPayment, setSelectedInvoiceForPayment] =
    useState(null);
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
  const status = searchParams.get("status") || "";
  const customerId = searchParams.get("customerId") || null;

  const { data: customersData } = useGetCustomersQuery({
    limit: 1000,
  });

  const { data, refetch } = useGetAdminAllInvoicesQuery({
    page,
    limit,
    status,
    customerId: customerId || undefined,
  });
  const { data: paymentHistoryData } = useGetPaymentHistoryQuery(
    selectedInvoice?._id,
    { skip: !selectedInvoice?._id },
  );
  const [downloadInvoice, { isLoading: downloadLoading }] =
    useDownloadInvoiceMutation();
  const [exportInvoices, { isLoading }] = useExportInvoiceMutation();

  const [deleteInvoice, { isLoading: deleteLoading }] =
    useDeleteInvoiceMutation();

  const handleTableChange = (paginationInfo) => {
    updateparmas({
      page: paginationInfo.current,
      limit: paginationInfo.pageSize,
    });
  };

  const updateparmas = (newParams) => {
    const currentParams = Object.fromEntries(searchParams.entries());
    setSearchParams({
      ...currentParams,
      ...newParams,
    });
  };

  const handleStatusChange = (value) => {
    const params = Object.fromEntries(searchParams.entries());

    if (!value) {
      delete params.status;
    } else {
      params.status = value;
    }

    params.page = 1;

    setSearchParams(params);
  };

  const handleCustomerChange = (value) => {
    const params = Object.fromEntries(searchParams.entries());

    if (!value) {
      delete params.customerId;
    } else {
      params.customerId = value;
    }

    params.page = 1;

    setSearchParams(params);
  };

  const customersList = customersData?.data?.customers || customersData || [];

  const invoicesData = data?.data?.data || [];

  const pagination = data?.data?.pagination || {};
  const paginationData = {
    current: pagination.page || 1,
    pageSize: pagination.limit || 10,
    total: pagination.totalItems || 0,
  };

  const summary = data?.data?.summary || {};
  const summaryData = {
    totalInvoices: summary.totalInvoices || 0,
    pendingInvoices: summary.pendingInvoices || 0,
    overdueCount: summary.overdueCount || 0,
    pendingAmount: summary.pendingAmount || 0,
    paidAmount: summary.paidAmount || 0,
    totalAmount: summary.totalAmount || 0,
  };

  const paymentHistory = paymentHistoryData?.data?.paymentHistory || [];

  const handleViewDetails = (invoice) => {
    setSelectedInvoice({
      ...invoice,
    });
    setIsDrawerVisible(true);
  };

  const handleDownload = async (invoiceId, invoiceNumber) => {
    const blob = await downloadInvoice(invoiceId).unwrap();

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `invoice-${invoiceNumber}.pdf`;
    a.click();
    URL.revokeObjectURL(url);

    notification.success({
      message: "Download successful",
      description: `Invoice ${invoiceNumber} has been downloaded`,
    });
  };

  const handleExportInvoices = async () => {
    try {
      const params = {};

      if (customerId) {
        params.customerId = customerId;
      }

      if (status) {
        params.status = status;
      }

      const blob = await exportInvoices(params).unwrap();

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = `invoices_${Date.now()}.xlsx`;

      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(url);

      notification.success({
        message: "Success",
        description: "Invoices exported successfully",
      });
    } catch (error) {
      console.error("Export error:", error);

      notification.error({
        message: "Export Failed",
        description: error?.data?.message || "Failed to export invoices",
      });
    }
  };

  const handleEdit = (invoice) => {
    navigate(ROUTE_PATHS.ADMIN_CREATE_INVOICE, { state: { invoice } });
  };

  const handleCashPayment = (invoice) => {
    setSelectedInvoiceForPayment(invoice);
    setIsCashPaymentModalVisible(true);
  };

  const handleCashPaymentSuccess = () => {
    notification.success({
      message: "Success",
      description: "Cash payment recorded successfully",
    });
    refetch();
  };

  const handleDelete = (invoiceId) => {
    Modal.confirm({
      title: "Delete Invoice?",
      content: "This will permanently delete the invoice. Are you sure?",
      okText: "Yes, Delete",
      okType: "danger",
      cancelText: "Cancel",
      onOk: async () => {
        try {
          await deleteInvoice(invoiceId).unwrap();

          notification.success({
            message: "Success",
            description: "Invoice deleted successfully",
          });
        } catch (error) {
          notification.error({
            message: "Failed",
            description: error?.data?.message || "Failed to delete invoice",
          });
        }
      },
    });
  };

  const statusColors = {
    PAID: "green",
    PENDING: "orange",
    PARTIALLY_PAID: "gold",
    CANCELLED: "red",
  };

  const columns = InvoiceColumns({
    handleViewDetails,
    handleEdit,
    handleCashPayment,
    handleDownload,
    downloadLoading,
    statusColors,
    handleDelete,
    deleteLoading,
  });

  return (
    <div className="invoice-management">
      <SummaryCards type="invoice" summaryData={summaryData} />

      <ManagementTableCard
        type="invoice"
        list={customersList}
        selectedItem={customerId}
        setSelectedItem={handleCustomerChange}
        statusFilter={status}
        setStatusFilter={handleStatusChange}
        handleExport={handleExportInvoices}
        dataSource={invoicesData}
        isLoading={isLoading}
        columns={columns}
        handleTableChange={handleTableChange}
        paginationData={paginationData}
      />

      <DetailDrawer
        type="invoice"
        open={isDrawerVisible}
        onClose={() => setIsDrawerVisible(false)}
        data={selectedInvoice}
        statusColors={statusColors}
        paymentHistory={paymentHistory}
      />

      <CashPaymentModal
        type="invoice"
        data={selectedInvoiceForPayment}
        visible={isCashPaymentModalVisible}
        onClose={() => {
          setIsCashPaymentModalVisible(false);
          setSelectedInvoiceForPayment(null);
        }}
        onPaymentSuccess={handleCashPaymentSuccess}
      />
    </div>
  );
}

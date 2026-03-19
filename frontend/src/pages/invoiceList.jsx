import "@ant-design/v5-patch-for-react-19";
import { notification, Modal } from "antd";
import { useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import PaymentModal from "../components/PaymentModal";
import DetailDrawer from "../components/DetailDrawer";
import SummaryCards from "../components/SummaryCard";
import ManagementTableCard from "../components/ManagementTableCard";

import {
  useGetInvoicesQuery,
  useDeleteInvoiceMutation,
} from "../service/invoiceApi";
import { useGetPaymentHistoryQuery } from "../service/paymentApi";
import { useExportInvoiceMutation } from "../service/invoiceApi";
import { useDownloadInvoiceMutation } from "../service/invoiceApi";
import { InvoiceListColumn } from "../columns/InvoiceListColumn";
import { ROUTE_PATHS } from "../enum/apiUrl";
import "../css/InvoiceManagement.css";

export default function InvoiceList() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState(null);
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [pageSize, setPageSize] = useState(10);
  const currentUser = useSelector((state) => state.auth.user);
  const currentUserId = currentUser?._id || currentUser?.id || null;

  const [selectedInvoiceForPayment, setSelectedInvoiceForPayment] =
    useState(null);
  const { data, isLoading, isFetching, refetch } = useGetInvoicesQuery({
    page,
    limit: pageSize,
    status: statusFilter,
    customer: currentUserId,
  });
  const { data: paymentHistoryData } = useGetPaymentHistoryQuery(
    selectedInvoice?._id,
    { skip: !selectedInvoice?._id },
  );
  const [exportInvoices, { isLoading: exportLoading }] =
    useExportInvoiceMutation();
  const [downloadInvoice, { isLoading: downloadLoading }] =
    useDownloadInvoiceMutation();

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
    totalAmount: summary.totalAmount || 0,
    paidAmount: summary.paidAmount || 0,
    pendingInvoices: summary.pendingInvoices || 0,
    pendingAmount: summary.pendingAmount || 0,
    overdueCount: summary.overdueCount || 0,
  };

  const handleEdit = (invoice) => {
    navigate(ROUTE_PATHS.INVOICE_ID(invoice));
  };

  const paymentHistory = paymentHistoryData?.data?.paymentHistory || [];

  const handleViewDetails = async (invoice) => {
    setIsDrawerVisible(true);
    setSelectedInvoice({ ...invoice });
  };

  const handlePaymentClick = (invoice) => {
    if (invoice.status === "PAID") {
      notification.warning({
        message: "Already Paid",
        description: "This invoice has already been paid",
      });
      return;
    }
    setSelectedInvoiceForPayment(invoice);
    setPaymentModalVisible(true);
  };

  const handleExportInvoices = async () => {
    try {
      const params = {};

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

  const handleDownLoad = async (invoiceId, invoiceNumber) => {
    const blob = await downloadInvoice(invoiceId).unwrap();

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `invoice-${invoiceNumber}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePaymentSuccess = () => {
    notification.success({
      message: "Success",
      description: "Invoice marked as PAID",
    });
    refetch();
    setPaymentModalVisible(false);
  };

  const handleTableChange = (paginationInfo) => {
    setPage(paginationInfo.current);
    setPageSize(paginationInfo.pageSize);
  };

  const [deleteInvoice, { isLoading: deleteLoading }] =
    useDeleteInvoiceMutation();
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
    CANCELLED: "red",
    PARTIALLY_PAID: "gold",
  };

  const columns = InvoiceListColumn({
    handleViewDetails,
    handleDownLoad,
    handlePaymentClick,
    handleEdit,
    handleDelete,
    downloadLoading,
    deleteLoading,
  });

  return (
    <>
      <SummaryCards type="invoice" summaryData={summaryData} />

      <ManagementTableCard
        type="invoice"
        dataSource={invoicesData}
        paginationData={paginationData}
        isLoading={isLoading || isFetching}
        columns={columns}
        handleTableChange={handleTableChange}
        onExport={handleExportInvoices}
        exportLoading={exportLoading}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
      />

      <PaymentModal
        invoice={selectedInvoiceForPayment}
        visible={paymentModalVisible}
        onClose={() => setPaymentModalVisible(false)}
        onPaymentSuccess={handlePaymentSuccess}
      />

      <DetailDrawer
        type="invoices"
        selectedInvoice={selectedInvoice}
        open={isDrawerVisible}
        data={selectedInvoice}
        onClose={() => {
          setIsDrawerVisible(false);
          setSelectedInvoice(null);
        }}
        statusColors={statusColors}
        paymentHistory={paymentHistory}
      />
    </>
  );
}

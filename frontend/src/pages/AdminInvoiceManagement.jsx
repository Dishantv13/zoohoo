import "@ant-design/v5-patch-for-react-19";
import { useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Card, notification, Empty } from "antd";
import CashPaymentModal from "../components/CashPaymentModal";
import DetailDrawer from "../components/DetailDrawer";
import SummaryCards from "../components/SummaryCard";
import ManagementTableCard from "../components/ManagementTableCard";
import {
  useGetAdminAllInvoicesQuery,
  useDownloadInvoiceMutation,
  useExportInvoiceMutation,
} from "../service/invoiceApi";
import { useGetCustomersQuery } from "../service/customerApi";
import { useGetPaymentHistoryQuery } from "../service/paymentApi";
import { InvoiceColumns } from "../columns/InvoiceColumn";

import "../css/InvoiceManagement.css";

export default function AdminInvoiceManagement() {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);
  const [isCashPaymentModalVisible, setIsCashPaymentModalVisible] =
    useState(false);
  const [selectedInvoiceForPayment, setSelectedInvoiceForPayment] =
    useState(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [statusFilters, setStatusFilters] = useState({
    status: null,
  });

  const handleTableChange = (paginationInfo) => {
    setPage(paginationInfo.current);
    setPageSize(paginationInfo.pageSize);
  };

  if (!user || user.role !== "admin") {
    return (
      <Card>
        <Empty description="Admin access only. Please login as admin." />
      </Card>
    );
  }

  const { data: customersData } = useGetCustomersQuery({
    limit: 1000,
  });

  const customersList = customersData?.data?.customers || customersData || [];

  const { data, refetch } = useGetAdminAllInvoicesQuery({
    page,
    limit: pageSize,
    status: statusFilters.status,
    customerId: selectedCustomer,
  });

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

  const { data: paymentHistoryData } = useGetPaymentHistoryQuery(
    selectedInvoice?._id,
    { skip: !selectedInvoice?._id },
  );

  const paymentHistory = paymentHistoryData?.data?.paymentHistory || [];

  const handleViewDetails = (invoice) => {
    setSelectedInvoice({
      ...invoice,
    });
    setIsDrawerVisible(true);
  };

  const [downloadInvoice, { isLoading: downloadLoading }] =
    useDownloadInvoiceMutation();
  const handleDownload = async (invoiceId, invoiceNumber) => {
    const blob = await downloadInvoice(invoiceId).unwrap();

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `invoice-${invoiceNumber}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const [exportInvoices, { isLoading }] = useExportInvoiceMutation();
  const handleExportInvoices = async () => {
    try {
      const params = {};

      if (selectedCustomer) {
        params.customerId = selectedCustomer;
      }

      if (statusFilters?.status) {
        params.status = statusFilters.status;
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
    navigate("/admin/customer/create-invoice", { state: { invoice } });
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
  });

  return (
    <div className="invoice-management">
      <SummaryCards type="invoice" summaryData={summaryData} />

      <ManagementTableCard
        type="invoice"
        list={customersList}
        selectedItem={selectedCustomer}
        setSelectedItem={setSelectedCustomer}
        statusFilter={statusFilters?.status}
        setStatusFilter={(value) =>
          setStatusFilters({ ...statusFilters, status: value })
        }
        setPage={setPage}
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

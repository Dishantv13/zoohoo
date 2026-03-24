import "@ant-design/v5-patch-for-react-19";
import { useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, notification, Empty } from "antd";
import "../css/InvoiceManagement.css";
import {
  useGetBillsQuery,
  useDeleteBillMutation,
  useGetBillsStatsQuery,
} from "../service/billApi";
import { useGetVendorsQuery } from "../service/vendorApi";
import { useGetBillPaymentHistoryQuery } from "../service/paymentApi";
import DetailDrawer from "../components/detailDrawer/DetailDrawer";
import SummaryCards from "../components/SummaryCard";
import ManagementTableCard from "../components/managementModel/ManagementTableCard";
import PaymentModel from "../components/paymentModel/PaymentModal";
import CashPaymentModel from "../components/paymentModel/CashPaymentModal";
import { getBillColumns } from "../columns/BillColumn";
import { ROUTE_PATHS } from "../enum/apiUrl";

const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
});

export default function AdminBillManagement() {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const [selectedBill, setSelectedBill] = useState(null);
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [cashPaymentModalVisible, setCashPaymentModalVisible] = useState(false);
  const [selectedBillForPayment, setSelectedBillForPayment] = useState(null);
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
  const vendorId = searchParams.get("vendorId") || null;
  const { data: vendorsData } = useGetVendorsQuery({
    page: 1,
    limit: 100,
  });
  const {
    data: billsData,
    isLoading,
    refetch,
  } = useGetBillsQuery({
    vendorId: vendorId ? String(vendorId) : null,
    status: status || undefined,
    page,
    limit,
  });
  const { data: billStatsData } = useGetBillsStatsQuery();
  const [deleteBill, { isLoading: isDeleting }] = useDeleteBillMutation();
  const { data: paymentHistoryData } = useGetBillPaymentHistoryQuery(
    selectedBill?._id,
    {
      skip: !selectedBill?._id,
    },
  );

  const vendorsList = vendorsData?.data?.vendors || [];
  const bills = billsData?.data?.bills || [];
  const summaryData = billStatsData?.data?.statistics || {};

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

  const handleVendorChange = (value) => {
    const params = Object.fromEntries(searchParams.entries());
    if (!value) {
      delete params.vendorId;
    } else {
      params.vendorId = value;
    }
    params.page = 1;

    setSearchParams(params);
  };

  const pagination = billsData?.data?.pagination || {};
  const paginationData = {
    current: pagination.page,
    pageSize: pagination.limit,
    total: pagination.totalItems,
  };

  const statusColors = {
    PAID: "green",
    PENDING: "orange",
    PARTIALLY_PAID: "gold",
  };

  const paymentHistory = paymentHistoryData?.data?.paymentHistory || [];

  const handleDelete = async (billId) => {
    try {
      await deleteBill(billId).unwrap();
      notification.success({
        message: "Success",
        description: "Bill deleted successfully",
      });
      refetch();
    } catch (error) {
      notification.error({
        message: "Error",
        description: error?.data?.message || "Failed to delete bill",
      });
    }
  };

  const handleCardPaymentClick = (bill) => {
    if (bill.status === "PAID") {
      notification.warning({
        message: "Already Paid",
        description: "This bill has already been paid",
      });
      return;
    }
    setSelectedBillForPayment(bill);
    setPaymentModalVisible(true);
  };

  const handleCashPaymentClick = (bill) => {
    if (bill.status === "PAID") {
      notification.warning({
        message: "Already Paid",
        description: "This bill has already been paid",
      });
      return;
    }
    setSelectedBillForPayment(bill);
    setCashPaymentModalVisible(true);
  };

  const handlePaymentSuccess = () => {
    refetch();
    notification.success({
      message: "Success",
      description: "Bill payment recorded successfully",
    });
  };

  const columns = getBillColumns({
    statusColors,
    currencyFormatter,
    navigate,
    setSelectedBill,
    setIsDrawerVisible,
    handleCardPaymentClick,
    handleCashPaymentClick,
    handleDelete,
    isDeleting,
  });

  return (
    <div className="invoice-management">
      <SummaryCards type="bill" summaryData={summaryData} />

      <ManagementTableCard
        type="bill"
        list={vendorsList}
        selectedItem={vendorId}
        setSelectedItem={handleVendorChange}
        statusFilter={status}
        setStatusFilter={handleStatusChange}
        navigate={navigate}
        createPath={ROUTE_PATHS.ADMIN_CREATE_BILL}
        dataSource={bills}
        isLoading={isLoading}
        columns={columns}
        handleTableChange={handleTableChange}
        paginationData={paginationData}
      />

      <DetailDrawer
        type="bill"
        open={isDrawerVisible}
        onClose={() => setIsDrawerVisible(false)}
        data={selectedBill}
        statusColors={statusColors}
        paymentHistory={paymentHistory}
        currencyFormatter={currencyFormatter}
      />

      <PaymentModel
        type="bill"
        data={selectedBillForPayment}
        visible={paymentModalVisible}
        onClose={() => {
          setPaymentModalVisible(false);
          setSelectedBillForPayment(null);
        }}
        onPaymentSuccess={handlePaymentSuccess}
      />

      <CashPaymentModel
        type="bill"
        data={selectedBillForPayment}
        visible={cashPaymentModalVisible}
        onClose={() => {
          setCashPaymentModalVisible(false);
          setSelectedBillForPayment(null);
        }}
        onPaymentSuccess={handlePaymentSuccess}
      />
    </div>
  );
}

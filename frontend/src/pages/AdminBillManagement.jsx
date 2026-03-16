import "@ant-design/v5-patch-for-react-19";
import { useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Card, notification, Empty } from "antd";
import "../css/InvoiceManagement.css";
import {
  useGetBillsQuery,
  useDeleteBillMutation,
  useGetBillsStatsQuery,
} from "../service/billApi";
import { useGetVendorsQuery } from "../service/vendorApi";
import { useGetBillPaymentHistoryQuery } from "../service/paymentApi";
import DetailDrawer from "../components/DetailDrawer";
import SummaryCards from "../components/SummaryCard";
import ManagementTableCard from "../components/ManagementTableCard";
import PaymentModel from "../components/PaymentModal";
import CashPaymentModel from "../components/CashPaymentModal";
import { getBillColumns } from "../columns/BillColumn";

const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
});

export default function AdminBillManagement() {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [selectedBill, setSelectedBill] = useState(null);
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);
  const [statusFilter, setStatusFilter] = useState(null);
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [cashPaymentModalVisible, setCashPaymentModalVisible] = useState(false);
  const [selectedBillForPayment, setSelectedBillForPayment] = useState(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  if (!user || user.role !== "admin") {
    return (
      <Card>
        <Empty description="Admin access only. Please login as admin." />
      </Card>
    );
  }

  const { data: vendorsData } = useGetVendorsQuery({
    page: 1,
    limit: 100,
  });
  const {
    data: billsData,
    isLoading,
    refetch,
  } = useGetBillsQuery({
    vendorId: selectedVendor ? String(selectedVendor) : null,
    status: statusFilter,
    page,
    limit,
  });
  const { data: billStatsData } = useGetBillsStatsQuery();

  const [deleteBill, { isLoading: isDeleting }] = useDeleteBillMutation();

  const vendorsList = vendorsData?.data?.vendors || [];
  const bills = billsData?.data?.bills || [];
  const summaryData = billStatsData?.data?.statistics || {};

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

  const { data: paymentHistoryData } = useGetBillPaymentHistoryQuery(
    selectedBill?._id,
    {
      skip: !selectedBill?._id,
    },
  );

  const paymentHistory = paymentHistoryData?.data?.paymentHistory || [];

  const handleTableChange = (paginationInfo) => {
    setPage(paginationInfo.current);
    setLimit(paginationInfo.pageSize);
  };

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
        selectedItem={selectedVendor}
        setSelectedItem={setSelectedVendor}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        setPage={setPage}
        navigate={navigate}
        createPath="/admin/vendor/create-bill"
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

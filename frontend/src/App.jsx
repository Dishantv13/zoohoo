import { Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import AppLayout from "./layout/AppLayout";
import ProtectedRoute from "./components/ProtectedRoute";

import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminRegister from "./pages/AdminRegister";

import Customers from "./pages/Customer";
import CreateInvoice from "./pages/CreateInvoice";
import InvoiceList from "./pages/invoiceList";

import CustomerManagement from "./pages/CustomerManagement";
import AdminCreateInvoice from "./pages/AdminCreateinvoice";
import AdminInvoiceManagement from "./pages/AdminInvoiceManagement";

import VendorManagement from "./pages/VendorManagement";
import AdminCreateBill from "./pages/AdminCreateBill";
import AdminBillManagement from "./pages/AdminBillManagement";
import VendorInventory from "./pages/VendorInventory";

import Report from "./pages/Report";
import RevenueReport from "./pages/RevenueReport";
import ExpenseReport from "./pages/ExpenseReport";

export default function App() {
    const { isAuthenticated } = useSelector((state) => state.auth);
  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/admin/register" element={<AdminRegister />} />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    );
  }

  return (
    <AppLayout>
      <Routes>
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Customers />
            </ProtectedRoute>
          }
        />

        <Route
          path="/create-invoice"
          element={
            <ProtectedRoute>
              <CreateInvoice />
            </ProtectedRoute>
          }
        />

        <Route
          path="/invoices"
          element={
            <ProtectedRoute>
              <InvoiceList />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/customers"
          element={
            <ProtectedRoute>
              <CustomerManagement />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/vendors"
          element={
            <ProtectedRoute>
              <VendorManagement />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/customer/create-invoice"
          element={
            <ProtectedRoute>
              <AdminCreateInvoice />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/vendor/create-bill"
          element={
            <ProtectedRoute>
              <AdminCreateBill />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/vendor/bills"
          element={
            <ProtectedRoute>
              <AdminBillManagement />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/customer/invoices"
          element={
            <ProtectedRoute>
              <AdminInvoiceManagement />
            </ProtectedRoute>
          }
        />

        <Route
          path="/vendor/inventory"
          element={
            <ProtectedRoute>
              <VendorInventory />
            </ProtectedRoute>
          }
        />

        <Route
          path="/report"
          element={
            <ProtectedRoute>
              <Report />
            </ProtectedRoute>
          }
        />

        <Route
          path="/revenue-report"
          element={
            <ProtectedRoute>
              <RevenueReport />
            </ProtectedRoute>
          }
        />

        <Route
          path="/expense-report"
          element={
            <ProtectedRoute>
              <ExpenseReport />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </AppLayout>
  );
}
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
import AdminCreateInvoice from "./pages/AdminCreateInvoice";
import AdminInvoiceManagement from "./pages/AdminInvoiceManagement";

import VendorManagement from "./pages/VendorManagement";
import AdminCreateBill from "./pages/AdminCreateBill";
import AdminBillManagement from "./pages/AdminBillManagement";
import VendorInventory from "./pages/VendorInventory";

import Report from "./pages/Report";
import RevenueReport from "./pages/RevenueReport";
import ExpenseReport from "./pages/ExpenseReport";

import { ROUTE_PATHS } from "./enum/apiUrl";

export default function App() {
    const { isAuthenticated } = useSelector((state) => state.auth);
  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path={ROUTE_PATHS.LOGIN} element={<Login />} />
        <Route path={ROUTE_PATHS.REGISTER} element={<Register />} />
        <Route path={ROUTE_PATHS.ADMIN_REGISTER} element={<AdminRegister />} />
        <Route path="*" element={<Navigate to={ROUTE_PATHS.LOGIN} />} />
      </Routes>
    );
  }

  return (
    <AppLayout>
      <Routes>
        <Route
          path={ROUTE_PATHS.HOME}
          element={
            <ProtectedRoute>
              <Customers />
            </ProtectedRoute>
          }
        />

        <Route
          path={ROUTE_PATHS.CREATE_INVOICE}
          element={
            <ProtectedRoute>
              <CreateInvoice />
            </ProtectedRoute>
          }
        />

        <Route
          path={ROUTE_PATHS.INVOICES}
          element={
            <ProtectedRoute>
              <InvoiceList />
            </ProtectedRoute>
          }
        />

        <Route
          path={ROUTE_PATHS.CUSTOMER_MANAGEMENT}
          element={
            <ProtectedRoute>
              <CustomerManagement />
            </ProtectedRoute>
          }
        />

        <Route
          path={ROUTE_PATHS.VENDOR_MANAGEMENT}
          element={
            <ProtectedRoute>
              <VendorManagement />
            </ProtectedRoute>
          }
        />

        <Route
          path={ROUTE_PATHS.ADMIN_CREATE_INVOICE}
          element={
            <ProtectedRoute>
              <AdminCreateInvoice />
            </ProtectedRoute>
          }
        />

        <Route
          path={ROUTE_PATHS.ADMIN_CREATE_BILL}
          element={
            <ProtectedRoute>
              <AdminCreateBill />
            </ProtectedRoute>
          }
        />

        <Route
          path={ROUTE_PATHS.ADMIN_VENDOR_BILLS}
          element={
            <ProtectedRoute>
              <AdminBillManagement />
            </ProtectedRoute>
          }
        />

        <Route
          path={ROUTE_PATHS.ADMIN_INVOICE_MANAGEMENT}
          element={
            <ProtectedRoute>
              <AdminInvoiceManagement />
            </ProtectedRoute>
          }
        />

        <Route
          path={ROUTE_PATHS.VENDOR_INVENTORY}
          element={
            <ProtectedRoute>
              <VendorInventory />
            </ProtectedRoute>
          }
        />

        <Route
          path={ROUTE_PATHS.REPORT}
          element={
            <ProtectedRoute>
              <Report />
            </ProtectedRoute>
          }
        />

        <Route
          path={ROUTE_PATHS.REVENUE_REPORT}
          element={
            <ProtectedRoute>
              <RevenueReport />
            </ProtectedRoute>
          }
        />

        <Route
          path={ROUTE_PATHS.EXPENSE_REPORT}
          element={
            <ProtectedRoute>
              <ExpenseReport />
            </ProtectedRoute>
          }
        />

        <Route path={ROUTE_PATHS.FALSE} element={<Navigate to={ROUTE_PATHS.HOME} />} />
      </Routes>
    </AppLayout>
  );
}
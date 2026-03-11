import "@ant-design/v5-patch-for-react-19";
import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import { Layout, Menu, Button, Dropdown, Spin, message } from "antd";
import {
  UserOutlined,
  FileAddOutlined,
  UnorderedListOutlined,
  LogoutOutlined,
  TeamOutlined,
  ShopOutlined,
  AppstoreOutlined,
} from "@ant-design/icons";
import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { useEffect } from "react";

import Customers from "./pages/Customer.jsx";
import CreateInvoice from "./pages/CreateInvoice.jsx";
import AdminCreateInvoice from "./pages/AdminCreateInvoice.jsx";
import InvoiceList from "./pages/invoiceList.jsx";
import Login from "./pages/Login.jsx";
import VendorLogin from "./pages/VendorLogin.jsx";
import Register from "./pages/Register.jsx";
import AdminRegister from "./pages/AdminRegister.jsx";
import CustomerManagement from "./pages/CustomerManagement.jsx";
import AdminInvoiceManagement from "./pages/AdminInvoiceManagement.jsx";
import VendorManagement from "./pages/VendorManagement.jsx";
import AdminBillManagement from "./pages/AdminBillManagement.jsx";
import AdminCreateBill from "./pages/AdminCreateBill.jsx";
import VendorInventory from "./pages/VendorInventory.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import { setCredentials, logoutUser } from "./slice/authSlice.js";
import { useGetCurrentUserQuery, useLogoutMutation } from "./service/authApi";
import { authApi } from "./service/authApi";
import Report from "./pages/Report.jsx";
import "./index.css";

const { Header, Content } = Layout;

export default function App() {
  const { pathname } = useLocation();
  const dispatch = useDispatch();
  const { user, token, isAuthenticated } = useSelector((state) => state.auth);

  const { data: currentUserData, isLoading: currentUserLoading } =
    useGetCurrentUserQuery(undefined, {
      skip: !token || user?.role === "vendor",
    });

  useEffect(() => {
    if (currentUserData?.data && user?.role !== "vendor") {
      dispatch(
        setCredentials({
          user: currentUserData.data,
          token,
        }),
      );
    }
  }, [currentUserData, dispatch, token, user?.role]);

  const [logoutApi] = useLogoutMutation();

  const handleLogout = async () => {
    try {
      if (user?.role !== "vendor") {
        await logoutApi().unwrap();
      }

      localStorage.clear();

      dispatch(logoutUser());
      dispatch(authApi.util.resetApiState());
      message.success("Logout Successful");
    } catch (error) {
      message.error("Logout Failed");
    }
  };

  const authRoutes = ["/login", "/vendor/login", "/register", "/admin/register"];

  const showLayout = isAuthenticated && !authRoutes.includes(pathname);

  const menuItems =
    user?.role === "admin"
      ? [
          {
            key: "customer-tab",
            icon: <TeamOutlined />,
            label: "Customer",
            children: [
              {
                key: "customer-management",
                label: <Link to="/admin/customers">Customer Management</Link>,
              },
              {
                key: "customer-create-invoice",
                label: (
                  <Link to="/admin/customer/create-invoice">Create Invoice</Link>
                ),
              },
              {
                key: "customer-invoice-management",
                label: (
                  <Link to="/admin/customer/invoices">Invoice Management</Link>
                ),
              },
            ],
          },
          {
            key: "vendor-tab",
            icon: <ShopOutlined />,
            label: "Vendor",
            children: [
              {
                key: "vendor-management",
                label: <Link to="/admin/vendors">Vendor Management</Link>,
              },
              {
                key: "vendor-create-bill",
                label: <Link to="/admin/vendor/create-bill">Create Bill</Link>,
              },
              {
                key: "vendor-bill-management",
                label: <Link to="/admin/vendor/bills">Bill Management</Link>,
              },
            ],
          },
          {
            key: "report",
            icon: <UnorderedListOutlined />,
            label: <Link to="/report">Report</Link>,
          },
        ]
      : user?.role === "vendor"
        ? [
            {
              key: "vendor-inventory",
              icon: <AppstoreOutlined />,
              label: <Link to="/vendor/inventory">My Inventory</Link>,
            },
          ]
        : [
            {
              key: "1",
              icon: <UserOutlined />,
              label: <Link to="/customers">Customer Profile</Link>,
            },
            {
              key: "2",
              icon: <FileAddOutlined />,
              label: <Link to="/create-invoice">Create Invoice</Link>,
            },
            {
              key: "3",
              icon: <UnorderedListOutlined />,
              label: <Link to="/invoices">Invoice</Link>,
            },
          ];

  const userMenuItems = [
    {
      key: "profile",
      label: `Hello, ${user?.name || "User"}`,
      disabled: true,
    },
    {
      type: "divider",
    },
    {
      key: "logout",
      style: { color: "red" },
      label: "Logout",
      icon: <LogoutOutlined />,
      onClick: handleLogout,
    },
  ];

  const selectedKey = (() => {
    if (user?.role === "admin") {
      if (pathname === "/" || pathname === "/admin/customers") {
        return ["customer-management"];
      } else if (
        pathname === "/admin/customer/create-invoice" ||
        pathname === "/create-invoice"
      ) {
        return ["customer-create-invoice"];
      } else if (
        pathname === "/admin/customer/invoices" ||
        pathname === "/admin/invoices"
      ) {
        return ["customer-invoice-management"];
      } else if (pathname === "/admin/vendors") {
        return ["vendor-management"];
      } else if (pathname === "/admin/vendor/create-bill") {
        return ["vendor-create-bill"];
      } else if (pathname === "/admin/vendor/bills") {
        return ["vendor-bill-management"];
      } else if (pathname === "/report") {
        return ["report"];
      }
    } else if (user?.role === "vendor") {
      if (pathname === "/" || pathname === "/vendor/inventory") {
        return ["vendor-inventory"];
      }
    } else {
      if (pathname === "/" || pathname === "/customers") {
        return ["1"];
      } else if (pathname === "/create-invoice") {
        return ["2"];
      } else if (pathname === "/invoices" || pathname.startsWith("/invoices/")) {
        return ["3"];
      }
    }
    return [];
  })();

  if (!showLayout) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/vendor/login" element={<VendorLogin />} />
        <Route path="/register" element={<Register />} />
        <Route path="/admin/register" element={<AdminRegister />} />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    );
  }

  if (currentUserLoading && token && !user) {
    return (
      <Layout
        style={{
          minHeight: "100vh",
          minWidth: "100vw",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Spin size="large" />
      </Layout>
    );
  }

  return (
    <Layout style={{ minHeight: "100vh", minWidth: "100vw" }}>
      <Header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Menu
          theme="dark"
          mode="horizontal"
          items={menuItems}
          selectedKeys={selectedKey}
          style={{ flex: 1 }}
        />
        <Dropdown menu={{ items: userMenuItems }}>
          <Button type="text" style={{ color: "white" }}>
            <UserOutlined /> Account
          </Button>
        </Dropdown>
      </Header>

      <Content style={{ padding: 24 }}>
        <Routes>
          <Route
            path="/"
            element={
              <ProtectedRoute>
                {user?.role === "admin" ? (
                  <CustomerManagement />
                ) : user?.role === "vendor" ? (
                  <VendorInventory />
                ) : (
                  <Customers />
                )}
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
            path="/customers"
            element={
              <ProtectedRoute>
                <Customers />
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
            path="/admin/invoices"
            element={
              <ProtectedRoute>
                <AdminInvoiceManagement />
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
            path="/admin/customer/create-invoice"
            element={
              <ProtectedRoute>
                <AdminCreateInvoice />
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
            path="/admin/vendor/bills"
            element={
              <ProtectedRoute>
                <AdminBillManagement />
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
            path="/report"
            element={
              <ProtectedRoute>
                <Report />
              </ProtectedRoute>
            }
          />
          <Route
            path="/create-invoice"
            element={
              <ProtectedRoute>
                {user?.role === "admin" ? <AdminCreateInvoice /> : <CreateInvoice />}
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
            path="/invoices/:id"
            element={
              <ProtectedRoute>
                <CreateInvoice />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Content>
    </Layout>
  );
}

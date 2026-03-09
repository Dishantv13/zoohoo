import "@ant-design/v5-patch-for-react-19";
import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import { Layout, Menu, Button, Dropdown, Spin, message } from "antd";
import {
  UserOutlined,
  FileAddOutlined,
  UnorderedListOutlined,
  LogoutOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { useEffect } from "react";

import Customers from "./pages/Customer.jsx";
import CreateInvoice from "./pages/CreateInvoice.jsx";
import AdminCreateInvoice from "./pages/AdminCreateInvoice.jsx";
import InvoiceList from "./pages/invoiceList.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import AdminRegister from "./pages/AdminRegister.jsx";
import CustomerManagement from "./pages/CustomerManagement.jsx";
import AdminInvoiceManagement from "./pages/AdminInvoiceManagement.jsx";
// import AdminChatPage from "./pages/AdminChatPage.jsx";
// import CustomerChatPage from "./pages/CustomerChatPage.jsx";
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
      skip: !token,
    });

  useEffect(() => {
    if (currentUserData?.data) {
      dispatch(
        setCredentials({
          user: currentUserData.data,
          token,
        }),
      );
    }
  }, [currentUserData, dispatch, token]);

  const [logoutApi] = useLogoutMutation();

  const handleLogout = async () => {
    try {
      await logoutApi().unwrap();

      dispatch(logoutUser());
      dispatch(authApi.util.resetApiState());
      message.success("Logout Successful");
    } catch (error) {
      message.error("Logout Failed");
    }
  };

  const authRoutes = ["/login", "/register", "/admin/register"];

  const showLayout = isAuthenticated && !authRoutes.includes(pathname);

  const menuItems =
    user?.role === "admin"
      ? [
          {
            key: "1",
            icon: <TeamOutlined />,
            label: <Link to="/admin/customers">Manage Customers</Link>,
          },
          {
            key: "2",
            icon: <FileAddOutlined />,
            label: <Link to="/create-invoice">Create Invoice</Link>,
          },
          {
            key: "3",
            icon: <UnorderedListOutlined />,
            label: <Link to="/admin/invoices">Invoice Management</Link>,
          },
          {
            key: "4",
            icon: <UnorderedListOutlined />,
            label: <Link to="/report">Report</Link>,
          },
          // {
          //   key: "5",
          //   label: <Link to="/admin/chat">Admin Chat</Link>,
          // },
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
          //   {
          //     key: "4",
          //     icon: <UserOutlined />,
          //     label: <Link to="/customer/chat">Support Chat</Link>,
          //   },
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
        return ["1"];
      } else if (pathname === "/create-invoice") {
        return ["2"];
      } else if (pathname === "/admin/invoices") {
        return ["3"];
      } else if (pathname === "/report") {
        return ["4"];
      } else if (pathname === "/admin/chat") {
        return ["5"];
      }
    } else {
      if (pathname === "/" || pathname === "/customers") {
        return ["1"];
      } else if (pathname === "/create-invoice") {
        return ["2"];
      } else if (
        pathname === "/invoices" ||
        pathname.startsWith("/invoices/")
      ) {
        return ["3"];
      }
      //   else if (pathname === "/customer/chat") {
      //     return ["4"];
      //   }
    }
    return [];
  })();

  if (!showLayout) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
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
                ) : (
                  <Customers />
                )}
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
          {/* <Route
            path="/admin/chat"
            element={
              <ProtectedRoute>
                <AdminChatPage />
              </ProtectedRoute>
            }
          /> */}
          {/* <Route
            path="/customer/chat"
            element={
              <ProtectedRoute>
                <CustomerChatPage />
              </ProtectedRoute>
            }
          /> */}
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
                {user?.role === "admin" ? (
                  <AdminCreateInvoice />
                ) : (
                  <CreateInvoice />
                )}
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

import "@ant-design/v5-patch-for-react-19"
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { Layout, Menu, Button, Dropdown, Spin } from 'antd';
import { UserOutlined, FileAddOutlined, UnorderedListOutlined, LogoutOutlined } from '@ant-design/icons';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from "react-router-dom"
import { useEffect } from 'react';

import Customers from './pages/Customer.jsx';
import CreateInvoice from './pages/CreateInvoice.jsx';
import InvoiceList from './pages/invoiceList.jsx';
import Login from "./pages/Login.jsx";
import Register from './pages/Register.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import { logout, getCurrentUser } from './features/auth/authSlice.js';

const { Header, Content } = Layout;

export default function App() {
  const { pathname } = useLocation();
  const dispatch = useDispatch();
  const { isAuthenticated, user, loading, token } = useSelector((state) => state.auth);

  useEffect(() => {
    if (token && !user && !loading) {
      dispatch(getCurrentUser());
    }
  }, [token, user, loading, dispatch]);
 
  const showLayout = isAuthenticated && !['/login', '/register'].includes(pathname);

  const menuItems = [
    {
      key: '1',
      icon: <UserOutlined />,
      label: <Link to="/customers">Customer Profile</Link>
    },
    {
      key: '2',
      icon: <FileAddOutlined />,
      label: <Link to="/create-invoice">Create Invoice</Link>
    },
    {
      key: '3',
      icon: <UnorderedListOutlined />,
      label: <Link to="/invoices">Invoice</Link>
    },
  ];

  const userMenuItems = [
    {
      key: 'profile',
      label: `Hello, ${user?.name || 'User'}`,
      disabled: true,
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      label: 'Logout',
      icon: <LogoutOutlined />,
      onClick: () => {
        dispatch(logout());
      },
    },
  ];

  const selectedKey = (() => {
    if (pathname === '/' || pathname === '/customers') {
      return ['1'];
    } else if (pathname === '/create-invoice') {
      return ['2'];
    } else if (pathname === '/invoices' || pathname.startsWith('/invoices/')) {
      return ['3'];
    }
    return [];
  })();

  if (!showLayout) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    );
  }

  if (loading && token && !user) {
    return (
      <Layout style={{ minHeight: '100vh', minWidth: "100vh", display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Spin size="large" />
      </Layout>
    );
  }

  return (
    <Layout style={{ minHeight: '100vh', minWidth: "100vh" }}>
      <Header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Menu theme="dark" mode="horizontal" items={menuItems} selectedKeys={selectedKey} style={{ flex: 1 }} />
        <Dropdown menu={{ items: userMenuItems }}>
          <Button type="text" style={{ color: 'white' }}>
            <UserOutlined /> Account
          </Button>
        </Dropdown>
      </Header>

      <Content style={{ padding: 24 }}>
        <Routes>
          <Route path="/" element={<ProtectedRoute><Customers /></ProtectedRoute>} />
          <Route path="/customers" element={<ProtectedRoute><Customers /></ProtectedRoute>} />
          <Route path="/create-invoice" element={<ProtectedRoute><CreateInvoice /></ProtectedRoute>} />
          <Route path="/invoices" element={<ProtectedRoute><InvoiceList /></ProtectedRoute>} />
          <Route path="/invoices/:id" element={<ProtectedRoute><CreateInvoice /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Content>
    </Layout>
  );
}
// 
import "@ant-design/v5-patch-for-react-19"
import { Routes, Route, useLocation } from 'react-router-dom';
import { Layout, Menu } from 'antd';
import {
  UserOutlined,
  FileAddOutlined,
  UnorderedListOutlined,
} from '@ant-design/icons';

import Customers from './pages/Customer.jsx';
import CreateInvoice from './pages/CreateInvoice.jsx';
import InvoiceList from './pages/invoiceList.jsx';
import { Link } from "react-router-dom"

const { Header, Content } = Layout;

export default function App() {
  const { pathname } = useLocation();
  const menuItems = [
    {
      key: '1',
      icon: <UserOutlined />,
      label: <Link to="/customers">Customers</Link>
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

  return (
    <Layout style={{ minHeight: '100vh', minWidth: "100vh" }}>
      <Header>
        <Menu theme="dark" mode="horizontal" items={menuItems} selectedKeys={selectedKey} />
      </Header>

      <Content style={{ padding: 24 }}>
        <Routes>
          <Route path="/" element={<Customers />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="/create-invoice" element={<CreateInvoice />} />
          <Route path="/invoices" element={<InvoiceList />} />
          <Route path="/invoices/:id" element={<CreateInvoice />} />
        </Routes>
      </Content>
    </Layout>
  );
}
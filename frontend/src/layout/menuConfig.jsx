import {
  TeamOutlined,
  ShopOutlined,
  FileAddOutlined,
  UnorderedListOutlined,
  AppstoreOutlined,
  UserOutlined,
} from "@ant-design/icons";

export const menuConfig = [
  {
    key: "customer-tab",
    icon: <TeamOutlined />,
    label: "Customer",
    roles: ["admin"],
    children: [
      {
        key: "customer-management",
        label: "Customer Management",
        path: "/admin/customers",
      },
      {
        key: "customer-create-invoice",
        label: "Create Invoice",
        path: "/admin/customer/create-invoice",
      },
      {
        key: "customer-invoice-management",
        label: "Invoice Management",
        path: "/admin/customer/invoices",
      },
    ],
  },
  {
    key: "vendor-tab",
    icon: <ShopOutlined />,
    label: "Vendor",
    roles: ["admin"],
    children: [
      {
        key: "vendor-management",
        label: "Vendor Management",
        path: "/admin/vendors",
      },
      {
        key: "vendor-create-bill",
        label: "Create Bill",
        path: "/admin/vendor/create-bill",
      },
      {
        key: "vendor-bill-management",
        label: "Bill Management",
        path: "/admin/vendor/bills",
      },
    ],
  },
  {
    key: "report",
    icon: <UnorderedListOutlined />,
    label: "Report",
    roles: ["admin"],
    path: "/report",
  },
  {
    key: "revenue-report",
    icon: <FileAddOutlined />,
    label: "Revenue Report",
    roles: ["admin"],
    path: "/revenue-report",
  },
  {
    key: "expense-report",
    icon: <FileAddOutlined />,
    label: "Expense Report",
    roles: ["admin"],
    path: "/expense-report",
  },
  {
    key: "vendor-inventory",
    icon: <AppstoreOutlined />,
    label: "My Inventory",
    roles: ["vendor"],
    path: "/vendor/inventory",
  },
  {
    key: "customer-profile",
    icon: <UserOutlined />,
    label: "Customer Profile",
    roles: ["customer"],
    path: "/customers",
  },
  {
    key: "create-invoice",
    icon: <FileAddOutlined />,
    label: "Create Invoice",
    roles: ["customer"],
    path: "/create-invoice",
  },
  {
    key: "invoice-list",
    icon: <UnorderedListOutlined />,
    label: "Invoices",
    roles: ["customer"],
    path: "/invoices",
  },
];
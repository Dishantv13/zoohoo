import {
  TeamOutlined,
  ShopOutlined,
  FileAddOutlined,
  UnorderedListOutlined,
  AppstoreOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { ROUTE_PATHS } from "../enum/apiUrl";

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
        path: ROUTE_PATHS.CUSTOMER_MANAGEMENT,
      },
      {
        key: "customer-create-invoice",
        label: "Create Invoice",
        path: ROUTE_PATHS.ADMIN_CREATE_INVOICE,
      },
      {
        key: "customer-invoice-management",
        label: "Invoice Management",
        path: ROUTE_PATHS.ADMIN_INVOICE_MANAGEMENT,
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
        path: ROUTE_PATHS.VENDOR_MANAGEMENT,
      },
      {
        key: "vendor-create-bill",
        label: "Create Bill",
        path: ROUTE_PATHS.ADMIN_CREATE_BILL,
      },
      {
        key: "vendor-bill-management",
        label: "Bill Management",
        path: ROUTE_PATHS.ADMIN_VENDOR_BILLS,
      },
    ],
  },
  {
    key: "report",
    icon: <UnorderedListOutlined />,
    label: "Report",
    roles: ["admin"],
    path: ROUTE_PATHS.REPORT,
  },
  {
    key: "revenue-report",
    icon: <FileAddOutlined />,
    label: "Revenue Report",
    roles: ["admin"],
    path: ROUTE_PATHS.REVENUE_REPORT,
  },
  {
    key: "expense-report",
    icon: <FileAddOutlined />,
    label: "Expense Report",
    roles: ["admin"],
    path: ROUTE_PATHS.EXPENSE_REPORT,
  },
  {
    key: "vendor-inventory",
    icon: <AppstoreOutlined />,
    label: "My Inventory",
    roles: ["vendor"],
    path: ROUTE_PATHS.VENDOR_INVENTORY,
  },
  {
    key: "customer-profile",
    icon: <UserOutlined />,
    label: "Customer Profile",
    roles: ["customer"],
    path: ROUTE_PATHS.HOME,
  },
  {
    key: "create-invoice",
    icon: <FileAddOutlined />,
    label: "Create Invoice",
    roles: ["customer"],
    path: ROUTE_PATHS.CREATE_INVOICE,
  },
  {
    key: "invoice-list",
    icon: <UnorderedListOutlined />,
    label: "Invoices",
    roles: ["customer"],
    path: ROUTE_PATHS.INVOICES,
  },
];

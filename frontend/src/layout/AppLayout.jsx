import { Layout, Menu, Dropdown, Button, message, notification } from "antd";
import { UserOutlined, LogoutOutlined } from "@ant-design/icons";
import { useSelector, useDispatch } from "react-redux";
import { useLocation } from "react-router-dom";
import { logoutUser } from "../slice/authSlice";
import { authApi } from "../service/authApi";
import { menuConfig } from "./menuConfig";
import { buildMenuByRole } from "./menuBuilder";

const { Header, Content } = Layout;

export default function AppLayout({ children }) {
  const { user } = useSelector((state) => state.auth);
  const location = useLocation();
  const pathname = location.pathname;

  const menuItems = buildMenuByRole(menuConfig, user?.role);
  const dispatch = useDispatch();

  const handleLogout = () => {
    localStorage.clear();
    dispatch(logoutUser());
    dispatch(authApi.util.resetApiState());
    notification.success({
      message: "Logout Successful",
      description: "You have successfully logged out.",
    });
  };

  const userMenu = [
    {
      key: "profile",
      label: `Hello, ${user?.name}`,
      disabled: true,
    },
    {
      type: "divider",
    },
    {
      key: "logout",
      label: "Logout",
      style: { color: "red" },
      icon: <LogoutOutlined />,
      onClick: handleLogout,
    },
  ];

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Header style={{ display: "flex", justifyContent: "space-between" }}>
        <Menu
          theme="dark"
          mode="horizontal"
          items={menuItems}
          selectedKeys={[pathname]}
          style={{
            flex: 1,
            minWidth: 0,
          }}
        />

        <Dropdown menu={{ items: userMenu }}>
          <Button type="text" style={{ color: "white", marginTop: 16 }}>
            <UserOutlined /> Account
          </Button>
        </Dropdown>
      </Header>

      <Content style={{ padding: 24 }}>{children}</Content>
    </Layout>
  );
}

import { Link } from "react-router-dom";

export const buildMenuByRole = (menuConfig, role) => {
  return menuConfig
    .filter((item) => role && item.roles.includes(role))
    .map((item) => {
      if (item.children) {
        return {
          key: item.key,
          icon: item.icon,
          label: item.label,
          children: item.children.map((child) => ({
            key: child.key,
            label: <Link to={child.path}>{child.label}</Link>,
          })),
        };
      }

      return {
        key: item.key,
        icon: item.icon,
        label: <Link to={item.path}>{item.label}</Link>,
      };
    });
};
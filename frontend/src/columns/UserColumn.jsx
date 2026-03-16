import { Space, Button, Popconfirm } from "antd";
import { EditOutlined, EyeOutlined, DeleteOutlined } from "@ant-design/icons";

export const getUserColumns = ({
  type = "customer",
  handleEdit,
  handleViewDetails,
  handleDelete,
}) => {
  const isCustomer = type === "customer";

  return [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Phone",
      dataIndex: isCustomer ? "phonenumber" : "phone",
      key: "phone",
      render: (text) => text || "-",
    },

    ...(isCustomer
      ? [
          {
            title: "Status",
            dataIndex: "isActive",
            key: "isActive",
            render: (isActive) => (
              <span style={{ color: isActive ? "green" : "red" }}>
                {isActive ? "Active" : "Inactive"}
              </span>
            ),
          },
        ]
      : [
          {
            title: "Address",
            dataIndex: "address",
            key: "address",
            render: (text) => text || "-",
            ellipsis: true,
          },
        ]),

    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            size="small"
            onClick={() => handleEdit(record)}
            icon={<EditOutlined />}
          >
            Edit
          </Button>

          <Button
            size="small"
            onClick={() => handleViewDetails(record)}
            icon={<EyeOutlined />}
          >
            View
          </Button>

          <Popconfirm
            title={`Delete ${type === "customer" ? "Customer" : "Vendor"}`}
            description={`Are you sure you want to delete this ${type}?`}
            onConfirm={() => handleDelete(record._id)}
            okText="Yes"
            cancelText="No"
          >
            <Button danger size="small" icon={<DeleteOutlined />}>
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];
};
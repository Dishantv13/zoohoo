import { Tag, Flex, Space, Button, Popconfirm } from "antd";
import {
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  CreditCardOutlined,
  DollarCircleOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

export const getBillColumns = ({
  statusColors,
  currencyFormatter,
  navigate,
  setSelectedBill,
  setIsDrawerVisible,
  handleCardPaymentClick,
  handleCashPaymentClick,
  handleDelete,
  isDeleting,
}) => [
  {
    title: "Bill Number",
    dataIndex: "billNumber",
    key: "billNumber",
    render: (text) => (
      <Flex align="center" gap="small">
        <Tag color="red">{text}</Tag>
      </Flex>
    ),
  },

  {
    title: "Vendor",
    dataIndex: ["vendorId", "name"],
    key: "vendor",
    render: (name) => <Tag color="purple">{name || "Unknown"}</Tag>,
  },

  {
    title: "Email",
    dataIndex: ["vendorId", "email"],
    key: "email",
    render: (text) => (
      <Flex align="center" gap="small">
        <Tag color="blue">{text}</Tag>
      </Flex>
    ),
  },

  {
    title: "Bill Date",
    dataIndex: "billDate",
    key: "billDate",
    width: 100,
    render: (d) => {
      const date = dayjs(d).format("DD MMM YYYY");
      return (
        <Flex align="center" gap="small">
          <Tag color="cyan">{date}</Tag>
        </Flex>
      );
    },
  },

  {
    title: "Due Date",
    dataIndex: "dueDate",
    key: "dueDate",
    width: 100,
    render: (d, record) => {
      const date = dayjs(d).format("DD MMM YYYY");
      const isPastDue = dayjs(d).isBefore(dayjs().startOf("day"));
      const isUnpaid =
        record.status !== "PAID" && record.status !== "CANCELLED";

      return (
        <Flex vertical align="flex-start" gap="small">
          <Tag color="red">{date}</Tag>

          {isPastDue && isUnpaid && (
            <Tag color="volcano" icon={<WarningOutlined />}>
              Overdue
            </Tag>
          )}
        </Flex>
      );
    },
  },

  {
    title: "Items",
    dataIndex: "items",
    key: "items",
    render: (items) => items?.length || 0,
  },

  {
    title: "Quick Status",
    key: "quickStatus",
    render: (_, record) => (
      <Tag color={statusColors[record.status] || "default"}>
        {record.status}
      </Tag>
    ),
  },

  {
    title: "Amount",
    dataIndex: "totalAmount",
    key: "totalAmount",
    render: (amount) => (
      <Tag color="purple">{currencyFormatter.format(amount || 0)}</Tag>
    ),
  },

  {
    title: "Paid Amount",
    dataIndex: "amountPaid",
    render: (amount = 0) => (
      <Flex align="center" gap="small">
        <Tag color="cyan">₹{amount?.toFixed(2)}</Tag>
      </Flex>
    ),
  },

  {
    title: "Remaining Amount",
    dataIndex: "remainingAmount",
    render: (amount = 0) => {
      const color = amount === 0 ? "green" : amount > 0 ? "gold" : "default";

      return (
        <Flex align="center" gap="small">
          <Tag color={color}>₹{amount?.toFixed(2)}</Tag>
        </Flex>
      );
    },
  },

  {
    title: "Actions",
    key: "actions",
    fixed: "right",
    width: 300,
    render: (_, record) => {
      if (record.status === "PAID") {
        return (
          <Space wrap>
            <Tag color="green">✓ PAID</Tag>

            <Button
              icon={<EyeOutlined />}
              onClick={() => {
                setSelectedBill(record);
                setIsDrawerVisible(true);
              }}
              size="small"
            >
              View
            </Button>
          </Space>
        );
      }

      if (record.status === "PARTIALLY_PAID") {
        return (
          <Space wrap>
            <Button
              icon={<CreditCardOutlined />}
              type="primary"
              onClick={() => handleCardPaymentClick(record)}
              size="small"
            >
              Card Pay
            </Button>

            <Button
              icon={<DollarCircleOutlined />}
              onClick={() => handleCashPaymentClick(record)}
              size="small"
            >
              Cash
            </Button>

            <Button
              icon={<EyeOutlined />}
              onClick={() => {
                setSelectedBill(record);
                setIsDrawerVisible(true);
              }}
              size="small"
            >
              View
            </Button>
          </Space>
        );
      }

      return (
        <Space wrap>
          <Button
            icon={<EditOutlined />}
            onClick={() =>
              navigate("/admin/vendor/create-bill", {
                state: { bill: record },
              })
            }
            size="small"
          >
            Edit
          </Button>

          <Button
            icon={<CreditCardOutlined />}
            type="primary"
            onClick={() => handleCardPaymentClick(record)}
            size="small"
          >
            Card Pay
          </Button>

          <Button
            icon={<EyeOutlined />}
            onClick={() => {
              setSelectedBill(record);
              setIsDrawerVisible(true);
            }}
            size="small"
          >
            View
          </Button>

          <Button
            icon={<DollarCircleOutlined />}
            onClick={() => handleCashPaymentClick(record)}
            size="small"
          >
            Cash
          </Button>

          <Popconfirm
            title="Delete bill"
            description="Are you sure you want to delete this bill?"
            onConfirm={() => handleDelete(record._id)}
            okText="Yes"
            cancelText="No"
          >
            <Button
              danger
              icon={<DeleteOutlined />}
              loading={isDeleting}
              size="small"
            >
              Delete
            </Button>
          </Popconfirm>
        </Space>
      );
    },
  },
];

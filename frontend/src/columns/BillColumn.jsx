import { Tag, Flex, Space, Button, Popconfirm, Tooltip } from "antd";
import {
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  CreditCardOutlined,
  DollarCircleOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { ROUTE_PATHS } from "../enum/apiUrl";

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
    width: 200,
    render: (_, record) => {
      if (record.status === "PAID") {
        return (
          <Space wrap>
            <Tag color="green">✓ PAID</Tag>

            <Tooltip title="View bill details" color="blue">
              <Button
                icon={<EyeOutlined />}
                style={{ color: "blue" }}
                onClick={() => {
                  setSelectedBill(record);
                  setIsDrawerVisible(true);
                }}
                size="medium"
              ></Button>
            </Tooltip>
          </Space>
        );
      }

      if (record.status === "PARTIALLY_PAID") {
        return (
          <Space wrap>
            <Tooltip title="View bill details" color="blue">
              <Button
                icon={<EyeOutlined />}
                style={{ color: "blue" }}
                onClick={() => {
                  setSelectedBill(record);
                  setIsDrawerVisible(true);
                }}
                size="medium"
              ></Button>
            </Tooltip>
            <Tooltip title="Receive card or upi payment" color="blue">
              <Button
                icon={<CreditCardOutlined />}
                style={{ color: "green" }}
                onClick={() => handleCardPaymentClick(record)}
                size="medium"
              ></Button>
            </Tooltip>

            <Tooltip title="Receive cash payment" color="blue">
              <Button
                icon={<DollarCircleOutlined />}
                style={{ color: "green" }}
                onClick={() => handleCashPaymentClick(record)}
                size="medium"
              ></Button>
            </Tooltip>
          </Space>
        );
      }

      return (
        <Space wrap>
          <Tooltip title="view bill details" color="blue">
            <Button
              icon={<EyeOutlined />}
              style={{ color: "blue" }}
              onClick={() => {
                setSelectedBill(record);
                setIsDrawerVisible(true);
              }}
              size="medium"
            ></Button>
          </Tooltip>

          <Tooltip title="Edit bill" color="orange">
            <Button
              icon={<EditOutlined />}
              style={{ color: "orange" }}
              onClick={() =>
                navigate(ROUTE_PATHS.ADMIN_CREATE_BILL, {
                  state: { bill: record },
                })
              }
              size="medium"
            ></Button>
          </Tooltip>

          <Tooltip title="Receive card or upi payment" color="blue">
            <Button
              icon={<CreditCardOutlined />}
              style={{ color: "green" }}
              onClick={() => handleCardPaymentClick(record)}
              size="medium"
            ></Button>
          </Tooltip>

          <Tooltip title="Receive cash payment" color="blue">
            <Button
              icon={<DollarCircleOutlined />}
              style={{ color: "green" }}
              onClick={() => handleCashPaymentClick(record)}
              size="medium"
            ></Button>
          </Tooltip>

          <Popconfirm
            title="Delete bill"
            description="Are you sure you want to delete this bill?"
            onConfirm={() => handleDelete(record._id)}
            okText="Yes"
            cancelText="No"
          >
            <Tooltip title="Delete bill" color="red">
              <Button
                danger
                icon={<DeleteOutlined />}
                style={{ color: "red" }}
                loading={isDeleting}
                size="medium"
              ></Button>
            </Tooltip>
          </Popconfirm>
        </Space>
      );
    },
  },
];

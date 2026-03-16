import { Tag, Flex, Space, Button, Tooltip } from "antd";
import {
  EyeOutlined,
  FilePdfOutlined,
  EditOutlined,
  WarningOutlined,
  DollarOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

export const InvoiceColumns = ({
  handleViewDetails,
  handleEdit,
  handleCashPayment,
  handleDownload,
  downloadLoading,
  statusColors,
}) => [
  {
    title: "Invoice #",
    dataIndex: "invoiceNumber",
    key: "invoiceNumber",
    width: 100,
    render: (text) => (
      <Flex align="center" gap="small">
        <Tag color="red">{text}</Tag>
      </Flex>
    ),
  },

  {
    title: "Customer",
    dataIndex: ["customer", "name"],
    key: "customer",
    width: 100,
    render: (_, r) => {
      const isCreatedByCustomer = r.createdBy?._id === r.customer?._id;

      const creatorName = isCreatedByCustomer
        ? r.customer?.name
        : r.createdBy?.name;

      if (!creatorName) {
        return <Tag color="default">UNKNOWN</Tag>;
      }

      const tagColor = isCreatedByCustomer ? "pink" : "purple";

      return (
        <Flex align="center" gap="2px">
          <Tag color={tagColor}>{creatorName.toUpperCase()}</Tag>
        </Flex>
      );
    },
  },

  {
    title: "Email",
    dataIndex: ["customer", "email"],
    key: "email",
    width: 150,
    render: (text) => (
      <Flex align="center" gap="small">
        <Tag color="blue">{text}</Tag>
      </Flex>
    ),
  },

  {
    title: "Status",
    dataIndex: "status",
    key: "status",
    width: 120,
    render: (status) => (
      <Tag color={statusColors[status] || "default"}>{status}</Tag>
    ),
  },

  {
    title: "Invoice Date",
    dataIndex: "invoiceDate",
    key: "invoiceDate",
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
    title: "Subtotal",
    dataIndex: "subtotal",
    key: "subtotal",
    width: 150,
    render: (amount) => (
      <Tag color="blue">₹{amount?.toFixed(2)}</Tag>
    ),
  },

  {
    title: "Discount",
    dataIndex: "discount",
    key: "discount",
    width: 150,
    render: (amount) => (
      <Tag color="purple">₹{amount?.toFixed(2)}</Tag>
    ),
  },

  {
    title: "Amount after Discount",
    dataIndex: "amountAfterDiscount",
    key: "amountAfterDiscount",
    width: 150,
    render: (amount) => (
      <Tag color="geekblue">₹{amount?.toFixed(2)}</Tag>
    ),
  },

  {
    title: "Tax",
    dataIndex: "tax",
    key: "tax",
    width: 150,
    render: (amount) => (
      <Tag color="orange">₹{amount?.toFixed(2)}</Tag>
    ),
  },

  {
    title: "Total Amount",
    dataIndex: "totalAmount",
    key: "totalAmount",
    width: 150,
    render: (amount) => (
      <Tag color="green">₹{amount?.toFixed(2)}</Tag>
    ),
  },

  {
    title: "Amount Paid",
    dataIndex: "amountPaid",
    key: "amountPaid",
    width: 150,
    render: (amount = 0) => (
      <Tag color="cyan">₹{amount?.toFixed(2)}</Tag>
    ),
  },

  {
    title: "Remaining",
    dataIndex: "remainingAmount",
    key: "remainingAmount",
    width: 150,
    render: (amount = 0) => {
      const color = amount === 0 ? "green" : amount > 0 ? "gold" : "default";

      return <Tag color={color}>₹{amount?.toFixed(2)}</Tag>;
    },
  },

  {
    title: "Actions",
    key: "actions",
    fixed: "right",
    width: 250,

    render: (_, record) => {
      const isCreatedByAdmin =
        record.createdBy?._id !== record.customer?._id;

      const canReceiveCashPayment =
        record.status === "PENDING" || record.status === "PARTIALLY_PAID";

      if (record.status === "PAID") {
        return (
          <Space wrap>
            <Tag color="green">✓ PAID</Tag>

            <Button
              size="small"
              icon={<EyeOutlined />}
              onClick={() => handleViewDetails(record)}
            >
              View
            </Button>

            <Button
              size="small"
              icon={<FilePdfOutlined />}
              disabled={downloadLoading}
              onClick={() =>
                handleDownload(record._id, record.invoiceNumber)
              }
            >
              PDF
            </Button>
          </Space>
        );
      }

      return (
        <Space wrap>
          <Button
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetails(record)}
          >
            View
          </Button>

          {isCreatedByAdmin && record.status == "PENDING" && (
            <Button
              size="small"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            >
              Edit
            </Button>
          )}

          {canReceiveCashPayment && (
            <Button
              size="small"
              icon={<DollarOutlined />}
              onClick={() => handleCashPayment(record)}
            >
              Cash
            </Button>
          )}

          <Button
            size="small"
            icon={<FilePdfOutlined />}
            disabled={downloadLoading}
            onClick={() =>
              handleDownload(record._id, record.invoiceNumber)
            }
          >
            PDF
          </Button>
        </Space>
      );
    },
  },
];
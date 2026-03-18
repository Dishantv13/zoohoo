import { Tag, Flex, Space, Button, Popconfirm } from "antd";
import {
  WarningOutlined,
  EyeOutlined,
  DownloadOutlined,
  CreditCardOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

export const InvoiceListColumn = ({
  handleViewDetails,
  handleDownLoad,
  handlePaymentClick,
  handleEdit,
  handleDelete,
  downloadLoading,
  deleteLoading,
}) => [
  {
    title: "Invoice No",
    dataIndex: "invoiceNumber",
    width: 100,
    render: (val) => (
      <Flex align="center" gap="small">
        <Tag color="red">{val}</Tag>
      </Flex>
    ),
  },
  {
    title: "Created By",
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
        <Flex vertical gap="2px">
          <Tag color={tagColor}>{creatorName.toUpperCase()}</Tag>
        </Flex>
      );
    },
  },
  {
    title: "Date",
    dataIndex: "invoiceDate",
    width: 100,
    render: (d) => (
      <Flex align="center" gap="small">
        <Tag color="cyan">{dayjs(d).format("DD MMM YYYY")}</Tag>
      </Flex>
    ),
  },
  {
    title: "Due Date",
    dataIndex: "dueDate",
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
    title: "Status",
    dataIndex: "status",
    width: 100,
    render: (status) => {
      const statusColors = {
        PENDING: "orange",
        PARTIALLY_PAID: "gold",
        PAID: "green",
        CANCELLED: "red",
      };

      return (
        <Tag color={statusColors[status] || "default"}>
          {status || "PENDING"}
        </Tag>
      );
    },
  },
  {
    title: "Sub Total",
    dataIndex: "subtotal",
    width: 120,
    render: (v = 0) => (
      <Flex align="center" gap="small">
        <Tag color="blue">₹{Number(v).toFixed(2)}</Tag>
      </Flex>
    ),
  },
  {
    title: (
      <div style={{ lineHeight: "1.2", textAlign: "center" }}>
        Amount After <br /> Discount
      </div>
    ),
    dataIndex: "amountAfterDiscount",
    width: 120,
    render: (v = 0) => (
      <Flex align="center" gap="small">
        <Tag color="purple">₹{Number(v).toFixed(2)}</Tag>
      </Flex>
    ),
  },
  {
    title: "Tax ₹",
    dataIndex: "tax",
    width: 120,
    render: (v = 0) => (
      <Flex align="center" gap="small">
        <Tag color="orange">₹{Number(v).toFixed(2)}</Tag>
      </Flex>
    ),
  },
  {
    title: "Total Amount",
    dataIndex: "totalAmount",
    width: 120,
    render: (v = 0) => (
      <Flex align="center" gap="small">
        <Tag color="blue">₹{Number(v).toFixed(2)}</Tag>
      </Flex>
    ),
  },
  {
    title: "Amount Paid",
    dataIndex: "amountPaid",
    width: 120,
    render: (v = 0) => (
      <Flex align="center" gap="small">
        <Tag color="green">₹{Number(v).toFixed(2)}</Tag>
      </Flex>
    ),
  },
  {
    title: "Remaining",
    dataIndex: "remainingAmount",
    width: 120,
    render: (v = 0) => {
      const remaining = Number(v) || 0;
      const color =
        remaining === 0 ? "green" : remaining > 0 ? "orange" : "default";

      return (
        <Flex align="center" gap="small">
          <Tag color={color}>₹{remaining.toFixed(2)}</Tag>
        </Flex>
      );
    },
  },
  {
    title: "Action",
    width: 200,
    fixed: "right",
    render: (_, record) => {
      const isCreatedByAdmin = record.createdBy?._id !== record.customer?._id;

      if (record.status === "PAID") {
        return (
          <Space wrap>
            <Tag color="green">✓ PAID</Tag>

            <Button
              size="small"
              icon={<EyeOutlined />}
              onClick={() => handleViewDetails(record)}
            />

            <Button
              size="small"
              icon={<DownloadOutlined />}
              onClick={() => handleDownLoad(record._id)}
              disabled={downloadLoading}
            />
          </Space>
        );
      }

      if (isCreatedByAdmin || record.status === "PARTIALLY_PAID") {
        return (
          <Space wrap>
            <Button
              type="primary"
              size="small"
              icon={<CreditCardOutlined />}
              onClick={() => handlePaymentClick(record)}
            >
              Pay
            </Button>

            <Button
              size="small"
              icon={<EyeOutlined />}
              onClick={() => handleViewDetails(record)}
            />

            <Button
              size="small"
              icon={<DownloadOutlined />}
              onClick={() => handleDownLoad(record._id)}
              disabled={downloadLoading}
            />
          </Space>
        );
      }

      return (
        <Space wrap>
          <Button
            type="primary"
            size="small"
            icon={<CreditCardOutlined />}
            onClick={() => handlePaymentClick(record)}
          >
            Pay
          </Button>

          <Button
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetails(record)}
          />

          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          />

          <Button
            size="small"
            icon={<DownloadOutlined />}
            onClick={() => handleDownLoad(record._id)}
            disabled={downloadLoading}
          />

          <Popconfirm
            title="Delete this invoice?"
            disabled={deleteLoading}
            onConfirm={() => handleDelete(record._id)}
          >
            <Button danger size="small" icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      );
    },
  },
];
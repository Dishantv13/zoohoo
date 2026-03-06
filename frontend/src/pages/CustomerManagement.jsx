import "@ant-design/v5-patch-for-react-19";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Space,
  Card,
  notification,
  Switch,
  Popconfirm,
  Drawer,
  Empty,
  Select,
  Row,
  Col,
  Statistic,
  Divider,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  PhoneOutlined,
  MailOutlined,
  UserOutlined,
  SearchOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import {
  useGetCustomersQuery,
  useAdminCreateCustomerMutation,
  useAdminUpdateCustomerMutation,
  useAdminDeleteCustomerMutation,
} from "../features/customer/customerApi";

import { useGetCustomerInvoicesQuery } from "../features/invoice/invoiceApi";
import "./Dashboard.css";

const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
});

export default function CustomerManagement() {
  const { user } = useSelector((state) => state.auth);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [form] = Form.useForm();
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  if (!user || user.role !== "admin") {
    return (
      <Card>
        <Empty description="Admin access only. Please login as admin." />
      </Card>
    );
  }

  const { data, isLoading, error } = useGetCustomersQuery({
    page,
    limit: pageSize,
    search: searchTerm,
    status: statusFilter,
  });

  const customersList = data?.data?.customers || [];

  const paginationData = {
    current: data?.data?.pagination?.page || 1,
    pageSize: data?.data?.pagination?.limit || 10,
    total: data?.data?.pagination?.totalCustomers || 0,
  };

  const filterData = customersList.map((customer) => ({
    ...customer,
    id: customer._id,
  }));

  const handleTableChange = (paginationInfo) => {
    setPage(paginationInfo.current);
    setPageSize(paginationInfo.pageSize);
  };

  const [updateCustomer] = useAdminUpdateCustomerMutation();
  const [deleteCustomer] = useAdminDeleteCustomerMutation();
  const [createCustomer] = useAdminCreateCustomerMutation();
  const handleSubmit = async (values) => {
    try {
      if (isEditMode) {
        await updateCustomer({
          customerId: selectedCustomer._id,
          data: values,
        }).unwrap();

        notification.success({
          message: "Success",
          description: "Customer updated successfully",
        });
      } else {
        await createCustomer(values).unwrap();

        notification.success({
          message: "Success",
          description: "Customer created successfully",
        });
      }

      setIsModalVisible(false);
      form.resetFields();
      setSelectedCustomer(null);
      setIsEditMode(false);
    } catch (error) {
      notification.error({
        message: "Error",
        description: error?.data?.message || "Operation failed",
      });
    }
  };
  const handleDelete = async (customerId) => {
    try {
      await deleteCustomer(customerId).unwrap();

      notification.success({
        message: "Success",
        description: "Customer deleted successfully",
      });
    } catch (error) {
      notification.error({
        message: "Error",
        description: error?.data?.message || "Failed to delete customer",
      });
    }
  };

  const handleEdit = (record) => {
    setSelectedCustomer(record);
    setIsEditMode(true);
    form.setFieldsValue({
      name: record.name,
      phonenumber: record.phonenumber,
      email: record.email,
      isActive: record.isActive,
    });
    setIsModalVisible(true);
  };

  const handleCreateClick = () => {
    setIsEditMode(false);
    setSelectedCustomer(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleViewDetails = (record) => {
    setSelectedCustomer(record);
    setIsDrawerVisible(true);
  };

  const { data: invoiceData, isLoading: invoiceLoading } =
    useGetCustomerInvoicesQuery(
      { customerId: selectedCustomer?._id, page: 1, limit: 1 },
      { skip: !selectedCustomer?._id },
    );

  const customerSummary = invoiceData?.data?.summary || {};

  const formatCurrency = (value) =>
    currencyFormatter.format(Number(value) || 0);

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (text) => <span>{text}</span>,
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      render: (text) => <span>{text}</span>,
    },
    {
      title: "Phone",
      dataIndex: "phonenumber",
      key: "phonenumber",
      render: (text) => text || "-",
    },
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
            title="Delete Customer"
            description="Are you sure you want to delete this customer?"
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

  return (
    <div className="customer-management">
      <Card
        title="Customer Management"
        extra={
          <Space>
            <Input.Search
              placeholder="Search by customer name"
              prefix={<SearchOutlined />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onSearch={(value) => setSearchTerm(value)}
              allowClear
              style={{ width: 250 }}
            />
            <Select
              value={statusFilter}
              onChange={(value) => setStatusFilter(value)}
              style={{ width: 180 }}
            >
              <Select.Option value="all">All Customers</Select.Option>
              <Select.Option value="active">Active Customers</Select.Option>
              <Select.Option value="inactive">Inactive Customers</Select.Option>
            </Select>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleCreateClick}
            >
              Create New Customer
            </Button>
          </Space>
        }
      >
        <Table
          columns={columns}
          dataSource={filterData}
          loading={isLoading}
          rowKey="_id"
          onChange={handleTableChange}
          pagination={{
            current: paginationData.current,
            pageSize: paginationData.pageSize,
            total: paginationData.total,
            showQuickJumper: true,
            showSizeChanger: true,
            pageSizeOptions: [5, 10, 20, 50],
            showTotal: (total, range) =>
              `Showing ${range[0]}-${range[1]} of ${total} customers`,
            position: ["bottomRight"],
          }}
          scroll={{ x: true }}
        />
      </Card>

      <Modal
        title={isEditMode ? "Edit Customer" : "Create New Customer"}
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
          setIsEditMode(false);
          setSelectedCustomer(null);
        }}
        onOk={() => form.submit()}
      >
        <Form
          form={form}
          onFinish={handleSubmit}
          layout="vertical"
          autoComplete="off"
        >
          <Form.Item
            name="name"
            label="Customer Name"
            rules={[{ required: true, message: "Please enter customer name" }]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="Enter customer name"
            />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: "Please enter email" },
              { type: "email", message: "Invalid email format" },
            ]}
          >
            <Input
              prefix={<MailOutlined />}
              placeholder="Enter customer email"
              disabled={isEditMode}
            />
          </Form.Item>

          {!isEditMode && (
            <>
              <Form.Item
                name="password"
                label="Password"
                rules={[
                  { required: true, message: "Please enter password" },
                  { min: 6, message: "Password must be at least 6 characters" },
                ]}
              >
                <Input.Password placeholder="Enter password" />
              </Form.Item>
            </>
          )}

          <Form.Item
            name="phonenumber"
            label="Phone Number"
            rules={[{ required: false }]}
          >
            <Input
              prefix={<PhoneOutlined />}
              maxLength={10}
              onInput={(e) => {
                e.target.value = e.target.value.replace(/[^0-9]/g, "");
              }}
              placeholder="Enter phone number"
            />
          </Form.Item>

          {isEditMode && (
            <Form.Item
              name="isActive"
              label="Active Status"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>
          )}
        </Form>
      </Modal>

      <Drawer
        title="Customer Details"
        width={600}
        onClose={() => {
          setIsDrawerVisible(false);
        }}
        open={isDrawerVisible}
      >
        {selectedCustomer && (
          <div>
            <p>
              <strong>Name:</strong> {selectedCustomer.name}
            </p>
            <p>
              <strong>Email:</strong> {selectedCustomer.email}
            </p>
            <p>
              <strong>Phone:</strong> {selectedCustomer.phonenumber || "-"}
            </p>
            <p>
              <strong>Status:</strong>{" "}
              <span
                style={{
                  color: selectedCustomer.isActive ? "green" : "red",
                }}
              >
                {selectedCustomer.isActive ? "Active" : "Inactive"}
              </span>
            </p>
            <Divider />
            <Card
              title="Invoice Summary"
              size="medium"
              loading={invoiceLoading}
            >
              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <Statistic
                    title="Total Invoices"
                    value={customerSummary?.totalInvoices || 0}
                  />
                </Col>
                <Col span={12}>
                  <Statistic
                    title="Overdue Invoices"
                    value={customerSummary?.overdueCount || 0}
                  />
                </Col>
                <Col span={12}>
                  <Statistic
                    title="Total Amount"
                    value={customerSummary?.totalAmount || 0}
                    formatter={formatCurrency}
                  />
                </Col>
                <Col span={12}>
                  <Statistic
                    title="Paid Amount"
                    value={customerSummary?.paidAmount || 0}
                    formatter={formatCurrency}
                  />
                </Col>
                <Col span={12}>
                  <Statistic
                    title="Pending Amount"
                    value={customerSummary?.pendingAmount || 0}
                    formatter={formatCurrency}
                  />
                </Col>
              </Row>
            </Card>
          </div>
        )}
      </Drawer>
    </div>
  );
}

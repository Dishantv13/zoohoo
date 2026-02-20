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
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  PhoneOutlined,
  MailOutlined,
  UserOutlined,
  SearchOutlined,
  EyeOutlined
} from "@ant-design/icons";
import { authAPI } from "../service/authAPI";
import "./Dashboard.css";

export default function CustomerManagement() {
  const { user } = useSelector((state) => state.auth);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [form] = Form.useForm();
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalCustomers, setTotalCustomers] = useState(0);

  if (!user || user.role !== "admin") {
    return (
      <Card>
        <Empty description="Admin access only. Please login as admin." />
      </Card>
    );
  }

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const response = await authAPI.getCustomers({
        page: page,
        limit: pageSize,
        search: searchTerm,
        status: statusFilter,
      });

      const customersData = response.data?.customers || response.data || [];

      const filteredData = customersData.map((customer) => ({
        ...customer,
        id: customer._id,
      }));

      setTotalCustomers(response.data?.pagination?.totalCustomers || 0);
      setCustomers(filteredData);
    } catch (error) {
      console.error("Fetch customers error:", error);
      notification.error({
        message: "Error",
        description:
          error.response?.data?.message ||
          error.message ||
          "Failed to fetch customers",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTableChange = (paginationInfo) => {
    setPage(paginationInfo.current);
    setPageSize(paginationInfo.pageSize);
  };

  useEffect(() => {
    setPage(1);
  }, [searchTerm, statusFilter]);

  useEffect(() => {
    fetchCustomers();
  }, [page, pageSize, searchTerm, statusFilter]);

  const handleSubmit = async (values) => {
    try {
      if (isEditMode) {
        const response = await authAPI.updateCustomer(
          selectedCustomer.id,
          values,
        );
        const updatedCustomer = {
          ...response.data,
          id: response.data._id,
        };
        setCustomers(
          customers.map((c) =>
            c.id === selectedCustomer.id ? updatedCustomer : c,
          ),
        );
        notification.success({
          message: "Success",
          description: "Customer updated successfully",
        });
      } else {
        const response = await authAPI.createCustomer(values);
        const newCustomer = {
          ...response.data,
          id: response.data._id,
        };
        setCustomers([...customers, newCustomer]);
        notification.success({
          message: "Success",
          description: "Customer created successfully",
        });
      }
      setIsModalVisible(false);
      form.resetFields();
      setIsEditMode(false);
      setSelectedCustomer(null);
    } catch (error) {
      notification.error({
        message: "Error",
        description: error.response?.data?.message || "Operation failed",
      });
    }
  };

  const handleDelete = async (customerId) => {
    try {
      await authAPI.deleteCustomer(customerId);
      setCustomers(customers.filter((c) => c.id !== customerId));
      notification.success({
        message: "Success",
        description: "Customer deleted successfully",
      });
    } catch (error) {
      notification.error({
        message: "Error",
        description:
          error.response?.data?.message || "Failed to delete customer",
      });
    }
  };

  const handleEdit = (record) => {
    setSelectedCustomer(record);
    setIsEditMode(true);
    form.setFieldsValue({
      name: record.name,
      phonenumber: record.phonenumber,
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
            onConfirm={() => handleDelete(record.id)}
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
          dataSource={customers.map((c) => ({ ...c, key: c.id }))}
          loading={loading}
          onChange={handleTableChange}
          pagination={{
            current: page,
            pageSize: pageSize,
            total: totalCustomers,
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

          {!isEditMode && (
            <>
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
                />
              </Form.Item>

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
        onClose={() => setIsDrawerVisible(false)}
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
          </div>
        )}
      </Drawer>
    </div>
  );
}

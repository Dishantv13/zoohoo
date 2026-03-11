import "@ant-design/v5-patch-for-react-19";
import { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Space,
  Card,
  notification,
  Popconfirm,
  Drawer,
  Empty,
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
  HomeOutlined,
} from "@ant-design/icons";
import {
  useGetVendorsQuery,
  useCreateVendorMutation,
  useUpdateVendorMutation,
  useDeleteVendorMutation,
  useGetVendorStatsQuery,
} from "../service/vendorApi";
import "./Dashboard.css";

const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
});

export default function VendorManagement() {
  const { user } = useSelector((state) => state.auth);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [form] = Form.useForm();

  if (!user || user.role !== "admin") {
    return (
      <Card>
        <Empty description="Admin access only. Please login as admin." />
      </Card>
    );
  }

  const { data, isLoading } = useGetVendorsQuery({
    page,
    limit
});
  const [createVendor, { isLoading: isCreating }] = useCreateVendorMutation();
  const [updateVendor, { isLoading: isUpdating }] = useUpdateVendorMutation();
  const [deleteVendor] = useDeleteVendorMutation();

  const vendorsList = data?.data.vendors || [];
  const filteredVendors = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return vendorsList;

    return vendorsList.filter((vendor) => {
      return [vendor.name, vendor.email, vendor.phone, vendor.address]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(term));
    });
  }, [vendorsList, searchTerm]);

  const pagination = data?.data?.pagination || {};
  const paginationData = {
    current: pagination.page || 1,
    pageSize: pagination.limit || 10,
    total: pagination.totalVendors || 0,
  };

  const { data: statsData, isLoading: statsLoading } = useGetVendorStatsQuery(
    selectedVendor?._id,
    { skip: !selectedVendor?._id },
  );

  const vendorStats = statsData?.data?.statistics || {};

  const handleTableChange = (paginationInfo) => {
    setPage(paginationInfo.current);
    setLimit(paginationInfo.pageSize);
  };

  const handleSubmit = async (values) => {
    try {
      if (isEditMode && selectedVendor?._id) {
        await updateVendor({
          vendorId: selectedVendor._id,
          data: values,
        }).unwrap();

        notification.success({
          message: "Success",
          description: "Vendor updated successfully",
        });
      } else {
        await createVendor(values).unwrap();

        notification.success({
          message: "Success",
          description: "Vendor created successfully",
        });
      }

      setIsModalVisible(false);
      setIsEditMode(false);
      setSelectedVendor(null);
      form.resetFields();
    } catch (error) {
      notification.error({
        message: "Error",
        description: error?.data?.message || "Operation failed",
      });
    }
  };

  const handleDelete = async (vendorId) => {
    try {
      await deleteVendor(vendorId).unwrap();
      notification.success({
        message: "Success",
        description: "Vendor deleted successfully",
      });
    } catch (error) {
      notification.error({
        message: "Error",
        description: error?.data?.message || "Failed to delete vendor",
      });
    }
  };

  const handleEdit = (vendor) => {
    setSelectedVendor(vendor);
    setIsEditMode(true);
    setIsModalVisible(true);
    form.setFieldsValue({
      name: vendor.name,
      email: vendor.email,
      phone: vendor.phone,
      address: vendor.address,
    });
  };

  const handleCreateClick = () => {
    setSelectedVendor(null);
    setIsEditMode(false);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleViewDetails = (vendor) => {
    setSelectedVendor(vendor);
    setIsDrawerVisible(true);
  };

  const formatCurrency = (value) =>
    currencyFormatter.format(Number(value) || 0);

  const columns = [
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
      dataIndex: "phone",
      key: "phone",
      render: (text) => text || "-",
    },
    {
      title: "Address",
      dataIndex: "address",
      key: "address",
      render: (text) => text || "-",
      ellipsis: true,
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
            title="Delete Vendor"
            description="Are you sure you want to delete this vendor?"
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
        title="Vendor Management"
        extra={
          <Space>
            <Input.Search
              placeholder="Search by vendor details"
              prefix={<SearchOutlined />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onSearch={(value) => setSearchTerm(value)}
              allowClear
              style={{ width: 250 }}
            />
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleCreateClick}
            >
              Create New Vendor
            </Button>
          </Space>
        }
      >
        <Table
          columns={columns}
          dataSource={filteredVendors}
          onChange={handleTableChange}
          loading={isLoading}
          rowKey="_id"
          pagination={{
            current: paginationData.current,
            pageSize: paginationData.pageSize,
            total: paginationData.total,
            showQuickJumper: true,
            showSizeChanger: true,
            pageSizeOptions: [5, 10, 20, 50],
            showTotal: (total, range) =>
              `Showing ${range[0]}-${range[1]} of ${total} vendors`,
            position: ["bottomRight"],
          }}
          scroll={{ x: true }}
        />
      </Card>

      <Modal
        title={isEditMode ? "Edit Vendor" : "Create New Vendor"}
        open={isModalVisible}
        confirmLoading={isCreating || isUpdating}
        onCancel={() => {
          setIsModalVisible(false);
          setIsEditMode(false);
          setSelectedVendor(null);
          form.resetFields();
        }}
        onOk={() => form.submit()}
      >
        <Form form={form} onFinish={handleSubmit} layout="vertical" autoComplete="off">
          <Form.Item
            name="name"
            label="Vendor Name"
            rules={[{ required: true, message: "Please enter vendor name" }]}
          >
            <Input prefix={<UserOutlined />} placeholder="Enter vendor name" />
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
              placeholder="Enter vendor email"
              disabled={isEditMode}
            />
          </Form.Item>

          {!isEditMode && (
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
          )}

          <Form.Item name="phone" label="Phone Number">
            <Input
              prefix={<PhoneOutlined />}
              maxLength={10}
              onInput={(e) => {
                e.target.value = e.target.value.replace(/[^0-9]/g, "");
              }}
              placeholder="Enter phone number"
            />
          </Form.Item>

          <Form.Item name="address" label="Address">
            <Input prefix={<HomeOutlined />} placeholder="Enter vendor address" />
          </Form.Item>
        </Form>
      </Modal>

      <Drawer
        title="Vendor Details"
        width={600}
        onClose={() => {
          setIsDrawerVisible(false);
        }}
        open={isDrawerVisible}
      >
        {selectedVendor && (
          <div>
            <p>
              <strong>Name:</strong> {selectedVendor.name}
            </p>
            <p>
              <strong>Email:</strong> {selectedVendor.email}
            </p>
            <p>
              <strong>Phone:</strong> {selectedVendor.phone || "-"}
            </p>
            <p>
              <strong>Address:</strong> {selectedVendor.address || "-"}
            </p>
            <Divider />
            <Card title="Vendor Bill Summary" size="medium" loading={statsLoading}>
              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <Statistic title="Total Bills" value={vendorStats.count || 0} />
                </Col>
                <Col span={12}>
                  <Statistic
                    title="Total Amount"
                    value={vendorStats.totalAmount || 0}
                    formatter={formatCurrency}
                  />
                </Col>
                <Col span={12}>
                  <Statistic
                    title="Paid Amount"
                    value={vendorStats.paidAmount || 0}
                    formatter={formatCurrency}
                  />
                </Col>
                <Col span={12}>
                  <Statistic
                    title="Pending Amount"
                    value={vendorStats.pendingAmount || 0}
                    formatter={formatCurrency}
                  />
                </Col>
                <Col span={12}>
                  <Statistic
                    title="Partially Paid"
                    value={vendorStats.partiallyPaidAmount || 0}
                    formatter={formatCurrency}
                  />
                </Col>
                <Col span={12}>
                  <Statistic
                    title="Outstanding"
                    value={vendorStats.outstandingAmount || 0}
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

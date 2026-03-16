import { Card, Table, Space, Input, Select, Button } from "antd";
import { SearchOutlined, PlusOutlined } from "@ant-design/icons";

export default function PartyManagementCard({
  type = "customer",
  columns,
  dataSource,
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  handleCreateClick,
  handleTableChange,
  isLoading,
  paginationData,
}) {
  const isCustomer = type === "customer";

  const title = isCustomer ? "Customer Management" : "Vendor Management";
  const searchPlaceholder = isCustomer
    ? "Search by customer name"
    : "Search by vendor details";
  const createText = isCustomer
    ? "Create New Customer"
    : "Create New Vendor";

  return (
    <Card
      title={title}
      extra={
        <Space>
          <Input.Search
            placeholder={searchPlaceholder}
            prefix={<SearchOutlined />}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onSearch={(value) => setSearchTerm(value)}
            allowClear
            style={{ width: 250 }}
          />

          {isCustomer && (
            <Select
              value={statusFilter}
              onChange={(value) => setStatusFilter(value)}
              style={{ width: 180 }}
            >
              <Select.Option value="all">All Customers</Select.Option>
              <Select.Option value="active">Active Customers</Select.Option>
              <Select.Option value="inactive">Inactive Customers</Select.Option>
            </Select>
          )}

          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleCreateClick}
          >
            {createText}
          </Button>
        </Space>
      }
    >
      <Table
        columns={columns}
        dataSource={dataSource}
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
            `Showing ${range[0]}-${range[1]} of ${total} ${
              isCustomer ? "customers" : "vendors"
            }`,
          position: ["bottomRight"],
        }}
        scroll={{ x: true }}
      />
    </Card>
  );
}
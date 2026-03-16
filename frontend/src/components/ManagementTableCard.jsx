import { Card, Space, Select, Button, Table, Spin } from "antd";
import { SearchOutlined, DownloadOutlined } from "@ant-design/icons";

export default function ManagementTableCard({
  type = "invoice",
  list = [],
  selectedItem,
  setSelectedItem,
  statusFilter,
  setStatusFilter,
  setPage,
  navigate,
  handleExport,
  createPath,
  dataSource = [],
  isLoading,
  columns,
  handleTableChange,
  paginationData,
}) {
  const isInvoice = type === "invoice";

  const listLabel = isInvoice ? "Customer" : "Vendor";
  const title = isInvoice ? "Company Invoices" : "Vendor Bill Management";

  return (
    <Card
      title={title}
      extra={
        <Space wrap>
          {list?.length > 0 && (
            <Select
              placeholder={`Filter by ${listLabel}`}
              style={{ width: 220 }}
              prefix={<SearchOutlined />}
              allowClear
              showSearch
              value={selectedItem || undefined}
              onChange={(value) => {
                setPage?.(1);
                setSelectedItem?.(value || null);
              }}
              filterOption={(input, option) =>
                (option?.label ?? "")
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
              options={list.map((item) => ({
                label: `${item.name} (${item.email})`,
                value: item._id,
              }))}
            />
          )}

          <Select
            allowClear
            placeholder="Filter by status"
            style={{ width: 170 }}
            value={statusFilter || undefined}
            onChange={(value) => {
              setPage?.(1);
              setStatusFilter?.(value || null);
            }}
            options={[
              { label: "Pending", value: "PENDING" },
              { label: "Paid", value: "PAID" },
              { label: "Cancelled", value: "CANCELLED" },
              { label: "Partially Paid", value: "PARTIALLY_PAID" },
            ]}
          />

          {isInvoice && (
            <Button
              icon={<DownloadOutlined />}
              onClick={handleExport}
              disabled={dataSource.length === 0 || isLoading}
              style={{
                borderRadius: "5px",
                backgroundColor: "#52c41a",
                borderColor: "#52c41a",
                color: "white",
              }}
            >
              Export to Excel
            </Button>
          )}

          {!isInvoice && (
            <Button type="primary" onClick={() => navigate(createPath)}>
              Create Bill
            </Button>
          )}
        </Space>
      }
    >
      <Spin spinning={isLoading}>
        <Table
          rowKey="_id"
          columns={columns}
          dataSource={dataSource}
          loading={isLoading}
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
                isInvoice ? "invoices" : "bills"
              }`,
            position: ["bottomRight"],
          }}
          scroll={{ x: "max-content" }}
          size="large"
        />
      </Spin>
    </Card>
  );
}
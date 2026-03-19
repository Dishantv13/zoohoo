import { Drawer, Tag, Empty } from "antd";
import dayjs from "dayjs";

export default function DetailDrawer({
  type = "invoice",
  open,
  onClose,
  data,
  statusColors = {},
  currencyFormatter,
  paymentHistory = [],
}) {
  const isInvoice = type === "invoice";

  return (
    <Drawer
      title={isInvoice ? "Invoice Details" : "Bill Details"}
      width={650}
      open={open}
      onClose={onClose}
    >
      {" "}
      {!data ? (
        <Empty description="No data available" />
      ) : (
        <div className="invoice-details">
          <div className="detail-section">
            <h3>{isInvoice ? "Customer Details" : "Vendor Details"}</h3>

            <p>
              <strong>Name:</strong>{" "}
              {isInvoice ? data.customer?.name : data.vendorId?.name || "-"}
            </p>

            <p>
              <strong>Email:</strong>{" "}
              {isInvoice ? data.customer?.email : data.vendorId?.email || "-"}
            </p>

            <p>
              <strong>Phone:</strong>{" "}
              {isInvoice
                ? data.customer?.phonenumber || "N/A"
                : data.vendorId?.phone || "-"}
            </p>
          </div>

          <div className="detail-section">
            <h3>{isInvoice ? "Invoice Information" : "Bill Information"}</h3>

            {isInvoice && (
              <p>
                <strong>Invoice Number:</strong> {data.invoiceNumber}
              </p>
            )}

            <p>
              <strong>Status:</strong>{" "}
              {isInvoice ? (
                <Tag color={statusColors[data.status]}>{data.status}</Tag>
              ) : (
                data.status
              )}
            </p>

            <p>
              <strong>Date:</strong>{" "}
              {isInvoice
                ? new Date(data.invoiceDate).toLocaleDateString("en-IN")
                : dayjs(data.createdAt).format("DD MMM YYYY hh:mm A")}
            </p>

            {isInvoice && (
              <p>
                <strong>Due Date:</strong>{" "}
                {new Date(data.dueDate).toLocaleDateString("en-IN")}
              </p>
            )}
          </div>

          <div className="detail-section">
            <h3>Items</h3>

            <table className="items-table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Qty</th>
                  <th>Rate</th>
                  <th>Total</th>
                </tr>
              </thead>

              <tbody>
                {data.items?.map((item, index) => {
                  const quantity = Number(item?.quantity) || 0;
                  const rate = Number(item?.rate) || 0;

                  return (
                    <tr key={index}>
                      <td>
                        {isInvoice
                          ? item.name
                          : item?.itemId?.name || item?.itemId || "-"}
                      </td>

                      <td>{quantity}</td>

                      <td>
                        {currencyFormatter
                          ? currencyFormatter.format(rate)
                          : `₹${rate.toFixed(2)}`}
                      </td>

                      <td>
                        {currencyFormatter
                          ? currencyFormatter.format(quantity * rate)
                          : `₹${(quantity * rate).toFixed(2)}`}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {isInvoice && (
            <div className="detail-section">
              <h3>Amount Details</h3>

              <p>
                <strong>Subtotal:</strong> ₹{data.subtotal?.toFixed(2)}
              </p>

              <p>
                <strong>Discount:</strong> ₹{data.discount?.toFixed(2)} (
                {data.parseDiscount}%)
              </p>

              <p>
                <strong>Amount after Discount:</strong> ₹
                {data.amountAfterDiscount?.toFixed(2)}
              </p>

              <p>
                <strong>Tax:</strong> ₹{data.tax?.toFixed(2)} (
                {data.parseTaxRate}%)
              </p>

              <p style={{ fontWeight: "bold" }}>
                <strong>Total Amount:</strong> ₹{data.totalAmount?.toFixed(2)}
              </p>
            </div>
          )}

          {paymentHistory.length > 0 && (
            <div className="detail-section">
              <h3>Payment History</h3>

              {paymentHistory.map((payment, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: "10px",
                    marginBottom: "8px",
                    background: "#f0f2f5",
                    borderRadius: "4px",
                  }}
                >
                  <p>
                    <strong>Amount:</strong>{" "}
                    {currencyFormatter
                      ? currencyFormatter.format(payment.amount)
                      : `₹${payment.amount?.toFixed(2)}`}
                    <span style={{ marginLeft: "15px" }}>
                      <strong>Method:</strong> {payment.paymentMethod}
                    </span>
                  </p>

                  <p style={{ fontSize: "12px", color: "#666" }}>
                    <strong>Date:</strong>{" "}
                    {new Date(payment.paidAt).toLocaleString()}
                  </p>

                  <p style={{ fontSize: "12px", color: "#666" }}>
                    <strong>Transaction ID:</strong> {payment.transactionId}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </Drawer>
  );
}

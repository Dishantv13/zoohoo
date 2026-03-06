import { useState, useEffect } from "react";
import {
  Modal,
  Form,
  Input,
  Button,
  Spin,
  Result,
  Alert,
  Divider,
  Row,
  Col,
  Statistic,
  Space,
  Tag,
} from "antd";
import {
  DollarOutlined,
  CheckCircleOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import { useGetCashPaymentMutation } from "../features/payment/paymentApi";

const CashPaymentModal = ({ invoice, visible, onClose, onPaymentSuccess }) => {
  const [form] = Form.useForm();
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [getCashPayment, { loading: cashPaymentLoading }] = useGetCashPaymentMutation();

  useEffect(() => {
    if (invoice && visible) {
      const defaultAmount = invoice.remainingAmount || invoice.totalAmount;
      setPaymentAmount(defaultAmount);
      form.setFieldsValue({ paymentAmount: defaultAmount });
      setPaymentStatus(null);
    }
  }, [invoice, visible, form]);

  const handleCashPayment = async (values) => {
    try {
      const response = await getCashPayment({
        invoiceId: invoice._id,
        paymentAmount: Number(values.paymentAmount),
        customerId: invoice.customer?._id,
      }).unwrap();

      const responseData = response.data.data;
      
      setPaymentStatus({
        success: true,
        transactionId: responseData.transactionId,
        amountPaid: Number(responseData.amountPaid.toFixed(2)),
        remainingAmount: Number(responseData.remainingAmount.toFixed(2)),
        totalAmountPaid: Number(responseData.totalAmountPaid.toFixed(2)),
        totalAmount: Number(responseData.totalAmount.toFixed(2) || 0 ),
        invoiceStatus: responseData.invoiceStatus,
        message: response.data.message || "Cash payment recorded successfully",
      });

      setTimeout(() => {
        if (onPaymentSuccess) {
          onPaymentSuccess();
        }
        handleClose();
      }, 3000);
    } catch (error) {
      setPaymentStatus({
        success: false,
        message:
          error.response?.data?.message ||
          "Failed to record cash payment. Please try again.",
      });
    }
  };

  const handleClose = () => {
    form.resetFields();
    setPaymentStatus(null);
    setPaymentAmount(0);
    onClose();
  };

  const handlePaymentAmountChange = (e) => {
    const value = Number(e.target.value) || 0;
    setPaymentAmount(value);
  };

  if (!invoice) return null;

  const remainingAmount = Number(invoice.remainingAmount.toFixed(2)) || Number(invoice.totalAmount.toFixed(2)) || 0;
  const totalAmount = Number(invoice.totalAmount.toFixed(2)) || 0;
  const amountPaid = Number(invoice.amountPaid.toFixed(2)) || 0;
  const calculatedRemaining = paymentAmount > 0 ? Math.max(0, remainingAmount - paymentAmount) : remainingAmount;

  return (
    <Modal
      title={
        <Space>
          <DollarOutlined style={{ color: "#52c41a" }} />
          <span>Record Cash Payment - Invoice {invoice.invoiceNumber}</span>
        </Space>
      }
      open={visible}
      onCancel={handleClose}
      footer={null}
      width={650}
      centered
    >
      {paymentStatus ? (
        <Spin spinning={cashPaymentLoading} tip="Processing Payment...">
          <Result
            status={paymentStatus.success ? "success" : "error"}
            title={
              paymentStatus.success
                ? "Cash Payment Recorded!"
                : "Payment Failed"
            }
            subTitle={paymentStatus.message}
            extra={
              paymentStatus.success && (
                <div style={{ marginTop: 16, textAlign: "left" }}>
                  <Row gutter={[16, 16]}>
                    <Col span={12}>
                      <Statistic
                        title="Transaction ID"
                        value={paymentStatus.transactionId}
                        valueStyle={{ fontSize: "14px", color: "#1890ff" }}
                      />
                    </Col>
                    <Col span={12}>
                      <Statistic
                        title="Amount Received"
                        value={paymentStatus.amountPaid}
                        precision={2}
                        prefix="₹"
                        valueStyle={{ fontSize: "20px", color: "#52c41a" }}
                      />
                    </Col>
                    <Col span={12}>
                      <Statistic
                        title="Total Amount Paid"
                        value={paymentStatus.totalAmountPaid}
                        precision={2}
                        prefix="₹"
                        valueStyle={{ fontSize: "16px" }}
                      />
                    </Col>
                    <Col span={12}>
                      <Statistic
                        title="Remaining Balance"
                        value={paymentStatus.remainingAmount}
                        precision={2}
                        prefix="₹"
                        valueStyle={{
                          fontSize: "20px",
                          color: paymentStatus.remainingAmount > 0 ? "#ff9800" : "#52c41a",
                        }}
                      />
                    </Col>
                  </Row>
                  <Divider />
                  <div style={{ textAlign: "center" }}>
                    <Tag
                      color={
                        paymentStatus.invoiceStatus === "PAID"
                          ? "green"
                          : "gold"
                      }
                      style={{ fontSize: "16px", padding: "8px 16px" }}
                    >
                      {paymentStatus.invoiceStatus === "PAID"
                        ? "✓ Invoice Fully Paid"
                        : `Partially Paid - ₹${paymentStatus.remainingAmount.toFixed(2)} Remaining`}
                    </Tag>
                  </div>
                </div>
              )
            }
          />
        </Spin>
      ) : (
        <>
          <Alert
            message="Admin Only - Cash Payment Recording"
            description="Record cash payments received from customers. The system will automatically calculate and update the remaining balance."
            type="info"
            showIcon
            icon={<DollarOutlined />}
            style={{ marginBottom: 20 }}
          />

          <div
            style={{
              marginBottom: 20,
              padding: "16px",
              background: "#fafafa",
              borderRadius: "8px",
              border: "1px solid #e0e0e0",
            }}
          >
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <div style={{ marginBottom: 12 }}>
                  <span style={{ color: "#666", fontSize: "13px" }}>
                    Invoice Number
                  </span>
                  <div style={{ fontSize: "16px", fontWeight: "600" }}>
                    {invoice.invoiceNumber}
                  </div>
                </div>
              </Col>
              <Col span={12}>
                <div style={{ marginBottom: 12 }}>
                  <span style={{ color: "#666", fontSize: "13px" }}>
                    Customer Name
                  </span>
                  <div style={{ fontSize: "16px", fontWeight: "600" }}>
                    {invoice.customer?.name || "N/A"}
                  </div>
                </div>
              </Col>
              <Col span={8}>
                <Statistic
                  title="Total Amount"
                  value={totalAmount}
                  precision={2}
                  prefix="₹"
                  valueStyle={{ fontSize: "18px", color: "#1890ff" }}
                />
              </Col>
              <Col span={8}>
                <Statistic
                  title="Already Paid"
                  value={amountPaid}
                  precision={2}
                  prefix="₹"
                  valueStyle={{ fontSize: "18px", color: "#52c41a" }}
                />
              </Col>
              <Col span={8}>
                <Statistic
                  title="Remaining"
                  value={remainingAmount}
                  precision={2}
                  prefix="₹"
                  valueStyle={{ fontSize: "18px", color: "#ff9800", fontWeight: "bold" }}
                />
              </Col>
            </Row>
          </div>

          {remainingAmount === 0 ? (
            <Alert
              message="Invoice Already Fully Paid"
              description="This invoice has been fully paid. No additional payment can be recorded."
              type="success"
              showIcon
              icon={<CheckCircleOutlined />}
            />
          ) : (
            <>
              <Form
                form={form}
                layout="vertical"
                onFinish={handleCashPayment}
                style={{ marginTop: 16 }}
              >
                <Form.Item
                  label={
                    <span style={{ fontSize: "15px", fontWeight: "500" }}>
                      Cash Amount Received (₹)
                    </span>
                  }
                  name="paymentAmount"
                  rules={[
                    {
                      required: true,
                      message: "Please enter the cash amount received",
                    },
                    {
                      validator: (_, value) => {
                        const numValue = Number(value);
                        if (!value || isNaN(numValue)) {
                          return Promise.reject("Please enter a valid number");
                        }
                        if (numValue <= 0) {
                          return Promise.reject(
                            "Amount must be greater than 0"
                          );
                        }
                        if (numValue > remainingAmount) {
                          return Promise.reject(
                            `Amount cannot exceed remaining balance of ₹${remainingAmount.toFixed(2)}`
                          );
                        }
                        return Promise.resolve();
                      },
                    },
                  ]}
                >
                  <Input
                    type="number"
                    prefix="₹"
                    placeholder={`Enter cash amount (Max: ₹${remainingAmount.toFixed(2)})`}
                    onChange={handlePaymentAmountChange}
                    step="0.01"
                    size="large"
                    style={{ fontSize: "16px" }}
                  />
                </Form.Item>

                {paymentAmount > 0 && paymentAmount <= remainingAmount && (
                  <Alert
                    message={
                      <div>
                        <Row gutter={16}>
                          <Col span={12}>
                            <div>
                              <span style={{ fontSize: "13px", color: "#666" }}>
                                Payment Amount:
                              </span>
                              <div
                                style={{
                                  fontSize: "18px",
                                  fontWeight: "bold",
                                  color: "#52c41a",
                                }}
                              >
                                ₹{paymentAmount.toFixed(2)}
                              </div>
                            </div>
                          </Col>
                          <Col span={12}>
                            <div>
                              <span style={{ fontSize: "13px", color: "#666" }}>
                                Remaining After Payment:
                              </span>
                              <div
                                style={{
                                  fontSize: "18px",
                                  fontWeight: "bold",
                                  color: calculatedRemaining > 0 ? "#ff9800" : "#52c41a",
                                }}
                              >
                                ₹{calculatedRemaining.toFixed(2)}
                              </div>
                            </div>
                          </Col>
                        </Row>
                        {calculatedRemaining === 0 && (
                          <div style={{ marginTop: 8, textAlign: "center" }}>
                            <Tag color="success" style={{ fontSize: "14px", padding: "4px 12px" }}>
                              <CheckCircleOutlined /> Invoice will be marked as FULLY PAID
                            </Tag>
                          </div>
                        )}
                        {calculatedRemaining > 0 && (
                          <div style={{ marginTop: 8, textAlign: "center" }}>
                            <Tag color="warning" style={{ fontSize: "14px", padding: "4px 12px" }}>
                              <WarningOutlined /> Invoice will be marked as PARTIALLY PAID
                            </Tag>
                          </div>
                        )}
                      </div>
                    }
                    type={calculatedRemaining === 0 ? "success" : "warning"}
                    showIcon={false}
                    style={{ marginBottom: 20 }}
                  />
                )}

                <Form.Item style={{ marginTop: 24, marginBottom: 0 }}>
                  <Space style={{ width: "100%" }} direction="vertical" size="middle">
                    <Button
                      type="primary"
                      htmlType="submit"
                      loading={cashPaymentLoading}
                      block
                      size="large"
                      icon={<DollarOutlined />}
                      style={{
                        height: "48px",
                        fontSize: "16px",
                        fontWeight: "500",
                      }}
                    >
                      Record Cash Payment of ₹
                      {paymentAmount > 0 ? paymentAmount.toFixed(2) : "0.00"}
                    </Button>
                    <Button
                      block
                      size="large"
                      onClick={handleClose}
                      disabled={cashPaymentLoading}
                    >
                      Cancel
                    </Button>
                  </Space>
                </Form.Item>
              </Form>
            </>
          )}
        </>
      )}
    </Modal>
  );
};

export default CashPaymentModal;

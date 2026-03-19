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
import { useGetCashPaymentMutation } from "../../service/paymentApi";

const CashPaymentModal = ({
  data,
  type,
  visible,
  onClose,
  onPaymentSuccess,
}) => {
  const [form] = Form.useForm();
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState(0);

  const [getCashPayment, { isLoading: cashPaymentLoading }] =
    useGetCashPaymentMutation();

  const toAmount = (value) => Number(Number(value || 0).toFixed(2));

  const name = type === "invoice" ? data?.customer?.name : data?.vendorId?.name;

  const number = type === "invoice" ? data?.invoiceNumber : data?.billNumber;

  useEffect(() => {
    if (data && visible) {
      const defaultAmount = data.remainingAmount || data.totalAmount;

      setPaymentAmount(defaultAmount);
      form.setFieldsValue({ paymentAmount: defaultAmount });
      setPaymentStatus(null);
    }
  }, [data, visible, form]);

  const handleCashPayment = async (values) => {
    try {
      const payload =
        type === "invoice"
          ? {
              invoiceId: data._id,
              paymentAmount: Number(values.paymentAmount),
              customerId: data.customer?._id,
            }
          : {
              billId: data._id,
              paymentAmount: Number(values.paymentAmount),
              vendorId: data.vendorId?._id,
            };

      const response = await getCashPayment(payload).unwrap();

      const responseData = response?.data || {};

      setPaymentStatus({
        success: true,
        transactionId: responseData.transactionId,
        amountPaid: toAmount(responseData.amountPaid),
        remainingAmount: toAmount(responseData.remainingAmount),
        totalAmountPaid: toAmount(responseData.totalAmountPaid),
        totalAmount: toAmount(responseData.totalAmount),
        status:
          type === "invoice"
            ? responseData.invoiceStatus
            : responseData.billStatus,
        message: response?.message || "Cash payment recorded successfully",
      });

      setTimeout(() => {
        onPaymentSuccess?.();
        handleClose();
      }, 3000);
    } catch (error) {
      setPaymentStatus({
        success: false,
        message:
          error?.data?.message ||
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

  if (!data) return null;

  const remainingAmount = toAmount(data.remainingAmount ?? data.totalAmount);
  const totalAmount = toAmount(data.totalAmount);
  const amountPaid = toAmount(data.amountPaid);

  const calculatedRemaining =
    paymentAmount > 0
      ? Math.max(0, remainingAmount - paymentAmount)
      : remainingAmount;

  return (
    <Modal
      title={
        <Space>
          <DollarOutlined style={{ color: "#52c41a" }} />
          <span>
            Record Cash Payment - {type === "invoice" ? "Invoice" : "Bill"}{" "}
            {number}
          </span>
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
                          color:
                            paymentStatus.remainingAmount > 0
                              ? "#ff9800"
                              : "#52c41a",
                        }}
                      />
                    </Col>
                  </Row>

                  <Divider />

                  <div style={{ textAlign: "center" }}>
                    <Tag
                      color={paymentStatus.status === "PAID" ? "green" : "gold"}
                      style={{ fontSize: "16px", padding: "8px 16px" }}
                    >
                      {paymentStatus.status === "PAID"
                        ? "✓ Fully Paid"
                        : `Partially Paid - ₹${paymentStatus.remainingAmount.toFixed(
                            2,
                          )} Remaining`}
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
            description="Record cash payments. The system will automatically calculate and update the remaining balance."
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
                <div>
                  <span style={{ color: "#666", fontSize: "13px" }}>
                    {type === "invoice" ? "Invoice Number" : "Bill Number"}
                  </span>
                  <div style={{ fontSize: "16px", fontWeight: "600" }}>
                    {number}
                  </div>
                </div>
              </Col>

              <Col span={12}>
                <div>
                  <span style={{ color: "#666", fontSize: "13px" }}>
                    {type === "invoice" ? "Customer Name" : "Vendor Name"}
                  </span>
                  <div style={{ fontSize: "16px", fontWeight: "600" }}>
                    {name}
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
                  valueStyle={{
                    fontSize: "18px",
                    color: "#ff9800",
                    fontWeight: "bold",
                  }}
                />
              </Col>
            </Row>
          </div>

          {/* FORM */}

          <Form form={form} layout="vertical" onFinish={handleCashPayment}>
            <Form.Item
              label="Cash Amount Received (₹)"
              name="paymentAmount"
              rules={[
                { required: true, message: "Please enter the cash amount" },
              ]}
            >
              <Input
                type="number"
                prefix="₹"
                onChange={handlePaymentAmountChange}
                step="0.01"
                size="large"
                style={{ fontSize: "16px" }}
              />
            </Form.Item>

            {paymentAmount >= 0 && paymentAmount <= remainingAmount && (
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
                              color:
                                calculatedRemaining > 0 ? "#ff9800" : "#52c41a",
                            }}
                          >
                            ₹{calculatedRemaining.toFixed(2)}
                          </div>
                        </div>
                      </Col>
                    </Row>
                    {calculatedRemaining === 0 && (
                      <div style={{ marginTop: 8, textAlign: "center" }}>
                        <Tag
                          color="success"
                          style={{ fontSize: "14px", padding: "4px 12px" }}
                        >
                          <CheckCircleOutlined /> Invoice will be marked as
                          FULLY PAID
                        </Tag>
                      </div>
                    )}
                    {calculatedRemaining > 0 && (
                      <div style={{ marginTop: 8, textAlign: "center" }}>
                        <Tag
                          color="warning"
                          style={{ fontSize: "14px", padding: "4px 12px" }}
                        >
                          <WarningOutlined /> Invoice will be marked as
                          PARTIALLY PAID
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

            <Space style={{ width: "100%" }} direction="vertical">
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
                Record Cash Payment of ₹{paymentAmount.toFixed(2)}
              </Button>

              <Button block size="large" onClick={handleClose}>
                Cancel
              </Button>
            </Space>
          </Form>
        </>
      )}
    </Modal>
  );
};

export default CashPaymentModal;

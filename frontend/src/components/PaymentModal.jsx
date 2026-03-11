import { useState, useEffect } from "react";
import {
  Modal,
  Form,
  Input,
  Button,
  Tabs,
  Spin,
  Result,
  Space,
  Alert,
  Row,
  Col,
  Statistic,
  Divider,
  Tag,
} from "antd";
import {
  CreditCardOutlined,
  QrcodeOutlined,
  CheckCircleOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import QRCode from "qrcode";
import {
  useGetCardPaymentMutation,
  useGetUPIPaymentMutation,
} from "../service/paymentApi";

const UniversalPaymentModal = ({
  data,
  type = "invoice",
  visible,
  onClose,
  onPaymentSuccess,
}) => {
  const [form] = Form.useForm();
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [activeTab, setActiveTab] = useState("card");
  const [qrCodeImageUrl, setQrCodeImageUrl] = useState("");
  const [paymentAmount, setPaymentAmount] = useState(0);

  const [getCardPayment, { isLoading: isCardLoading }] =
    useGetCardPaymentMutation();

  const [getUPIPayment, { isLoading: isUPILoading }] =
    useGetUPIPaymentMutation();

  const loading = isCardLoading || isUPILoading;

  const toAmount = (v) => Number(Number(v || 0).toFixed(2));

  const name =
    type === "invoice" ? data?.customerId?.name : data?.vendorId?.name;
  const number = type === "invoice" ? data?.invoiceNumber : data?.billNumber;

  useEffect(() => {
    if (data) {
      const defaultAmount = data.remainingAmount || data.totalAmount;
      setPaymentAmount(defaultAmount);
      form.setFieldsValue({ paymentAmount: defaultAmount });
    }
  }, [data]);

  useEffect(() => {
    if (activeTab === "qr" && paymentAmount > 0) {
      const qrData = `upi://pay?pa=business@upi&pn=${type}&am=${paymentAmount}`;

      QRCode.toDataURL(qrData, { width: 220 })
        .then(setQrCodeImageUrl)
        .catch(console.error);
    }
  }, [activeTab, paymentAmount]);

  const handleCardPayment = async (values) => {
    try {
      const payload = {
        paymentAmount: Number(values.paymentAmount),
        cardNumber: values.cardNumber,
        cardHolder: values.cardHolder,
        expiryDate: values.expiryDate,
        cvv: values.cvv,
      };

      if (type === "invoice") payload.invoiceId = data._id;
      if (type === "bill") payload.billId = data._id;

      const res = await getCardPayment(payload).unwrap();

      const r = res?.data || {};

      setPaymentStatus({
        success: true,
        transactionId: r.transactionId,
        amountPaid: toAmount(r.amountPaid),
        remainingAmount: toAmount(r.remainingAmount),
        totalAmountPaid: toAmount(r.totalAmountPaid),
        message: res.message,
      });

      setTimeout(() => {
        onPaymentSuccess();
        handleClose();
      }, 2000);
    } catch (error) {
      setPaymentStatus({
        success: false,
        message: error?.data?.message || "Payment Failed",
      });
    }
  };

  const handleQRPayment = async () => {
    try {
      const payload = {
        qrData: `QR-${Date.now()}`,
        paymentAmount,
      };

      if (type === "invoice") payload.invoiceId = data._id;
      if (type === "bill") payload.billId = data._id;

      const res = await getUPIPayment(payload).unwrap();
      const r = res?.data || {};

      setPaymentStatus({
        success: true,
        transactionId: r.transactionId,
        amountPaid: toAmount(r.amountPaid),
        remainingAmount: toAmount(r.remainingAmount),
        totalAmountPaid: toAmount(r.totalAmountPaid),
        message: res.message,
      });

      setTimeout(() => {
        onPaymentSuccess();
        handleClose();
      }, 2000);
    } catch (error) {
      setPaymentStatus({
        success: false,
        message: error?.data?.message || "UPI Payment Failed",
      });
    }
  };

  const handleClose = () => {
    form.resetFields();
    setPaymentStatus(null);
    setPaymentAmount(0);
    setActiveTab("card");
    onClose();
  };

  const handleAmountChange = (e) => {
    setPaymentAmount(Number(e.target.value) || 0);
  };

  if (!data) return null;

  const remainingAmount = data.remainingAmount || data.totalAmount;
  const totalAmount = data.totalAmount;
  const amountPaid = data.amountPaid || 0;

  const calculatedRemaining =
    paymentAmount > 0
      ? Math.max(0, remainingAmount - paymentAmount)
      : remainingAmount;

  return (
    <Modal
      title={`${type === "invoice" ? "Invoice" : "Bill"} Payment`}
      open={visible}
      footer={null}
      width={600}
      centered
      onCancel={handleClose}
    >
      {paymentStatus ? (
        <Result
          status={paymentStatus.success ? "success" : "error"}
          title={
            paymentStatus.success ? "Payment Successful" : "Payment Failed"
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
      ) : (
        <>
          {/* Summary */}
          <div
            style={{
              background: "#f5f7fa",
              padding: 14,
              borderRadius: 6,
              marginBottom: 18,
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

          <Alert
            message="You can pay partial or full amount"
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
          />

          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            items={[
              {
                key: "card",
                label: (
                  <>
                    <CreditCardOutlined /> Card Payment
                  </>
                ),
                children: (
                  <Form
                    layout="vertical"
                    form={form}
                    onFinish={handleCardPayment}
                  >
                    <Form.Item
                      name="paymentAmount"
                      label="Amount"
                      rules={[
                        {
                          required: true,
                          message: "Please enter payment amount",
                        },
                        {
                          validator: (_, value) => {
                            if (value <= 0) {
                              return Promise.reject(
                                "Amount must be greater than 0",
                              );
                            }
                            if (value > remainingAmount) {
                              return Promise.reject(
                                `Amount cannot exceed remaining balance of ₹${Number(remainingAmount).toFixed(2)}`,
                              );
                            }
                            return Promise.resolve();
                          },
                        },
                      ]}
                    >
                      <Input
                        prefix="₹"
                        type="number"
                        onChange={handleAmountChange}
                      />
                    </Form.Item>

                    <Form.Item
                      name="cardHolder"
                      label="Card Holder"
                      rules={[{ required: true }]}
                    >
                      <Input />
                    </Form.Item>

                    <Form.Item
                      name="cardNumber"
                      label="Card Number"
                      rules={[{ required: true }]}
                    >
                      <Input maxLength={16} />
                    </Form.Item>

                    <Space style={{ width: "100%" }}>
                      <Form.Item
                        name="expiryDate"
                        label="Expiry"
                        rules={[{ required: true }]}
                        style={{ flex: 1 }}
                      >
                        <Input placeholder="MM/YY" />
                      </Form.Item>

                      <Form.Item
                        name="cvv"
                        label="CVV"
                        rules={[{ required: true }]}
                        style={{ flex: 1 }}
                      >
                        <Input type="password" maxLength={3} />
                      </Form.Item>
                    </Space>

                    {paymentAmount >= 0 && paymentAmount <= remainingAmount && (
                      <Alert
                        message={
                          <div>
                            <Row gutter={16}>
                              <Col span={12}>
                                <div>
                                  <span
                                    style={{ fontSize: "13px", color: "#666" }}
                                  >
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
                                  <span
                                    style={{ fontSize: "13px", color: "#666" }}
                                  >
                                    Remaining After Payment:
                                  </span>
                                  <div
                                    style={{
                                      fontSize: "18px",
                                      fontWeight: "bold",
                                      color:
                                        calculatedRemaining > 0
                                          ? "#ff9800"
                                          : "#52c41a",
                                    }}
                                  >
                                    ₹{calculatedRemaining.toFixed(2)}
                                  </div>
                                </div>
                              </Col>
                            </Row>
                            {calculatedRemaining === 0 && (
                              <div
                                style={{ marginTop: 8, textAlign: "center" }}
                              >
                                <Tag
                                  color="success"
                                  style={{
                                    fontSize: "14px",
                                    padding: "4px 12px",
                                  }}
                                >
                                  <CheckCircleOutlined />
                                  {type === "invoice" ? "Invoice" : "Bill"} will
                                  be marked as FULLY PAID
                                </Tag>
                              </div>
                            )}
                            {calculatedRemaining > 0 && (
                              <div
                                style={{ marginTop: 8, textAlign: "center" }}
                              >
                                <Tag
                                  color="warning"
                                  style={{
                                    fontSize: "14px",
                                    padding: "4px 12px",
                                  }}
                                >
                                  <WarningOutlined />{" "}
                                  {type === "invoice" ? "Invoice" : "Bill"} will
                                  be marked as PARTIALLY PAID
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

                    <Button
                      type="primary"
                      htmlType="submit"
                      block
                      size="large"
                      loading={loading}
                    >
                      Pay ₹{paymentAmount}
                    </Button>
                  </Form>
                ),
              },

              {
                key: "qr",
                label: (
                  <>
                    <QrcodeOutlined /> UPI Payment
                  </>
                ),
                children: (
                  <div style={{ textAlign: "center" }}>
                    <Input
                      prefix="₹"
                      type="number"
                      value={paymentAmount}
                      onChange={handleAmountChange}
                      style={{ marginBottom: 20 }}
                      max={remainingAmount}
                    />

                    {qrCodeImageUrl && (
                      <img
                        src={qrCodeImageUrl}
                        alt="qr"
                        style={{ width: 220 }}
                      />
                    )}

                    <p style={{ marginTop: 10 }}>
                      Scan using Google Pay / PhonePe / Paytm
                    </p>

                    {paymentAmount >= 0 && paymentAmount <= remainingAmount && (
                      <Alert
                        message={
                          <div>
                            <Row gutter={16}>
                              <Col span={12}>
                                <div>
                                  <span
                                    style={{ fontSize: "13px", color: "#666" }}
                                  >
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
                                  <span
                                    style={{ fontSize: "13px", color: "#666" }}
                                  >
                                    Remaining After Payment:
                                  </span>
                                  <div
                                    style={{
                                      fontSize: "18px",
                                      fontWeight: "bold",
                                      color:
                                        calculatedRemaining > 0
                                          ? "#ff9800"
                                          : "#52c41a",
                                    }}
                                  >
                                    ₹{calculatedRemaining.toFixed(2)}
                                  </div>
                                </div>
                              </Col>
                            </Row>
                            {calculatedRemaining === 0 && (
                              <div
                                style={{ marginTop: 8, textAlign: "center" }}
                              >
                                <Tag
                                  color="success"
                                  style={{
                                    fontSize: "14px",
                                    padding: "4px 12px",
                                  }}
                                >
                                  <CheckCircleOutlined />{" "}
                                  {type === "invoice" ? "Invoice" : "Bill"} will
                                  be marked as FULLY PAID
                                </Tag>
                              </div>
                            )}
                            {calculatedRemaining > 0 && (
                              <div
                                style={{ marginTop: 8, textAlign: "center" }}
                              >
                                <Tag
                                  color="warning"
                                  style={{
                                    fontSize: "14px",
                                    padding: "4px 12px",
                                  }}
                                >
                                  <WarningOutlined />{" "}
                                  {type === "invoice" ? "Invoice" : "Bill"} will
                                  be marked as PARTIALLY PAID
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

                    <Button
                      type="primary"
                      size="large"
                      block
                      loading={loading}
                      onClick={handleQRPayment}
                    >
                      Payment Completed
                    </Button>
                  </div>
                ),
              },
            ]}
          />
        </>
      )}
    </Modal>
  );
};

export default UniversalPaymentModal;

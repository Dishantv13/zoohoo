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
  DatePicker,
} from "antd";
import { CreditCardOutlined, QrcodeOutlined } from "@ant-design/icons";
import QRCode from "qrcode";
import { apiService } from "../service/apiService";

const PaymentModal = ({ invoice, visible, onClose, onPaymentSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [activeTab, setActiveTab] = useState("card");
  const [qrCodeImageUrl, setQrCodeImageUrl] = useState("");
  const [paymentAmount, setPaymentAmount] = useState(0);

  useEffect(() => {
    if (invoice) {
      const defaultAmount = invoice.remainingAmount || invoice.totalAmount;
      setPaymentAmount(defaultAmount);
      form.setFieldsValue({ paymentAmount: defaultAmount });
    }
  }, [invoice, form]);

  useEffect(() => {
    if (activeTab === "qr" && invoice && paymentAmount > 0) {
      const qrData = `upi://pay?pa=business@upi&pn=${invoice.invoiceNumber}&tn=Invoice&am=${paymentAmount}`;

      QRCode.toDataURL(qrData, {
        errorCorrectionLevel: "H",
        type: "image/png",
        width: 200,
        margin: 1,
        color: {
          dark: "#000000",
          light: "#ffffff",
        },
      })
        .then((url) => {
          setQrCodeImageUrl(url);
        })
        .catch((err) => {
          console.error("Error generating QR code:", err);
        });
    }
  }, [activeTab, invoice, paymentAmount]);

  const handleCardPayment = async (values) => {
    setLoading(true);
    try {
      const response = await apiService.cardPayment({
        invoiceId: invoice._id,
        cardNumber: values.cardNumber,
        cardHolder: values.cardHolder,
        expiryDate: values.expiryDate,
        cvv: values.cvv,
        paymentAmount: values.paymentAmount,
      });

      const responseData = response.data.data;

      setPaymentStatus({
        success: true,
        transactionId: responseData.transactionId,
        amountPaid: Number(responseData.amountPaid.toFixed(2)) || 0,
        remainingAmount: Number(responseData.remainingAmount.toFixed(2)) || 0,
        message: response.data.message || "Payment successful",
      });

      setTimeout(() => {
        onPaymentSuccess();
        handleClose();
      }, 2000);
    } catch (error) {
      setPaymentStatus({
        success: false,
        message:
          error.response?.data?.message || "Payment failed. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleQRPayment = async () => {
    setLoading(true);
    try {
      const response = await apiService.qrPayment({
        invoiceId: invoice._id,
        qrData: `QR-PAYMENT-${Date.now()}`,
        paymentAmount: paymentAmount,
      });

      const responseData = response.data.data;

      setPaymentStatus({
        success: true,
        transactionId: responseData.transactionId,
        amountPaid: Number(responseData.amountPaid.toFixed(2)) || 0,
        remainingAmount: Number(responseData.remainingAmount.toFixed(2)) || 0,
        message: response.data.message || "Payment successful",
      });

      setTimeout(() => {
        onPaymentSuccess();
        handleClose();
      }, 2000);
    } catch (error) {
      setPaymentStatus({
        success: false,
        message:
          error.response?.data?.message ||
          "QR payment failed. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    form.resetFields();
    setPaymentStatus(null);
    setActiveTab("card");
    setPaymentAmount(0);
    onClose();
  };

  const handlePaymentAmountChange = (e) => {
    const value = Number(e.target.value) || 0;
    setPaymentAmount(value);
  };

  if (!invoice) return null;

  const remainingAmount = invoice.remainingAmount || invoice.totalAmount;
  const totalAmount = invoice.totalAmount;
  const amountPaid = invoice.amountPaid || 0;

  return (
    <Modal
      title={`Payment for Invoice ${invoice.invoiceNumber}`}
      open={visible}
      onCancel={handleClose}
      footer={null}
      width={600}
      centered
    >
      {paymentStatus ? (
        <Spin spinning={loading}>
          <Result
            status={paymentStatus.success ? "success" : "error"}
            title={
              paymentStatus.success ? "Payment Successful!" : "Payment Failed"
            }
            subTitle={paymentStatus.message}
            extra={
              paymentStatus.success && (
                <div style={{ marginTop: 16 }}>
                  <p>
                    <strong>Transaction ID:</strong>{" "}
                    {paymentStatus.transactionId}
                  </p>
                  <p>
                    <strong>Amount Paid:</strong> ₹
                    {paymentStatus.amountPaid?.toFixed(2)}
                  </p>
                  {paymentStatus.remainingAmount > 0 && (
                    <p style={{ color: "#ff9800" }}>
                      <strong>Remaining Amount:</strong> ₹
                      {paymentStatus.remainingAmount?.toFixed(2)}
                    </p>
                  )}
                  {paymentStatus.remainingAmount === 0 && (
                    <p style={{ color: "#52c41a", fontWeight: "bold" }}>
                      Invoice Fully Paid!
                    </p>
                  )}
                </div>
              )
            }
          />
        </Spin>
      ) : (
        <>
          <div
            style={{
              marginBottom: 16,
              padding: "12px",
              background: "#f0f2f5",
              borderRadius: "4px",
            }}
          >
            <p style={{ marginBottom: 8 }}>
              <strong>Invoice Number:</strong> {invoice.invoiceNumber}
            </p>
            <p style={{ marginBottom: 8 }}>
              <strong>Total Amount:</strong> ₹{totalAmount.toFixed(2)}
            </p>
            {amountPaid > 0 && (
              <>
                <p style={{ marginBottom: 8 }}>
                  <strong>Amount Already Paid:</strong>{" "}
                  <span style={{ color: "#52c41a" }}>
                    ₹{amountPaid.toFixed(2)}
                  </span>
                </p>
                <p style={{ marginBottom: 8 }}>
                  <strong>Remaining Amount:</strong>{" "}
                  <span
                    style={{
                      color: "#ff9800",
                      fontSize: "18px",
                      fontWeight: "bold",
                    }}
                  >
                    ₹{remainingAmount.toFixed(2)}
                  </span>
                </p>
              </>
            )}
            {amountPaid === 0 && (
              <p style={{ marginBottom: 8 }}>
                <strong>Amount to Pay:</strong>{" "}
                <span
                  style={{
                    color: "#52c41a",
                    fontSize: "18px",
                    fontWeight: "bold",
                  }}
                >
                  ₹{remainingAmount.toFixed(2)}
                </span>
              </p>
            )}
            <p style={{ marginBottom: 0 }}>
              <strong>Status:</strong> {invoice.status}
            </p>
          </div>

          <Alert
            message="You can pay any amount up to the remaining balance"
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
                  <span>
                    <CreditCardOutlined /> Card Payment
                  </span>
                ),
                children: (
                  <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleCardPayment}
                    style={{ marginTop: 16 }}
                  >
                    <Form.Item
                      label="Payment Amount"
                      name="paymentAmount"
                      rules={[
                        {
                          required: true,
                          message: "Please enter payment amount",
                        },
                        {
                          validator: (_, value) => {
                            if (value <= 0) {
                              return Promise.reject(
                                "Amount must be greater than 0"
                              );
                            }
                            if (value > remainingAmount) {
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
                        placeholder={`Enter amount (Max: ${remainingAmount.toFixed(2)})`}
                        onChange={handlePaymentAmountChange}
                        step="0.01"
                      />
                    </Form.Item>

                    <Form.Item
                      label="Cardholder Name"
                      name="cardHolder"
                      rules={[
                        {
                          required: true,
                          message: "Please enter cardholder name",
                        },
                      ]}
                    >
                      <Input placeholder="John Doe" />
                    </Form.Item>

                    <Form.Item
                      label="Card Number"
                      name="cardNumber"
                      rules={[
                        { required: true, message: "Please enter card number" },
                        { len: 16, message: "Card number must be 16 digits" },
                      ]}
                    >
                      <Input placeholder="1234 5678 9012 3456" maxLength={16} />
                    </Form.Item>

                    <Space style={{ width: "100%" }} size="large">
                      <Form.Item
                        label="Expiry Date"
                        name="expiryDate"
                        rules={[
                          { required: true, message: "Required" },
                          {
                            pattern: /^(0[1-9]|1[0-2])\/\d{2}$/,
                            message: "Format: MM/YY",
                          },
                        ]}
                        style={{ flex: 1 }}
                      >
                        <Input placeholder="MM/YY" maxLength={5} />
                      </Form.Item>

                      <Form.Item
                        label="CVV"
                        name="cvv"
                        rules={[
                          { required: true, message: "Required" },
                          { len: 3, message: "CVV must be 3 digits" },
                        ]}
                        style={{ flex: 1 }}
                      >
                        <Input
                          placeholder="123"
                          maxLength={3}
                          type="password"
                        />
                      </Form.Item>
                    </Space>

                    <Form.Item style={{ marginTop: 24 }}>
                      <Button
                        type="primary"
                        htmlType="submit"
                        loading={loading}
                        block
                        size="large"
                      >
                        Pay ₹{paymentAmount > 0 ? paymentAmount.toFixed(2) : "0.00"}
                      </Button>
                    </Form.Item>
                  </Form>
                ),
              },
              {
                key: "qr",
                label: (
                  <span>
                    <QrcodeOutlined /> QR Code Payment
                  </span>
                ),
                children: (
                  <div
                    style={{
                      marginTop: 24,
                      textAlign: "center",
                      padding: "20px 0",
                    }}
                  >
                    <Form.Item
                      label="Payment Amount"
                      style={{ textAlign: "left", marginBottom: 20 }}
                    >
                      <Input
                        type="number"
                        prefix="₹"
                        placeholder={`Enter amount (Max: ${remainingAmount.toFixed(2)})`}
                        value={paymentAmount}
                        onChange={handlePaymentAmountChange}
                        step="0.01"
                        max={remainingAmount}
                      />
                    </Form.Item>

                    <h4>UPI Payment QR Code</h4>
                    {qrCodeImageUrl && (
                      <div
                        style={{
                          padding: "15px",
                          background: "#fff",
                          borderRadius: "6px",
                          display: "inline-block",
                          border: "2px solid #1890ff",
                          marginBottom: "20px",
                        }}
                      >
                        <img
                          src={qrCodeImageUrl}
                          alt="UPI QR Code"
                          style={{ display: "block", borderRadius: "4px" }}
                        />
                      </div>
                    )}

                    <div style={{ marginBottom: 20 }}>
                      <h3 style={{ fontSize: "18px", marginBottom: "5px" }}>
                        ₹{paymentAmount.toFixed(2)}
                      </h3>
                      <p
                        style={{
                          color: "#666",
                          margin: "5px 0",
                          fontSize: "14px",
                        }}
                      >
                        Invoice: {invoice.invoiceNumber}
                      </p>
                      <p style={{ color: "#999", fontSize: "12px" }}>
                        Scan using Google Pay, PhonePe, or any UPI app
                      </p>
                    </div>

                    <Button
                      type="primary"
                      size="large"
                      loading={loading}
                      block
                      onClick={handleQRPayment}
                      disabled={paymentAmount <= 0 || paymentAmount > remainingAmount}
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

export default PaymentModal;

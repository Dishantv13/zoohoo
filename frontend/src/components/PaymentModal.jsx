import { useState, useEffect } from 'react';
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
} from 'antd';
import { CreditCardOutlined, QrcodeOutlined } from '@ant-design/icons';
import QRCode from 'qrcode';
import api from '../service/api';

const PaymentModal = ({ invoice, visible, onClose, onPaymentSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [activeTab, setActiveTab] = useState('card');
  const [qrCodeImageUrl, setQrCodeImageUrl] = useState('');


  useEffect(() => {
    if (activeTab === 'qr' && invoice) {
      const qrData = `upi://pay?pa=business@upi&pn=${invoice.invoiceNumber}&tn=Invoice&am=${invoice.totalAmount}`;
      
      QRCode.toDataURL(qrData, {
        errorCorrectionLevel: 'H',
        type: 'image/png',
        width: 200,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#ffffff',
        },
      })
      .then(url => {
        setQrCodeImageUrl(url);
      })
      .catch(err => {
        console.error('Error generating QR code:', err);
      });
    }
  }, [activeTab, invoice]);

  const handleCardPayment = async (values) => {
    setLoading(true);
    try {
      const response = await api.post('/payments/card', {
        invoiceId: invoice._id,
        cardNumber: values.cardNumber,
        cardHolder: values.cardHolder,
        expiryDate: values.expiryDate,
        cvv: values.cvv,
      });

      setPaymentStatus({
        success: true,
        transactionId: response.data.transactionId,
        message: response.data.message,
      });

      setTimeout(() => {
        onPaymentSuccess();
        handleClose();
      }, 2000);
    } catch (error) {
      setPaymentStatus({
        success: false,
        message: error.response?.data?.message || 'Payment failed. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleQRPayment = async () => {
    setLoading(true);
    try {
      const response = await api.post('/payments/qr', {
        invoiceId: invoice._id,
        qrData: `QR-PAYMENT-${Date.now()}`,
      });

      setPaymentStatus({
        success: true,
        transactionId: response.data.transactionId,
        message: response.data.message,
      });

      setTimeout(() => {
        onPaymentSuccess();
        handleClose();
      }, 2000);
    } catch (error) {
      setPaymentStatus({
        success: false,
        message: error.response?.data?.message || 'QR payment failed. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    form.resetFields();
    setPaymentStatus(null);
    setActiveTab('card');
    onClose();
  };

  if (!invoice) return null;

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
            status={paymentStatus.success ? 'success' : 'error'}
            title={paymentStatus.success ? 'Payment Successful!' : 'Payment Failed'}
            subTitle={paymentStatus.message}
            extra={
              paymentStatus.success && (
                <div style={{ marginTop: 16 }}>
                  <p>
                    <strong>Transaction ID:</strong> {paymentStatus.transactionId}
                  </p>
                  <p>
                    <strong>Amount Paid:</strong> ₹{invoice.totalAmount.toFixed(2)}
                  </p>
                </div>
              )
            }
          />
        </Spin>
      ) : (
        <>
          <div style={{ marginBottom: 16, padding: '12px', background: '#f0f2f5', borderRadius: '4px' }}>
            <p style={{ marginBottom: 8 }}>
              <strong>Invoice Number:</strong> {invoice.invoiceNumber}
            </p>
            <p style={{ marginBottom: 8 }}>
              <strong>Amount to Pay:</strong> <span style={{ color: '#52c41a', fontSize: '18px', fontWeight: 'bold' }}>₹{invoice.totalAmount.toFixed(2)}</span>
            </p>
            <p style={{ marginBottom: 0 }}>
              <strong>Status:</strong> {invoice.status}
            </p>
          </div>

          <Alert
            message="This is a dummy payment integration for testing purposes"
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
          />

          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            items={[
              {
                key: 'card',
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
                      label="Cardholder Name"
                      name="cardHolder"
                      rules={[{ required: true, message: 'Please enter cardholder name' }]}
                    >
                      <Input placeholder="John Doe" />
                    </Form.Item>

                    <Form.Item
                      label="Card Number"
                      name="cardNumber"
                      rules={[
                        { required: true, message: 'Please enter card number' },
                        { len: 16, message: 'Card number must be 16 digits' },
                      ]}
                    >
                      <Input placeholder="1234 5678 9012 3456" maxLength={16} />
                    </Form.Item>

                    <Space style={{ width: '100%' }} size="large">
                      <Form.Item
                        label="Expiry Date"
                        name="expiryDate"
                        rules={[
                          { required: true, message: 'Required' },
                          {
                            pattern: /^(0[1-9]|1[0-2])\/\d{2}$/,
                            message: 'Format: MM/YY',
                          },
                        ]}
                        style={{ flex: 1 }}
                      >
                        <Input placeholder="MM/YY" maxLength={5}/>
                      </Form.Item>

                      <Form.Item
                        label="CVV"
                        name="cvv"
                        rules={[
                          { required: true, message: 'Required' },
                          { len: 3, message: 'CVV must be 3 digits' },
                        ]}
                        style={{ flex: 1 }}
                      >
                        <Input placeholder="123" maxLength={3} type="password" />
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
                        Pay ₹{invoice.totalAmount.toFixed(2)}
                      </Button>
                    </Form.Item>
                  </Form>
                ),
              },
              {
                key: 'qr',
                label: (
                  <span>
                    <QrcodeOutlined /> QR Code Payment
                  </span>
                ),
                children: (
                  <div style={{ marginTop: 24, textAlign: 'center', padding: '20px 0' }}>
                    <h4>UPI Payment QR Code</h4>
                    {qrCodeImageUrl && (
                      <div 
                        style={{ 
                          padding: '15px',
                          background: '#fff',
                          borderRadius: '6px',
                          display: 'inline-block',
                          border: '2px solid #1890ff',
                          marginBottom: '20px',
                        }}
                      >
                        <img 
                          src={qrCodeImageUrl} 
                          alt="UPI QR Code" 
                          style={{ display: 'block', borderRadius: '4px' }}
                        />
                      </div>
                    )}

                    <div style={{ marginBottom: 20 }}>
                      <h3 style={{ fontSize: '18px', marginBottom: '5px' }}>₹{invoice.totalAmount.toFixed(2)}</h3>
                      <p style={{ color: '#666', margin: '5px 0', fontSize: '14px' }}>Invoice: {invoice.invoiceNumber}</p>
                      <p style={{ color: '#999', fontSize: '12px' }}>
                        Scan using Google Pay, PhonePe, or any UPI app
                      </p>
                    </div>

                    <Button
                      type="primary"
                      size="large"
                      loading={loading}
                      block
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

export default PaymentModal;

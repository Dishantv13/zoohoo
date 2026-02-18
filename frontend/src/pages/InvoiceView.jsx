import React, { useEffect, useState } from "react";
import { Card, Row, Col, Table, Divider, Typography, Button } from "antd";
import { useParams } from "react-router-dom";
import api from "../service/api";

const { Title, Text } = Typography;

const InvoiceView = () => {
  const { id } = useParams();
  const [invoice, setInvoice] = useState(null);
  const [company, setCompany] = useState(null);

  useEffect(() => {
    fetchInvoice();
  }, []);

  const fetchInvoice = async () => {
    try {
      const res = await api.get(`/invoices/${id}`);

      const invoice = res.data.invoice;
      const company = res.data.company;

      setInvoice(invoice);
      setCompany(company);
    } catch (error) {
      console.error(error);
    }
  };

  if (!invoice || !company) return <div>Loading...</div>;

  const columns = [
    {
      title: "#",
      render: (_, __, index) => index + 1,
      width: 50,
    },
    {
      title: "Item Name",
      dataIndex: "name",
    },
    {
      title: "Qty",
      dataIndex: "quantity",
      align: "center",
    },
    {
      title: "Rate",
      dataIndex: "rate",
      align: "right",
      render: (value) => `₹${value}`,
    },
    {
      title: "Amount",
      align: "right",
      render: (_, record) =>
        `₹${record.quantity * record.rate}`,
    },
  ];

  return (
    <div style={{ padding: 40, background: "#f5f5f5" }}>
      <Card
        style={{
          maxWidth: 900,
          margin: "auto",
          boxShadow: "0 0 10px rgba(0,0,0,0.1)",
        }}
      >

        <Row justify="space-between">
          <Col>
            <Title level={3} style={{ marginBottom: 0 }}>
              {company.name}
            </Title>
            <Text>{company.address}</Text><br />
            <Text>GSTIN: {company.gst}</Text><br />
            <Text>Phone: {company.phone}</Text><br />
            <Text>Email: {company.email}</Text>
          </Col>
        </Row>

        <Divider />

        <Row justify="space-between">
          <Col>
            <Title level={4}>INVOICE</Title>
            <Text strong>Invoice No:</Text> {invoice.invoiceNumber}<br />
            <Text strong>Invoice Date:</Text>{" "}
            {new Date(invoice.invoiceDate).toLocaleDateString()}<br />
            <Text strong>Due Date:</Text>{" "}
            {new Date(invoice.dueDate).toLocaleDateString()}
          </Col>

          <Col>
            <Title level={5}>Bill To:</Title>
            <Text>{invoice.customer?.name}</Text><br />
            <Text>{invoice.customer?.address}</Text><br />
            <Text>
              GSTIN: {invoice.customer?.gst || "N/A"}
            </Text>
          </Col>
        </Row>

        <Divider />

        <Table
          columns={columns}
          dataSource={invoice.items}
          pagination={false}
          rowKey={(record, index) => index}
        />

        <Row justify="end" style={{ marginTop: 20 }}>
          <Col span={8}>
            <Row justify="space-between">
              <Text>Subtotal:</Text>
              <Text>₹{invoice.subtotal}</Text>
            </Row>

            <Row justify="space-between">
              <Text>Tax:</Text>
              <Text>₹{invoice.tax}</Text>
            </Row>

            <Row justify="space-between">
              <Text>Discount:</Text>
              <Text>- ₹{invoice.discount}</Text>
            </Row>

            <Divider style={{ margin: "10px 0" }} />

            <Row justify="space-between">
              <Text strong>Grand Total:</Text>
              <Text strong>₹{invoice.total}</Text>
            </Row>
          </Col>
        </Row>

        <Divider />

        <Row justify="space-between" style={{ marginTop: 40 }}>
          <Col>
            <Text>Thank you for your business!</Text>
          </Col>

          <Col style={{ textAlign: "center" }}>
            <div style={{
              borderTop: "1px solid #000",
              width: 150,
              marginTop: 40
            }} />
            <Text>Authorized Signature</Text>
          </Col>
        </Row>

      </Card>

      <Button 
      type="primary" 
      onClick={() => window.print()}
        style={{    
            display: "block",
            margin: "20px auto",
        }}
      >Print Invoice
      </Button>
    </div>
  );
};

export default InvoiceView;

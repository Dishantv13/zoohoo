import "@ant-design/v5-patch-for-react-19";
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { Form, Card, message, Empty, notification } from "antd";
import dayjs from "dayjs";
import { useGetCustomersQuery } from "../service/customerApi";
import {
  useUpdateInvoiceMutation,
  useCreateInvoiceMutation,
} from "../service/invoiceApi";
import { getSimpleItemColumns } from "../columns/ItemColumn";
import BillInvoiceForm from "../components/formField/BillInvoiceForm";
import { ROUTE_PATHS } from "../enum/apiUrl";
import "../css/CreateInvoice.css";

export default function AdminCreateInvoice() {
  const { user } = useSelector((state) => state.auth);
  const location = useLocation();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [items, setItems] = useState([{ name: "", quantity: 1, rate: 0 }]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [loading, setLoading] = useState(false);
  const [discount, setDiscount] = useState(0);
  const [tax, setTax] = useState(18);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editInvoiceId, setEditInvoiceId] = useState(null);

  if (!user || user.role !== "admin") {
    return (
      <Card>
        <Empty description="Admin access only. Please login as admin." />
      </Card>
    );
  }
  const { data: customersData, error: customersError } = useGetCustomersQuery({
    limit: 1000,
  });
  const [createInvoice] = useCreateInvoiceMutation();
  const [updateInvoice] = useUpdateInvoiceMutation();

  const customersList = customersData?.data?.customers || customersData || [];

  useEffect(() => {
    if (location.state?.invoice) {
      const invoice = location.state.invoice;
      setIsEditMode(true);
      setEditInvoiceId(invoice._id);
      setSelectedCustomer(invoice.customer?._id);
      setItems(invoice.items || [{ name: "", quantity: 1, rate: 0 }]);
      setDiscount(invoice.parseDiscount || 0);
      setTax(invoice.parseTaxRate || 18);
      form.setFieldsValue({
        invoiceDate: dayjs(invoice.invoiceDate),
        dueDate: dayjs(invoice.dueDate),
        status: invoice.status,
        invoiceNumber: invoice.invoiceNumber,
      });
    }
  }, [location.state, form]);

  const addItem = () => {
    setItems([...items, { name: "", quantity: 1, rate: 0 }]);
  };

  const removeItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  const onFinish = async (values) => {
    if (!selectedCustomer) {
      message.error("Please select a customer");
      return;
    }

    if (items.length === 0) {
      message.error("Please add at least one item");
      return;
    }

    setLoading(true);

    try {
      const invoiceData = {
        customer: selectedCustomer,
        items,
        invoiceNumber: values.invoiceNumber || `INV-${Date.now()}`,
        invoiceDate: values.invoiceDate?.toDate(),
        dueDate: values.dueDate?.toDate(),
        discount,
        tax,
        status: values.status,
      };

      if (isEditMode) {
        const res = await updateInvoice({
          id: editInvoiceId,
          ...invoiceData,
        }).unwrap();

        if (res?.success) {
          notification.success({
            message: "Invoice Updated",
            description: "Invoice updated successfully",
          });
          navigate(ROUTE_PATHS.ADMIN_INVOICE_MANAGEMENT);
        }
      } else {
        const res = await createInvoice(invoiceData).unwrap();

        if (res?.success) {
          notification.success({
            message: "Invoice Created",
            description: "Invoice created successfully",
          });
        }

        form.resetFields();
        setItems([{ name: "", quantity: 1, rate: 0 }]);
        setSelectedCustomer(null);
        setDiscount(0);
        setTax(18);
        navigate(ROUTE_PATHS.ADMIN_INVOICE_MANAGEMENT);
      }
    } catch (error) {
      notification.error({
        message: "Failed to Create Invoice",
        description:
          error?.data?.message ||
          `Failed to ${isEditMode ? "update" : "create"} invoice`,
      });
    } finally {
      setLoading(false);
    }
  };

  const itemColumns = getSimpleItemColumns({ updateItem, removeItem });

  return (
    <div className="create-invoice-container">
      <BillInvoiceForm
        title={isEditMode ? "Edit Invoice" : "Create Invoice"}
        form={form}
        onFinish={onFinish}
        partyLabel="Customer"
        partyList={customersList}
        selectedParty={selectedCustomer}
        setSelectedParty={setSelectedCustomer}
        items={items}
        itemColumns={itemColumns}
        addItem={addItem}
        loading={loading}
        submitText={isEditMode ? "Update Invoice" : "Create Invoice"}
        cancelHandler={() => navigate(ROUTE_PATHS.ADMIN_INVOICE_MANAGEMENT)}
        dateField={[
          {
            name: "invoiceDate",
            label: "Invoice Date",
            rules: [{ required: true, message: "Please select invoice date" }],
          },
          {
            name: "dueDate",
            label: "Due Date",
            rules: [{ required: true, message: "Please select due date" }],
          },
        ]}
      ></BillInvoiceForm>
    </div>
  );
}

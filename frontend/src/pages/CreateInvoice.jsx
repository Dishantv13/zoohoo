import "@ant-design/v5-patch-for-react-19";
import { Form, notification, Spin } from "antd";
import { useSelector } from "react-redux";
import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { ROUTE_PATHS } from "../enum/apiUrl";
import {
  useGetInvoiceByIdQuery,
  useUpdateInvoiceMutation,
  useCreateInvoiceMutation,
} from "../service/invoiceApi";
import InvoiceForm from "../components/formField/InvoiceForm";

export default function CreateInvoice() {
  const [form] = Form.useForm();
  const currentUser = useSelector((state) => state.auth.user);
  const currentUserId = currentUser?._id || currentUser?.id || null;
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;
  const [updateInvoice] = useUpdateInvoiceMutation();
  const [createInvoice] = useCreateInvoiceMutation();
  const { data: invoiceResponse, isLoading } = useGetInvoiceByIdQuery(id, {
    skip: !isEditing,
  });

  const calculateTotals = (values) => {
    if (!values.items && !values.tax && !values.discount) return;

    const items = values.items || [];
    const taxRate = Number(values.tax) || 18;
    const discountRate = Number(values.discount) || 0;

    const subTotal = items.reduce((sum, item) => {
      const quantity = Number(item?.quantity) || 0;
      const rate = Number(item?.rate) || 0;
      return sum + quantity * rate;
    }, 0);

    const discountAmount = (subTotal * discountRate) / 100;
    const amountAfterDiscount = subTotal - discountAmount;
    const taxAmount = (amountAfterDiscount * taxRate) / 100;
    const totalAmount = amountAfterDiscount + taxAmount;

    form.setFieldsValue({
      subTotal: Number(subTotal.toFixed(2)),
      discountAmount: Number(discountAmount.toFixed(2)),
      amountAfterDiscount: Number(amountAfterDiscount.toFixed(2)),
      taxAmount: Number(taxAmount.toFixed(2)),
      totalAmount: Number(totalAmount.toFixed(2)),
    });
  };

  const invoice = invoiceResponse?.data;

  useEffect(() => {
    if (invoice && isEditing) {
      const formData = {
        customer: invoice.customer._id,
        invoiceNumber: invoice.invoiceNumber,
        invoiceDate: dayjs(invoice.invoiceDate),
        dueDate: dayjs(invoice.dueDate),
        status: invoice.status,
        items: invoice.items,
        tax: invoice.parseTaxRate,
        discount: invoice.parseDiscount,
        subTotal: invoice.subtotal,
        discountAmount: invoice.discount,
        taxAmount: invoice.tax,
        amountAfterDiscount: invoice.amountAfterDiscount,
        totalAmount: invoice.totalAmount,
      };

      form.setFieldsValue(formData);
      setTimeout(() => calculateTotals(formData), 0);
    }
  }, [invoice, isEditing, form]);

  useEffect(() => {
    if (!isEditing && currentUserId) {
      form.setFieldsValue({
        customer: currentUserId,
      });
    }
  }, [currentUserId]);

  const onFinish = async (values) => {
    try {
      const finalValues = {
        ...values,
        tax: values.tax || 18,
        discount: values.discount || 0,
        invoiceDate: values.invoiceDate.format("YYYY-MM-DD"),
        dueDate: values.dueDate.format("YYYY-MM-DD"),
      };

      if (isEditing) {
        await updateInvoice({
          id,
          ...finalValues,
        }).unwrap();

        notification.success({
          message: "Success",
          description: "Invoice updated successfully",
        });
      } else {
        await createInvoice(finalValues).unwrap();

        const currentUserId = currentUser?._id || currentUser?.id || null;
        if (currentUserId) {
          form.setFieldsValue({ customer: currentUserId });
        }

        notification.success({
          message: "Success",
          description: "Invoice created successfully",
        });
      }

      form.resetFields();
      navigate(ROUTE_PATHS.INVOICES);
    } catch (error) {
      notification.error({
        message: "Failed",
        description: error?.data?.message || "Something went wrong",
      });
    }
  };

  if (isLoading) return <Spin />;

  return (
    <InvoiceForm
      form={form}
      onFinish={onFinish}
      calculateTotals={calculateTotals}
      currentUser={currentUser}
      isEditing={isEditing}
    />
  );
}

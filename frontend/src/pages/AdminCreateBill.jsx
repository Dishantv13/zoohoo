import "@ant-design/v5-patch-for-react-19";
import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { Form, Card, message, Empty, notification } from "antd";

import { useGetVendorsQuery } from "../service/vendorApi";
import {
  useCreateBillMutation,
  useUpdateBillMutation,
} from "../service/billApi";
import { useGetVendorAvailabilityQuery } from "../service/itemApi";
import { getInventoryItemColumns } from "../columns/ItemColumn";
import BillInvoiceForm from "../components/BillInvoiceForm";
import dayjs from "dayjs";
import { ROUTE_PATHS } from "../enum/apiUrl";

import "../css/CreateInvoice.css";

const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
});

export default function AdminCreateBill() {
  const { user } = useSelector((state) => state.auth);
  const location = useLocation();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [items, setItems] = useState([{ itemId: "", quantity: 1, rate: 0 }]);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editBillId, setEditBillId] = useState(null);

  const { data: vendorsData } = useGetVendorsQuery({
    page: 1,
    limit: 100,
  });
  const { data: availabilityData, isLoading: availabilityLoading } =
    useGetVendorAvailabilityQuery(
      selectedVendor ? String(selectedVendor) : null,
      { skip: !selectedVendor },
    );
  const [createBill] = useCreateBillMutation();
  const [updateBill] = useUpdateBillMutation();

  if (!user || user.role !== "admin") {
    return (
      <Card>
        <Empty description="Admin access only. Please login as admin." />
      </Card>
    );
  }

  const vendorsList = vendorsData?.data?.vendors || [];
  const availableItems = availabilityData?.data || [];

  const inventoryById = useMemo(() => {
    const map = new Map();
    availableItems.forEach((item) => {
      map.set(item._id, item);
    });
    return map;
  }, [availableItems]);

  useEffect(() => {
    if (location.state?.bill) {
      const bill = location.state.bill;
      setIsEditMode(true);
      setEditBillId(bill._id);
      setSelectedVendor(bill.vendorId?._id || null);

      form.setFieldsValue({
        billDate: bill.billDate ? dayjs(bill.billDate) : null,
        dueDate: bill.dueDate ? dayjs(bill.dueDate) : null,
      });

      setItems(
        bill.items?.length
          ? bill.items.map((item) => ({
              itemId: item.itemId?._id || item.itemId || "",
              quantity: item.quantity || 1,
              rate: item.rate || 0,
            }))
          : [{ itemId: "", quantity: 1, rate: 0 }],
      );
    }
  }, [location.state]);

  const addItem = () => {
    setItems((prev) => [...prev, { itemId: "", quantity: 1, rate: 0 }]);
  };

  const removeItem = (index) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const updateItem = (index, field, value) => {
    setItems((prev) => {
      const next = [...prev];
      next[index] = {
        ...next[index],
        [field]: value,
      };

      if (field === "itemId") {
        const inventoryItem = inventoryById.get(value);
        next[index].rate = Number(inventoryItem?.rate || 0);
      }

      return next;
    });
  };

  const requestedByItem = useMemo(() => {
    const map = new Map();
    items.forEach((item) => {
      if (!item.itemId) return;
      const current = Number(map.get(item.itemId) || 0);
      map.set(item.itemId, current + Number(item.quantity || 0));
    });
    return map;
  }, [items]);

  const stockIssues = useMemo(() => {
    const issues = [];
    requestedByItem.forEach((requestedQty, itemId) => {
      const inventoryItem = inventoryById.get(itemId);
      const availableQty = Number(inventoryItem?.quantity || 0);
      if (requestedQty > availableQty) {
        issues.push({
          itemId,
          name: inventoryItem?.name || itemId,
          requestedQty,
          availableQty,
        });
      }
    });
    return issues;
  }, [requestedByItem, inventoryById]);

  const onFinish = async (values) => {
    if (!selectedVendor) {
      message.error("Please select a vendor");
      return;
    }

    const hasInvalidItem = items.some(
      (item) =>
        !item.itemId || Number(item.quantity) <= 0 || Number(item.rate) <= 0,
    );

    if (!items.length || hasInvalidItem) {
      message.error("Please add valid items with quantity and rate");
      return;
    }

    if (stockIssues.length > 0) {
      message.error(
        "Some items exceed available stock. Bill cannot be created.",
      );
      return;
    }

    setLoading(true);

    try {
      const payload = {
        vendorId: String(selectedVendor),
        billDate: values.billDate.toISOString(),
        dueDate: values.dueDate.toISOString(),
        items: items.map((item) => ({
          itemId: item.itemId,
          quantity: Number(item.quantity),
          rate: Number(item.rate),
        })),
      };

      if (isEditMode && editBillId) {
        await updateBill({ billId: editBillId, data: payload }).unwrap();
        notification.success({
          message: "Bill Updated",
          description: "Bill updated successfully",
        });
      } else {
        await createBill(payload).unwrap();
        notification.success({
          message: "Bill Created",
          description: "Bill created successfully",
        });
      }

      navigate(ROUTE_PATHS.ADMIN_VENDOR_BILLS);
    } catch (error) {
      notification.error({
        message: "Failed to Create Bill",
        description:
          error?.data?.message ||
          `Failed to ${isEditMode ? "update" : "create"} bill`,
      });
    } finally {
      setLoading(false);
    }
  };

  const itemColumns = getInventoryItemColumns({
    availableItems,
    availabilityLoading,
    inventoryById,
    updateItem,
    removeItem,
    items,
    currencyFormatter,
  });

  return (
    <div className="create-invoice-container">
      <BillInvoiceForm
        title={isEditMode ? "Edit Vendor Bill" : "Create Bill"}
        form={form}
        onFinish={onFinish}
        partyLabel="Vendor"
        partyList={vendorsList}
        selectedParty={selectedVendor}
        setSelectedParty={setSelectedVendor}
        items={items}
        itemColumns={itemColumns}
        addItem={addItem}
        loading={loading}
        submitText={isEditMode ? "Update Bill" : "Create Bill"}
        cancelHandler={() => navigate(ROUTE_PATHS.ADMIN_VENDOR_BILLS)}
        dateField={[
          {
            name: "billDate",
            label: "Bill Date",
            rules: [{ required: true, message: "Please select bill date" }],
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

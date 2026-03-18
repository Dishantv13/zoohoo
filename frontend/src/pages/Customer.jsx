import "@ant-design/v5-patch-for-react-19";
import {
  Form,
  notification,
  Modal,
} from "antd";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  useUpdateCustomerProfileMutation,
  useChangePasswordMutation,
  useDeleteCustomerProfileMutation,
} from "../service/customerApi";
import CustomerForm from "../components/CustomerForm";

import { useGetCurrentUserQuery } from "../service/authApi";
import { ROUTE_PATHS } from "../enum/apiUrl";

export default function Customers() {
  const [form] = Form.useForm();
  const [passwordForm] = Form.useForm();
  const [isEditing, setIsEditing] = useState(false);
  const [passwordModal, setPasswordModal] = useState(false);
  const navigate = useNavigate();

  const { data, refetch, isLoading } = useGetCurrentUserQuery();

  const [updateCustomerProfile, { isLoading: updateLoading }] =
    useUpdateCustomerProfileMutation();
  const [changePassword, { isLoading: changePasswordLoading }] =
    useChangePasswordMutation();
  const [deleteCustomerProfile, { isLoading: deleteLoading }] =
    useDeleteCustomerProfileMutation();

  useEffect(() => {
    if (data?.data) {
      form.setFieldsValue(data.data);
    }
  }, [data, form]);

  const onFinish = async (values) => {
    try {
      await updateCustomerProfile(values).unwrap();

      notification.success({
        message: "Success",
        description: "Profile updated successfully",
      });
      setIsEditing(false);
      refetch();
    } catch (error) {
      notification.error({
        message: "Failed",
        description: error.data?.message || "Profile update failed",
      });
    }
  };

  const onChangePassword = async (values) => {
    try {
      await changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      }).unwrap();
      notification.success({
        message: "Password Changed",
        description: "Please login again",
      });

      setPasswordModal(false);
      passwordForm.resetFields();
      localStorage.removeItem("token");
      navigate(ROUTE_PATHS.LOGIN);
    } catch (error) {
      notification.error({
        message: "Failed",
        description: error.data?.message || "Password change failed",
      });
    }
  };
  const handleDeleteAccount = () => {
    Modal.confirm({
      title: "Delete Account",
      content: "Are you sure? This action cannot be undone.",
      okText: "Delete",
      okType: "danger",
      onOk: async () => {
        try {
          await deleteCustomerProfile().unwrap();

          notification.success({
            message: "Account Deleted",
            description: "Your account has been deleted",
          });

          localStorage.removeItem("token");
          navigate(ROUTE_PATHS.LOGIN);
        } catch (error) {
          notification.error({
            message: "Failed",
            description: "Account deletion failed",
          });
        }
      },
    });
  };

  return (
    <div style={{ maxWidth: 600, margin: "0 auto" }}>

      <CustomerForm
        form={form}
        onFinish={onFinish}
        currentUser={data?.data}
        isEditing={isEditing}
        updateLoading={updateLoading}
        setIsEditing={setIsEditing}
        setPasswordModal={setPasswordModal}
        deleteLoading={deleteLoading}
        handleDeleteAccount={handleDeleteAccount}
        changePasswordLoading={changePasswordLoading}
        passwordModal={passwordModal}
        passwordForm={passwordForm}
        onChangePassword={onChangePassword}
      />
    </div>
  );
}

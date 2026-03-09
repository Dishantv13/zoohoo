import { Navigate } from "react-router-dom";
import { useGetCurrentUserQuery } from "../service/authApi";

export default function ProtectedRoute({ children }) {

  const token = localStorage.getItem("token");

  const { data, isLoading } = useGetCurrentUserQuery(null, {
    skip: !token,
  });

  const user = data?.data;

  if (!token) {
    return <Navigate to="/login" />;
  }

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return user ? children : <Navigate to="/login" />;
}
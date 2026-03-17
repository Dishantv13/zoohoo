import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useGetCurrentUserQuery } from "../service/authApi";
import { ROUTE_PATHS } from "../enum/apiUrl";

export default function ProtectedRoute({ children }) {
  const { user, token } = useSelector((state) => state.auth);

  const shouldFetchMe = !!token && !user;

  const { data, isLoading } = useGetCurrentUserQuery(null, {
    skip: !shouldFetchMe,
  });

  const resolvedUser = user || data?.data;

  if (!token) {
    return <Navigate to={ROUTE_PATHS.LOGIN} />;
  }

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return resolvedUser ? children : <Navigate to={ROUTE_PATHS.LOGIN} />;
}

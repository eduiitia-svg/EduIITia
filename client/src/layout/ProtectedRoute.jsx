import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";

const ProtectedRoute = ({ allowedRoles, children }) => {
  const { user } = useSelector((state) => state.auth);

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    switch (user.role) {
      case "superadmin":
        return <Navigate to="/super/dashboard" replace />;
      case "admin":
        return <Navigate to="/admin/dashboard" replace />;
      case "student":
        return <Navigate to="/" replace />;
      default:
        return <Navigate to="/" replace />;
    }
  }

  return children ? children : <Outlet />;
};

export default ProtectedRoute;
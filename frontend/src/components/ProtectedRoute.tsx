import { Navigate, Outlet } from "react-router-dom";
import { getAdminToken } from "../api/client";

export function ProtectedRoute() {
  if (!getAdminToken()) {
    return <Navigate to="/admin/login" replace />;
  }
  return <Outlet />;
}

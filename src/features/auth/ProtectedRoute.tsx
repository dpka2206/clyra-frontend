import { Navigate, Outlet } from "react-router-dom";

import type { UserRole } from "./authSlice.ts";
import { useAppSelector } from "../../lib/hooks/index.ts";

type ProtectedRouteProps = {
  allowedRoles: UserRole[];
};

export function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, role } = useAppSelector((state) => state.auth);

  if (!isAuthenticated || !role) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(role)) {
    return <Navigate to={`/${role.toLowerCase()}`} replace />;
  }

  return <Outlet />;
}

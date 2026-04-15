import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import { LoginPage } from "../features/auth/LoginPage.tsx";
import { ProtectedRoute } from "../features/auth/ProtectedRoute.tsx";
import { AvailabilityPage } from "../features/doctor/AvailabilityPage.tsx";
import { LiveOPPage } from "../features/doctor/LiveOPPage.tsx";
import { OPSchedulePage } from "../features/doctor/OPSchedulePage.tsx";
import { PatientProfilePage } from "../features/patient/PatientProfilePage.tsx";
import { PharmacyPortalPage } from "../features/pharmacy/PharmacyPortalPage.tsx";
import { AdminDashboardPage } from "../features/admin/AdminDashboardPage.tsx";
import { useAppSelector } from "../lib/hooks/index.ts";

function RoleHomeRedirect() {
  const role = useAppSelector((state) => state.auth.role);

  if (role === "Doctor") {
    return <Navigate to="/doctor/op-schedule" replace />;
  }

  if (role === "Pharmacist") {
    return <Navigate to="/pharmacy" replace />;
  }

  if (role === "Admin") {
    return <Navigate to="/admin" replace />;
  }

  if (role === "Patient") {
    return <Navigate to="/patient" replace />;
  }

  return <Navigate to="/login" replace />;
}

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RoleHomeRedirect />} />
        <Route path="/login" element={<LoginPage />} />

        <Route element={<ProtectedRoute allowedRoles={["Doctor"]} />}>
          <Route path="/doctor" element={<Navigate to="/doctor/op-schedule" replace />} />
          <Route path="/doctor/op-schedule" element={<OPSchedulePage />} />
          <Route path="/doctor/availability" element={<AvailabilityPage />} />
          <Route path="/doctor/patient-profile" element={<PatientProfilePage />} />
          <Route path="/doctor/live-op" element={<LiveOPPage />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={["Pharmacist"]} />}>
          <Route path="/pharmacy" element={<PharmacyPortalPage />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={["Patient"]} />}>
          <Route path="/patient" element={<PatientProfilePage />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={["Admin"]} />}>
          <Route path="/admin" element={<AdminDashboardPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

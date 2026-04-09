import type { PropsWithChildren } from "react";
import { NavLink, useNavigate } from "react-router-dom";

import { logout } from "../../features/auth/authSlice.ts";
import { useAppDispatch, useAppSelector } from "../../lib/hooks/index.ts";

const navByRole = {
  Doctor: [
    { label: "OP Schedule", path: "/doctor/op-schedule", icon: "◎" },
    { label: "Availability", path: "/doctor/availability", icon: "◔" },
    { label: "Patient Profile", path: "/doctor/patient-profile", icon: "▣" },
    { label: "Live OP", path: "/doctor/live-op", icon: "◉" },
  ],
  Pharmacist: [{ label: "Pharmacy Portal", path: "/pharmacy", icon: "◌" }],
  Admin: [{ label: "Admin Dashboard", path: "/admin", icon: "◈" }],
  Patient: [],
} as const;

type AppShellProps = PropsWithChildren<{
  title: string;
}>;

export function AppShell({ title, children }: AppShellProps) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { role, mode } = useAppSelector((state) => state.auth);

  const navItems = role ? navByRole[role] : [];

  return (
    <div className="flex min-h-screen bg-slate-100">
      <aside className="hidden w-24 flex-col bg-[#08295b] px-4 py-6 text-white lg:flex">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/20 text-xl font-bold">
          M
        </div>
        <nav className="mt-10 flex flex-1 flex-col items-center gap-3">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex h-12 w-12 items-center justify-center rounded-2xl text-lg transition ${
                  isActive ? "bg-blue-500 text-white" : "text-blue-100/80 hover:bg-white/10"
                }`
              }
              title={item.label}
            >
              {item.icon}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="flex min-h-screen flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-5">
          <div>
            <p className="text-sm text-slate-400">{role} Workspace</p>
            <h1 className="text-2xl font-semibold text-slate-950">{title}</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="rounded-full bg-slate-100 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
              {mode} mode
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-slate-900">Sonika</p>
              <p className="text-xs text-slate-500">{role}</p>
            </div>
            <button
              type="button"
              onClick={() => {
                dispatch(logout());
                navigate("/login");
              }}
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700"
            >
              Logout
            </button>
          </div>
        </header>

        <main className="flex-1 px-6 py-6">{children}</main>
      </div>
    </div>
  );
}

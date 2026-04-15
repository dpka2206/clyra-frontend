import type { PropsWithChildren } from "react";
import { NavLink, useNavigate } from "react-router-dom";

import { logout } from "../../features/auth/authSlice.ts";
import { useAppDispatch, useAppSelector } from "../../lib/hooks/index.ts";

const navByRole = {
  Doctor: [
    { label: "OP Schedule", path: "/doctor/op-schedule", shortLabel: "OP" },
    { label: "Availability", path: "/doctor/availability", shortLabel: "AV" },
    { label: "Patient Profile", path: "/doctor/patient-profile", shortLabel: "PP" },
    { label: "Live OP", path: "/doctor/live-op", shortLabel: "LO" },
  ],
  Pharmacist: [{ label: "Pharmacy Portal", path: "/pharmacy", shortLabel: "RX" }],
  Admin: [{ label: "Admin Dashboard", path: "/admin", shortLabel: "AD" }],
  Patient: [{ label: "My Profile", path: "/patient", shortLabel: "ME" }],
} as const;

type AppShellProps = PropsWithChildren<{
  title: string;
}>;

export function AppShell({ title, children }: AppShellProps) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { role, mode, currentUser } = useAppSelector((state) => state.auth);

  const navItems = role ? navByRole[role] : [];
  const displayName = currentUser?.profile?.name ?? "Sonika";

  return (
    <div className="flex min-h-screen bg-slate-100">
      <aside className="hidden w-28 flex-col bg-[#08295b] px-4 py-6 text-white lg:flex">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/20 text-xl font-bold">
          C
        </div>
        <nav className="mt-10 flex flex-1 flex-col items-center gap-3">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex w-full flex-col items-center justify-center rounded-2xl px-2 py-3 text-center transition ${
                  isActive ? "bg-blue-500 text-white" : "text-blue-100/80 hover:bg-white/10"
                }`
              }
              title={item.label}
            >
              <span className="rounded-lg bg-white/10 px-2 py-1 text-xs font-bold tracking-wide">
                {item.shortLabel}
              </span>
              <span className="mt-2 text-[11px] font-medium leading-tight">{item.label}</span>
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
              <p className="text-sm font-semibold text-slate-900">{displayName}</p>
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

        {navItems.length ? (
          <div className="border-b border-slate-200 bg-white px-4 py-3 lg:hidden">
            <nav className="flex gap-2 overflow-x-auto">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `shrink-0 rounded-xl px-4 py-2 text-sm font-semibold transition ${
                      isActive
                        ? "bg-blue-600 text-white"
                        : "border border-slate-200 bg-slate-50 text-slate-700"
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </div>
        ) : null}

        <main className="flex-1 px-6 py-6">{children}</main>
      </div>
    </div>
  );
}

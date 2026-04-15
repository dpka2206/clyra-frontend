import { useState } from "react";
import { Navigate } from "react-router-dom";

import { useAppDispatch, useAppSelector } from "../../lib/hooks/index.ts";
import { loginAsDemo, loginWithServer, signupWithServer, type UserRole } from "./authSlice.ts";

const roles: UserRole[] = ["Doctor", "Pharmacist", "Admin"];
const signupRoles: Array<Exclude<UserRole, "Admin">> = ["Doctor", "Patient", "Pharmacist"];

export function LoginPage() {
  const dispatch = useAppDispatch();
  const auth = useAppSelector((state) => state.auth);
  const [authView, setAuthView] = useState<"signin" | "signup">("signin");
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [password, setPassword] = useState("");
  const [signupRole, setSignupRole] = useState<Exclude<UserRole, "Admin">>("Doctor");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [department, setDepartment] = useState("");

  if (auth.isAuthenticated && auth.role) {
    return <Navigate to={`/${auth.role.toLowerCase()}`} replace />;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-10">
      <div className="grid w-full max-w-6xl overflow-hidden rounded-3xl bg-white shadow-2xl lg:grid-cols-[1.1fr_0.9fr]">
        <section className="bg-[#0d2b5b] px-8 py-10 text-white">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-200">Clyra</p>
          <h1 className="mt-4 text-4xl font-semibold">Hospital OP Management Dashboard</h1>
          <p className="mt-4 max-w-xl text-sm text-blue-100">
            Manage doctor availability, OP queue, patient history, live consultation notes, and
            pharmacist prescription guidance from one workflow-oriented interface.
          </p>
          <div className="mt-10 space-y-4">
            {[
              "Role-based navigation and protected routes",
              "Doctor OP schedule table inspired by your reference dashboard",
              "Live consultation workspace with voice recording and summary editing",
              "Pharmacy token lookup with usage instruction follow-up",
            ].map((item) => (
              <div key={item} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm">
                {item}
              </div>
            ))}
          </div>
        </section>
        <section className="px-8 py-10">
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setAuthView("signin")}
              className={`rounded-2xl px-4 py-2 text-sm font-semibold ${
                authView === "signin" ? "bg-blue-600 text-white" : "border border-slate-200 text-slate-700"
              }`}
            >
              Sign in
            </button>
            <button
              type="button"
              onClick={() => setAuthView("signup")}
              className={`rounded-2xl px-4 py-2 text-sm font-semibold ${
                authView === "signup" ? "bg-blue-600 text-white" : "border border-slate-200 text-slate-700"
              }`}
            >
              Sign up
            </button>
          </div>
          <h2 className="mt-4 text-2xl font-semibold text-slate-950">
            {authView === "signin" ? "Sign in" : "Create account"}
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            {authView === "signin"
              ? "Use real backend credentials, or enter the dashboard instantly with a demo role."
              : "Create a real backend account with a working role, then continue directly into the app."}
          </p>

          {authView === "signin" ? (
            <form
              className="mt-8 space-y-4"
              onSubmit={(event) => {
                event.preventDefault();
                void dispatch(loginWithServer({ emailOrPhone, password }));
              }}
            >
              <label className="block text-sm text-slate-600">
                Email or phone
                <input
                  value={emailOrPhone}
                  onChange={(event) => setEmailOrPhone(event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3"
                  placeholder="doctor@hospital.com or +9199..."
                />
              </label>
              <label className="block text-sm text-slate-600">
                Password
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3"
                  placeholder="Password"
                />
              </label>
              <button
                type="submit"
                className="w-full rounded-2xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white"
              >
                {auth.status === "loading" ? "Signing in..." : "Sign in with backend"}
              </button>
              {auth.error ? <p className="text-sm text-rose-600">{auth.error}</p> : null}
            </form>
          ) : (
            <form
              className="mt-8 space-y-4"
              onSubmit={(event) => {
                event.preventDefault();
                void dispatch(
                  signupWithServer({
                    role: signupRole,
                    name,
                    phone,
                    email: email || undefined,
                    password,
                    specialization: specialization || undefined,
                    department: department || undefined,
                  }),
                );
              }}
            >
              <label className="block text-sm text-slate-600">
                Role
                <select
                  value={signupRole}
                  onChange={(event) => setSignupRole(event.target.value as Exclude<UserRole, "Admin">)}
                  className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3"
                >
                  {signupRoles.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block text-sm text-slate-600">
                Full name
                <input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3"
                  placeholder="Full name"
                />
              </label>
              <label className="block text-sm text-slate-600">
                Phone
                <input
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3"
                  placeholder="+9199..."
                />
              </label>
              <label className="block text-sm text-slate-600">
                Email
                <input
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3"
                  placeholder="doctor@hospital.com"
                />
              </label>
              {signupRole === "Doctor" ? (
                <>
                  <label className="block text-sm text-slate-600">
                    Specialization
                    <input
                      value={specialization}
                      onChange={(event) => setSpecialization(event.target.value)}
                      className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3"
                      placeholder="General Medicine"
                    />
                  </label>
                  <label className="block text-sm text-slate-600">
                    Department
                    <input
                      value={department}
                      onChange={(event) => setDepartment(event.target.value)}
                      className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3"
                      placeholder="Outpatient Medicine"
                    />
                  </label>
                </>
              ) : null}
              <label className="block text-sm text-slate-600">
                Password
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3"
                  placeholder="Minimum 8 characters"
                />
              </label>
              <button
                type="submit"
                className="w-full rounded-2xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white"
              >
                {auth.status === "loading" ? "Creating account..." : "Create account"}
              </button>
              {auth.error ? <p className="text-sm text-rose-600">{auth.error}</p> : null}
            </form>
          )}

          <div className="mt-8">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">
              Demo roles
            </p>
            <div className="mt-3 grid gap-3 md:grid-cols-3">
              {roles.map((role) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => dispatch(loginAsDemo(role))}
                  className="rounded-2xl border border-slate-200 px-4 py-4 text-left"
                >
                  <p className="text-sm font-semibold text-slate-900">{role}</p>
                  <p className="mt-1 text-xs text-slate-500">Open {role.toLowerCase()} workspace</p>
                </button>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

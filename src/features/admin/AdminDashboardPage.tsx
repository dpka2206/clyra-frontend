import { AppShell } from "../../app/layout/AppShell.tsx";
import { Card } from "../../components/ui/Card.tsx";
import { PageHeader } from "../../components/ui/PageHeader.tsx";

export function AdminDashboardPage() {
  return (
    <AppShell title="Admin Dashboard">
      <PageHeader
        eyebrow="Administration"
        title="Onboarding, Departments & Audit Review"
        description="This view mirrors the planned admin slice: create departments, onboard doctors/pharmacists, and review high-level audit activity."
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card title="Onboard Doctor">
          <div className="space-y-3">
            {["Name", "Phone", "Department", "Specialization"].map((field) => (
              <input
                key={field}
                placeholder={field}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm"
              />
            ))}
            <button className="w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white">
              Create Doctor
            </button>
          </div>
        </Card>

        <Card title="Manage Departments">
          <div className="space-y-3">
            <input placeholder="Department name" className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm" />
            <input placeholder="Department code" className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm" />
            <textarea
              placeholder="Description"
              rows={4}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm"
            />
            <button className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700">
              Add Department
            </button>
          </div>
        </Card>

        <Card title="Audit Snapshot">
          <div className="space-y-3 text-sm text-slate-600">
            <div className="rounded-2xl bg-slate-50 p-4">
              09:15 AM · `appointment.create` by Admin
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              09:48 AM · `consultation.finalize` by Doctor
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              10:05 AM · `pharmacy.usage.update` by Pharmacist
            </div>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}

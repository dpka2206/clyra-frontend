import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { AppShell } from "../../app/layout/AppShell.tsx";
import { Card } from "../../components/ui/Card.tsx";
import { DateRangeModal } from "../../components/ui/DateRangeModal.tsx";
import { PageHeader } from "../../components/ui/PageHeader.tsx";
import { StatusBadge } from "../../components/ui/StatusBadge.tsx";
import { selectPatient } from "../patient/patientSessionSlice.ts";
import { setDateFilter, updateAppointmentStatus } from "./doctorSlice.ts";
import { useAppDispatch, useAppSelector } from "../../lib/hooks/index.ts";

export function OPSchedulePage() {
  const dispatch = useAppDispatch();
  const { appointments, dateFilter } = useAppSelector((state) => state.doctor);
  const [search, setSearch] = useState("");
  const [isDateModalOpen, setIsDateModalOpen] = useState(false);

  const filteredAppointments = useMemo(
    () =>
      appointments.filter(
        (item) =>
          item.patientName.toLowerCase().includes(search.toLowerCase()) ||
          item.reasonForVisit.toLowerCase().includes(search.toLowerCase()),
      ),
    [appointments, search],
  );

  return (
    <AppShell title="OP Schedule">
      <PageHeader
        eyebrow="Doctor Dashboard"
        title="Today's Patients"
        description="A clean OP queue table inspired by your reference screenshot, with date filtering, quick actions, and next-patient progression."
        actions={
          <>
            <button
              type="button"
              onClick={() => setIsDateModalOpen(true)}
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700"
            >
              Select Date
            </button>
            <button
              type="button"
              onClick={() => {
                const next = appointments.find((item) => item.status === "Waiting" || item.status === "Scheduled");
                if (next) {
                  dispatch(updateAppointmentStatus({ appointmentId: next.id, status: "In-Progress" }));
                  dispatch(selectPatient(next.patientId));
                }
              }}
              className="rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white"
            >
              Load Next
            </button>
          </>
        }
      />

      <Card>
        <div className="mb-5 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <button className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700">
              {dateFilter.preset}
            </button>
            <button className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700">
              Sort: Default
            </button>
            <button className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700">
              All Filters
            </button>
          </div>
          <div className="flex items-center gap-3">
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search patient or reason"
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm md:w-80"
            />
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200">
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white text-left">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-400">
                <tr>
                  <th className="px-5 py-4">Profile</th>
                  <th className="px-5 py-4">Contact</th>
                  <th className="px-5 py-4">Visit Reason</th>
                  <th className="px-5 py-4">Slot</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4">Quick Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredAppointments.map((appointment) => (
                  <tr key={appointment.id} className="border-t border-slate-100">
                    <td className="px-5 py-4">
                      <div>
                        <p className="font-semibold text-slate-900">{appointment.patientName}</p>
                        <p className="text-sm text-slate-500">
                          Token #{appointment.tokenNumber} · {appointment.appointmentDate}
                        </p>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-600">{appointment.phone}</td>
                    <td className="px-5 py-4 text-sm text-slate-600">{appointment.reasonForVisit}</td>
                    <td className="px-5 py-4 text-sm font-medium text-slate-700">
                      {appointment.scheduledSlot}
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={appointment.status} />
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-2">
                        <Link
                          to="/doctor/patient-profile"
                          onClick={() => dispatch(selectPatient(appointment.patientId))}
                          className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700"
                        >
                          Profile
                        </Link>
                        <Link
                          to="/doctor/live-op"
                          onClick={() => {
                            dispatch(selectPatient(appointment.patientId));
                            dispatch(
                              updateAppointmentStatus({
                                appointmentId: appointment.id,
                                status: "In-Progress",
                              }),
                            );
                          }}
                          className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white"
                        >
                          Open OP
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Card>

      <DateRangeModal
        isOpen={isDateModalOpen}
        currentPreset={dateFilter.preset}
        currentStartDate={dateFilter.startDate}
        currentEndDate={dateFilter.endDate}
        onClose={() => setIsDateModalOpen(false)}
        onApply={(payload) => {
          dispatch(setDateFilter(payload));
          setIsDateModalOpen(false);
        }}
      />
    </AppShell>
  );
}

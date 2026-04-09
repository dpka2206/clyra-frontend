import { useMemo, useState } from "react";

import { AppShell } from "../../app/layout/AppShell.tsx";
import { Card } from "../../components/ui/Card.tsx";
import { PageHeader } from "../../components/ui/PageHeader.tsx";
import { updateAvailability } from "./doctorSlice.ts";
import { useAppDispatch, useAppSelector } from "../../lib/hooks/index.ts";

export function AvailabilityPage() {
  const dispatch = useAppDispatch();
  const profile = useAppSelector((state) => state.doctor.profile);
  const [duration, setDuration] = useState(profile.consultationDuration);
  const [rows, setRows] = useState(profile.availability);

  const totalHours = useMemo(
    () => rows.filter((row) => row.startTime && row.endTime).length * duration,
    [duration, rows],
  );

  return (
    <AppShell title="Doctor Availability">
      <PageHeader
        eyebrow="Doctor Profile"
        title="Working Hours & Slot Configuration"
        description="Define weekly OP timing, consultation duration, and update the schedule used by appointment booking and token assignment."
        actions={
          <button
            type="button"
            onClick={() =>
              dispatch(
                updateAvailability({
                  consultationDuration: duration,
                  availability: rows,
                }),
              )
            }
            className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white"
          >
            Save Availability
          </button>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[1.5fr_0.8fr]">
        <Card
          title="Weekly Schedule"
          subtitle="Time picker style controls per weekday as planned in the SDD."
        >
          <div className="space-y-4">
            {rows.map((row, index) => (
              <div key={row.day} className="grid gap-4 rounded-2xl border border-slate-200 p-4 md:grid-cols-[180px_1fr_1fr]">
                <div className="flex items-center font-semibold text-slate-900">{row.day}</div>
                <label className="text-sm text-slate-500">
                  From
                  <input
                    type="time"
                    value={row.startTime}
                    onChange={(event) =>
                      setRows((current) =>
                        current.map((item, itemIndex) =>
                          itemIndex === index ? { ...item, startTime: event.target.value } : item,
                        ),
                      )
                    }
                    className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3"
                  />
                </label>
                <label className="text-sm text-slate-500">
                  To
                  <input
                    type="time"
                    value={row.endTime}
                    onChange={(event) =>
                      setRows((current) =>
                        current.map((item, itemIndex) =>
                          itemIndex === index ? { ...item, endTime: event.target.value } : item,
                        ),
                      )
                    }
                    className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3"
                  />
                </label>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Consultation Settings" subtitle="Used for dynamic slot generation in backend.">
          <label className="block text-sm text-slate-500">
            Consultation duration
            <select
              value={duration}
              onChange={(event) => setDuration(Number(event.target.value))}
              className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3"
            >
              {[10, 15, 20, 30].map((value) => (
                <option key={value} value={value}>
                  {value} minutes
                </option>
              ))}
            </select>
          </label>
          <div className="mt-6 rounded-2xl bg-slate-50 p-4">
            <p className="text-sm text-slate-500">Specialization</p>
            <p className="mt-1 font-semibold text-slate-900">{profile.specialization}</p>
          </div>
          <div className="mt-4 rounded-2xl bg-slate-50 p-4">
            <p className="text-sm text-slate-500">Department</p>
            <p className="mt-1 font-semibold text-slate-900">{profile.department}</p>
          </div>
          <div className="mt-4 rounded-2xl bg-blue-50 p-4">
            <p className="text-sm text-blue-700">Estimated OP capacity</p>
            <p className="mt-1 text-2xl font-semibold text-blue-900">{totalHours} min/day block</p>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}

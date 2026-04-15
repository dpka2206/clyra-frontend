import { useEffect, useMemo, useState } from "react";

import { AppShell } from "../../app/layout/AppShell.tsx";
import { Card } from "../../components/ui/Card.tsx";
import { PageHeader } from "../../components/ui/PageHeader.tsx";
import { updateCurrentUserProfile } from "../auth/authSlice.ts";
import { apiClient } from "../../lib/api/client.ts";
import { updateAvailability } from "./doctorSlice.ts";
import { useAppDispatch, useAppSelector } from "../../lib/hooks/index.ts";

const WEEKDAY_ORDER = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"] as const;

const DEFAULT_SIGNUP_AVAILABILITY = [
  { day: "Monday", startTime: "09:00", endTime: "13:00" },
  { day: "Tuesday", startTime: "09:00", endTime: "13:00" },
  { day: "Wednesday", startTime: "09:00", endTime: "13:00" },
  { day: "Thursday", startTime: "09:00", endTime: "13:00" },
  { day: "Friday", startTime: "09:00", endTime: "13:00" },
] as const;

function buildAvailabilityRows(
  availability: Array<{ day: string; startTime: string; endTime: string }> | undefined,
) {
  const normalizedAvailability = availability?.filter((row) => row.day) ?? [];

  if (!normalizedAvailability.length) {
    return WEEKDAY_ORDER.map((day) => {
      const defaultRow = DEFAULT_SIGNUP_AVAILABILITY.find((row) => row.day === day);
      return {
        day,
        startTime: defaultRow?.startTime ?? "",
        endTime: defaultRow?.endTime ?? "",
      };
    });
  }

  return WEEKDAY_ORDER.map((day) => {
    const savedRow = normalizedAvailability.find((row) => row.day === day);
    return {
      day,
      startTime: savedRow?.startTime ?? "",
      endTime: savedRow?.endTime ?? "",
    };
  });
}

export function AvailabilityPage() {
  const dispatch = useAppDispatch();
  const profile = useAppSelector((state) => state.doctor.profile);
  const auth = useAppSelector((state) => state.auth);
  const activeProfile =
    auth.mode === "server" && auth.role === "Doctor" && auth.currentUser?.profile
      ? auth.currentUser.profile
      : profile;
  const [duration, setDuration] = useState(activeProfile?.consultationDuration ?? profile.consultationDuration);
  const [rows, setRows] = useState(buildAvailabilityRows(activeProfile?.availability ?? profile.availability));
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [showSavedToast, setShowSavedToast] = useState(false);

  useEffect(() => {
    setDuration(activeProfile?.consultationDuration ?? profile.consultationDuration);
    setRows(buildAvailabilityRows(activeProfile?.availability ?? profile.availability));
  }, [activeProfile, profile.availability, profile.consultationDuration]);

  useEffect(() => {
    if (!showSavedToast) {
      return undefined;
    }

    const timeout = window.setTimeout(() => {
      setShowSavedToast(false);
    }, 2500);

    return () => window.clearTimeout(timeout);
  }, [showSavedToast]);

  const totalHours = useMemo(
    () => rows.filter((row) => row.startTime && row.endTime).length * duration,
    [duration, rows],
  );

  async function handleSaveAvailability() {
    const sanitizedRows = rows.filter((row) => row.startTime && row.endTime);

    if (!sanitizedRows.length) {
      setFeedback("Add at least one working day before saving availability.");
      return;
    }

    if (auth.mode === "server" && auth.role === "Doctor") {
      const doctorProfileId = auth.currentUser?.profile?.id;

      if (!doctorProfileId) {
        setFeedback("Doctor profile is not available for this account.");
        return;
      }

      setIsSaving(true);
      setFeedback(null);

      try {
        const response = await apiClient.post("/doctors/availability", {
          doctorProfileId,
          consultationDuration: duration,
          availability: sanitizedRows,
        });

        const updatedDoctor = response.data.doctor as {
          _id: string;
          name: string;
          specialization: string;
          department: string;
          consultationDuration: number;
          availability: typeof rows;
        };

        dispatch(
          updateAvailability({
            consultationDuration: updatedDoctor.consultationDuration,
            availability: updatedDoctor.availability,
          }),
        );
        dispatch(
          updateCurrentUserProfile({
            id: updatedDoctor._id,
            name: updatedDoctor.name,
            specialization: updatedDoctor.specialization,
            department: updatedDoctor.department,
            consultationDuration: updatedDoctor.consultationDuration,
            availability: updatedDoctor.availability,
          }),
        );
        setFeedback(null);
        setShowSavedToast(true);
      } catch (error) {
        const maybeResponse = (error as { response?: { data?: { message?: string } } }).response;
        setFeedback(maybeResponse?.data?.message || "Unable to save availability.");
      } finally {
        setIsSaving(false);
      }

      return;
    }

    dispatch(
      updateAvailability({
        consultationDuration: duration,
        availability: sanitizedRows,
      }),
    );
    setFeedback("Availability updated in demo mode.");
  }

  return (
    <AppShell title="Doctor Availability">
      {showSavedToast ? (
        <div className="fixed right-6 top-24 z-50 rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-2xl">
          Availability saved successfully.
        </div>
      ) : null}
      <PageHeader
        eyebrow="Doctor Profile"
        title="Working Hours & Slot Configuration"
        description="Define weekly OP timing, consultation duration, and update the schedule used by appointment booking and token assignment."
        actions={
          <button
            type="button"
            onClick={() => {
              void handleSaveAvailability();
            }}
            disabled={isSaving}
            className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
          >
            {isSaving ? "Saving..." : "Save Availability"}
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
            <p className="mt-1 font-semibold text-slate-900">{activeProfile?.specialization ?? profile.specialization}</p>
          </div>
          <div className="mt-4 rounded-2xl bg-slate-50 p-4">
            <p className="text-sm text-slate-500">Department</p>
            <p className="mt-1 font-semibold text-slate-900">{activeProfile?.department ?? profile.department}</p>
          </div>
          <div className="mt-4 rounded-2xl bg-blue-50 p-4">
            <p className="text-sm text-blue-700">Estimated OP capacity</p>
            <p className="mt-1 text-2xl font-semibold text-blue-900">{totalHours} min/day block</p>
          </div>
          {feedback ? (
            <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-700">
              {feedback}
            </div>
          ) : null}
        </Card>
      </div>
    </AppShell>
  );
}

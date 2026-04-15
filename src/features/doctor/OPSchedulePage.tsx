import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { AppShell } from "../../app/layout/AppShell.tsx";
import { Card } from "../../components/ui/Card.tsx";
import { DateRangeModal } from "../../components/ui/DateRangeModal.tsx";
import { PatientAppointmentModal } from "../../components/ui/PatientAppointmentModal.tsx";
import { PageHeader } from "../../components/ui/PageHeader.tsx";
import { StatusBadge } from "../../components/ui/StatusBadge.tsx";
import { apiClient } from "../../lib/api/client.ts";
import { addPatientRecord, selectPatient } from "../patient/patientSessionSlice.ts";
import { loadDoctorWorkspace } from "./loadDoctorWorkspace.ts";
import { addAppointment, setDateFilter, updateAppointmentStatus } from "./doctorSlice.ts";
import { useAppDispatch, useAppSelector } from "../../lib/hooks/index.ts";

export function OPSchedulePage() {
  const dispatch = useAppDispatch();
  const { appointments, dateFilter, loadedFromServer } = useAppSelector((state) => state.doctor);
  const auth = useAppSelector((state) => state.auth);
  const localPatients = useAppSelector((state) => state.patientSession.patients);
  const [search, setSearch] = useState("");
  const [isDateModalOpen, setIsDateModalOpen] = useState(false);
  const [isPatientModalOpen, setIsPatientModalOpen] = useState(false);
  const [existingPatientOptions, setExistingPatientOptions] = useState<
    Array<{
      id: string;
      name: string;
      phone: string;
      email?: string;
      age: number;
      gender: string;
      bloodGroup: string;
    }>
  >([]);
  const [isSearchingExisting, setIsSearchingExisting] = useState(false);
  const [isSubmittingAppointment, setIsSubmittingAppointment] = useState(false);
  const isServerMode = auth.mode === "server" && auth.role === "Doctor";
  const isServerWorkspaceLoading = isServerMode && (!auth.currentUser?.profile?.id || !loadedFromServer);
  const visibleAppointments = isServerWorkspaceLoading ? [] : appointments;

  useEffect(() => {
    const doctorProfileId = auth.currentUser?.profile?.id;

    if (auth.mode !== "server" || auth.role !== "Doctor" || !doctorProfileId) {
      return;
    }

    const requestedDate = loadedFromServer ? dateFilter.startDate : new Date().toISOString().slice(0, 10);

    void loadDoctorWorkspace(dispatch, {
      doctorProfileId,
      date: requestedDate,
    });
  }, [auth.currentUser?.profile?.id, auth.mode, auth.role, dateFilter.startDate, dispatch, loadedFromServer]);

  const filteredAppointments = useMemo(
    () =>
      visibleAppointments.filter(
        (item) =>
          item.patientName.toLowerCase().includes(search.toLowerCase()) ||
          item.reasonForVisit.toLowerCase().includes(search.toLowerCase()),
      ),
    [search, visibleAppointments],
  );

  const defaultAppointmentDate = loadedFromServer ? dateFilter.startDate : new Date().toISOString().slice(0, 10);

  const handleSearchExistingPatients = useCallback(async (query: string) => {
    if (auth.mode === "server") {
      setIsSearchingExisting(true);

      try {
        const response = await apiClient.get("/patients", {
          params: {
            search: query || undefined,
            limit: 12,
          },
        });
        setExistingPatientOptions(response.data.patients);
      } finally {
        setIsSearchingExisting(false);
      }

      return;
    }

    const normalizedQuery = query.trim().toLowerCase();
    const matches = localPatients
      .filter((patient) => {
        if (!normalizedQuery) {
          return true;
        }

        return (
          patient.name.toLowerCase().includes(normalizedQuery) ||
          patient.phone.toLowerCase().includes(normalizedQuery)
        );
      })
      .map((patient) => ({
        id: patient.id,
        name: patient.name,
        phone: patient.phone,
        age: patient.age,
        gender: patient.gender,
        bloodGroup: patient.bloodGroup,
      }));
    setExistingPatientOptions(matches);
  }, [auth.mode, localPatients]);

  const handleSubmitPatientAppointment = useCallback(async (
    payload:
      | {
          patientMode: "existing";
          patientId: string;
          appointmentDate: string;
          reasonForVisit: string;
          preferredSlot?: string;
        }
      | {
          patientMode: "new";
          appointmentDate: string;
          reasonForVisit: string;
          preferredSlot?: string;
          patient: {
            name: string;
            phone?: string;
            email?: string;
            age?: number;
            gender?: string;
            bloodGroup?: string;
          };
        },
  ) => {
    setIsSubmittingAppointment(true);

    try {
      if (auth.mode === "server") {
        const doctorProfileId = auth.currentUser?.profile?.id;

        if (!doctorProfileId) {
          throw new Error("Doctor profile is not available in server mode.");
        }

        let patientId = payload.patientMode === "existing" ? payload.patientId : "";

        if (payload.patientMode === "new") {
          try {
            const createPatientResponse = await apiClient.post("/patients", {
              ...payload.patient,
            });
            patientId = createPatientResponse.data.patient.id;
          } catch (error: unknown) {
            const maybeResponse = (error as { response?: { status?: number; data?: { message?: string } } }).response;

            if (maybeResponse?.status === 409 && (payload.patient.phone || payload.patient.email)) {
              const lookupResponse = await apiClient.get("/patients", {
                params: {
                  search: payload.patient.phone || payload.patient.email,
                  limit: 5,
                },
              });
              const existingPatient = lookupResponse.data.patients.find(
                (item: { phone?: string; email?: string }) =>
                  item.phone === payload.patient.phone || item.email === payload.patient.email,
              );

              if (!existingPatient) {
                throw new Error(maybeResponse?.data?.message || "Patient already exists.");
              }

              patientId = existingPatient.id as string;
            } else {
              throw new Error(maybeResponse?.data?.message || "Unable to create patient.");
            }
          }
        }

        try {
          await apiClient.post("/appointments", {
            doctorProfileId,
            patientProfileId: patientId,
            appointmentDate: payload.appointmentDate,
            reasonForVisit: payload.reasonForVisit,
            preferredSlot: payload.preferredSlot || undefined,
          });
        } catch (error: unknown) {
          const maybeResponse = (error as { response?: { data?: { message?: string } } }).response;
          throw new Error(maybeResponse?.data?.message || "Unable to create appointment.");
        }

        await loadDoctorWorkspace(dispatch, {
          doctorProfileId,
          date: payload.appointmentDate,
          selectedPatientId: patientId,
        });
        dispatch(selectPatient(patientId));
        setIsPatientModalOpen(false);
        return;
      }

      let patientId = payload.patientMode === "existing" ? payload.patientId : `patient-${Date.now()}`;
      let patientName = "";
      let patientPhone = "";

      if (payload.patientMode === "new") {
        patientName = payload.patient.name;
        patientPhone = payload.patient.phone ?? payload.patient.email ?? "";

        dispatch(
          addPatientRecord({
            id: patientId,
            name: payload.patient.name,
            age: payload.patient.age ?? 0,
            gender: payload.patient.gender ?? "",
            bloodGroup: payload.patient.bloodGroup ?? "",
            phone: payload.patient.phone ?? payload.patient.email ?? "",
            fourKeySummary: {
              chronicConditions: "",
              allergies: "",
              currentMedications: "",
              vitals: "",
            },
            history: [],
          }),
        );
      } else {
        const existingPatient = localPatients.find((patient) => patient.id === payload.patientId);
        patientName = existingPatient?.name ?? "Existing Patient";
        patientPhone = existingPatient?.phone ?? "";
      }

      const nextTokenNumber =
        appointments.filter((item) => item.appointmentDate === payload.appointmentDate).reduce(
          (max, item) => Math.max(max, item.tokenNumber),
          0,
        ) + 1;

      dispatch(
        addAppointment({
          id: `appt-${Date.now()}`,
          patientId,
          patientName,
          tokenNumber: nextTokenNumber,
          appointmentDate: payload.appointmentDate,
          scheduledSlot: payload.preferredSlot ?? "",
          status: "Scheduled",
          reasonForVisit: payload.reasonForVisit,
          phone: patientPhone,
        }),
      );
      dispatch(selectPatient(patientId));
      setIsPatientModalOpen(false);
    } finally {
      setIsSubmittingAppointment(false);
    }
  }, [appointments, auth.currentUser?.profile?.id, auth.mode, dispatch, localPatients]);

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
              onClick={() => setIsPatientModalOpen(true)}
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700"
            >
              Add Patient
            </button>
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
                const next = visibleAppointments.find((item) => item.status === "Waiting" || item.status === "Scheduled");
                if (next) {
                  dispatch(updateAppointmentStatus({ appointmentId: next.id, status: "In-Progress" }));
                  dispatch(selectPatient(next.patientId));
                }
              }}
              disabled={isServerWorkspaceLoading}
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
          {isServerWorkspaceLoading ? (
            <div className="bg-white px-5 py-10 text-center text-sm text-slate-500">
              Loading doctor appointments from the server...
            </div>
          ) : null}
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
                {filteredAppointments.length ? (
                  filteredAppointments.map((appointment) => (
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
                  ))
                ) : !isServerWorkspaceLoading ? (
                  <tr className="border-t border-slate-100">
                    <td colSpan={6} className="px-5 py-10 text-center text-sm text-slate-500">
                      No appointments found for the selected date.
                    </td>
                  </tr>
                ) : null}
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
      <PatientAppointmentModal
        isOpen={isPatientModalOpen}
        defaultDate={defaultAppointmentDate}
        existingPatients={existingPatientOptions}
        isSearchingExisting={isSearchingExisting}
        isSubmitting={isSubmittingAppointment}
        onClose={() => setIsPatientModalOpen(false)}
        onSearchExisting={handleSearchExistingPatients}
        onSubmit={handleSubmitPatientAppointment}
      />
    </AppShell>
  );
}

import { useEffect, useMemo, useState } from "react";

type PatientOption = {
  id: string;
  name: string;
  phone: string;
  email?: string;
  age: number;
  gender: string;
  bloodGroup: string;
};

type PatientAppointmentModalProps = {
  isOpen: boolean;
  defaultDate: string;
  existingPatients: PatientOption[];
  isSearchingExisting: boolean;
  isSubmitting: boolean;
  onClose: () => void;
  onSearchExisting: (query: string) => void;
  onSubmit: (
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
  ) => Promise<void>;
};

export function PatientAppointmentModal({
  isOpen,
  defaultDate,
  existingPatients,
  isSearchingExisting,
  isSubmitting,
  onClose,
  onSearchExisting,
  onSubmit,
}: PatientAppointmentModalProps) {
  const [patientMode, setPatientMode] = useState<"existing" | "new">("existing");
  const [search, setSearch] = useState("");
  const [selectedPatientId, setSelectedPatientId] = useState("");
  const [appointmentDate, setAppointmentDate] = useState(defaultDate);
  const [reasonForVisit, setReasonForVisit] = useState("");
  const [preferredSlot, setPreferredSlot] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [bloodGroup, setBloodGroup] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setAppointmentDate(defaultDate);
  }, [defaultDate, isOpen]);

  useEffect(() => {
    if (!isOpen || patientMode !== "existing") {
      return;
    }

    onSearchExisting(search);
  }, [isOpen, onSearchExisting, patientMode, search]);

  const selectedPatient = useMemo(
    () => existingPatients.find((item) => item.id === selectedPatientId) ?? null,
    [existingPatients, selectedPatientId],
  );

  if (!isOpen) {
    return null;
  }

  async function handleSubmit() {
    if (!reasonForVisit.trim()) {
      setError("Visit reason is required.");
      return;
    }

    if (patientMode === "existing") {
      if (!selectedPatientId) {
        setError("Select an existing patient first.");
        return;
      }

      setError("");
      try {
        await onSubmit({
          patientMode: "existing",
          patientId: selectedPatientId,
          appointmentDate,
          reasonForVisit: reasonForVisit.trim(),
          preferredSlot: preferredSlot.trim() || undefined,
        });
      } catch (submitError) {
        setError(submitError instanceof Error ? submitError.message : "Unable to add appointment.");
      }
      return;
    }

    if (!name.trim()) {
      setError("Patient name is required.");
      return;
    }

    if (!phone.trim() && !email.trim()) {
      setError("Phone or email is required for a new patient.");
      return;
    }

    setError("");
    try {
      await onSubmit({
        patientMode: "new",
        appointmentDate,
        reasonForVisit: reasonForVisit.trim(),
        preferredSlot: preferredSlot.trim() || undefined,
        patient: {
          name: name.trim(),
          phone: phone.trim() || undefined,
          email: email.trim() || undefined,
          age: age ? Number(age) : undefined,
          gender: gender.trim() || undefined,
          bloodGroup: bloodGroup.trim() || undefined,
        },
      });
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unable to add patient and appointment.");
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/35 p-4">
      <div className="w-full max-w-4xl rounded-3xl bg-white shadow-2xl">
        <div className="border-b border-slate-100 px-6 py-5">
          <h3 className="text-xl font-semibold text-slate-900">Add Patient To OP Queue</h3>
          <p className="mt-1 text-sm text-slate-500">
            Search an existing patient or create a new one, then book the appointment into the doctor dashboard.
          </p>
        </div>

        <div className="grid gap-6 p-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-5">
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setPatientMode("existing")}
                className={`rounded-xl px-4 py-3 text-sm font-semibold ${
                  patientMode === "existing"
                    ? "bg-blue-600 text-white"
                    : "border border-slate-200 bg-white text-slate-700"
                }`}
              >
                Existing Patient
              </button>
              <button
                type="button"
                onClick={() => setPatientMode("new")}
                className={`rounded-xl px-4 py-3 text-sm font-semibold ${
                  patientMode === "new" ? "bg-blue-600 text-white" : "border border-slate-200 bg-white text-slate-700"
                }`}
              >
                New Patient
              </button>
            </div>

            {patientMode === "existing" ? (
              <div className="space-y-4 rounded-2xl border border-slate-200 p-4">
                <label className="block text-sm text-slate-600">
                  Search patients
                  <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search by name, phone, or email"
                    className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3"
                  />
                </label>
                <div className="max-h-72 space-y-3 overflow-y-auto">
                  {isSearchingExisting ? (
                    <p className="text-sm text-slate-500">Searching patients...</p>
                  ) : existingPatients.length ? (
                    existingPatients.map((patient) => (
                      <button
                        key={patient.id}
                        type="button"
                        onClick={() => setSelectedPatientId(patient.id)}
                        className={`w-full rounded-2xl border p-4 text-left ${
                          selectedPatientId === patient.id
                            ? "border-blue-500 bg-blue-50"
                            : "border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        <p className="font-semibold text-slate-900">{patient.name}</p>
                        <p className="mt-1 text-sm text-slate-500">
                          {patient.phone || "No phone"}{patient.email ? ` · ${patient.email}` : ""}
                        </p>
                        <p className="mt-1 text-xs text-slate-400">
                          {patient.gender || "Gender not set"}
                          {patient.age ? ` · ${patient.age} yrs` : ""}
                          {patient.bloodGroup ? ` · ${patient.bloodGroup}` : ""}
                        </p>
                      </button>
                    ))
                  ) : (
                    <p className="text-sm text-slate-500">No patients found for this search.</p>
                  )}
                </div>
                {selectedPatient ? (
                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
                    Selected: <span className="font-semibold">{selectedPatient.name}</span>
                  </div>
                ) : null}
              </div>
            ) : (
              <div className="grid gap-4 rounded-2xl border border-slate-200 p-4 md:grid-cols-2">
                <label className="text-sm text-slate-600">
                  Patient name
                  <input
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3"
                  />
                </label>
                <label className="text-sm text-slate-600">
                  Phone
                  <input
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                    className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3"
                  />
                </label>
                <label className="text-sm text-slate-600">
                  Email
                  <input
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3"
                  />
                </label>
                <label className="text-sm text-slate-600">
                  Age
                  <input
                    type="number"
                    min={0}
                    max={150}
                    value={age}
                    onChange={(event) => setAge(event.target.value)}
                    className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3"
                  />
                </label>
                <label className="text-sm text-slate-600">
                  Gender
                  <input
                    value={gender}
                    onChange={(event) => setGender(event.target.value)}
                    className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3"
                  />
                </label>
                <label className="text-sm text-slate-600">
                  Blood group
                  <input
                    value={bloodGroup}
                    onChange={(event) => setBloodGroup(event.target.value)}
                    className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3"
                  />
                </label>
              </div>
            )}
          </div>

          <div className="space-y-4 rounded-2xl border border-slate-200 p-4">
            <h4 className="text-lg font-semibold text-slate-900">Appointment Details</h4>
            <label className="block text-sm text-slate-600">
              Appointment date
              <input
                type="date"
                value={appointmentDate}
                onChange={(event) => setAppointmentDate(event.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3"
              />
            </label>
            <label className="block text-sm text-slate-600">
              Preferred slot
              <input
                value={preferredSlot}
                onChange={(event) => setPreferredSlot(event.target.value)}
                placeholder="09:00"
                className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3"
              />
            </label>
            <label className="block text-sm text-slate-600">
              Visit reason
              <textarea
                value={reasonForVisit}
                onChange={(event) => setReasonForVisit(event.target.value)}
                rows={5}
                className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3"
              />
            </label>

            {error ? <p className="text-sm text-rose-600">{error}</p> : null}

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => {
                  void handleSubmit();
                }}
                className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
              >
                {isSubmitting ? "Saving..." : "Add To Dashboard"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

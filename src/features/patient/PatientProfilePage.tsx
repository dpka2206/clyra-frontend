import { AppShell } from "../../app/layout/AppShell.tsx";
import { Card } from "../../components/ui/Card.tsx";
import { HistoryTimeline } from "../../components/ui/HistoryTimeline.tsx";
import { PageHeader } from "../../components/ui/PageHeader.tsx";
import { VisitSummaryModal } from "../../components/ui/VisitSummaryModal.tsx";
import { closeVisitModal, openVisitModal } from "./patientSessionSlice.ts";
import { useAppDispatch, useAppSelector } from "../../lib/hooks/index.ts";

export function PatientProfilePage() {
  const dispatch = useAppDispatch();
  const { patients, selectedPatientId, selectedVisitId } = useAppSelector((state) => state.patientSession);

  const patient = patients.find((item) => item.id === selectedPatientId) ?? patients[0];
  const selectedVisit = patient.history.find((item) => item.id === selectedVisitId) ?? null;

  return (
    <AppShell title="Patient Medical Profile">
      <PageHeader
        eyebrow="Doctor View"
        title={patient.name}
        description="High-visibility Four-Key dashboard plus a visit timeline that opens a modal for past consultation summaries and medicines."
      />

      <div className="grid gap-6 xl:grid-cols-[1.05fr_1.25fr]">
        <Card title="Four-Key Dashboard" subtitle="Clinical summary kept visible during OP consultation.">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl bg-blue-50 p-4">
              <p className="text-sm text-blue-700">Chronic Conditions</p>
              <p className="mt-2 font-semibold text-slate-900">{patient.fourKeySummary.chronicConditions}</p>
            </div>
            <div className="rounded-2xl bg-rose-50 p-4">
              <p className="text-sm text-rose-700">Allergies</p>
              <p className="mt-2 font-semibold text-slate-900">{patient.fourKeySummary.allergies}</p>
            </div>
            <div className="rounded-2xl bg-amber-50 p-4">
              <p className="text-sm text-amber-700">Current Medications</p>
              <p className="mt-2 font-semibold text-slate-900">{patient.fourKeySummary.currentMedications}</p>
            </div>
            <div className="rounded-2xl bg-emerald-50 p-4">
              <p className="text-sm text-emerald-700">Vitals</p>
              <p className="mt-2 font-semibold text-slate-900">{patient.fourKeySummary.vitals}</p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-4">
            {[
              { label: "Age", value: patient.age },
              { label: "Gender", value: patient.gender },
              { label: "Blood Group", value: patient.bloodGroup },
              { label: "Phone", value: patient.phone },
            ].map((item) => (
              <div key={item.label} className="rounded-2xl border border-slate-200 p-4">
                <p className="text-xs uppercase tracking-wide text-slate-400">{item.label}</p>
                <p className="mt-2 font-semibold text-slate-900">{item.value}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card title="History Timeline" subtitle="Click any visit to open summary + medicines in a modal.">
          <HistoryTimeline history={patient.history} onOpenVisit={(visitId) => dispatch(openVisitModal(visitId))} />
        </Card>
      </div>

      <VisitSummaryModal visit={selectedVisit} onClose={() => dispatch(closeVisitModal())} />
    </AppShell>
  );
}

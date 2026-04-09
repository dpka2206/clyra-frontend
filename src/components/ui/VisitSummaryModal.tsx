import type { VisitHistoryItem } from "../../lib/mockData.ts";

type VisitSummaryModalProps = {
  visit: VisitHistoryItem | null;
  onClose: () => void;
};

export function VisitSummaryModal({ visit, onClose }: VisitSummaryModalProps) {
  if (!visit) {
    return null;
  }

  const mockCaseSummary =
    visit.caseSummary ||
    "Mock case summary: Patient presented with mild upper respiratory symptoms, remained clinically stable during consultation, and was advised supportive care, hydration, and short-interval follow-up if symptoms worsen.";

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/35 p-4">
      <div className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-xl font-semibold text-slate-950">{visit.date}</h3>
            <p className="text-sm text-slate-500">
              {visit.department} · {visit.doctorName}
            </p>
          </div>
          <button type="button" onClick={onClose} className="text-sm font-semibold text-slate-500">
            Close
          </button>
        </div>
        <div className="mt-6 space-y-6">
          <section>
            <div className="flex items-center justify-between gap-3">
              <h4 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
                Case Summary
              </h4>
              <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                Mock frontend data
              </span>
            </div>
            <div className="mt-3 rounded-2xl border border-amber-200 bg-amber-50 p-4">
              <p className="text-sm font-medium text-slate-900">Demo case summary for UI preview</p>
              <p className="mt-2 text-sm leading-6 text-slate-700">{mockCaseSummary}</p>
            </div>
          </section>
          <section>
            <h4 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
              Transcript
            </h4>
            <div className="mt-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="whitespace-pre-wrap text-sm leading-6 text-slate-700">
                {visit.transcript || "Transcript not available for this visit."}
              </p>
            </div>
          </section>
          <section>
            <h4 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
              Prescriptions
            </h4>
            <div className="mt-3 space-y-3">
              {visit.prescriptions.map((item) => (
                <div key={item.medicineName} className="rounded-2xl border border-slate-200 p-4">
                  <p className="font-semibold text-slate-900">{item.medicineName}</p>
                  <p className="text-sm text-slate-600">
                    {item.dosage} · {item.frequency} · {item.timing}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

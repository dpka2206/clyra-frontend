import { PrescriptionEditor } from "./PrescriptionEditor.tsx";
import { TranscriptEditor } from "./TranscriptEditor.tsx";

type SummaryEditorProps = {
  transcript: string;
  summarySections: {
    presentingComplaints: string;
    clinicalFindings: string;
    assessmentAndAdvice: string;
    medicinesPrescribed: string;
  };
  prescriptions: Array<{
    medicineName: string;
    dosage: string;
    frequency: string;
    timing: string;
  }>;
  showTranscript: boolean;
  onToggleTranscript: () => void;
  onPrescriptionChange: (
    index: number,
    field: "medicineName" | "dosage" | "frequency" | "timing",
    value: string,
  ) => void;
  onAddPrescription: () => void;
};

export function SummaryEditor({
  transcript,
  summarySections,
  prescriptions,
  showTranscript,
  onToggleTranscript,
  onPrescriptionChange,
  onAddPrescription,
}: SummaryEditorProps) {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
        <div className="mb-4 flex items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Consultation Summary</h3>
            <p className="mt-1 text-sm text-slate-500">
              This summary is generated automatically from the translated transcript and is read-only.
            </p>
          </div>
          <button
            type="button"
            onClick={onToggleTranscript}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700"
          >
            {showTranscript ? "Hide Transcription" : "View Transcription"}
          </button>
        </div>

        {showTranscript ? <TranscriptEditor value={transcript} /> : null}

        <div className="grid gap-4 lg:grid-cols-2">
          {[
            ["Presenting Complaints", summarySections.presentingComplaints],
            ["Clinical Findings", summarySections.clinicalFindings],
            ["Assessment & Advice", summarySections.assessmentAndAdvice],
            ["Medicines Prescribed", summarySections.medicinesPrescribed],
          ].map(([label, value]) => (
            <section key={label} className="rounded-2xl border border-slate-200 bg-white p-4">
              <h4 className="text-sm font-semibold text-slate-900">{label}</h4>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600">
                {value || "Summary content will appear here after processing."}
              </p>
            </section>
          ))}
        </div>
      </div>

      <div>
        <PrescriptionEditor
          prescriptions={prescriptions}
          onChange={onPrescriptionChange}
          onAdd={onAddPrescription}
        />
      </div>
    </div>
  );
}

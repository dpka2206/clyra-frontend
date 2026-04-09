import { PrescriptionEditor } from "./PrescriptionEditor.tsx";
import { TranscriptEditor } from "./TranscriptEditor.tsx";

type SummaryEditorProps = {
  transcript: string;
  caseSummary: string;
  prescriptions: Array<{
    medicineName: string;
    dosage: string;
    frequency: string;
    timing: string;
  }>;
  onTranscriptChange: (value: string) => void;
  onSummaryChange: (value: string) => void;
  onPrescriptionChange: (
    index: number,
    field: "medicineName" | "dosage" | "frequency" | "timing",
    value: string,
  ) => void;
  onAddPrescription: () => void;
};

export function SummaryEditor({
  transcript,
  caseSummary,
  prescriptions,
  onTranscriptChange,
  onSummaryChange,
  onPrescriptionChange,
  onAddPrescription,
}: SummaryEditorProps) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <TranscriptEditor value={transcript} onChange={onTranscriptChange} />
      <label className="block">
        <span className="mb-2 block text-sm font-semibold text-slate-900">Case Summary</span>
        <textarea
          value={caseSummary}
          onChange={(event) => onSummaryChange(event.target.value)}
          rows={8}
          placeholder="Gemini-generated CRM summary will appear here after processing the conversation transcript."
          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none focus:border-blue-400"
        />
      </label>
      <div className="lg:col-span-2">
        <PrescriptionEditor
          prescriptions={prescriptions}
          onChange={onPrescriptionChange}
          onAdd={onAddPrescription}
        />
      </div>
    </div>
  );
}

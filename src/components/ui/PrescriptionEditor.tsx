type PrescriptionEditorProps = {
  prescriptions: Array<{
    medicineName: string;
    dosage: string;
    frequency: string;
    timing: string;
  }>;
  onChange: (
    index: number,
    field: "medicineName" | "dosage" | "frequency" | "timing",
    value: string,
  ) => void;
  onAdd: () => void;
};

export function PrescriptionEditor({ prescriptions, onChange, onAdd }: PrescriptionEditorProps) {
  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-900">Prescription Draft</h3>
        <button
          type="button"
          onClick={onAdd}
          className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700"
        >
          Add Medicine
        </button>
      </div>
      <div className="space-y-4">
        {prescriptions.map((item, index) => (
          <div key={`${item.medicineName}-${index}`} className="grid gap-3 rounded-2xl border border-slate-200 p-4 md:grid-cols-4">
            {(["medicineName", "dosage", "frequency", "timing"] as const).map((field) => (
              <label key={field} className="text-sm text-slate-500">
                {field}
                <input
                  value={item[field]}
                  onChange={(event) => onChange(index, field, event.target.value)}
                  className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700"
                />
              </label>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

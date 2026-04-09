import { useState } from "react";

const presets = [
  "Today",
  "Yesterday",
  "This week",
  "Last week",
  "This month",
  "Last month",
  "This year",
  "Last year",
  "All time",
] as const;

type DateRangeModalProps = {
  isOpen: boolean;
  currentPreset: string;
  currentStartDate: string;
  currentEndDate: string;
  onClose: () => void;
  onApply: (payload: { preset: string; startDate: string; endDate: string }) => void;
};

export function DateRangeModal({
  isOpen,
  currentPreset,
  currentStartDate,
  currentEndDate,
  onClose,
  onApply,
}: DateRangeModalProps) {
  const [preset, setPreset] = useState(currentPreset);
  const [startDate, setStartDate] = useState(currentStartDate);
  const [endDate, setEndDate] = useState(currentEndDate);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/35 p-4">
      <div className="w-full max-w-5xl rounded-3xl bg-white shadow-2xl">
        <div className="grid gap-0 md:grid-cols-[220px_1fr]">
          <aside className="border-b border-slate-100 p-6 md:border-b-0 md:border-r">
            <div className="space-y-2">
              {presets.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setPreset(item)}
                  className={`flex w-full rounded-xl px-4 py-3 text-left text-sm font-medium ${
                    preset === item ? "bg-blue-50 text-blue-700" : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </aside>
          <section className="p-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 p-5">
                <div className="mb-4 flex items-center justify-between">
                  <button type="button" className="text-xl text-slate-400">
                    {"<"}
                  </button>
                  <h3 className="text-xl font-semibold text-slate-900">Date Range</h3>
                  <button type="button" className="text-xl text-slate-400">
                    {">"}
                  </button>
                </div>
                <div className="grid grid-cols-7 gap-2 text-center text-sm text-slate-400">
                  {["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map((label) => (
                    <span key={label}>{label}</span>
                  ))}
                  {Array.from({ length: 35 }, (_, index) => (
                    <button
                      key={index}
                      type="button"
                      className={`rounded-xl px-2 py-2 text-sm ${
                        index === 10 || index === 11 ? "bg-blue-600 text-white" : "text-slate-600"
                      }`}
                    >
                      {(index % 30) + 1}
                    </button>
                  ))}
                </div>
              </div>
              <div className="rounded-2xl border border-slate-200 p-5">
                <h3 className="text-lg font-semibold text-slate-900">Custom range</h3>
                <p className="mt-2 text-sm text-slate-500">
                  Use exact dates for OP schedule filtering, weekly review, and reports.
                </p>
                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  <label className="text-sm text-slate-600">
                    Start Date
                    <input
                      type="date"
                      value={startDate}
                      onChange={(event) => setStartDate(event.target.value)}
                      className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3"
                    />
                  </label>
                  <label className="text-sm text-slate-600">
                    End Date
                    <input
                      type="date"
                      value={endDate}
                      onChange={(event) => setEndDate(event.target.value)}
                      className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3"
                    />
                  </label>
                </div>
                <div className="mt-8 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => onApply({ preset, startDate, endDate })}
                    className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white"
                  >
                    Apply
                  </button>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

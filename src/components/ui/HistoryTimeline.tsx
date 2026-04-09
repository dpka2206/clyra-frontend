import type { VisitHistoryItem } from "../../lib/mockData.ts";

type HistoryTimelineProps = {
  history: VisitHistoryItem[];
  onOpenVisit: (visitId: string) => void;
};

export function HistoryTimeline({ history, onOpenVisit }: HistoryTimelineProps) {
  return (
    <div className="space-y-4">
      {history.map((item) => (
        <button
          key={item.id}
          type="button"
          onClick={() => onOpenVisit(item.id)}
          className="flex w-full items-start gap-4 rounded-2xl border border-slate-200 p-4 text-left hover:border-blue-200 hover:bg-blue-50/30"
        >
          <div className="mt-1 h-3 w-3 rounded-full bg-blue-600" />
          <div className="w-full">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-900">{item.date}</p>
                <p className="text-sm text-slate-600">
                  {item.department} · {item.doctorName}
                </p>
              </div>
              <span className="inline-flex rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                View transcript
              </span>
            </div>
            <p className="mt-2 text-sm text-slate-500">{item.caseSummary}</p>
            <p className="mt-2 text-xs text-slate-400">
              Opens visit summary, medicines, and the full consultation transcript.
            </p>
          </div>
        </button>
      ))}
    </div>
  );
}

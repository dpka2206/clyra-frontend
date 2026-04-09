type StatusBadgeProps = {
  status: string;
};

const statusClassMap: Record<string, string> = {
  Scheduled: "bg-sky-100 text-sky-700",
  Waiting: "bg-amber-100 text-amber-700",
  "In-Progress": "bg-indigo-100 text-indigo-700",
  Completed: "bg-emerald-100 text-emerald-700",
  Cancelled: "bg-rose-100 text-rose-700",
  "No-Show": "bg-slate-200 text-slate-600",
};

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
        statusClassMap[status] ?? "bg-slate-100 text-slate-600"
      }`}
    >
      {status}
    </span>
  );
}

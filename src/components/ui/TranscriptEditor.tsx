type TranscriptEditorProps = {
  value: string;
  onChange: (value: string) => void;
};

export function TranscriptEditor({ value, onChange }: TranscriptEditorProps) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-slate-900">Transcript</span>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={8}
        placeholder="Paste the full OP transcript here once the conversation has been transcribed. Mixed English and regional-language conversation is supported."
        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none focus:border-blue-400"
      />
    </label>
  );
}

type TranscriptEditorProps = {
  value: string;
};

function collectTranscriptLines(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.flatMap((item) => collectTranscriptLines(item));
  }

  if (!value || typeof value !== "object") {
    return [];
  }

  const record = value as Record<string, unknown>;
  const transcriptText =
    (typeof record.transcript === "string" && record.transcript.trim()) ||
    (typeof record.text === "string" && record.text.trim()) ||
    (typeof record.translated_text === "string" && record.translated_text.trim()) ||
    "";

  if (transcriptText) {
    const speaker =
      (typeof record.speaker_id === "string" && record.speaker_id.trim()) ||
      (typeof record.speaker === "string" && record.speaker.trim()) ||
      "";

    return [speaker ? `${speaker}: ${transcriptText}` : transcriptText];
  }

  return Object.values(record).flatMap((item) => collectTranscriptLines(item));
}

function normalizeTranscriptForDisplay(value: string) {
  const trimmedValue = value.trim();
  if (!trimmedValue) {
    return "";
  }

  try {
    const parsed = JSON.parse(trimmedValue) as unknown;
    const extracted = collectTranscriptLines(parsed);
    return extracted.length ? extracted.join("\n") : value;
  } catch {
    return value;
  }
}

export function TranscriptEditor({ value }: TranscriptEditorProps) {
  const normalizedValue = normalizeTranscriptForDisplay(value);

  return (
    <label className="mb-4 block">
      <span className="mb-2 block text-sm font-semibold text-slate-900">Transcript</span>
      <textarea
        value={normalizedValue}
        rows={8}
        readOnly
        placeholder="Paste the full OP transcript here once the conversation has been transcribed. Mixed English and regional-language conversation is supported."
        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none focus:border-blue-400"
      />
    </label>
  );
}

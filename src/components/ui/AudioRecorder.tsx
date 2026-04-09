import { useEffect, useMemo, useState } from "react";
import { useReactMediaRecorder } from "react-media-recorder";

type AudioRecorderProps = {
  onRecordingStart?: () => void;
  onRecordingComplete?: (payload: {
    audioDownloadUrl: string;
    audioFileName: string;
    recordingSeconds: number;
    audioBlob: Blob;
  }) => void;
  savedAudioUrl?: string | null;
  savedAudioFileName?: string | null;
};

function formatDuration(seconds: number) {
  const minutes = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const remainingSeconds = (seconds % 60).toString().padStart(2, "0");
  return `${minutes}:${remainingSeconds}`;
}

export function AudioRecorder({
  onRecordingStart,
  onRecordingComplete,
  savedAudioUrl,
  savedAudioFileName,
}: AudioRecorderProps) {
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const { status, startRecording, stopRecording, mediaBlobUrl } = useReactMediaRecorder({
    audio: true,
    onStart: () => {
      setRecordingSeconds(0);
      onRecordingStart?.();
    },
    onStop: (blobUrl, blob) => {
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      onRecordingComplete?.({
        audioDownloadUrl: blobUrl,
        audioFileName: `op-conversation-${timestamp}.webm`,
        recordingSeconds,
        audioBlob: blob,
      });
    },
  });

  const isRecording = status === "recording";
  const activeAudioUrl = savedAudioUrl ?? mediaBlobUrl ?? null;
  const activeFileName = savedAudioFileName ?? "op-conversation.webm";

  useEffect(() => {
    if (!isRecording) {
      return undefined;
    }

    const interval = window.setInterval(() => {
      setRecordingSeconds((current) => current + 1);
    }, 1000);

    return () => window.clearInterval(interval);
  }, [isRecording]);

  const statusText = useMemo(() => {
    if (isRecording) {
      return "Recording active";
    }

    if (activeAudioUrl) {
      return "Recording completed";
    }

    return "Ready to start";
  }, [activeAudioUrl, isRecording]);

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-900">Full OP Conversation Recording</p>
          <p className="text-sm text-slate-500">
            Click start when the OP begins. This records the complete doctor and patient conversation
            until you stop it at the end of the consultation.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span
            className={`inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-semibold shadow-sm ${
              isRecording ? "bg-rose-100 text-rose-700" : "bg-white text-slate-500"
            }`}
          >
            <span
              className={`h-2.5 w-2.5 rounded-full ${
                isRecording ? "animate-pulse bg-rose-500" : "bg-slate-300"
              }`}
            />
            {statusText}
          </span>
          <span className="rounded-full bg-white px-3 py-2 text-xs font-semibold text-slate-600 shadow-sm">
            {formatDuration(recordingSeconds)}
          </span>
        </div>
      </div>

      <div className="mt-5 rounded-2xl border border-dashed border-slate-200 bg-white p-4">
        <p className="text-sm font-medium text-slate-900">
          Current flow
        </p>
        <p className="mt-2 text-sm text-slate-500">
          Record full OP conversation, download audio if needed, receive or paste transcript, process
          it in Gemini, review summary and prescriptions, then save the result to CRM.
        </p>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={async () => {
            await startRecording();
          }}
          disabled={isRecording}
          className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white disabled:opacity-50"
        >
          Start OP Recording
        </button>
        <button
          type="button"
          onClick={async () => {
            await stopRecording();
          }}
          disabled={!isRecording}
          className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 disabled:opacity-50"
        >
          Stop OP Recording
        </button>
        {activeAudioUrl ? (
          <a
            href={activeAudioUrl}
            download={activeFileName}
            className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700"
          >
            Download Recording
          </a>
        ) : null}
      </div>

      {activeAudioUrl ? (
        <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-900">Recorded conversation file</p>
              <p className="text-sm text-slate-500">{activeFileName}</p>
            </div>
            <p className="text-sm text-slate-500">
              Use this audio for transcription before sending the transcript to Gemini.
            </p>
          </div>
          <audio controls className="mt-4 w-full">
            <source src={activeAudioUrl} />
          </audio>
        </div>
      ) : null}

      <div className="mt-5 rounded-2xl bg-amber-50 p-4 text-sm text-amber-800">
        When recording stops, the app can now send the captured audio for transcription and then process
        the returned transcript into summary and prescription output.
      </div>
    </div>
  );
}

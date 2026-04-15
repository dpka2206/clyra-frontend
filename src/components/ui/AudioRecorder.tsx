import { useEffect, useMemo, useRef, useState } from "react";
import { useReactMediaRecorder } from "react-media-recorder";

type AudioRecorderProps = {
  onRecordingStart?: () => void;
  onRecordingComplete?: (payload: {
    audioDownloadUrl: string;
    audioFileName: string;
    recordingSeconds: number;
    audioBlob: Blob;
    mediaMimeType: string;
  }) => void;
  savedAudioUrl?: string | null;
  savedAudioFileName?: string | null;
  savedMediaMimeType?: string | null;
};

function formatDuration(seconds: number) {
  const minutes = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const remainingSeconds = (seconds % 60).toString().padStart(2, "0");
  return `${minutes}:${remainingSeconds}`;
}

function inferMediaMimeType(file: File) {
  if (file.type) {
    return file.type;
  }

  const fileName = file.name.toLowerCase();
  if (fileName.endsWith(".mp4")) {
    return "video/mp4";
  }

  if (fileName.endsWith(".mov")) {
    return "video/quicktime";
  }

  if (fileName.endsWith(".webm")) {
    return "audio/webm";
  }

  if (fileName.endsWith(".mp3")) {
    return "audio/mpeg";
  }

  if (fileName.endsWith(".wav")) {
    return "audio/wav";
  }

  return "application/octet-stream";
}

export function AudioRecorder({
  onRecordingStart,
  onRecordingComplete,
  savedAudioUrl,
  savedAudioFileName,
  savedMediaMimeType,
}: AudioRecorderProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [previewMimeType, setPreviewMimeType] = useState<string | null>(null);
  const { status, startRecording, stopRecording, mediaBlobUrl } = useReactMediaRecorder({
    audio: true,
    video: false,
    onStart: () => {
      setRecordingSeconds(0);
      setPreviewMimeType("audio/webm");
      onRecordingStart?.();
    },
    onStop: (blobUrl, blob) => {
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const mediaMimeType = blob.type || "audio/webm";
      setPreviewMimeType(mediaMimeType);
      onRecordingComplete?.({
        audioDownloadUrl: blobUrl,
        audioFileName: `op-conversation-${timestamp}.webm`,
        recordingSeconds,
        audioBlob: blob,
        mediaMimeType,
      });
    },
  });

  const isRecording = status === "recording";
  const activeAudioUrl = savedAudioUrl ?? mediaBlobUrl ?? null;
  const activeFileName = savedAudioFileName ?? "op-conversation.webm";
  const activeMediaMimeType = savedMediaMimeType ?? previewMimeType ?? "audio/webm";

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
      return "Audio recording active";
    }

    if (activeAudioUrl) {
      return "Audio ready";
    }

    return "Ready to start";
  }, [activeAudioUrl, isRecording]);

  async function handleStartRecording() {
    await startRecording();
  }

  async function handleStopRecording() {
    await stopRecording();
  }

  function handleUploadButtonClick() {
    fileInputRef.current?.click();
  }

  function handleFileSelected(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const mediaMimeType = inferMediaMimeType(file);
    setPreviewMimeType(mediaMimeType);
    setRecordingSeconds(0);
    onRecordingStart?.();
    onRecordingComplete?.({
      audioDownloadUrl: URL.createObjectURL(file),
      audioFileName: file.name,
      recordingSeconds: 0,
      audioBlob: file,
      mediaMimeType,
    });
    event.target.value = "";
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-900">Full OP Conversation Recording</p>
          <p className="text-sm text-slate-500">
            Upload an audio file or record the consultation audio directly for transcript and summary
            generation.
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
        <p className="text-sm font-medium text-slate-900">Current flow</p>
        <p className="mt-2 text-sm text-slate-500">
          Use audio upload or live recording for the consultation. When audio is ready, the app uploads
          it, runs transcription and summary generation, then lets the doctor review and save to CRM.
        </p>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={handleUploadButtonClick}
          disabled={isRecording}
          className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 disabled:opacity-50"
        >
          Upload Audio
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="audio/*,.webm,.mp3,.wav,.m4a,.ogg"
          className="hidden"
          onChange={handleFileSelected}
        />
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={handleStartRecording}
          disabled={isRecording}
          className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white disabled:opacity-50"
        >
          Start Recording
        </button>
        <button
          type="button"
          onClick={handleStopRecording}
          disabled={!isRecording}
          className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 disabled:opacity-50"
        >
          Stop Recording
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
              <p className="text-sm font-semibold text-slate-900">Selected consultation audio</p>
              <p className="text-sm text-slate-500">{activeFileName}</p>
            </div>
            <p className="text-sm text-slate-500">
              This audio is uploaded automatically for transcript and summary generation.
            </p>
          </div>
          <audio controls className="mt-4 w-full">
            <source src={activeAudioUrl} type={activeMediaMimeType} />
          </audio>
        </div>
      ) : null}

      <div className="mt-5 rounded-2xl bg-amber-50 p-4 text-sm text-amber-800">
        After recording or upload, the app will try to run transcription, summary extraction,
        prescription drafting, and doctor approval before final save.
      </div>
    </div>
  );
}

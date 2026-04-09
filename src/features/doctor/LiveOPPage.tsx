import { useMemo, useRef } from "react";

import { AppShell } from "../../app/layout/AppShell.tsx";
import { AudioRecorder } from "../../components/ui/AudioRecorder.tsx";
import { Card } from "../../components/ui/Card.tsx";
import { PageHeader } from "../../components/ui/PageHeader.tsx";
import { SummaryEditor } from "../../components/ui/SummaryEditor.tsx";
import { apiClient } from "../../lib/api/client.ts";
import { useAppDispatch, useAppSelector } from "../../lib/hooks/index.ts";
import {
  addPrescription,
  applyProcessedConversation,
  completeOpRecording,
  markConversationSaved,
  setCaseSummary,
  setManualNotes,
  setProcessingState,
  setTranscript,
  startOpRecording,
  updatePrescription,
} from "./consultationSlice.ts";

function buildDemoProcessing(transcript: string) {
  return {
    transcript,
    caseSummary:
      "Full OP conversation reviewed. Patient symptoms, clinical cues, and prescription instructions were summarized for CRM review.",
    sourceLanguages: ["English", "Regional language input supported"],
    prescriptionNarrative:
      "Prescription details may be spoken in the doctor-patient conversation and are extracted into the editable card below.",
    prescriptions: [
      {
        medicineName: "Metformin",
        dosage: "500mg",
        frequency: "Twice Daily",
        timing: "After food",
      },
      {
        medicineName: "Vitamin B12",
        dosage: "1 tab",
        frequency: "Once Daily",
        timing: "Morning",
      },
    ],
  };
}

export function LiveOPPage() {
  const dispatch = useAppDispatch();
  const patient = useAppSelector((state) =>
    state.patientSession.patients.find((item) => item.id === state.patientSession.selectedPatientId),
  );
  const consultation = useAppSelector((state) => state.consultation);
  const auth = useAppSelector((state) => state.auth);
  const summarySectionRef = useRef<HTMLDivElement | null>(null);

  const processTimeline = useMemo(
    () => [
      {
        label: "Record full OP conversation",
        status:
          consultation.opRecordingStatus === "recorded"
            ? "Done"
            : consultation.opRecordingStatus === "recording"
              ? "Recording"
              : "Pending",
      },
      {
        label: "Download audio / send for transcription",
        status: consultation.audioDownloadUrl ? "Ready" : "Pending",
      },
      {
        label: "Run transcript through Gemini",
        status:
          consultation.processStatus === "completed"
            ? "Done"
            : consultation.processStatus === "processing"
              ? "Processing"
              : "Pending",
      },
      {
        label: "Review summary + prescription card",
        status: consultation.caseSummary ? "Ready" : "Pending",
      },
      {
        label: "Save consultation into CRM",
        status: consultation.crmSaveStatus === "saved" ? "Ready" : "Pending",
      },
    ],
    [consultation],
  );

  async function handleProcessTranscript() {
    if (!consultation.transcript.trim()) {
      dispatch(
        setProcessingState({
          status: "failed",
          message:
            "Transcript is empty. Paste the full OSVI transcript or regional-language conversation transcript before processing.",
        }),
      );
      return;
    }

    dispatch(
      setProcessingState({
        status: "processing",
        message:
          "Processing the full doctor-patient conversation transcript with Gemini. Regional-language content is being normalized and prescriptions are being extracted.",
      }),
    );

    try {
      const response = await apiClient.post("/consultations/process", {
        transcript: consultation.transcript,
      });

      dispatch(applyProcessedConversation(response.data.processed));
      window.setTimeout(() => summarySectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
    } catch {
      if (auth.mode === "demo") {
        await new Promise((resolve) => window.setTimeout(resolve, 900));
        dispatch(applyProcessedConversation(buildDemoProcessing(consultation.transcript)));
        window.setTimeout(() => summarySectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
      } else {
        dispatch(
          setProcessingState({
            status: "failed",
            message: "Gemini processing failed. Please check transcript content or backend configuration.",
          }),
        );
      }
    }
  }

  async function handleRecordingComplete(payload: {
    audioDownloadUrl: string;
    audioFileName: string;
    recordingSeconds: number;
    audioBlob: Blob;
  }) {
    dispatch(completeOpRecording(payload));
    dispatch(
      setProcessingState({
        status: "processing",
        message:
          "Recording ended. Sending full OP audio for transcription, then generating conversation summary and prescription output.",
      }),
    );

    try {
      const formData = new FormData();
      formData.append("audio", payload.audioBlob, payload.audioFileName);

      const response = await apiClient.post("/consultations/process-audio", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      dispatch(applyProcessedConversation(response.data.processed));
      window.setTimeout(() => summarySectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
    } catch {
      dispatch(
        setProcessingState({
          status: "failed",
          message:
            "Automatic transcription failed. You can still download the recording and paste the transcript manually for Gemini processing.",
        }),
      );
    }
  }

  return (
    <AppShell title="Live OP Consultation">
      <PageHeader
        eyebrow="Interaction Face"
        title={`Active Consultation${patient ? ` · ${patient.name}` : ""}`}
        description="Start OP recording when the doctor and patient begin speaking. The whole conversation is recorded, downloadable, then transcribed and summarized before saving into CRM."
        actions={
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => {
                dispatch(markConversationSaved());
              }}
              className="rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white"
            >
              Save to CRM
            </button>
          </div>
        }
      />

      <div className="grid gap-6">
        <Card title="Conversation Workflow" subtitle="This is the intended full recording to CRM pipeline for the OP session.">
          <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <p className="text-sm font-semibold text-slate-900">Current process state</p>
              <p className="mt-2 text-sm text-slate-500">{consultation.processMessage}</p>
              <div className="mt-4 grid gap-3">
                {processTimeline.map((step) => (
                  <div key={step.label} className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                    <span className="text-sm font-medium text-slate-700">{step.label}</span>
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-500">
                      {step.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4">
              <p className="text-sm font-semibold text-blue-800">Regional language handling</p>
              <p className="mt-2 text-sm text-blue-700">
                The transcript-processing prompt now supports mixed English and regional languages.
                Prescription instructions spoken in Telugu, Hindi, Tamil, Kannada, Malayalam, Marathi,
                Bengali, or code-switched conversation should still be summarized into CRM-friendly output.
              </p>
            </div>
          </div>
        </Card>

        <Card title="Patient Context" subtitle="Upper section with Four-Key summary and recent history cues.">
          <div className="grid gap-4 lg:grid-cols-4">
            {[
              { label: "Conditions", value: patient?.fourKeySummary.chronicConditions },
              { label: "Allergies", value: patient?.fourKeySummary.allergies },
              { label: "Meds", value: patient?.fourKeySummary.currentMedications },
              { label: "Vitals", value: patient?.fourKeySummary.vitals },
            ].map((item) => (
              <div key={item.label} className="rounded-2xl border border-slate-200 p-4">
                <p className="text-xs uppercase tracking-wide text-slate-400">{item.label}</p>
                <p className="mt-2 text-sm font-semibold text-slate-900">{item.value}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Voice + Text Workspace" subtitle="Middle section for record, transcript review, and AI-assisted summary editing.">
          <div className="space-y-6">
            <AudioRecorder
              onRecordingStart={() => dispatch(startOpRecording())}
              onRecordingComplete={(payload) => {
                void handleRecordingComplete(payload);
              }}
              savedAudioUrl={consultation.audioDownloadUrl}
              savedAudioFileName={consultation.audioFileName}
            />
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-900">Transcript Processing</p>
                  <p className="text-sm text-slate-500">
                    Once recording stops, the app will try to transcribe and process automatically.
                    If needed, you can still paste the full transcript here and re-run Gemini processing.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    void handleProcessTranscript();
                  }}
                  className="rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white"
                >
                  Reprocess Transcript
                </button>
              </div>
            </div>
            <div ref={summarySectionRef}>
              <SummaryEditor
                transcript={consultation.transcript}
                caseSummary={consultation.caseSummary}
                prescriptions={consultation.prescriptionDrafts}
                onTranscriptChange={(value) => dispatch(setTranscript(value))}
                onSummaryChange={(value) => dispatch(setCaseSummary(value))}
                onPrescriptionChange={(index, field, value) =>
                  dispatch(updatePrescription({ index, field, value }))
                }
                onAddPrescription={() => dispatch(addPrescription())}
              />
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <p className="text-sm font-semibold text-slate-900">Prescription extraction notes</p>
              <p className="mt-2 text-sm text-slate-500">
                {consultation.prescriptionNarrative ||
                  "When the doctor speaks prescriptions during the conversation, Gemini should extract them into the prescription card above."}
              </p>
              {consultation.sourceLanguages.length ? (
                <p className="mt-3 text-sm text-slate-500">
                  Detected/handled languages: {consultation.sourceLanguages.join(", ")}
                </p>
              ) : null}
            </div>
          </div>
        </Card>

        <Card title="Manual Correction Notes" subtitle="Bottom section for direct text corrections over AI output.">
          <textarea
            value={consultation.manualNotes}
            onChange={(event) => dispatch(setManualNotes(event.target.value))}
            rows={6}
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700"
          />
        </Card>
      </div>
    </AppShell>
  );
}

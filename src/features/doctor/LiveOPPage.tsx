import { useEffect, useRef } from "react";

import { AppShell } from "../../app/layout/AppShell.tsx";
import { AudioRecorder } from "../../components/ui/AudioRecorder.tsx";
import { Card } from "../../components/ui/Card.tsx";
import { PageHeader } from "../../components/ui/PageHeader.tsx";
import { SummaryEditor } from "../../components/ui/SummaryEditor.tsx";
import { apiClient } from "../../lib/api/client.ts";
import { useAppDispatch, useAppSelector } from "../../lib/hooks/index.ts";
import { downloadPharmacistCopy } from "./downloadPharmacistCopy.ts";
import { loadDoctorWorkspace } from "./loadDoctorWorkspace.ts";
import {
  addPrescription,
  applyProcessedConversation,
  completeOpRecording,
  markConversationSaved,
  setConsultationJob,
  setManualNotes,
  setProcessingState,
  setTranscriptVisibility,
  startOpRecording,
  updatePrescription,
} from "./consultationSlice.ts";

export function LiveOPPage() {
  const dispatch = useAppDispatch();
  const patient = useAppSelector((state) =>
    state.patientSession.patients.find((item) => item.id === state.patientSession.selectedPatientId),
  );
  const doctorProfile = useAppSelector((state) => state.doctor.profile);
  const currentAppointment = useAppSelector((state) =>
    state.doctor.appointments.find(
      (item) =>
        item.patientId === state.patientSession.selectedPatientId &&
        ["Waiting", "In-Progress", "Scheduled"].includes(item.status),
    ),
  );
  const consultation = useAppSelector((state) => state.consultation);
  const auth = useAppSelector((state) => state.auth);
  const summarySectionRef = useRef<HTMLDivElement | null>(null);
  const activeDoctorProfileId = auth.currentUser?.profile?.id ?? doctorProfile.id;
  const activeDoctorName = auth.currentUser?.profile?.name ?? doctorProfile.name;
  const activeDoctorDepartment = auth.currentUser?.profile?.department ?? doctorProfile.department;

  useEffect(() => {
    if (auth.mode !== "server" || auth.role !== "Doctor" || !activeDoctorProfileId) {
      return;
    }

    void loadDoctorWorkspace(dispatch, {
      doctorProfileId: activeDoctorProfileId,
      selectedPatientId: patient?.id,
    });
  }, [activeDoctorProfileId, auth.mode, auth.role, dispatch, patient?.id]);

  useEffect(() => {
    if (!consultation.jobId || consultation.crmSaveStatus === "saved") {
      return;
    }

    if (consultation.processStatus !== "processing") {
      return;
    }

    const describeStatus = (status: string) => {
      switch (status) {
        case "AUDIO_READY":
          return "Audio uploaded successfully. Preparing AI processing.";
        case "TRANSCRIBING":
          return "Sarvam AI is converting the Telugu consultation into English transcript.";
        case "TRANSCRIPT_READY":
          return "Transcript is ready. Generating structured consultation summary with Gemini.";
        case "SUMMARIZING":
          return "Gemini is generating the clinical summary and extracting medicines.";
        default:
          return consultation.processMessage;
      }
    };

    const pollJob = async () => {
      try {
        const response = await apiClient.get(`/consultations/jobs/${consultation.jobId}`);
        const job = response.data.job;

        if (job.status === "COMPLETED" || job.status === "APPROVED") {
          dispatch(
            applyProcessedConversation({
              jobId: job.jobId,
              transcript: job.normalizedTranscript || job.rawTranscript || "",
              caseSummary: job.caseSummary || "",
              summarySections: {
                presentingComplaints: job.summarySections?.presentingComplaints || "",
                clinicalFindings: job.summarySections?.clinicalFindings || "",
                assessmentAndAdvice: job.summarySections?.assessmentAndAdvice || "",
                medicinesPrescribed: job.summarySections?.medicinesPrescribed || "",
              },
              sourceLanguages: job.sourceLanguages ?? [],
              prescriptionNarrative: job.prescriptionNarrative ?? "",
              prescriptions: job.prescriptions ?? [],
            }),
          );
          if (job.status === "APPROVED") {
            dispatch(markConversationSaved());
          }
          window.setTimeout(() => summarySectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
          return;
        }

        if (job.status === "FAILED") {
          dispatch(
            setProcessingState({
              status: "failed",
              message: job.errorMessage || "Consultation processing failed. Please retry the recording.",
            }),
          );
          return;
        }

        dispatch(
          setProcessingState({
            status: "processing",
            message: describeStatus(job.status),
          }),
        );
      } catch {
        dispatch(
          setProcessingState({
            status: "failed",
            message: "Unable to fetch consultation processing status from the server.",
          }),
        );
      }
    };

    void pollJob();
    const interval = window.setInterval(() => {
      void pollJob();
    }, 2500);

    return () => {
      window.clearInterval(interval);
    };
  }, [
    consultation.crmSaveStatus,
    consultation.jobId,
    consultation.processMessage,
    consultation.processStatus,
    dispatch,
  ]);

  async function handleRecordingComplete(payload: {
    audioDownloadUrl: string;
    audioFileName: string;
    recordingSeconds: number;
    audioBlob: Blob;
    mediaMimeType: string;
  }) {
    dispatch(
      completeOpRecording({
        audioDownloadUrl: payload.audioDownloadUrl,
        audioFileName: payload.audioFileName,
        mediaMimeType: payload.mediaMimeType,
        recordingSeconds: payload.recordingSeconds,
      }),
    );
    dispatch(
      setProcessingState({
        status: "processing",
        message: "Creating consultation job and uploading consultation audio for AI processing.",
      }),
    );

    try {
      const jobResponse = await apiClient.post("/consultations/jobs", {
        appointmentId: currentAppointment?.id,
        doctorProfileId: activeDoctorProfileId,
        patientProfileId: patient?.id,
        patientName: patient?.name,
        doctorName: activeDoctorName,
        department: activeDoctorDepartment,
      });
      const jobId = jobResponse.data.job.jobId as string;
      dispatch(setConsultationJob(jobId));

      const formData = new FormData();
      formData.append("audio", payload.audioBlob, payload.audioFileName);

      await apiClient.post(`/consultations/jobs/${jobId}/audio`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      dispatch(
        setProcessingState({
          status: "processing",
          message: "Consultation audio uploaded. Automatic transcript and summary generation has started.",
        }),
      );
    } catch {
      dispatch(
        setProcessingState({
          status: "failed",
          message: "Automatic consultation processing failed. Please retry the recording or audio upload.",
        }),
      );
    }
  }

  async function handleApproveAndSave() {
    if (!consultation.jobId) {
      dispatch(
        setProcessingState({
          status: "failed",
          message: "No consultation job is available to approve yet.",
        }),
      );
      return;
    }

    if (!currentAppointment?.id || !patient?.id || !activeDoctorProfileId) {
      dispatch(
        setProcessingState({
          status: "failed",
          message: "Select a valid OP appointment before saving this consultation to CRM.",
        }),
      );
      return;
    }

    dispatch(
      setProcessingState({
        status: "processing",
        message: "Saving the doctor-approved consultation into the database.",
      }),
    );

    try {
      const response = await apiClient.post(`/consultations/jobs/${consultation.jobId}/approve`, {
        approvalMode: "button",
        prescriptions: consultation.prescriptionDrafts.filter((item) => item.medicineName.trim()),
        manualNotes: consultation.manualNotes,
      });

      if (response.data.persistedToMedicalHistory) {
        dispatch(markConversationSaved());
        await loadDoctorWorkspace(dispatch, {
          doctorProfileId: activeDoctorProfileId,
          selectedPatientId: patient.id,
        });
        downloadPharmacistCopy({
          patient,
          appointment: currentAppointment,
          doctor: {
            name: activeDoctorName,
            department: activeDoctorDepartment,
          },
          summarySections: consultation.summarySections,
          prescriptions: consultation.prescriptionDrafts.filter((item) => item.medicineName.trim()),
        });
        return;
      }

      dispatch(
        setProcessingState({
          status: "failed",
          message: "Consultation approval was accepted, but the OP was not finalized in medical history.",
        }),
      );
    } catch (error) {
      const message =
        (error as { response?: { data?: { message?: string } } }).response?.data?.message ||
        "Doctor approval could not be saved. Please try again.";

      dispatch(
        setProcessingState({
          status: "failed",
          message,
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
                void handleApproveAndSave();
              }}
              disabled={consultation.processStatus !== "completed" && consultation.crmSaveStatus !== "saved"}
              className="rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white"
            >
              {consultation.crmSaveStatus === "saved" ? "Saved to CRM" : "Save to CRM"}
            </button>
          </div>
        }
      />

      <div className="grid gap-6">
        <Card
          title="Patient Case History"
          subtitle="Quick patient context to review before starting or summarizing the consultation."
        >
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

        <Card
          title="Consultation Recording & Summary"
          subtitle="Record the OP conversation, review the transcript, and generate a clean clinical summary."
        >
          <div className="space-y-6">
            <AudioRecorder
              onRecordingStart={() => dispatch(startOpRecording())}
              onRecordingComplete={(payload) => {
                void handleRecordingComplete(payload);
              }}
              savedAudioUrl={consultation.audioDownloadUrl}
              savedAudioFileName={consultation.audioFileName}
              savedMediaMimeType={consultation.mediaMimeType}
            />
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-900">Automatic AI Processing</p>
                  <p className="text-sm text-slate-500">
                    {consultation.processMessage}
                  </p>
                </div>
              </div>
            </div>
            <div ref={summarySectionRef}>
              <SummaryEditor
                transcript={consultation.transcript}
                summarySections={consultation.summarySections}
                prescriptions={consultation.prescriptionDrafts}
                showTranscript={consultation.showTranscript}
                onToggleTranscript={() => dispatch(setTranscriptVisibility(!consultation.showTranscript))}
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
          <div className="mt-4 flex justify-end">
            <button
              type="button"
              onClick={() => {
                void handleApproveAndSave();
              }}
              disabled={consultation.processStatus !== "completed" && consultation.crmSaveStatus !== "saved"}
              className="rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white"
            >
              {consultation.crmSaveStatus === "saved" ? "Saved to CRM" : "Save to CRM"}
            </button>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}

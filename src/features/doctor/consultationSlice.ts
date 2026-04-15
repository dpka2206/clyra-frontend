import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

type PrescriptionDraft = {
  medicineName: string;
  dosage: string;
  frequency: string;
  timing: string;
};

type SummarySections = {
  presentingComplaints: string;
  clinicalFindings: string;
  assessmentAndAdvice: string;
  medicinesPrescribed: string;
};

type ConsultationState = {
  jobId: string | null;
  opRecordingStatus: "idle" | "recording" | "recorded";
  recordingSeconds: number;
  audioDownloadUrl: string | null;
  audioFileName: string | null;
  mediaMimeType: string | null;
  processStatus: "idle" | "processing" | "completed" | "failed";
  processMessage: string;
  transcript: string;
  caseSummary: string;
  summarySections: SummarySections;
  sourceLanguages: string[];
  prescriptionNarrative: string;
  prescriptionDrafts: PrescriptionDraft[];
  manualNotes: string;
  crmSaveStatus: "idle" | "saved";
  showTranscript: boolean;
};

const initialState: ConsultationState = {
  jobId: null,
  opRecordingStatus: "idle",
  recordingSeconds: 0,
  audioDownloadUrl: null,
  audioFileName: null,
  mediaMimeType: null,
  processStatus: "idle",
  processMessage:
    "Start recording when the consultation begins. When you stop recording, the app will automatically upload the audio, generate the transcript, prepare the structured summary, and wait for doctor approval.",
  transcript: "",
  caseSummary: "",
  summarySections: {
    presentingComplaints: "",
    clinicalFindings: "",
    assessmentAndAdvice: "",
    medicinesPrescribed: "",
  },
  sourceLanguages: [],
  prescriptionNarrative: "",
  prescriptionDrafts: [],
  manualNotes:
    "Use this section for doctor corrections, regional-language clarifications, or extra CRM notes before final save.",
  crmSaveStatus: "idle",
  showTranscript: false,
};

type ProcessedConversationPayload = {
  jobId?: string | null;
  transcript: string;
  caseSummary: string;
  summarySections?: SummarySections;
  sourceLanguages?: string[];
  prescriptionNarrative?: string;
  prescriptions: PrescriptionDraft[];
};

const consultationSlice = createSlice({
  name: "consultation",
  initialState,
  reducers: {
    startOpRecording(state) {
      state.jobId = null;
      state.opRecordingStatus = "recording";
      state.recordingSeconds = 0;
      state.audioDownloadUrl = null;
      state.audioFileName = null;
      state.mediaMimeType = null;
      state.processStatus = "idle";
      state.transcript = "";
      state.caseSummary = "";
      state.summarySections = {
        presentingComplaints: "",
        clinicalFindings: "",
        assessmentAndAdvice: "",
        medicinesPrescribed: "",
      };
      state.sourceLanguages = [];
      state.prescriptionNarrative = "";
      state.prescriptionDrafts = [];
      state.processMessage =
        "Recording the full doctor and patient conversation. Continue until the OP discussion is complete.";
      state.crmSaveStatus = "idle";
      state.showTranscript = false;
    },
    tickRecording(state) {
      if (state.opRecordingStatus === "recording") {
        state.recordingSeconds += 1;
      }
    },
    completeOpRecording(
      state,
      action: PayloadAction<{
        audioDownloadUrl: string;
        audioFileName: string;
        mediaMimeType: string;
        recordingSeconds: number;
      }>,
    ) {
      state.opRecordingStatus = "recorded";
      state.audioDownloadUrl = action.payload.audioDownloadUrl;
      state.audioFileName = action.payload.audioFileName;
      state.mediaMimeType = action.payload.mediaMimeType;
      state.recordingSeconds = action.payload.recordingSeconds;
      state.processStatus = "idle";
      state.processMessage =
        "Recording complete. Media upload and AI processing will begin automatically.";
    },
    setConsultationJob(state, action: PayloadAction<string>) {
      state.jobId = action.payload;
    },
    setProcessingState(
      state,
      action: PayloadAction<{ status: ConsultationState["processStatus"]; message: string }>,
    ) {
      state.processStatus = action.payload.status;
      state.processMessage = action.payload.message;
    },
    applyProcessedConversation(state, action: PayloadAction<ProcessedConversationPayload>) {
      state.jobId = action.payload.jobId ?? state.jobId;
      state.transcript = action.payload.transcript;
      state.caseSummary = action.payload.caseSummary;
      state.summarySections = action.payload.summarySections ?? state.summarySections;
      state.sourceLanguages = action.payload.sourceLanguages ?? [];
      state.prescriptionNarrative = action.payload.prescriptionNarrative ?? "";
      state.prescriptionDrafts = action.payload.prescriptions;
      state.processStatus = "completed";
      state.processMessage =
        "Transcript, summary, and medicine extraction are ready for doctor review.";
    },
    setManualNotes(state, action: PayloadAction<string>) {
      state.manualNotes = action.payload;
    },
    setTranscriptVisibility(state, action: PayloadAction<boolean>) {
      state.showTranscript = action.payload;
    },
    updatePrescription(
      state,
      action: PayloadAction<{ index: number; field: keyof PrescriptionDraft; value: string }>,
    ) {
      const item = state.prescriptionDrafts[action.payload.index];
      if (item) {
        item[action.payload.field] = action.payload.value;
      }
    },
    addPrescription(state) {
      state.prescriptionDrafts.push({
        medicineName: "",
        dosage: "",
        frequency: "",
        timing: "",
      });
    },
    markConversationSaved(state) {
      state.crmSaveStatus = "saved";
      state.processMessage = "Consultation approved and saved to the database.";
    },
  },
});

export const {
  startOpRecording,
  tickRecording,
  completeOpRecording,
  setConsultationJob,
  setProcessingState,
  applyProcessedConversation,
  setManualNotes,
  setTranscriptVisibility,
  updatePrescription,
  addPrescription,
  markConversationSaved,
} = consultationSlice.actions;
export const consultationReducer = consultationSlice.reducer;

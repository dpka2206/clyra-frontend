import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

type PrescriptionDraft = {
  medicineName: string;
  dosage: string;
  frequency: string;
  timing: string;
};

type ConsultationState = {
  opRecordingStatus: "idle" | "recording" | "recorded";
  recordingSeconds: number;
  audioDownloadUrl: string | null;
  audioFileName: string | null;
  processStatus: "idle" | "processing" | "completed" | "failed";
  processMessage: string;
  transcript: string;
  caseSummary: string;
  sourceLanguages: string[];
  prescriptionNarrative: string;
  prescriptionDrafts: PrescriptionDraft[];
  manualNotes: string;
  crmSaveStatus: "idle" | "saved";
};

const initialState: ConsultationState = {
  opRecordingStatus: "idle",
  recordingSeconds: 0,
  audioDownloadUrl: null,
  audioFileName: null,
  processStatus: "idle",
  processMessage:
    "Start OP recording when the doctor and patient begin talking. Once transcription is available, process it with Gemini and save the transcript/summary to CRM.",
  transcript: "",
  caseSummary: "",
  sourceLanguages: [],
  prescriptionNarrative: "",
  prescriptionDrafts: [],
  manualNotes:
    "Use this section for doctor corrections, regional-language clarifications, or extra CRM notes before final save.",
  crmSaveStatus: "idle",
};

type ProcessedConversationPayload = {
  transcript: string;
  caseSummary: string;
  sourceLanguages?: string[];
  prescriptionNarrative?: string;
  prescriptions: PrescriptionDraft[];
};

const consultationSlice = createSlice({
  name: "consultation",
  initialState,
  reducers: {
    startOpRecording(state) {
      state.opRecordingStatus = "recording";
      state.recordingSeconds = 0;
      state.processStatus = "idle";
      state.processMessage =
        "Recording the full doctor and patient conversation. Continue until the OP discussion is complete.";
      state.crmSaveStatus = "idle";
    },
    tickRecording(state) {
      if (state.opRecordingStatus === "recording") {
        state.recordingSeconds += 1;
      }
    },
    completeOpRecording(
      state,
      action: PayloadAction<{ audioDownloadUrl: string; audioFileName: string; recordingSeconds: number }>,
    ) {
      state.opRecordingStatus = "recorded";
      state.audioDownloadUrl = action.payload.audioDownloadUrl;
      state.audioFileName = action.payload.audioFileName;
      state.recordingSeconds = action.payload.recordingSeconds;
      state.processStatus = "idle";
      state.processMessage =
        "Recording complete. Download the audio if needed, then paste or receive the transcript and process it with Gemini.";
    },
    setProcessingState(
      state,
      action: PayloadAction<{ status: ConsultationState["processStatus"]; message: string }>,
    ) {
      state.processStatus = action.payload.status;
      state.processMessage = action.payload.message;
    },
    applyProcessedConversation(state, action: PayloadAction<ProcessedConversationPayload>) {
      state.transcript = action.payload.transcript;
      state.caseSummary = action.payload.caseSummary;
      state.sourceLanguages = action.payload.sourceLanguages ?? [];
      state.prescriptionNarrative = action.payload.prescriptionNarrative ?? "";
      state.prescriptionDrafts = action.payload.prescriptions;
      state.processStatus = "completed";
      state.processMessage =
        "Gemini processed the conversation transcript. Review summary and prescription details before saving to CRM.";
    },
    setTranscript(state, action: PayloadAction<string>) {
      state.transcript = action.payload;
    },
    setCaseSummary(state, action: PayloadAction<string>) {
      state.caseSummary = action.payload;
    },
    setManualNotes(state, action: PayloadAction<string>) {
      state.manualNotes = action.payload;
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
      state.processMessage = "Conversation transcript, summary, and prescription draft are ready to be saved in CRM.";
    },
  },
});

export const {
  startOpRecording,
  tickRecording,
  completeOpRecording,
  setProcessingState,
  applyProcessedConversation,
  setTranscript,
  setCaseSummary,
  setManualNotes,
  updatePrescription,
  addPrescription,
  markConversationSaved,
} = consultationSlice.actions;
export const consultationReducer = consultationSlice.reducer;

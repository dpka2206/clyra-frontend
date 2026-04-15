import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

import { patients, type PatientRecord } from "../../lib/mockData.ts";

type PatientSessionState = {
  patients: typeof patients;
  selectedPatientId: string;
  selectedVisitId: string | null;
};

const initialState: PatientSessionState = {
  patients,
  selectedPatientId: patients[0].id,
  selectedVisitId: null,
};

const patientSessionSlice = createSlice({
  name: "patientSession",
  initialState,
  reducers: {
    selectPatient(state, action: PayloadAction<string>) {
      state.selectedPatientId = action.payload;
      state.selectedVisitId = null;
    },
    hydratePatientWorkspace(
      state,
      action: PayloadAction<{
        patients: PatientRecord[];
        selectedPatientId?: string;
      }>,
    ) {
      state.patients = action.payload.patients;
      const nextSelectedPatientId =
        action.payload.selectedPatientId ?? action.payload.patients[0]?.id ?? state.selectedPatientId;
      state.selectedPatientId = nextSelectedPatientId;
      state.selectedVisitId = null;
    },
    addPatientRecord(state, action: PayloadAction<PatientRecord>) {
      state.patients.unshift(action.payload);
      state.selectedPatientId = action.payload.id;
      state.selectedVisitId = null;
    },
    openVisitModal(state, action: PayloadAction<string>) {
      state.selectedVisitId = action.payload;
    },
    closeVisitModal(state) {
      state.selectedVisitId = null;
    },
    updateFourKeySummary(
      state,
      action: PayloadAction<{
        chronicConditions: string;
        allergies: string;
        currentMedications: string;
        vitals: string;
      }>,
    ) {
      const patient = state.patients.find((item) => item.id === state.selectedPatientId);
      if (patient) {
        patient.fourKeySummary = action.payload;
      }
    },
  },
});

export const {
  selectPatient,
  hydratePatientWorkspace,
  addPatientRecord,
  openVisitModal,
  closeVisitModal,
  updateFourKeySummary,
} = patientSessionSlice.actions;
export const patientSessionReducer = patientSessionSlice.reducer;

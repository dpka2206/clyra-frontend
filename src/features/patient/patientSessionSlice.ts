import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

import { patients } from "../../lib/mockData.ts";

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

export const { selectPatient, openVisitModal, closeVisitModal, updateFourKeySummary } =
  patientSessionSlice.actions;
export const patientSessionReducer = patientSessionSlice.reducer;

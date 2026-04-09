import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

import { pharmacyQueue } from "../../lib/mockData.ts";

type PharmacyState = {
  searchToken: string;
  searchDate: string;
  usageInstructions: string;
  queue: typeof pharmacyQueue;
  selectedMedicalHistoryId: string;
};

const initialState: PharmacyState = {
  searchToken: "1",
  searchDate: "2026-04-09",
  usageInstructions: "Take after meals with water.",
  queue: pharmacyQueue,
  selectedMedicalHistoryId: pharmacyQueue[0].medicalHistoryId,
};

const pharmacySlice = createSlice({
  name: "pharmacy",
  initialState,
  reducers: {
    setSearchToken(state, action: PayloadAction<string>) {
      state.searchToken = action.payload;
    },
    setSearchDate(state, action: PayloadAction<string>) {
      state.searchDate = action.payload;
    },
    setUsageInstructions(state, action: PayloadAction<string>) {
      state.usageInstructions = action.payload;
    },
    selectPrescription(state, action: PayloadAction<string>) {
      state.selectedMedicalHistoryId = action.payload;
    },
  },
});

export const { setSearchToken, setSearchDate, setUsageInstructions, selectPrescription } =
  pharmacySlice.actions;
export const pharmacyReducer = pharmacySlice.reducer;

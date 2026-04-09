import { configureStore } from "@reduxjs/toolkit";

import { authReducer } from "../features/auth/authSlice.ts";
import { consultationReducer } from "../features/doctor/consultationSlice.ts";
import { doctorReducer } from "../features/doctor/doctorSlice.ts";
import { patientSessionReducer } from "../features/patient/patientSessionSlice.ts";
import { pharmacyReducer } from "../features/pharmacy/pharmacySlice.ts";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    consultation: consultationReducer,
    doctor: doctorReducer,
    patientSession: patientSessionReducer,
    pharmacy: pharmacyReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

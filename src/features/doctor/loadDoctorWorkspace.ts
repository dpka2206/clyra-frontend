import type { AppDispatch } from "../../app/store.ts";
import { apiClient } from "../../lib/api/client.ts";
import { hydratePatientWorkspace } from "../patient/patientSessionSlice.ts";
import { hydrateDoctorWorkspace } from "./doctorSlice.ts";

export async function loadDoctorWorkspace(
  dispatch: AppDispatch,
  input: {
    doctorProfileId: string;
    date?: string;
    selectedPatientId?: string;
  },
) {
  const response = await apiClient.get("/consultations/live-op-context", {
    params: {
      doctorProfileId: input.doctorProfileId,
      date: input.date,
    },
  });

  dispatch(
    hydrateDoctorWorkspace({
      profile: response.data.doctorProfile,
      appointments: response.data.appointments,
      date: response.data.date,
    }),
  );

  dispatch(
    hydratePatientWorkspace({
      patients: response.data.patients,
      selectedPatientId: input.selectedPatientId,
    }),
  );
}

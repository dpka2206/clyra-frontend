import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

import { doctorProfile, todayAppointments, type AppointmentItem } from "../../lib/mockData.ts";

type DateFilter = {
  preset: string;
  startDate: string;
  endDate: string;
};

type DoctorState = {
  profile: typeof doctorProfile;
  appointments: AppointmentItem[];
  dateFilter: DateFilter;
  loadedFromServer: boolean;
};

const initialState: DoctorState = {
  profile: doctorProfile,
  appointments: todayAppointments,
  dateFilter: {
    preset: "Today",
    startDate: "2026-04-09",
    endDate: "2026-04-09",
  },
  loadedFromServer: false,
};

const doctorSlice = createSlice({
  name: "doctor",
  initialState,
  reducers: {
    updateAvailability(
      state,
      action: PayloadAction<{
        consultationDuration: number;
        availability: typeof doctorProfile.availability;
      }>,
    ) {
      state.profile.consultationDuration = action.payload.consultationDuration;
      state.profile.availability = action.payload.availability;
    },
    setDateFilter(state, action: PayloadAction<DateFilter>) {
      state.dateFilter = action.payload;
    },
    hydrateDoctorWorkspace(
      state,
      action: PayloadAction<{
        profile: typeof doctorProfile;
        appointments: AppointmentItem[];
        date: string;
      }>,
    ) {
      state.profile = action.payload.profile;
      state.appointments = action.payload.appointments;
      state.dateFilter = {
        preset: "Today",
        startDate: action.payload.date,
        endDate: action.payload.date,
      };
      state.loadedFromServer = true;
    },
    addAppointment(state, action: PayloadAction<AppointmentItem>) {
      state.appointments.unshift(action.payload);
    },
    updateAppointmentStatus(
      state,
      action: PayloadAction<{ appointmentId: string; status: AppointmentItem["status"] }>,
    ) {
      const appointment = state.appointments.find((item) => item.id === action.payload.appointmentId);
      if (appointment) {
        appointment.status = action.payload.status;
      }
    },
  },
});

export const { updateAvailability, setDateFilter, hydrateDoctorWorkspace, addAppointment, updateAppointmentStatus } =
  doctorSlice.actions;
export const doctorReducer = doctorSlice.reducer;

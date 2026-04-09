export type AppointmentItem = {
  id: string;
  patientId: string;
  patientName: string;
  tokenNumber: number;
  appointmentDate: string;
  scheduledSlot: string;
  status: "Scheduled" | "Waiting" | "In-Progress" | "Completed" | "Cancelled" | "No-Show";
  reasonForVisit: string;
  phone: string;
};

export type VisitHistoryItem = {
  id: string;
  date: string;
  doctorName: string;
  department: string;
  caseSummary: string;
  transcript: string;
  prescriptions: Array<{
    medicineName: string;
    dosage: string;
    frequency: string;
    timing: string;
    usageInstructions?: string;
  }>;
};

export type PatientRecord = {
  id: string;
  name: string;
  age: number;
  gender: string;
  bloodGroup: string;
  phone: string;
  fourKeySummary: {
    chronicConditions: string;
    allergies: string;
    currentMedications: string;
    vitals: string;
  };
  history: VisitHistoryItem[];
};

export const doctorProfile = {
  id: "doctor-1",
  name: "Dr. Sonika Chowdary",
  specialization: "General Medicine",
  department: "Outpatient Medicine",
  consultationDuration: 15,
  availability: [
    { day: "Monday", startTime: "09:00", endTime: "13:00" },
    { day: "Tuesday", startTime: "09:00", endTime: "13:00" },
    { day: "Wednesday", startTime: "10:00", endTime: "14:00" },
    { day: "Thursday", startTime: "09:00", endTime: "13:00" },
    { day: "Friday", startTime: "09:00", endTime: "12:00" },
  ],
};

export const patients: PatientRecord[] = [
  {
    id: "patient-1",
    name: "Harsha Reddy",
    age: 34,
    gender: "Male",
    bloodGroup: "B+",
    phone: "+91 9876501234",
    fourKeySummary: {
      chronicConditions: "Type 2 diabetes for 5 years",
      allergies: "Penicillin",
      currentMedications: "Metformin 500mg twice daily",
      vitals: "BP 130/85, HR 80 bpm, Temp 98.4F",
    },
    history: [
      {
        id: "visit-1",
        date: "2026-04-07",
        doctorName: "Dr. Sonika Chowdary",
        department: "Outpatient Medicine",
        caseSummary:
          "Patient attended diabetes follow-up with reports of post-meal glucose fluctuation, evening fatigue, and occasional missed doses. Counseled on medication adherence and diet control, continued Metformin 500mg twice daily after food, and advised repeat fasting sugar testing before the next review.",
        transcript:
          "Doctor: How have your sugar readings been over the last week?\nPatient: Mostly around 150 to 170 after meals, and I feel tired in the evenings.\nDoctor: Any dizziness, excessive thirst, or missed doses of metformin?\nPatient: I missed two evening doses last week and I have been more thirsty than usual.\nDoctor: Continue Metformin 500mg twice daily after food, improve diet control, and repeat a fasting sugar test before the next review.",
        prescriptions: [
          {
            medicineName: "Metformin",
            dosage: "500mg",
            frequency: "Twice Daily",
            timing: "After food",
          },
        ],
      },
      {
        id: "visit-2",
        date: "2026-03-15",
        doctorName: "Dr. Sonika Chowdary",
        department: "Outpatient Medicine",
        caseSummary:
          "Patient presented with gastritis symptoms including epigastric burning, fatigue, and reduced appetite without alarm signs. Started short-course acid suppression, advised dietary precautions, and instructed to return if pain, vomiting, or black stools develop.",
        transcript:
          "Doctor: Tell me what has been bothering you.\nPatient: I have had burning in the stomach, tiredness, and poor appetite for three days.\nDoctor: Any vomiting, fever, or black stools?\nPatient: No, just discomfort after food.\nDoctor: Start Pantoprazole 40mg before breakfast for a few days, avoid spicy food, and return if symptoms worsen.",
        prescriptions: [
          {
            medicineName: "Pantoprazole",
            dosage: "40mg",
            frequency: "Once Daily",
            timing: "Before breakfast",
          },
        ],
      },
    ],
  },
  {
    id: "patient-2",
    name: "Asha Kumari",
    age: 27,
    gender: "Female",
    bloodGroup: "O+",
    phone: "+91 9988776655",
    fourKeySummary: {
      chronicConditions: "No chronic conditions noted",
      allergies: "No known allergies",
      currentMedications: "Iron supplements",
      vitals: "BP 110/70, HR 76 bpm, Temp 98.1F",
    },
    history: [
      {
        id: "visit-3",
        date: "2026-04-01",
        doctorName: "Dr. Sonika Chowdary",
        department: "Outpatient Medicine",
        caseSummary:
          "Patient reported acute headache with mild dehydration and weakness but no fever, vomiting, or visual changes. Recommended oral hydration, observation, and Paracetamol 650mg after food as needed, with escalation advice if symptoms persist or worsen.",
        transcript:
          "Doctor: Since when have you had the headache?\nPatient: Since yesterday afternoon, and I have not been drinking enough water.\nDoctor: Any vomiting, vision changes, or fever?\nPatient: No, only mild weakness.\nDoctor: Take Paracetamol 650mg after food if needed, hydrate well, and monitor symptoms for the next 24 hours.",
        prescriptions: [
          {
            medicineName: "Paracetamol",
            dosage: "650mg",
            frequency: "SOS",
            timing: "After food",
          },
        ],
      },
    ],
  },
];

export const todayAppointments: AppointmentItem[] = [
  {
    id: "appt-1",
    patientId: "patient-1",
    patientName: "Harsha Reddy",
    tokenNumber: 1,
    appointmentDate: "2026-04-09",
    scheduledSlot: "09:15",
    status: "Waiting",
    reasonForVisit: "Diabetes follow-up and fatigue",
    phone: "+91 9876501234",
  },
  {
    id: "appt-2",
    patientId: "patient-2",
    patientName: "Asha Kumari",
    tokenNumber: 2,
    appointmentDate: "2026-04-09",
    scheduledSlot: "09:30",
    status: "Completed",
    reasonForVisit: "Headache and low appetite",
    phone: "+91 9988776655",
  },
  {
    id: "appt-3",
    patientId: "patient-1",
    patientName: "Harsha Reddy",
    tokenNumber: 3,
    appointmentDate: "2026-04-10",
    scheduledSlot: "10:00",
    status: "Scheduled",
    reasonForVisit: "Review lab reports",
    phone: "+91 9876501234",
  },
];

export const pharmacyQueue = [
  {
    medicalHistoryId: "history-1",
    tokenNumber: 1,
    date: "2026-04-09",
    patientName: "Harsha Reddy",
    medicines: [
      { medicineName: "Metformin", dosage: "500mg", frequency: "Twice Daily", timing: "After food" },
      { medicineName: "Vitamin B12", dosage: "1 tab", frequency: "Once Daily", timing: "Morning" },
    ],
  },
];

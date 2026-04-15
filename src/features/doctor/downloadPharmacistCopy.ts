import type { AppointmentItem, PatientRecord } from "../../lib/mockData.ts";

type DownloadPharmacistCopyInput = {
  patient: PatientRecord;
  appointment: AppointmentItem;
  doctor: {
    name: string;
    department: string;
  };
  summarySections: {
    presentingComplaints: string;
    clinicalFindings: string;
    assessmentAndAdvice: string;
    medicinesPrescribed: string;
  };
  prescriptions: Array<{
    medicineName: string;
    dosage: string;
    frequency: string;
    timing: string;
  }>;
};

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function downloadPharmacistCopy(input: DownloadPharmacistCopyInput) {
  const createdDate = new Date().toLocaleString();
  const safePatientName = input.patient.name.replace(/[^a-zA-Z0-9_-]/g, "_");
  const fileName = `clyra-pharmacist-copy-token-${input.appointment.tokenNumber}-${safePatientName}.doc`;
  const rows = input.prescriptions.length
    ? input.prescriptions
        .map(
          (item, index) => `
            <tr>
              <td>${index + 1}</td>
              <td>${escapeHtml(item.medicineName)}</td>
              <td>${escapeHtml(item.dosage || "-")}</td>
              <td>${escapeHtml(item.frequency || "-")}</td>
              <td>${escapeHtml(item.timing || "-")}</td>
            </tr>`,
        )
        .join("")
    : `
      <tr>
        <td>1</td>
        <td colspan="4">No medicine items were extracted. Review doctor notes.</td>
      </tr>`;

  const documentHtml = `
    <html>
      <head>
        <meta charset="utf-8" />
        <title>Pharmacist Copy</title>
        <style>
          body { font-family: Arial, sans-serif; color: #0f172a; margin: 24px; }
          h1, h2, p { margin: 0; }
          .header { margin-bottom: 20px; }
          .meta { margin-top: 12px; display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px 16px; }
          .section { margin-top: 20px; }
          .label { font-weight: 700; }
          table { width: 100%; border-collapse: collapse; margin-top: 12px; }
          th, td { border: 1px solid #cbd5e1; padding: 8px; text-align: left; vertical-align: top; }
          th { background: #e2e8f0; }
          .small { color: #475569; font-size: 12px; margin-top: 8px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Clyra Pharmacist Copy</h1>
          <p class="small">Generated automatically on Save to CRM</p>
        </div>

        <div class="meta">
          <div><span class="label">Patient Name:</span> ${escapeHtml(input.patient.name)}</div>
          <div><span class="label">Token Number:</span> ${input.appointment.tokenNumber}</div>
          <div><span class="label">Age / Gender:</span> ${escapeHtml(`${input.patient.age} / ${input.patient.gender || "-"}`)}</div>
          <div><span class="label">Phone:</span> ${escapeHtml(input.patient.phone || "-")}</div>
          <div><span class="label">Blood Group:</span> ${escapeHtml(input.patient.bloodGroup || "-")}</div>
          <div><span class="label">Appointment Date:</span> ${escapeHtml(input.appointment.appointmentDate)}</div>
          <div><span class="label">Doctor:</span> ${escapeHtml(input.doctor.name)}</div>
          <div><span class="label">Department:</span> ${escapeHtml(input.doctor.department)}</div>
          <div><span class="label">Reason for Visit:</span> ${escapeHtml(input.appointment.reasonForVisit)}</div>
          <div><span class="label">Generated At:</span> ${escapeHtml(createdDate)}</div>
        </div>

        <div class="section">
          <h2>Clinical Summary</h2>
          <p><span class="label">Presenting Complaints:</span> ${escapeHtml(input.summarySections.presentingComplaints || "-")}</p>
          <p><span class="label">Clinical Findings:</span> ${escapeHtml(input.summarySections.clinicalFindings || "-")}</p>
          <p><span class="label">Assessment & Advice:</span> ${escapeHtml(input.summarySections.assessmentAndAdvice || "-")}</p>
          <p><span class="label">Medicines Prescribed:</span> ${escapeHtml(input.summarySections.medicinesPrescribed || "-")}</p>
        </div>

        <div class="section">
          <h2>Medicine Table</h2>
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Medicine</th>
                <th>Dosage</th>
                <th>Frequency</th>
                <th>Timing</th>
              </tr>
            </thead>
            <tbody>
              ${rows}
            </tbody>
          </table>
        </div>
      </body>
    </html>
  `;

  const blob = new Blob([documentHtml], { type: "application/msword" });
  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  window.URL.revokeObjectURL(url);
}

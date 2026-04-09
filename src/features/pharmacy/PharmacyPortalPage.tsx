import { AppShell } from "../../app/layout/AppShell.tsx";
import { Card } from "../../components/ui/Card.tsx";
import { PageHeader } from "../../components/ui/PageHeader.tsx";
import {
  selectPrescription,
  setSearchDate,
  setSearchToken,
  setUsageInstructions,
} from "./pharmacySlice.ts";
import { useAppDispatch, useAppSelector } from "../../lib/hooks/index.ts";

export function PharmacyPortalPage() {
  const dispatch = useAppDispatch();
  const pharmacy = useAppSelector((state) => state.pharmacy);
  const selected = pharmacy.queue.find((item) => item.medicalHistoryId === pharmacy.selectedMedicalHistoryId);

  return (
    <AppShell title="Pharmacy Portal">
      <PageHeader
        eyebrow="Pharmacy"
        title="Token Search & Usage Instructions"
        description="Search by token number and date, view the digital prescription snapshot, and update usage guidance before patient notification."
      />

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.25fr]">
        <Card title="Search Prescription" subtitle="Token + date search, aligned to the backend pharmacy flow.">
          <div className="space-y-4">
            <label className="block text-sm text-slate-600">
              Token Number
              <input
                value={pharmacy.searchToken}
                onChange={(event) => dispatch(setSearchToken(event.target.value))}
                className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3"
              />
            </label>
            <label className="block text-sm text-slate-600">
              Date
              <input
                type="date"
                value={pharmacy.searchDate}
                onChange={(event) => dispatch(setSearchDate(event.target.value))}
                className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3"
              />
            </label>
            <div className="space-y-3 pt-2">
              {pharmacy.queue.map((item) => (
                <button
                  key={item.medicalHistoryId}
                  type="button"
                  onClick={() => dispatch(selectPrescription(item.medicalHistoryId))}
                  className={`w-full rounded-2xl border px-4 py-4 text-left ${
                    selected?.medicalHistoryId === item.medicalHistoryId
                      ? "border-blue-300 bg-blue-50"
                      : "border-slate-200 bg-white"
                  }`}
                >
                  <p className="font-semibold text-slate-900">{item.patientName}</p>
                  <p className="text-sm text-slate-500">
                    Token #{item.tokenNumber} · {item.date}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </Card>

        <Card title="Digital Prescription" subtitle="Medicine list plus pharmacist-specific usage guidance input.">
          {selected ? (
            <div className="space-y-6">
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-sm text-slate-500">Patient</p>
                <p className="mt-1 text-lg font-semibold text-slate-950">{selected.patientName}</p>
              </div>
              <div className="space-y-3">
                {selected.medicines.map((medicine) => (
                  <div key={medicine.medicineName} className="rounded-2xl border border-slate-200 p-4">
                    <p className="font-semibold text-slate-900">{medicine.medicineName}</p>
                    <p className="text-sm text-slate-600">
                      {medicine.dosage} · {medicine.frequency} · {medicine.timing}
                    </p>
                  </div>
                ))}
              </div>
              <label className="block text-sm text-slate-600">
                Usage Instructions
                <textarea
                  value={pharmacy.usageInstructions}
                  onChange={(event) => dispatch(setUsageInstructions(event.target.value))}
                  rows={5}
                  className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3"
                />
              </label>
              <button className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white">
                Submit & Notify Patient
              </button>
            </div>
          ) : (
            <p className="text-sm text-slate-500">No prescription selected.</p>
          )}
        </Card>
      </div>
    </AppShell>
  );
}

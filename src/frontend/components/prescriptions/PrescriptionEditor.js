"use client";

import React, { useState } from "react";
import Button from "@/frontend/components/ui/Button";
import MedicineRow from "./MedicineRow";
import { updatePrescription, finalizePrescription } from "@/frontend/services/prescriptionApi";
import { useRouter } from "next/navigation";

export default function PrescriptionEditor({ initialPrescription }) {
  const router = useRouter();
  const [prescription, setPrescription] = useState(initialPrescription);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState("");
  const [showFinalizeModal, setShowFinalizeModal] = useState(false);

  const isFinalized = prescription.status === "finalized" || prescription.status === "cancelled";

  const handleAddMedicine = () => {
    if (isFinalized) return;
    setPrescription({
      ...prescription,
      medicines: [
        ...prescription.medicines,
        {
          medicineName: "",
          strength: "",
          dosage: "",
          frequency: "",
          durationValue: 1,
          durationUnit: "days",
          foodTiming: "not_specified",
          route: "oral",
          instructions: ""
        }
      ]
    });
  };

  const handleMedicineChange = (index, field, value) => {
    if (isFinalized) return;
    const newMedicines = [...prescription.medicines];
    newMedicines[index][field] = value;
    setPrescription({ ...prescription, medicines: newMedicines });
  };

  const handleRemoveMedicine = (index) => {
    if (isFinalized) return;
    const newMedicines = [...prescription.medicines];
    newMedicines.splice(index, 1);
    setPrescription({ ...prescription, medicines: newMedicines });
  };

  const handleSaveDraft = async () => {
    if (isFinalized) return;
    setLoading(true);
    setError(null);
    setSuccessMsg("");
    try {
      const updated = await updatePrescription(prescription.id, {
        medicines: prescription.medicines,
        generalInstructions: prescription.generalInstructions,
        // Optional: you could sync recommended tests and followUp here if you added them to the state
      });
      setPrescription(updated);
      setSuccessMsg("Draft saved successfully.");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      setError(err.message || "Failed to save draft");
    } finally {
      setLoading(false);
    }
  };

  const handleFinalize = async () => {
    setLoading(true);
    setError(null);
    try {
      // First save draft, then finalize
      await updatePrescription(prescription.id, {
        medicines: prescription.medicines,
        generalInstructions: prescription.generalInstructions,
      });
      const finalized = await finalizePrescription(prescription.id, {
        medicines: prescription.medicines,
        generalInstructions: prescription.generalInstructions,
      });
      setPrescription(finalized);
      setShowFinalizeModal(false);
      setSuccessMsg("Prescription finalized successfully.");
    } catch (err) {
      setError(err.message || "Failed to finalize prescription");
      setShowFinalizeModal(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex justify-between items-center border-b pb-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Prescription Details</h2>
          <p className="text-sm text-gray-500">RX Code: {prescription.prescriptionCode}</p>
        </div>
        <div>
          {prescription.status === "draft" && (
            <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-bold uppercase">Draft</span>
          )}
          {prescription.status === "finalized" && (
            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-bold uppercase">Finalized</span>
          )}
        </div>
      </div>

      {error && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">{error}</div>}
      {successMsg && <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-md text-sm">{successMsg}</div>}

      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Medicines</h3>
          {!isFinalized && (
            <Button variant="outline" size="sm" onClick={handleAddMedicine}>+ Add Medicine</Button>
          )}
        </div>

        {prescription.medicines.length === 0 ? (
          <div className="text-center py-6 bg-gray-50 border border-dashed rounded-lg text-gray-500 text-sm">
            No medicines added yet.
          </div>
        ) : (
          prescription.medicines.map((med, idx) => (
            <MedicineRow 
              key={idx} 
              index={idx}
              medicine={med} 
              onChange={handleMedicineChange}
              onRemove={handleRemoveMedicine}
              isFinalized={isFinalized}
            />
          ))
        )}
      </div>

      <div className="mb-8">
        <label className="block text-sm font-semibold text-gray-800 mb-2">General Instructions / Advice</label>
        <textarea
          rows="4"
          className="w-full border-gray-300 rounded-lg text-sm"
          placeholder="e.g. Drink plenty of water, avoid spicy food..."
          value={prescription.generalInstructions || ""}
          onChange={(e) => setPrescription({ ...prescription, generalInstructions: e.target.value })}
          disabled={isFinalized}
        ></textarea>
      </div>

      {/* Snapshot displays (tests, follow up) can be added here if needed to be editable, 
          but as per spec, they are snapshotted from consultation. We'll just display them. */}
      
      <div className="flex justify-between items-center pt-6 border-t border-gray-200">
        <div>
          <Button variant="outline" onClick={() => router.push(`/dashboard/prescriptions/${prescription.id}`)}>
            Preview / Print Layout
          </Button>
        </div>
        <div className="flex gap-3">
          {!isFinalized && (
            <>
              <Button variant="outline" onClick={handleSaveDraft} disabled={loading}>
                {loading ? "Saving..." : "Save Draft"}
              </Button>
              <Button variant="primary" onClick={() => setShowFinalizeModal(true)} disabled={loading}>
                Finalize Prescription
              </Button>
            </>
          )}
        </div>
      </div>

      {showFinalizeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full">
            <h3 className="text-lg font-bold mb-2">Finalize Prescription?</h3>
            <p className="text-sm text-gray-600 mb-6">
              After finalization, this prescription will be locked and normal editing will be disabled. 
              Are you sure you want to proceed?
            </p>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowFinalizeModal(false)}>Cancel</Button>
              <Button variant="primary" onClick={handleFinalize} disabled={loading}>
                {loading ? "Finalizing..." : "Yes, Finalize"}
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

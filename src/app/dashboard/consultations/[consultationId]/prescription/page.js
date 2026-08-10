"use client";

import { useState, useEffect, use } from "react";
import { getPrescriptionByConsultation, createOrGetPrescription } from "@/frontend/services/prescriptionApi";
import PrescriptionEditor from "@/frontend/components/prescriptions/PrescriptionEditor";
import PageHeader from "@/frontend/components/dashboard/PageHeader";
import Button from "@/frontend/components/ui/Button";
import { useRouter } from "next/navigation";

export default function ConsultationPrescriptionPage({ params }) {
  const router = useRouter();
  const { consultationId } = use(params);
  const [prescription, setPrescription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchOrCreatePrescription();
  }, [consultationId]);

  const fetchOrCreatePrescription = async () => {
    try {
      setLoading(true);
      // First try to fetch
      let data = await getPrescriptionByConsultation(consultationId).catch(() => null);
      
      // If it doesn't exist, try to create draft
      if (!data) {
        data = await createOrGetPrescription(consultationId);
      }
      
      setPrescription(data);
    } catch (err) {
      setError(err.message || "Failed to load prescription editor");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500 animate-pulse">Loading prescription data...</div>;
  }

  if (error) {
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-4">{error}</div>
        <Button variant="outline" onClick={() => router.back()}>Go Back</Button>
      </div>
    );
  }

  return (
    <div className="pb-10 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <PageHeader 
          title="Prescription" 
          description={`Patient: ${prescription.patient?.fullName || "Unknown"} | RX: ${prescription.prescriptionCode}`} 
        />
        <Button variant="outline" onClick={() => router.back()}>Back to Consultation</Button>
      </div>

      <PrescriptionEditor initialPrescription={prescription} />
    </div>
  );
}

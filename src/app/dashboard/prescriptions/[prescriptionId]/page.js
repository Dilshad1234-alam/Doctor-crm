"use client";

import { useState, useEffect, use } from "react";
import { getPrescriptionById } from "@/frontend/services/prescriptionApi";
import PrescriptionPrintView from "@/frontend/components/prescriptions/PrescriptionPrintView";
import PageHeader from "@/frontend/components/dashboard/PageHeader";
import Button from "@/frontend/components/ui/Button";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function PrescriptionPreviewPage({ params }) {
  const router = useRouter();
  const { prescriptionId } = use(params);
  const [prescription, setPrescription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPrescription();
  }, [prescriptionId]);

  const fetchPrescription = async () => {
    try {
      setLoading(true);
      const data = await getPrescriptionById(prescriptionId);
      setPrescription(data);
    } catch (err) {
      setError(err.message || "Failed to load prescription");
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500 animate-pulse">Loading prescription...</div>;
  }

  if (error || !prescription) {
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-4">{error || "Prescription not found"}</div>
        <Button variant="outline" onClick={() => router.back()}>Go Back</Button>
      </div>
    );
  }

  return (
    <div className="pb-10 max-w-5xl mx-auto print:p-0 print:m-0 print:max-w-none">
      <div className="flex justify-between items-center mb-6 print:hidden">
        <PageHeader 
          title="Prescription Preview" 
          description={`RX Code: ${prescription.prescriptionCode} | Status: ${prescription.status}`} 
        />
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => router.back()}>Back</Button>
          {prescription.status === "draft" && (
            <Link href={`/dashboard/consultations/${prescription.consultationId._id || prescription.consultationId}/prescription`}>
              <Button variant="outline">Edit Draft</Button>
            </Link>
          )}
          <Button variant="primary" onClick={handlePrint}>Print / Save PDF</Button>
        </div>
      </div>

      <div className="border border-gray-200 rounded-lg overflow-hidden print:border-none print:rounded-none">
        <PrescriptionPrintView prescription={prescription} />
      </div>
    </div>
  );
}

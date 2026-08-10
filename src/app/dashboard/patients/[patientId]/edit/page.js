"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { getPatientById } from "@/frontend/services/patientApi";
import PatientForm from "@/frontend/components/patients/PatientForm";
import { ChevronLeft } from "lucide-react";

export default function EditPatientPage({ params }) {
  const unwrappedParams = use(params);
  const patientId = unwrappedParams.patientId;
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPatient();
  }, [patientId]);

  const fetchPatient = async () => {
    try {
      const res = await getPatientById(patientId);
      if (res.success) {
        setPatient(res.patient);
      } else {
        setError(res.message);
      }
    } catch (err) {
      setError("Failed to load patient");
    }
    setLoading(false);
  };

  if (loading) {
    return <div className="p-12 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>;
  }

  if (error || !patient) {
    return (
      <div className="max-w-3xl mx-auto mt-12 p-6 bg-red-50 text-red-600 rounded-xl text-center border border-red-100">
        <h3 className="text-lg font-bold mb-2">Error</h3>
        <p>{error || "Patient not found"}</p>
        <Link href="/dashboard/patients" className="inline-block mt-4 text-blue-600 hover:underline">Back to Patients</Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <div className="flex items-center gap-4">
        <Link href={`/dashboard/patients/${patientId}`} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Edit Patient</h1>
          <p className="text-gray-500 text-sm mt-1">{patient.fullName} • {patient.patientCode}</p>
        </div>
      </div>

      <PatientForm initialData={patient} isEdit={true} patientId={patientId} />
    </div>
  );
}

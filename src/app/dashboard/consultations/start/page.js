"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getAppointmentById } from "@/frontend/services/appointmentApi";
import { getPatientById } from "@/frontend/services/patientApi";
import { getAppointmentVitals } from "@/frontend/services/vitalsApi";
import { ChevronLeft, AlertTriangle, Pill, Activity, ArrowRight, User } from "lucide-react";

export default function ConsultationPreparationPage({ searchParams }) {
  const unwrappedParams = use(searchParams);
  const appointmentId = unwrappedParams.appointmentId;
  const router = useRouter();

  const [appointment, setAppointment] = useState(null);
  const [patient, setPatient] = useState(null);
  const [vitals, setVitals] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!appointmentId) {
      setError("No appointment ID provided");
      setLoading(false);
      return;
    }
    fetchData();
  }, [appointmentId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const aptRes = await getAppointmentById(appointmentId);
      if (!aptRes.success) throw new Error(aptRes.message || "Failed to load appointment");
      
      const apt = aptRes.appointment;
      setAppointment(apt);

      const [patientRes, vitalsData] = await Promise.all([
        getPatientById(apt.patientId._id || apt.patientId),
        getAppointmentVitals(appointmentId).catch(() => null)
      ]);

      if (patientRes.success) {
        setPatient(patientRes.patient);
      }
      setVitals(vitalsData);
    } catch (err) {
      setError(err.message || "Failed to load consultation data");
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/appointments/${appointmentId}/consultation/start`, { method: "POST" });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || "Failed to start consultation");
      
      // Redirect to the consultation workspace using consultation ID
      router.push(`/dashboard/consultations/${data.consultation._id}`);
    } catch (err) {
      alert("Error: " + err.message);
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-12 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>;
  }

  if (error || !appointment || !patient) {
    return (
      <div className="max-w-3xl mx-auto mt-12 p-6 bg-red-50 text-red-600 rounded-xl border border-red-100 text-center">
        <h3 className="text-lg font-bold mb-2">Error Loading Consultation</h3>
        <p>{error || "Data not found"}</p>
        <Link href="/dashboard/queue" className="inline-block mt-4 text-indigo-600 hover:underline">Return to Queue</Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <Link href="/dashboard/queue" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700">
          <ChevronLeft className="w-4 h-4 mr-1" /> Back to Queue
        </Link>
        <div className="text-sm font-medium text-gray-500">
          Consultation Preparation
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Patient Header */}
        <div className="bg-indigo-50/50 p-6 border-b border-indigo-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white text-indigo-700 rounded-full flex items-center justify-center text-2xl font-bold uppercase shadow-sm shrink-0 border border-indigo-100">
              {patient.firstName?.charAt(0) || ''}{patient.lastName ? patient.lastName.charAt(0) : ''}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{patient.fullName}</h1>
              <p className="text-indigo-700 font-medium text-sm mt-1">
                {patient.age} yrs • {patient.gender} • ID: {patient.patientCode}
              </p>
            </div>
          </div>
          <div className="text-left md:text-right">
            <p className="text-sm text-gray-500">Appointment Time</p>
            <p className="font-semibold text-gray-900">{appointment.startTime} - {appointment.endTime}</p>
            <p className="text-xs text-gray-500 mt-1 capitalize">{appointment.visitType?.replace(/_/g, ' ')}</p>
          </div>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Main Column */}
          <div className="md:col-span-2 space-y-8">
            {/* Medical Alerts (Read-only) */}
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <AlertTriangle className="w-5 h-5 text-orange-500 mr-2" /> 
                Medical Alerts
              </h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-orange-50 border border-orange-100 rounded-lg p-4">
                  <h3 className="text-xs font-bold text-orange-800 uppercase tracking-wider mb-2">Allergies</h3>
                  {patient.allergies?.length > 0 ? (
                    <ul className="list-disc pl-4 text-sm text-orange-900 space-y-1">
                      {patient.allergies.map((a, i) => <li key={i}>{a}</li>)}
                    </ul>
                  ) : (
                    <p className="text-sm text-orange-700/70">None reported</p>
                  )}
                </div>
                
                <div className="bg-red-50 border border-red-100 rounded-lg p-4">
                  <h3 className="text-xs font-bold text-red-800 uppercase tracking-wider mb-2">Chronic Conditions</h3>
                  {patient.chronicConditions?.length > 0 ? (
                    <ul className="list-disc pl-4 text-sm text-red-900 space-y-1">
                      {patient.chronicConditions.map((c, i) => <li key={i}>{c}</li>)}
                    </ul>
                  ) : (
                    <p className="text-sm text-red-700/70">None reported</p>
                  )}
                </div>
              </div>
              
              <div className="mt-4 bg-blue-50 border border-blue-100 rounded-lg p-4">
                <h3 className="text-xs font-bold text-blue-800 uppercase tracking-wider mb-2 flex items-center">
                  <Pill className="w-4 h-4 mr-1.5" /> Current Medicines
                </h3>
                {patient.currentMedicines?.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {patient.currentMedicines.map((m, i) => (
                      <span key={i} className="px-2.5 py-1 bg-white text-blue-800 rounded text-sm font-medium border border-blue-200 shadow-sm">{m}</span>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-blue-700/70">None reported</p>
                )}
              </div>
            </div>

            {/* Appointment Reason */}
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-4">Reason for Visit</h2>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-5">
                <p className="text-gray-800 whitespace-pre-wrap">{appointment.reason || "No specific reason provided at booking."}</p>
              </div>
            </div>
          </div>

          {/* Sidebar Column */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="bg-gray-50 border-b border-gray-200 p-4 flex items-center justify-between">
                <h3 className="font-bold text-gray-900 flex items-center">
                  <Activity className="w-4 h-4 text-indigo-500 mr-2" /> Current Vitals
                </h3>
              </div>
              <div className="p-5">
                {!vitals ? (
                  <p className="text-sm text-gray-500 text-center py-4">Vitals have not been recorded yet.</p>
                ) : (
                  <dl className="space-y-4">
                    <div className="flex justify-between border-b border-gray-100 pb-2">
                      <dt className="text-sm text-gray-500">BP</dt>
                      <dd className="text-sm font-medium text-gray-900">{vitals.bloodPressure?.systolic ? `${vitals.bloodPressure.systolic}/${vitals.bloodPressure.diastolic}` : '--'}</dd>
                    </div>
                    <div className="flex justify-between border-b border-gray-100 pb-2">
                      <dt className="text-sm text-gray-500">Pulse</dt>
                      <dd className="text-sm font-medium text-gray-900">{vitals.pulseRate ? `${vitals.pulseRate} bpm` : '--'}</dd>
                    </div>
                    <div className="flex justify-between border-b border-gray-100 pb-2">
                      <dt className="text-sm text-gray-500">Temp</dt>
                      <dd className="text-sm font-medium text-gray-900">{vitals.temperatureC ? `${vitals.temperatureC} °C` : '--'}</dd>
                    </div>
                    <div className="flex justify-between border-b border-gray-100 pb-2">
                      <dt className="text-sm text-gray-500">SpO2</dt>
                      <dd className="text-sm font-medium text-gray-900">{vitals.oxygenSaturation ? `${vitals.oxygenSaturation}%` : '--'}</dd>
                    </div>
                    <div className="flex justify-between border-b border-gray-100 pb-2">
                      <dt className="text-sm text-gray-500">Weight</dt>
                      <dd className="text-sm font-medium text-gray-900">{vitals.weightKg ? `${vitals.weightKg} kg` : '--'}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-sm text-gray-500">BMI</dt>
                      <dd className="text-sm font-medium text-gray-900">{vitals.bmi || '--'}</dd>
                    </div>
                  </dl>
                )}
              </div>
            </div>
            
            <div className="pt-6">
              <button 
                onClick={handleContinue}
                className="w-full flex items-center justify-center px-6 py-4 bg-indigo-600 hover:bg-indigo-700 text-white text-lg font-medium rounded-xl shadow transition-colors"
              >
                Continue to Consultation
                <ArrowRight className="w-5 h-5 ml-2" />
              </button>
              <p className="text-xs text-center text-gray-500 mt-3">
                Final diagnosis and prescription will be done in the next step.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

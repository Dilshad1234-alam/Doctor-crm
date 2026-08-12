"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getPatientById, getPatientSummary, getPatientHistory } from "@/frontend/services/patientApi";
import { getPatientVitals } from "@/frontend/services/vitalsApi";
import { getPatientPrescriptions } from "@/frontend/services/prescriptionApi";
import { getPatientReports, getPatientTests } from "@/frontend/services/reportApi";
import UploadReportModal from "@/frontend/components/reports/UploadReportModal";
import { ReportStatusBadge, TestStatusBadge } from "@/frontend/components/reports/StatusBadge";
import { ChevronLeft, Edit, Calendar, User, Phone, Droplet, Clock, FileText, Activity, Upload, FileSignature, Receipt } from "lucide-react";
import PatientConsultations from "@/frontend/components/patients/PatientConsultations";
import PatientAppointments from "@/frontend/components/patients/PatientAppointments";
import PatientBilling from "@/frontend/components/patients/PatientBilling";


export default function PatientDetailsPage({ params }) {
  const unwrappedParams = use(params);
  const patientId = unwrappedParams.patientId;
  const router = useRouter();
  
  const [patient, setPatient] = useState(null);
  const [summary, setSummary] = useState(null);
  const [history, setHistory] = useState([]);
  const [vitalsHistory, setVitalsHistory] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [reports, setReports] = useState([]);
  const [tests, setTests] = useState([]);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Parse tab from URL if present
  useEffect(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const tabParam = urlParams.get("tab");
      if (tabParam && ['overview', 'appointments', 'consultations', 'prescriptions', 'medical-reports', 'billing'].includes(tabParam)) {
        setActiveTab(tabParam);
      }
    }
  }, []);

  const [activeTab, setActiveTab] = useState("overview");

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (typeof window !== "undefined") {
      const url = new URL(window.location);
      url.searchParams.set("tab", tab);
      window.history.pushState({}, "", url);
    }
  };

  useEffect(() => {
    fetchPatientData();
  }, [patientId]);

  const fetchPatientData = async () => {
    setLoading(true);
    try {
      const [patientRes, summaryRes, historyRes, vitalsRes, prescriptionsRes, reportsRes, testsRes] = await Promise.all([
        getPatientById(patientId),
        getPatientSummary(patientId),
        getPatientHistory(patientId),
        getPatientVitals(patientId).catch(() => ({ vitals: [] })),
        getPatientPrescriptions(patientId).catch(() => ([])),
        getPatientReports(patientId).catch(() => ([])),
        getPatientTests(patientId).catch(() => ([]))
      ]);

      if (patientRes.success) setPatient(patientRes.patient);
      else setError(patientRes.message);

      if (summaryRes.success) setSummary(summaryRes.metrics);
      if (historyRes.success) setHistory(historyRes.history);
      if (vitalsRes && vitalsRes.vitals) setVitalsHistory(vitalsRes.vitals);
      setPrescriptions(prescriptionsRes || []);
      setReports(reportsRes || []);
      setTests(testsRes || []);
    } catch (err) {
      setError("Failed to load patient details");
    }
    setLoading(false);
  };

  if (loading) {
    return <div className="p-12 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>;
  }

  if (error || !patient) {
    return (
      <div className="max-w-3xl mx-auto mt-12 p-6 bg-red-50 text-red-600 rounded-xl border border-red-100 text-center">
        <h3 className="text-lg font-bold mb-2">Error</h3>
        <p>{error || "Patient not found"}</p>
        <Link href="/dashboard/patients" className="inline-block mt-4 text-blue-600 hover:underline">Back to Patients</Link>
      </div>
    );
  }

  return (
  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-[#E2E8F0] p-6 lg:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 bg-gradient-to-br from-[#2563EB] to-[#1D4ED8] text-white rounded-2xl flex items-center justify-center text-3xl font-black uppercase shrink-0 shadow-sm">
            {patient.firstName?.charAt(0) || ''}{patient.lastName ? patient.lastName.charAt(0) : ''}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <h1 className="text-2xl font-black text-[#0F172A]">{patient.fullName}</h1>
              <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-[#F8FAFC] text-[#64748B] border border-[#E2E8F0]">
                {patient.patientCode}
              </span>
              <span className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${patient.isActive ? 'bg-[#EFF6FF] text-[#2563EB]' : 'bg-[#FEF2F2] text-[#EF4444]'}`}>
                {patient.isActive ? "Active" : "Inactive"}
              </span>
            </div>
            <div className="flex items-center gap-4 text-sm font-medium text-[#64748B]">
              <span className="flex items-center gap-1.5"><Phone className="w-4 h-4 text-[#64748B]" /> {patient.phone}</span>
              <span className="flex items-center gap-1.5"><User className="w-4 h-4 text-[#64748B]" /> {patient.email || "No email"}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <Link href={`/dashboard/patients/${patientId}/edit`} className="flex-1 md:flex-none justify-center flex items-center px-5 py-2.5 bg-white border border-[#E2E8F0] hover:bg-[#F8FAFC] text-[#0F172A] rounded-xl font-bold transition-colors text-sm shadow-sm">
            <Edit className="w-4 h-4 mr-2 text-[#64748B]" /> Edit Profile
          </Link>
          <Link href={`/dashboard/appointments/new?patientId=${patientId}`} className="flex-1 md:flex-none justify-center flex items-center px-5 py-2.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-xl font-bold text-sm shadow-sm transition-colors">
            <Calendar className="w-4 h-4 mr-2" /> Book Appt
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="p-3 bg-[#EFF6FF] text-[#2563EB] rounded-xl"><User className="w-5 h-5" /></div>
          <div>
            <p className="text-xs font-bold text-[#64748B] uppercase tracking-wide mb-1">Age / Sex</p>
            <p className="text-lg font-black text-[#0F172A]">{patient.age !== undefined && patient.age !== null ? patient.age : '--'} / {patient.gender || '--'}</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="p-3 bg-[#FEF2F2] text-[#EF4444] rounded-xl"><Droplet className="w-5 h-5" /></div>
          <div>
            <p className="text-xs font-bold text-[#64748B] uppercase tracking-wide mb-1">Blood</p>
            <p className="text-lg font-black text-[#0F172A]">{patient.bloodGroup || '--'}</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="p-3 bg-[#EFF6FF] text-[#2563EB] rounded-xl"><Phone className="w-5 h-5" /></div>
          <div className="overflow-hidden">
            <p className="text-xs font-bold text-[#64748B] uppercase tracking-wide mb-1">Contact</p>
            <p className="text-lg font-black text-[#0F172A] truncate">{patient.phone}</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="p-3 bg-[#FEF3C7] text-[#F59E0B] rounded-xl"><Activity className="w-5 h-5" /></div>
          <div>
            <p className="text-xs font-bold text-[#64748B] uppercase tracking-wide mb-1">Visits</p>
            <p className="text-lg font-black text-[#0F172A]">--</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-[#E2E8F0] overflow-x-auto">
        <nav className="flex space-x-8 min-w-max px-2" aria-label="Tabs">
          {['overview', 'appointments', 'consultations', 'prescriptions', 'medical-reports', 'billing'].map(tab => (
            <button
              key={tab}
              onClick={() => handleTabChange(tab)}
              className={`
                whitespace-nowrap py-4 px-2 border-b-2 font-bold text-sm capitalize transition-colors
                ${activeTab === tab 
                  ? 'border-[#2563EB] text-[#2563EB]' 
                  : 'border-transparent text-[#64748B] hover:text-[#0F172A] hover:border-[#E2E8F0]'
                }
              `}
            >
              {tab.replace('-', ' ')}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 space-y-6">
              {/* Contact Card */}
              <div className="bg-white rounded-2xl shadow-sm border border-[#E2E8F0] p-6">
                <h3 className="text-xs font-bold text-[#64748B] mb-4 uppercase tracking-wider">Contact Information</h3>
                <dl className="space-y-4 text-sm">
                  <div>
                    <dt className="text-[#64748B] font-medium">Email</dt>
                    <dd className="font-bold text-[#0F172A] mt-0.5">{patient.email || 'N/A'}</dd>
                  </div>
                  <div>
                    <dt className="text-[#64748B] font-medium">Alternate Phone</dt>
                    <dd className="font-bold text-[#0F172A] mt-0.5">{patient.alternatePhone || 'N/A'}</dd>
                  </div>
                  <div>
                    <dt className="text-[#64748B] font-medium">Address</dt>
                    <dd className="font-bold text-[#0F172A] mt-0.5 leading-relaxed">
                      {[patient.address?.line1, patient.address?.city, patient.address?.state].filter(Boolean).join(', ') || 'N/A'}
                    </dd>
                  </div>
                </dl>
              </div>

              {/* Emergency Contact */}
              <div className="bg-white rounded-2xl shadow-sm border border-[#E2E8F0] p-6">
                <h3 className="text-xs font-bold text-[#64748B] mb-4 uppercase tracking-wider">Emergency Contact</h3>
                <dl className="space-y-4 text-sm">
                  <div>
                    <dt className="text-[#64748B] font-medium">Name ({patient.emergencyContact?.relation || 'Relation'})</dt>
                    <dd className="font-bold text-[#0F172A] mt-0.5">{patient.emergencyContact?.name || 'N/A'}</dd>
                  </div>
                  <div>
                    <dt className="text-[#64748B] font-medium">Phone</dt>
                    <dd className="font-bold text-[#0F172A] mt-0.5">{patient.emergencyContact?.phone || 'N/A'}</dd>
                  </div>
                </dl>
              </div>
            </div>

            <div className="lg:col-span-2 space-y-6">
              {/* Medical Profile */}
              <div className="bg-white rounded-2xl shadow-sm border border-[#E2E8F0] p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xs font-bold text-[#64748B] uppercase tracking-wider">Medical Profile</h3>
                  <Link href={`/dashboard/patients/${patientId}/edit`} className="text-sm font-bold text-[#2563EB] hover:underline">Edit</Link>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  <div>
                    <h4 className="text-sm font-medium text-[#64748B] mb-3">Allergies</h4>
                    {patient.allergies?.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {patient.allergies.map((a, i) => <span key={i} className="px-2.5 py-1 bg-[#FEF2F2] text-[#EF4444] rounded-md text-xs font-bold border border-[#FCA5A5]">{a}</span>)}
                      </div>
                    ) : <p className="text-sm font-medium text-[#64748B]">None reported</p>}
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-[#64748B] mb-3">Chronic Conditions</h4>
                    {patient.chronicConditions?.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {patient.chronicConditions.map((c, i) => <span key={i} className="px-2.5 py-1 bg-[#FEF3C7] text-[#F59E0B] rounded-md text-xs font-bold border border-[#FDE68A]">{c}</span>)}
                      </div>
                    ) : <p className="text-sm font-medium text-[#64748B]">None reported</p>}
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-[#64748B] mb-3">Current Medicines</h4>
                    {patient.currentMedicines?.length > 0 ? (
                      <ul className="list-disc pl-5 text-sm font-bold text-[#0F172A] space-y-1.5">
                        {patient.currentMedicines.map((m, i) => <li key={i}>{m}</li>)}
                      </ul>
                    ) : <p className="text-sm font-medium text-[#64748B]">None reported</p>}
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-[#64748B] mb-3">Habits</h4>
                    <ul className="text-sm font-bold text-[#0F172A] space-y-1.5">
                      <li><span className="text-[#64748B] font-medium">Smoking:</span> {patient.habits?.smoking || 'Unknown'}</li>
                      <li><span className="text-[#64748B] font-medium">Alcohol:</span> {patient.habits?.alcohol || 'Unknown'}</li>
                    </ul>
                  </div>
                </div>

                {patient.notes && (
                  <div className="mt-8 pt-6 border-t border-[#E2E8F0]">
                    <h4 className="text-sm font-medium text-[#64748B] mb-3">Medical Notes</h4>
                    <p className="text-sm font-medium text-[#0F172A] bg-[#FEF3C7]/30 p-4 rounded-xl border border-[#FDE68A]">{patient.notes}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'appointments' && (
          <PatientAppointments patientId={patientId} />
        )}

        {activeTab === 'consultations' && (
          <PatientConsultations patientId={patientId} />
        )}
        
        {activeTab === 'prescriptions' && (
          <div className="bg-white rounded-2xl shadow-sm border border-[#E2E8F0] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-[#E2E8F0]">
              <h3 className="text-base font-bold text-[#0F172A] flex items-center gap-3">
                <div className="p-2 bg-[#EFF6FF] text-[#2563EB] rounded-xl"><FileSignature size={18} /></div>
                Prescriptions History
              </h3>
            </div>
            
            {prescriptions.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-[#F8FAFC]">
                    <tr className="border-b border-[#E2E8F0] text-xs uppercase tracking-wider text-[#64748B]">
                      <th className="py-3 px-6 font-bold">RX Code</th>
                      <th className="py-3 px-6 font-bold">Date</th>
                      <th className="py-3 px-6 font-bold">Status</th>
                      <th className="py-3 px-6 font-bold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E2E8F0]">
                    {prescriptions.map((p) => (
                      <tr key={p.id} className="hover:bg-[#F8FAFC] transition-colors">
                        <td className="py-4 px-6 font-bold text-[#0F172A] text-sm">{p.prescriptionCode}</td>
                        <td className="py-4 px-6 text-[#64748B] font-medium text-sm">{new Date(p.createdAt).toLocaleDateString()}</td>
                        <td className="py-4 px-6">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold capitalize 
                           ${p.status === 'finalized' ? 'bg-[#EFF6FF] text-[#2563EB]' : 'bg-[#F1F5F9] text-[#64748B]'}`}>
                           {p.status}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <Link href={`/dashboard/prescriptions/${p.id}?fromPatient=${patientId}`} className="text-sm font-bold text-[#2563EB] hover:underline">
                            View / Print
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-center text-[#64748B] py-12 text-sm font-medium">No prescriptions found.</p>
            )}
          </div>
        )}

        {activeTab === 'medical-reports' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-[#E2E8F0] overflow-hidden flex flex-col">
              <div className="flex justify-between items-center p-6 border-b border-[#E2E8F0]">
                <h3 className="text-base font-bold text-[#0F172A]">Recommended Tests</h3>
              </div>
              {tests.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-[#F8FAFC]">
                      <tr className="border-b border-[#E2E8F0] text-xs uppercase tracking-wider text-[#64748B]">
                        <th className="py-3 px-6 font-bold">Test Name</th>
                        <th className="py-3 px-6 font-bold">Date</th>
                        <th className="py-3 px-6 font-bold">Recommended By</th>
                        <th className="py-3 px-6 font-bold">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E2E8F0]">
                      {tests.map(t => (
                        <tr key={t._id} className="hover:bg-[#F8FAFC] transition-colors">
                          <td className="py-4 px-6 font-bold text-[#0F172A] text-sm">{t.name}</td>
                          <td className="py-4 px-6 text-[#64748B] font-medium text-sm">{new Date(t.recommendedAt).toLocaleDateString()}</td>
                          <td className="py-4 px-6 text-[#64748B] font-medium text-sm">Dr. {t.doctorId?.userId?.name || "Unknown"}</td>
                          <td className="py-4 px-6"><TestStatusBadge status={t.status} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-8">
                  <p className="text-center text-[#64748B] py-8 text-sm border-2 border-dashed border-[#E2E8F0] rounded-xl font-medium bg-[#F8FAFC]">No tests have been recommended for this patient.</p>
                </div>
              )}
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-[#E2E8F0] overflow-hidden flex flex-col">
              <div className="flex justify-between items-center p-6 border-b border-[#E2E8F0]">
                <h3 className="text-base font-bold text-[#0F172A]">Medical Reports</h3>
                <button 
                  onClick={() => setIsUploadModalOpen(true)}
                  className="flex items-center px-4 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-xl font-bold text-sm transition-colors shadow-sm"
                >
                  <Upload className="w-4 h-4 mr-2" /> Upload Report
                </button>
              </div>
              
              {reports.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-[#F8FAFC]">
                      <tr className="border-b border-[#E2E8F0] text-xs uppercase tracking-wider text-[#64748B]">
                        <th className="py-3 px-6 font-bold">Report Name</th>
                        <th className="py-3 px-6 font-bold">Date</th>
                        <th className="py-3 px-6 font-bold">Status</th>
                        <th className="py-3 px-6 font-bold text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E2E8F0]">
                      {reports.map((r) => (
                        <tr key={r._id} className="hover:bg-[#F8FAFC] transition-colors">
                          <td className="py-4 px-6 font-bold text-[#0F172A] text-sm">{r.title}</td>
                          <td className="py-4 px-6 text-[#64748B] font-medium text-sm">{new Date(r.reportDate).toLocaleDateString()}</td>
                          <td className="py-4 px-6"><ReportStatusBadge status={r.reviewStatus} /></td>
                          <td className="py-4 px-6 text-right">
                            <Link href={`/dashboard/medical-reports/${r._id}`} className="text-sm font-bold text-[#2563EB] hover:underline">
                              View
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-8">
                  <p className="text-center text-[#64748B] py-8 text-sm border-2 border-dashed border-[#E2E8F0] rounded-xl font-medium bg-[#F8FAFC]">No medical reports uploaded yet.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {isUploadModalOpen && (
          <UploadReportModal 
            patientId={patientId} 
            onClose={() => setIsUploadModalOpen(false)}
            onSuccess={() => {
              setIsUploadModalOpen(false);
              fetchPatientData(); // Refresh to get updated tests/reports
            }}
          />
        )}

        {activeTab === 'billing' && (
          <PatientBilling patientId={patientId} />
        )}
      </div>
    </div>
  );
}

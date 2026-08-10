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
import { ChevronLeft, Edit, Calendar, User, Phone, Droplet, Clock, FileText, Activity, Upload } from "lucide-react";


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
  const [activeTab, setActiveTab] = useState("overview");

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
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-2xl font-bold uppercase shrink-0">
            {patient.firstName?.charAt(0) || ''}{patient.lastName ? patient.lastName.charAt(0) : ''}
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">{patient.fullName}</h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
                {patient.patientCode}
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${patient.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {patient.isActive ? "Active" : "Inactive"}
              </span>
            </div>
            <p className="text-gray-500 text-sm mt-1">{patient.phone} • {patient.email || "No email"}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <Link href={`/dashboard/patients/${patientId}/edit`} className="flex-1 md:flex-none justify-center flex items-center px-4 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg font-medium transition-colors text-sm shadow-sm">
            <Edit className="w-4 h-4 mr-2" /> Edit Patient
          </Link>
          <Link href={`/dashboard/appointments/new?patientId=${patientId}`} className="flex-1 md:flex-none justify-center flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-sm shadow-sm transition-colors">
            <Calendar className="w-4 h-4 mr-2" /> Book Appointment
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center gap-3">
          <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><User className="w-5 h-5" /></div>
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Age / Gender</p>
            <p className="text-lg font-bold text-gray-900">{patient.age !== undefined && patient.age !== null ? patient.age : '--'} / {patient.gender || '--'}</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center gap-3">
          <div className="p-2 bg-red-50 text-red-600 rounded-lg"><Droplet className="w-5 h-5" /></div>
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Blood Group</p>
            <p className="text-lg font-bold text-gray-900">{patient.bloodGroup || '--'}</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center gap-3">
          <div className="p-2 bg-green-50 text-green-600 rounded-lg"><Phone className="w-5 h-5" /></div>
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</p>
            <p className="text-lg font-bold text-gray-900 truncate">{patient.phone}</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center gap-3">
          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg"><Activity className="w-5 h-5" /></div>
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Visits</p>
            <p className="text-lg font-bold text-gray-900">--</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 overflow-x-auto">
        <nav className="flex space-x-8 min-w-max px-1" aria-label="Tabs">
          {['overview', 'vitals', 'history', 'reports', 'prescriptions', 'visits'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`
                whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm capitalize transition-colors
                ${activeTab === tab 
                  ? 'border-blue-600 text-blue-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
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
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                <h3 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wider">Contact Information</h3>
                <dl className="space-y-3 text-sm">
                  <div>
                    <dt className="text-gray-500">Email</dt>
                    <dd className="font-medium text-gray-900">{patient.email || 'N/A'}</dd>
                  </div>
                  <div>
                    <dt className="text-gray-500">Alternate Phone</dt>
                    <dd className="font-medium text-gray-900">{patient.alternatePhone || 'N/A'}</dd>
                  </div>
                  <div>
                    <dt className="text-gray-500">Address</dt>
                    <dd className="font-medium text-gray-900">
                      {[patient.address?.line1, patient.address?.city, patient.address?.state].filter(Boolean).join(', ') || 'N/A'}
                    </dd>
                  </div>
                </dl>
              </div>

              {/* Emergency Contact */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                <h3 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wider">Emergency Contact</h3>
                <dl className="space-y-3 text-sm">
                  <div>
                    <dt className="text-gray-500">Name ({patient.emergencyContact?.relation || 'Relation'})</dt>
                    <dd className="font-medium text-gray-900">{patient.emergencyContact?.name || 'N/A'}</dd>
                  </div>
                  <div>
                    <dt className="text-gray-500">Phone</dt>
                    <dd className="font-medium text-gray-900">{patient.emergencyContact?.phone || 'N/A'}</dd>
                  </div>
                </dl>
              </div>
            </div>

            <div className="lg:col-span-2 space-y-6">
              {/* Medical Profile */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Medical Profile</h3>
                  <Link href={`/dashboard/patients/${patientId}/edit`} className="text-sm text-blue-600 hover:underline">Edit</Link>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-2">Allergies</h4>
                    {patient.allergies?.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {patient.allergies.map((a, i) => <span key={i} className="px-2.5 py-1 bg-red-50 text-red-700 rounded-md text-xs font-medium border border-red-100">{a}</span>)}
                      </div>
                    ) : <p className="text-sm text-gray-400">None reported</p>}
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-2">Chronic Conditions</h4>
                    {patient.chronicConditions?.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {patient.chronicConditions.map((c, i) => <span key={i} className="px-2.5 py-1 bg-orange-50 text-orange-700 rounded-md text-xs font-medium border border-orange-100">{c}</span>)}
                      </div>
                    ) : <p className="text-sm text-gray-400">None reported</p>}
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-2">Current Medicines</h4>
                    {patient.currentMedicines?.length > 0 ? (
                      <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
                        {patient.currentMedicines.map((m, i) => <li key={i}>{m}</li>)}
                      </ul>
                    ) : <p className="text-sm text-gray-400">None reported</p>}
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-2">Habits</h4>
                    <ul className="text-sm text-gray-700 space-y-1">
                      <li><span className="text-gray-500">Smoking:</span> {patient.habits?.smoking || 'Unknown'}</li>
                      <li><span className="text-gray-500">Alcohol:</span> {patient.habits?.alcohol || 'Unknown'}</li>
                    </ul>
                  </div>
                </div>

                {patient.notes && (
                  <div className="mt-8 pt-6 border-t border-gray-100">
                    <h4 className="text-sm font-medium text-gray-500 mb-2">Medical Notes</h4>
                    <p className="text-sm text-gray-700 bg-yellow-50/50 p-4 rounded-lg border border-yellow-100">{patient.notes}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Medical History Timeline</h3>
            
            {history.length > 0 ? (
              <div className="relative border-l-2 border-gray-100 ml-3 md:ml-6 space-y-8 pb-4">
                {history.map((event, idx) => (
                  <div key={idx} className="relative pl-6 md:pl-8">
                    <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-white border-2 border-blue-500"></div>
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-1 gap-2">
                      <h4 className="text-sm font-bold text-gray-900">{event.title}</h4>
                      <time className="text-xs font-medium text-gray-500 bg-gray-50 px-2 py-1 rounded-md w-fit border border-gray-200">
                        {new Date(event.date).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true }).replace(',', '')}
                      </time>
                    </div>
                    <p className="text-sm text-gray-600 mt-2 bg-gray-50 p-3 rounded-lg border border-gray-100">{event.description}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-8 text-sm">No history events found.</p>
            )}
          </div>
        )}
        
        {activeTab === 'vitals' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Vitals History</h3>
            
            {vitalsHistory.length > 0 ? (
              <div className="space-y-4">
                {vitalsHistory.map((vital, idx) => (
                  <div key={idx} className="bg-gray-50 border border-gray-200 rounded-lg p-5">
                    <div className="flex justify-between items-center mb-3 pb-3 border-b border-gray-200">
                      <span className="font-medium text-gray-900">
                        {new Date(vital.recordedAt).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true }).replace(',', '')}
                      </span>
                      {vital.recordedBy && <span className="text-sm text-gray-500 font-medium">By: {vital.recordedBy.name}</span>}
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                      <div><p className="text-gray-500 text-xs uppercase mb-1">BP (mmHg)</p><p className="font-medium text-gray-900">{vital.bloodPressure?.systolic ? `${vital.bloodPressure.systolic}/${vital.bloodPressure.diastolic}` : '-'}</p></div>
                      <div><p className="text-gray-500 text-xs uppercase mb-1">Pulse (bpm)</p><p className="font-medium text-gray-900">{vital.pulseRate || '-'}</p></div>
                      <div><p className="text-gray-500 text-xs uppercase mb-1">SpO2 (%)</p><p className="font-medium text-gray-900">{vital.oxygenSaturation ? `${vital.oxygenSaturation}%` : '-'}</p></div>
                      <div><p className="text-gray-500 text-xs uppercase mb-1">Weight / BMI</p><p className="font-medium text-gray-900">{vital.weightKg ? `${vital.weightKg} kg` : '-'} / {vital.bmi || '-'}</p></div>
                      <div><p className="text-gray-500 text-xs uppercase mb-1">Temp (°C)</p><p className="font-medium text-gray-900">{vital.temperatureC || '-'}</p></div>
                      <div><p className="text-gray-500 text-xs uppercase mb-1">Resp. Rate</p><p className="font-medium text-gray-900">{vital.respiratoryRate || '-'}</p></div>
                      <div className="col-span-2"><p className="text-gray-500 text-xs uppercase mb-1">Blood Sugar</p><p className="font-medium text-gray-900">{vital.bloodSugar?.value ? `${vital.bloodSugar.value} mg/dL (${vital.bloodSugar.type})` : '-'}</p></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-8 text-sm">No vitals history found.</p>
            )}
          </div>
        )}

        {activeTab === 'prescriptions' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Prescriptions History</h3>
            
            {prescriptions.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left font-medium text-gray-500 uppercase">RX Code</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-500 uppercase">Date</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-4 py-3 text-right font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {prescriptions.map((p) => (
                      <tr key={p.id}>
                        <td className="px-4 py-4 font-medium text-gray-900">{p.prescriptionCode}</td>
                        <td className="px-4 py-4 text-gray-600">{new Date(p.createdAt).toLocaleDateString()}</td>
                        <td className="px-4 py-4">
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium capitalize 
                           ${p.status === 'finalized' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                           {p.status}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-right">
                          <Link href={`/dashboard/prescriptions/${p.id}`} className="text-blue-600 hover:underline">
                            View / Print
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-center text-gray-500 py-8 text-sm">No prescriptions found.</p>
            )}
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Recommended Tests</h3>
              </div>
              {tests.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left font-medium text-gray-500 uppercase">Test Name</th>
                        <th className="px-4 py-3 text-left font-medium text-gray-500 uppercase">Date</th>
                        <th className="px-4 py-3 text-left font-medium text-gray-500 uppercase">Recommended By</th>
                        <th className="px-4 py-3 text-left font-medium text-gray-500 uppercase">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {tests.map(t => (
                        <tr key={t._id}>
                          <td className="px-4 py-4 font-medium text-gray-900">{t.name}</td>
                          <td className="px-4 py-4 text-gray-600">{new Date(t.recommendedAt).toLocaleDateString()}</td>
                          <td className="px-4 py-4 text-gray-600">Dr. {t.doctorId?.userId?.name || "Unknown"}</td>
                          <td className="px-4 py-4"><TestStatusBadge status={t.status} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-center text-gray-500 py-8 text-sm border-2 border-dashed rounded-lg">No tests have been recommended for this patient.</p>
              )}
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Medical Reports</h3>
                <button 
                  onClick={() => setIsUploadModalOpen(true)}
                  className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-sm transition-colors"
                >
                  <Upload className="w-4 h-4 mr-2" /> Upload Report
                </button>
              </div>
              
              {reports.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left font-medium text-gray-500 uppercase">Report Name</th>
                        <th className="px-4 py-3 text-left font-medium text-gray-500 uppercase">Date</th>
                        <th className="px-4 py-3 text-left font-medium text-gray-500 uppercase">Status</th>
                        <th className="px-4 py-3 text-right font-medium text-gray-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {reports.map((r) => (
                        <tr key={r._id}>
                          <td className="px-4 py-4 font-medium text-gray-900">{r.title}</td>
                          <td className="px-4 py-4 text-gray-600">{new Date(r.reportDate).toLocaleDateString()}</td>
                          <td className="px-4 py-4"><ReportStatusBadge status={r.reviewStatus} /></td>
                          <td className="px-4 py-4 text-right">
                            <Link href={`/dashboard/medical-reports/${r._id}`} className="text-blue-600 hover:underline">
                              View
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-center text-gray-500 py-8 text-sm border-2 border-dashed rounded-lg">No medical reports uploaded yet.</p>
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

        {activeTab === 'visits' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
            <div className="w-16 h-16 bg-gray-50 text-gray-400 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Coming Soon</h3>
            <p className="text-gray-500 text-sm">This section will be available after the related module is implemented.</p>
          </div>
        )}
      </div>
    </div>
  );
}

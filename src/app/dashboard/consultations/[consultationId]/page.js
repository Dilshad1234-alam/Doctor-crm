"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import PageHeader from "@/frontend/components/dashboard/PageHeader";
import { getConsultationById, updateConsultation, completeConsultation } from "@/frontend/services/consultationApi";
import Button from "@/frontend/components/ui/Button";

export default function ConsultationRoomPage({ params, searchParams }) {
  const unwrappedParams = use(params);
  const consultationId = unwrappedParams.consultationId;
  
  // Unwrap searchParams correctly
  const unwrappedSearchParams = searchParams ? use(searchParams) : {};
  const fromPatient = unwrappedSearchParams.fromPatient;

  const router = useRouter();

  const [consultation, setConsultation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // Form State
  const [chiefComplaints, setChiefComplaints] = useState([]);
  const [symptoms, setSymptoms] = useState([]);
  const [diagnoses, setDiagnoses] = useState([]);
  const [recommendedTests, setRecommendedTests] = useState([]);
  
  const [generalExam, setGeneralExam] = useState("");
  const [cardioExam, setCardioExam] = useState("");
  const [respExam, setRespExam] = useState("");
  
  const [assessment, setAssessment] = useState("");
  const [advice, setAdvice] = useState("");
  const [privateNotes, setPrivateNotes] = useState("");
  
  const [followUpReq, setFollowUpReq] = useState(false);
  const [followUpDate, setFollowUpDate] = useState("");
  const [followUpReason, setFollowUpReason] = useState("");

  useEffect(() => {
    fetchData();
  }, [consultationId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await getConsultationById(consultationId);
      setConsultation(data);
      
      // Populate state
      setChiefComplaints(data.chiefComplaints || []);
      setSymptoms(data.symptoms || []);
      setDiagnoses(data.diagnoses || []);
      setRecommendedTests(data.recommendedTests || []);
      
      setGeneralExam(data.clinicalExamination?.general || "");
      setCardioExam(data.clinicalExamination?.cardiovascular || "");
      setRespExam(data.clinicalExamination?.respiratory || "");
      
      setAssessment(data.assessment || "");
      setAdvice(data.advice || "");
      setPrivateNotes(data.privateDoctorNotes || "");
      
      if (data.followUp) {
        setFollowUpReq(data.followUp.required || false);
        setFollowUpDate(data.followUp.date ? new Date(data.followUp.date).toISOString().split('T')[0] : "");
        setFollowUpReason(data.followUp.reason || "");
      }
    } catch (err) {
      setError(err.message || "Failed to load consultation");
    } finally {
      setLoading(false);
    }
  };

  const preparePayload = () => {
    return {
      chiefComplaints: chiefComplaints.filter(c => c.complaint.trim()),
      symptoms: symptoms.filter(s => s.name.trim()),
      diagnoses: diagnoses.filter(d => d.name.trim()),
      recommendedTests: recommendedTests.filter(t => t.name.trim()),
      clinicalExamination: {
        general: generalExam,
        cardiovascular: cardioExam,
        respiratory: respExam
      },
      assessment,
      advice,
      privateDoctorNotes: privateNotes,
      followUp: {
        required: followUpReq,
        date: followUpDate ? new Date(followUpDate).toISOString() : null,
        reason: followUpReason
      }
    };
  };

  const handleSaveDraft = async () => {
    setSaving(true);
    try {
      const payload = preparePayload();
      const updated = await updateConsultation(consultationId, payload);
      setConsultation(updated);
      alert("Draft saved successfully");
    } catch (err) {
      alert("Failed to save draft: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleComplete = async () => {
    if (!confirm("Complete this consultation? After completion, normal editing will be locked.")) return;
    
    setSaving(true);
    try {
      const payload = preparePayload();
      
      if (payload.chiefComplaints.length === 0 && !payload.assessment) {
         alert("Please enter at least one chief complaint or an assessment.");
         setSaving(false);
         return;
      }

      const updated = await completeConsultation(consultationId, payload);
      setConsultation(updated);
      alert("Consultation completed!");
      
      const aptId = updated.appointment?._id || consultation.appointment?._id || consultation.appointment;
      if (aptId) {
        router.push(`/dashboard/appointments/${aptId}/billing`);
      } else {
        router.push("/dashboard/queue");
      }
    } catch (err) {
      alert("Failed to complete: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  // --- Helpers for Dynamic Arrays ---
  const addComplaint = () => setChiefComplaints([...chiefComplaints, { complaint: "", duration: "" }]);
  const updateComplaint = (index, field, value) => {
    const newArr = [...chiefComplaints];
    newArr[index][field] = value;
    setChiefComplaints(newArr);
  };
  const removeComplaint = (index) => setChiefComplaints(chiefComplaints.filter((_, i) => i !== index));

  const addSymptom = () => setSymptoms([...symptoms, { name: "", severity: "not_specified" }]);
  const updateSymptom = (index, field, value) => {
    const newArr = [...symptoms];
    newArr[index][field] = value;
    setSymptoms(newArr);
  };
  const removeSymptom = (index) => setSymptoms(symptoms.filter((_, i) => i !== index));

  const addDiagnosis = () => setDiagnoses([...diagnoses, { name: "", type: "primary" }]);
  const updateDiagnosis = (index, field, value) => {
    const newArr = [...diagnoses];
    newArr[index][field] = value;
    setDiagnoses(newArr);
  };
  const removeDiagnosis = (index) => setDiagnoses(diagnoses.filter((_, i) => i !== index));

  if (loading) return <div className="p-8 text-center text-gray-500 animate-pulse">Loading Consultation Workspace...</div>;
  if (error) return <div className="p-8 text-red-600 bg-red-50 rounded-lg">{error}</div>;

  const isCompleted = consultation?.status === "completed";
  const p = consultation.patient;
  const apt = consultation.appointment;

  return (
    <div className="pb-12 max-w-7xl mx-auto">
      {fromPatient ? (
        <div className="mb-4">
          <Link href={`/dashboard/patients/${fromPatient}?tab=consultations`} className="text-blue-600 hover:underline flex items-center text-sm font-medium">
            &larr; Back to Patient
          </Link>
        </div>
      ) : (
        <div className="mb-4">
          <Link href="/dashboard/queue" className="text-blue-600 hover:underline flex items-center text-sm font-medium">
            &larr; Back to Queue
          </Link>
        </div>
      )}
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-[#0f3d69] to-[#2ab5e1]">
            Consultation Workspace
          </h1>
          <p className="mt-2 text-sm font-medium text-gray-500">
            {consultation.patientId?.userId?.name || "Patient"} • {consultation.consultationCode}
          </p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Link href={`/dashboard/consultations/${consultationId}/prescription`}>
            <Button variant="outline">
              Manage Prescription
            </Button>
          </Link>
          <Button variant="outline" onClick={() => router.back()}>Back</Button>
          {!isCompleted && (
            <>
              <Button variant="secondary" onClick={handleSaveDraft} disabled={saving}>Save Draft</Button>
              <Button onClick={handleComplete} disabled={saving}>Complete Consultation</Button>
            </>
          )}
          {isCompleted && (
            <Link href={`/dashboard/appointments/${consultation.appointment?._id || consultation.appointment}/billing`}>
              <Button>Proceed to Billing</Button>
            </Link>
          )}
        </div>
      </div>

      {isCompleted && (
        <div className="mb-6 p-4 bg-blue-50 text-blue-800 rounded-lg border border-blue-200 font-medium">
          This consultation has been completed and is now read-only.
        </div>
      )}

      {/* Patient Summary Header */}
      <div className="bg-white border rounded-lg shadow-sm p-4 mb-6 grid grid-cols-2 md:grid-cols-4 gap-4">
         <div>
           <p className="text-xs text-gray-500">Patient Name</p>
           <p className="font-bold text-gray-900">{p?.fullName}</p>
         </div>
         <div>
           <p className="text-xs text-gray-500">Age / Gender / Blood</p>
           <p className="font-bold text-gray-900">{p?.age} / {p?.gender} / {p?.bloodGroup || '--'}</p>
         </div>
         <div>
           <p className="text-xs text-gray-500">Appointment Code</p>
           <p className="font-bold text-gray-900">{apt?.appointmentCode}</p>
         </div>
         <div>
           <p className="text-xs text-gray-500">Visit Type</p>
           <p className="font-bold text-gray-900 capitalize">{apt?.visitType?.replace('_', ' ')}</p>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Chief Complaints */}
          <div className="bg-white border rounded-lg shadow-sm p-5">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-gray-900">Chief Complaints</h3>
              {!isCompleted && <button onClick={addComplaint} className="text-sm text-indigo-600 hover:underline">+ Add</button>}
            </div>
            <div className="space-y-3">
              {chiefComplaints.map((c, i) => (
                <div key={i} className="flex gap-3 items-start">
                  <input 
                    className="flex-1 border-gray-300 rounded-md text-sm" placeholder="Complaint (e.g. Fever)"
                    value={c.complaint} onChange={(e) => updateComplaint(i, 'complaint', e.target.value)} disabled={isCompleted}
                  />
                  <input 
                    className="w-32 border-gray-300 rounded-md text-sm" placeholder="Duration (e.g. 3 days)"
                    value={c.duration} onChange={(e) => updateComplaint(i, 'duration', e.target.value)} disabled={isCompleted}
                  />
                  {!isCompleted && <button onClick={() => removeComplaint(i)} className="text-red-500 text-sm mt-2">Remove</button>}
                </div>
              ))}
              {chiefComplaints.length === 0 && <p className="text-sm text-gray-500">No complaints added.</p>}
            </div>
          </div>

          {/* Symptoms */}
          <div className="bg-white border rounded-lg shadow-sm p-5">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-gray-900">Symptoms</h3>
              {!isCompleted && <button onClick={addSymptom} className="text-sm text-indigo-600 hover:underline">+ Add</button>}
            </div>
            <div className="space-y-3">
              {symptoms.map((s, i) => (
                <div key={i} className="flex gap-3 items-start">
                  <input 
                    className="flex-1 border-gray-300 rounded-md text-sm" placeholder="Symptom"
                    value={s.name} onChange={(e) => updateSymptom(i, 'name', e.target.value)} disabled={isCompleted}
                  />
                  <select 
                    className="w-32 border-gray-300 rounded-md text-sm"
                    value={s.severity} onChange={(e) => updateSymptom(i, 'severity', e.target.value)} disabled={isCompleted}
                  >
                    <option value="not_specified">Unknown</option>
                    <option value="mild">Mild</option>
                    <option value="moderate">Moderate</option>
                    <option value="severe">Severe</option>
                  </select>
                  {!isCompleted && <button onClick={() => removeSymptom(i)} className="text-red-500 text-sm mt-2">Remove</button>}
                </div>
              ))}
              {symptoms.length === 0 && <p className="text-sm text-gray-500">No symptoms added.</p>}
            </div>
          </div>

          {/* Clinical Examination */}
          <div className="bg-white border rounded-lg shadow-sm p-5">
            <h3 className="font-bold text-gray-900 mb-4">Clinical Examination</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">General</label>
                <textarea className="w-full text-sm border-gray-300 rounded-md" rows="2" value={generalExam} onChange={e=>setGeneralExam(e.target.value)} disabled={isCompleted} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Cardiovascular</label>
                <textarea className="w-full text-sm border-gray-300 rounded-md" rows="2" value={cardioExam} onChange={e=>setCardioExam(e.target.value)} disabled={isCompleted} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Respiratory</label>
                <textarea className="w-full text-sm border-gray-300 rounded-md" rows="2" value={respExam} onChange={e=>setRespExam(e.target.value)} disabled={isCompleted} />
              </div>
            </div>
          </div>

          {/* Diagnosis */}
          <div className="bg-white border rounded-lg shadow-sm p-5">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-gray-900">Diagnosis</h3>
              {!isCompleted && <button onClick={addDiagnosis} className="text-sm text-indigo-600 hover:underline">+ Add</button>}
            </div>
            <div className="space-y-3">
              {diagnoses.map((d, i) => (
                <div key={i} className="flex gap-3 items-start">
                  <input 
                    className="flex-1 border-gray-300 rounded-md text-sm" placeholder="Diagnosis (e.g. Viral Fever)"
                    value={d.name} onChange={(e) => updateDiagnosis(i, 'name', e.target.value)} disabled={isCompleted}
                  />
                  <select 
                    className="w-36 border-gray-300 rounded-md text-sm capitalize"
                    value={d.type} onChange={(e) => updateDiagnosis(i, 'type', e.target.value)} disabled={isCompleted}
                  >
                    <option value="primary">Primary</option>
                    <option value="secondary">Secondary</option>
                    <option value="provisional">Provisional</option>
                    <option value="differential">Differential</option>
                  </select>
                  {!isCompleted && <button onClick={() => removeDiagnosis(i)} className="text-red-500 text-sm mt-2">Remove</button>}
                </div>
              ))}
              {diagnoses.length === 0 && <p className="text-sm text-gray-500">No diagnoses added.</p>}
            </div>
          </div>

        </div>

        {/* Right Column */}
        <div className="lg:col-span-1 space-y-6">
          
          <div className="bg-white border rounded-lg shadow-sm p-5">
            <h3 className="font-bold text-gray-900 mb-3">Assessment & Advice</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Doctor Assessment</label>
                <textarea 
                  rows={3} className="w-full border-gray-300 rounded-md text-sm shadow-sm"
                  value={assessment} onChange={(e) => setAssessment(e.target.value)} disabled={isCompleted}
                  placeholder="Overall clinical assessment..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">General Advice</label>
                <textarea 
                  rows={3} className="w-full border-gray-300 rounded-md text-sm shadow-sm"
                  value={advice} onChange={(e) => setAdvice(e.target.value)} disabled={isCompleted}
                  placeholder="Take rest, hydration..."
                />
              </div>
            </div>
          </div>

          <div className="bg-white border rounded-lg shadow-sm p-5">
            <h3 className="font-bold text-gray-900 mb-3">Follow-up Plan</h3>
            <div className="space-y-3">
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={followUpReq} onChange={e=>setFollowUpReq(e.target.checked)} disabled={isCompleted} className="rounded text-indigo-600" />
                <span className="text-sm font-medium">Follow-up Required</span>
              </label>
              
              {followUpReq && (
                <>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Date</label>
                    <input type="date" className="w-full text-sm border-gray-300 rounded-md" value={followUpDate} onChange={e=>setFollowUpDate(e.target.value)} disabled={isCompleted} />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Reason</label>
                    <input type="text" className="w-full text-sm border-gray-300 rounded-md" value={followUpReason} onChange={e=>setFollowUpReason(e.target.value)} disabled={isCompleted} placeholder="e.g. Review CBC reports" />
                  </div>
                </>
              )}
            </div>
          </div>

          {consultation.privateDoctorNotes !== undefined && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-5">
              <h3 className="font-bold text-yellow-800 mb-2">Private Doctor Notes</h3>
              <p className="text-xs text-yellow-700 mb-3">These notes are strictly for internal medical staff.</p>
              <textarea 
                rows={4} className="w-full border-yellow-300 bg-yellow-50 rounded-md text-sm"
                value={privateNotes} onChange={(e) => setPrivateNotes(e.target.value)} disabled={isCompleted}
              />
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

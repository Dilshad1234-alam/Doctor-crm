"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Calendar, Clock, CheckCircle2, User } from "lucide-react";
import { getAvailableSlots, createAppointment } from "@/frontend/services/appointmentApi";
import { useAuth } from "@/frontend/context/AuthContext";

export default function PatientBookAppointmentPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Data
  const [doctors, setDoctors] = useState([]);
  const [slots, setSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);

  // Form State
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSlot, setSelectedSlot] = useState(null);
  
  const [visitType, setVisitType] = useState("new_consultation");
  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState("");

  // Step 1: Fetch Doctors
  useEffect(() => {
    if (step === 1 && doctors.length === 0) {
      const fetchDocs = async () => {
        try {
          const res = await fetch("/api/doctors");
          const data = await res.json();
          if (data.success) {
            setDoctors(data.doctors || []);
          }
        } catch (e) {
          console.error(e);
        }
      };
      fetchDocs();
    }
  }, [step, doctors.length]);

  // URL Params handling
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const doctorId = searchParams.get('doctorId');
    const date = searchParams.get('date');
    const time = searchParams.get('time');

    if (doctorId && doctors.length > 0 && !selectedDoctor) {
      const doc = doctors.find(d => d.id === doctorId || d._id === doctorId);
      if (doc) {
        setSelectedDoctor(doc);
        if (date) {
          setSelectedDate(date);
          if (time) {
            // Need to set selected slot which will be fetched in step 3
            // So we jump straight to step 3, then it fetches, then we select
            setStep(3);
          } else {
            setStep(2);
          }
        } else {
          setStep(2);
        }
      }
    }
  }, [doctors, selectedDoctor]);

  // Step 3: Fetch Slots
  useEffect(() => {
    if ((step === 3 || step === 4) && selectedDoctor && selectedDate) {
      const fetchSlotsData = async () => {
        setSlotsLoading(true);
        try {
          const res = await getAvailableSlots(selectedDoctor.id || selectedDoctor._id, selectedDate);
          if (res.success) {
            setSlots(res.slots || []);
            // Pre-select slot if time param exists
            const timeParam = new URLSearchParams(window.location.search).get('time');
            if (timeParam && !selectedSlot) {
              const slotMatch = res.slots.find(s => s.startTime === timeParam);
              if (slotMatch) {
                setSelectedSlot(slotMatch);
                setStep(4);
              }
            }
          } else {
            setSlots([]);
            setError(res.message);
          }
        } catch (e) {
          setError("Failed to load slots");
        } finally {
          setSlotsLoading(false);
        }
      };
      fetchSlotsData();
    }
  }, [step, selectedDoctor, selectedDate]);

  const handleSubmit = async () => {
    if (!user?.patientId) {
      setError("Patient profile is not fully set up. Please contact the clinic.");
      return;
    }

    if (!selectedDoctor || !selectedDate || !selectedSlot) {
      setError("Please complete all steps");
      return;
    }
    
    setLoading(true);
    setError("");
    
    try {
      const payload = {
        patientId: user.patientId, // Patient books for themselves
        doctorId: selectedDoctor.id || selectedDoctor._id,
        appointmentDate: selectedDate,
        startTime: selectedSlot.startTime,
        visitType,
        reason,
        notes
      };

      const res = await createAppointment(payload);
      if (res.success) {
        // Redirect to patient appointments view
        router.push(`/patient/appointments`);
      } else {
        setError(res.message || "Failed to book appointment");
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Error booking appointment");
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) return <div>Loading...</div>;

  return (
    <div className="w-full space-y-6 pb-12">
      <div className="flex items-center">
        <Link href="/patient/dashboard" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mr-4">
          <ChevronLeft className="w-4 h-4 mr-1" /> Back
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Book Appointment</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Progress Bar */}
        <div className="bg-gray-50 border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full ${step >= i ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'} text-sm font-medium`}>
                  {i}
                </div>
                {i < 4 && <div className={`w-12 md:w-24 h-1 mx-2 rounded ${step > i ? 'bg-blue-600' : 'bg-gray-200'}`}></div>}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-xs font-medium text-gray-500">
            <span className={step >= 1 ? 'text-blue-600' : ''}>Doctor</span>
            <span className={step >= 2 ? 'text-blue-600' : ''}>Date</span>
            <span className={step >= 3 ? 'text-blue-600' : ''}>Slot</span>
            <span className={step >= 4 ? 'text-blue-600' : ''}>Confirm</span>
          </div>
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg border border-red-100 text-sm">
              {error}
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-gray-900">Select Doctor</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {doctors.filter(d => d.isActive && d.isAcceptingAppointments).map(d => (
                  <div 
                    key={d.id || d._id} 
                    onClick={() => setSelectedDoctor(d)}
                    className={`p-4 border rounded-lg cursor-pointer flex flex-col ${
                      (selectedDoctor?.id || selectedDoctor?._id) === (d.id || d._id) 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <p className="font-medium text-gray-900">{d.userId?.name || d.specialization}</p>
                      {(selectedDoctor?.id || selectedDoctor?._id) === (d.id || d._id) && <CheckCircle2 className="w-5 h-5 text-blue-600" />}
                    </div>
                    <p className="text-sm text-gray-500">{d.specialization}</p>
                    <p className="text-sm font-medium text-gray-900 mt-2">Fee: ₹{d.consultationFee}</p>
                  </div>
                ))}
                {doctors.length === 0 && (
                   <p className="text-sm text-gray-500 col-span-2">No doctors available at the moment.</p>
                )}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-gray-900">Select Date</h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Appointment Date</label>
                <input
                  type="date"
                  value={selectedDate}
                  min={new Date().toISOString().split("T")[0]}
                  onChange={(e) => {
                    setSelectedDate(e.target.value);
                    setSelectedSlot(null); // Reset slot if date changes
                  }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-gray-900">Select Available Slot</h2>
              <p className="text-sm text-gray-500">For {new Date(selectedDate).toLocaleDateString()} with {selectedDoctor?.userId?.name || selectedDoctor?.specialization}</p>
              
              {slotsLoading ? (
                <div className="flex justify-center py-10"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>
              ) : slots.length === 0 ? (
                <div className="text-center py-10 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-sm text-gray-500">No slots available for this date.</p>
                </div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                  {slots.map((slot, idx) => (
                    <button
                      key={idx}
                      disabled={slot.isBooked}
                      onClick={() => setSelectedSlot(slot)}
                      className={`py-2 px-3 text-sm rounded-md border font-medium transition-colors ${
                        slot.isBooked 
                          ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                          : selectedSlot?.startTime === slot.startTime 
                            ? 'bg-blue-600 text-white border-blue-600 shadow-sm' 
                            : 'bg-white text-gray-700 border-gray-300 hover:border-blue-500 hover:bg-blue-50'
                      }`}
                    >
                      {slot.startTime}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6">
              <h2 className="text-lg font-bold text-gray-900">Review & Confirm</h2>
              
              <div className="bg-gray-50 rounded-lg border border-gray-200 p-5 space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="block text-gray-500 mb-1">Doctor</span>
                    <span className="font-medium text-gray-900">{selectedDoctor?.userId?.name || selectedDoctor?.specialization}</span>
                  </div>
                  <div>
                    <span className="block text-gray-500 mb-1">Date</span>
                    <span className="font-medium text-gray-900">{new Date(selectedDate).toLocaleDateString()}</span>
                  </div>
                  <div>
                    <span className="block text-gray-500 mb-1">Time</span>
                    <span className="font-medium text-gray-900">{selectedSlot?.startTime}</span>
                  </div>
                  <div>
                    <span className="block text-gray-500 mb-1">Consultation Fee</span>
                    <span className="font-medium text-gray-900">₹{selectedDoctor?.consultationFee}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Visit Type</label>
                  <select
                    value={visitType}
                    onChange={(e) => setVisitType(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm"
                  >
                    <option value="new_consultation">New Consultation</option>
                    <option value="follow_up">Follow Up</option>
                    <option value="regular_checkup">Regular Checkup</option>
                    <option value="emergency">Emergency</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Reason for Visit</label>
                  <input
                    type="text"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="E.g., Fever and headache"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="mt-8 pt-6 border-t border-gray-200 flex justify-between">
            <button
              onClick={() => setStep(step - 1)}
              disabled={step === 1}
              className={`px-4 py-2 text-sm font-medium rounded-lg border ${
                step === 1 
                  ? 'border-gray-200 text-gray-400 bg-gray-50' 
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              Previous
            </button>
            
            {step < 4 ? (
              <button
                onClick={() => setStep(step + 1)}
                disabled={
                  (step === 1 && !selectedDoctor) ||
                  (step === 2 && !selectedDate) ||
                  (step === 3 && !selectedSlot)
                }
                className="px-6 py-2 text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors flex items-center"
              >
                Next <ChevronRight className="w-4 h-4 ml-1" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="px-6 py-2 text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-wait transition-colors flex items-center"
              >
                {loading ? 'Confirming...' : 'Confirm Appointment'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

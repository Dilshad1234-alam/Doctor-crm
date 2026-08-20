"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Calendar, Clock, CheckCircle2, User, MapPin, Phone, CreditCard, Smartphone, ShieldCheck } from "lucide-react";
import { getAvailableSlots, createAppointment } from "@/frontend/services/appointmentApi";
import { useAuth } from "@/frontend/context/AuthContext";

export default function PatientBookAppointmentPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Data
  const [clinic, setClinic] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [slots, setSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);

  // Form State
  const [activeClinicId, setActiveClinicId] = useState(null);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSlot, setSelectedSlot] = useState(null);
  
  const [visitType, setVisitType] = useState("new_consultation");
  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("card");

  // Initialization: URL -> pendingBooking -> localStorage
  useEffect(() => {
    const init = async () => {
      let resolvedClinicId = null;
      let doctorToSelect = null;
      let dateToSelect = null;
      let timeToSelect = null;
      let startStep = 1;

      if (typeof window !== "undefined") {
        const searchParams = new URLSearchParams(window.location.search);
        
        // 1. Check URL
        if (searchParams.get('clinicId')) {
          resolvedClinicId = searchParams.get('clinicId');
          doctorToSelect = searchParams.get('doctorId');
          dateToSelect = searchParams.get('date');
          timeToSelect = searchParams.get('time');
        } 
        // 2. Check pending booking
        else {
          const storedPending = localStorage.getItem("pendingBooking");
          if (storedPending) {
            try {
              const parsed = JSON.parse(storedPending);
              if (parsed.clinicId) resolvedClinicId = parsed.clinicId;
              if (parsed.doctorId) doctorToSelect = parsed.doctorId;
              if (parsed.appointmentDate) dateToSelect = parsed.appointmentDate;
              if (parsed.startTime) timeToSelect = parsed.startTime;
            } catch (e) {}
          }
        }
        
        // 3. Check selectedClinicId
        if (!resolvedClinicId) {
          resolvedClinicId = localStorage.getItem("selectedClinicId");
        }
      }

      if (resolvedClinicId) {
        setActiveClinicId(resolvedClinicId);
        
        // Fetch Clinic Details
        try {
          // We can use the public clinic fetch by ID if we have it, or fallback.
          // Since we might only have an ID, not a slug, we use the public API by ID.
          const res = await fetch(`/api/public/clinics/${resolvedClinicId}`);
          const data = await res.json();
          if (data.success && data.data) {
            setClinic(data.data.clinic);
          }
        } catch (err) {
          console.error(err);
        }

        // Fetch Doctors for this clinic
        try {
          const res = await fetch(`/api/doctors?clinicId=${resolvedClinicId}`);
          const data = await res.json();
          if (data.success && data.doctors) {
            setDoctors(data.doctors);
            
            if (doctorToSelect) {
              const doc = data.doctors.find(d => 
                d.profile?._id === doctorToSelect || 
                d.profile?.id === doctorToSelect || 
                d.doctor?._id === doctorToSelect || 
                d._id === doctorToSelect || 
                d.id === doctorToSelect
              );
              if (doc) {
                setSelectedDoctor(doc);
                startStep = 2;
                if (dateToSelect) {
                  setSelectedDate(dateToSelect);
                  startStep = 3;
                  if (timeToSelect) {
                    // We'll set a temporary slot object, step 3 effect will load real slots
                    setSelectedSlot({ startTime: timeToSelect });
                    startStep = 4;
                  }
                }
              }
            }
          }
        } catch (e) {
          console.error(e);
        }
        
        setStep(startStep);
      } else {
        // Fetch generic doctors (will fallback to PatientClinic in backend)
        try {
          const res = await fetch(`/api/doctors`);
          const data = await res.json();
          if (data.success && data.doctors) {
            setDoctors(data.doctors);
            // We can also fetch the clinic info from the first doctor's clinicId if needed
            if (data.doctors.length > 0 && data.doctors[0].clinicId) {
              const cid = data.doctors[0].clinicId;
              setActiveClinicId(cid);
              if (typeof window !== "undefined") localStorage.setItem("selectedClinicId", cid);
              const cres = await fetch(`/api/public/clinics/${cid}`);
              const cdata = await cres.json();
              if (cdata.success && cdata.data) {
                setClinic(cdata.data.clinic);
              }
            }
          }
        } catch (e) {
          console.error(e);
        }
      }
    };
    init();
  }, []);

  // Step 3: Fetch Slots
  useEffect(() => {
    if ((step === 3 || step === 4) && selectedDoctor && selectedDate) {
      const fetchSlotsData = async () => {
        setSlotsLoading(true);
        try {
          const finalClinicId = activeClinicId || selectedDoctor.profile?.clinicId || selectedDoctor.clinicId;
          const docId = selectedDoctor.doctor?._id || selectedDoctor.profile?.doctorId || selectedDoctor._id || selectedDoctor.id;
          const res = await getAvailableSlots(finalClinicId, docId, selectedDate);
          if (res.success) {
            setSlots(res.slots || []);
            
            // If we have a pre-selected slot time from initialization
            if (selectedSlot && !selectedSlot._id) {
               const slotMatch = res.slots.find(s => s.startTime === selectedSlot.startTime);
               if (slotMatch) {
                 setSelectedSlot(slotMatch);
               } else {
                 setSelectedSlot(null); // Invalid slot
                 setStep(3);
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

    if (!selectedDoctor || !selectedDate || !selectedSlot || !selectedSlot.startTime) {
      setError("Please complete all steps");
      return;
    }
    
    setLoading(true);
    setError("");
    
    try {
      const finalClinicId = activeClinicId || selectedDoctor.profile?.clinicId || selectedDoctor.clinicId;
      const docId = selectedDoctor.doctor?._id || selectedDoctor.profile?.doctorId || selectedDoctor._id || selectedDoctor.id;
      
      const payload = {
        patientId: user.patientId, // Patient books for themselves
        doctorId: docId,
        appointmentDate: selectedDate,
        startTime: selectedSlot.startTime,
        visitType,
        reason,
        notes,
        clinicId: finalClinicId
      };

      const res = await createAppointment(payload);
      if (res.success) {
        if (typeof window !== "undefined") {
          localStorage.removeItem("pendingBooking");
        }
        // Redirect to patient dashboard
        router.push(`/patient/dashboard`);
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
      
      {/* Clinic Details Header */}
      {clinic && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-bold tracking-wider text-blue-600 uppercase mb-1">Selected Clinic</p>
              <h2 className="text-xl font-bold text-gray-900 mb-2">{clinic.name}</h2>
              <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 mr-1 text-gray-400" />
                  <span>{clinic.address?.line1}, {clinic.address?.city}</span>
                </div>
                {clinic.phone && (
                  <div className="flex items-center">
                    <Phone className="w-4 h-4 mr-1 text-gray-400" />
                    <span>{clinic.phone}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

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
            <span className={step >= 4 ? 'text-blue-600' : ''}>Pay & Confirm</span>
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
                {doctors.filter(d => (d.doctor?.isActive ?? d.profile?.isActive ?? d.isActive) && (d.profile?.isAcceptingAppointments ?? d.isAcceptingAppointments)).map(d => {
                  const docId = d.profile?._id || d.profile?.id || d._id || d.id;
                  const docName = d.doctor?.name || d.userId?.name || d.specialization;
                  const docSpec = d.profile?.specialization || d.specialization;
                  const docFee = d.profile?.consultationFee || d.consultationFee;
                  const isSelected = (selectedDoctor?.profile?._id || selectedDoctor?.profile?.id || selectedDoctor?._id || selectedDoctor?.id) === docId;
                  
                  return (
                    <div 
                      key={docId} 
                      onClick={() => setSelectedDoctor(d)}
                      className={`p-4 border rounded-lg cursor-pointer flex flex-col ${
                        isSelected 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-200 hover:border-blue-300'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <p className="font-medium text-gray-900">{docName}</p>
                        {isSelected && <CheckCircle2 className="w-5 h-5 text-blue-600" />}
                      </div>
                      <p className="text-sm text-gray-500">{docSpec}</p>
                      <p className="text-sm font-medium text-gray-900 mt-2">Fee: ₹{docFee}</p>
                    </div>
                  );
                })}
                {doctors.filter(d => (d.doctor?.isActive ?? d.profile?.isActive ?? d.isActive) && (d.profile?.isAcceptingAppointments ?? d.isAcceptingAppointments)).length === 0 && (
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
              <p className="text-sm text-gray-500">For {new Date(selectedDate).toLocaleDateString()} with {selectedDoctor?.userId?.name || selectedDoctor?.doctor?.name || selectedDoctor?.specialization}</p>
              
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
              <h2 className="text-lg font-bold text-gray-900">Review & Payment</h2>
              
              <div className="bg-gray-50 rounded-lg border border-gray-200 p-5 space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="block text-gray-500 mb-1">Clinic</span>
                    <span className="font-medium text-gray-900">{clinic?.name || "Selected Clinic"}</span>
                  </div>
                  <div>
                    <span className="block text-gray-500 mb-1">Doctor</span>
                    <span className="font-medium text-gray-900">{selectedDoctor?.userId?.name || selectedDoctor?.doctor?.name || selectedDoctor?.specialization}</span>
                  </div>
                  <div>
                    <span className="block text-gray-500 mb-1">Date</span>
                    <span className="font-medium text-gray-900">{new Date(selectedDate).toLocaleDateString()}</span>
                  </div>
                  <div>
                    <span className="block text-gray-500 mb-1">Time</span>
                    <span className="font-medium text-gray-900">{selectedSlot?.startTime}</span>
                  </div>
                  <div className="col-span-2 pt-3 border-t border-gray-200 flex justify-between items-center">
                    <span className="block font-bold text-gray-700">Total Consultation Fee</span>
                    <span className="font-black text-xl text-blue-600">₹{selectedDoctor?.profile?.consultationFee || selectedDoctor?.consultationFee || 500}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

                {/* Fake Payment UI */}
                <div className="space-y-4 bg-white p-5 border border-gray-200 rounded-xl shadow-sm">
                  <h3 className="font-bold text-gray-900 mb-2">Payment Details</h3>
                  <div className="flex gap-3 mb-4">
                    <label className={`flex-1 flex flex-col items-center justify-center p-3 border rounded-lg cursor-pointer ${paymentMethod === 'card' ? 'border-blue-500 bg-blue-50 text-blue-600' : 'border-gray-200 hover:bg-gray-50'}`}>
                      <input type="radio" name="payment" value="card" checked={paymentMethod === 'card'} onChange={() => setPaymentMethod('card')} className="sr-only" />
                      <CreditCard className="w-6 h-6 mb-1" />
                      <span className="text-xs font-medium">Card</span>
                    </label>
                    <label className={`flex-1 flex flex-col items-center justify-center p-3 border rounded-lg cursor-pointer ${paymentMethod === 'upi' ? 'border-blue-500 bg-blue-50 text-blue-600' : 'border-gray-200 hover:bg-gray-50'}`}>
                      <input type="radio" name="payment" value="upi" checked={paymentMethod === 'upi'} onChange={() => setPaymentMethod('upi')} className="sr-only" />
                      <Smartphone className="w-6 h-6 mb-1" />
                      <span className="text-xs font-medium">UPI</span>
                    </label>
                  </div>

                  {paymentMethod === 'card' && (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1">Card Number</label>
                        <input type="text" placeholder="XXXX XXXX XXXX XXXX" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm" />
                      </div>
                      <div className="flex gap-3">
                        <div className="flex-1">
                          <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1">Expiry</label>
                          <input type="text" placeholder="MM/YY" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm" />
                        </div>
                        <div className="flex-1">
                          <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1">CVV</label>
                          <input type="password" placeholder="***" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm" />
                        </div>
                      </div>
                    </div>
                  )}

                  {paymentMethod === 'upi' && (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1">UPI ID</label>
                        <input type="text" placeholder="username@upi" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm" />
                      </div>
                      <p className="text-xs text-gray-500 text-center mt-4">You will receive a payment request on your UPI app.</p>
                    </div>
                  )}
                  
                  <div className="mt-4 p-3 bg-green-50 border border-green-100 rounded-lg flex gap-2 items-start text-xs text-green-700">
                    <ShieldCheck className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <p>Secure payment processing. Your booking will be confirmed immediately after payment.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="mt-8 pt-6 border-t border-gray-200 flex justify-between">
            <button
              onClick={() => {
                if (step === 4 && selectedSlot && !selectedSlot._id) {
                  setStep(2); // If fast-forwarded to step 4 without real slot data, go back to 2
                } else {
                  setStep(step - 1);
                }
              }}
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
                className="px-6 py-2 text-sm font-medium rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:bg-green-400 disabled:cursor-wait transition-colors flex items-center shadow-md"
              >
                {loading ? 'Processing Payment...' : `Pay ₹${selectedDoctor?.profile?.consultationFee || selectedDoctor?.consultationFee || 500} & Book`}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

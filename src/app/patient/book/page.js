"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function PublicBookingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Form State
  const [patientName, setPatientName] = useState("");
  const [patientPhone, setPatientPhone] = useState("");
  const [patientEmail, setPatientEmail] = useState("");
  const [patientAge, setPatientAge] = useState("");
  const [patientGender, setPatientGender] = useState("Male");
  
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState("");
  
  const [appointmentDate, setAppointmentDate] = useState("");
  const [appointmentTime, setAppointmentTime] = useState("");

  const [clinicId, setClinicId] = useState("DEFAULT_CLINIC_ID"); // In real app, from URL

  useEffect(() => {
    // In MVP, we might fetch services for a clinic
    // For now, mock services since we just refactored the database
    setServices([
      { _id: "60d5ecb8b392d700153f3a00", name: "General Consultation", price: 500, durationMinutes: 30 },
      { _id: "60d5ecb8b392d700153f3a01", name: "Follow Up", price: 300, durationMinutes: 15 },
    ]);
  }, []);

  const handleSubmit = async () => {
    if (!patientName || !patientPhone || !patientAge || !patientGender || !selectedService || !appointmentDate || !appointmentTime) {
      setError("Please fill all required fields.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const payload = {
        clinicId,
        patientName,
        patientPhone,
        patientEmail,
        patientAge: Number(patientAge),
        patientGender,
        serviceId: selectedService,
        appointmentDate,
        appointmentTime
      };

      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      if (data.success) {
        setSuccess(true);
      } else {
        setError(data.message || "Failed to book appointment.");
      }
    } catch (err) {
      setError("An error occurred during booking.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-xl mx-auto mt-20 text-center bg-white p-10 rounded-xl shadow">
        <h2 className="text-2xl font-bold text-green-600 mb-4">Booking Confirmed!</h2>
        <p className="text-gray-600 mb-6">Your appointment has been successfully scheduled.</p>
        <button onClick={() => window.location.reload()} className="px-6 py-2 bg-blue-600 text-white rounded-lg">Book Another</button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Book an Appointment</h1>
      
      {error && (
        <div className="p-4 bg-red-50 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      <div className="bg-white p-6 rounded-xl shadow space-y-6 border border-gray-200">
        
        <div className="space-y-4">
          <h2 className="text-lg font-bold">Patient Details</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Full Name</label>
              <input type="text" value={patientName} onChange={(e) => setPatientName(e.target.value)} className="w-full px-3 py-2 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Phone</label>
              <input type="text" value={patientPhone} onChange={(e) => setPatientPhone(e.target.value)} className="w-full px-3 py-2 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email (Optional)</label>
              <input type="email" value={patientEmail} onChange={(e) => setPatientEmail(e.target.value)} className="w-full px-3 py-2 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Age</label>
              <input type="number" value={patientAge} onChange={(e) => setPatientAge(e.target.value)} className="w-full px-3 py-2 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Gender</label>
              <select value={patientGender} onChange={(e) => setPatientGender(e.target.value)} className="w-full px-3 py-2 border rounded-lg">
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-bold">Service</h2>
          <div>
            <label className="block text-sm font-medium mb-1">Select Service</label>
            <select value={selectedService} onChange={(e) => setSelectedService(e.target.value)} className="w-full px-3 py-2 border rounded-lg">
              <option value="">-- Choose a Service --</option>
              {services.map(s => (
                <option key={s._id} value={s._id}>{s.name} - ₹{s.price} ({s.durationMinutes} min)</option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-bold">Date & Time</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Date</label>
              <input type="date" value={appointmentDate} onChange={(e) => setAppointmentDate(e.target.value)} className="w-full px-3 py-2 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Time (HH:mm)</label>
              <input type="time" value={appointmentTime} onChange={(e) => setAppointmentTime(e.target.value)} className="w-full px-3 py-2 border rounded-lg" />
            </div>
          </div>
        </div>

        <div className="pt-4 flex justify-end">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Booking..." : "Confirm Booking"}
          </button>
        </div>

      </div>
    </div>
  );
}

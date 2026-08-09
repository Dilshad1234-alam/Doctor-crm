"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import PageHeader from "@/frontend/components/dashboard/PageHeader";
import Button from "@/frontend/components/ui/Button";
import { createDoctor } from "@/frontend/services/doctorApi";

const DAYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

export default function AddDoctorPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    temporaryPassword: "",
    confirmPassword: "",
    title: "",
    specialization: "",
    subSpecialization: "",
    qualification: [""],
    registrationNumber: "",
    registrationCouncil: "",
    experienceYears: 0,
    consultationFee: 0,
    followUpFee: 0,
    followUpValidityDays: 0,
    gender: "prefer_not_to_say",
    dateOfBirth: "",
    bio: "",
    languages: [""],
    consultationTypes: { inPerson: true, online: false },
    defaultSlotDuration: 15,
    maxAppointmentsPerDay: 30,
    availability: DAYS.map(day => ({
      day,
      isAvailable: day !== "sunday", // Default sunday closed
      slots: day !== "sunday" ? [{ startTime: "09:00", endTime: "17:00" }] : [],
    })),
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name.startsWith("consultationTypes.")) {
      const key = name.split(".")[1];
      setFormData(prev => ({
        ...prev,
        consultationTypes: { ...prev.consultationTypes, [key]: checked }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value
      }));
    }
  };

  const handleArrayChange = (index, field, value) => {
    const newArray = [...formData[field]];
    newArray[index] = value;
    setFormData(prev => ({ ...prev, [field]: newArray }));
  };

  const addArrayItem = (field) => {
    setFormData(prev => ({ ...prev, [field]: [...prev[field], ""] }));
  };

  const removeArrayItem = (index, field) => {
    const newArray = formData[field].filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, [field]: newArray }));
  };

  const handleAvailabilityChange = (dayIndex, field, value) => {
    const newAvail = [...formData.availability];
    newAvail[dayIndex] = { ...newAvail[dayIndex], [field]: value };
    // If turning off availability, clear slots
    if (field === "isAvailable" && !value) {
      newAvail[dayIndex].slots = [];
    } else if (field === "isAvailable" && value && newAvail[dayIndex].slots.length === 0) {
      newAvail[dayIndex].slots = [{ startTime: "09:00", endTime: "17:00" }];
    }
    setFormData(prev => ({ ...prev, availability: newAvail }));
  };

  const handleSlotChange = (dayIndex, slotIndex, field, value) => {
    const newAvail = [...formData.availability];
    newAvail[dayIndex].slots[slotIndex] = { ...newAvail[dayIndex].slots[slotIndex], [field]: value };
    setFormData(prev => ({ ...prev, availability: newAvail }));
  };

  const addSlot = (dayIndex) => {
    const newAvail = [...formData.availability];
    newAvail[dayIndex].slots.push({ startTime: "", endTime: "" });
    setFormData(prev => ({ ...prev, availability: newAvail }));
  };

  const removeSlot = (dayIndex, slotIndex) => {
    const newAvail = [...formData.availability];
    newAvail[dayIndex].slots = newAvail[dayIndex].slots.filter((_, i) => i !== slotIndex);
    setFormData(prev => ({ ...prev, availability: newAvail }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Clean up empty array items
      const payload = { ...formData };
      payload.qualification = payload.qualification.filter(q => q.trim() !== "");
      payload.languages = payload.languages.filter(l => l.trim() !== "");
      if (payload.dateOfBirth === "") delete payload.dateOfBirth;
      
      const res = await createDoctor(payload);
      router.push(`/dashboard/doctors/${res.doctor.id}`);
    } catch (err) {
      setError(err.message || "Failed to create doctor");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pb-10">
      <PageHeader 
        title="Add New Doctor" 
        description="Create a new doctor profile and access credentials."
      />

      {error && (
        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded shadow-sm">
          <p className="font-medium">Error</p>
          <p className="text-sm">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* Section 1: Account */}
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">1. Account Credentials</h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">Full Name *</label>
              <input required type="text" name="name" value={formData.name} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email Address *</label>
              <input required type="email" name="email" value={formData.email} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Phone Number</label>
              <input type="text" name="phone" value={formData.phone} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm" />
            </div>
            <div className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Temporary Password *</label>
                <input required type="text" name="temporaryPassword" value={formData.temporaryPassword} onChange={handleChange} minLength={8} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Confirm Password *</label>
                <input required type="text" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} minLength={8} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm" />
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Professional */}
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">2. Professional Details</h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">Title (e.g. Dr., Prof.)</label>
              <input type="text" name="title" value={formData.title} onChange={handleChange} placeholder="Dr." className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Experience (Years) *</label>
              <input required type="number" min="0" name="experienceYears" value={formData.experienceYears} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Specialization *</label>
              <input required type="text" name="specialization" value={formData.specialization} onChange={handleChange} placeholder="Cardiology" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Sub-specialization</label>
              <input type="text" name="subSpecialization" value={formData.subSpecialization} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Registration Number *</label>
              <input required type="text" name="registrationNumber" value={formData.registrationNumber} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Registration Council</label>
              <input type="text" name="registrationCouncil" value={formData.registrationCouncil} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Qualifications *</label>
              {formData.qualification.map((q, idx) => (
                <div key={`q-${idx}`} className="flex items-center gap-2 mb-2">
                  <input required type="text" value={q} onChange={(e) => handleArrayChange(idx, "qualification", e.target.value)} placeholder="MBBS, MD" className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm" />
                  {formData.qualification.length > 1 && (
                    <button type="button" onClick={() => removeArrayItem(idx, "qualification")} className="text-red-500 hover:text-red-700 p-2">✕</button>
                  )}
                </div>
              ))}
              <button type="button" onClick={() => addArrayItem("qualification")} className="text-sm text-teal-600 font-medium hover:text-teal-800">+ Add another qualification</button>
            </div>
          </div>
        </div>

        {/* Section 3: Consultation Settings */}
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">3. Consultation Settings</h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">Consultation Fee ($) *</label>
              <input required type="number" min="0" name="consultationFee" value={formData.consultationFee} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Follow-up Fee ($)</label>
              <input type="number" min="0" name="followUpFee" value={formData.followUpFee} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Follow-up Validity (Days)</label>
              <input type="number" min="0" max="365" name="followUpValidityDays" value={formData.followUpValidityDays} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm" />
            </div>
            
            <div className="sm:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4 border-t border-gray-100">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Consultation Types</label>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <input type="checkbox" id="inPerson" name="consultationTypes.inPerson" checked={formData.consultationTypes.inPerson} onChange={handleChange} className="h-4 w-4 rounded border-gray-300 text-teal-600 focus:ring-teal-600" />
                    <label htmlFor="inPerson" className="ml-2 block text-sm text-gray-900">In-person</label>
                  </div>
                  <div className="flex items-center">
                    <input type="checkbox" id="online" name="consultationTypes.online" checked={formData.consultationTypes.online} onChange={handleChange} className="h-4 w-4 rounded border-gray-300 text-teal-600 focus:ring-teal-600" />
                    <label htmlFor="online" className="ml-2 block text-sm text-gray-900">Online / Video</label>
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Default Slot Duration (mins)</label>
                <select name="defaultSlotDuration" value={formData.defaultSlotDuration} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm">
                  <option value={10}>10 minutes</option>
                  <option value={15}>15 minutes</option>
                  <option value={20}>20 minutes</option>
                  <option value={30}>30 minutes</option>
                  <option value={45}>45 minutes</option>
                  <option value={60}>60 minutes</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Max Appointments / Day</label>
                <input type="number" min="0" name="maxAppointmentsPerDay" value={formData.maxAppointmentsPerDay} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm" />
              </div>
            </div>
          </div>
        </div>

        {/* Section 4: Personal */}
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">4. Personal Information</h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">Gender</label>
              <select name="gender" value={formData.gender} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm">
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
                <option value="prefer_not_to_say">Prefer not to say</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
              <input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} max={new Date().toISOString().split("T")[0]} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Languages Spoken</label>
              {formData.languages.map((l, idx) => (
                <div key={`l-${idx}`} className="flex items-center gap-2 mb-2">
                  <input type="text" value={l} onChange={(e) => handleArrayChange(idx, "languages", e.target.value)} placeholder="English, Spanish" className="flex-1 sm:max-w-xs rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm" />
                  {formData.languages.length > 1 && (
                    <button type="button" onClick={() => removeArrayItem(idx, "languages")} className="text-red-500 hover:text-red-700 p-2">✕</button>
                  )}
                </div>
              ))}
              <button type="button" onClick={() => addArrayItem("languages")} className="text-sm text-teal-600 font-medium hover:text-teal-800">+ Add another language</button>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Bio</label>
              <textarea name="bio" rows={4} value={formData.bio} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm" />
            </div>
          </div>
        </div>

        {/* Section 5: Availability */}
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">5. Weekly Availability</h2>
          
          <div className="space-y-6">
            {formData.availability.map((dayObj, dayIdx) => (
              <div key={dayObj.day} className="flex flex-col sm:flex-row sm:items-start gap-4 p-4 border rounded-lg bg-gray-50">
                <div className="sm:w-1/4 flex items-center justify-between sm:justify-start gap-3">
                  <span className="capitalize font-medium text-gray-900 w-24">{dayObj.day}</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" checked={dayObj.isAvailable} onChange={(e) => handleAvailabilityChange(dayIdx, "isAvailable", e.target.checked)} />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
                  </label>
                </div>
                
                <div className="flex-1 space-y-3">
                  {!dayObj.isAvailable ? (
                    <span className="text-sm text-gray-500 italic">Not available</span>
                  ) : (
                    <>
                      {dayObj.slots.map((slot, slotIdx) => (
                        <div key={`slot-${dayIdx}-${slotIdx}`} className="flex items-center gap-3">
                          <input type="time" required value={slot.startTime} onChange={(e) => handleSlotChange(dayIdx, slotIdx, "startTime", e.target.value)} className="rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm" />
                          <span className="text-gray-500">to</span>
                          <input type="time" required value={slot.endTime} onChange={(e) => handleSlotChange(dayIdx, slotIdx, "endTime", e.target.value)} className="rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm" />
                          <button type="button" onClick={() => removeSlot(dayIdx, slotIdx)} className="text-red-500 hover:text-red-700 ml-2" title="Remove Slot">
                            ✕
                          </button>
                        </div>
                      ))}
                      <button type="button" onClick={() => addSlot(dayIdx)} className="text-sm text-teal-600 font-medium hover:text-teal-800 flex items-center gap-1">
                        + Add time slot
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-4 border-t pt-6">
          <Button type="button" variant="outline" onClick={() => router.back()} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={loading}>
            {loading ? "Creating Doctor..." : "Create Doctor Profile"}
          </Button>
        </div>
      </form>
    </div>
  );
}

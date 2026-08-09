"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import PageHeader from "@/frontend/components/dashboard/PageHeader";
import Button from "@/frontend/components/ui/Button";
import { getDoctorById, updateDoctor } from "@/frontend/services/doctorApi";

export default function EditDoctorPage() {
  const params = useParams();
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  
  const [formData, setFormData] = useState(null);

  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        const doc = await getDoctorById(params.doctorId);
        setFormData({
          name: doc.name,
          phone: doc.phone || "",
          title: doc.title || "",
          specialization: doc.specialization,
          subSpecialization: doc.subSpecialization || "",
          qualification: doc.qualification,
          registrationNumber: doc.registrationNumber,
          registrationCouncil: doc.registrationCouncil || "",
          experienceYears: doc.experienceYears,
          consultationFee: doc.consultationFee,
          followUpFee: doc.followUpFee,
          followUpValidityDays: doc.followUpValidityDays,
          gender: doc.gender || "prefer_not_to_say",
          dateOfBirth: doc.dateOfBirth ? doc.dateOfBirth.split("T")[0] : "",
          bio: doc.bio || "",
          languages: doc.languages?.length > 0 ? doc.languages : [""],
          consultationTypes: doc.consultationTypes,
          defaultSlotDuration: doc.defaultSlotDuration,
          maxAppointmentsPerDay: doc.maxAppointmentsPerDay,
          isAcceptingAppointments: doc.isAcceptingAppointments,
        });
      } catch (err) {
        setError(err.message || "Failed to load doctor details");
      } finally {
        setLoading(false);
      }
    };
    
    if (params.doctorId) fetchDoctor();
  }, [params.doctorId]);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const payload = { ...formData };
      payload.qualification = payload.qualification.filter(q => q.trim() !== "");
      payload.languages = payload.languages.filter(l => l.trim() !== "");
      if (payload.dateOfBirth === "") delete payload.dateOfBirth;
      
      await updateDoctor(params.doctorId, payload);
      router.push(`/dashboard/doctors/${params.doctorId}`);
    } catch (err) {
      setError(err.message || "Failed to update doctor");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="animate-pulse space-y-4 max-w-4xl">
      <div className="h-10 bg-gray-200 rounded w-1/3 mb-8"></div>
      <div className="h-40 bg-gray-200 rounded w-full"></div>
    </div>;
  }

  if (error && !formData) {
    return (
      <div className="text-center py-16 bg-white border border-gray-200 rounded-lg shadow-sm">
        <h3 className="mt-2 text-sm font-semibold text-gray-900">Error loading doctor</h3>
        <p className="mt-1 text-sm text-red-500">{error}</p>
        <div className="mt-6">
          <Button onClick={() => router.push("/dashboard/doctors")}>Back to Doctors</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-10">
      <PageHeader 
        title="Edit Doctor Profile" 
        description="Update professional details, fees, and consultation settings."
      />

      {error && (
        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded shadow-sm">
          <p className="font-medium">Error</p>
          <p className="text-sm">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* Section 1: Basic Info */}
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">Basic Information</h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">Full Name *</label>
              <input required type="text" name="name" value={formData.name} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Phone Number</label>
              <input type="text" name="phone" value={formData.phone} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm" />
            </div>
          </div>
        </div>

        {/* Section 2: Professional */}
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">Professional Details</h2>
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
          <h2 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">Consultation Settings</h2>
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

            <div className="sm:col-span-3 pt-4 border-t border-gray-100 flex items-center">
              <input type="checkbox" id="isAcceptingAppointments" name="isAcceptingAppointments" checked={formData.isAcceptingAppointments} onChange={handleChange} className="h-4 w-4 rounded border-gray-300 text-teal-600 focus:ring-teal-600" />
              <label htmlFor="isAcceptingAppointments" className="ml-2 block text-sm text-gray-900 font-medium">Accepting New Appointments</label>
            </div>
          </div>
        </div>

        {/* Section 4: Personal */}
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">Personal Information</h2>
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

        <div className="flex justify-end gap-4 border-t pt-6">
          <Button type="button" variant="outline" onClick={() => router.back()} disabled={saving}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={saving}>
            {saving ? "Saving Changes..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </div>
  );
}

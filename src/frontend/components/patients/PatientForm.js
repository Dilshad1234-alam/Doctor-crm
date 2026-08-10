"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createPatient, updatePatient } from "@/frontend/services/patientApi";
import { Loader2, Plus, Trash2 } from "lucide-react";

export default function PatientForm({ initialData = {}, isEdit = false, patientId = null }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [duplicateError, setDuplicateError] = useState(null);

  const [formData, setFormData] = useState({
    firstName: initialData.firstName || "",
    lastName: initialData.lastName || "",
    phone: initialData.phone || "",
    alternatePhone: initialData.alternatePhone || "",
    email: initialData.email || "",
    dateOfBirth: initialData.dateOfBirth ? new Date(initialData.dateOfBirth).toISOString().split('T')[0] : "",
    age: initialData.age || "",
    gender: initialData.gender || "",
    bloodGroup: initialData.bloodGroup || "",
    maritalStatus: initialData.maritalStatus || "",
    occupation: initialData.occupation || "",
    
    address: {
      line1: initialData.address?.line1 || "",
      line2: initialData.address?.line2 || "",
      city: initialData.address?.city || "",
      state: initialData.address?.state || "",
      pincode: initialData.address?.pincode || "",
      country: initialData.address?.country || "India",
    },
    
    emergencyContact: {
      name: initialData.emergencyContact?.name || "",
      relation: initialData.emergencyContact?.relation || "",
      phone: initialData.emergencyContact?.phone || "",
    },
    
    allergies: initialData.allergies || [],
    chronicConditions: initialData.chronicConditions || [],
    currentMedicines: initialData.currentMedicines || [],
    pastMedicalHistory: initialData.pastMedicalHistory || [],
    familyMedicalHistory: initialData.familyMedicalHistory || [],
    
    habits: {
      smoking: initialData.habits?.smoking || "",
      alcohol: initialData.habits?.alcohol || "",
      tobacco: initialData.habits?.tobacco || "",
    },
    
    insurance: {
      provider: initialData.insurance?.provider || "",
      policyNumber: initialData.insurance?.policyNumber || "",
    },
    
    notes: initialData.notes || "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({ ...prev, [parent]: { ...prev[parent], [child]: value } }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleArrayAdd = (field) => {
    setFormData(prev => ({ ...prev, [field]: [...prev[field], ""] }));
  };

  const handleArrayChange = (field, index, value) => {
    const newArray = [...formData[field]];
    newArray[index] = value;
    setFormData(prev => ({ ...prev, [field]: newArray }));
  };

  const handleArrayRemove = (field, index) => {
    const newArray = formData[field].filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, [field]: newArray }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setDuplicateError(null);

    try {
      // Clean up arrays
      const cleanedData = { ...formData };
      ["allergies", "chronicConditions", "currentMedicines", "pastMedicalHistory", "familyMedicalHistory"].forEach(field => {
        cleanedData[field] = cleanedData[field].filter(item => item.trim() !== "");
      });

      let res;
      if (isEdit) {
        res = await updatePatient(patientId, cleanedData);
      } else {
        res = await createPatient(cleanedData);
      }

      if (!res.success) {
        if (res.code === "PATIENT_DUPLICATE") {
          setDuplicateError({
            message: res.message,
            patient: res.existingPatient
          });
        } else if (res.errors) {
          setError(res.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', '));
        } else {
          setError(res.message);
        }
        setLoading(false);
        return;
      }

      router.push(`/dashboard/patients/${res.patient._id}`);
    } catch (err) {
      setError("An unexpected error occurred");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 pb-12 max-w-4xl">
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-md text-sm font-medium">
          {error}
        </div>
      )}

      {duplicateError && (
        <div className="bg-amber-50 border border-amber-200 p-4 rounded-md flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <p className="text-amber-800 font-semibold mb-1">{duplicateError.message}</p>
            <p className="text-sm text-amber-700">Existing patient: {duplicateError.patient.name} ({duplicateError.patient.patientCode})</p>
          </div>
          <button 
            type="button" 
            onClick={() => router.push(`/dashboard/patients/${duplicateError.patient.id}`)}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-md text-sm font-medium transition-colors whitespace-nowrap"
          >
            View Existing Patient
          </button>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <h2 className="text-lg font-semibold text-gray-900">Basic Information</h2>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
            <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
            <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
            <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Alternate Phone</label>
            <input type="tel" name="alternatePhone" value={formData.alternatePhone} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
            <input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
            <input type="number" min="0" max="130" name="age" value={formData.age} onChange={handleChange} placeholder="If DOB is unknown" className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
            <select name="gender" value={formData.gender} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white">
              <option value="">Select</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
              <option value="prefer_not_to_say">Prefer not to say</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Blood Group</label>
            <select name="bloodGroup" value={formData.bloodGroup} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white">
              <option value="">Select</option>
              <option value="A+">A+</option><option value="A-">A-</option>
              <option value="B+">B+</option><option value="B-">B-</option>
              <option value="AB+">AB+</option><option value="AB-">AB-</option>
              <option value="O+">O+</option><option value="O-">O-</option>
              <option value="unknown">Unknown</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Marital Status</label>
            <select name="maritalStatus" value={formData.maritalStatus} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white">
              <option value="">Select</option>
              <option value="single">Single</option>
              <option value="married">Married</option>
              <option value="divorced">Divorced</option>
              <option value="widowed">Widowed</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Occupation</label>
            <input type="text" name="occupation" value={formData.occupation} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <h2 className="text-lg font-semibold text-gray-900">Address</h2>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Line 1</label>
            <input type="text" name="address.line1" value={formData.address.line1} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Line 2</label>
            <input type="text" name="address.line2" value={formData.address.line2} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
            <input type="text" name="address.city" value={formData.address.city} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
            <input type="text" name="address.state" value={formData.address.state} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Pincode</label>
            <input type="text" name="address.pincode" value={formData.address.pincode} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
            <input type="text" name="address.country" value={formData.address.country} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <h2 className="text-lg font-semibold text-gray-900">Emergency Contact</h2>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input type="text" name="emergencyContact.name" value={formData.emergencyContact.name} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Relation</label>
            <input type="text" name="emergencyContact.relation" value={formData.emergencyContact.relation} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input type="tel" name="emergencyContact.phone" value={formData.emergencyContact.phone} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <h2 className="text-lg font-semibold text-gray-900">Medical Profile</h2>
        </div>
        <div className="p-6 space-y-6">
          
          {["allergies", "chronicConditions", "currentMedicines", "pastMedicalHistory", "familyMedicalHistory"].map((field) => (
            <div key={field}>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700 capitalize">
                  {field.replace(/([A-Z])/g, ' $1').trim()}
                </label>
                <button type="button" onClick={() => handleArrayAdd(field)} className="text-sm text-blue-600 font-medium flex items-center hover:text-blue-800 transition-colors">
                  <Plus className="w-4 h-4 mr-1" /> Add
                </button>
              </div>
              <div className="space-y-2">
                {formData[field].map((item, index) => (
                  <div key={index} className="flex gap-2">
                    <input 
                      type="text" 
                      value={item} 
                      onChange={(e) => handleArrayChange(field, index, e.target.value)} 
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                      placeholder={`Enter ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`}
                    />
                    <button type="button" onClick={() => handleArrayRemove(field, index)} className="p-2 text-gray-400 hover:text-red-600 transition-colors bg-gray-50 hover:bg-red-50 rounded-md border border-gray-200 hover:border-red-200">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                {formData[field].length === 0 && (
                  <p className="text-sm text-gray-400 italic bg-gray-50 p-3 rounded-md border border-gray-100">None added yet.</p>
                )}
              </div>
            </div>
          ))}

          <div className="pt-4 border-t border-gray-100 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Smoking</label>
              <select name="habits.smoking" value={formData.habits.smoking} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white">
                <option value="">Select</option><option value="never">Never</option><option value="former">Former</option><option value="occasional">Occasional</option><option value="regular">Regular</option><option value="unknown">Unknown</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Alcohol</label>
              <select name="habits.alcohol" value={formData.habits.alcohol} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white">
                <option value="">Select</option><option value="never">Never</option><option value="former">Former</option><option value="occasional">Occasional</option><option value="regular">Regular</option><option value="unknown">Unknown</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tobacco</label>
              <select name="habits.tobacco" value={formData.habits.tobacco} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white">
                <option value="">Select</option><option value="never">Never</option><option value="former">Former</option><option value="occasional">Occasional</option><option value="regular">Regular</option><option value="unknown">Unknown</option>
              </select>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100">
            <label className="block text-sm font-medium text-gray-700 mb-1">Medical Notes</label>
            <textarea name="notes" value={formData.notes} onChange={handleChange} rows={4} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-y"></textarea>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-6">
        <button 
          type="button" 
          onClick={() => router.back()}
          className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors shadow-sm"
        >
          Cancel
        </button>
        <button 
          type="submit" 
          disabled={loading}
          className="px-6 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70 flex items-center transition-colors shadow-sm"
        >
          {loading ? (
            <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</>
          ) : (
            isEdit ? "Update Patient" : "Save Patient"
          )}
        </button>
      </div>
    </form>
  );
}

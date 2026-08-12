"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import PageHeader from "@/frontend/components/dashboard/PageHeader";
import Button from "@/frontend/components/ui/Button";
import { getDoctorById, updateDoctorAvailability } from "@/frontend/services/doctorApi";

const DAYS_OF_WEEK = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

export default function EditAvailabilityPage() {
  const params = useParams();
  const router = useRouter();
  
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  
  // State for new availability fields
  const [formData, setFormData] = useState({
    isAvailable: true,
    availableDays: ["monday", "tuesday", "wednesday", "thursday", "friday"],
    startTime: "09:00",
    endTime: "17:00",
    slotDuration: 15,
    breakStart: "",
    breakEnd: "",
    maxPatientsPerDay: 30
  });

  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        setLoading(true);
        const data = await getDoctorById(params.doctorId);
        setDoctor(data);
        
        setFormData({
          isAvailable: data.isAvailable !== false,
          availableDays: data.availableDays || ["monday", "tuesday", "wednesday", "thursday", "friday"],
          startTime: data.startTime || "09:00",
          endTime: data.endTime || "17:00",
          slotDuration: data.slotDuration || data.defaultSlotDuration || 15,
          breakStart: data.breakStart || "",
          breakEnd: data.breakEnd || "",
          maxPatientsPerDay: data.maxPatientsPerDay || 30
        });
      } catch (err) {
        setError(err.message || "Failed to load doctor");
      } finally {
        setLoading(false);
      }
    };
    if (params.doctorId) {
      fetchDoctor();
    }
  }, [params.doctorId]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleAvailableDaysChange = (day) => {
    setFormData(prev => {
      const days = [...prev.availableDays];
      if (days.includes(day)) {
        return { ...prev, availableDays: days.filter(d => d !== day) };
      } else {
        return { ...prev, availableDays: [...days, day] };
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateDoctorAvailability(params.doctorId, formData);
      router.push(`/dashboard/doctors/${params.doctorId}/schedule`);
    } catch (err) {
      alert(err.message || "Failed to save availability");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-center animate-pulse">Loading...</div>;
  if (error) return <div className="p-8 text-red-500">{error}</div>;

  return (
    <div className="pb-10 max-w-4xl mx-auto">
      <div className="mb-6">
        <Link href={`/dashboard/doctors/${params.doctorId}/schedule`} className="text-sm text-teal-600 hover:text-teal-800 font-medium block mb-2">
          &larr; Back to Schedule
        </Link>
        <PageHeader title={`Edit Availability: ${doctor.name}`} />
      </div>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        <form onSubmit={handleSubmit}>
          <div className="flex justify-between items-center mb-6 border-b pb-4">
            <h2 className="text-lg font-semibold text-gray-900">Doctor Availability</h2>
            <div className="flex items-center">
              <span className="mr-3 text-sm font-medium text-gray-700">Is Available</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" name="isAvailable" className="sr-only peer" checked={formData.isAvailable} onChange={handleChange} />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
              </label>
            </div>
          </div>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Available Days</label>
              <div className="flex flex-wrap gap-3">
                {DAYS_OF_WEEK.map(day => (
                  <button
                    key={day}
                    type="button"
                    onClick={() => handleAvailableDaysChange(day)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors border ${
                      formData.availableDays.includes(day)
                        ? 'bg-teal-600 text-white border-teal-600 shadow-sm'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {day.charAt(0).toUpperCase() + day.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">Start Time</label>
                <input type="time" name="startTime" value={formData.startTime} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">End Time</label>
                <input type="time" name="endTime" value={formData.endTime} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Break Start (Optional)</label>
                <input type="time" name="breakStart" value={formData.breakStart} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Break End (Optional)</label>
                <input type="time" name="breakEnd" value={formData.breakEnd} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Slot Duration (Mins)</label>
                <select name="slotDuration" value={formData.slotDuration} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm">
                  <option value={10}>10 minutes</option>
                  <option value={15}>15 minutes</option>
                  <option value={20}>20 minutes</option>
                  <option value={30}>30 minutes</option>
                  <option value={45}>45 minutes</option>
                  <option value={60}>60 minutes</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Max Patients Per Day</label>
                <input type="number" min="0" name="maxPatientsPerDay" value={formData.maxPatientsPerDay} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm" />
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-end gap-3 pt-5 border-t">
            <Link href={`/dashboard/doctors/${params.doctorId}/schedule`}>
              <Button type="button" variant="outline">Cancel</Button>
            </Link>
            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save Availability"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

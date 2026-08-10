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
  
  // State for availability
  const [availability, setAvailability] = useState([]);

  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        setLoading(true);
        const data = await getDoctorById(params.doctorId);
        setDoctor(data);
        
        // Initialize availability state
        const currentAvail = data.availability || [];
        const initialAvail = DAYS_OF_WEEK.map(day => {
          const existing = currentAvail.find(a => a.day === day);
          if (existing) return { ...existing };
          return { day, isAvailable: false, slots: [] };
        });
        setAvailability(initialAvail);
        
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

  const handleToggleDay = (dayIndex) => {
    const newAvail = [...availability];
    newAvail[dayIndex].isAvailable = !newAvail[dayIndex].isAvailable;
    // If making available and no slots exist, add a default 9-5 slot
    if (newAvail[dayIndex].isAvailable && newAvail[dayIndex].slots.length === 0) {
      newAvail[dayIndex].slots = [{ startTime: "09:00", endTime: "17:00" }];
    }
    setAvailability(newAvail);
  };

  const handleAddSlot = (dayIndex) => {
    const newAvail = [...availability];
    newAvail[dayIndex].slots.push({ startTime: "09:00", endTime: "17:00" });
    setAvailability(newAvail);
  };

  const handleRemoveSlot = (dayIndex, slotIndex) => {
    const newAvail = [...availability];
    newAvail[dayIndex].slots.splice(slotIndex, 1);
    setAvailability(newAvail);
  };

  const handleSlotChange = (dayIndex, slotIndex, field, value) => {
    const newAvail = [...availability];
    newAvail[dayIndex].slots[slotIndex][field] = value;
    setAvailability(newAvail);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateDoctorAvailability(params.doctorId, availability);
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
          <div className="space-y-6">
            {availability.map((dayData, dayIndex) => (
              <div key={dayData.day} className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <input 
                      type="checkbox" 
                      id={`day-${dayData.day}`}
                      checked={dayData.isAvailable}
                      onChange={() => handleToggleDay(dayIndex)}
                      className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                    />
                    <label htmlFor={`day-${dayData.day}`} className="font-medium capitalize text-gray-900 cursor-pointer">
                      {dayData.day}
                    </label>
                  </div>
                  {dayData.isAvailable && (
                    <button 
                      type="button" 
                      onClick={() => handleAddSlot(dayIndex)}
                      className="text-sm text-teal-600 hover:text-teal-800"
                    >
                      + Add Time Slot
                    </button>
                  )}
                </div>

                {dayData.isAvailable && (
                  <div className="pl-7 space-y-2">
                    {dayData.slots.length === 0 ? (
                      <p className="text-sm text-red-500">Please add at least one time slot if marked available.</p>
                    ) : (
                      dayData.slots.map((slot, slotIndex) => (
                        <div key={slotIndex} className="flex items-center gap-3">
                          <input 
                            type="time" 
                            required
                            value={slot.startTime}
                            onChange={(e) => handleSlotChange(dayIndex, slotIndex, "startTime", e.target.value)}
                            className="block rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm"
                          />
                          <span className="text-gray-500">to</span>
                          <input 
                            type="time" 
                            required
                            value={slot.endTime}
                            onChange={(e) => handleSlotChange(dayIndex, slotIndex, "endTime", e.target.value)}
                            className="block rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm"
                          />
                          <button 
                            type="button" 
                            onClick={() => handleRemoveSlot(dayIndex, slotIndex)}
                            className="text-red-500 hover:text-red-700 ml-2"
                            title="Remove slot"
                          >
                            &times;
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            ))}
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

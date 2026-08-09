"use client";

import { useState, useEffect } from "react";
import PageHeader from "@/frontend/components/dashboard/PageHeader";
import Button from "@/frontend/components/ui/Button";
import { getMyDoctorProfile, updateMyAvailability } from "@/frontend/services/doctorApi";

const DAYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

export default function MyAvailabilityPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  
  const [availability, setAvailability] = useState([]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const profile = await getMyDoctorProfile();
        // Initialize availability state, merging existing with default for missing days
        const existingAvail = profile.availability || [];
        const initialAvail = DAYS.map(day => {
          const found = existingAvail.find(a => a.day === day);
          if (found) return found;
          return { day, isAvailable: false, slots: [] };
        });
        setAvailability(initialAvail);
      } catch (err) {
        setError(err.message || "Failed to load availability");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleAvailabilityChange = (dayIndex, field, value) => {
    const newAvail = [...availability];
    newAvail[dayIndex] = { ...newAvail[dayIndex], [field]: value };
    
    if (field === "isAvailable" && !value) {
      newAvail[dayIndex].slots = [];
    } else if (field === "isAvailable" && value && newAvail[dayIndex].slots.length === 0) {
      newAvail[dayIndex].slots = [{ startTime: "09:00", endTime: "17:00" }];
    }
    setAvailability(newAvail);
  };

  const handleSlotChange = (dayIndex, slotIndex, field, value) => {
    const newAvail = [...availability];
    newAvail[dayIndex].slots[slotIndex] = { ...newAvail[dayIndex].slots[slotIndex], [field]: value };
    setAvailability(newAvail);
  };

  const addSlot = (dayIndex) => {
    const newAvail = [...availability];
    newAvail[dayIndex].slots.push({ startTime: "", endTime: "" });
    setAvailability(newAvail);
  };

  const removeSlot = (dayIndex, slotIndex) => {
    const newAvail = [...availability];
    newAvail[dayIndex].slots = newAvail[dayIndex].slots.filter((_, i) => i !== slotIndex);
    setAvailability(newAvail);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccessMessage("");

    try {
      await updateMyAvailability(availability);
      setSuccessMessage("Your availability has been updated successfully.");
      
      // Auto-hide success message
      setTimeout(() => setSuccessMessage(""), 5000);
    } catch (err) {
      setError(err.message || "Failed to save availability");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4 max-w-4xl">
        <div className="h-10 bg-gray-200 rounded w-1/3 mb-8"></div>
        <div className="h-40 bg-gray-200 rounded w-full"></div>
      </div>
    );
  }

  return (
    <div className="pb-10 max-w-4xl">
      <PageHeader 
        title="My Availability" 
        description="Set your standard weekly working hours. This determines when patients can book appointments with you."
      />

      {error && (
        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded shadow-sm">
          <p className="font-medium">Error</p>
          <p className="text-sm">{error}</p>
        </div>
      )}

      {successMessage && (
        <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 text-green-700 rounded shadow-sm">
          <p className="font-medium">Success</p>
          <p className="text-sm">{successMessage}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <div className="space-y-6">
          {availability.map((dayObj, dayIdx) => (
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

        <div className="mt-8 border-t pt-6 flex justify-end">
          <Button type="submit" variant="primary" disabled={saving}>
            {saving ? "Saving Changes..." : "Save Availability"}
          </Button>
        </div>
      </form>
    </div>
  );
}

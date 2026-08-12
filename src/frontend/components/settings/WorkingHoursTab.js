"use client";
import { useState } from "react";
import Button from "@/frontend/components/ui/Button";

export default function WorkingHoursTab({ workingHours, onSave }) {
  // Ensure all 7 days exist
  const defaultDays = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
  const initialHours = defaultDays.map(day => {
    const existing = workingHours?.find(w => w.day === day);
    return existing || { day, isOpen: day !== "sunday", openingTime: "09:00", closingTime: "17:00" };
  });

  const [hours, setHours] = useState(initialHours);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const handleToggle = (index) => {
    const newHours = [...hours];
    newHours[index].isOpen = !newHours[index].isOpen;
    setHours(newHours);
  };

  const handleTimeChange = (index, field, value) => {
    const newHours = [...hours];
    newHours[index][field] = value;
    setHours(newHours);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    setError(null);
    
    // Validation
    for (const h of hours) {
      if (h.isOpen && h.openingTime >= h.closingTime) {
        setError(`Invalid time range for ${h.day.charAt(0).toUpperCase() + h.day.slice(1)}`);
        setSaving(false);
        return;
      }
    }

    try {
      await onSave({ workingHours: hours });
      setMessage("Working hours updated successfully.");
    } catch (err) {
      setError("Unable to update settings.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      <h3 className="text-lg font-bold text-gray-900 border-b pb-2">Clinic Working Hours</h3>
      
      {message && <div className="p-3 bg-blue-50 text-blue-700 rounded-md border border-blue-200 text-sm">{message}</div>}
      {error && <div className="p-3 bg-red-50 text-red-700 rounded-md border border-red-200 text-sm">{error}</div>}

      <div className="space-y-4">
        {hours.map((h, i) => (
          <div key={h.day} className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg">
            <div className="flex items-center w-1/3">
              <input 
                type="checkbox" 
                checked={h.isOpen} 
                onChange={() => handleToggle(i)}
                className="w-4 h-4 text-indigo-600 rounded mr-3"
              />
              <span className="font-medium text-sm text-gray-900 capitalize">{h.day}</span>
            </div>
            
            <div className="flex items-center gap-3 w-2/3 justify-end">
              {h.isOpen ? (
                <>
                  <input 
                    type="time" 
                    value={h.openingTime}
                    onChange={(e) => handleTimeChange(i, "openingTime", e.target.value)}
                    required
                    className="text-sm border-gray-300 rounded-md"
                  />
                  <span className="text-gray-500 text-sm">to</span>
                  <input 
                    type="time" 
                    value={h.closingTime}
                    onChange={(e) => handleTimeChange(i, "closingTime", e.target.value)}
                    required
                    className="text-sm border-gray-300 rounded-md"
                  />
                </>
              ) : (
                <span className="text-sm text-gray-500 italic px-8">Closed</span>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end pt-4 border-t">
        <Button type="submit" disabled={saving}>{saving ? "Saving..." : "Save Changes"}</Button>
      </div>
    </form>
  );
}

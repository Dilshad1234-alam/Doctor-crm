"use client";

import React from "react";
import Button from "@/frontend/components/ui/Button";

const FREQUENCIES = [
  { value: "once_daily", label: "Once Daily" },
  { value: "twice_daily", label: "Twice Daily" },
  { value: "three_times_daily", label: "Three Times Daily" },
  { value: "four_times_daily", label: "Four Times Daily" },
  { value: "morning_only", label: "Morning Only" },
  { value: "night_only", label: "Night Only" },
  { value: "as_needed", label: "As Needed" },
  { value: "weekly", label: "Weekly" },
  { value: "custom", label: "Custom" },
];

const DURATION_UNITS = [
  { value: "day", label: "Day(s)" },
  { value: "days", label: "Day(s)" },
  { value: "week", label: "Week(s)" },
  { value: "weeks", label: "Week(s)" },
  { value: "month", label: "Month(s)" },
  { value: "months", label: "Month(s)" },
  { value: "dose", label: "Dose(s)" },
  { value: "doses", label: "Dose(s)" }
];

const FOOD_TIMINGS = [
  { value: "before_food", label: "Before Food" },
  { value: "after_food", label: "After Food" },
  { value: "with_food", label: "With Food" },
  { value: "empty_stomach", label: "Empty Stomach" },
  { value: "not_specified", label: "Not Specified" }
];

const ROUTES = [
  { value: "oral", label: "Oral" },
  { value: "topical", label: "Topical" },
  { value: "inhalation", label: "Inhalation" },
  { value: "nasal", label: "Nasal" },
  { value: "eye", label: "Eye Drops" },
  { value: "ear", label: "Ear Drops" },
  { value: "injection", label: "Injection" },
  { value: "other", label: "Other" }
];

export default function MedicineRow({ medicine, index, onChange, onRemove, isFinalized }) {
  const handleChange = (field, value) => {
    if (isFinalized) return;
    onChange(index, field, value);
  };

  return (
    <div className="bg-gray-50 border rounded-lg p-4 mb-4 relative">
      <div className="flex justify-between items-center mb-3">
        <h4 className="text-sm font-bold text-gray-700">Medicine #{index + 1}</h4>
        {!isFinalized && (
          <button 
            type="button" 
            onClick={() => onRemove(index)} 
            className="text-red-500 hover:text-red-700 text-sm font-medium"
          >
            Remove
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Name and Strength */}
        <div className="md:col-span-2">
          <label className="block text-xs font-medium text-gray-700 mb-1">Medicine Name <span className="text-red-500">*</span></label>
          <input 
            type="text" 
            placeholder="e.g. Paracetamol" 
            className="w-full text-sm border-gray-300 rounded-md"
            value={medicine.medicineName} 
            onChange={(e) => handleChange('medicineName', e.target.value)} 
            disabled={isFinalized}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Strength</label>
          <input 
            type="text" 
            placeholder="e.g. 500mg" 
            className="w-full text-sm border-gray-300 rounded-md"
            value={medicine.strength} 
            onChange={(e) => handleChange('strength', e.target.value)} 
            disabled={isFinalized}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Dosage <span className="text-red-500">*</span></label>
          <input 
            type="text" 
            placeholder="e.g. 1 Tablet" 
            className="w-full text-sm border-gray-300 rounded-md"
            value={medicine.dosage} 
            onChange={(e) => handleChange('dosage', e.target.value)} 
            disabled={isFinalized}
          />
        </div>

        {/* Frequency */}
        <div className="md:col-span-2">
          <label className="block text-xs font-medium text-gray-700 mb-1">Frequency <span className="text-red-500">*</span></label>
          <div className="flex gap-2">
            <select 
              className="w-1/2 text-sm border-gray-300 rounded-md"
              value={medicine.frequency} 
              onChange={(e) => handleChange('frequency', e.target.value)} 
              disabled={isFinalized}
            >
              <option value="">Select Frequency</option>
              {FREQUENCIES.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
            </select>
            {medicine.frequency === 'custom' && (
              <input 
                type="text" 
                placeholder="e.g. Every 8 hours" 
                className="w-1/2 text-sm border-gray-300 rounded-md"
                value={medicine.customFrequency || ''} 
                onChange={(e) => handleChange('customFrequency', e.target.value)} 
                disabled={isFinalized}
              />
            )}
          </div>
        </div>

        {/* Duration */}
        <div className="md:col-span-2">
          <label className="block text-xs font-medium text-gray-700 mb-1">Duration <span className="text-red-500">*</span></label>
          <div className="flex gap-2">
            <input 
              type="number" 
              placeholder="e.g. 3" 
              min="1"
              className="w-1/3 text-sm border-gray-300 rounded-md"
              value={medicine.durationValue || ''} 
              onChange={(e) => handleChange('durationValue', parseInt(e.target.value) || '')} 
              disabled={isFinalized}
            />
            <select 
              className="w-2/3 text-sm border-gray-300 rounded-md"
              value={medicine.durationUnit} 
              onChange={(e) => handleChange('durationUnit', e.target.value)} 
              disabled={isFinalized}
            >
              <option value="days">Days</option>
              <option value="weeks">Weeks</option>
              <option value="months">Months</option>
              <option value="doses">Doses</option>
            </select>
          </div>
        </div>

        {/* Food Timing and Route */}
        <div className="md:col-span-2">
          <label className="block text-xs font-medium text-gray-700 mb-1">Food Timing <span className="text-red-500">*</span></label>
          <select 
            className="w-full text-sm border-gray-300 rounded-md"
            value={medicine.foodTiming} 
            onChange={(e) => handleChange('foodTiming', e.target.value)} 
            disabled={isFinalized}
          >
            {FOOD_TIMINGS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
          </select>
        </div>
        <div className="md:col-span-2">
          <label className="block text-xs font-medium text-gray-700 mb-1">Route <span className="text-red-500">*</span></label>
          <select 
            className="w-full text-sm border-gray-300 rounded-md"
            value={medicine.route} 
            onChange={(e) => handleChange('route', e.target.value)} 
            disabled={isFinalized}
          >
            {ROUTES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
          </select>
        </div>

        {/* Instructions */}
        <div className="md:col-span-4">
          <label className="block text-xs font-medium text-gray-700 mb-1">Instructions (Optional)</label>
          <input 
            type="text" 
            placeholder="e.g. Take with a full glass of water" 
            className="w-full text-sm border-gray-300 rounded-md"
            value={medicine.instructions || ''} 
            onChange={(e) => handleChange('instructions', e.target.value)} 
            disabled={isFinalized}
          />
        </div>
      </div>
    </div>
  );
}

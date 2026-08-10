import { useState, useEffect } from "react";

export default function VitalsForm({ initialData = {}, onSubmit, isSubmitting }) {
  const [formData, setFormData] = useState({
    heightCm: initialData.heightCm || "",
    weightKg: initialData.weightKg || "",
    temperatureC: initialData.temperatureC || "",
    systolic: initialData.bloodPressure?.systolic || "",
    diastolic: initialData.bloodPressure?.diastolic || "",
    pulseRate: initialData.pulseRate || "",
    oxygenSaturation: initialData.oxygenSaturation || "",
    respiratoryRate: initialData.respiratoryRate || "",
    bloodSugarValue: initialData.bloodSugar?.value || "",
    bloodSugarType: initialData.bloodSugar?.type || "unknown",
    notes: initialData.notes || "",
  });

  const [previewBmi, setPreviewBmi] = useState(null);

  useEffect(() => {
    if (formData.heightCm && formData.weightKg) {
      const h = parseFloat(formData.heightCm) / 100;
      const w = parseFloat(formData.weightKg);
      if (h > 0 && w > 0) {
        setPreviewBmi((w / (h * h)).toFixed(1));
      } else {
        setPreviewBmi(null);
      }
    } else {
      setPreviewBmi(null);
    }
  }, [formData.heightCm, formData.weightKg]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Parse numeric fields properly, keeping them null/undefined if empty
    const parseNum = (val) => val === "" || isNaN(val) ? null : Number(val);
    
    const payload = {
      heightCm: parseNum(formData.heightCm),
      weightKg: parseNum(formData.weightKg),
      temperatureC: parseNum(formData.temperatureC),
      bloodPressure: (formData.systolic || formData.diastolic) ? {
        systolic: parseNum(formData.systolic),
        diastolic: parseNum(formData.diastolic),
      } : null,
      pulseRate: parseNum(formData.pulseRate),
      oxygenSaturation: parseNum(formData.oxygenSaturation),
      respiratoryRate: parseNum(formData.respiratoryRate),
      bloodSugar: formData.bloodSugarValue ? {
        value: parseNum(formData.bloodSugarValue),
        type: formData.bloodSugarType,
      } : null,
      notes: formData.notes.trim() || null,
    };

    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Body Measurements */}
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
        <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">Body Measurements</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Height (cm)</label>
            <input type="number" step="0.1" name="heightCm" value={formData.heightCm} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" placeholder="e.g. 175" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Weight (kg)</label>
            <input type="number" step="0.1" name="weightKg" value={formData.weightKg} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" placeholder="e.g. 70" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">BMI</label>
            <input type="text" disabled value={previewBmi || "--"} className="mt-1 block w-full rounded-md border-gray-200 bg-gray-100 text-gray-500 shadow-sm sm:text-sm cursor-not-allowed" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Temp (°C)</label>
            <input type="number" step="0.1" name="temperatureC" value={formData.temperatureC} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" placeholder="e.g. 36.6" />
          </div>
        </div>
      </div>

      {/* Cardiovascular */}
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
        <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">Cardiovascular</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Systolic BP (mmHg)</label>
            <input type="number" name="systolic" value={formData.systolic} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" placeholder="e.g. 120" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Diastolic BP (mmHg)</label>
            <input type="number" name="diastolic" value={formData.diastolic} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" placeholder="e.g. 80" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Pulse (bpm)</label>
            <input type="number" name="pulseRate" value={formData.pulseRate} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" placeholder="e.g. 72" />
          </div>
        </div>
      </div>

      {/* Respiratory & Blood Sugar */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">Respiratory</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">SpO2 (%)</label>
              <input type="number" name="oxygenSaturation" value={formData.oxygenSaturation} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" placeholder="e.g. 98" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Resp. Rate (/min)</label>
              <input type="number" name="respiratoryRate" value={formData.respiratoryRate} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" placeholder="e.g. 16" />
            </div>
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">Blood Sugar</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Value (mg/dL)</label>
              <input type="number" name="bloodSugarValue" value={formData.bloodSugarValue} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" placeholder="e.g. 110" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Type</label>
              <select name="bloodSugarType" value={formData.bloodSugarType} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm">
                <option value="unknown">Unknown</option>
                <option value="random">Random</option>
                <option value="fasting">Fasting</option>
                <option value="post_meal">Post Meal</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Notes (Optional)</label>
        <textarea name="notes" rows="3" value={formData.notes} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" placeholder="Any additional observations..." />
      </div>

      <div className="flex justify-end pt-4 border-t border-gray-200">
        <button type="submit" disabled={isSubmitting} className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-6 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:bg-indigo-400">
          {isSubmitting ? "Saving..." : "Save Vitals"}
        </button>
      </div>
    </form>
  );
}

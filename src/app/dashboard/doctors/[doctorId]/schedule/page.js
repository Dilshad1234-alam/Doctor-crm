"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import PageHeader from "@/frontend/components/dashboard/PageHeader";
import Button from "@/frontend/components/ui/Button";
import { getDoctorSummary, getScheduleExceptions, createScheduleException } from "@/frontend/services/doctorApi";

export default function DoctorSchedulePage() {
  const params = useParams();
  const router = useRouter();
  const [data, setData] = useState(null);
  const [exceptions, setExceptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showAddForm, setShowAddForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    date: "",
    type: "leave",
    reason: "",
    isAvailable: false,
    customSlots: []
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await getDoctorSummary(params.doctorId);
      setData(res);
      const exRes = await getScheduleExceptions(params.doctorId);
      setExceptions(exRes);
    } catch (err) {
      setError(err.message || "Failed to load schedule data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (params.doctorId) {
      fetchData();
    }
  }, [params.doctorId]);

  const handleAddException = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await createScheduleException(params.doctorId, form);
      setShowAddForm(false);
      setForm({
        date: "",
        type: "leave",
        reason: "",
        isAvailable: false,
        customSlots: []
      });
      fetchData(); // Refresh list
    } catch (err) {
      alert(err.message || "Failed to add exception");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-center animate-pulse">Loading schedule...</div>;
  if (error) return <div className="p-8 text-red-500">{error}</div>;

  const { doctor } = data;

  return (
    <div className="pb-10 max-w-5xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <Link href={`/dashboard/doctors/${doctor.id}`} className="text-sm text-teal-600 hover:text-teal-800 font-medium block mb-2">
            &larr; Back to Profile
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Schedule: {doctor.name}</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Weekly Availability */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <div className="flex justify-between items-center mb-4 pb-2 border-b">
            <h2 className="text-lg font-semibold text-gray-900">Standard Availability</h2>
            <Link href={`/dashboard/doctors/${params.doctorId}/availability`}>
               <Button variant="outline" size="sm">Edit</Button>
            </Link>
          </div>
          
          <div className="space-y-3">
            {["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"].map(day => {
              const avail = doctor.availability?.find(a => a.day === day);
              return (
                <div key={day} className="flex justify-between items-start border-b border-gray-50 pb-2">
                  <span className="text-sm capitalize font-medium text-gray-700 w-1/3">{day}</span>
                  <div className="w-2/3 text-right">
                    {(!avail || !avail.isAvailable || avail.slots.length === 0) ? (
                      <span className="text-sm text-gray-400">Off</span>
                    ) : (
                      <div className="flex flex-col gap-1">
                        {avail.slots.map((slot, i) => (
                          <span key={i} className="text-sm text-gray-900 bg-teal-50 text-teal-700 px-2 py-0.5 rounded inline-block">
                            {slot.startTime} - {slot.endTime}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Exceptions */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <div className="flex justify-between items-center mb-4 pb-2 border-b">
            <h2 className="text-lg font-semibold text-gray-900">Schedule Exceptions</h2>
            <Button variant="primary" size="sm" onClick={() => setShowAddForm(!showAddForm)}>
              {showAddForm ? "Cancel" : "+ Add Exception"}
            </Button>
          </div>

          {showAddForm && (
            <form onSubmit={handleAddException} className="mb-6 bg-gray-50 p-4 rounded border">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Date *</label>
                  <input required type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Type *</label>
                  <select value={form.type} onChange={e => setForm({...form, type: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm">
                    <option value="leave">Leave / Vacation</option>
                    <option value="holiday">Public Holiday</option>
                    <option value="emergency_unavailable">Emergency (Unavailable)</option>
                    <option value="custom_hours">Custom Working Hours</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Reason</label>
                  <input type="text" value={form.reason} onChange={e => setForm({...form, reason: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm" />
                </div>
                
                {form.type === "custom_hours" && (
                  <div className="p-3 bg-yellow-50 text-yellow-800 text-sm rounded">
                    Note: To set custom hours, please use the API directly for now. This basic UI only supports setting full-day unavailability.
                  </div>
                )}
                
                <div className="pt-2">
                  <Button type="submit" disabled={saving}>{saving ? "Saving..." : "Save Exception"}</Button>
                </div>
              </div>
            </form>
          )}

          <div className="space-y-4">
            {exceptions.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">No upcoming schedule exceptions.</p>
            ) : (
              exceptions.map(ex => (
                <div key={ex._id} className="flex justify-between items-center p-3 border rounded border-red-100 bg-red-50">
                  <div>
                    <div className="font-medium text-red-900">{new Date(ex.date).toLocaleDateString()}</div>
                    <div className="text-xs text-red-700 capitalize">{ex.type.replace(/_/g, " ")} {ex.reason && `- ${ex.reason}`}</div>
                  </div>
                  <span className="text-xs font-bold text-red-600 bg-white px-2 py-1 rounded border border-red-200">
                    {ex.isAvailable ? "Custom Hours" : "Unavailable"}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

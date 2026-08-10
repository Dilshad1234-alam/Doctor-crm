"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/frontend/context/AuthContext";
import PageHeader from "@/frontend/components/dashboard/PageHeader";
import Button from "@/frontend/components/ui/Button";
import { getQueue, getMyQueue, callNextPatient, callQueuePatient, startQueueConsultation, skipQueuePatient, removeQueuePatient } from "@/frontend/services/queueApi";
import QueueStatusBadge from "@/frontend/components/queue/QueueStatusBadge";
import PriorityBadge from "@/frontend/components/queue/PriorityBadge";
import { useRouter } from "next/navigation";
import VitalsStatusBadge from "@/frontend/components/vitals/VitalsStatusBadge";
import RecordVitalsModal from "@/frontend/components/vitals/RecordVitalsModal";

export default function QueuePage() {
  const { user } = useAuth();
  const router = useRouter();
  
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState("my_queue"); // 'my_queue' or 'clinic_queue'
  
  const [vitalsModalOpen, setVitalsModalOpen] = useState(false);
  const [selectedVitalsAppointment, setSelectedVitalsAppointment] = useState(null);

  const isDoctor = user?.role === "doctor";
  const canSeeClinicQueue = user?.role === "clinic_owner" || user?.role === "receptionist";

  // Default tab based on role
  useEffect(() => {
    if (!isDoctor && canSeeClinicQueue) {
      setActiveTab("clinic_queue");
    }
  }, [isDoctor, canSeeClinicQueue]);

  const fetchQueueData = async (showRefresh = false) => {
    try {
      if (showRefresh) setRefreshing(true);
      else setLoading(true);
      
      let data;
      if (activeTab === "my_queue" && isDoctor) {
        data = await getMyQueue();
      } else if (activeTab === "clinic_queue" && canSeeClinicQueue) {
        data = await getQueue();
      } else {
        data = [];
      }
      setQueue(data);
      setError("");
    } catch (err) {
      setError(err.message || "Failed to load queue");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (user) fetchQueueData();
    // Refresh every 30 seconds
    const interval = setInterval(() => fetchQueueData(true), 30000);
    return () => clearInterval(interval);
  }, [activeTab, user]);

  const handleCallNext = async () => {
    try {
      setRefreshing(true);
      await callNextPatient();
      await fetchQueueData();
    } catch (err) {
      alert(err.message);
      setRefreshing(false);
    }
  };

  const handleAction = async (action, entry) => {
    try {
      setRefreshing(true);
      if (action === "call") {
        await callQueuePatient(entry._id);
      } else if (action === "start") {
        await startQueueConsultation(entry._id);
        router.push(`/dashboard/consultations/start?appointmentId=${entry.appointmentId._id || entry.appointmentId}`);
      } else if (action === "skip") {
        const reason = prompt("Reason for skipping?");
        if (reason !== null) await skipQueuePatient(entry._id, reason);
      } else if (action === "remove") {
        if (confirm("Are you sure you want to remove this patient from the queue?")) {
          await removeQueuePatient(entry._id, "Admin removal");
        }
      }
      await fetchQueueData();
    } catch (err) {
      alert(err.message);
      setRefreshing(false);
    }
  };

  const openVitals = (entry) => {
    setSelectedVitalsAppointment({
      id: entry.appointmentId?._id || entry.appointmentId,
      patientId: entry.patientId,
      doctorId: entry.doctorId,
      startTime: entry.appointmentId?.startTime || "N/A",
      endTime: entry.appointmentId?.endTime || "N/A",
      tokenNumber: entry.tokenNumber,
    });
    setVitalsModalOpen(true);
  };

  const getWaitingTime = (since) => {
    if (!since) return "-";
    const mins = Math.floor((new Date() - new Date(since)) / 60000);
    if (mins < 1) return "Just now";
    return `${mins} min`;
  };

  // Doctor Dashboard View
  if (activeTab === "my_queue") {
    const currentPatient = queue.find(q => q.status === "in_consultation");
    const nextPatient = queue.find(q => q.status === "called");
    const waitingList = queue.filter(q => q.status === "waiting");

    return (
      <div className="pb-10 max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <PageHeader title="My Queue" />
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => fetchQueueData(true)} disabled={refreshing}>
              {refreshing ? "Refreshing..." : "Refresh"}
            </Button>
            {isDoctor && (
              <Button onClick={handleCallNext} disabled={waitingList.length === 0 || nextPatient}>
                Call Next Patient
              </Button>
            )}
          </div>
        </div>

        {error && <div className="p-4 bg-red-50 text-red-600 rounded mb-6">{error}</div>}
        {loading && !refreshing && <div className="p-8 text-center animate-pulse">Loading queue...</div>}

        {!loading && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Now Serving Column */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-white rounded-lg border-2 border-teal-500 shadow p-5">
                <h2 className="text-sm font-bold text-teal-600 uppercase tracking-wider mb-4">Now Serving</h2>
                
                {currentPatient ? (
                  <div>
                    <div className="text-4xl font-black text-gray-900 mb-2">Token {currentPatient.tokenNumber}</div>
                    <p className="font-semibold text-lg">{currentPatient.patientId?.fullName}</p>
                    <p className="text-sm text-gray-500 mb-4 capitalize">{currentPatient.appointmentId?.visitType?.replace(/_/g, " ")}</p>
                    <QueueStatusBadge status={currentPatient.status} />
                  </div>
                ) : nextPatient ? (
                  <div>
                    <div className="text-4xl font-black text-gray-900 mb-2">Token {nextPatient.tokenNumber}</div>
                    <p className="font-semibold text-lg">{nextPatient.patientId?.fullName}</p>
                    <p className="text-sm text-gray-500 mb-4 capitalize">{nextPatient.appointmentId?.visitType?.replace(/_/g, " ")}</p>
                    <QueueStatusBadge status={nextPatient.status} />
                    <div className="mt-2">
                      <VitalsStatusBadge hasVitals={nextPatient.hasVitals} />
                    </div>
                    
                    <div className="mt-6 space-y-3">
                      <Button variant="outline" fullWidth onClick={() => openVitals(nextPatient)}>
                        {nextPatient.hasVitals ? "View/Edit Vitals" : "Record Vitals"}
                      </Button>
                      <Button fullWidth onClick={() => handleAction("start", nextPatient)}>
                        Start Consultation
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6 text-gray-400">
                    <p>No patient currently called.</p>
                  </div>
                )}
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-lg border shadow-sm text-center">
                  <div className="text-2xl font-bold text-gray-900">{waitingList.length}</div>
                  <div className="text-xs text-gray-500 uppercase">Waiting</div>
                </div>
                <div className="bg-white p-4 rounded-lg border shadow-sm text-center">
                  <div className="text-2xl font-bold text-orange-600">{waitingList.filter(q => q.priority !== "normal").length}</div>
                  <div className="text-xs text-gray-500 uppercase">Urgent/Emerg.</div>
                </div>
              </div>
            </div>

            {/* Waiting List Column */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b bg-gray-50 flex justify-between items-center">
                  <h2 className="font-semibold text-gray-900">Waiting Patients</h2>
                </div>
                
                {waitingList.length === 0 ? (
                  <div className="p-10 text-center text-gray-500">
                    No patients are waiting right now.
                  </div>
                ) : (
                  <ul className="divide-y divide-gray-100">
                    {waitingList.map((entry) => (
                      <li key={entry._id} className="p-5 hover:bg-gray-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-gray-100 border flex items-center justify-center font-bold text-lg text-gray-700">
                            {entry.tokenNumber}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{entry.patientId?.fullName}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs text-gray-500">{entry.appointmentId?.startTime}</span>
                              <span className="text-xs text-gray-300">•</span>
                              <span className="text-xs text-gray-500">Wait: {getWaitingTime(entry.waitingSince)}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <VitalsStatusBadge hasVitals={entry.hasVitals} />
                          <button 
                            onClick={() => openVitals(entry)}
                            className="text-sm text-indigo-600 hover:text-indigo-900 font-medium whitespace-nowrap"
                          >
                            {entry.hasVitals ? "Vitals" : "Record Vitals"}
                          </button>
                          <PriorityBadge priority={entry.priority} />
                          {isDoctor && (
                            <button 
                              onClick={() => handleAction("call", entry)}
                              className="text-sm bg-teal-50 text-teal-700 px-3 py-1.5 rounded font-medium hover:bg-teal-100"
                            >
                              Call Patient
                            </button>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

          </div>
        )}
      </div>
    );
  }

  // Clinic Queue View (Receptionist / Admin)
  return (
    <div className="pb-10 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <PageHeader title="Clinic Queue" />
        <Button variant="outline" onClick={() => fetchQueueData(true)} disabled={refreshing}>
          {refreshing ? "Refreshing..." : "Refresh Queue"}
        </Button>
      </div>

      {error && <div className="p-4 bg-red-50 text-red-600 rounded mb-6">{error}</div>}
      
      <div className="bg-white border rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Token</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Doctor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Wait Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vitals</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading && !refreshing ? (
                <tr><td colSpan="7" className="px-6 py-10 text-center text-gray-500 animate-pulse">Loading queue...</td></tr>
              ) : queue.length === 0 ? (
                <tr><td colSpan="7" className="px-6 py-10 text-center text-gray-500">No active queue entries today.</td></tr>
              ) : (
                queue.map((entry) => (
                  <tr key={entry._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-gray-900">#{entry.tokenNumber}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{entry.patientId?.fullName}</div>
                      <div className="text-xs text-gray-500">{entry.patientId?.patientIdString}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{entry.doctorId?.userId?.name || "Doctor"}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {entry.status === "waiting" || entry.status === "called" ? getWaitingTime(entry.waitingSince) : "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <PriorityBadge priority={entry.priority} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <VitalsStatusBadge hasVitals={entry.hasVitals} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <QueueStatusBadge status={entry.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button onClick={() => openVitals(entry)} className="text-indigo-600 hover:text-indigo-900 mr-3">
                        {entry.hasVitals ? "Vitals" : "Record Vitals"}
                      </button>
                      {canSeeClinicQueue && entry.status !== "removed" && entry.status !== "in_consultation" && (
                         <button onClick={() => handleAction("remove", entry)} className="text-red-600 hover:text-red-900 ml-3">
                           Remove
                         </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {vitalsModalOpen && selectedVitalsAppointment && (
        <RecordVitalsModal 
          isOpen={vitalsModalOpen}
          onClose={(shouldRefresh) => {
            setVitalsModalOpen(false);
            if (shouldRefresh === true) {
              fetchQueueData();
            }
          }}
          appointment={selectedVitalsAppointment}
        />
      )}
    </div>
  );
}

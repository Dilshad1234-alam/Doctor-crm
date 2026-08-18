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
        const result = await startQueueConsultation(entry._id);
        const consultationId = result.consultation?._id || result.consultation?.id;
        if (consultationId) {
          router.push(`/dashboard/consultations/${consultationId}`);
        } else {
          router.push(`/dashboard/consultations`);
        }
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
      <div className="pb-12 w-full">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-[#0f3d69] to-[#2ab5e1]">My Queue</h1>
            <p className="mt-2 text-sm font-medium text-gray-500">Manage your patient queue for today.</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => fetchQueueData(true)} disabled={refreshing} className="shadow-sm rounded-xl">
              {refreshing ? "Refreshing..." : "Refresh"}
            </Button>
            {isDoctor && (
              <Button onClick={handleCallNext} disabled={waitingList.length === 0 || nextPatient} className="bg-gradient-to-r from-[#0f3d69] to-[#15558d] hover:from-[#15558d] hover:to-[#2ab5e1] text-white rounded-xl shadow-md transition-all hover:-translate-y-0.5 border-none">
                Call Next Patient
              </Button>
            )}
          </div>
        </div>

        {error && <div className="p-4 bg-red-50 text-red-600 rounded-xl mb-6 shadow-sm border border-red-100 font-medium">{error}</div>}
        {loading && !refreshing && <div className="p-10 text-center animate-pulse text-gray-500 font-bold bg-white rounded-[2rem] shadow-sm border border-gray-100">Loading queue...</div>}

        {!loading && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Now Serving Column */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-white rounded-[2rem] border-2 border-teal-500 shadow-[0_8px_30px_rgb(0,0,0,0.06)] p-6 relative overflow-hidden">
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-teal-50 rounded-full opacity-50 pointer-events-none"></div>
                <h2 className="text-xs font-black text-teal-600 uppercase tracking-widest mb-6 relative z-10 flex items-center gap-2">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-teal-500"></span>
                  </span>
                  Now Serving
                </h2>
                
                {currentPatient ? (
                  <div className="relative z-10">
                    <div className="text-5xl font-black text-gray-900 mb-3 tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-gray-900 to-gray-600">Token {currentPatient.tokenNumber}</div>
                    <p className="font-bold text-xl text-gray-800">{currentPatient.patientId?.name || currentPatient.patientId?.fullName || "Unknown Patient"}</p>
                    <p className="text-sm font-medium text-gray-500 mb-5 capitalize">{currentPatient.appointmentId?.visitType?.replace(/_/g, " ")}</p>
                    <QueueStatusBadge status={currentPatient.status} />
                    <div className="mt-8">
                      <Button fullWidth onClick={() => router.push(`/dashboard/consultations`)} className="rounded-xl shadow-md py-3 text-base">
                        Open Consultation
                      </Button>
                    </div>
                  </div>
                ) : nextPatient ? (
                  <div className="relative z-10">
                    <div className="text-5xl font-black text-gray-900 mb-3 tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-gray-900 to-gray-600">Token {nextPatient.tokenNumber}</div>
                    <p className="font-bold text-xl text-gray-800">{nextPatient.patientId?.name || nextPatient.patientId?.fullName || "Unknown Patient"}</p>
                    <p className="text-sm font-medium text-gray-500 mb-5 capitalize">{nextPatient.appointmentId?.visitType?.replace(/_/g, " ")}</p>
                    <QueueStatusBadge status={nextPatient.status} />
                    <div className="mt-3">
                      <VitalsStatusBadge hasVitals={nextPatient.hasVitals} />
                    </div>
                    
                    <div className="mt-8 space-y-3">
                      <Button variant="outline" fullWidth onClick={() => openVitals(nextPatient)} className="rounded-xl py-3 border-gray-200">
                        {nextPatient.hasVitals ? "View/Edit Vitals" : "Record Vitals"}
                      </Button>
                      <Button fullWidth onClick={() => handleAction("start", nextPatient)} className="rounded-xl shadow-md py-3 bg-gradient-to-r from-[#0f3d69] to-[#15558d] border-none text-base">
                        Start Consultation
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-10 relative z-10">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-2xl opacity-50">☕</span>
                    </div>
                    <p className="text-gray-400 font-bold">No patient currently called.</p>
                  </div>
                )}
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-5 rounded-[1.5rem] border border-gray-100 shadow-[0_4px_20px_rgb(0,0,0,0.03)] text-center relative overflow-hidden">
                  <div className="text-3xl font-black text-gray-900 mb-1 relative z-10">{waitingList.length}</div>
                  <div className="text-[10px] font-black tracking-widest text-gray-400 uppercase relative z-10">Waiting</div>
                </div>
                <div className="bg-white p-5 rounded-[1.5rem] border border-orange-100 bg-orange-50/30 shadow-[0_4px_20px_rgb(0,0,0,0.03)] text-center relative overflow-hidden">
                  <div className="text-3xl font-black text-orange-600 mb-1 relative z-10">{waitingList.filter(q => q.priority !== "normal").length}</div>
                  <div className="text-[10px] font-black tracking-widest text-orange-600/70 uppercase relative z-10">Urgent</div>
                </div>
              </div>
            </div>

            {/* Waiting List Column */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-[2rem] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden h-full flex flex-col">
                <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                  <h2 className="font-bold text-gray-900">Waiting Patients</h2>
                </div>
                
                {waitingList.length === 0 ? (
                  <div className="flex-1 flex items-center justify-center p-12 text-center">
                    <div>
                      <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400 opacity-50 text-3xl">👥</div>
                      <p className="font-bold text-gray-400">No patients are waiting right now.</p>
                    </div>
                  </div>
                ) : (
                  <ul className="divide-y divide-gray-50 flex-1 overflow-y-auto">
                    {waitingList.map((entry) => (
                      <li key={entry._id} className="p-6 hover:bg-blue-50/50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4 group">
                        <div className="flex items-center gap-5">
                          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-50 border border-gray-200 flex items-center justify-center font-black text-xl text-gray-700 shadow-sm group-hover:shadow transition-shadow">
                            {entry.tokenNumber}
                          </div>
                          <div>
                            <p className="font-bold text-lg text-gray-900">{entry.patientId?.name || entry.patientId?.fullName || "Unknown Patient"}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs font-medium text-gray-500">{entry.appointmentId?.startTime}</span>
                              <span className="text-xs text-gray-300">•</span>
                              <span className="text-xs font-medium text-[#15558d]">Wait: {getWaitingTime(entry.waitingSince)}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <VitalsStatusBadge hasVitals={entry.hasVitals} />
                          <button 
                            onClick={() => openVitals(entry)}
                            className="text-sm text-indigo-500 hover:text-indigo-700 font-bold whitespace-nowrap transition-colors"
                          >
                            {entry.hasVitals ? "Vitals" : "Record Vitals"}
                          </button>
                          <PriorityBadge priority={entry.priority} />
                          {isDoctor && (
                            <button 
                              onClick={() => handleAction("call", entry)}
                              className="text-sm bg-gradient-to-br from-teal-50 to-teal-100 text-teal-700 border border-teal-200 px-4 py-2 rounded-xl font-bold hover:shadow-md hover:-translate-y-0.5 transition-all"
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
    <div className="pb-12 w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-[#0f3d69] to-[#2ab5e1]">Clinic Queue</h1>
          <p className="mt-2 text-sm font-medium text-gray-500">Monitor all patients currently in the clinic.</p>
        </div>
        <Button variant="outline" onClick={() => fetchQueueData(true)} disabled={refreshing} className="shadow-sm rounded-xl">
          {refreshing ? "Refreshing..." : "Refresh Queue"}
        </Button>
      </div>

      {error && <div className="p-4 bg-red-50 text-red-600 rounded-xl mb-6 shadow-sm border border-red-100 font-medium">{error}</div>}
      
      <div className="bg-white border border-gray-100 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50/50">
              <tr>
                <th className="px-8 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Token</th>
                <th className="px-8 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Patient</th>
                <th className="px-8 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Doctor</th>
                <th className="px-8 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Wait Time</th>
                <th className="px-8 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Priority</th>
                <th className="px-8 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Vitals</th>
                <th className="px-8 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-8 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-50">
              {loading && !refreshing ? (
                <tr><td colSpan="8" className="px-8 py-16 text-center text-gray-500 font-bold animate-pulse">Loading queue...</td></tr>
              ) : queue.length === 0 ? (
                <tr><td colSpan="8" className="px-8 py-20 text-center text-gray-500 font-medium text-lg">No active queue entries today.</td></tr>
              ) : (
                queue.map((entry) => (
                  <tr key={entry._id} className="hover:bg-blue-50/50 transition-colors group">
                    <td className="px-8 py-5 whitespace-nowrap">
                      <div className="text-sm font-black text-gray-900 bg-gray-100 inline-flex items-center justify-center w-10 h-10 rounded-xl shadow-sm border border-gray-200 group-hover:bg-white transition-colors">#{entry.tokenNumber}</div>
                    </td>
                    <td className="px-8 py-5 whitespace-nowrap">
                      <div className="text-sm font-bold text-gray-900 group-hover:text-[#15558d] transition-colors">{entry.patientId?.name || entry.patientId?.fullName || "Unknown Patient"}</div>
                      <div className="text-xs font-medium text-gray-500 mt-0.5">{entry.patientId?.patientIdString}</div>
                    </td>
                    <td className="px-8 py-5 whitespace-nowrap">
                      <div className="text-sm font-bold text-gray-900">{entry.doctorId?.name || entry.doctorId?.userId?.name || "Unknown Doctor"}</div>
                    </td>
                    <td className="px-8 py-5 whitespace-nowrap text-sm font-bold text-gray-600">
                      {entry.status === "waiting" || entry.status === "called" ? getWaitingTime(entry.waitingSince) : "-"}
                    </td>
                    <td className="px-8 py-5 whitespace-nowrap">
                      <PriorityBadge priority={entry.priority} />
                    </td>
                    <td className="px-8 py-5 whitespace-nowrap">
                      <VitalsStatusBadge hasVitals={entry.hasVitals} />
                    </td>
                    <td className="px-8 py-5 whitespace-nowrap">
                      <QueueStatusBadge status={entry.status} />
                    </td>
                    <td className="px-8 py-5 whitespace-nowrap text-right text-sm font-bold">
                      {/* Vitals Button - Valid for waiting, called, and some others but maybe not completed/removed if not applicable */}
                      {(entry.status === "waiting" || entry.status === "called") && (
                        <button onClick={() => openVitals(entry)} className="text-indigo-600 hover:text-indigo-900 mr-3">
                          {entry.hasVitals ? "Vitals" : "Record Vitals"}
                        </button>
                      )}

                      {/* Call Patient Button */}
                      {entry.status === "waiting" && (
                         <button onClick={() => handleAction("call", entry)} className="text-teal-600 hover:text-teal-900 mr-3">
                           Call Patient
                         </button>
                      )}

                      {/* Start Consultation Button */}
                      {entry.status === "called" && (
                         <button onClick={() => handleAction("start", entry)} className="text-blue-600 hover:text-blue-900 mr-3">
                           Start Consultation
                         </button>
                      )}

                      {/* Open Consultation Button */}
                      {entry.status === "in_consultation" && (
                         <button onClick={() => router.push(`/dashboard/consultations`)} className="text-blue-600 hover:text-blue-900 mr-3">
                           Open Consultation
                         </button>
                      )}

                      {/* View Consultation Button */}
                      {entry.status === "completed" && (
                         <button onClick={() => router.push(`/dashboard/consultations`)} className="text-gray-600 hover:text-gray-900 mr-3">
                           View Consultation
                         </button>
                      )}

                      {/* Remove Button */}
                      {canSeeClinicQueue && entry.status === "waiting" && (
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

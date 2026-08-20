"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import PageHeader from "@/frontend/components/dashboard/PageHeader";
import Button from "@/frontend/components/ui/Button";
import { getDoctorSummary, updateDoctorStatus } from "@/frontend/services/doctorApi";

export default function DoctorDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusLoading, setStatusLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getDoctorSummary(params.doctorId);
        setData(res);
      } catch (err) {
        setError(err.message || "Failed to load doctor details");
      } finally {
        setLoading(false);
      }
    };
    
    if (params.doctorId) {
      fetchData();
    }
  }, [params.doctorId]);

  const toggleStatus = async () => {
    if (!confirm(`Are you sure you want to ${data.doctor.isActive ? 'deactivate' : 'activate'} this doctor?`)) return;
    
    try {
      setStatusLoading(true);
      await updateDoctorStatus(params.doctorId, !data.doctor.isActive);
      
      // Update local state
      setData({
        ...data,
        doctor: { ...data.doctor, isActive: !data.doctor.isActive }
      });
    } catch (err) {
      alert(err.message || "Failed to change status");
    } finally {
      setStatusLoading(false);
    }
  };

  if (loading) {
    return <div className="animate-pulse space-y-4 max-w-4xl">
      <div className="h-10 bg-gray-200 rounded w-1/3 mb-8"></div>
      <div className="h-40 bg-gray-200 rounded w-full"></div>
      <div className="h-40 bg-gray-200 rounded w-full"></div>
    </div>;
  }

  if (error) {
    return (
      <div className="text-center py-16 bg-white border border-gray-200 rounded-lg shadow-sm">
        <h3 className="mt-2 text-sm font-semibold text-gray-900">Error loading doctor</h3>
        <p className="mt-1 text-sm text-red-500">{error}</p>
        <div className="mt-6">
          <Button onClick={() => router.push("/dashboard/doctors")}>Back to Doctors</Button>
        </div>
      </div>
    );
  }

  const { doctor, metrics } = data;

  return (
    <div className="pb-10">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link href="/dashboard/doctors" className="text-sm text-teal-600 hover:text-teal-800 font-medium block mb-2">
            &larr; Back to Doctors
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            {doctor.title ? `${doctor.title} ` : ''}{doctor.name}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {doctor.specialization} • {doctor.employeeId}
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <Link href={`/dashboard/appointments?doctorId=${doctor.id}`}>
            <Button variant="outline">View Appointments</Button>
          </Link>
          <Link href={`/dashboard/doctors/${doctor.id}/edit`}>
            <Button variant="outline">Edit Profile</Button>
          </Link>
          <Link href={`/dashboard/doctors/${doctor.id}/schedule`}>
            <Button variant="outline">Manage Schedule</Button>
          </Link>
          <Button 
            variant="outline" 
            className={doctor.isActive ? "text-red-600 hover:bg-red-50" : "text-blue-600 hover:bg-blue-50"}
            onClick={toggleStatus}
            disabled={statusLoading}
          >
            {doctor.isActive ? "Deactivate" : "Activate"}
          </Button>
        </div>
      </div>

      {!doctor.isActive && (
        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded shadow-sm">
          <p className="font-medium">This doctor is currently inactive.</p>
          <p className="text-sm">They cannot log in or be assigned new appointments.</p>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
          <h3 className="text-sm font-medium text-gray-500">Today&apos;s Appointments</h3>
          <p className="mt-1 font-semibold text-gray-900">{metrics?.todayAppointments ?? "—"}</p>
          <p className="text-xs text-gray-400 mt-1">Available after Appointment module</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
          <h3 className="text-sm font-medium text-gray-500">Completed Consultations</h3>
          <p className="mt-1 font-semibold text-gray-900">{metrics?.completedConsultations ?? "—"}</p>
          <p className="text-xs text-gray-400 mt-1">Available after Consultation module</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
          <h3 className="text-sm font-medium text-gray-500">Total Patients</h3>
          <p className="mt-1 font-semibold text-gray-900">{metrics?.totalPatients ?? "—"}</p>
          <p className="text-xs text-gray-400 mt-1">Available after Appointment module</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
          <h3 className="text-sm font-medium text-gray-500">Monthly Revenue</h3>
          <p className="mt-1 font-semibold text-gray-900">{metrics?.monthlyRevenue ?? "—"}</p>
          <p className="text-xs text-gray-400 mt-1">Available after Billing module</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Overview */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Overview</h3>
            </div>
            <div className="px-4 py-5 sm:p-0">
              <dl className="sm:divide-y sm:divide-gray-200">
                <div className="py-3 sm:py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Email address</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{doctor.email}</dd>
                </div>
                <div className="py-3 sm:py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Phone number</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{doctor.phone || "N/A"}</dd>
                </div>
                <div className="py-3 sm:py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Gender</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 capitalize">{doctor.gender?.replace(/_/g, " ")}</dd>
                </div>
                <div className="py-3 sm:py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Experience</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{doctor.experienceYears} Years</dd>
                </div>
                <div className="py-3 sm:py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Languages</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{doctor.languages?.join(", ") || "None specified"}</dd>
                </div>
                <div className="py-3 sm:py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Bio</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{doctor.bio || "No bio provided."}</dd>
                </div>
              </dl>
            </div>
          </div>

          {/* Professional Details */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Professional Information</h3>
            </div>
            <div className="px-4 py-5 sm:p-0">
              <dl className="sm:divide-y sm:divide-gray-200">
                <div className="py-3 sm:py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Specialization</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{doctor.specialization}</dd>
                </div>
                <div className="py-3 sm:py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Sub-specialization</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{doctor.subSpecialization || "None"}</dd>
                </div>
                <div className="py-3 sm:py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Qualifications</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{doctor.qualification?.join(", ") || "None"}</dd>
                </div>
                <div className="py-3 sm:py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Registration Number</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{doctor.registrationNumber}</dd>
                </div>
                <div className="py-3 sm:py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Registration Council</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{doctor.registrationCouncil || "N/A"}</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Consultation Settings */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Consultation Settings</h3>
            </div>
            <div className="px-4 py-5">
              <div className="space-y-4">
                <div className="flex justify-between border-b pb-2">
                  <span className="text-sm text-gray-500">Consultation Fee</span>
                  <span className="text-sm font-medium text-gray-900">${doctor.consultationFee}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-sm text-gray-500">Follow-up Fee</span>
                  <span className="text-sm font-medium text-gray-900">${doctor.followUpFee}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-sm text-gray-500">Follow-up Validity</span>
                  <span className="text-sm font-medium text-gray-900">{doctor.followUpValidityDays} Days</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-sm text-gray-500">Default Slot</span>
                  <span className="text-sm font-medium text-gray-900">{doctor.defaultSlotDuration} min</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-sm text-gray-500">Max Appointments</span>
                  <span className="text-sm font-medium text-gray-900">{doctor.maxAppointmentsPerDay} / day</span>
                </div>
                <div className="pt-2">
                  <span className="text-sm text-gray-500 block mb-2">Supported Types:</span>
                  <div className="flex gap-2">
                    {doctor.consultationTypes?.inPerson && (
                      <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full font-medium">In-person</span>
                    )}
                    {doctor.consultationTypes?.online && (
                      <span className="px-2 py-1 bg-indigo-50 text-indigo-700 text-xs rounded-full font-medium">Online/Video</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Weekly Availability Summary */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Weekly Availability</h3>
            </div>
            <div className="px-4 py-5">
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
                              <span key={i} className="text-sm text-gray-900 bg-gray-100 px-2 py-0.5 rounded inline-block">
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
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import PageHeader from "@/frontend/components/dashboard/PageHeader";
import Button from "@/frontend/components/ui/Button";
import { getDoctors } from "@/frontend/services/doctorApi";

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    notAccepting: 0,
  });

  const fetchDoctors = async (searchQuery = "") => {
    try {
      setLoading(true);
      setError("");
      const res = await getDoctors({ search: searchQuery });
      setDoctors(res.doctors);
      
      setStats({
        total: res.doctors.length, // For real scale, this would come from an API summary endpoint
        active: res.doctors.filter(d => d.isActive).length,
        notAccepting: res.doctors.filter(d => d.isActive && !d.isAcceptingAppointments).length,
      });
    } catch (err) {
      setError(err.message || "Failed to load doctors");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchDoctors(search);
  };

  return (
    <div>
      <PageHeader 
        title="Doctors" 
        description="Manage doctors, schedules, availability and clinic access."
      >
        <Link href="/dashboard/doctors/new">
          <Button>Add Doctor</Button>
        </Link>
      </PageHeader>

      {/* Stats row */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 mb-8">
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="text-sm font-medium text-gray-500">Total Doctors</h3>
          <p className="mt-2 text-3xl font-bold text-gray-900">{stats.total}</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="text-sm font-medium text-gray-500">Active Doctors</h3>
          <p className="mt-2 text-3xl font-bold text-teal-600">{stats.active}</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="text-sm font-medium text-gray-500">Not Accepting Appts</h3>
          <p className="mt-2 text-3xl font-bold text-amber-600">{stats.notAccepting}</p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="mb-6 bg-white p-4 rounded-lg border border-gray-200 shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between">
        <form onSubmit={handleSearch} className="w-full sm:max-w-md flex gap-2">
          <input
            type="text"
            placeholder="Search by name, ID, email or specialization..."
            className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Button type="submit" variant="primary">Search</Button>
        </form>
      </div>

      {/* List */}
      {error && <div className="p-4 mb-4 text-red-700 bg-red-100 rounded-lg">{error}</div>}
      
      {loading ? (
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-24 bg-gray-200 rounded-lg w-full"></div>
          ))}
        </div>
      ) : doctors.length === 0 ? (
        <div className="text-center py-16 bg-white border border-gray-200 rounded-lg shadow-sm">
          <h3 className="mt-2 text-sm font-semibold text-gray-900">No doctors added yet</h3>
          <p className="mt-1 text-sm text-gray-500">
            Add your first doctor to start managing appointments and consultations.
          </p>
          <div className="mt-6">
            <Link href="/dashboard/doctors/new">
              <Button>Add Doctor</Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 shadow-sm rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Doctor</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee ID</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Specialization</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fee</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {doctors.map((doctor) => (
                  <tr key={doctor.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-bold">
                          {doctor.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{doctor.title ? `${doctor.title} ` : ''}{doctor.name}</div>
                          <div className="text-sm text-gray-500">{doctor.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {doctor.employeeId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{doctor.specialization}</div>
                      <div className="text-xs text-gray-500">{doctor.subSpecialization}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${doctor.consultationFee}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${doctor.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {doctor.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link href={`/dashboard/doctors/${doctor.id}`} className="text-teal-600 hover:text-teal-900 mr-4">
                        View
                      </Link>
                      <Link href={`/dashboard/doctors/${doctor.id}/edit`} className="text-indigo-600 hover:text-indigo-900 mr-4">
                        Edit
                      </Link>
                      <Link href={`/dashboard/doctors/${doctor.id}/schedule`} className="text-blue-600 hover:text-blue-900">
                        Schedule
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

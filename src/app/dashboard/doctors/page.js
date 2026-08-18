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
        active: res.doctors.filter(d => d.doctor.isActive).length,
        notAccepting: res.doctors.filter(d => d.doctor.isActive && !d.profile.isAcceptingAppointments).length,
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
    <div className="pb-12 w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-[#0f3d69] to-[#2ab5e1]">Doctors</h1>
          <p className="mt-2 text-sm font-medium text-gray-500">Manage doctors, schedules, availability and clinic access.</p>
        </div>
        <Link href="/dashboard/doctors/new">
          <Button className="rounded-xl px-6 bg-gradient-to-r from-[#0f3d69] to-[#15558d] hover:from-[#15558d] hover:to-[#2ab5e1] border-none shadow-md hover:-translate-y-0.5 transition-all">Add Doctor</Button>
        </Link>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 mb-10">
        <div className="rounded-[1.5rem] border border-gray-100 bg-white p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-20 h-20 bg-gray-50 rounded-full opacity-50"></div>
          <h3 className="text-sm font-bold tracking-widest text-gray-400 uppercase relative z-10">Total Doctors</h3>
          <p className="mt-2 text-4xl font-black text-gray-900 relative z-10">{stats.total}</p>
        </div>
        <div className="rounded-[1.5rem] border border-gray-100 bg-white p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-20 h-20 bg-teal-50 rounded-full opacity-50"></div>
          <h3 className="text-sm font-bold tracking-widest text-teal-600/70 uppercase relative z-10">Active Doctors</h3>
          <p className="mt-2 text-4xl font-black text-teal-600 relative z-10">{stats.active}</p>
        </div>
        <div className="rounded-[1.5rem] border border-gray-100 bg-white p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-20 h-20 bg-amber-50 rounded-full opacity-50"></div>
          <h3 className="text-sm font-bold tracking-widest text-amber-600/70 uppercase relative z-10">Not Accepting</h3>
          <p className="mt-2 text-4xl font-black text-amber-600 relative z-10">{stats.notAccepting}</p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="mb-8 bg-white p-4 rounded-[1.5rem] border border-gray-100 shadow-[0_4px_20px_rgb(0,0,0,0.03)] flex flex-col sm:flex-row gap-4 items-center justify-between relative z-10">
        <form onSubmit={handleSearch} className="w-full sm:max-w-md flex gap-2">
          <input
            type="text"
            placeholder="Search by name, ID, email or specialization..."
            className="flex-1 rounded-xl border-gray-200 bg-gray-50 shadow-inner focus:border-teal-500 focus:ring-teal-500 focus:bg-white transition-colors sm:text-sm px-4 py-2 font-medium"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Button type="submit" className="rounded-xl px-6 bg-gradient-to-r from-[#0f3d69] to-[#15558d] hover:from-[#15558d] hover:to-[#2ab5e1] border-none shadow-md">Search</Button>
        </form>
      </div>

      {/* List */}
      {error && <div className="p-4 mb-4 text-red-700 bg-red-100 rounded-lg">{error}</div>}
      
      {loading ? (
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-24 bg-gray-100 rounded-[1.5rem] w-full"></div>
          ))}
        </div>
      ) : doctors.length === 0 ? (
        <div className="text-center py-20 bg-white border border-gray-100 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          <div className="w-20 h-20 mx-auto bg-gray-50 rounded-full flex items-center justify-center mb-4">
            <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
          </div>
          <h3 className="mt-2 text-lg font-bold text-gray-900 tracking-tight">No doctors added yet</h3>
          <p className="mt-1 text-sm font-medium text-gray-500 max-w-sm mx-auto">
            Add your first doctor to start managing appointments and consultations.
          </p>
          <div className="mt-8">
            <Link href="/dashboard/doctors/new">
              <Button className="rounded-xl px-6 bg-gradient-to-r from-[#0f3d69] to-[#15558d] border-none shadow-md">Add Doctor</Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[2rem] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50/50">
                <tr>
                  <th scope="col" className="px-8 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Doctor</th>
                  <th scope="col" className="px-8 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Employee ID</th>
                  <th scope="col" className="px-8 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Specialization</th>
                  <th scope="col" className="px-8 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Fee</th>
                  <th scope="col" className="px-8 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                  <th scope="col" className="px-8 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-50">
                {doctors.map(({ doctor, profile }) => (
                  <tr key={profile.id || doctor._id} className="hover:bg-blue-50/50 transition-colors group">
                    <td className="px-8 py-5 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-12 w-12 rounded-full bg-gradient-to-tr from-[#15558d] to-[#2ab5e1] flex items-center justify-center text-white font-black shadow-md group-hover:scale-105 transition-transform">
                          {doctor.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="ml-5">
                          <div className="text-sm font-bold text-gray-900">{profile.title ? `${profile.title} ` : ''}{doctor.name}</div>
                          <div className="text-sm font-medium text-gray-500">{doctor.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5 whitespace-nowrap text-sm font-medium text-gray-500">
                      {profile.employeeId}
                    </td>
                    <td className="px-8 py-5 whitespace-nowrap">
                      <div className="text-sm font-bold text-gray-900">{profile.specialization}</div>
                      <div className="text-xs font-medium text-gray-500">{profile.subSpecialization}</div>
                    </td>
                    <td className="px-8 py-5 whitespace-nowrap text-sm font-bold text-gray-900">
                      ${profile.consultationFee}
                    </td>
                    <td className="px-8 py-5 whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex text-xs font-bold rounded-full ${doctor.isActive ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                        {doctor.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-8 py-5 whitespace-nowrap text-right text-sm font-bold">
                      <Link href={`/dashboard/doctors/${doctor._id || doctor.id}`} className="text-[#15558d] hover:text-[#2ab5e1] mr-4 transition-colors">
                        View
                      </Link>
                      <Link href={`/dashboard/doctors/${doctor._id || doctor.id}/edit`} className="text-indigo-500 hover:text-indigo-700 mr-4 transition-colors">
                        Edit
                      </Link>
                      <Link href={`/dashboard/doctors/${doctor._id || doctor.id}/schedule`} className="text-teal-500 hover:text-teal-700 transition-colors">
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

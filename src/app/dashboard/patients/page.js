"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getPatients } from "@/frontend/services/patientApi";
import PatientTable from "@/frontend/components/patients/PatientTable";
import { Plus, Search, Users, UserPlus, Activity, FileText } from "lucide-react";

export default function PatientsPage() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, active: 0, newThisMonth: 0, updated: 0 });
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("active");

  useEffect(() => {
    fetchPatients();
  }, [search, filterStatus]);

  const fetchPatients = async () => {
    setLoading(true);
    try {
      const res = await getPatients({ search, status: filterStatus });
      if (res.success) {
        setPatients(res.patients);
        setStats(prev => ({ ...prev, total: res.pagination.total }));
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6 w-full pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-[#0f3d69] to-[#2ab5e1]">Patients</h1>
          <p className="text-gray-500 font-medium mt-2">Manage clinic patients, contact details and medical profiles.</p>
        </div>
        <Link href="/dashboard/patients/new" className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-[#0f3d69] to-[#15558d] hover:from-[#15558d] hover:to-[#2ab5e1] text-white rounded-xl font-bold transition-all shadow-md hover:-translate-y-0.5">
          <Plus className="w-5 h-5 mr-2" /> Add Patient
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <div className="bg-white p-6 rounded-[1.5rem] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden flex flex-col justify-center">
          <div className="absolute -right-4 -top-4 w-20 h-20 bg-blue-50 rounded-full opacity-50"></div>
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shrink-0 shadow-sm">
              <Users className="w-7 h-7" />
            </div>
            <div>
              <p className="text-xs font-bold tracking-widest text-gray-400 uppercase">Total</p>
              <p className="text-3xl font-black text-gray-900 mt-1">{stats.total}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-[1.5rem] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden flex flex-col justify-center">
          <div className="absolute -right-4 -top-4 w-20 h-20 bg-teal-50 rounded-full opacity-50"></div>
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-14 h-14 bg-gradient-to-br from-teal-100 to-teal-50 text-teal-600 rounded-2xl flex items-center justify-center shrink-0 shadow-sm">
              <Activity className="w-7 h-7" />
            </div>
            <div>
              <p className="text-xs font-bold tracking-widest text-teal-600/70 uppercase">Active</p>
              <p className="text-3xl font-black text-teal-600 mt-1">{filterStatus === 'active' ? stats.total : '-'}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-[1.5rem] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden flex flex-col justify-center">
          <div className="absolute -right-4 -top-4 w-20 h-20 bg-indigo-50 rounded-full opacity-50"></div>
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-14 h-14 bg-gradient-to-br from-indigo-100 to-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center shrink-0 shadow-sm">
              <UserPlus className="w-7 h-7" />
            </div>
            <div>
              <p className="text-xs font-bold tracking-widest text-indigo-400 uppercase">New</p>
              <p className="text-3xl font-black text-indigo-600 mt-1">--</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-[1.5rem] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden flex flex-col justify-center">
          <div className="absolute -right-4 -top-4 w-20 h-20 bg-amber-50 rounded-full opacity-50"></div>
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-14 h-14 bg-gradient-to-br from-amber-100 to-amber-50 text-amber-600 rounded-2xl flex items-center justify-center shrink-0 shadow-sm">
              <FileText className="w-7 h-7" />
            </div>
            <div>
              <p className="text-xs font-bold tracking-widest text-amber-600/70 uppercase">Updated</p>
              <p className="text-3xl font-black text-amber-600 mt-1">--</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row gap-4 items-center justify-between bg-gray-50/30">
          <div className="relative w-full sm:max-w-md">
            <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search by name, patient ID, phone..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-inner"
            />
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <select 
              value={filterStatus} 
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-3 border border-gray-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="p-12 flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : patients.length > 0 ? (
          <PatientTable patients={patients} />
        ) : (
          <div className="p-20 text-center">
            <div className="w-24 h-24 bg-gray-50 text-gray-400 rounded-full flex items-center justify-center mx-auto mb-6">
              <Users className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-black text-gray-900 mb-2">No patients found</h3>
            <p className="text-gray-500 font-medium mb-8 max-w-sm mx-auto">Add your first patient to start managing appointments and medical records.</p>
            <Link href="/dashboard/patients/new" className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-[#0f3d69] to-[#15558d] hover:from-[#15558d] hover:to-[#2ab5e1] text-white rounded-xl font-bold transition-all shadow-md hover:-translate-y-0.5">
              <Plus className="w-5 h-5 mr-2" /> Add Patient
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

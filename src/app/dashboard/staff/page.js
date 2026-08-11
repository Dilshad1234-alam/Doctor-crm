"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/frontend/context/AuthContext";
import { staffApi } from "@/frontend/services/staffApi";
import AddStaffModal from "@/frontend/components/staff/AddStaffModal";
import StaffPermissionsModal from "@/frontend/components/staff/StaffPermissionsModal";
import PageHeader from "@/frontend/components/dashboard/PageHeader";
import { Users, UserCheck, Phone, Shield, FileText } from "lucide-react";

export default function StaffPage() {
  const { user } = useAuth();
  const [staffList, setStaffList] = useState([]);
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(true);
  
  const [filterRole, setFilterRole] = useState("all");
  const [search, setSearch] = useState("");
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [permissionsModalData, setPermissionsModalData] = useState(null);

  useEffect(() => {
    fetchStaff();
  }, [filterRole, search]);

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const data = await staffApi.getStaffList({ role: filterRole, search });
      setStaffList(data.staff);
      setSummary(data.summary);
    } catch (error) {
      console.error(error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (staffId, currentStatus) => {
    try {
      if (currentStatus === "active") {
        await staffApi.deactivateStaff(staffId);
      } else {
        await staffApi.activateStaff(staffId);
      }
      fetchStaff();
    } catch (error) {
      alert(error.message);
    }
  };

  if (user?.role !== "clinic_owner") {
    return (
      <div className="p-8">
        <h2 className="text-xl text-red-600">Unauthorized: Only Clinic Owner can manage staff.</h2>
      </div>
    );
  }

  return (
    <div className="pb-12 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-[#0f3d69] to-[#2ab5e1]">Staff Management</h1>
          <p className="mt-2 text-sm font-medium text-gray-500">Manage your clinic staff and their access roles</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-[#0f3d69] to-[#15558d] hover:from-[#15558d] hover:to-[#2ab5e1] text-white rounded-xl font-bold transition-all shadow-md hover:-translate-y-0.5"
        >
          <span className="mr-2 text-lg">+</span> Add Staff
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-10">
        <div className="bg-white p-6 rounded-[1.5rem] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden flex flex-col justify-center">
          <div className="absolute -right-4 -top-4 w-20 h-20 bg-blue-50 rounded-full opacity-50"></div>
          <p className="text-xs font-bold tracking-widest text-gray-400 uppercase relative z-10">Total Staff</p>
          <p className="text-3xl font-black text-gray-900 mt-1 relative z-10">{summary.totalStaff || 0}</p>
        </div>
        <div className="bg-white p-6 rounded-[1.5rem] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden flex flex-col justify-center">
          <div className="absolute -right-4 -top-4 w-20 h-20 bg-green-50 rounded-full opacity-50"></div>
          <p className="text-xs font-bold tracking-widest text-green-600/70 uppercase relative z-10">Active</p>
          <p className="text-3xl font-black text-green-600 mt-1 relative z-10">{summary.activeStaff || 0}</p>
        </div>
        <div className="bg-white p-6 rounded-[1.5rem] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden flex flex-col justify-center">
          <div className="absolute -right-4 -top-4 w-20 h-20 bg-indigo-50 rounded-full opacity-50"></div>
          <p className="text-xs font-bold tracking-widest text-indigo-400 uppercase relative z-10">Receptionists</p>
          <p className="text-3xl font-black text-indigo-600 mt-1 relative z-10">{summary.receptionists || 0}</p>
        </div>
        <div className="bg-white p-6 rounded-[1.5rem] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden flex flex-col justify-center">
          <div className="absolute -right-4 -top-4 w-20 h-20 bg-purple-50 rounded-full opacity-50"></div>
          <p className="text-xs font-bold tracking-widest text-purple-400 uppercase relative z-10">Assistants</p>
          <p className="text-3xl font-black text-purple-600 mt-1 relative z-10">{summary.assistants || 0}</p>
        </div>
        <div className="bg-white p-6 rounded-[1.5rem] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden flex flex-col justify-center">
          <div className="absolute -right-4 -top-4 w-20 h-20 bg-amber-50 rounded-full opacity-50"></div>
          <p className="text-xs font-bold tracking-widest text-amber-600/70 uppercase relative z-10">Accountants</p>
          <p className="text-3xl font-black text-amber-600 mt-1 relative z-10">{summary.accountants || 0}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-8 bg-white p-6 rounded-[1.5rem] border border-gray-100 shadow-[0_4px_20px_rgb(0,0,0,0.03)] flex flex-col sm:flex-row gap-4 items-center relative z-10">
        <input 
          type="text"
          placeholder="Search by name, ID or phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 w-full rounded-xl border-gray-200 bg-gray-50 shadow-inner focus:border-[#15558d] focus:ring-[#15558d] focus:bg-white transition-colors px-4 py-3 font-medium text-sm"
        />
        <select 
          value={filterRole} 
          onChange={(e) => setFilterRole(e.target.value)}
          className="w-full sm:w-56 px-4 py-3 rounded-xl border-gray-200 bg-white font-medium shadow-sm focus:border-[#15558d] focus:ring-[#15558d]"
        >
          <option value="all">All Roles</option>
          <option value="receptionist">Receptionist</option>
          <option value="assistant">Assistant</option>
          <option value="accountant">Accountant</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 rounded-[2rem] overflow-hidden">
        <table className="min-w-full divide-y divide-gray-100">
          <thead className="bg-gray-50/50">
            <tr>
              <th className="px-8 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Staff Info</th>
              <th className="px-8 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Role</th>
              <th className="px-8 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Contact</th>
              <th className="px-8 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-8 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-50">
            {loading ? (
              <tr>
                <td colSpan="5" className="px-8 py-8 text-center text-sm font-medium text-gray-500">
                  <div className="animate-pulse">Loading staff...</div>
                </td>
              </tr>
            ) : staffList.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-8 py-16 text-center">
                  <div className="w-16 h-16 bg-gray-50 text-gray-400 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="w-8 h-8" />
                  </div>
                  <p className="text-lg font-bold text-gray-900 mb-1">No staff found</p>
                  <p className="text-sm font-medium text-gray-500">There are no staff members matching your criteria.</p>
                </td>
              </tr>
            ) : (
              staffList.map((staff) => (
                <tr key={staff._id} className="hover:bg-blue-50/50 transition-colors group">
                  <td className="px-8 py-5 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-12 w-12 flex-shrink-0 bg-gradient-to-br from-indigo-100 to-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 font-black shadow-sm group-hover:scale-105 transition-transform">
                        {staff.userId?.name?.charAt(0) || "S"}
                      </div>
                      <div className="ml-5">
                        <div className="text-sm font-bold text-gray-900 group-hover:text-indigo-700 transition-colors">{staff.userId?.name}</div>
                        <div className="text-xs font-medium text-gray-500">{staff.staffCode}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5 whitespace-nowrap">
                    <span className="px-3 py-1 inline-flex text-xs font-bold rounded-md bg-indigo-50 text-indigo-600 capitalize border border-indigo-100">
                      {staff.role}
                    </span>
                  </td>
                  <td className="px-8 py-5 whitespace-nowrap">
                    <div className="text-sm font-bold text-gray-700">{staff.userId?.email}</div>
                    <div className="text-xs font-medium text-gray-500 mt-0.5">{staff.phone || "-"}</div>
                  </td>
                  <td className="px-8 py-5 whitespace-nowrap">
                    <span className={`px-3 py-1 inline-flex text-xs font-bold rounded-md ${staff.status === 'active' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                      {staff.status}
                    </span>
                  </td>
                  <td className="px-8 py-5 whitespace-nowrap text-sm font-bold">
                    <button 
                      onClick={() => setPermissionsModalData(staff)}
                      className="text-[#15558d] hover:text-[#2ab5e1] mr-4 transition-colors"
                    >
                      Permissions
                    </button>
                    <button 
                      onClick={() => handleToggleStatus(staff._id, staff.status)}
                      className={`${staff.status === 'active' ? 'text-red-500 hover:text-red-700' : 'text-green-500 hover:text-green-700'} transition-colors`}
                    >
                      {staff.status === 'active' ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showAddModal && (
        <AddStaffModal 
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            setShowAddModal(false);
            fetchStaff();
          }}
        />
      )}

      {permissionsModalData && (
        <StaffPermissionsModal
          staff={permissionsModalData}
          onClose={() => setPermissionsModalData(null)}
          onSuccess={() => {
            setPermissionsModalData(null);
            fetchStaff();
          }}
        />
      )}
    </div>
  );
}

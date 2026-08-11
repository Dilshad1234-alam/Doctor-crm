"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/frontend/context/AuthContext";
import { staffApi } from "@/frontend/services/staffApi";
import AddStaffModal from "@/frontend/components/staff/AddStaffModal";
import StaffPermissionsModal from "@/frontend/components/staff/StaffPermissionsModal";

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
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Staff Management</h1>
          <p className="text-sm text-gray-500">Manage your clinic staff and their access roles</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          + Add Staff
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">Total Staff</p>
          <p className="text-2xl font-semibold">{summary.totalStaff || 0}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">Active</p>
          <p className="text-2xl font-semibold text-green-600">{summary.activeStaff || 0}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">Receptionists</p>
          <p className="text-2xl font-semibold">{summary.receptionists || 0}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">Assistants</p>
          <p className="text-2xl font-semibold">{summary.assistants || 0}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">Accountants</p>
          <p className="text-2xl font-semibold">{summary.accountants || 0}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-6 bg-white p-4 rounded-lg shadow-sm border border-gray-100">
        <input 
          type="text"
          placeholder="Search by name, ID or phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
        />
        <select 
          value={filterRole} 
          onChange={(e) => setFilterRole(e.target.value)}
          className="w-48 px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="all">All Roles</option>
          <option value="receptionist">Receptionist</option>
          <option value="assistant">Assistant</option>
          <option value="accountant">Accountant</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white shadow-sm border border-gray-100 rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Staff Info</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">Loading...</td>
              </tr>
            ) : staffList.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">No staff found</td>
              </tr>
            ) : (
              staffList.map((staff) => (
                <tr key={staff._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                        {staff.userId?.name?.charAt(0) || "S"}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{staff.userId?.name}</div>
                        <div className="text-sm text-gray-500">{staff.staffCode}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 capitalize">
                      {staff.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{staff.userId?.email}</div>
                    <div className="text-sm text-gray-500">{staff.phone || "-"}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${staff.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {staff.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button 
                      onClick={() => setPermissionsModalData(staff)}
                      className="text-indigo-600 hover:text-indigo-900 mr-4"
                    >
                      Permissions
                    </button>
                    <button 
                      onClick={() => handleToggleStatus(staff._id, staff.status)}
                      className={`${staff.status === 'active' ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'}`}
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

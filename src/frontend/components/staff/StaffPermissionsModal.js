import { useState, useEffect } from "react";
import { staffApi } from "@/frontend/services/staffApi";
import { AVAILABLE_PERMISSIONS } from "@/backend/config/rolePermissions"; // We can reuse this on frontend since it's just a constant

export default function StaffPermissionsModal({ staff, onClose, onSuccess }) {
  const [permissions, setPermissions] = useState([...(staff.permissions || [])]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleToggle = (permId) => {
    if (permissions.includes(permId)) {
      setPermissions(permissions.filter(p => p !== permId));
    } else {
      setPermissions([...permissions, permId]);
    }
  };

  const handleSelectGroup = (groupPerms, selectAll) => {
    const groupPermIds = groupPerms.map(p => p.id);
    if (selectAll) {
      const newPerms = [...new Set([...permissions, ...groupPermIds])];
      setPermissions(newPerms);
    } else {
      const newPerms = permissions.filter(p => !groupPermIds.includes(p));
      setPermissions(newPerms);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await staffApi.updatePermissions(staff._id, permissions);
      onSuccess();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl flex flex-col max-h-[90vh]">
        <div className="p-6 border-b flex justify-between items-center bg-gray-50 rounded-t-lg">
          <div>
            <h2 className="text-xl font-bold">Manage Permissions</h2>
            <p className="text-sm text-gray-500">
              {staff.userId?.name} ({staff.staffCode}) - <span className="capitalize">{staff.role}</span>
            </p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
        </div>
        
        <div className="p-6 overflow-y-auto flex-1">
          {error && <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm">{error}</div>}
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(AVAILABLE_PERMISSIONS).map(([groupName, groupPerms]) => {
              const allSelected = groupPerms.every(p => permissions.includes(p.id));
              
              return (
                <div key={groupName} className="border rounded-lg p-4 bg-gray-50">
                  <div className="flex justify-between items-center mb-3 pb-2 border-b">
                    <h3 className="font-semibold text-gray-800">{groupName.replace(/([A-Z])/g, ' $1').trim()}</h3>
                    <label className="flex items-center text-sm text-gray-600 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={allSelected}
                        onChange={(e) => handleSelectGroup(groupPerms, e.target.checked)}
                        className="mr-2 rounded text-blue-600 focus:ring-blue-500"
                      />
                      All
                    </label>
                  </div>
                  <div className="space-y-2">
                    {groupPerms.map(perm => (
                      <label key={perm.id} className="flex items-start cursor-pointer">
                        <input 
                          type="checkbox"
                          checked={permissions.includes(perm.id)}
                          onChange={() => handleToggle(perm.id)}
                          className="mt-1 mr-2 rounded text-blue-600 focus:ring-blue-500"
                        />
                        <div>
                          <p className="text-sm font-medium text-gray-700">{perm.label}</p>
                          <p className="text-xs text-gray-400 font-mono">{perm.id}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="p-6 border-t bg-gray-50 rounded-b-lg flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-200 bg-white"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Saving..." : "Save Permissions"}
          </button>
        </div>
      </div>
    </div>
  );
}

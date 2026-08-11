import { getAuthenticatedUser } from "@/backend/utils/getAuthenticatedUser";
import { User as UserIcon } from "lucide-react";

export const metadata = {
  title: "My Profile | Patient Portal",
};

export default async function PatientProfilePage() {
  const user = await getAuthenticatedUser();
  
  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
        <p className="text-gray-600">Manage your personal details and account settings.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 max-w-2xl">
        <div className="flex items-center space-x-4 mb-6 pb-6 border-b border-gray-100">
          <div className="w-16 h-16 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center font-bold text-xl">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">{user.name}</h2>
            <p className="text-gray-500 capitalize">{user.role}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">Email Address</label>
            <div className="text-gray-900 font-medium">{user.email}</div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">Phone Number</label>
            <div className="text-gray-900 font-medium">{user.phone || "Not provided"}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

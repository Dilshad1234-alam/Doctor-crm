"use client";

import { useAuth } from "@/frontend/context/AuthContext";
import Button from "@/frontend/components/ui/Button";

export default function DashboardHeader({ user: serverUser }) {
  const { user: clientUser, logout } = useAuth();
  
  // Use client user if available (for instant updates), otherwise fallback to server provided user
  const user = clientUser || serverUser;

  if (!user) return null;

  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const displayRole = user.role.replace("_", " ");

  return (
    <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6">
      <div className="flex flex-1 items-center">
        <span className="text-sm font-medium text-gray-500 hidden sm:block capitalize">
          {displayRole}
        </span>
      </div>
      <div className="flex items-center space-x-4">
        <div className="text-sm text-gray-700 font-medium">{user.name}</div>
        <div className="h-8 w-8 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-bold text-xs">
          {initials}
        </div>
        <Button variant="outline" className="text-xs py-1 px-3 ml-2" onClick={logout}>
          Logout
        </Button>
      </div>
    </header>
  );
}

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
    <header className="flex h-16 items-center justify-between border-b border-gray-100 bg-white/80 backdrop-blur-md px-6 shadow-sm relative z-10">
      <div className="flex flex-1 items-center">
        <span className="text-sm font-medium text-gray-500 hidden sm:block capitalize">
          {displayRole}
        </span>
      </div>
      <div className="flex items-center space-x-4">
        <div className="text-sm text-gray-700 font-bold tracking-tight">{user.name}</div>
        <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-[#15558d] to-[#2ab5e1] flex items-center justify-center text-white font-black text-xs shadow-md">
          {initials}
        </div>
        <Button variant="outline" className="text-xs py-1.5 px-4 ml-2 border-gray-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all rounded-lg" onClick={logout}>
          Logout
        </Button>
      </div>
    </header>
  );
}

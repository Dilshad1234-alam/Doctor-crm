"use client";
import { User, Clock, Calendar, FileText, Lock, Bell, Settings, Link as LinkIcon, Shield } from "lucide-react";

export default function SettingsNavigation({ activeTab, onTabChange, role }) {
  const tabs = [
    { id: "profile", label: "Clinic Profile", icon: Settings, roles: ["clinic_owner"] },
    { id: "hours", label: "Working Hours", icon: Clock, roles: ["clinic_owner"] },
    { id: "appointments", label: "Appointment Settings", icon: Calendar, roles: ["clinic_owner"] },
    { id: "billing", label: "Billing Settings", icon: FileText, roles: ["clinic_owner", "accountant"] },
    { id: "notifications", label: "Notifications", icon: Bell, roles: ["clinic_owner"] },
    { id: "security", label: "Security", icon: Shield, roles: ["clinic_owner", "doctor", "receptionist", "assistant", "accountant"] },
  ];

  const visibleTabs = tabs.filter(tab => tab.roles.includes(role));

  return (
    <nav className="space-y-1">
      {visibleTabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-md transition-colors ${
              isActive 
                ? "bg-indigo-50 text-indigo-700" 
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            <Icon className={`w-4 h-4 mr-3 flex-shrink-0 ${isActive ? "text-indigo-600" : "text-gray-400"}`} />
            {tab.label}
          </button>
        );
      })}
    </nav>
  );
}

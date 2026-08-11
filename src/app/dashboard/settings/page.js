"use client";
import { useState, useEffect } from "react";
import PageHeader from "@/frontend/components/dashboard/PageHeader";
import SettingsNavigation from "@/frontend/components/settings/SettingsNavigation";
import ClinicProfileTab from "@/frontend/components/settings/ClinicProfileTab";
import WorkingHoursTab from "@/frontend/components/settings/WorkingHoursTab";
import AppointmentSettingsTab from "@/frontend/components/settings/AppointmentSettingsTab";
import BillingSettingsTab from "@/frontend/components/settings/BillingSettingsTab";
import PrescriptionSettingsTab from "@/frontend/components/settings/PrescriptionSettingsTab";
import NotificationSettingsTab from "@/frontend/components/settings/NotificationSettingsTab";
import SecurityTab from "@/frontend/components/settings/SecurityTab";
import { useAuth } from "@/frontend/context/AuthContext";
import { 
  getSettings, updateClinicProfile, updateWorkingHours, 
  updateAppointmentSettings, updateBillingSettings, 
  updatePrescriptionSettings, updateNotificationSettings, changePassword 
} from "@/frontend/services/settingsApi";

export default function SettingsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState(user?.role === "clinic_owner" ? "profile" : "security");
  
  const [clinic, setClinic] = useState(null);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSettingsData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getSettings();
      setClinic(data.clinic);
      setSettings(data.settings);
    } catch (err) {
      console.error(err);
      setError("Unable to load clinic settings.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettingsData();
  }, []);

  const handleUpdateClinicProfile = async (data) => {
    const updated = await updateClinicProfile(data);
    setClinic(updated.clinic);
  };

  const handleUpdateWorkingHours = async (data) => {
    const updated = await updateWorkingHours(data);
    setSettings(prev => ({ ...prev, workingHours: updated.workingHours }));
  };

  const handleUpdateAppointmentSettings = async (data) => {
    const updated = await updateAppointmentSettings(data);
    setSettings(prev => ({ ...prev, appointmentSettings: updated.appointmentSettings }));
  };

  const handleUpdateBillingSettings = async (data) => {
    const updated = await updateBillingSettings(data);
    setSettings(prev => ({ ...prev, billingSettings: updated.billingSettings }));
  };

  const handleUpdatePrescriptionSettings = async (data) => {
    const updated = await updatePrescriptionSettings(data);
    setSettings(prev => ({ ...prev, prescriptionSettings: updated.prescriptionSettings }));
  };

  const handleUpdateNotificationSettings = async (data) => {
    const updated = await updateNotificationSettings(data);
    setSettings(prev => ({ ...prev, notificationSettings: updated.notificationSettings }));
  };

  const handleChangePassword = async (data) => {
    await changePassword(data);
  };

  if (loading) {
    return (
      <div className="pb-20 max-w-7xl mx-auto">
        <PageHeader title="Settings" description="Manage your clinic, appointments, billing and account settings." />
        <div className="animate-pulse flex gap-8">
          <div className="w-64 bg-gray-200 h-96 rounded-lg"></div>
          <div className="flex-1 bg-gray-200 h-96 rounded-lg"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pb-20 max-w-7xl mx-auto">
        <PageHeader title="Settings" description="Manage your clinic, appointments, billing and account settings." />
        <div className="bg-red-50 p-6 rounded-lg border border-red-200 flex flex-col items-center">
          <p className="text-red-700 font-medium mb-4">{error}</p>
          <button onClick={fetchSettingsData} className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700">Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-20 max-w-7xl mx-auto">
      <PageHeader 
        title="Settings" 
        description="Manage your clinic, appointments, billing and account settings." 
      />

      <div className="flex flex-col md:flex-row gap-8">
        <aside className="w-full md:w-64 flex-shrink-0">
          <div className="bg-white rounded-lg border shadow-sm p-2 sticky top-4">
            <SettingsNavigation 
              activeTab={activeTab} 
              onTabChange={setActiveTab} 
              role={user?.role} 
            />
          </div>
        </aside>
        
        <main className="flex-1 bg-white rounded-lg border shadow-sm p-6">
          {activeTab === "profile" && <ClinicProfileTab clinic={clinic} onSave={handleUpdateClinicProfile} />}
          {activeTab === "hours" && <WorkingHoursTab workingHours={settings?.workingHours} onSave={handleUpdateWorkingHours} />}
          {activeTab === "appointments" && <AppointmentSettingsTab settings={settings?.appointmentSettings} onSave={handleUpdateAppointmentSettings} />}
          {activeTab === "billing" && <BillingSettingsTab settings={settings?.billingSettings} onSave={handleUpdateBillingSettings} />}
          {activeTab === "prescriptions" && <PrescriptionSettingsTab settings={settings?.prescriptionSettings} onSave={handleUpdatePrescriptionSettings} />}
          {activeTab === "notifications" && <NotificationSettingsTab settings={settings?.notificationSettings} onSave={handleUpdateNotificationSettings} />}
          {activeTab === "security" && <SecurityTab onSave={handleChangePassword} />}
        </main>
      </div>
    </div>
  );
}

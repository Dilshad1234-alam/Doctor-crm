"use client";

import { useAuth } from "@/frontend/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { Settings as SettingsIcon, Save, Mail, Phone, ShieldCheck, Bell, Building2 } from "lucide-react";
import Button from "@/frontend/components/ui/Button";

export default function AdminSettingsPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [settings, setSettings] = useState({
    platformName: "",
    supportEmail: "",
    supportPhone: "",
    notifications: { emailEnabled: true, smsEnabled: false },
    security: { requireStrongPasswords: true, sessionTimeoutMinutes: 60 }
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/settings");
      const data = await res.json();
      if (data.success && data.settings) {
        setSettings(data.settings);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user && user.role !== "admin") {
      router.push("/dashboard");
    } else if (user?.role === "admin") {
      fetchSettings();
    }
  }, [user, router, fetchSettings]);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setSaveSuccess(false);
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings)
      });
      const data = await res.json();
      if (data.success) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        alert("Failed to save settings: " + data.message);
      }
    } catch (err) {
      alert("An error occurred while saving.");
    } finally {
      setSaving(false);
    }
  };

  if (user?.role !== "admin") return null;

  return (
    <div className="space-y-6 pb-10 max-w-[1000px] mx-auto" style={{ fontFamily: "'Poppins', sans-serif" }}>
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <SettingsIcon className="text-blue-600" />
            Platform Settings
          </h1>
          <p className="text-xs text-slate-400 font-medium mt-1">Manage global configuration and platform defaults</p>
        </div>
      </div>

      {loading ? (
        <div className="py-20 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>
      ) : (
        <form onSubmit={handleSave} className="space-y-8 mt-6">
          
          {/* General Info */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
            <div className="px-8 py-6 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                <Building2 size={20} />
              </div>
              <div>
                <h2 className="text-lg font-black text-slate-800">General Information</h2>
                <p className="text-xs text-slate-500 font-medium">Basic details about your platform.</p>
              </div>
            </div>
            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Platform Name</label>
                <input 
                  type="text" required 
                  value={settings.platformName} 
                  onChange={e => setSettings({...settings, platformName: e.target.value})} 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none" 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1"><Mail size={14} className="text-slate-400"/> Support Email</label>
                <input 
                  type="email" required 
                  value={settings.supportEmail} 
                  onChange={e => setSettings({...settings, supportEmail: e.target.value})} 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none" 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1"><Phone size={14} className="text-slate-400"/> Support Phone</label>
                <input 
                  type="text" required 
                  value={settings.supportPhone} 
                  onChange={e => setSettings({...settings, supportPhone: e.target.value})} 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none" 
                />
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
            <div className="px-8 py-6 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                <Bell size={20} />
              </div>
              <div>
                <h2 className="text-lg font-black text-slate-800">Global Notifications</h2>
                <p className="text-xs text-slate-500 font-medium">Manage how the system communicates with users.</p>
              </div>
            </div>
            <div className="p-8 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Email Notifications</h4>
                  <p className="text-xs text-slate-500 mt-0.5">Enable sending automated emails for appointments and billing.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" checked={settings.notifications.emailEnabled} onChange={e => setSettings({...settings, notifications: {...settings.notifications, emailEnabled: e.target.checked}})} />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                </label>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">SMS Notifications</h4>
                  <p className="text-xs text-slate-500 mt-0.5">Enable SMS alerts for critical updates. (Requires gateway configuration)</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" checked={settings.notifications.smsEnabled} onChange={e => setSettings({...settings, notifications: {...settings.notifications, smsEnabled: e.target.checked}})} />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Security */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
            <div className="px-8 py-6 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center">
                <ShieldCheck size={20} />
              </div>
              <div>
                <h2 className="text-lg font-black text-slate-800">Security Policies</h2>
                <p className="text-xs text-slate-500 font-medium">Configure security and access requirements.</p>
              </div>
            </div>
            <div className="p-8 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Require Strong Passwords</h4>
                  <p className="text-xs text-slate-500 mt-0.5">Force users to use complex passwords (min 8 chars, numbers, symbols).</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" checked={settings.security.requireStrongPasswords} onChange={e => setSettings({...settings, security: {...settings.security, requireStrongPasswords: e.target.checked}})} />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                </label>
              </div>
              
              <div className="pt-4 border-t border-slate-100">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Session Timeout (Minutes)</label>
                <div className="flex items-center gap-3">
                  <input 
                    type="number" min="15" max="1440" required 
                    value={settings.security.sessionTimeoutMinutes} 
                    onChange={e => setSettings({...settings, security: {...settings.security, sessionTimeoutMinutes: Number(e.target.value)}})} 
                    className="w-32 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm font-medium focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all outline-none text-center" 
                  />
                  <span className="text-xs font-medium text-slate-500">Minutes before inactive users are logged out.</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 pb-10">
            {saveSuccess ? (
              <span className="text-sm font-bold text-emerald-600 flex items-center gap-2">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                Settings saved successfully!
              </span>
            ) : <span></span>}
            
            <Button type="submit" disabled={saving} className={`rounded-xl px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-black text-sm flex items-center gap-2 shadow-md transition-all ${saving ? 'opacity-75 cursor-not-allowed' : ''}`}>
              {saving ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div> : <Save size={18} />}
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}

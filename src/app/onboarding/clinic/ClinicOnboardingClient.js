"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { setupClinic } from "@/frontend/services/authApi";
import { useAuth } from "@/frontend/context/AuthContext";
import { Building2, Mail, Phone, MapPin, Map, Navigation, Clock, ArrowRight, Activity } from "lucide-react";

export default function ClinicOnboardingClient() {
  const router = useRouter();
  const { user, loading: authLoading, refreshUser } = useAuth();
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    pincode: "",
    consultationDuration: 15,
  });
  
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push("/login");
      } else if (user.onboardingCompleted) {
        router.push("/dashboard");
      }
    }
  }, [user, authLoading, router]);

  const handleChange = (e) => {
    const value = e.target.name === "consultationDuration" 
      ? parseInt(e.target.value) || "" 
      : e.target.value;
      
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await setupClinic(formData);
      await refreshUser();
      router.push("/dashboard");
    } catch (err) {
      setError(err.message || "Failed to setup clinic");
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#15558d] to-[#2ab5e1] flex items-center justify-center">
        <div className="animate-spin text-white">
          <Activity size={48} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-[#15558d] to-[#2ab5e1] font-sans relative overflow-hidden">
      {/* Background abstract shapes */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-1/4 -right-1/4 w-[800px] h-[800px] rounded-full bg-white/5 blur-3xl"></div>
        <div className="absolute top-1/2 -left-1/4 w-[600px] h-[600px] rounded-full bg-white/5 blur-3xl"></div>
      </div>
      
      <div className="flex-1 flex flex-col justify-center items-center relative z-10 px-4 sm:px-6 lg:px-8 py-4 md:py-8">
        
        {/* Header Section */}
        <div className="text-center mb-4">
          <div className="flex justify-center mb-3">
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-blue-600 shadow-xl">
              <Building2 strokeWidth={2.5} size={36} />
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight mb-3">
            Setup Your Clinic
          </h1>
          <p className="text-lg text-blue-100 font-medium max-w-lg mx-auto">
            Let's configure your primary clinic details to finalize your account setup. You can update these later.
          </p>
        </div>

        {/* Form Card */}
        <div className="w-full max-w-2xl bg-white p-6 md:p-8 rounded-[2rem] shadow-2xl shadow-blue-900/20 border border-white/20">
          {error && (
            <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-xl">
              <p className="text-sm text-red-700 font-medium">{error}</p>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              
              {/* Clinic Name */}
              <div className="sm:col-span-2">
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Clinic Name *</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Building2 className="h-5 w-5 text-gray-400" strokeWidth={2} />
                  </div>
                  <input
                    name="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="block w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-medium"
                    placeholder="e.g. City Health Care"
                  />
                </div>
              </div>

              {/* Clinic Email */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Clinic Email</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" strokeWidth={2} />
                  </div>
                  <input
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="block w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-medium"
                    placeholder="contact@clinic.com"
                  />
                </div>
              </div>

              {/* Clinic Phone */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Clinic Phone</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-gray-400" strokeWidth={2} />
                  </div>
                  <input
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    className="block w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-medium"
                    placeholder="+91 9876543210"
                  />
                </div>
              </div>

              {/* Address Line 1 */}
              <div className="sm:col-span-2">
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Address Line 1 *</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <MapPin className="h-5 w-5 text-gray-400" strokeWidth={2} />
                  </div>
                  <input
                    name="addressLine1"
                    type="text"
                    required
                    value={formData.addressLine1}
                    onChange={handleChange}
                    className="block w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-medium"
                    placeholder="123 Health Ave, Sector 4"
                  />
                </div>
              </div>

              {/* Address Line 2 */}
              <div className="sm:col-span-2">
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Address Line 2 (Optional)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <MapPin className="h-5 w-5 text-gray-400" strokeWidth={2} />
                  </div>
                  <input
                    name="addressLine2"
                    type="text"
                    value={formData.addressLine2}
                    onChange={handleChange}
                    className="block w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-medium"
                    placeholder="Near City Hospital"
                  />
                </div>
              </div>

              {/* City */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">City *</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Map className="h-5 w-5 text-gray-400" strokeWidth={2} />
                  </div>
                  <input
                    name="city"
                    type="text"
                    required
                    value={formData.city}
                    onChange={handleChange}
                    className="block w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-medium"
                    placeholder="Mumbai"
                  />
                </div>
              </div>

              {/* State */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">State *</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Navigation className="h-5 w-5 text-gray-400" strokeWidth={2} />
                  </div>
                  <input
                    name="state"
                    type="text"
                    required
                    value={formData.state}
                    onChange={handleChange}
                    className="block w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-medium"
                    placeholder="Maharashtra"
                  />
                </div>
              </div>

              {/* Pincode */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Pincode *</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <MapPin className="h-5 w-5 text-gray-400" strokeWidth={2} />
                  </div>
                  <input
                    name="pincode"
                    type="text"
                    required
                    value={formData.pincode}
                    onChange={handleChange}
                    className="block w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-medium"
                    placeholder="400001"
                  />
                </div>
              </div>

              {/* Consultation Duration */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Consultation Duration (mins)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Clock className="h-5 w-5 text-gray-400" strokeWidth={2} />
                  </div>
                  <input
                    name="consultationDuration"
                    type="number"
                    required
                    min="5"
                    value={formData.consultationDuration}
                    onChange={handleChange}
                    className="block w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-medium"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 mt-2 border-t border-gray-100">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold transition-all shadow-lg shadow-blue-500/30 disabled:opacity-70 disabled:shadow-none"
              >
                <span>{loading ? "Setting up Clinic..." : "Complete Setup & Open Dashboard"}</span>
                {!loading && <ArrowRight className="h-5 w-5" />}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

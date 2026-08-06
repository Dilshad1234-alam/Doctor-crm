"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { setupClinic } from "@/frontend/services/authApi";
import { useAuth } from "@/frontend/context/AuthContext";
import Button from "@/frontend/components/ui/Button";

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
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-2xl">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Setup Your Clinic
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Let's configure your primary clinic details. You can update these later.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-2xl">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-gray-100">
          {error && (
            <div className="mb-6 bg-red-50 border-l-4 border-red-400 p-4 rounded-md">
              <div className="flex">
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Clinic Name *</label>
                <input
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                  placeholder="e.g. City Health Care"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Clinic Email</label>
                <input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Clinic Phone</label>
                <input
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Address Line 1 *</label>
                <input
                  name="addressLine1"
                  type="text"
                  required
                  value={formData.addressLine1}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Address Line 2</label>
                <input
                  name="addressLine2"
                  type="text"
                  value={formData.addressLine2}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">City *</label>
                <input
                  name="city"
                  type="text"
                  required
                  value={formData.city}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">State *</label>
                <input
                  name="state"
                  type="text"
                  required
                  value={formData.state}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Pincode *</label>
                <input
                  name="pincode"
                  type="text"
                  required
                  value={formData.pincode}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Consultation Duration (mins)</label>
                <input
                  name="consultationDuration"
                  type="number"
                  required
                  min="5"
                  value={formData.consultationDuration}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                />
              </div>
            </div>

            <div className="pt-5 border-t border-gray-200">
              <Button
                type="submit"
                variant="primary"
                className="w-full sm:w-auto px-8"
                disabled={loading}
              >
                {loading ? "Setting up..." : "Complete Setup"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

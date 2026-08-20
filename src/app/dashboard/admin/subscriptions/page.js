"use client";

import { useAuth } from "@/frontend/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { CreditCard, Sparkles, Plus, Check, Search, Calendar, Users, Activity, User } from "lucide-react";
import Button from "@/frontend/components/ui/Button";
import Link from "next/link";

export default function AdminSubscriptionsPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState("plans");
  const [plans, setPlans] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [showAddPlan, setShowAddPlan] = useState(false);
  const [newPlan, setNewPlan] = useState({
    name: "",
    description: "",
    price: "",
    billingCycle: "monthly",
    features: "",
    limits: { maxDoctors: "", maxPatients: "", maxStaff: "" }
  });

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [plansRes, subsRes] = await Promise.all([
        fetch("/api/admin/subscriptions/plans"),
        fetch("/api/admin/subscriptions")
      ]);
      
      const plansData = await plansRes.json();
      const subsData = await subsRes.json();

      if (plansData.success) setPlans(plansData.plans);
      if (subsData.success) setSubscriptions(subsData.subscriptions);
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
      fetchData();
    }
  }, [user, router, fetchData]);

  const handleCreatePlan = async (e) => {
    e.preventDefault();
    try {
      const formattedFeatures = newPlan.features.split("\n").filter(f => f.trim() !== "");
      const payload = { ...newPlan, features: formattedFeatures };
      
      const res = await fetch("/api/admin/subscriptions/plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      
      if (data.success) {
        setPlans([...plans, data.plan]);
        setShowAddPlan(false);
        setNewPlan({ name: "", description: "", price: 0, billingCycle: "monthly", features: "", limits: { maxDoctors: 0, maxPatients: 0, maxStaff: 0 } });
      } else {
        alert(data.message);
      }
    } catch (err) {
      alert("Error creating plan");
    }
  };

  if (user?.role !== "admin") return null;

  return (
    <div className="space-y-6 pb-10 max-w-[1400px] mx-auto" style={{ fontFamily: "'Poppins', sans-serif" }}>
      
      {/* Create Plan Modal */}
      {showAddPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-xl font-black text-slate-900">Create Subscription Plan</h3>
              <button onClick={() => setShowAddPlan(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>
            
            <form onSubmit={handleCreatePlan} className="p-6 overflow-y-auto space-y-5">
              <div className="grid grid-cols-2 gap-5">
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Plan Name</label>
                  <input type="text" required value={newPlan.name} onChange={e => setNewPlan({...newPlan, name: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none" placeholder="e.g. Professional Plan" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Description</label>
                  <input type="text" value={newPlan.description} onChange={e => setNewPlan({...newPlan, description: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none" placeholder="Short description of the plan" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Price (INR)</label>
                  <input type="number" required min="0" value={newPlan.price} onChange={e => setNewPlan({...newPlan, price: e.target.value === "" ? "" : Number(e.target.value)})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" placeholder="e.g. 500" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Billing Cycle</label>
                  <select value={newPlan.billingCycle} onChange={e => setNewPlan({...newPlan, billingCycle: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none">
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <h4 className="text-sm font-bold text-slate-800 mb-4">Plan Limits</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Max Doctors</label>
                    <input type="number" min="0" value={newPlan.limits.maxDoctors} onChange={e => setNewPlan({...newPlan, limits: {...newPlan.limits, maxDoctors: e.target.value === "" ? "" : Number(e.target.value)}})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" placeholder="0 = Unlimited" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Max Patients</label>
                    <input type="number" min="0" value={newPlan.limits.maxPatients} onChange={e => setNewPlan({...newPlan, limits: {...newPlan.limits, maxPatients: e.target.value === "" ? "" : Number(e.target.value)}})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" placeholder="0 = Unlimited" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Max Staff</label>
                    <input type="number" min="0" value={newPlan.limits.maxStaff} onChange={e => setNewPlan({...newPlan, limits: {...newPlan.limits, maxStaff: e.target.value === "" ? "" : Number(e.target.value)}})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" placeholder="0 = Unlimited" />
                  </div>
                </div>
                <p className="text-[10px] text-slate-400 mt-2 font-medium">* Set to 0 for unlimited</p>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Features (One per line)</label>
                <textarea rows="4" value={newPlan.features} onChange={e => setNewPlan({...newPlan, features: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none resize-none" placeholder="Basic Reporting&#10;Email Support&#10;Patient Portal"></textarea>
              </div>

              <div className="pt-4 border-t border-slate-100 flex gap-3">
                <button type="button" onClick={() => setShowAddPlan(false)} className="flex-1 py-3 rounded-xl bg-slate-100 text-slate-700 font-bold text-sm hover:bg-slate-200 transition-colors">Cancel</button>
                <button type="submit" className="flex-1 py-3 rounded-xl bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 transition-colors shadow-sm">Create Plan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <CreditCard className="text-blue-600" />
            Subscriptions
          </h1>
          <p className="text-xs text-slate-400 font-medium mt-1">Manage clinic billing and subscription plans</p>
        </div>
        
        <div className="flex gap-2">
          <button 
            onClick={() => setActiveTab("plans")} 
            className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${activeTab === 'plans' ? 'bg-slate-900 text-white shadow-md' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}
          >
            Subscription Plans
          </button>
          <button 
            onClick={() => setActiveTab("subscribers")} 
            className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${activeTab === 'subscribers' ? 'bg-slate-900 text-white shadow-md' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}
          >
            Active Subscribers
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-20 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>
      ) : (
        <div className="mt-8">
          {activeTab === "plans" && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-black text-slate-800">Available Plans</h2>
                <Button onClick={() => setShowAddPlan(true)} className="rounded-xl px-4 bg-gradient-to-r from-blue-600 to-blue-500 border-none shadow-md flex items-center gap-2">
                  <Plus size={16} /> Add New Plan
                </Button>
              </div>

              {plans.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-16 text-center">
                  <Sparkles size={40} className="text-slate-300 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-slate-700">No Plans Created</h3>
                  <p className="text-sm text-slate-500 mt-2 max-w-sm mx-auto">Create your first subscription plan to start offering it to clinics.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {plans.map(plan => (
                    <div key={plan._id} className="bg-white rounded-3xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 relative flex flex-col h-full">
                      
                      {/* Decorative Header */}
                      <div className="h-2 w-full bg-gradient-to-r from-blue-500 to-indigo-600"></div>

                      <div className="p-8 border-b border-slate-50 bg-white">
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="text-2xl font-black text-slate-900">{plan.name}</h3>
                          <span className="px-3 py-1 bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-wider rounded-full border border-blue-100">
                            {plan.billingCycle === 'monthly' ? 'Monthly' : 'Annual'}
                          </span>
                        </div>
                        <p className="text-sm text-slate-500 font-medium h-10 line-clamp-2">{plan.description || "No description provided."}</p>
                        
                        <div className="mt-6 flex items-end gap-1">
                          <span className="text-5xl font-black text-slate-900 tracking-tight">₹{plan.price}</span>
                          <span className="text-sm font-bold text-slate-400 mb-2">/{plan.billingCycle === 'monthly' ? 'mo' : 'yr'}</span>
                        </div>
                      </div>

                      <div className="p-8 bg-slate-50/50 flex-1 flex flex-col">
                        
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Plan Limits</h4>
                        <div className="grid grid-cols-3 gap-3 mb-8">
                          <div className="bg-white p-3 rounded-2xl border border-slate-100 text-center shadow-sm">
                            <div className="text-blue-500 mb-1 flex justify-center"><Users size={18} /></div>
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Doctors</div>
                            <div className="font-black text-slate-800 text-sm mt-1">{plan.limits?.maxDoctors || '∞'}</div>
                          </div>
                          <div className="bg-white p-3 rounded-2xl border border-slate-100 text-center shadow-sm">
                            <div className="text-emerald-500 mb-1 flex justify-center"><Activity size={18} /></div>
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Patients</div>
                            <div className="font-black text-slate-800 text-sm mt-1">{plan.limits?.maxPatients || '∞'}</div>
                          </div>
                          <div className="bg-white p-3 rounded-2xl border border-slate-100 text-center shadow-sm">
                            <div className="text-amber-500 mb-1 flex justify-center"><User size={18} /></div>
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Staff</div>
                            <div className="font-black text-slate-800 text-sm mt-1">{plan.limits?.maxStaff || '∞'}</div>
                          </div>
                        </div>

                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Features</h4>
                        <ul className="space-y-3 flex-1">
                          {plan.features?.length > 0 ? plan.features.map((feature, idx) => (
                            <li key={idx} className="flex items-start gap-3">
                              <div className="mt-0.5 w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0">
                                <Check size={12} strokeWidth={3} />
                              </div>
                              <span className="text-sm font-medium text-slate-700">{feature}</span>
                            </li>
                          )) : (
                            <li className="text-sm font-medium text-slate-400 italic">No specific features listed.</li>
                          )}
                        </ul>
                        
                        <div className="mt-8 pt-6 border-t border-slate-200/60">
                          <button className="w-full py-3 px-4 bg-white border-2 border-slate-200 text-slate-700 font-bold rounded-xl hover:border-blue-600 hover:text-blue-600 transition-colors shadow-sm">
                            Edit Plan
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "subscribers" && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-black text-slate-800">Clinic Subscriptions</h2>
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input type="text" placeholder="Search clinics..." className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none w-64 shadow-sm" />
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
                <table className="w-full text-left text-sm text-slate-600">
                  <thead className="bg-slate-50 text-xs font-bold text-slate-500 uppercase border-b border-slate-100">
                    <tr>
                      <th className="px-6 py-4">Clinic</th>
                      <th className="px-6 py-4">Plan</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Cycle End</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {subscriptions.length > 0 ? subscriptions.map(sub => (
                      <tr key={sub._id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-bold text-slate-900">{sub.clinicId?.name || 'Unknown Clinic'}</div>
                          <div className="text-xs text-slate-500">{sub.clinicId?.email}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-bold text-blue-600">{sub.planId?.name || 'Unknown Plan'}</div>
                          <div className="text-xs font-medium text-slate-500">₹{sub.planId?.price}/{sub.planId?.billingCycle === 'monthly' ? 'mo' : 'yr'}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            sub.status === 'active' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 
                            sub.status === 'past_due' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                            'bg-red-50 text-red-500 border border-red-100'
                          }`}>
                            {sub.status.replace("_", " ")}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-medium text-slate-700">
                          {sub.currentPeriodEnd ? new Date(sub.currentPeriodEnd).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Link href={`/dashboard/admin/clinics/${sub.clinicId?._id}`} className="text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors">
                            View Clinic
                          </Link>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan="5" className="px-6 py-16 text-center">
                          <Calendar size={32} className="mx-auto text-slate-300 mb-3" />
                          <h3 className="text-base font-bold text-slate-700">No Active Subscriptions</h3>
                          <p className="text-sm text-slate-500 mt-1">There are currently no clinics with active subscriptions.</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

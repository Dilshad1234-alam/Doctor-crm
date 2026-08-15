"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Search, MapPin, Star, Building2, Stethoscope, Clock, Filter, DollarSign, ChevronRight, ChevronLeft } from "lucide-react";

export default function ClinicsPage() {
  const [clinics, setClinics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 5;
  const [area, setArea] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  
  // Filters
  const [specialty, setSpecialty] = useState("");
  const [openNow, setOpenNow] = useState(false);
  const [feeRange, setFeeRange] = useState("");

  const fetchClinics = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      if (area) query.append("area", area);
      if (city) query.append("city", city);
      if (state) query.append("state", state);
      if (specialty) query.append("specialty", specialty);
      if (openNow) query.append("openNow", "true");
      if (feeRange) query.append("maxFee", feeRange);

      const res = await fetch(`/api/public/clinics?${query.toString()}`);
      const result = await res.json();
      if (result.success) {
        setClinics(result.data);
      }
    } catch (err) {
      console.error("Failed to fetch clinics", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClinics();
    setCurrentPage(1);
  }, [specialty, openNow, feeRange]);

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchClinics();
  };

  // Pagination logic
  const totalPages = Math.ceil(clinics.length / ITEMS_PER_PAGE);
  const paginatedClinics = clinics.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="bg-[#F8FAFC] min-h-screen pt-12 pb-24">
      <div className="max-w-[1600px] mx-auto px-6">
        
        {/* Header */}
        <div className="mb-8">
          <div className="text-sm text-[#64748B] mb-2 font-medium">
            <Link href="/" className="hover:text-[#10B981]">Home</Link> <ChevronRight className="w-4 h-4 inline-block" /> <span className="text-[#0F172A]">Clinics</span>
          </div>
          <h1 className="text-3xl font-black text-[#0F172A]">Clinics in your area</h1>
        </div>

        {/* Top Search */}
        <form onSubmit={handleSearch} className="mb-8 bg-[#FFFFFF] p-3 rounded-2xl shadow-sm border border-[#E2E8F0] flex flex-col md:flex-row gap-2 max-w-4xl">
          <div className="flex-1 w-full border-b md:border-b-0 md:border-r border-[#E2E8F0] flex items-center pr-2">
            <div className="pl-3 text-[#64748B]">
              <MapPin className="w-5 h-5" />
            </div>
            <input 
              type="text" 
              placeholder="State" 
              className="w-full px-3 py-3 bg-transparent border-none focus:ring-0 text-[#0F172A] placeholder-[#64748B]"
              value={state}
              onChange={(e) => setState(e.target.value)}
            />
          </div>
          <div className="flex-1 w-full border-b md:border-b-0 md:border-r border-[#E2E8F0] flex items-center pr-2">
            <input 
              type="text" 
              placeholder="City" 
              className="w-full px-4 py-3 bg-transparent border-none focus:ring-0 text-[#0F172A] placeholder-[#64748B]"
              value={city}
              onChange={(e) => setCity(e.target.value)}
            />
          </div>
          <div className="flex-1 w-full flex items-center pr-2">
            <input 
              type="text" 
              placeholder="Area / Speciality" 
              className="w-full px-4 py-3 bg-transparent border-none focus:ring-0 text-[#0F172A] placeholder-[#64748B]"
              value={area}
              onChange={(e) => setArea(e.target.value)}
            />
          </div>
          <button type="submit" className="w-full md:w-auto px-8 py-3.5 rounded-xl bg-[#10B981] text-[#FFFFFF] font-bold shadow-sm hover:bg-[#047857] transition-all whitespace-nowrap">
            Search
          </button>
        </form>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Sidebar Filters */}
          <div className="lg:col-span-1">
            <div className="bg-[#FFFFFF] rounded-2xl p-6 border border-[#E2E8F0] shadow-sm sticky top-28">
              <div className="flex items-center gap-2 mb-6 pb-4 border-b border-[#E2E8F0]">
                <Filter className="w-5 h-5 text-[#0F172A]" />
                <h3 className="font-bold text-[#0F172A] text-lg">Filters</h3>
              </div>

              {/* Specialty */}
              <div className="mb-6">
                <label className="block text-sm font-bold text-[#0F172A] mb-3">Specialty</label>
                <div className="space-y-3">
                  {["General Physician", "Dentist", "Pediatrician", "Dermatologist", "Orthopedic"].map((s) => (
                    <label key={s} className="flex items-center gap-3 cursor-pointer">
                      <input 
                        type="radio" 
                        name="specialty" 
                        value={s} 
                        checked={specialty === s} 
                        onChange={(e) => setSpecialty(e.target.value)}
                        className="w-4 h-4 text-[#10B981] focus:ring-[#10B981] border-gray-300"
                      />
                      <span className="text-sm text-[#475569]">{s}</span>
                    </label>
                  ))}
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input 
                      type="radio" 
                      name="specialty" 
                      value="" 
                      checked={specialty === ""} 
                      onChange={(e) => setSpecialty(e.target.value)}
                      className="w-4 h-4 text-[#10B981] focus:ring-[#10B981] border-gray-300"
                    />
                    <span className="text-sm text-[#475569]">Any Specialty</span>
                  </label>
                </div>
              </div>

              {/* Fee Range */}
              <div className="mb-6">
                <label className="block text-sm font-bold text-[#0F172A] mb-3">Consultation Fee</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B] w-4 h-4" />
                  <select 
                    value={feeRange} 
                    onChange={(e) => setFeeRange(e.target.value)}
                    className="w-full bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A] text-sm rounded-xl focus:ring-[#10B981] focus:border-[#10B981] block p-3 pl-9"
                  >
                    <option value="">Any Fee</option>
                    <option value="500">Up to ₹500</option>
                    <option value="1000">Up to ₹1000</option>
                    <option value="2000">Up to ₹2000</option>
                  </select>
                </div>
              </div>

              {/* Open Now */}
              <div className="flex items-center justify-between mb-8">
                <div>
                  <label className="text-sm font-bold text-[#0F172A]">Open Now</label>
                  <p className="text-xs text-[#64748B]">Show open clinics only</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" checked={openNow} onChange={(e) => setOpenNow(e.target.checked)} className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#10B981]"></div>
                </label>
              </div>

              {/* Reset Button */}
              <button 
                onClick={() => { setSpecialty(""); setFeeRange(""); setOpenNow(false); }}
                className="w-full py-2.5 text-sm font-bold text-[#64748B] bg-[#F1F5F9] rounded-xl hover:bg-[#E2E8F0] transition-colors"
              >
                Reset Filters
              </button>
            </div>
          </div>

          {/* Results List */}
          <div className="lg:col-span-3">
            {loading ? (
              <div className="space-y-6 animate-pulse">
                {[1, 2, 3].map(i => (
                  <div key={i} className="bg-white rounded-2xl h-48 border border-[#E2E8F0]"></div>
                ))}
              </div>
            ) : clinics.length > 0 ? (
              <div className="space-y-6">
                {paginatedClinics.map(clinic => (
                  <div key={clinic._id} className="bg-[#FFFFFF] rounded-2xl shadow-sm hover:shadow-md transition-shadow border border-[#E2E8F0] overflow-hidden flex flex-col sm:flex-row">
                    {/* Clinic Image */}
                    <div className="sm:w-64 h-48 sm:h-auto bg-[#F8FAFC] relative">
                      {(clinic.logoUrl || clinic.logo) ? (
                        <img src={clinic.logoUrl || clinic.logo} alt={clinic.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[#2563EB]">
                          <Building2 className="w-16 h-16 opacity-30" />
                        </div>
                      )}
                      <div className="absolute top-3 left-3 bg-[#FFFFFF] px-2 py-1 rounded-md text-xs font-bold text-[#10B981] flex items-center shadow-sm">
                        Open Now
                      </div>
                    </div>
                    
                    {/* Clinic Details */}
                    <div className="p-6 flex-1 flex flex-col">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-xl font-bold text-[#0F172A]">{clinic.name}</h3>
                        <div className="flex items-center gap-1 bg-[#F8FAFC] px-2 py-1 rounded text-sm font-bold text-[#F59E0B] border border-[#E2E8F0]">
                          <Star className="w-4 h-4 fill-[#F59E0B]" /> 4.8
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-1.5 text-[#64748B] text-sm mb-4">
                        <MapPin className="w-4 h-4 shrink-0 mt-0.5" />
                        <span>
                          {clinic.address?.line1} {clinic.address?.area ? `, ${clinic.address?.area}` : ''}, {clinic.address?.city}
                        </span>
                      </div>

                      {clinic.specialties && clinic.specialties.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {clinic.specialties.slice(0, 3).map((spec, idx) => (
                            <span key={idx} className="bg-[#EFF6FF] text-[#2563EB] px-2 py-1 rounded text-xs font-medium">
                              {spec}
                            </span>
                          ))}
                          {clinic.specialties.length > 3 && (
                            <span className="bg-[#F8FAFC] text-[#64748B] px-2 py-1 rounded text-xs font-medium">
                              +{clinic.specialties.length - 3} more
                            </span>
                          )}
                        </div>
                      )}

                      <div className="mt-auto pt-4 border-t border-[#E2E8F0] flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-6">
                          <div>
                            <p className="text-[10px] text-[#64748B] uppercase tracking-wider font-semibold">Doctors</p>
                            <p className="font-bold text-[#0F172A] text-sm">{clinic.doctorsCount || 0} Available</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-[#64748B] uppercase tracking-wider font-semibold">Starting Fee</p>
                            <p className="font-bold text-[#0F172A] text-sm">₹500</p>
                          </div>
                        </div>
                        <Link href={`/clinics/${clinic.slug || clinic._id}`} className="w-full sm:w-auto text-center px-6 py-2.5 rounded-xl bg-[#10B981] text-[#FFFFFF] font-bold shadow-sm hover:bg-[#047857] transition-all">
                          View Clinic
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 pt-8">
                    <button 
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="w-10 h-10 flex items-center justify-center rounded-lg border border-[#E2E8F0] text-[#64748B] hover:bg-[#F8FAFC] disabled:opacity-50"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                      <button 
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`w-10 h-10 flex items-center justify-center rounded-lg font-medium ${
                          currentPage === page 
                            ? "bg-[#10B981] text-[#FFFFFF] font-bold" 
                            : "border border-[#E2E8F0] text-[#64748B] hover:bg-[#F8FAFC]"
                        }`}
                      >
                        {page}
                      </button>
                    ))}

                    <button 
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="w-10 h-10 flex items-center justify-center rounded-lg border border-[#E2E8F0] text-[#64748B] hover:bg-[#F8FAFC] disabled:opacity-50"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-20 bg-[#FFFFFF] rounded-2xl border border-[#E2E8F0]">
                <Building2 className="w-12 h-12 text-[#94A3B8] mx-auto mb-4" />
                <h3 className="text-xl font-bold text-[#0F172A] mb-2">No clinics found</h3>
                <p className="text-[#64748B]">Try adjusting your search filters to find what you're looking for.</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

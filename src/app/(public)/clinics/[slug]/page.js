"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/frontend/context/AuthContext";
import { 
  MapPin, Star, Building2, Phone, Clock, Share2, Calendar, 
  Users, Award, ShieldCheck, Stethoscope, Video, Pill, FileText, 
  Car, Accessibility, Wind, UserCircle
} from "lucide-react";

const getFacilityIcon = (facility) => {
  const f = facility.toLowerCase();
  if (f.includes('digital') || f.includes('video') || f.includes('online')) return <Video className="w-5 h-5 text-[#10B981]" />;
  if (f.includes('pharmacy') || f.includes('medicine')) return <Pill className="w-5 h-5 text-[#10B981]" />;
  if (f.includes('pathology') || f.includes('lab')) return <FileText className="w-5 h-5 text-[#10B981]" />;
  if (f.includes('parking')) return <Car className="w-5 h-5 text-[#10B981]" />;
  if (f.includes('wheelchair') || f.includes('access')) return <Accessibility className="w-5 h-5 text-[#10B981]" />;
  if (f.includes('ac') || f.includes('waiting') || f.includes('air')) return <Wind className="w-5 h-5 text-[#10B981]" />;
  return <ShieldCheck className="w-5 h-5 text-[#10B981]" />;
};

export default function ClinicDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const { user } = useAuth();
  const slugOrId = params.slug || params.id;

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await fetch(`/api/public/clinics/${slugOrId}`);
        const result = await res.json();
        if (result.success) {
          setData(result.data);
        }
      } catch (err) {
        console.error("Failed to fetch clinic details", err);
      } finally {
        setLoading(false);
      }
    };
    if (slugOrId) {
      fetchDetail();
    }
  }, [slugOrId]);

  if (loading) {
    return (
      <div className="bg-[#F8FAFC] min-h-screen pt-12 pb-24 flex justify-center">
        <div className="animate-pulse w-full max-w-[1200px] space-y-6 px-6">
          <div className="h-[400px] bg-white rounded-3xl border border-[#E2E8F0]"></div>
          <div className="h-32 bg-white rounded-2xl border border-[#E2E8F0]"></div>
          <div className="h-64 bg-white rounded-2xl border border-[#E2E8F0]"></div>
        </div>
      </div>
    );
  }

  if (!data || !data.clinic) {
    return (
      <div className="bg-[#F8FAFC] min-h-screen flex flex-col items-center justify-center">
        <Building2 className="w-16 h-16 text-[#94A3B8] mb-4" />
        <h2 className="text-2xl font-bold text-[#0F172A] mb-2">Clinic Not Found</h2>
        <p className="text-[#64748B] mb-6">The clinic you are looking for does not exist or is no longer public.</p>
        <button onClick={() => router.push('/clinics')} className="px-6 py-2.5 rounded-xl bg-[#10B981] text-white font-bold">Back to Clinics</button>
      </div>
    );
  }

  const { clinic, settings, doctors = [] } = data;

  const handleViewSlots = (doctor) => {
    router.push(`/doctors/${doctor._id}/slots`);
  };

  return (
    <div className="bg-[#F8FAFC] min-h-screen pb-24">
      {/* Hero Cover */}
      <div className="h-[300px] lg:h-[400px] relative bg-gradient-to-r from-[#047857] to-[#10B981]">
        {(clinic.coverImageUrl || clinic.coverImage) && (
          <img src={clinic.coverImageUrl || clinic.coverImage} alt="Cover" className="absolute inset-0 w-full h-full object-cover opacity-60" />
        )}
      </div>

      <div className="max-w-[1200px] mx-auto px-6 relative z-10 -mt-24">
        {/* Header Profile */}
        <div className="bg-[#FFFFFF] rounded-3xl shadow-lg border border-[#E2E8F0] p-6 md:p-8 mb-8">
          <div className="flex flex-col lg:flex-row gap-8 items-start lg:items-center">
            
            <div className="-mt-[104px] md:-mt-28 -ml-6 md:-ml-8 shrink-0 relative lg:self-start">
              <div className="relative z-10 w-40 h-40 rounded-full shadow-xl bg-white border-4 border-[#FFFFFF] flex items-center justify-center overflow-hidden">
                {(clinic.logoUrl || clinic.logo) ? (
                  <img src={clinic.logoUrl || clinic.logo} alt={clinic.name} className="w-full h-full object-cover" />
                ) : (
                  <Building2 className="w-20 h-20 text-[#2563EB] opacity-20" />
                )}
              </div>
            </div>
            
            <div className="flex-1 w-full">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-3xl lg:text-4xl font-black text-[#0F172A]">{clinic.name}</h1>
                    <div className="bg-[#F8FAFC] px-2 py-1 rounded text-sm font-bold text-[#F59E0B] border border-[#E2E8F0] flex items-center gap-1">
                      <Star className="w-4 h-4 fill-[#F59E0B]" /> 4.9
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-4 text-sm text-[#64748B]">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 shrink-0 text-[#10B981]" />
                      <span>{clinic.address?.line1} {clinic.address?.area ? `, ${clinic.address?.area}` : ''}, {clinic.address?.city}, {clinic.address?.state}</span>
                    </div>
                    {clinic.phone && (
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-4 h-4 shrink-0 text-[#10B981]" />
                        <span>{clinic.phone}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4 shrink-0 text-[#10B981]" />
                      <span className="text-[#10B981] font-bold">Open Today</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full lg:w-auto">
                  <button className="flex items-center justify-center w-12 h-12 rounded-xl border border-[#E2E8F0] text-[#64748B] hover:bg-[#F8FAFC] transition-colors shrink-0">
                    <Share2 className="w-5 h-5" />
                  </button>
                  <button onClick={() => {
                    if (typeof window !== "undefined") {
                      localStorage.setItem("selectedClinicId", clinic._id);
                    }
                    if (!user) {
                      router.push("/login");
                    } else if (user.accountType === "patient") {
                      router.push("/patient/dashboard");
                    } else {
                      // If admin/doctor/clinic, maybe just scroll down or alert
                      window.scrollTo({top: 800, behavior: 'smooth'});
                    }
                  }} className="flex-1 lg:flex-none px-8 py-3.5 rounded-xl bg-[#10B981] text-white font-bold shadow-md hover:bg-[#047857] transition-all">
                    Book Appointment
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-[#FFFFFF] rounded-2xl p-6 border border-[#E2E8F0] shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[#ECFDF5] text-[#10B981] flex items-center justify-center shrink-0">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-black text-[#0F172A]">{doctors.length}</p>
              <p className="text-sm font-medium text-[#64748B]">Expert Doctors</p>
            </div>
          </div>
          <div className="bg-[#FFFFFF] rounded-2xl p-6 border border-[#E2E8F0] shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center shrink-0">
              <Stethoscope className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-black text-[#0F172A]">{clinic.specialties?.length || 0}</p>
              <p className="text-sm font-medium text-[#64748B]">Specialties</p>
            </div>
          </div>
          <div className="bg-[#FFFFFF] rounded-2xl p-6 border border-[#E2E8F0] shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[#FEF3C7] text-[#F59E0B] flex items-center justify-center shrink-0">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-black text-[#0F172A]">15+</p>
              <p className="text-sm font-medium text-[#64748B]">Years Exp.</p>
            </div>
          </div>
          <div className="bg-[#FFFFFF] rounded-2xl p-6 border border-[#E2E8F0] shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[#F3E8FF] text-[#9333EA] flex items-center justify-center shrink-0">
              <Star className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-black text-[#0F172A]">4.9</p>
              <p className="text-sm font-medium text-[#64748B]">Patient Rating</p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-2 space-y-8">
            {/* About Section */}
            {clinic.about && (
              <div className="bg-[#FFFFFF] rounded-2xl p-8 border border-[#E2E8F0] shadow-sm">
                <h3 className="text-xl font-bold text-[#0F172A] mb-4">About Clinic</h3>
                <p className="text-[#475569] leading-relaxed text-lg">{clinic.about}</p>
              </div>
            )}

            {/* Facilities Section */}
            {clinic.facilities && clinic.facilities.length > 0 && (
              <div className="bg-[#FFFFFF] rounded-2xl p-8 border border-[#E2E8F0] shadow-sm">
                <h3 className="text-xl font-bold text-[#0F172A] mb-6">Clinic Facilities</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                  {clinic.facilities.map((fac, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-center shrink-0">
                        {getFacilityIcon(fac)}
                      </div>
                      <span className="font-medium text-[#0F172A] text-sm">{fac}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Doctors Section */}
            <div id="doctors">
              <h2 className="text-2xl font-bold text-[#0F172A] mb-6">Available Doctors</h2>
              {doctors.length === 0 ? (
                <div className="bg-[#FFFFFF] rounded-2xl p-8 border border-[#E2E8F0] shadow-sm text-center">
                  <p className="text-[#64748B] font-medium">Doctor listing will be connected in the next step.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {doctors.map((doctor) => (
                    <div key={doctor._id} className="bg-[#FFFFFF] rounded-2xl p-6 border border-[#E2E8F0] shadow-sm flex flex-col md:flex-row md:items-center gap-6">
                      {/* Doctor Photo */}
                      <div className="w-24 h-24 rounded-2xl overflow-hidden shrink-0 bg-[#F8FAFC]">
                        <div className="w-full h-full flex items-center justify-center">
                          {(doctor.profileImageUrl || doctor.profileImage) ? (
                            <img src={doctor.profileImageUrl || doctor.profileImage} alt={doctor.user?.name} className="w-full h-full object-cover" />
                          ) : (
                            <UserCircle className="w-16 h-16 text-[#2563EB] opacity-30" />
                          )}
                        </div>
                      </div>
                      
                      {/* Details */}
                      <div className="flex-1">
                        <h4 className="text-lg font-bold text-[#0F172A] mb-1">{doctor.user?.name || "Doctor"}</h4>
                        <p className="text-[#10B981] font-bold text-sm mb-2">{doctor.specialization}</p>
                        <p className="text-xs font-medium text-[#64748B] mb-4">
                          {doctor.qualification?.join(", ")} • {doctor.experienceYears} Years Experience
                        </p>
                        <div className="flex items-center gap-4">
                          <div>
                            <p className="text-[10px] text-[#64748B] uppercase tracking-wider font-bold">Consultation Fee</p>
                            <p className="font-black text-[#0F172A]">₹{doctor.consultationFee}</p>
                          </div>
                          <div className="w-px h-8 bg-[#E2E8F0]"></div>
                          <div>
                            <p className="text-[10px] text-[#64748B] uppercase tracking-wider font-bold">Next Available</p>
                            <p className="font-bold text-[#2563EB] text-sm flex items-center gap-1">
                              Today <Clock className="w-3 h-3" />
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      {/* Actions */}
                      <div className="w-full md:w-auto flex flex-col gap-2 shrink-0">
                        <button onClick={() => handleViewSlots(doctor)} className="px-6 py-3 rounded-xl bg-[#10B981] text-white font-bold shadow-sm hover:bg-[#047857] transition-all text-center">
                          View Slots
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Sidebar - Timings */}
          <div className="lg:col-span-1">
            <div className="bg-[#FFFFFF] rounded-2xl p-6 border border-[#E2E8F0] shadow-sm sticky top-28">
              <h3 className="text-lg font-bold text-[#0F172A] mb-6 flex items-center gap-2">
                <Clock className="w-5 h-5 text-[#10B981]" /> Clinic Timings
              </h3>
              {settings?.workingHours && settings.workingHours.length > 0 ? (
                <div className="space-y-4">
                  {settings.workingHours.map((wh, idx) => (
                    <div key={idx} className="flex justify-between items-center text-sm border-b border-[#F8FAFC] pb-3 last:border-0 last:pb-0">
                      <span className="capitalize font-bold text-[#64748B]">{wh.day}</span>
                      {wh.isOpen ? (
                        <span className="font-black text-[#0F172A]">{wh.openTime} - {wh.closeTime}</span>
                      ) : (
                        <span className="font-bold text-[#EF4444] text-xs px-2 py-1 bg-[#FEF2F2] rounded">Closed</span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-[#64748B]">Timings not available.</p>
              )}
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}

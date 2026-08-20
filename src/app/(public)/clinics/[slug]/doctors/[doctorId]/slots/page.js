"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Calendar as CalendarIcon, Clock, User,
  ChevronLeft, ShieldCheck, AlertCircle, CheckCircle2
} from "lucide-react";

export default function ClinicDoctorSlotsPage() {
  const params = useParams();
  const router = useRouter();

  const [doctor, setDoctor] = useState(null);
  const [clinic, setClinic] = useState(null);
  const [loadingDoctor, setLoadingDoctor] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [slots, setSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);

  // Generate 7-day dates
  const dates = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    dates.push(d);
  }

  // Fetch doctor info from public clinic API
  useEffect(() => {
    const fetchDoctorInfo = async () => {
      setLoadingDoctor(true);
      try {
        const res = await fetch(`/api/public/clinics/${params.slug}`);
        const result = await res.json();
        if (result.success && result.data) {
          setClinic(result.data.clinic);
          const docMatch = result.data.doctors?.find(
            d => d._id === params.doctorId || d.id === params.doctorId
          );
          if (docMatch) {
            setDoctor({
              name: docMatch.user?.name || "Doctor",
              specialization: docMatch.specialization || "Specialist",
              fee: docMatch.consultationFee || 500,
              image: docMatch.profileImageUrl || docMatch.profileImage || null,
              qualification: docMatch.qualification?.join(", ") || "",
              experienceYears: docMatch.experienceYears || 0,
            });
          }
        }
      } catch (err) {
        console.error("Failed to fetch doctor info", err);
      } finally {
        setLoadingDoctor(false);
      }
    };
    if (params.slug) fetchDoctorInfo();
  }, [params.slug, params.doctorId]);

  // Fetch slots for selected date
  useEffect(() => {
    const fetchSlots = async () => {
      setSlotsLoading(true);
      setSelectedSlot(null);
      try {
        const res = await fetch(
          `/api/public/clinics/${params.slug}/doctors/${params.doctorId}/slots?date=${selectedDate}`,
          { cache: 'no-store' }
        );
        const result = await res.json();
        if (result.success) {
          setSlots(result.data.slots || []);
        } else {
          setSlots([]);
        }
      } catch (err) {
        console.error("Failed to fetch slots", err);
        setSlots([]);
      } finally {
        setSlotsLoading(false);
      }
    };
    if (params.slug && params.doctorId) fetchSlots();
  }, [params.slug, params.doctorId, selectedDate]);

  const handleConfirmBooking = () => {
    if (!selectedSlot) return;
    if (typeof window !== "undefined") {
      const pendingBooking = {
        clinicId: clinic?._id,
        clinicSlug: params.slug,
        doctorId: params.doctorId,
        appointmentDate: selectedDate,
        startTime: selectedSlot.startTime,
        endTime: selectedSlot.endTime,
        consultationFee: doctor?.fee || 500,
        doctorName: doctor?.name,
        doctorSpecialization: doctor?.specialization,
        doctorImage: doctor?.image,
      };
      localStorage.setItem("pendingBooking", JSON.stringify(pendingBooking));
    }
    router.push(`/clinics/${params.slug}`);
  };

  // Slot counts
  const availableCount = slots.filter(s => s.state === "available").length;
  const bookedCount = slots.filter(s => s.state === "booked").length;
  const pastCount = slots.filter(s => s.state === "past").length;

  return (
    <div className="bg-[#F8FAFC] min-h-screen py-10">
      <div className="max-w-[1300px] mx-auto px-4 md:px-6">

        {/* Back navigation */}
        <button
          onClick={() => router.push(`/clinics/${params.slug}`)}
          className="flex items-center gap-1.5 text-sm font-semibold text-[#64748B] hover:text-[#0F172A] mb-6 transition-colors group"
        >
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          Back to Clinic
        </button>

        <h1 className="text-2xl md:text-3xl font-black text-[#0F172A] mb-7">Select Appointment Slot</h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* LEFT: Doctor Info Card */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm sticky top-24 overflow-hidden">
              <div className="bg-gradient-to-br from-[#047857] to-[#10B981] p-6 text-white">
                <div className="w-16 h-16 rounded-2xl overflow-hidden bg-white/20 flex items-center justify-center mb-4 border-2 border-white/30">
                  {doctor?.image ? (
                    <img src={doctor.image} alt={doctor.name} className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-8 h-8 text-white" />
                  )}
                </div>
                {loadingDoctor ? (
                  <div className="space-y-2">
                    <div className="h-4 bg-white/30 rounded animate-pulse w-3/4"></div>
                    <div className="h-3 bg-white/20 rounded animate-pulse w-1/2"></div>
                  </div>
                ) : (
                  <>
                    <h3 className="font-bold text-lg leading-tight">
                      {doctor?.name ? `Dr. ${doctor.name}` : "Doctor Profile"}
                    </h3>
                    <p className="text-white/80 text-sm mt-0.5">{doctor?.specialization}</p>
                    {doctor?.qualification && (
                      <p className="text-white/60 text-xs mt-1">{doctor.qualification}</p>
                    )}
                  </>
                )}
              </div>

              {clinic?.name && (
                <div className="px-5 py-3 bg-[#F0FDF4] border-b border-[#E2E8F0]">
                  <p className="text-xs text-[#64748B] font-medium">{clinic.name}</p>
                </div>
              )}

              <div className="p-5 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-[#64748B]">Consultation Fee</span>
                  <span className="text-lg font-black text-[#0F172A]">₹{doctor?.fee || 500}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-[#64748B]">Booking</span>
                  <span className="text-xs font-bold text-[#10B981] bg-[#ECFDF5] px-2.5 py-1 rounded-full border border-[#BBF7D0]">
                    Instant Confirm
                  </span>
                </div>
                <div className="bg-[#F8FAFC] rounded-xl p-3 border border-[#E2E8F0]">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#0F172A] mb-1">
                    <ShieldCheck className="w-4 h-4 text-[#10B981]" /> Secure Booking
                  </div>
                  <p className="text-[11px] text-[#64748B] leading-relaxed">
                    Cancel up to 2 hours before with 100% refund.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* CENTER: Date Selector */}
          <div className="lg:col-span-4 space-y-5">
            <div className="bg-white rounded-2xl p-5 border border-[#E2E8F0] shadow-sm">
              <h3 className="font-bold text-[#0F172A] mb-4 flex items-center gap-2 text-sm uppercase tracking-wider text-[#64748B]">
                <CalendarIcon className="w-4 h-4 text-[#2563EB]" /> Choose a Date
              </h3>

              <div className="grid grid-cols-7 gap-1.5">
                {dates.map((d) => {
                  const dateStr = d.toISOString().split("T")[0];
                  const isSelected = selectedDate === dateStr;
                  const isToday = d.toDateString() === new Date().toDateString();
                  return (
                    <button
                      key={dateStr}
                      onClick={() => setSelectedDate(dateStr)}
                      className={`flex flex-col items-center justify-center p-2.5 rounded-xl border transition-all relative ${
                        isSelected
                          ? "bg-[#10B981] text-white border-[#10B981] shadow-md font-bold"
                          : "bg-[#F8FAFC] text-[#0F172A] border-[#E2E8F0] hover:border-[#10B981] hover:bg-[#ECFDF5]"
                      }`}
                    >
                      {isToday && !isSelected && (
                        <span className="absolute -top-1 -right-1 w-2 h-2 bg-[#2563EB] rounded-full"></span>
                      )}
                      <span className="text-[9px] uppercase font-semibold opacity-80">
                        {d.toLocaleDateString("en-US", { weekday: "short" })}
                      </span>
                      <span className="text-base font-black mt-0.5">{d.getDate()}</span>
                    </button>
                  );
                })}
              </div>

              <div className="mt-4 pt-4 border-t border-[#F1F5F9] flex items-center justify-between">
                <span className="text-xs text-[#94A3B8] font-medium">Or pick a date:</span>
                <input
                  type="date"
                  value={selectedDate}
                  min={new Date().toISOString().split("T")[0]}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="text-xs font-bold bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg px-2.5 py-1.5 text-[#0F172A] focus:border-[#10B981] focus:outline-none"
                />
              </div>
            </div>

            {/* Slot Summary */}
            {slots.length > 0 && !slotsLoading && (
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-[#ECFDF5] rounded-xl p-3 text-center border border-[#BBF7D0]">
                  <p className="text-xl font-black text-[#10B981]">{availableCount}</p>
                  <p className="text-[10px] font-bold text-[#047857] mt-0.5">Available</p>
                </div>
                <div className="bg-[#F1F5F9] rounded-xl p-3 text-center border border-[#E2E8F0]">
                  <p className="text-xl font-black text-[#64748B]">{bookedCount}</p>
                  <p className="text-[10px] font-bold text-[#94A3B8] mt-0.5">Booked</p>
                </div>
                <div className="bg-[#FFF7ED] rounded-xl p-3 text-center border border-[#FED7AA]">
                  <p className="text-xl font-black text-[#F97316]">{pastCount}</p>
                  <p className="text-[10px] font-bold text-[#EA580C] mt-0.5">Passed</p>
                </div>
              </div>
            )}

            {/* Selected slot confirm card */}
            {selectedSlot && (
              <div className="bg-gradient-to-br from-[#047857] to-[#10B981] text-white rounded-2xl p-5 shadow-lg">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider opacity-80 mb-2">
                  <CheckCircle2 className="w-4 h-4" /> Slot Selected
                </div>
                <p className="text-2xl font-black mb-0.5">
                  {selectedSlot.startTime} – {selectedSlot.endTime}
                </p>
                <p className="text-white/70 text-xs mb-4">
                  {new Date(selectedDate).toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}
                </p>
                <button
                  onClick={handleConfirmBooking}
                  className="w-full py-3 rounded-xl bg-white text-[#047857] font-black hover:bg-[#ECFDF5] transition-all text-sm shadow-md"
                >
                  Confirm & Go to Clinic
                </button>
              </div>
            )}
          </div>

          {/* RIGHT: Slot Grid */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-2xl p-5 border border-[#E2E8F0] shadow-sm min-h-[420px]">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-bold text-[#0F172A] flex items-center gap-2">
                  <Clock className="w-5 h-5 text-[#10B981]" /> Available Slots
                </h3>
                <div className="flex items-center gap-3 text-[10px] font-bold">
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#10B981] inline-block"></span> Free</span>
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#94A3B8] inline-block"></span> Booked</span>
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#F97316] inline-block"></span> Passed</span>
                </div>
              </div>

              {slotsLoading ? (
                <div className="grid grid-cols-3 gap-2">
                  {Array.from({ length: 12 }).map((_, i) => (
                    <div key={i} className="h-14 bg-[#F1F5F9] rounded-xl animate-pulse"></div>
                  ))}
                </div>
              ) : slots.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <AlertCircle className="w-10 h-10 text-[#CBD5E1] mb-3" />
                  <p className="text-sm font-bold text-[#0F172A]">Not Available</p>
                  <p className="text-xs text-[#94A3B8] mt-1.5 max-w-[200px]">
                    Doctor is not available on this day. Try another date.
                  </p>
                </div>
              ) : availableCount === 0 && slots.length > 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <AlertCircle className="w-10 h-10 text-[#FED7AA] mb-3" />
                  <p className="text-sm font-bold text-[#0F172A]">All Slots Filled</p>
                  <p className="text-xs text-[#94A3B8] mt-1.5">No open slots for this date. Please pick another day.</p>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {slots.map((slot, idx) => {
                    const isSelected = selectedSlot?.startTime === slot.startTime;
                    const isAvailable = slot.state === "available";
                    const isBooked = slot.state === "booked";
                    const isPast = slot.state === "past";

                    return (
                      <button
                        key={idx}
                        disabled={!isAvailable}
                        onClick={() => setSelectedSlot(isSelected ? null : slot)}
                        className={`py-2.5 px-4 rounded-xl text-xs font-bold border-2 transition-all flex flex-col items-center justify-center gap-0.5 ${
                          isSelected
                            ? "bg-[#10B981] text-white border-[#10B981] shadow-md scale-[1.03]"
                            : isAvailable
                            ? "bg-white text-[#0F172A] border-[#E2E8F0] hover:border-[#10B981] hover:text-[#10B981] hover:shadow-sm cursor-pointer"
                            : isBooked
                            ? "bg-[#F1F5F9] text-[#94A3B8] border-[#E2E8F0] cursor-not-allowed"
                            : isPast
                            ? "bg-[#FFF7ED] text-[#F97316] border-[#FED7AA] cursor-not-allowed"
                            : "bg-[#F8FAFC] text-[#CBD5E1] cursor-not-allowed"
                        }`}
                      >
                        <span className="tracking-wide">{slot.startTime}</span>
                        <span className="text-[9px] font-normal opacity-70 mt-0.5">
                          {isSelected ? "Selected ✓" : isAvailable ? "Free" : isBooked ? "Booked" : isPast ? "Passed" : "—"}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

"useJun 1";
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/frontend/context/AuthContext";
import { 
  Calendar as CalendarIcon, Clock, MapPin, Star, User, 
  ChevronLeft, ChevronRight, CheckCircle2, ShieldCheck, AlertCircle
} from "lucide-react";
import Link from "next/link";

export default function DoctorSlotsPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();

  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
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

  useEffect(() => {
    // Fetch doctor profile info & slots
    const fetchSlots = async () => {
      setSlotsLoading(true);
      try {
        const res = await fetch(`/api/public/doctors/${params.id}/slots?date=${selectedDate}`);
        const result = await res.json();
        if (result.success) {
          setSlots(result.data.slots || []);
        }
      } catch (err) {
        console.error("Failed to fetch slots", err);
      } finally {
        setSlotsLoading(false);
      }
    };

    if (params.id) {
      fetchSlots();
    }
  }, [params.id, selectedDate]);

  useEffect(() => {
    // Fetch basic doctor details for left panel
    const fetchDoctor = async () => {
      try {
        const res = await fetch(`/api/public/doctors/${params.id}/slots?date=${selectedDate}`);
        const result = await res.json();
        if (result.success && result.data.doctor) {
          // Doctor info metadata
          setDoctor({
            id: params.id,
            fee: result.data.doctor.fee || 500,
          });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDoctor();
  }, [params.id]);

  const handleProceedToBook = () => {
    if (!selectedSlot) return;

    const bookUrl = `/patient/book?doctorId=${params.id}&date=${selectedDate}&startTime=${selectedSlot.startTime}&endTime=${selectedSlot.endTime}`;
    
    if (!user) {
      router.push(`/login?callbackUrl=${encodeURIComponent(bookUrl)}`);
    } else {
      router.push(bookUrl);
    }
  };

  return (
    <div className="bg-[#F8FAFC] min-h-screen py-12">
      <div className="max-w-[1400px] mx-auto px-6">
        
        {/* Back navigation */}
        <button onClick={() => router.back()} className="flex items-center gap-2 text-sm font-bold text-[#64748B] hover:text-[#0F172A] mb-8 transition-colors">
          <ChevronLeft className="w-4 h-4" /> Back to Clinic
        </button>

        <h1 className="text-3xl font-black text-[#0F172A] mb-8">Select Appointment Slot</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          
          {/* LEFT: Doctor Info */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-6 border border-[#E2E8F0] shadow-sm sticky top-28 space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-[#ECFDF5] text-[#10B981] flex items-center justify-center text-xl font-black">
                  <User className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="font-bold text-[#0F172A] text-lg">Doctor Profile</h3>
                  <p className="text-xs text-[#10B981] font-bold">Verified Specialist</p>
                </div>
              </div>

              <div className="border-t border-b border-[#F1F5F9] py-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-[#64748B]">Consultation Fee</span>
                  <span className="text-lg font-black text-[#0F172A]">₹{doctor?.fee || 500}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-[#64748B]">Booking Status</span>
                  <span className="text-xs font-bold text-[#10B981] bg-[#ECFDF5] px-2.5 py-1 rounded-full">Instant Confirmation</span>
                </div>
              </div>

              <div className="bg-[#F8FAFC] p-4 rounded-xl border border-[#E2E8F0]">
                <div className="flex items-center gap-2 text-xs font-bold text-[#0F172A] mb-1">
                  <ShieldCheck className="w-4 h-4 text-[#10B981]" /> Safe & Secure Booking
                </div>
                <p className="text-[11px] text-[#64748B]">Cancel anytime up to 2 hours before your appointment with 100% refund.</p>
              </div>
            </div>
          </div>

          {/* CENTER: 7-Day Calendar Selector */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-2xl p-6 border border-[#E2E8F0] shadow-sm">
              <h3 className="font-bold text-[#0F172A] mb-4 flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-[#2563EB]" /> Select Date
              </h3>
              
              <div className="grid grid-cols-7 gap-2">
                {dates.map((d) => {
                  const dateStr = d.toISOString().split("T")[0];
                  const isSelected = selectedDate === dateStr;
                  const dayName = d.toLocaleDateString("en-US", { weekday: "short" });
                  const dayNum = d.getDate();

                  return (
                    <button
                      key={dateStr}
                      onClick={() => {
                        setSelectedDate(dateStr);
                        setSelectedSlot(null);
                      }}
                      className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${
                        isSelected 
                          ? "bg-[#10B981] text-white border-[#10B981] shadow-md font-bold"
                          : "bg-[#F8FAFC] text-[#0F172A] border-[#E2E8F0] hover:border-[#10B981]"
                      }`}
                    >
                      <span className="text-[10px] uppercase font-medium">{dayName}</span>
                      <span className="text-lg font-black">{dayNum}</span>
                    </button>
                  );
                })}
              </div>

              {/* Month date input for extended pick */}
              <div className="mt-6 pt-4 border-t border-[#F1F5F9] flex items-center justify-between">
                <span className="text-xs text-[#64748B] font-medium">Or pick another date:</span>
                <input 
                  type="date" 
                  value={selectedDate}
                  min={new Date().toISOString().split("T")[0]}
                  onChange={(e) => {
                    setSelectedDate(e.target.value);
                    setSelectedSlot(null);
                  }}
                  className="text-xs font-bold bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg px-2 py-1.5 text-[#0F172A]"
                />
              </div>
            </div>

            {/* Selected Slot Summary Card */}
            {selectedSlot && (
              <div className="bg-[#ECFDF5] border border-[#10B981]/30 rounded-2xl p-6 shadow-sm">
                <h4 className="text-sm font-bold text-[#047857] uppercase tracking-wider mb-2">Selected Time Slot</h4>
                <p className="text-2xl font-black text-[#0F172A] mb-1">{selectedSlot.startTime} - {selectedSlot.endTime}</p>
                <p className="text-xs text-[#64748B] mb-4">Date: {selectedDate}</p>

                <button 
                  onClick={handleProceedToBook}
                  className="w-full py-3.5 rounded-xl bg-[#10B981] text-white font-bold hover:bg-[#047857] shadow-md transition-all text-center flex items-center justify-center gap-2"
                >
                  Proceed to Confirmation
                </button>
              </div>
            )}
          </div>

          {/* RIGHT: Available Slots Grid */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-6 border border-[#E2E8F0] shadow-sm min-h-[400px]">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-[#0F172A] flex items-center gap-2">
                  <Clock className="w-5 h-5 text-[#10B981]" /> Available Slots
                </h3>
                
                {/* Legend */}
                <div className="flex items-center gap-3 text-[10px] font-bold">
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-[#10B981]"></span> Free</span>
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-[#94A3B8]"></span> Booked</span>
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-[#EF4444]"></span> Break</span>
                </div>
              </div>

              {slotsLoading ? (
                <div className="flex justify-center items-center py-20">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#10B981]"></div>
                </div>
              ) : slots.length === 0 ? (
                <div className="text-center py-16 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
                  <AlertCircle className="w-8 h-8 text-[#94A3B8] mx-auto mb-2" />
                  <p className="text-sm font-bold text-[#0F172A]">No Slots Available</p>
                  <p className="text-xs text-[#64748B] mt-1">Please select another date on the calendar.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {slots.map((slot, idx) => {
                    const isSelected = selectedSlot?.startTime === slot.startTime;
                    const isAvailable = slot.state === "available";
                    const isBooked = slot.state === "booked" || slot.state === "past";
                    const isBreak = slot.state === "break";

                    return (
                      <button
                        key={idx}
                        disabled={!isAvailable}
                        onClick={() => setSelectedSlot(slot)}
                        className={`py-3 px-2 rounded-xl text-xs font-bold border-2 transition-all flex flex-col items-center justify-center gap-0.5 ${
                          isSelected
                            ? "bg-[#10B981] text-white border-[#10B981] shadow-md scale-[1.02]"
                            : isAvailable
                            ? "bg-white text-[#0F172A] border-[#E2E8F0] hover:border-[#10B981] hover:text-[#10B981]"
                            : isBooked
                            ? "bg-[#F1F5F9] text-[#94A3B8] border-[#E2E8F0] cursor-not-allowed"
                            : isBreak
                            ? "bg-[#FEF2F2] text-[#EF4444] border-[#FEE2E2] cursor-not-allowed"
                            : "bg-[#F8FAFC] text-[#64748B] cursor-not-allowed"
                        }`}
                      >
                        <span>{slot.startTime}</span>
                        <span className="text-[9px] opacity-70 font-normal">
                          {isAvailable ? "Available" : isBooked ? "Booked" : isBreak ? "Break" : "Unavailable"}
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

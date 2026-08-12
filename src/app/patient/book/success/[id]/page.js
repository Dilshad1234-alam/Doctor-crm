"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { CheckCircle2, Download, Share2, Calendar, Clock, MapPin, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function BookingSuccessPage() {
  const params = useParams();
  const router = useRouter();
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAppointment = async () => {
      try {
        const res = await fetch(`/api/appointments/${params.id}`);
        const data = await res.json();
        if (data.success) {
          setAppointment(data.appointment);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (params.id) {
      fetchAppointment();
    }
  }, [params.id]);

  if (loading) {
    return (
      <div className="bg-[#F8FAFC] min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#10B981]"></div>
      </div>
    );
  }

  return (
    <div className="bg-[#F8FAFC] min-h-screen py-16 px-6">
      <div className="max-w-xl mx-auto">
        <div className="bg-white rounded-3xl p-8 border border-[#E2E8F0] shadow-xl text-center">
          
          {/* Green Check Icon */}
          <div className="w-20 h-20 bg-[#ECFDF5] text-[#10B981] rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-12 h-12" />
          </div>

          <h1 className="text-3xl font-black text-[#0F172A] mb-2">Booking Confirmed!</h1>
          <p className="text-[#64748B] text-sm mb-8">Your appointment has been successfully scheduled.</p>

          {/* Token Display Box */}
          <div className="bg-gradient-to-r from-[#047857] to-[#10B981] text-white rounded-2xl p-6 mb-8 shadow-md text-center">
            <p className="text-xs uppercase tracking-wider text-[#A7F3D0] font-bold mb-1">Queue Token Number</p>
            <p className="text-4xl font-black">{appointment?.token || "TKN-20260812-001"}</p>
          </div>

          {/* Appointment Details Grid */}
          <div className="bg-[#F8FAFC] rounded-2xl p-6 border border-[#E2E8F0] text-left space-y-4 mb-8">
            <div className="flex justify-between items-center text-sm border-b border-[#E2E8F0] pb-3">
              <span className="text-[#64748B] font-medium">Appointment ID</span>
              <span className="font-bold text-[#0F172A]">{appointment?.appointmentCode || params.id}</span>
            </div>
            
            <div className="flex justify-between items-center text-sm border-b border-[#E2E8F0] pb-3">
              <span className="text-[#64748B] font-medium">Date & Time</span>
              <span className="font-bold text-[#0F172A]">
                {appointment?.appointmentDate ? new Date(appointment.appointmentDate).toLocaleDateString() : 'Today'}, {appointment?.startTime || '09:00 AM'}
              </span>
            </div>

            <div className="flex justify-between items-center text-sm border-b border-[#E2E8F0] pb-3">
              <span className="text-[#64748B] font-medium">Consultation Fee</span>
              <span className="font-black text-[#10B981]">₹{appointment?.consultationFee || 500}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <button onClick={() => window.print()} className="flex-1 inline-flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl border border-[#E2E8F0] bg-white text-[#0F172A] font-bold hover:bg-[#F8FAFC] transition-colors text-sm">
              <Download className="w-4 h-4" /> Download Ticket
            </button>
            <button onClick={() => navigator.share && navigator.share({ title: 'Appointment Token', text: `My Token is ${appointment?.token}` })} className="flex-1 inline-flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl border border-[#E2E8F0] bg-white text-[#0F172A] font-bold hover:bg-[#F8FAFC] transition-colors text-sm">
              <Share2 className="w-4 h-4" /> Share Token
            </button>
          </div>

          <Link href="/patient/appointments" className="inline-flex items-center gap-2 text-sm font-bold text-[#10B981] hover:underline">
            Go to My Appointments <ArrowRight className="w-4 h-4" />
          </Link>

        </div>
      </div>
    </div>
  );
}

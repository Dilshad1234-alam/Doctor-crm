import Link from "next/link";
import { 
  Building2, Calendar, FileText, Users, CreditCard, 
  BarChart3, ArrowRight, CheckCircle2
} from "lucide-react";

export const metadata = {
  title: "Features | Clinora",
  description: "Powerful features for better healthcare management.",
};

export default function FeaturesPage() {
  const features = [
    {
      icon: Building2,
      title: "Smart Clinic Management",
      desc: "Manage multiple doctors, staff roles, and daily operations from a single unified dashboard.",
      color: "text-[#2563EB]",
      bg: "bg-[#EFF6FF]"
    },
    {
      icon: Calendar,
      title: "Online Appointment",
      desc: "Let patients book slots 24/7. Automatically manage queues, prevent double booking, and send reminders.",
      color: "text-[#10B981]",
      bg: "bg-[#ECFDF5]"
    },
    {
      icon: FileText,
      title: "Digital Prescriptions",
      desc: "Generate accurate, branded digital prescriptions instantly with built-in medicine databases.",
      color: "text-[#F59E0B]",
      bg: "bg-[#FFFBEB]"
    },
    {
      icon: Users,
      title: "Patient Records",
      desc: "Maintain detailed medical histories, vitals, and treatment plans securely in the cloud.",
      color: "text-[#8B5CF6]",
      bg: "bg-[#F5F3FF]"
    },
    {
      icon: CreditCard,
      title: "Billing & Invoices",
      desc: "Create GST-ready invoices, track payments, manage dues, and share receipts via SMS or Email.",
      color: "text-[#EF4444]",
      bg: "bg-[#FEF2F2]"
    },
    {
      icon: BarChart3,
      title: "Reports & Analytics",
      desc: "Gain deep insights into clinic revenue, doctor performance, and patient demographics.",
      color: "text-[#0EA5E9]",
      bg: "bg-[#F0F9FF]"
    }
  ];

  return (
    <div className="bg-[#F8FAFC] min-h-screen">
      
      {/* Header */}
      <section className="pt-24 pb-16 lg:pt-32 lg:pb-24 bg-[#FFFFFF] border-b border-[#E2E8F0]">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h1 className="text-4xl lg:text-5xl font-black text-[#0F172A] leading-tight mb-6">
            Powerful Features for <br />
            <span className="text-[#10B981]">Better Healthcare</span>
          </h1>
          <p className="text-[#64748B] text-lg lg:text-xl leading-relaxed">
            Clinora provides everything you need to run your clinic efficiently, deliver better patient care, and grow your practice.
          </p>
        </div>
      </section>

      {/* Feature Cards Grid */}
      <section className="py-24">
        <div className="max-w-[1600px] mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <div key={idx} className="bg-[#FFFFFF] rounded-2xl p-8 border border-[#E2E8F0] hover:shadow-lg transition-all group">
                  <div className={`w-14 h-14 ${feat.bg} ${feat.color} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                    <Icon className="w-7 h-7" />
                  </div>
                  <h3 className="text-xl font-bold text-[#0F172A] mb-3">{feat.title}</h3>
                  <p className="text-[#64748B] leading-relaxed mb-6">
                    {feat.desc}
                  </p>
                  <ul className="space-y-2">
                    {[1, 2, 3].map(i => (
                      <li key={i} className="flex items-center gap-2 text-sm text-[#475569]">
                        <CheckCircle2 className="w-4 h-4 text-[#10B981]" /> Core functionality included
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Product Showcase CTA */}
      <section className="py-24 bg-[#047857] relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#10B981]/20 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#10B981]/20 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2"></div>
        
        <div className="max-w-[1600px] mx-auto px-6 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="flex-1 text-center lg:text-left">
              <h2 className="text-3xl lg:text-5xl font-black text-[#FFFFFF] leading-tight mb-6">
                Transform Your Clinic Today
              </h2>
              <p className="text-[#A7F3D0] text-lg lg:text-xl mb-10 max-w-lg mx-auto lg:mx-0">
                Join thousands of modern healthcare providers who use Clinora to simplify their daily operations.
              </p>
              <Link href="/register" className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-[#FFFFFF] text-[#047857] font-bold hover:bg-[#F8FAFC] shadow-lg transition-all text-lg">
                Get Started Free <ArrowRight className="w-5 h-5" />
              </Link>
              <p className="text-[#A7F3D0] text-sm mt-4">No credit card required • Setup in 5 minutes</p>
            </div>
            
            <div className="flex-1 w-full">
              {/* Dashboard Mockup */}
              <div className="relative bg-[#FFFFFF] rounded-2xl shadow-2xl border-4 border-[#0F172A] overflow-hidden aspect-[16/10] flex flex-col transform lg:rotate-[-2deg] lg:scale-105 hover:rotate-0 transition-transform duration-500">
                <div className="h-8 bg-[#0F172A] flex items-center px-4 gap-2">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
                  </div>
                </div>
                <div className="flex-1 bg-[#F8FAFC] relative">
                  <img src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1200&auto=format&fit=crop" alt="Dashboard Dashboard Mockup" className="w-full h-full object-cover" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}

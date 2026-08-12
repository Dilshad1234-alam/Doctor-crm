import { MapPin, Phone, Mail, Clock, Send } from "lucide-react";

export const metadata = {
  title: "Contact Us | Clinora",
  description: "Get in touch with the Clinora team for any queries or support.",
};

export default function ContactPage() {
  return (
    <div className="bg-[#F8FAFC] min-h-screen pt-24 pb-24">
      <div className="max-w-[1600px] mx-auto px-6">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h1 className="text-4xl lg:text-5xl font-black text-[#0F172A] leading-tight mb-4">
            Get in <span className="text-[#10B981]">Touch</span>
          </h1>
          <p className="text-[#64748B] text-lg">
            Have questions about Clinora? Our team is here to help you.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* Left Column - Info */}
          <div className="lg:col-span-1 space-y-8">
            <div className="bg-[#FFFFFF] rounded-2xl p-8 border border-[#E2E8F0] shadow-sm">
              <h3 className="text-xl font-bold text-[#0F172A] mb-6">Contact Information</h3>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#ECFDF5] text-[#10B981] flex items-center justify-center shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#0F172A] mb-1">Phone</p>
                    <p className="text-[#64748B]">+1 (555) 123-4567</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#ECFDF5] text-[#10B981] flex items-center justify-center shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#0F172A] mb-1">Email</p>
                    <p className="text-[#64748B]">support@clinora.com</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#ECFDF5] text-[#10B981] flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#0F172A] mb-1">Address</p>
                    <p className="text-[#64748B]">123 Healthcare Blvd,<br/>Suite 400, New York, NY 10001</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#ECFDF5] text-[#10B981] flex items-center justify-center shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#0F172A] mb-1">Working Hours</p>
                    <p className="text-[#64748B]">Mon - Fri: 9:00 AM - 6:00 PM</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Form */}
          <div className="lg:col-span-2">
            <div className="bg-[#FFFFFF] rounded-2xl p-8 lg:p-10 border border-[#E2E8F0] shadow-sm">
              <h3 className="text-2xl font-bold text-[#0F172A] mb-8">Send us a Message</h3>
              
              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-[#0F172A] mb-2">Full Name</label>
                    <input 
                      type="text" 
                      placeholder="John Doe"
                      className="w-full bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A] rounded-xl focus:ring-[#10B981] focus:border-[#10B981] block p-3"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-[#0F172A] mb-2">Email Address</label>
                    <input 
                      type="email" 
                      placeholder="john@example.com"
                      className="w-full bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A] rounded-xl focus:ring-[#10B981] focus:border-[#10B981] block p-3"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-[#0F172A] mb-2">Phone Number</label>
                    <input 
                      type="tel" 
                      placeholder="+1 (555) 000-0000"
                      className="w-full bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A] rounded-xl focus:ring-[#10B981] focus:border-[#10B981] block p-3"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-[#0F172A] mb-2">Subject</label>
                    <input 
                      type="text" 
                      placeholder="How can we help?"
                      className="w-full bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A] rounded-xl focus:ring-[#10B981] focus:border-[#10B981] block p-3"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-[#0F172A] mb-2">Message</label>
                  <textarea 
                    rows="5"
                    placeholder="Write your message here..."
                    className="w-full bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A] rounded-xl focus:ring-[#10B981] focus:border-[#10B981] block p-3"
                  ></textarea>
                </div>

                <button type="button" className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-[#10B981] text-[#FFFFFF] font-bold shadow-md hover:bg-[#047857] transition-all w-full md:w-auto">
                  <Send className="w-5 h-5" /> Send Message
                </button>
              </form>
            </div>
          </div>
          
        </div>
        
        {/* Map Card */}
        <div className="mt-12 bg-[#FFFFFF] rounded-2xl border border-[#E2E8F0] shadow-sm overflow-hidden h-96 relative">
          <div className="absolute inset-0 bg-gray-200">
            {/* Map background for visual */}
            <iframe 
              src="https://maps.google.com/maps?q=New%20York,%20NY&t=&z=13&ie=UTF8&iwloc=&output=embed" 
              width="100%" 
              height="100%" 
              style={{border:0}} 
              allowFullScreen="" 
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade"
              title="Map"
            ></iframe>
          </div>
        </div>

      </div>
    </div>
  );
}

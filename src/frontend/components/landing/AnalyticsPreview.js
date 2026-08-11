import { BarChart3, LineChart, PieChart, TrendingUp } from "lucide-react";

export default function AnalyticsPreview() {
  return (
    <section className="py-24 bg-white font-sans overflow-hidden">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Understand Your Clinic Better</h2>
          <p className="text-lg text-gray-600">
            Make data-driven decisions with clear, beautiful analytics and reporting.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col items-center justify-center min-h-[250px]">
             <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4">
               <BarChart3 size={24} />
             </div>
             <h3 className="font-bold text-gray-900 mb-2">Appointments & Patients</h3>
             <p className="text-gray-500 text-center text-sm">Track daily flow and busy periods</p>
          </div>

          <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col items-center justify-center min-h-[250px] relative top-0 md:top-8">
             <div className="w-12 h-12 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center mb-4">
               <TrendingUp size={24} />
             </div>
             <h3 className="font-bold text-gray-900 mb-2">Revenue & Payments</h3>
             <p className="text-gray-500 text-center text-sm">Monitor collections and pending dues</p>
          </div>

          <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col items-center justify-center min-h-[250px]">
             <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mb-4">
               <PieChart size={24} />
             </div>
             <h3 className="font-bold text-gray-900 mb-2">Doctor Performance</h3>
             <p className="text-gray-500 text-center text-sm">Consultation times and patient volumes</p>
          </div>

        </div>
      </div>
    </section>
  );
}

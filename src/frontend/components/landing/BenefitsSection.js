import Container from "@/frontend/components/ui/Container";
import { benefits } from "@/frontend/constants/landingPage";

export default function BenefitsSection() {
  return (
    <section className="py-24 bg-white overflow-hidden">
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl mb-8">
              Spend Less Time Managing and More Time Caring
            </h2>
            <ul className="space-y-4">
              {benefits.map((benefit, index) => (
                <li key={index} className="flex items-center text-lg text-gray-700 group hover:text-gray-900 transition-colors">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-teal-100 flex items-center justify-center text-teal-600 mr-4 group-hover:bg-teal-500 group-hover:text-white transition-colors duration-300">
                    <span className="text-sm font-bold">✓</span>
                  </div>
                  {benefit}
                </li>
              ))}
            </ul>
          </div>
          <div className="relative animate-float">
            <div className="absolute -inset-2 bg-gradient-to-r from-teal-400 to-emerald-400 opacity-20 blur-xl rounded-[2rem]"></div>
            {/* Mockup visual */}
            <div className="rounded-2xl bg-white/60 backdrop-blur-lg p-6 sm:p-8 border border-gray-100 shadow-2xl relative z-10">
              <div className="flex items-center space-x-4 mb-6 pb-6 border-b border-gray-200/50">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-gray-500 font-bold text-xl shadow-inner">
                  JD
                </div>
                <div>
                  <h3 className="text-xl font-extrabold text-gray-900">John Doe</h3>
                  <p className="text-sm font-medium text-gray-500">ID: PT-88234 • Male, 34</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="p-4 bg-white/80 backdrop-blur rounded-xl border border-gray-100 shadow-sm flex items-start hover:shadow-md transition-shadow">
                  <div className="w-3 h-3 rounded-full bg-teal-500 mt-1.5 mr-3 shadow-[0_0_8px_rgba(20,184,166,0.5)]"></div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">Dr. Sharma created a prescription</p>
                    <p className="text-xs font-medium text-gray-500 mt-1">Today, 10:30 AM</p>
                  </div>
                </div>
                <div className="p-4 bg-white/80 backdrop-blur rounded-xl border border-gray-100 shadow-sm flex items-start hover:shadow-md transition-shadow">
                  <div className="w-3 h-3 rounded-full bg-blue-500 mt-1.5 mr-3 shadow-[0_0_8px_rgba(59,130,246,0.5)]"></div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">Invoice #INV-299 Paid</p>
                    <p className="text-xs font-medium text-gray-500 mt-1">Today, 10:45 AM</p>
                  </div>
                </div>
                <div className="p-4 bg-white/80 backdrop-blur rounded-xl border border-gray-100 shadow-sm flex items-start hover:shadow-md transition-shadow">
                  <div className="w-3 h-3 rounded-full bg-orange-500 mt-1.5 mr-3 shadow-[0_0_8px_rgba(249,115,22,0.5)]"></div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">Follow-up Scheduled</p>
                    <p className="text-xs font-medium text-gray-500 mt-1">Next week, Friday</p>
                  </div>
                </div>
              </div>
            </div>
            {/* Decorative blob behind mockup */}
            <div className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-1/4 w-72 h-72 bg-teal-100 rounded-full mix-blend-multiply filter blur-3xl opacity-70 z-0 hidden lg:block"></div>
          </div>
        </div>
      </Container>
    </section>
  );
}

import Container from "@/frontend/components/ui/Container";
import Button from "@/frontend/components/ui/Button";

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-white pt-16 pb-24 sm:pt-24 sm:pb-32">
      {/* Decorative background blob */}
      <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80 animate-pulse-slow" aria-hidden="true">
        <div
          className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#38bdf8] via-[#2dd4bf] to-[#34d399] opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
          style={{
            clipPath: "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
          }}
        />
      </div>

      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Left Content */}
          <div className="max-w-2xl mx-auto lg:mx-0 text-center lg:text-left">
            <span className="inline-flex items-center rounded-full bg-teal-50 px-3 py-1 text-sm font-semibold text-teal-600 ring-1 ring-inset ring-teal-600/20 mb-6">
              Built for modern clinics and doctors
            </span>
            <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-6xl">
              Manage Your Entire Clinic From One Simple Dashboard
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Doctor CRM helps clinics manage patients, appointments, doctors, prescriptions, billing and follow-ups in one secure platform. Spend less time on paperwork and more time on patient care.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
              <Button href="/register" variant="primary" className="w-full sm:w-auto px-8 py-3 text-base">
                Start Free Trial
              </Button>
              <Button href="/dashboard" variant="outline" className="w-full sm:w-auto px-8 py-3 text-base">
                View Dashboard
              </Button>
            </div>
            <div className="mt-8 flex flex-wrap gap-y-2 items-center justify-center lg:justify-start text-sm text-gray-500 gap-x-6">
              <div className="flex items-center gap-1.5"><span className="text-green-500">✓</span> No credit card required</div>
              <div className="flex items-center gap-1.5"><span className="text-green-500">✓</span> Easy clinic setup</div>
              <div className="flex items-center gap-1.5"><span className="text-green-500">✓</span> Multi-doctor support</div>
            </div>
          </div>

          {/* Right Visual (Dashboard Mockup) */}
          <div className="w-full max-w-lg mx-auto lg:max-w-none relative animate-float">
            <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-teal-400 to-emerald-400 opacity-20 blur-lg"></div>
            <div className="rounded-xl bg-white/40 backdrop-blur-xl p-2 ring-1 ring-inset ring-gray-900/10 lg:rounded-2xl lg:p-4 shadow-2xl relative">
              <div className="rounded-md bg-white shadow-2xl ring-1 ring-gray-900/5 flex flex-col overflow-hidden">
                {/* Mockup Header */}
                <div className="border-b border-gray-100 px-4 py-3 flex items-center justify-between bg-gray-50">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-400"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                    <div className="w-3 h-3 rounded-full bg-green-400"></div>
                  </div>
                  <div className="text-xs text-gray-400 font-medium font-mono">dashboard / overview</div>
                </div>
                {/* Mockup Content */}
                <div className="p-4 grid grid-cols-2 gap-4 bg-gray-50/50">
                  {/* Metric Cards */}
                  <div className="bg-white p-3 rounded shadow-sm border border-gray-100">
                    <div className="text-xs text-gray-500">Total Doctors</div>
                    <div className="text-lg font-bold text-gray-900">12</div>
                  </div>
                  <div className="bg-white p-3 rounded shadow-sm border border-gray-100">
                    <div className="text-xs text-gray-500">Total Patients</div>
                    <div className="text-lg font-bold text-gray-900">3,456</div>
                  </div>
                  <div className="bg-white p-3 rounded shadow-sm border border-gray-100">
                    <div className="text-xs text-gray-500">Today&apos;s Appointments</div>
                    <div className="text-lg font-bold text-gray-900">48</div>
                  </div>
                  <div className="bg-white p-3 rounded shadow-sm border border-gray-100">
                    <div className="text-xs text-gray-500">Today&apos;s Revenue</div>
                    <div className="text-lg font-bold text-gray-900">$2,340</div>
                  </div>
                  
                  {/* List & Chart */}
                  <div className="col-span-2 bg-white p-3 rounded shadow-sm border border-gray-100 space-y-3">
                    <div className="text-xs font-semibold text-gray-700 border-b border-gray-100 pb-2">Patient Queue</div>
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-teal-100 flex items-center justify-center text-[10px] text-teal-700 font-bold">AJ</div>
                        <span className="text-gray-700">Alice Johnson</span>
                      </div>
                      <span className="text-orange-500 bg-orange-50 px-2 py-0.5 rounded-full">Waiting</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-[10px] text-blue-700 font-bold">MS</div>
                        <span className="text-gray-700">Mark Smith</span>
                      </div>
                      <span className="text-green-500 bg-green-50 px-2 py-0.5 rounded-full">In Consult</span>
                    </div>
                  </div>

                  <div className="col-span-2 bg-white p-3 rounded shadow-sm border border-gray-100">
                    <div className="text-xs font-semibold text-gray-700 mb-2">Weekly Appointments</div>
                    <div className="flex items-end justify-between h-16 pt-2">
                      <div className="w-1/6 bg-teal-100 h-full rounded-t"></div>
                      <div className="w-1/6 bg-teal-200 h-4/5 rounded-t"></div>
                      <div className="w-1/6 bg-teal-300 h-3/5 rounded-t"></div>
                      <div className="w-1/6 bg-teal-400 h-full rounded-t"></div>
                      <div className="w-1/6 bg-teal-500 h-1/2 rounded-t"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

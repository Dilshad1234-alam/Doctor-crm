import Container from "@/frontend/components/ui/Container";
import SectionHeading from "@/frontend/components/ui/SectionHeading";

export default function MultiDoctorSection() {
  return (
    <section id="for-clinics" className="py-24 bg-teal-900 text-white">
      <Container>
        <SectionHeading
          title="Built for Single Doctors and Multi-Doctor Clinics"
          description="Scale your clinic effortlessly. Start as a solo practitioner and grow into a multi-branch hospital."
          className="text-white"
        />
        
        <div className="mt-16 max-w-4xl mx-auto">
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-6 text-teal-100 mb-12">
            <li className="flex items-start">
              <span className="text-teal-400 mr-3">✓</span> Every doctor gets a separate login
            </li>
            <li className="flex items-start">
              <span className="text-teal-400 mr-3">✓</span> Every doctor sees their own appointments
            </li>
            <li className="flex items-start">
              <span className="text-teal-400 mr-3">✓</span> Patients can be shared at clinic level
            </li>
            <li className="flex items-start">
              <span className="text-teal-400 mr-3">✓</span> Consultations remain doctor-specific
            </li>
            <li className="flex items-start">
              <span className="text-teal-400 mr-3">✓</span> Clinic owners can view combined reports
            </li>
            <li className="flex items-start">
              <span className="text-teal-400 mr-3">✓</span> Multiple branches can be supported later
            </li>
          </ul>

          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-teal-400 to-emerald-400 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative bg-teal-900/60 backdrop-blur-md rounded-2xl p-8 border border-teal-700/50 shadow-2xl">
              <div className="flex flex-col items-center space-y-4 text-center">
                <div className="px-6 py-3 bg-white text-teal-900 font-extrabold rounded-lg shadow-[0_0_15px_rgba(255,255,255,0.3)]">Clinic Owner</div>
                <div className="w-1 h-8 bg-gradient-to-b from-white to-teal-500"></div>
                
                <div className="flex gap-4 w-full justify-center">
                  <div className="w-1/3 border-t-2 border-l-2 border-teal-500/50 rounded-tl-lg h-8 mt-4"></div>
                  <div className="px-6 py-3 bg-gradient-to-r from-teal-400 to-emerald-400 text-teal-950 font-extrabold rounded-lg shadow-[0_0_20px_rgba(45,212,191,0.4)] z-10 relative">Multiple Doctors</div>
                  <div className="w-1/3 border-t-2 border-r-2 border-teal-500/50 rounded-tr-lg h-8 mt-4"></div>
                </div>
                
                <div className="w-1 h-8 bg-gradient-to-b from-teal-400 to-teal-600"></div>
                <div className="px-6 py-3 bg-teal-800/80 backdrop-blur text-teal-50 font-semibold rounded-lg border border-teal-600 shadow-inner">Shared Patients</div>
                
                <div className="w-1 h-8 bg-teal-600"></div>
                <div className="px-6 py-3 bg-teal-800/80 backdrop-blur text-teal-50 font-semibold rounded-lg border border-teal-600 shadow-inner">Doctor-wise Appointments</div>
                
                <div className="w-1 h-8 bg-teal-600"></div>
                <div className="px-6 py-3 bg-teal-800/80 backdrop-blur text-teal-50 font-semibold rounded-lg border border-teal-600 shadow-inner">Combined Clinic Reports</div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

import Container from "@/frontend/components/ui/Container";
import SectionHeading from "@/frontend/components/ui/SectionHeading";
import { roles } from "@/frontend/constants/landingPage";

export default function RolesSection() {
  return (
    <section className="py-24 bg-gray-50">
      <Container>
        <SectionHeading
          title="One Platform for Your Entire Team"
          description="Doctor CRM provides customized views and permissions for everyone in your clinic."
        />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mt-16">
          {roles.map((role) => (
            <div key={role.role} className="group bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="bg-gradient-to-r from-teal-500 to-emerald-400 px-6 py-4">
                <h3 className="text-lg font-bold text-white group-hover:scale-105 transition-transform duration-300 origin-left">{role.role}</h3>
              </div>
              <div className="p-6">
                <ul className="space-y-3 text-sm text-gray-600">
                  {role.capabilities.map((cap, i) => (
                    <li key={i} className="flex items-start">
                      <span className="text-emerald-500 mr-2 font-bold">✓</span>
                      {cap}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
        <p className="text-center text-sm text-gray-500 mt-10">
          * Patient Portal availability depends on the selected clinic plan.
        </p>
      </Container>
    </section>
  );
}

import Container from "@/frontend/components/ui/Container";
import SectionHeading from "@/frontend/components/ui/SectionHeading";
import { workflowSteps } from "@/frontend/constants/landingPage";

export default function WorkflowSection() {
  return (
    <section id="how-it-works" className="py-24 bg-white">
      <Container>
        <SectionHeading
          eyebrow="Workflow"
          title="From Appointment to Follow-up"
          description="Seamlessly guide patients through every step of their visit."
        />
        
        <div className="mt-16 relative">
          {/* Desktop horizontal line */}
          <div className="hidden lg:block absolute top-1/2 left-0 w-full h-1 bg-gradient-to-r from-teal-200 via-emerald-300 to-teal-200 -translate-y-1/2 rounded-full opacity-50"></div>
          
          {/* Mobile vertical line */}
          <div className="lg:hidden absolute top-0 left-6 w-1 h-full bg-gradient-to-b from-teal-200 via-emerald-300 to-teal-200 rounded-full opacity-50"></div>

          <div className="grid grid-cols-1 lg:grid-cols-7 gap-6 relative z-10">
            {workflowSteps.map((step, index) => (
              <div key={step.step} className="group flex flex-row lg:flex-col items-center lg:text-center relative cursor-default">
                <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-full bg-gradient-to-br from-teal-500 to-emerald-500 text-white font-bold text-lg shadow-lg shadow-teal-500/30 ring-4 ring-white z-10 group-hover:scale-110 transition-transform duration-300">
                  {step.step}
                </div>
                <div className="ml-4 lg:ml-0 lg:mt-6 bg-white p-4 lg:p-3 rounded-lg border border-gray-100 shadow-sm flex-1 lg:w-full group-hover:shadow-md group-hover:border-teal-100 transition-all duration-300">
                  <h4 className="text-sm font-semibold text-gray-900 leading-snug group-hover:text-teal-700 transition-colors">{step.title}</h4>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}

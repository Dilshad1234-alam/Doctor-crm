import Container from "@/frontend/components/ui/Container";
import SectionHeading from "@/frontend/components/ui/SectionHeading";
import { testimonials } from "@/frontend/constants/landingPage";

export default function TestimonialSection() {
  return (
    <section className="py-24 bg-white">
      <Container>
        <SectionHeading
          title="Loved by Medical Professionals"
          description="See what our users have to say about Doctor CRM."
        />
        <div className="flex justify-center mt-4">
          <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
            Demo feedback for product preview
          </span>
        </div>
        
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, i) => (
            <div key={i} className="bg-gray-50 rounded-2xl p-8 border border-gray-100 shadow-sm relative">
              {/* Quote mark icon */}
              <div className="absolute top-6 left-6 text-gray-200 text-6xl font-serif leading-none select-none">&quot;</div>
              <div className="relative z-10 pt-4">
                <p className="text-gray-700 italic mb-6">&quot;{testimonial.feedback}&quot;</p>
                <div>
                  <h4 className="font-bold text-gray-900">{testimonial.name}</h4>
                  <p className="text-sm text-teal-600">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}

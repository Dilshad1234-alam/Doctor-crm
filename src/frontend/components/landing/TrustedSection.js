import Container from "@/frontend/components/ui/Container";

export default function TrustedSection() {
  const categories = [
    "General Clinic",
    "Dental Clinic",
    "Pediatric Clinic",
    "Gynecology Clinic",
    "Skin Clinic",
    "Multi-specialty Clinic"
  ];

  return (
    <section className="py-12 bg-white border-y border-gray-100">
      <Container>
        <p className="text-center text-sm font-semibold tracking-wide text-gray-500 uppercase mb-8">
          Designed for clinics, doctors and healthcare teams
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          {categories.map((category) => (
            <div key={category} className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-full text-sm font-medium text-gray-600">
              {category}
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}

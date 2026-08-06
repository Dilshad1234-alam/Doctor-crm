import Container from "@/frontend/components/ui/Container";
import Button from "@/frontend/components/ui/Button";

export default function CTASection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-teal-600 via-teal-700 to-teal-900 py-16 sm:py-24">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
      <Container>
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
            Ready to Simplify Your Clinic?
          </h2>
          <p className="mt-4 text-lg leading-6 text-teal-100">
            Start managing doctors, patients, appointments and billing from one secure platform.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Button href="/register" className="bg-white text-teal-700 hover:bg-gray-50 text-lg px-8 py-3">
              Start Free Trial
            </Button>
            <Button href="/login" className="bg-teal-600 text-white hover:bg-teal-500 border border-teal-500 text-lg px-8 py-3">
              Login
            </Button>
          </div>
        </div>
      </Container>
    </section>
  );
}

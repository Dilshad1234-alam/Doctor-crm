import PageHeader from "@/frontend/components/dashboard/PageHeader";

export default function ConsultationsPage() {
  return (
    <div>
      <PageHeader title="Consultations" description="Manage medical consultations." />
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <p className="text-gray-500">Consultations management content goes here.</p>
      </div>
    </div>
  );
}

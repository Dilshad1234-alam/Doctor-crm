import PageHeader from "@/frontend/components/dashboard/PageHeader";

export default function PatientsPage() {
  return (
    <div>
      <PageHeader title="Patients" description="Manage patient records." />
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <p className="text-gray-500">Patients management content goes here.</p>
      </div>
    </div>
  );
}

import PageHeader from "@/frontend/components/dashboard/PageHeader";

export default function DoctorsPage() {
  return (
    <div>
      <PageHeader title="Doctors" description="Manage doctors across clinics." />
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <p className="text-gray-500">Doctors management content goes here.</p>
      </div>
    </div>
  );
}

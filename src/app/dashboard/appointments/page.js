import PageHeader from "@/frontend/components/dashboard/PageHeader";

export default function AppointmentsPage() {
  return (
    <div>
      <PageHeader title="Appointments" description="Manage appointments." />
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <p className="text-gray-500">Appointments management content goes here.</p>
      </div>
    </div>
  );
}

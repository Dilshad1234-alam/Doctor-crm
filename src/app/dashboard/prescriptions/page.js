import PageHeader from "@/frontend/components/dashboard/PageHeader";

export default function PrescriptionsPage() {
  return (
    <div>
      <PageHeader title="Prescriptions" description="Manage patient prescriptions." />
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <p className="text-gray-500">Prescriptions management content goes here.</p>
      </div>
    </div>
  );
}

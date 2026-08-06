import PageHeader from "@/frontend/components/dashboard/PageHeader";

export default function BillingPage() {
  return (
    <div>
      <PageHeader title="Billing" description="Manage invoices and payments." />
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <p className="text-gray-500">Billing management content goes here.</p>
      </div>
    </div>
  );
}

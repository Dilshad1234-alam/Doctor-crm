import PageHeader from "@/frontend/components/dashboard/PageHeader";

export default function ReportsPage() {
  return (
    <div>
      <PageHeader title="Reports" description="View system and clinic reports." />
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <p className="text-gray-500">Reports content goes here.</p>
      </div>
    </div>
  );
}

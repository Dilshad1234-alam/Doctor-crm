import PageHeader from "@/frontend/components/dashboard/PageHeader";

export default function QueuePage() {
  return (
    <div>
      <PageHeader title="Queue" description="Manage patient queue." />
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <p className="text-gray-500">Queue management content goes here.</p>
      </div>
    </div>
  );
}

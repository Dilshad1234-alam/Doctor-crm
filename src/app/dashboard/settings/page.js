import PageHeader from "@/frontend/components/dashboard/PageHeader";

export default function SettingsPage() {
  return (
    <div>
      <PageHeader title="Settings" description="Manage application settings." />
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <p className="text-gray-500">Settings content goes here.</p>
      </div>
    </div>
  );
}

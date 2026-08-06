import PageHeader from "@/frontend/components/dashboard/PageHeader";

export default function DashboardPage() {
  return (
    <div>
      <PageHeader title="Dashboard" description="Overview of your clinics and activities." />
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {/* Placeholder cards */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="text-sm font-medium text-gray-500">Total Doctors</h3>
          <p className="mt-2 text-3xl font-bold text-gray-900">12</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="text-sm font-medium text-gray-500">Total Patients</h3>
          <p className="mt-2 text-3xl font-bold text-gray-900">3,456</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="text-sm font-medium text-gray-500">Today&apos;s Appointments</h3>
          <p className="mt-2 text-3xl font-bold text-gray-900">48</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="text-sm font-medium text-gray-500">Today&apos;s Revenue</h3>
          <p className="mt-2 text-3xl font-bold text-gray-900">$2,340</p>
        </div>
      </div>
    </div>
  );
}

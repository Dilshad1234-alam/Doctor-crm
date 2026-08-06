import DashboardSidebar from "@/frontend/components/layout/DashboardSidebar";
import DashboardHeader from "@/frontend/components/layout/DashboardHeader";

export default function DashboardLayout({ children }) {
  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 font-sans">
      <DashboardSidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <DashboardHeader />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}

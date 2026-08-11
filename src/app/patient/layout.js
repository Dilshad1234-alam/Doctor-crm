import { redirect } from "next/navigation";
import { getAuthenticatedUser } from "@/backend/utils/getAuthenticatedUser";
import DashboardSidebar from "@/frontend/components/layout/DashboardSidebar";
import DashboardHeader from "@/frontend/components/layout/DashboardHeader";

export default async function PatientLayout({ children }) {
  const user = await getAuthenticatedUser();

  if (!user) {
    redirect("/login");
  }

  if (user.role === "unassigned") {
    redirect("/onboarding/select-role");
  }

  if (user.role !== "patient") {
    redirect("/dashboard");
  }

  if (!user.onboardingCompleted) {
    redirect("/onboarding/patient");
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 font-sans">
      <DashboardSidebar user={user} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <DashboardHeader user={user} />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}

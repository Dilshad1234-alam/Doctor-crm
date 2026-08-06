import ClinicOnboardingClient from "./ClinicOnboardingClient";
import { getAuthenticatedUser } from "@/backend/utils/getAuthenticatedUser";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Setup Your Clinic | Doctor CRM",
  description: "Complete your clinic profile to get started with Doctor CRM.",
};

export default async function ClinicOnboardingPage() {
  const user = await getAuthenticatedUser();
  
  if (!user) {
    redirect("/login");
  }
  
  if (user.onboardingCompleted || user.clinicId) {
    redirect("/dashboard");
  }

  return <ClinicOnboardingClient />;
}

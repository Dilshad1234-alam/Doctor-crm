import ClinicOnboardingClient from "./ClinicOnboardingClient";
import { getAuthenticatedUser } from "@/backend/utils/getAuthenticatedUser";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Clinic Setup | Clinora",
  description: "Complete your clinic profile to start managing appointments, staff, and patients.",
};


export default async function ClinicOnboardingPage() {
  const user = await getAuthenticatedUser();
  
  if (!user) {
    redirect("/login");
  }
  
  if (user.onboardingCompleted) {
    redirect("/dashboard");
  }

  return <ClinicOnboardingClient />;
}

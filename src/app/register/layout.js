import { redirect } from "next/navigation";
import { getAuthenticatedUser } from "@/backend/utils/getAuthenticatedUser";

export default async function RegisterLayout({ children }) {
  const user = await getAuthenticatedUser();
  
  if (user) {
    if (user.role === "clinic_owner" && !user.onboardingCompleted) {
      redirect("/onboarding/clinic");
    } else {
      redirect("/dashboard");
    }
  }

  return <>{children}</>;
}

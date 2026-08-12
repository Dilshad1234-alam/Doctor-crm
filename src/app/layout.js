import { Poppins } from "next/font/google";
import "./globals.css";
import AppProviders from "@/frontend/providers/AppProviders";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata = {
  title: "Doctor CRM | Clinic and Patient Management",
  description: "Manage doctors, patients, appointments, prescriptions, billing and follow-ups from one secure clinic management platform.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${poppins.className} min-h-full flex flex-col`} suppressHydrationWarning>
        <AppProviders>
          {children}
        </AppProviders>
      </body>
    </html>
  );
}

import { Inter } from "next/font/google";
import "./globals.css";
import AppProviders from "@/frontend/providers/AppProviders";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Doctor CRM | Clinic and Patient Management",
  description: "Manage doctors, patients, appointments, prescriptions, billing and follow-ups from one secure clinic management platform.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-full flex flex-col`}>
        <AppProviders>
          {children}
        </AppProviders>
      </body>
    </html>
  );
}

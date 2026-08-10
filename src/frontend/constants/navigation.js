const ownerNavigation = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Doctors", href: "/dashboard/doctors" },
  { label: "Patients", href: "/dashboard/patients" },
  { label: "Appointments", href: "/dashboard/appointments" },
  { label: "Queue", href: "/dashboard/queue" },
  { label: "Consultations", href: "/dashboard/consultations" },
  { label: "Prescriptions", href: "/dashboard/prescriptions" },
  { label: "Medical Reports", href: "/dashboard/medical-reports" },
  { label: "Billing", href: "/dashboard/billing" },
  { label: "Reports", href: "/dashboard/reports" },
  { label: "Settings", href: "/dashboard/settings" },
];

const doctorNavigation = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "My Profile", href: "/dashboard/profile" },
  { label: "My Availability", href: "/dashboard/my-availability" },
  { label: "Appointments", href: "/dashboard/appointments" },
  { label: "Consultations", href: "/dashboard/consultations" },
  { label: "Prescriptions", href: "/dashboard/prescriptions" },
  { label: "Medical Reports", href: "/dashboard/medical-reports" },
];

export function getNavigationForRole(role) {
  if (role === "clinic_owner") return ownerNavigation;
  if (role === "doctor") return doctorNavigation;
  // Fallback for receptionist etc.
  return ownerNavigation;
}

// Keep export for backward compatibility where needed, but we should migrate to the function
export const dashboardNavigation = ownerNavigation;

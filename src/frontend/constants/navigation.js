const ownerNavigation = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Doctors", href: "/dashboard/doctors" },
  { label: "Staff", href: "/dashboard/staff" },
  { label: "Patients", href: "/dashboard/patients" },
  { label: "Appointments", href: "/dashboard/appointments" },
  { label: "Queue", href: "/dashboard/queue" },
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
  { label: "Medical Reports", href: "/dashboard/medical-reports" },
];

const patientNavigation = [
  { label: "Dashboard", href: "/patient/dashboard" },
  { label: "Book Appointment", href: "/patient/book" },
  { label: "My Appointments", href: "/patient/appointments" },
  { label: "Prescriptions", href: "/patient/prescriptions" },
  { label: "Medical Reports", href: "/patient/medical-reports" },
  { label: "Billing & Payments", href: "/patient/billing" },
  { label: "Profile", href: "/patient/profile" },
];

const receptionistNavigation = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Patients", href: "/dashboard/patients" },
  { label: "Appointments", href: "/dashboard/appointments" },
  { label: "Queue", href: "/dashboard/queue" },
  { label: "Billing", href: "/dashboard/billing" },
];

const assistantNavigation = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Patients", href: "/dashboard/patients" },
  { label: "Appointments", href: "/dashboard/appointments" },
  { label: "Queue", href: "/dashboard/queue" },
  { label: "Medical Reports", href: "/dashboard/medical-reports" },
];

const accountantNavigation = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Billing", href: "/dashboard/billing" },
  { label: "Reports", href: "/dashboard/reports" },
];

export function getNavigationForRole(role) {
  if (role === "clinic_owner") return ownerNavigation;
  if (role === "doctor") return doctorNavigation;
  if (role === "receptionist") return receptionistNavigation;
  if (role === "assistant") return assistantNavigation;
  if (role === "accountant") return accountantNavigation;
  if (role === "patient") return patientNavigation;
  return ownerNavigation;
}

// Keep export for backward compatibility where needed, but we should migrate to the function
export const dashboardNavigation = ownerNavigation;

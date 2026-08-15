const ownerNavigation = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Doctors", href: "/dashboard/doctors" },
  { label: "Staff", href: "/dashboard/staff" },
  { label: "Patients", href: "/dashboard/patients" },
  { label: "Appointments", href: "/dashboard/appointments" },
  { label: "Queue", href: "/dashboard/queue" },
  { label: "Billing", href: "/dashboard/billing" },
  { label: "Reports", href: "/dashboard/reports" },
  { label: "Settings", href: "/dashboard/settings" },
];

const doctorNavigation = [
  { label: "Dashboard", href: "/dashboard/doctor" },
  { label: "Appointments", href: "/dashboard/appointments" },
  { label: "Patients", href: "/dashboard/patients" },
  { label: "Queue", href: "/dashboard/queue" },
  { label: "Schedule", href: "/dashboard/my-availability" },
  { label: "Prescriptions", href: "/dashboard/prescriptions" },
  { label: "Reports", href: "/dashboard/reports" },
  { label: "Earnings", href: "/dashboard/billing" },
  { label: "Profile", href: "/dashboard/profile" },
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

const adminNavigation = [
  { label: "Dashboard", href: "/dashboard/admin" },
  { label: "Clinics", href: "/dashboard/admin/clinics" },
  { label: "Doctors", href: "/dashboard/admin/doctors" },
  { label: "Patients", href: "/dashboard/admin/patients" },
  { label: "Staff", href: "/dashboard/admin/staff" },
  { label: "Appointments", href: "/dashboard/admin/appointments" },
  { label: "Subscriptions", href: "/dashboard/admin/subscriptions" },
  { label: "Payments", href: "/dashboard/admin/payments" },
  { label: "Reports", href: "/dashboard/admin/reports" },
  { label: "Audit Logs", href: "/dashboard/admin/audit-logs" },
  { label: "Settings", href: "/dashboard/admin/settings" },
];

export function getNavigationForRole(role) {
  if (role === "clinic_owner") return ownerNavigation;
  if (role === "doctor") return doctorNavigation;
  if (role === "receptionist") return receptionistNavigation;
  if (role === "assistant") return assistantNavigation;
  if (role === "accountant") return accountantNavigation;
  if (role === "admin") return adminNavigation;
  if (role === "patient") return patientNavigation;
  return ownerNavigation;
}

// Keep export for backward compatibility where needed, but we should migrate to the function
export const dashboardNavigation = ownerNavigation;

const doctorNavigation = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Clinic", href: "/dashboard/clinic" },
  { label: "Doctor Profile", href: "/dashboard/profile" },
  { label: "Services", href: "/dashboard/services" },
  { label: "Availability", href: "/dashboard/my-availability" },
  { label: "Appointments", href: "/dashboard/appointments" },
  { label: "Website", href: "/dashboard/website" },
  { label: "Analytics", href: "/dashboard/analytics" },
  { label: "Subscription", href: "/dashboard/subscription" },
  { label: "Settings", href: "/dashboard/settings" },
];

const adminNavigation = [
  { label: "Dashboard", href: "/dashboard/admin" },
  { label: "Clinics", href: "/dashboard/admin/clinics" },
  { label: "Subscriptions", href: "/dashboard/admin/subscriptions" },
  { label: "Payments", href: "/dashboard/admin/payments" },
  { label: "Settings", href: "/dashboard/admin/settings" },
];

export function getNavigationForRole(role) {
  if (role === "admin" || role === "super_admin") return adminNavigation;
  return doctorNavigation;
}

export const dashboardNavigation = doctorNavigation;

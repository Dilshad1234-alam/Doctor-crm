export const features = [
  {
    title: "Patient Management",
    description: "Securely store and manage all patient records and histories.",
    icon: "👤",
  },
  {
    title: "Appointment Booking",
    description: "Easy scheduling for patients and staff to avoid conflicts.",
    icon: "📅",
  },
  {
    title: "Multi-Doctor Login",
    description: "Separate secure access for every doctor in your clinic.",
    icon: "👨‍⚕️",
  },
  {
    title: "Waiting Queue",
    description: "Real-time queue tracking to reduce patient wait times.",
    icon: "⏱️",
  },
  {
    title: "Digital Prescription",
    description: "Create and share professional digital prescriptions instantly.",
    icon: "📝",
  },
  {
    title: "Billing and Payments",
    description: "Manage invoices, track payments and generate receipts.",
    icon: "💳",
  },
  {
    title: "Follow-up Reminders",
    description: "Automated reminders to keep patients engaged in their care.",
    icon: "🔔",
  },
  {
    title: "Reports and Analytics",
    description: "Detailed insights into clinic performance and revenue.",
    icon: "📊",
  },
  {
    title: "Multi-Clinic Support",
    description: "Manage multiple branches from a single dashboard.",
    icon: "🏥",
  },
];

export const workflowSteps = [
  { step: 1, title: "Patient Registration" },
  { step: 2, title: "Appointment Booking" },
  { step: 3, title: "Patient Check-in" },
  { step: 4, title: "Doctor Consultation" },
  { step: 5, title: "Digital Prescription" },
  { step: 6, title: "Billing and Payment" },
  { step: 7, title: "Follow-up Reminder" },
];

export const roles = [
  {
    role: "Clinic Owner",
    capabilities: [
      "Manage doctors",
      "Manage staff",
      "View total revenue",
      "View clinic reports",
    ],
  },
  {
    role: "Doctor",
    capabilities: [
      "View own appointments",
      "Consult patients",
      "Create prescriptions",
      "Set follow-ups",
    ],
  },
  {
    role: "Receptionist",
    capabilities: [
      "Register patients",
      "Book appointments",
      "Manage queue",
      "Collect payments",
    ],
  },
  {
    role: "Patient",
    capabilities: [
      "Book appointments",
      "Download prescriptions",
      "View invoices",
      "Receive reminders",
    ],
  },
];

export const benefits = [
  "Reduce paperwork",
  "Avoid duplicate patient records",
  "Faster appointment handling",
  "Complete patient history",
  "Better staff coordination",
  "Accurate billing",
  "Easy follow-up tracking",
  "Secure clinic data",
];

export const pricingPlans = [
  {
    name: "Basic",
    price: "₹499/month",
    features: [
      "1 Doctor",
      "Patient Management",
      "Appointment Management",
      "Digital Prescription",
      "Basic Billing",
    ],
    isPopular: false,
  },
  {
    name: "Standard",
    price: "₹999/month",
    features: [
      "Up to 3 Doctors",
      "Staff Accounts",
      "Billing and Reports",
      "Follow-up Management",
      "WhatsApp-ready Integration",
    ],
    isPopular: true,
  },
  {
    name: "Premium",
    price: "₹1,999/month",
    features: [
      "Multiple Doctors",
      "Multiple Branches",
      "Advanced Reports",
      "Custom Branding",
      "Priority Support",
    ],
    isPopular: false,
  },
];

export const testimonials = [
  {
    name: "Dr. A. Sharma",
    role: "General Physician",
    feedback: "Faster appointment management has transformed how my clinic operates daily.",
  },
  {
    name: "Dr. Sana Khan",
    role: "Dermatologist",
    feedback: "Creating digital prescriptions is incredibly easy and saves me so much time.",
  },
  {
    name: "Sunrise Clinic Team",
    role: "Multi-Specialty Clinic",
    feedback: "Better clinic coordination across all our doctors and staff. A lifesaver!",
  },
];

export const footerLinks = {
  product: [
    { label: "Features", href: "#features" },
    { label: "Pricing", href: "#pricing" },
    { label: "How It Works", href: "#how-it-works" },
  ],
  company: [
    { label: "About", href: "#" },
    { label: "Contact", href: "#" },
    { label: "Privacy Policy", href: "#" },
    { label: "Terms", href: "#" },
  ],
  support: [
    { label: "Help Center", href: "#" },
    { label: "Email Support", href: "#" },
    { label: "Clinic Setup Guide", href: "#" },
  ],
};

export const DEFAULT_ROLE_PERMISSIONS = {
  receptionist: [
    "patients.view",
    "patients.create",
    "patients.update",
    "appointments.view",
    "appointments.create",
    "appointments.update",
    "appointments.reschedule",
    "appointments.cancel",
    "queue.view",
    "queue.check_in",
    "queue.manage",
    "billing.view",
    "billing.create_invoice",
    "billing.record_payment",
    "billing.print_invoice",
    "billing.print_receipt"
  ],
  assistant: [
    "patients.view",
    "appointments.view",
    "queue.view",
    "vitals.view",
    "vitals.create",
    "vitals.update",
    "medical_reports.view",
    "medical_reports.upload",
    "consultations.prepare"
  ],
  accountant: [
    "billing.view",
    "invoices.view",
    "payments.view",
    "payments.record",
    "reports.financial"
  ]
};

export const AVAILABLE_PERMISSIONS = {
  Patients: [
    { id: "patients.view", label: "View Patients" },
    { id: "patients.create", label: "Register Patient" },
    { id: "patients.update", label: "Edit Patient" }
  ],
  Appointments: [
    { id: "appointments.view", label: "View Appointments" },
    { id: "appointments.create", label: "Book Appointment" },
    { id: "appointments.update", label: "Edit Appointment" },
    { id: "appointments.reschedule", label: "Reschedule" },
    { id: "appointments.cancel", label: "Cancel" }
  ],
  Queue: [
    { id: "queue.view", label: "View Queue" },
    { id: "queue.check_in", label: "Check-in Patients" },
    { id: "queue.manage", label: "Manage Queue" }
  ],
  Vitals: [
    { id: "vitals.view", label: "View Vitals" },
    { id: "vitals.create", label: "Record Vitals" },
    { id: "vitals.update", label: "Update Vitals" }
  ],
  MedicalReports: [
    { id: "medical_reports.view", label: "View Reports" },
    { id: "medical_reports.upload", label: "Upload Reports" }
  ],
  Consultations: [
    { id: "consultations.prepare", label: "Prepare Patient" }
  ],
  Billing: [
    { id: "billing.view", label: "View Billing" },
    { id: "billing.create_invoice", label: "Create Invoice" },
    { id: "billing.record_payment", label: "Record Payment" },
    { id: "billing.print_invoice", label: "Print Invoice" },
    { id: "billing.print_receipt", label: "Print Receipt" }
  ],
  Finance: [
    { id: "invoices.view", label: "View Invoices" },
    { id: "payments.view", label: "View Payments" },
    { id: "payments.record", label: "Record Payments" },
    { id: "reports.financial", label: "Financial Reports" }
  ]
};

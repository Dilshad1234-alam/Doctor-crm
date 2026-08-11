import mongoose from "mongoose";

const clinicSettingsSchema = new mongoose.Schema(
  {
    clinicId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Clinic",
      required: true,
      unique: true, // One settings document per clinic
    },
    workingHours: [
      {
        day: {
          type: String,
          enum: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"],
          required: true,
        },
        isOpen: { type: Boolean, default: true },
        openingTime: { type: String, default: "09:00" }, // Format HH:mm
        closingTime: { type: String, default: "17:00" }, // Format HH:mm
      }
    ],
    appointmentSettings: {
      defaultSlotDuration: { type: Number, default: 15 }, // minutes
      allowSameDayBooking: { type: Boolean, default: true },
      allowWalkIn: { type: Boolean, default: true },
      requireVitalsBeforeConsultation: { type: Boolean, default: false },
      allowAppointmentCancellation: { type: Boolean, default: true },
    },
    billingSettings: {
      currency: { type: String, default: "INR" },
      taxEnabled: { type: Boolean, default: false },
      defaultTaxPercentage: { type: Number, default: 0 },
      invoicePrefix: { type: String, default: "INV" },
      paymentReceiptPrefix: { type: String, default: "REC" },
      invoiceFooter: { type: String, default: "Thank you for visiting our clinic." },
    },
    prescriptionSettings: {
      showClinicAddress: { type: Boolean, default: true },
      showClinicPhone: { type: Boolean, default: true },
      showDoctorRegistrationNumber: { type: Boolean, default: true },
      showPatientId: { type: Boolean, default: true },
      showFollowUpInformation: { type: Boolean, default: true },
    },
    notificationSettings: {
      appointmentConfirmation: { type: Boolean, default: true },
      appointmentReminder: { type: Boolean, default: true },
      appointmentCancellation: { type: Boolean, default: true },
      followUpReminder: { type: Boolean, default: true },
      paymentReceipt: { type: Boolean, default: true },
    }
  },
  { timestamps: true }
);

// Ensure index on clinicId
clinicSettingsSchema.index({ clinicId: 1 }, { unique: true });

export default mongoose.models.ClinicSettings || mongoose.model("ClinicSettings", clinicSettingsSchema);

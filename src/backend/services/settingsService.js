import ClinicSettings from "../models/ClinicSettings.js";
import Clinic from "../models/Clinic.js";
import AuditLog from "../models/AuditLog.js";

const DEFAULT_WORKING_HOURS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"].map(day => ({
  day,
  isOpen: day !== "sunday", // Default Sunday closed
  openingTime: "09:00",
  closingTime: "17:00"
}));

export async function getSettings(clinicId) {
  const clinic = await Clinic.findById(clinicId).lean();
  if (!clinic) throw new Error("Clinic not found");

  let settings = await ClinicSettings.findOne({ clinicId }).lean();
  if (!settings) {
    // Create default settings if they don't exist
    settings = await ClinicSettings.create({
      clinicId,
      workingHours: DEFAULT_WORKING_HOURS
    });
    settings = settings.toObject();
  }

  // If workingHours is somehow empty, patch it with default
  if (!settings.workingHours || settings.workingHours.length === 0) {
    settings.workingHours = DEFAULT_WORKING_HOURS;
  }

  return { clinic, settings };
}

export async function updateClinicProfile(clinicId, userId, data) {
  const updatedClinic = await Clinic.findByIdAndUpdate(
    clinicId,
    {
      $set: {
        name: data.name,
        phone: data.phone,
        email: data.email,
        "address.line1": data.address?.line1,
        "address.line2": data.address?.line2,
        "address.city": data.address?.city,
        "address.state": data.address?.state,
        "address.pincode": data.address?.pincode,
        "address.country": data.address?.country || "India",
        timezone: data.timezone,
      }
    },
    { new: true, runValidators: true }
  ).lean();

  await AuditLog.create({
    clinicId,
    userId,
    action: "clinic.settings_updated",
    details: "Clinic profile updated",
  });

  return updatedClinic;
}

export async function updateWorkingHours(clinicId, userId, data) {
  const settings = await ClinicSettings.findOneAndUpdate(
    { clinicId },
    { $set: { workingHours: data.workingHours } },
    { new: true, upsert: true }
  ).lean();

  await AuditLog.create({
    clinicId,
    userId,
    action: "clinic.working_hours_updated",
    details: "Working hours updated",
  });

  return settings.workingHours;
}

export async function updateAppointmentSettings(clinicId, userId, data) {
  const settings = await ClinicSettings.findOneAndUpdate(
    { clinicId },
    { $set: { appointmentSettings: data.appointmentSettings } },
    { new: true, upsert: true }
  ).lean();

  await AuditLog.create({
    clinicId,
    userId,
    action: "clinic.appointment_settings_updated",
    details: "Appointment settings updated",
  });

  return settings.appointmentSettings;
}

export async function updateBillingSettings(clinicId, userId, data) {
  const settings = await ClinicSettings.findOneAndUpdate(
    { clinicId },
    { $set: { billingSettings: data.billingSettings } },
    { new: true, upsert: true }
  ).lean();

  await AuditLog.create({
    clinicId,
    userId,
    action: "clinic.billing_settings_updated",
    details: "Billing settings updated",
  });

  return settings.billingSettings;
}

export async function updatePrescriptionSettings(clinicId, userId, data) {
  const settings = await ClinicSettings.findOneAndUpdate(
    { clinicId },
    { $set: { prescriptionSettings: data.prescriptionSettings } },
    { new: true, upsert: true }
  ).lean();

  await AuditLog.create({
    clinicId,
    userId,
    action: "clinic.prescription_settings_updated",
    details: "Prescription settings updated",
  });

  return settings.prescriptionSettings;
}

export async function updateNotificationSettings(clinicId, userId, data) {
  const settings = await ClinicSettings.findOneAndUpdate(
    { clinicId },
    { $set: { notificationSettings: data.notificationSettings } },
    { new: true, upsert: true }
  ).lean();

  await AuditLog.create({
    clinicId,
    userId,
    action: "clinic.notification_settings_updated",
    details: "Notification settings updated",
  });

  return settings.notificationSettings;
}

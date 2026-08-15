const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const { pathToFileURL } = require("url");

const RESET_SEED_DATA = true;

const envPath = path.resolve(__dirname, "../.env.local");
if (fs.existsSync(envPath)) {
  const envConfig = fs.readFileSync(envPath, "utf-8");
  envConfig.split("\n").forEach((line) => {
    const match = line.match(/^([^#\s][^=]+)=(.*)$/);
    if (match) {
      process.env[match[1].trim()] = match[2].trim().replace(/(^"|"$)/g, "");
    }
  });
}

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error("Please define the MONGODB_URI environment variable inside .env.local");
  process.exit(1);
}

async function loadModels() {
  const modelsPath = path.resolve(__dirname, "../src/backend/models");
  
  const loadModule = async (filename) => {
    const fileUrl = pathToFileURL(path.join(modelsPath, filename)).href;
    const mod = await import(fileUrl);
    return mod.default || mod;
  };

  const User = await loadModule("User.js");
  const Clinic = await loadModule("Clinic.js");
  const Doctor = await loadModule("Doctor.js");
  const Patient = await loadModule("Patient.js");
  const ClinicProfile = await loadModule("ClinicProfile.js");
  const ClinicSettings = await loadModule("ClinicSettings.js");
  const DoctorProfile = await loadModule("DoctorProfile.js");
  const PatientProfile = await loadModule("PatientProfile.js");
  const Appointment = await loadModule("Appointment.js");
  const Consultation = await loadModule("Consultation.js");
  const Prescription = await loadModule("Prescription.js");
  const MedicalReport = await loadModule("MedicalReport.js");
  const Invoice = await loadModule("Invoice.js");
  const Payment = await loadModule("Payment.js");
  const QueueEntry = await loadModule("QueueEntry.js");
  const PatientVitals = await loadModule("PatientVitals.js");
  const StaffProfile = await loadModule("StaffProfile.js");
  const DoctorScheduleException = await loadModule("DoctorScheduleException.js");
  const PatientHistoryEvent = await loadModule("PatientHistoryEvent.js");

  return {
    User, Clinic, Doctor, Patient, ClinicProfile, ClinicSettings, DoctorProfile, PatientProfile, Appointment,
    Consultation, Prescription, MedicalReport, Invoice, Payment, QueueEntry,
    PatientVitals, StaffProfile, DoctorScheduleException, PatientHistoryEvent
  };
}

const CITIES = [
  { name: "Patna", state: "Bihar", clinicName: "Patna Care Multispeciality Clinic", slug: "patna-demo", address: "Kankarbagh", pincode: "800020", phone: "+91 9000000001" },
  { name: "Ranchi", state: "Jharkhand", clinicName: "Ranchi Health Plus Clinic", slug: "ranchi-demo", address: "Lalpur", pincode: "834001", phone: "+91 9000000002" },
  { name: "Kolkata", state: "West Bengal", clinicName: "Kolkata MedCare Clinic", slug: "kolkata-demo", address: "Salt Lake", pincode: "700091", phone: "+91 9000000003" },
  { name: "Delhi", state: "Delhi", clinicName: "Delhi Prime Health Clinic", slug: "delhi-demo", address: "Saket", pincode: "110017", phone: "+91 9000000004" },
  { name: "Lucknow", state: "Uttar Pradesh", clinicName: "Lucknow Wellness Care Clinic", slug: "lucknow-demo", address: "Gomti Nagar", pincode: "226010", phone: "+91 9000000005" }
];

const SPECIALTIES = ["General Physician", "Cardiologist", "Gynecologist", "Pediatrician", "Orthopedic"];

const MOCK_NAMES = [
  "Dr. Amit Sharma", "Dr. Rahul Kumar", "Dr. Priya Singh", "Dr. Sandeep Verma", "Dr. Neha Gupta",
  "Dr. Rohit Das", "Dr. Pooja Singh", "Dr. Manish Kumar", "Dr. Anjali Sharma", "Dr. Vivek Verma",
  "Dr. Arjun Das", "Dr. Sneha Roy", "Dr. Rajiv Kumar", "Dr. Kavita Singh", "Dr. Nitin Gupta",
  "Dr. Aditya Sharma", "Dr. Riya Verma", "Dr. Karan Singh", "Dr. Meera Gupta", "Dr. Sameer Kumar",
  "Dr. Mohit Yadav", "Dr. Swati Sharma", "Dr. Akash Singh", "Dr. Nisha Verma", "Dr. Varun Kumar"
];

function generateDeterministicPhone(seed) {
  return `+91910${seed.toString().padStart(7, "0")}`;
}

async function runSeed() {
  console.log("Connecting to MongoDB...");
  await mongoose.connect(MONGODB_URI);
  console.log("Connected.");

  console.log("Loading models...");
  const models = await loadModels();
  const { User, Clinic, Doctor, Patient, ClinicProfile, ClinicSettings, DoctorProfile, PatientProfile, Appointment, Consultation, Prescription, MedicalReport, Invoice, Payment, QueueEntry, PatientVitals, StaffProfile, DoctorScheduleException, PatientHistoryEvent } = models;

  if (RESET_SEED_DATA) {
    console.log("\n--- Wiping complete database ---");
    await Promise.all(Object.values(models).map(model => model.deleteMany({})));
    console.log("Database cleared.");
  }

  const plainPassword = "12345678";
  const hashedPassword = await bcrypt.hash(plainPassword, 10);

  const usedEmails = new Set();
  const generateUniqueEmail = (email) => {
    let finalEmail = email;
    let counter = 1;
    while (usedEmails.has(finalEmail)) {
      const parts = email.split("@");
      finalEmail = `${parts[0]}_${counter}@${parts[1]}`;
      counter++;
    }
    usedEmails.add(finalEmail);
    return finalEmail;
  };

  const getCleanNameEmail = (name) => {
    const cleanName = name.replace("Dr. ", "").trim().toLowerCase().replace(/\s+/g, ".");
    return generateUniqueEmail(`${cleanName}@gmail.com`);
  };

  let phoneCounter = 1;
  let stats = { clinics: 0, owners: 0, doctors: 0, patients: 0, appointments: 0, consultations: 0, prescriptions: 0, reports: 0, invoices: 0, vitals: 0, payments: 0 };
  let docCredentials = [];
  let patCredentials = [];
  let ownerCredentials = [];

  console.log("\n--- Creating Demo Data ---");

  // Global Admin
  const adminAccount = await User.create({
    name: "Clinora Admin",
    email: "admin@clinora.com",
    phone: generateDeterministicPhone(phoneCounter++),
    password: hashedPassword,
    isActive: true
  });
  ownerCredentials.push({ city: "Global (Admin)", email: "admin@clinora.com" });

  for (let c = 0; c < CITIES.length; c++) {
    const cityData = CITIES[c];
    
    // 1. Create Clinic Account (Owner)
    const ownerName = `${cityData.name} Owner`;
    const ownerEmail = getCleanNameEmail(ownerName);
    const clinicAccount = await Clinic.create({
      name: cityData.clinicName,
      email: ownerEmail,
      phone: cityData.phone,
      password: hashedPassword,
      isActive: true
    });
    stats.owners++;
    ownerCredentials.push({ city: cityData.name, email: ownerEmail });

    // 2. Create Clinic Profile
    const clinicProfile = await ClinicProfile.create({
      clinicId: clinicAccount._id,
      slug: cityData.slug,
      address: {
        line1: cityData.address,
        city: cityData.name,
        state: cityData.state,
        pincode: cityData.pincode,
        country: "India"
      },
      isPublic: true,
      onboardingCompleted: true,
      specialties: SPECIALTIES,
      facilities: ["Pharmacy", "Lab", "X-Ray"],
      status: "active",
      logoUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(cityData.clinicName)}&background=10B981&color=fff&size=200`,
      coverImageUrl: `https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=800&auto=format&fit=crop`
    });
    stats.clinics++;

    // 3. Create ClinicSettings
    await ClinicSettings.create({
      clinicId: clinicAccount._id,
      workingHours: ["monday", "tuesday", "wednesday", "thursday", "friday"].map(day => ({
        day, isOpen: true, openingTime: "09:00", closingTime: "17:00"
      })).concat([
        { day: "saturday", isOpen: true, openingTime: "09:00", closingTime: "13:00" },
        { day: "sunday", isOpen: false, openingTime: "09:00", closingTime: "17:00" }
      ]),
      appointmentSettings: { defaultSlotDuration: 15, allowSameDayBooking: true, allowWalkIn: true, allowAppointmentCancellation: true },
      billingSettings: { currency: "INR" }
    });

    // 4. Create Exactly 5 Doctors
    for (let d = 0; d < 5; d++) {
      const docName = MOCK_NAMES[c * 5 + d];
      const docEmail = getCleanNameEmail(docName);

      const doctorAccount = await Doctor.create({
        name: docName,
        email: docEmail,
        phone: generateDeterministicPhone(phoneCounter++),
        password: hashedPassword,
        isActive: true
      });
      
      const docProfile = await DoctorProfile.create({
        doctorId: doctorAccount._id,
        clinicId: clinicAccount._id,
        employeeId: `DOC-${cityData.name.substring(0, 3).toUpperCase()}-00${d + 1}`,
        specialization: SPECIALTIES[d],
        qualification: ["MBBS", "MD"],
        registrationNumber: `REG${10000 + c * 100 + d}`,
        experienceYears: 5 + d,
        consultationFee: 500,
        availableDays: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday"],
        startTime: "09:00",
        endTime: "17:00",
        slotDuration: 15,
        maxAppointmentsPerDay: 30,
        isAvailable: true,
        isPublic: true,
        isActive: true,
        createdById: clinicAccount._id,
        createdByModel: "Clinic"
      });
      stats.doctors++;
      if (docCredentials.length < 5) docCredentials.push({ name: docName, email: docEmail, clinic: cityData.name, specialization: SPECIALTIES[d] });

      // 5. Create Exactly 5 Patients per Doctor
      for (let p = 0; p < 5; p++) {
        const patientIndex = (d * 5) + p + 1;
        const patFirstName = `Patient${patientIndex}`;
        const lastName = docName.replace("Dr. ", "").split(" ")[1] || "Doc";
        const patName = `${patFirstName} ${lastName}`;
        const patEmail = getCleanNameEmail(patName);

        const patientAccount = await Patient.create({
          name: patName,
          email: patEmail,
          phone: generateDeterministicPhone(phoneCounter++),
          password: hashedPassword,
          isActive: true
        });

        const patProfile = await PatientProfile.create({
          patientId: patientAccount._id,
          clinicId: clinicAccount._id, 
          gender: p % 2 === 0 ? "male" : "female",
          bloodGroup: "O+",
          address: { city: cityData.name, state: cityData.state },
          allergies: p % 3 === 0 ? ["Dust", "Peanuts"] : [],
          chronicConditions: []
        });
        stats.patients++;
        if (patCredentials.length < 5) patCredentials.push({ name: patientAccount.name, email: patEmail });

        const statuses = ["completed", "scheduled", "checked_in", "cancelled"];
        const apptStatus = statuses[p % statuses.length];
        const apptDate = new Date();
        if (apptStatus === "completed") {
          apptDate.setDate(apptDate.getDate() - 2); 
        } else if (apptStatus === "scheduled") {
          apptDate.setDate(apptDate.getDate() + 1); 
        }
        
        const appointment = await Appointment.create({
          clinicId: clinicAccount._id,
          appointmentCode: `APT-${100000 + (c * 1000) + patientIndex}`,
          patientId: patientAccount._id,
          doctorId: doctorAccount._id,
          appointmentDate: apptDate,
          startTime: "10:00",
          endTime: "10:15",
          durationMinutes: 15,
          visitType: "new_consultation",
          source: "walk_in",
          consultationFee: docProfile.consultationFee || 500,
          status: apptStatus,
          createdById: clinicAccount._id,
          createdByModel: "Clinic"
        });
        stats.appointments++;

        if (apptStatus === "completed") {
          const consultation = await Consultation.create({
            clinicId: clinicAccount._id,
            consultationCode: `CON-${100000 + (c * 1000) + patientIndex}`,
            appointmentId: appointment._id,
            patientId: patientAccount._id,
            doctorId: doctorAccount._id,
            chiefComplaints: [{ complaint: "Routine Checkup", duration: "1 day" }],
            diagnoses: [{ name: "Healthy", type: "primary" }], 
            status: "completed",
            createdById: doctorAccount._id,
            createdByModel: "Doctor"
          });
          stats.consultations++;

          const prescription = await Prescription.create({
            clinicId: clinicAccount._id,
            prescriptionCode: `RX-${100000 + (c * 1000) + patientIndex}`,
            consultationId: consultation._id,
            appointmentId: appointment._id,
            patientId: patientAccount._id,
            doctorId: doctorAccount._id,
            medicines: [{
              medicineName: "Vitamin D3",
              dosage: "1 capsule",
              frequency: "Once a week",
              durationValue: 4,
              durationUnit: "weeks",
              foodTiming: "after_food",
              route: "oral"
            }],
            status: "finalized",
            createdById: doctorAccount._id,
            createdByModel: "Doctor"
          });
          stats.prescriptions++;

          await PatientVitals.create({
            clinicId: clinicAccount._id,
            patientId: patientAccount._id,
            doctorId: doctorAccount._id,
            appointmentId: appointment._id,
            bloodPressure: { systolic: 120, diastolic: 80 },
            pulseRate: 72,
            temperatureC: 37,
            recordedById: doctorAccount._id,
            recordedByModel: "Doctor"
          });
          stats.vitals++;

          const invoice = await Invoice.create({
            clinicId: clinicAccount._id,
            invoiceCode: `INV-${100000 + (c * 1000) + patientIndex}`,
            patientId: patientAccount._id,
            doctorId: doctorAccount._id,
            appointmentId: appointment._id,
            items: [{ type: "consultation", description: "Standard Consultation", quantity: 1, unitPrice: docProfile.consultationFee || 500, amount: docProfile.consultationFee || 500 }],
            subtotal: docProfile.consultationFee || 500,
            totalAmount: docProfile.consultationFee || 500,
            pendingAmount: 0,
            paidAmount: docProfile.consultationFee || 500,
            status: "paid",
            createdById: clinicAccount._id,
            createdByModel: "Clinic"
          });
          stats.invoices++;

          await Payment.create({
            clinicId: clinicAccount._id,
            paymentCode: `PAY-${100000 + (c * 1000) + patientIndex}`,
            invoiceId: invoice._id,
            patientId: patientAccount._id,
            appointmentId: appointment._id,
            amount: invoice.totalAmount,
            paymentMethod: "cash",
            status: "success",
            receivedById: clinicAccount._id,
            receivedByModel: "Clinic"
          });
          stats.payments++;

          await MedicalReport.create({
            clinicId: clinicAccount._id,
            reportCode: `REP-${100000 + (c * 1000) + patientIndex}`,
            patientId: patientAccount._id,
            doctorId: doctorAccount._id,
            appointmentId: appointment._id,
            title: "Routine Blood Test",
            reportType: "blood_test",
            reportDate: apptDate,
            fileName: "blood_test.pdf",
            fileType: "application/pdf",
            fileSize: 10240,
            uploadedById: doctorAccount._id,
            uploadedByModel: "Doctor",
            reviewStatus: "reviewed",
            reviewedById: doctorAccount._id,
            reviewedByModel: "Doctor"
          });
          stats.reports++;
        }
      }
    }
  }

  console.log(`
====================================
SEED COMPLETED SUCCESSFULLY
====================================
Clinics: ${stats.clinics}
Doctors: ${stats.doctors}
Patients: ${stats.patients}
Appointments: ${stats.appointments}
Consultations: ${stats.consultations}
Prescriptions: ${stats.prescriptions}
Medical Reports: ${stats.reports}
Invoices: ${stats.invoices}
Payments: ${stats.payments}
`);

  process.exit(0);
}

runSeed().catch(err => {
  console.error("Seed execution failed:");
  console.error(err);
  process.exit(1);
});

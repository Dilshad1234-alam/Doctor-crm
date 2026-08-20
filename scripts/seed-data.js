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

const CLINICS_DATA = [
    {
      "name": "BIG Apollo Spectra Hospital",
      "slug": "big-apollo-spectra-patna",
      "email": "apollo.demo@clinora.com",
      "phone": "+91 612 3540100",
      "password": "12345678",
      "address": {
        "line1": "Sheetla Mandir Road, near Sump House",
        "area": "Agam Kuan",
        "city": "Patna",
        "state": "Bihar",
        "pincode": "800007",
        "country": "India"
      },
      "website": "https://www.apollospectra.com/patna",
      "logoUrl": "https://ik.imagekit.io/Dilshad/Cafe/doc%201.jpg?updatedAt=1787037057714",
      "coverImageUrl": "https://ik.imagekit.io/Dilshad/Cafe/doc%201.jpg?updatedAt=1787037057714",
      "specialties": [
        "Cardiology", "Critical Care", "Endocrinology", "General Medicine", 
        "General Surgery", "Gastroenterology", "Nephrology", "Neurology", 
        "Oncology", "Orthopaedics", "Urology"
      ],
      "doctors": [
        {
          "name": "Dr Nikesh Kumar Roshan",
          "email": "nikesh.kumar.roshan@clinora.com",
          "phone": "",
          "password": "12345678",
          "specialization": "Critical Care",
          "qualification": ["MBBS", "DNB"],
          "experienceYears": 11,
          "registrationNumber": "",
          "consultationFee": 500,
          "profileImageUrl": ""
        },
        {
          "name": "Dr Sanjay Kumar",
          "email": "sanjay.kumar.radiology@clinora.com",
          "phone": "",
          "password": "12345678",
          "specialization": "Radiology",
          "qualification": ["MBBS", "MD"],
          "experienceYears": 7,
          "registrationNumber": "",
          "consultationFee": 500,
          "profileImageUrl": ""
        },
        {
          "name": "Dr Madhukar Dayal",
          "email": "madhukar.dayal@clinora.com",
          "phone": "",
          "password": "12345678",
          "specialization": "Radiology",
          "qualification": ["MBBS", "MD", "DNB"],
          "experienceYears": 10,
          "registrationNumber": "",
          "consultationFee": 500,
          "profileImageUrl": ""
        },
        {
          "name": "Dr. Rajiv Ranjan",
          "email": "rajiv.ranjan@clinora.com",
          "phone": "",
          "password": "12345678",
          "specialization": "Rheumatology",
          "qualification": ["DM Rheumatology"],
          "experienceYears": 16,
          "registrationNumber": "",
          "consultationFee": 500,
          "profileImageUrl": ""
        },
        {
          "name": "Dr Vijay Prakash",
          "email": "vijay.prakash@clinora.com",
          "phone": "",
          "password": "12345678",
          "specialization": "Gastroenterology",
          "qualification": ["MD", "DNB", "MRCP"],
          "experienceYears": 34,
          "registrationNumber": "",
          "consultationFee": 500,
          "profileImageUrl": ""
        }
      ]
    },
    {
      "name": "Mediversal Multi Super Speciality Hospital",
      "slug": "mediversal-patna",
      "email": "mediversal.demo@clinora.com",
      "phone": "+91 612 3500010",
      "password": "12345678",
      "address": {
        "line1": "Doctors' Colony",
        "area": "Kankarbagh",
        "city": "Patna",
        "state": "Bihar",
        "pincode": "800020",
        "country": "India"
      },
      "website": "https://www.mediversal.in",
      "logoUrl": "https://ik.imagekit.io/Dilshad/Cafe/doc%202.avif?updatedAt=1787037057826",
      "coverImageUrl": "https://ik.imagekit.io/Dilshad/Cafe/doc%202.avif?updatedAt=1787037057826",
      "specialties": [
        "Orthopedics", "Cardiac Sciences", "Neurosciences", "Internal Medicine", 
        "Nephrology", "Critical Care", "Pulmonology", "Gastroenterology", "Hepatology"
      ],
      "doctors": [
        {
          "name": "Dr. Saquib Azad Siddiqui",
          "email": "saquib.siddiqui@clinora.com",
          "phone": "",
          "password": "12345678",
          "specialization": "Neurosurgery",
          "qualification": ["MBBS", "MS", "MCh Neurosurgery"],
          "experienceYears": 10,
          "registrationNumber": "",
          "consultationFee": 500,
          "profileImageUrl": ""
        },
        {
          "name": "Dr. Nishikant Kumar",
          "email": "nishikant.kumar@clinora.com",
          "phone": "",
          "password": "12345678",
          "specialization": "Orthopedic & Joint Replacement",
          "qualification": ["MBBS", "MS Orthopaedics", "DNB Orthopaedics"],
          "experienceYears": 10,
          "registrationNumber": "",
          "consultationFee": 500,
          "profileImageUrl": ""
        },
        {
          "name": "Dr. Vikash Singh",
          "email": "vikash.singh@clinora.com",
          "phone": "",
          "password": "12345678",
          "specialization": "Cardiology",
          "qualification": ["MBBS", "MD Medicine", "DM Cardiology"],
          "experienceYears": 10,
          "registrationNumber": "",
          "consultationFee": 500,
          "profileImageUrl": ""
        },
        {
          "name": "Dr. Sanjeev Kumar Chhaparia",
          "email": "sanjeev.chhaparia@clinora.com",
          "phone": "",
          "password": "12345678",
          "specialization": "Internal Medicine",
          "qualification": ["MBBS", "MD Internal Medicine"],
          "experienceYears": 10,
          "registrationNumber": "",
          "consultationFee": 500,
          "profileImageUrl": ""
        },
        {
          "name": "Dr. Asif Iqbal",
          "email": "asif.iqbal@clinora.com",
          "phone": "",
          "password": "12345678",
          "specialization": "Gastroenterology & Hepatology",
          "qualification": ["MBBS", "MD General Medicine", "MRCP UK", "DM Gastroenterology"],
          "experienceYears": 10,
          "registrationNumber": "",
          "consultationFee": 500,
          "profileImageUrl": ""
        }
      ]
    },
    {
      "name": "Getwel Hospital",
      "slug": "getwel-hospital-patna",
      "email": "getwel.demo@clinora.com",
      "phone": "+91 612 2296530",
      "password": "12345678",
      "address": {
        "line1": "Pillar No. 51, Bailey Road",
        "area": "Raza Bazar",
        "city": "Patna",
        "state": "Bihar",
        "pincode": "800014",
        "country": "India"
      },
      "website": "https://getwelhospital.com",
      "logoUrl": "https://ik.imagekit.io/Dilshad/Cafe/doc%203.png?updatedAt=1787037058472",
      "coverImageUrl": "https://ik.imagekit.io/Dilshad/Cafe/doc%203.png?updatedAt=1787037058472",
      "specialties": [
        "General Medicine", "Critical Care", "Pediatrics", "Gynaecology", 
        "Obstetrics", "General Surgery", "Orthopedics", "Radiology", "Cardiology"
      ],
      "doctors": [
        {
          "name": "Dr. Rahul Raj Singh",
          "email": "rahul.raj.singh@clinora.com",
          "phone": "",
          "password": "12345678",
          "specialization": "General & Critical Care Physician",
          "qualification": ["MBBS", "CTCCM", "IDCCM"],
          "experienceYears": 10,
          "registrationNumber": "",
          "consultationFee": 500,
          "profileImageUrl": ""
        },
        {
          "name": "Dr. Sujit Kumar Sinha",
          "email": "sujit.kumar.sinha@clinora.com",
          "phone": "",
          "password": "12345678",
          "specialization": "Pediatrics",
          "qualification": ["MD", "DCH"],
          "experienceYears": 42,
          "registrationNumber": "",
          "consultationFee": 500,
          "profileImageUrl": ""
        },
        {
          "name": "Dr. Kavita Kumari",
          "email": "kavita.kumari@clinora.com",
          "phone": "",
          "password": "12345678",
          "specialization": "Gynaecology, Obstetrics & General Surgery",
          "qualification": ["MBBS", "DGO", "MS"],
          "experienceYears": 17,
          "registrationNumber": "",
          "consultationFee": 500,
          "profileImageUrl": ""
        },
        {
          "name": "Dr. Mohsin Parvez",
          "email": "mohsin.parvez@clinora.com",
          "phone": "",
          "password": "12345678",
          "specialization": "Orthopedics & Hip/Knee Replacement",
          "qualification": ["MBBS", "MS"],
          "experienceYears": 17,
          "registrationNumber": "",
          "consultationFee": 500,
          "profileImageUrl": ""
        },
        {
          "name": "Dr. Rishi Raj Singh",
          "email": "rishi.raj.singh@clinora.com",
          "phone": "",
          "password": "12345678",
          "specialization": "Radiology",
          "qualification": ["MBBS", "DNB Radiodiagnosis", "CIFR Fetal Radiology"],
          "experienceYears": 17,
          "registrationNumber": "",
          "consultationFee": 500,
          "profileImageUrl": ""
        }
      ]
    },
    {
      "name": "Navya Hospital",
      "slug": "navya-hospital-patna",
      "email": "navya.demo@clinora.com",
      "phone": "+91 9955997474",
      "password": "12345678",
      "address": {
        "line1": "Mustafapur, Opp. Tata Motors",
        "area": "Gaya Road, Beldari Chak",
        "city": "Patna",
        "state": "Bihar",
        "pincode": "804451",
        "country": "India"
      },
      "website": "https://www.navyahospital.co.in",
      "logoUrl": "https://ik.imagekit.io/Dilshad/Cafe/doc%204.jpg?updatedAt=1787037057627",
      "coverImageUrl": "https://ik.imagekit.io/Dilshad/Cafe/doc%204.jpg?updatedAt=1787037057627",
      "specialties": [
        "Cardiology", "Neurology", "Orthopaedic Surgery", "Gynaecology & Obstetrics", 
        "General Medicine", "General & Laparoscopic Surgery", "Nephrology", "Gastroenterology"
      ],
      "doctors": [
        {
          "name": "Dr. Ishu",
          "email": "ishu@clinora.com",
          "phone": "",
          "password": "12345678",
          "specialization": "Gynaecology & Obstetrics",
          "qualification": [],
          "experienceYears": 5,
          "registrationNumber": "",
          "consultationFee": 500,
          "profileImageUrl": ""
        },
        {
          "name": "Dr. M.N. Prasad",
          "email": "mn.prasad@clinora.com",
          "phone": "",
          "password": "12345678",
          "specialization": "Anaesthesia / Hospital Leadership",
          "qualification": ["DA"],
          "experienceYears": 10,
          "registrationNumber": "",
          "consultationFee": 500,
          "profileImageUrl": ""
        },
        {
          "name": "Dr. Raja Anurag Gautam",
          "email": "raja.anurag.gautam@clinora.com",
          "phone": "",
          "password": "12345678",
          "specialization": "Orthopaedic Surgery",
          "qualification": ["MBBS", "MS Orthopaedics"],
          "experienceYears": 10,
          "registrationNumber": "",
          "consultationFee": 500,
          "profileImageUrl": ""
        },
        {
          "name": "Dr. Vikas Kumar",
          "email": "vikas.kumar@clinora.com",
          "phone": "",
          "password": "12345678",
          "specialization": "General Medicine / Diabetes",
          "qualification": [],
          "experienceYears": 10,
          "registrationNumber": "",
          "consultationFee": 500,
          "profileImageUrl": ""
        }
      ]
    }
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

  for (let c = 0; c < CLINICS_DATA.length; c++) {
    const clinicData = CLINICS_DATA[c];
    
    // 1. Create Clinic Account (Owner)
    const ownerName = `${clinicData.name} Owner`;
    const ownerEmail = clinicData.email;
    const clinicAccount = await Clinic.create({
      name: clinicData.name,
      email: ownerEmail,
      phone: clinicData.phone,
      password: hashedPassword,
      isActive: true
    });
    stats.owners++;
    ownerCredentials.push({ clinic: clinicData.name, email: ownerEmail });

    // 2. Create Clinic Profile
    const clinicProfile = await ClinicProfile.create({
      clinicId: clinicAccount._id,
      slug: clinicData.slug,
      address: {
        line1: clinicData.address.line1,
        city: clinicData.address.city,
        state: clinicData.address.state,
        pincode: clinicData.address.pincode || "800001",
        country: clinicData.address.country || "India"
      },
      isPublic: true,
      onboardingCompleted: true,
      specialties: clinicData.specialties,
      facilities: ["Pharmacy", "Lab", "X-Ray"],
      status: "active",
      logoUrl: clinicData.logoUrl || `https://images.unsplash.com/photo-1538108149393-fbbd81895907?auto=format&fit=crop&q=80&w=400`,
      coverImageUrl: clinicData.coverImageUrl || `https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=800&auto=format&fit=crop`
    });
    stats.clinics++;

    // 3. Create ClinicSettings
    await ClinicSettings.create({
      clinicId: clinicAccount._id,
      workingHours: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday"].map(day => ({
        day, isOpen: true, openingTime: "09:00", closingTime: "17:00"
      })).concat([
        { day: "sunday", isOpen: false, openingTime: "09:00", closingTime: "17:00" }
      ]),
      appointmentSettings: { defaultSlotDuration: 15, allowSameDayBooking: true, allowWalkIn: true, allowAppointmentCancellation: true },
      billingSettings: { currency: "INR" }
    });

    // 4. Create Doctors for Clinic
    for (let d = 0; d < clinicData.doctors.length; d++) {
      const docRawData = clinicData.doctors[d];
      const docName = docRawData.name;
      const docEmail = docRawData.email;

      const doctorAccount = await Doctor.create({
        name: docName,
        email: docEmail,
        phone: docRawData.phone || generateDeterministicPhone(phoneCounter++),
        password: hashedPassword,
        isActive: true
      });
      
      const docProfile = await DoctorProfile.create({
        doctorId: doctorAccount._id,
        clinicId: clinicAccount._id,
        employeeId: `DOC-${clinicData.name.substring(0, 3).toUpperCase()}-00${d + 1}`,
        specialization: docRawData.specialization,
        qualification: docRawData.qualification && docRawData.qualification.length > 0 ? docRawData.qualification : ["MBBS"],
        registrationNumber: docRawData.registrationNumber || `REG${10000 + c * 100 + d}`,
        experienceYears: docRawData.experienceYears || 10,
        consultationFee: docRawData.consultationFee || 500,
        availableDays: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday"],
        startTime: "09:00",
        endTime: "17:00",
        slotDuration: 15,
        maxAppointmentsPerDay: 30,
        isAvailable: true,
        isPublic: true,
        isActive: true,
        profileImageUrl: docRawData.profileImageUrl || (() => {
          const isFemale = /kavita|ishu|sneha|priya|neha|pooja|anjali|riya|meera|swati|nisha/i.test(docName);
          const idx = c * 10 + d;
          if (isFemale) {
            const fIds = [12, 16, 26, 30, 31, 35, 43, 44, 47, 68];
            return `https://randomuser.me/api/portraits/women/${fIds[idx % fIds.length]}.jpg`;
          } else {
            const mIds = [11, 13, 15, 22, 28, 32, 33, 37, 44, 46, 50, 55, 57, 60, 67, 69, 75, 77];
            return `https://randomuser.me/api/portraits/men/${mIds[idx % mIds.length]}.jpg`;
          }
        })(),
        createdById: clinicAccount._id,
        createdByModel: "Clinic"
      });
      stats.doctors++;
      docCredentials.push({ name: docName, email: docEmail, clinic: clinicData.name, specialization: docRawData.specialization });

      // 5. Create 5 Patients per Doctor
      for (let p = 0; p < 5; p++) {
        const patientIndex = (d * 5) + p + 1;
        const patFirstName = `Patient${patientIndex}`;
        const lastName = docName.replace("Dr. ", "").split(" ")[0] || "Doc";
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
          address: { city: clinicData.address.city, state: clinicData.address.state },
          allergies: p % 3 === 0 ? ["Dust", "Peanuts"] : [],
          chronicConditions: []
        });
        stats.patients++;
        patCredentials.push({ name: patientAccount.name, email: patEmail });

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
            createdByUserId: clinicAccount._id
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
            fileUrl: "https://example.com/dummy_report.pdf",
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

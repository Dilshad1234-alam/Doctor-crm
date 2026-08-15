const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// 1. Load environment variables
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

// 2. Define Schemas Inline (Avoids CJS/ESM import conflicts in Next.js)
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, default: null },
  password: { type: String, required: true },
  role: { type: String, enum: ["patient", "doctor", "receptionist", "assistant", "clinic_owner", "unassigned"], default: "unassigned" },
  onboardingCompleted: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

const clinicSchema = new mongoose.Schema({
  name: { type: String, required: true },
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  phone: { type: String, required: true },
  address: {
    line1: { type: String, required: true },
    area: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
    country: { type: String, required: true, default: "India" },
  },
  logoUrl: { type: String },
  coverImageUrl: { type: String },
  isPublic: { type: Boolean, default: false },
  about: { type: String },
  specialties: [{ type: String }],
  facilities: [{ type: String }],
  onboardingCompleted: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

const doctorProfileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  clinicId: { type: mongoose.Schema.Types.ObjectId, ref: "Clinic", required: true },
  employeeId: { type: String },
  profileImageUrl: { type: String },
  specialization: { type: String, required: true },
  qualification: [{ type: String }],
  experienceYears: { type: Number },
  consultationFee: { type: Number, required: true },
  availableDays: [{ type: String }],
  startTime: { type: String },
  endTime: { type: String },
  slotDuration: { type: Number, default: 30 },
  isAvailable: { type: Boolean, default: true },
  isPublic: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

const patientProfileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  profileImageUrl: { type: String },
  gender: { type: String, enum: ["male", "female", "other", "prefer_not_to_say"] },
  bloodGroup: { type: String, enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", "unknown"] },
  age: { type: Number },
  address: {
    line1: { type: String },
    city: { type: String },
    state: { type: String },
  },
  emergencyContact: {
    name: { type: String },
    phone: { type: String },
  },
  clinics: [{ type: mongoose.Schema.Types.ObjectId, ref: "Clinic" }],
}, { timestamps: true });

const appointmentSchema = new mongoose.Schema({
  clinicId: { type: mongoose.Schema.Types.ObjectId, ref: "Clinic", required: true },
  appointmentCode: { type: String, required: true },
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: "DoctorProfile", required: true },
  appointmentDate: { type: Date, required: true },
  startTime: { type: String, required: true },
  status: { type: String, enum: ["scheduled", "checked_in", "in_progress", "completed", "cancelled", "no_show"], default: "scheduled" },
}, { timestamps: true });

const consultationSchema = new mongoose.Schema({
  clinicId: { type: mongoose.Schema.Types.ObjectId, ref: "Clinic", required: true },
  consultationCode: { type: String, required: true },
  appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Appointment", required: true },
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: "DoctorProfile", required: true },
  chiefComplaints: [{ complaint: String, duration: String, notes: String }],
  symptoms: [{ name: String, duration: String, severity: String, notes: String }],
  diagnoses: [String],
  privateDoctorNotes: { type: String },
  status: { type: String, enum: ["in_progress", "completed", "cancelled"], default: "in_progress" },
  createdByDoctorId: { type: mongoose.Schema.Types.ObjectId, ref: "DoctorProfile", required: true },
}, { timestamps: true });

const prescriptionSchema = new mongoose.Schema({
  clinicId: { type: mongoose.Schema.Types.ObjectId, ref: "Clinic", required: true },
  prescriptionCode: { type: String, required: true },
  consultationId: { type: mongoose.Schema.Types.ObjectId, ref: "Consultation", required: true },
  appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Appointment", required: true },
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: "DoctorProfile", required: true },
  medicines: [{
    medicineName: String,
    dosage: String,
    frequency: String,
    durationValue: Number,
    durationUnit: String,
    foodTiming: String,
    route: String,
    instructions: String
  }],
  status: { type: String, enum: ["draft", "finalized", "cancelled"], default: "draft" },
  createdByDoctorId: { type: mongoose.Schema.Types.ObjectId, ref: "DoctorProfile", required: true },
}, { timestamps: true });

// Register Models
const User = mongoose.models.User || mongoose.model("User", userSchema);
const Clinic = mongoose.models.Clinic || mongoose.model("Clinic", clinicSchema);
const DoctorProfile = mongoose.models.DoctorProfile || mongoose.model("DoctorProfile", doctorProfileSchema);
const PatientProfile = mongoose.models.PatientProfile || mongoose.model("PatientProfile", patientProfileSchema);
const Appointment = mongoose.models.Appointment || mongoose.model("Appointment", appointmentSchema);
const Consultation = mongoose.models.Consultation || mongoose.model("Consultation", consultationSchema);
const Prescription = mongoose.models.Prescription || mongoose.model("Prescription", prescriptionSchema);

// 3. Constants & Generators
const CITIES = [
  { 
    city: "Patna", state: "Bihar", area: "Kankarbagh", address: "Plot 42, Kankarbagh Main Road",
    logoUrl: "https://images.unsplash.com/photo-1629909613654-28e377c37b09?q=80&w=400&auto=format&fit=crop",
    coverImageUrl: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=1200&auto=format&fit=crop"
  },
  { 
    city: "Ranchi", state: "Jharkhand", area: "Lalpur", address: "Circular Road, Lalpur",
    logoUrl: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=400&auto=format&fit=crop",
    coverImageUrl: "https://images.unsplash.com/photo-1581056771107-24ca5f033842?q=80&w=1200&auto=format&fit=crop"
  },
  { 
    city: "Kolkata", state: "West Bengal", area: "Salt Lake", address: "Sector V, Salt Lake City",
    logoUrl: "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?q=80&w=400&auto=format&fit=crop",
    coverImageUrl: "https://images.unsplash.com/photo-1538108149393-fbbd81895907?q=80&w=1200&auto=format&fit=crop"
  },
  { 
    city: "Lucknow", state: "Uttar Pradesh", area: "Gomti Nagar", address: "Vibhuti Khand, Gomti Nagar",
    logoUrl: "https://images.unsplash.com/photo-1512678080530-7760d81faba6?q=80&w=400&auto=format&fit=crop",
    coverImageUrl: "https://images.unsplash.com/photo-1516549655169-df83a0774514?q=80&w=1200&auto=format&fit=crop"
  },
  { 
    city: "Pune", state: "Maharashtra", area: "Kothrud", address: "Karve Road, Kothrud",
    logoUrl: "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?q=80&w=400&auto=format&fit=crop",
    coverImageUrl: "https://images.unsplash.com/photo-1551076805-e1869033e561?q=80&w=1200&auto=format&fit=crop"
  }
];

const SPECIALTIES = ["General Physician", "Cardiologist", "Gynecologist", "Pediatrician", "Orthopedic"];

const FIRST_NAMES_MALE = ["Amit", "Rahul", "Sandeep", "Rohit", "Manish", "Sunil", "Vijay", "Ramesh", "Sanjay", "Suresh"];
const FIRST_NAMES_FEMALE = ["Priya", "Neha", "Pooja", "Anjali", "Sneha", "Riya", "Swati", "Kavita", "Kiran", "Rekha"];
const LAST_NAMES = ["Sharma", "Singh", "Kumar", "Gupta", "Patel", "Verma", "Das", "Reddy", "Mishra", "Yadav", "Chauhan"];

function getRandomName(gender) {
  const fns = gender === "male" ? FIRST_NAMES_MALE : FIRST_NAMES_FEMALE;
  const first = fns[Math.floor(Math.random() * fns.length)];
  const last = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
  return `${first} ${last}`;
}

function getRandomPhone() {
  return `+91 ${Math.floor(6000000000 + Math.random() * 3999999999)}`;
}

function getRandomFee() {
  return Math.floor(Math.random() * 12 + 3) * 100; // 300 to 1500
}

async function clearDatabase() {
  console.log("Clearing existing seeded demo data...");
  await User.deleteMany({ email: { $regex: "@demo.com$" } });
  await Clinic.deleteMany({ name: { $regex: " Demo Clinic$" } });
  await DoctorProfile.deleteMany({ consultationFee: { $exists: true } }); // Wipe all to ensure clean demo state
  await PatientProfile.deleteMany({});
  await Appointment.deleteMany({});
  await Consultation.deleteMany({});
  await Prescription.deleteMany({});
}

async function seed() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("Connected successfully!");

    await clearDatabase();
    
    const hashedPassword = await bcrypt.hash("Password123!", 10);
    
    let stats = {
      clinics: 0,
      owners: 0,
      doctors: 0,
      patients: 0,
      appointments: 0,
      consultations: 0,
      prescriptions: 0
    };

    let sampleOwner = null;
    let sampleDoctor = null;
    let samplePatient = null;

    // Iterate over cities 3 times to create 15 clinics total
    for (let i = 0; i < 3; i++) {
      for (const location of CITIES) {
        // Create Owner
        const ownerEmail = `owner.${location.city.toLowerCase()}${i === 0 ? '' : i}@demo.com`;
      const owner = await User.create({
        name: `${location.city} Owner`,
        email: ownerEmail,
        phone: getRandomPhone(),
        password: hashedPassword,
        role: "clinic_owner",
        onboardingCompleted: true
      });
      stats.owners++;
      if (!sampleOwner) sampleOwner = ownerEmail;

        // Create Clinic
        const clinicName = `${location.city} Demo Clinic${i === 0 ? '' : ` ${i + 1}`}`;
        const clinic = await Clinic.create({
        name: clinicName,
        ownerId: owner._id,
        phone: getRandomPhone(),
        address: {
          line1: location.address,
          area: location.area,
          city: location.city,
          state: location.state,
          pincode: "123456",
          country: "India"
        },
        logoUrl: location.logoUrl,
        coverImageUrl: location.coverImageUrl,
        isPublic: true,
        specialties: SPECIALTIES,
        facilities: ["Pharmacy", "Lab", "X-Ray"],
        onboardingCompleted: true,
      });
      stats.clinics++;
      console.log(`Created Clinic: ${clinicName}`);

      // Create 5 Doctors for this Clinic
      for (const specialty of SPECIALTIES) {
        const docGender = Math.random() > 0.5 ? "male" : "female";
        const docName = `Dr. ${getRandomName(docGender)}`;
        const docEmail = `dr.${docName.split(" ")[1].toLowerCase()}.${location.city.toLowerCase()}.${Math.floor(Math.random() * 10000)}@demo.com`;
        
        const docUser = await User.create({
          name: docName,
          email: docEmail,
          phone: getRandomPhone(),
          password: hashedPassword,
          role: "doctor",
          onboardingCompleted: true
        });
        
        const docProfile = await DoctorProfile.create({
          userId: docUser._id,
          clinicId: clinic._id,
          employeeId: `DOC-${Math.floor(1000 + Math.random() * 9000)}-${Date.now().toString().slice(-4)}`,
          profileImageUrl: docGender === "male" 
            ? "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=400&auto=format&fit=crop"
            : "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=400&auto=format&fit=crop",
          specialization: specialty,
          qualification: ["MBBS", "MD"],
          experienceYears: Math.floor(Math.random() * 20) + 2,
          consultationFee: getRandomFee(),
          availableDays: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday"],
          startTime: "09:00",
          endTime: "17:00",
          slotDuration: 30,
          isAvailable: true,
          isPublic: true,
          isActive: true,
        });
        stats.doctors++;
        if (!sampleDoctor) sampleDoctor = docEmail;

        // Create 5 Patients for this Doctor
        for (let i = 0; i < 5; i++) {
          const patGender = Math.random() > 0.5 ? "male" : "female";
          const patName = getRandomName(patGender);
          const patEmail = `pat.${patName.replace(" ", ".").toLowerCase()}.${Math.floor(Math.random() * 100000)}@demo.com`;
          
          const patUser = await User.create({
            name: patName,
            email: patEmail,
            phone: getRandomPhone(),
            password: hashedPassword,
            role: "patient",
            onboardingCompleted: true
          });

          const patProfile = await PatientProfile.create({
            userId: patUser._id,
            profileImageUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${patName.replace(" ", "")}`,
            gender: patGender,
            bloodGroup: ["O+", "A+", "B+", "AB+"][Math.floor(Math.random() * 4)],
            age: Math.floor(Math.random() * 50) + 10,
            address: { line1: "Test St", city: location.city, state: location.state },
            emergencyContact: { name: "Family Member", phone: getRandomPhone() },
            clinics: [clinic._id]
          });
          stats.patients++;
          if (!samplePatient) samplePatient = patEmail;

          // Create Appointment
          const statuses = ["scheduled", "checked_in", "completed"];
          const apptStatus = statuses[Math.floor(Math.random() * statuses.length)];
          const apptDate = new Date();
          apptDate.setDate(apptDate.getDate() - Math.floor(Math.random() * 7)); // past week
          
          const appointment = await Appointment.create({
            clinicId: clinic._id,
            appointmentCode: `APT-${Math.floor(10000 + Math.random() * 90000)}`,
            patientId: patUser._id,
            doctorId: docProfile._id,
            appointmentDate: apptDate,
            startTime: "10:00",
            status: apptStatus
          });
          stats.appointments++;

          // Create Consultation & Prescription ONLY if completed
          if (apptStatus === "completed") {
            const consultation = await Consultation.create({
              clinicId: clinic._id,
              consultationCode: `CON-${Math.floor(10000 + Math.random() * 90000)}`,
              appointmentId: appointment._id,
              patientId: patUser._id,
              doctorId: docProfile._id,
              chiefComplaints: [{ complaint: "Fever and cough", duration: "3 days", notes: "Mild" }],
              diagnoses: ["Viral Infection"],
              privateDoctorNotes: "Patient recovering well.",
              status: "completed",
              createdByDoctorId: docProfile._id
            });
            stats.consultations++;

            await Prescription.create({
              clinicId: clinic._id,
              prescriptionCode: `RX-${Math.floor(10000 + Math.random() * 90000)}`,
              consultationId: consultation._id,
              appointmentId: appointment._id,
              patientId: patUser._id,
              doctorId: docProfile._id,
              medicines: [{
                medicineName: "Paracetamol 500mg",
                dosage: "1 tablet",
                frequency: "Twice a day",
                durationValue: 3,
                durationUnit: "days",
                foodTiming: "after_food",
                route: "oral",
                instructions: "Take after meals"
              }],
              status: "finalized",
              createdByDoctorId: docProfile._id
            });
            stats.prescriptions++;
          }
        }
      }
      }
    }

    console.log(`
==================================================
SEED COMPLETED SUCCESSFULLY
==================================================`);
    console.log(`Clinics created: ${stats.clinics}`);
    console.log(`Clinic Owners created: ${stats.owners}`);
    console.log(`Doctors created: ${stats.doctors}`);
    console.log(`Patients created: ${stats.patients}`);
    console.log(`Appointments created: ${stats.appointments}`);
    console.log(`Consultations created: ${stats.consultations}`);
    console.log(`Prescriptions created: ${stats.prescriptions}`);
    console.log("==================================\n");
    console.log("SAMPLE LOGIN ACCOUNTS (Password: Password123!)");
    console.log(`Clinic Owner : ${sampleOwner}`);
    console.log(`Doctor       : ${sampleDoctor}`);
    console.log(`Patient      : ${samplePatient}`);
    console.log("==================================\n");

    process.exit(0);

  } catch (error) {
    console.error("Error seeding data:", error);
    process.exit(1);
  }
}

seed();

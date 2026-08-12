import { NextResponse } from "next/server";
import { connectDB } from "@/backend/database/connectDB";
import Clinic from "@/backend/models/Clinic";
import DoctorProfile from "@/backend/models/DoctorProfile";
import User from "@/backend/models/User";
import ClinicSettings from "@/backend/models/ClinicSettings";
import bcrypt from "bcryptjs";

export async function GET() {
  try {
    await connectDB();

    // 1. Get or create a default owner user for seed clinics
    let owner = await User.findOne({ email: "patna.owner@clinora.com" });
    if (!owner) {
      const hashedPassword = await bcrypt.hash("Password123!", 10);
      owner = await User.create({
        name: "Patna Clinic Admin",
        email: "patna.owner@clinora.com",
        password: hashedPassword,
        role: "clinic_owner",
        onboardingCompleted: true,
      });
    }

    const patnaClinics = [
      {
        name: "Clinora Care Patna - Kankarbagh",
        area: "Kankarbagh",
        address: "Plot 42, Kankarbagh Main Road",
        phone: "+91 612 234 5671",
        coverImage: "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?q=80&w=800&auto=format&fit=crop",
        logo: "https://images.unsplash.com/photo-1629909613654-28e377c37b09?q=80&w=200&auto=format&fit=crop",
        specialties: ["General Medicine", "Pediatrics", "Dermatology", "Gynecology"],
        facilities: ["Digital Prescriptions", "AC Waiting Area", "Pharmacy", "Pathology Lab"],
        about: "Premier multispeciality clinic in Kankarbagh providing comprehensive patient care with top specialists."
      },
      {
        name: "City Health Clinic - Boring Road",
        area: "Boring Road",
        address: "Opposite Women's College, Boring Road",
        phone: "+91 612 234 5672",
        coverImage: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=800&auto=format&fit=crop",
        logo: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=200&auto=format&fit=crop",
        specialties: ["Cardiology", "Orthopedics", "ENT", "General Medicine"],
        facilities: ["ECG & Diagnostic", "Wheelchair Access", "AC Waiting Area", "Online Booking"],
        about: "Leading healthcare center located in the heart of Boring Road, equipped with modern diagnostics."
      },
      {
        name: "Patna Heart & Diabetes Center - Rajendra Nagar",
        area: "Rajendra Nagar",
        address: "Road No. 3, Rajendra Nagar",
        phone: "+91 612 234 5673",
        coverImage: "https://images.unsplash.com/photo-1516549655169-df83a0774514?q=80&w=800&auto=format&fit=crop",
        logo: "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?q=80&w=200&auto=format&fit=crop",
        specialties: ["Cardiology", "General Medicine"],
        facilities: ["Pathology Lab", "ECG", "Diabetes Counseling", "Pharmacy"],
        about: "Specialized cardiac and diabetic care clinic delivering expert management for chronic diseases."
      },
      {
        name: "Green Life Clinic - Bailey Road",
        area: "Bailey Road",
        address: "Near Saguna More, Bailey Road",
        phone: "+91 612 234 5674",
        coverImage: "https://images.unsplash.com/photo-1538108149393-fbbd81895907?q=80&w=800&auto=format&fit=crop",
        logo: "https://images.unsplash.com/photo-1512678080530-7760d81faba6?q=80&w=200&auto=format&fit=crop",
        specialties: ["Pediatrics", "Gynecology", "Dentistry", "Dermatology"],
        facilities: ["Dental X-Ray", "AC Waiting Area", "Digital Prescriptions", "Parking"],
        about: "Family-focused clinic offering compassionate maternal, pediatric, and dental services."
      },
      {
        name: "Sunrise Multispeciality Clinic - Danapur",
        area: "Danapur",
        address: "Main Cantonment Road, Danapur",
        phone: "+91 612 234 5675",
        coverImage: "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?q=80&w=800&auto=format&fit=crop",
        logo: "https://images.unsplash.com/photo-1629909613654-28e377c37b09?q=80&w=200&auto=format&fit=crop",
        specialties: ["Orthopedics", "General Medicine", "ENT"],
        facilities: ["X-Ray & Physiotherapy", "Parking", "Wheelchair Access"],
        about: "Comprehensive healthcare and orthopedic trauma management in Danapur."
      },
      {
        name: "Metro Family Clinic - Ashok Rajpath",
        area: "Ashok Rajpath",
        address: "Near PMCH, Ashok Rajpath",
        phone: "+91 612 234 5676",
        coverImage: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=800&auto=format&fit=crop",
        logo: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=200&auto=format&fit=crop",
        specialties: ["General Medicine", "Pediatrics", "ENT"],
        facilities: ["Pharmacy", "Digital Prescriptions", "AC Waiting Area"],
        about: "Trusted family physicians and child healthcare specialists on Ashok Rajpath."
      },
      {
        name: "Aarogya Plus Clinic - Patliputra",
        area: "Patliputra Colony",
        address: "B/14, Patliputra Industrial Area",
        phone: "+91 612 234 5677",
        coverImage: "https://images.unsplash.com/photo-1516549655169-df83a0774514?q=80&w=800&auto=format&fit=crop",
        logo: "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?q=80&w=200&auto=format&fit=crop",
        specialties: ["Dermatology", "Dentistry", "Gynecology"],
        facilities: ["Laser Clinic", "Dental Studio", "AC Waiting Area", "Parking"],
        about: "Modern aesthetic, skin, and advanced dental clinic in Patliputra Colony."
      },
      {
        name: "Hope Care Clinic - Gardanibagh",
        area: "Gardanibagh",
        address: "Block B, Gardanibagh",
        phone: "+91 612 234 5678",
        coverImage: "https://images.unsplash.com/photo-1538108149393-fbbd81895907?q=80&w=800&auto=format&fit=crop",
        logo: "https://images.unsplash.com/photo-1512678080530-7760d81faba6?q=80&w=200&auto=format&fit=crop",
        specialties: ["General Medicine", "Orthopedics"],
        facilities: ["Pathology Lab", "Pharmacy", "Wheelchair Access"],
        about: "Affordable and accessible community medical consultations in Gardanibagh."
      },
      {
        name: "WellCare Clinic - Mithapur",
        area: "Mithapur",
        address: "Near Bus Stand Road, Mithapur",
        phone: "+91 612 234 5679",
        coverImage: "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?q=80&w=800&auto=format&fit=crop",
        logo: "https://images.unsplash.com/photo-1629909613654-28e377c37b09?q=80&w=200&auto=format&fit=crop",
        specialties: ["Cardiology", "General Medicine", "Pediatrics"],
        facilities: ["ECG", "Digital Prescriptions", "AC Waiting Area"],
        about: "WellCare Clinic brings senior medical advice and preventive health checkups to Mithapur."
      },
      {
        name: "Medistar Clinic - Kurji",
        area: "Kurji",
        address: "Kurji Holy Family Road",
        phone: "+91 612 234 5680",
        coverImage: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=800&auto=format&fit=crop",
        logo: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=200&auto=format&fit=crop",
        specialties: ["Gynecology", "Pediatrics", "Dentistry", "Dermatology"],
        facilities: ["UltraSound", "Pharmacy", "Dental X-Ray", "Parking"],
        about: "State-of-the-art diagnostic and clinical consultation center in Kurji."
      }
    ];

    const doctorTemplates = [
      { name: "Dr. Rohit Kumar", specialization: "General Physician", fee: 500, exp: 12, start: "09:00", end: "13:00", bStart: null, bEnd: null },
      { name: "Dr. Priya Sharma", specialization: "Gynecologist", fee: 800, exp: 15, start: "10:00", end: "17:00", bStart: "13:00", bEnd: "14:00" },
      { name: "Dr. Amit Raj", specialization: "Cardiologist", fee: 1000, exp: 18, start: "16:00", end: "20:00", bStart: "18:00", bEnd: "18:30" },
      { name: "Dr. Neha Singh", specialization: "Dermatologist", fee: 700, exp: 8, start: "11:00", end: "16:00", bStart: null, bEnd: null },
      { name: "Dr. Sandeep Verma", specialization: "Orthopedic", fee: 900, exp: 14, start: "09:00", end: "17:00", bStart: "13:00", bEnd: "14:00" },
      { name: "Dr. Pooja Kumari", specialization: "Pediatrician", fee: 600, exp: 10, start: "09:30", end: "14:00", bStart: null, bEnd: null },
      { name: "Dr. Arvind Kumar", specialization: "Dentist", fee: 400, exp: 7, start: "10:00", end: "18:00", bStart: "13:30", bEnd: "14:30" },
      { name: "Dr. Ritu Sinha", specialization: "ENT", fee: 650, exp: 9, start: "15:00", end: "19:00", bStart: null, bEnd: null }
    ];

    let clinicsCreated = 0;
    let doctorsCreated = 0;

    for (const cData of patnaClinics) {
      let clinic = await Clinic.findOne({ name: cData.name });
      
      if (!clinic) {
        clinic = await Clinic.create({
          name: cData.name,
          ownerId: owner._id,
          phone: cData.phone,
          address: {
            line1: cData.address,
            area: cData.area,
            city: "Patna",
            state: "Bihar",
            pincode: "800001",
            country: "India"
          },
          logo: cData.logo,
          isPublic: true,
          about: cData.about,
          specialties: cData.specialties,
          facilities: cData.facilities,
          onboardingCompleted: true,
          isActive: true
        });

        // Also add ClinicSettings for working hours
        await ClinicSettings.create({
          clinicId: clinic._id,
          workingHours: [
            { day: "monday", isOpen: true, openTime: "09:00", closeTime: "20:00" },
            { day: "tuesday", isOpen: true, openTime: "09:00", closeTime: "20:00" },
            { day: "wednesday", isOpen: true, openTime: "09:00", closeTime: "20:00" },
            { day: "thursday", isOpen: true, openTime: "09:00", closeTime: "20:00" },
            { day: "friday", isOpen: true, openTime: "09:00", closeTime: "20:00" },
            { day: "saturday", isOpen: true, openTime: "09:00", closeTime: "20:00" },
            { day: "sunday", isOpen: false, openTime: "09:00", closeTime: "13:00" }
          ]
        });

        clinicsCreated++;
      }

      // Pick 3-4 doctors matching clinic specialties
      const matchedDoctors = doctorTemplates.filter(d => cData.specialties.includes(d.specialization));
      const doctorsToSeed = matchedDoctors.length >= 3 ? matchedDoctors : doctorTemplates.slice(0, 4);

      for (const dData of doctorsToSeed) {
        // Check if doctor profile already exists for this clinic
        const existingProfile = await DoctorProfile.findOne({
          clinicId: clinic._id,
          specialization: dData.specialization
        });

        if (!existingProfile) {
          const docEmail = `${dData.name.toLowerCase().replace(/[^a-z]/g, "")}.${clinic._id.toString().slice(-4)}@clinora.com`;
          
          let docUser = await User.findOne({ email: docEmail });
          if (!docUser) {
            const hashedPassword = await bcrypt.hash("Password123!", 10);
            docUser = await User.create({
              name: dData.name,
              email: docEmail,
              password: hashedPassword,
              role: "doctor",
              clinicId: clinic._id,
              onboardingCompleted: true
            });
          }

          const newDoctor = await DoctorProfile.create({
            clinicId: clinic._id,
            userId: docUser._id,
            employeeId: `DOC-${Math.floor(1000 + Math.random() * 9000)}`,
            specialization: dData.specialization,
            qualification: ["MBBS", "MD"],
            registrationNumber: `REG-BH-${Math.floor(10000 + Math.random() * 90000)}`,
            experienceYears: dData.exp,
            consultationFee: dData.fee,
            availableDays: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday"],
            startTime: dData.start,
            endTime: dData.end,
            slotDuration: 30,
            breakStart: dData.bStart,
            breakEnd: dData.bEnd,
            maxPatientsPerDay: 25,
            isAvailable: true,
            isAcceptingAppointments: true,
            isPublic: true,
            isActive: true,
            createdByUserId: owner._id
          });

          docUser.doctorId = newDoctor._id;
          await docUser.save();

          doctorsCreated++;
        }
      }
    }

    return NextResponse.json({
      success: true,
      clinicsCreated,
      doctorsCreated,
      message: `Seeded ${clinicsCreated} new clinics and ${doctorsCreated} new doctors in Patna, Bihar.`
    });

  } catch (error) {
    console.error("Error seeding Patna data:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to seed demo data" },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/backend/utils/getAuthenticatedUser";
import { connectDB } from "@/backend/database/connectDB";
import ClinicProfile from "@/backend/models/ClinicProfile";
import DoctorProfile from "@/backend/models/DoctorProfile";
import Appointment from "@/backend/models/Appointment";

export async function GET(request, { params }) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user || user.role !== "admin") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 });
    }

    const { id } = await params;

    await connectDB();

    const clinic = await ClinicProfile.findById(id).lean();
    if (!clinic) {
      return NextResponse.json({ success: false, message: "Clinic not found" }, { status: 404 });
    }

    const { default: ClinicProfile } = await import("@/backend/models/ClinicProfile");
    const profile = await ClinicProfile.findOne({ clinicId: id }).lean();

    clinic.ownerId = { name: clinic.name, email: clinic.email, phone: clinic.phone };
    if (profile) {
      clinic.address = profile.address;
      clinic.status = profile.status;
      clinic.logoUrl = profile.logoUrl;
      clinic.about = profile.about;
    }

    const [totalDoctors, totalAppointments] = await Promise.all([
      DoctorProfile.countDocuments({ clinicId: id }),
      Appointment.countDocuments({ clinicId: id })
    ]);

    const doctorsList = await DoctorProfile.find({ clinicId: id }).populate("doctorId", "name email phone").lean();

    const totalPatients = 0;
    const totalStaff = 0;
    const patientsList = [];
    const staffList = [];

    return NextResponse.json({
      success: true,
      clinic: {
        ...clinic,
        stats: {
          totalDoctors,
          totalPatients,
          totalStaff,
          totalAppointments
        },
        doctorsList,
        patientsList,
        staffList
      }
    });
  } catch (error) {
    console.error("Admin clinic details error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

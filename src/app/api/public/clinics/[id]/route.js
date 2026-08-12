import { NextResponse } from "next/server";
import { connectDB } from "@/backend/database/connectDB";
import Clinic from "@/backend/models/Clinic";
import ClinicSettings from "@/backend/models/ClinicSettings";
import DoctorProfile from "@/backend/models/DoctorProfile";
import User from "@/backend/models/User";

export async function GET(request, { params }) {
  try {
    await connectDB();
    const { id } = params;

    const clinic = await Clinic.findOne({ _id: id, isPublic: true, isActive: true }).lean();
    if (!clinic) {
      return NextResponse.json({ success: false, error: "Clinic not found or not public" }, { status: 404 });
    }

    const settings = await ClinicSettings.findOne({ clinicId: id }).lean();
    
    const doctorProfiles = await DoctorProfile.find({ clinicId: id, isPublic: true, isActive: true }).lean();
    
    // Attach user names to doctors
    const doctorUserIds = doctorProfiles.map(d => d.userId);
    const users = await User.find({ _id: { $in: doctorUserIds } }).select("name email").lean();
    const userMap = users.reduce((acc, user) => {
      acc[user._id.toString()] = user;
      return acc;
    }, {});

    const doctors = doctorProfiles.map(profile => ({
      ...profile,
      user: userMap[profile.userId.toString()]
    }));

    return NextResponse.json({
      success: true,
      data: {
        clinic,
        settings,
        doctors
      },
    });
  } catch (error) {
    console.error("Error fetching public clinic details:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

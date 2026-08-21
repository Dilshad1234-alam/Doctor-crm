import { NextResponse } from "next/server";
import { connectDB } from "@/backend/database/connectDB";
import ClinicProfile from "@/backend/models/ClinicProfile";
import ClinicSettings from "@/backend/models/ClinicSettings";
import DoctorProfile from "@/backend/models/DoctorProfile";
import User from "@/backend/models/User";

function slugify(text) {
  if (!text) return "";
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
}

export async function GET(request, { params }) {
  try {
    await connectDB();
    const unwrappedParams = await params;
    const id = unwrappedParams.id || unwrappedParams.slug;

    let clinicProfile = null;
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(id);
    if (isObjectId) {
      clinicProfile = await ClinicProfile.findOne({ _id: id, isPublic: true }).lean();
    }
    if (!clinicProfile) {
      clinicProfile = await ClinicProfile.findOne({ slug: id, isPublic: true }).lean();
    }

    if (!clinicProfile || clinicProfile.status !== "active") {
      return NextResponse.json({ success: false, error: "Clinic not found or not active" }, { status: 404 });
    }

    // Flatten clinic data for frontend compatibility
    const clinic = {
      _id: clinicProfile._id,
      name: clinicProfile.name,
      email: clinicProfile.email,
      phone: clinicProfile.phone,
      slug: clinicProfile.slug,
      logo: clinicProfile.logo,
      logoUrl: clinicProfile.logoUrl,
      coverImage: clinicProfile.coverImage,
      coverImageUrl: clinicProfile.coverImageUrl,
      address: clinicProfile.address,
      specialties: clinicProfile.specialties,
      facilities: clinicProfile.facilities,
      about: clinicProfile.about,
      consultationDuration: clinicProfile.consultationDuration,
      openingTime: clinicProfile.openingTime,
      closingTime: clinicProfile.closingTime
    };

    const settings = await ClinicSettings.findOne({ clinicId: clinic._id }).lean();
    
    const doctorProfiles = await DoctorProfile.find({ clinicId: clinic._id, isActive: true }).lean();
    
    // Attach user names to doctors
    const userIds = doctorProfiles.map(d => d.userId);
    const usersAcc = await User.find({ _id: { $in: userIds }, isActive: true }).select("name email phone").lean();
    const userMap = usersAcc.reduce((acc, user) => {
      acc[user._id.toString()] = user;
      return acc;
    }, {});

    const doctors = doctorProfiles.filter(profile => userMap[profile.userId.toString()]).map(profile => {
      const userData = userMap[profile.userId.toString()];
      return {
        ...profile,
        user: userData // Frontend expects `user.name`, so map it to `user`
      };
    });

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

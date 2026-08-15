import { NextResponse } from "next/server";
import { connectDB } from "@/backend/database/connectDB";
import ClinicProfile from "@/backend/models/ClinicProfile";
import ClinicSettings from "@/backend/models/ClinicSettings";
import DoctorProfile from "@/backend/models/DoctorProfile";
import Doctor from "@/backend/models/Doctor";

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
      clinicProfile = await ClinicProfile.findOne({ clinicId: id, isPublic: true }).populate("clinicId", "name email phone isActive").lean();
    }
    if (!clinicProfile) {
      clinicProfile = await ClinicProfile.findOne({ slug: id, isPublic: true }).populate("clinicId", "name email phone isActive").lean();
    }
    
    // If not found by slug directly, try to search all public clinics (slow path fallback)
    if (!clinicProfile) {
      const allPublic = await ClinicProfile.find({ isPublic: true }).populate("clinicId", "name email phone isActive").lean();
      clinicProfile = allPublic.find(p => p.clinicId?.name && slugify(p.clinicId.name) === id.toLowerCase());
    }

    if (!clinicProfile || !clinicProfile.clinicId || !clinicProfile.clinicId.isActive) {
      return NextResponse.json({ success: false, error: "Clinic not found or not public" }, { status: 404 });
    }

    // Flatten clinic data for frontend compatibility
    const clinic = {
      _id: clinicProfile.clinicId._id,
      name: clinicProfile.clinicId.name,
      email: clinicProfile.clinicId.email,
      phone: clinicProfile.clinicId.phone,
      slug: clinicProfile.slug || slugify(clinicProfile.clinicId.name),
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
    const doctorIds = doctorProfiles.map(d => d.doctorId);
    const doctorsAcc = await Doctor.find({ _id: { $in: doctorIds }, isActive: true }).select("name email phone").lean();
    const docMap = doctorsAcc.reduce((acc, doc) => {
      acc[doc._id.toString()] = doc;
      return acc;
    }, {});

    const doctors = doctorProfiles.filter(profile => docMap[profile.doctorId.toString()]).map(profile => {
      const docData = docMap[profile.doctorId.toString()];
      return {
        ...profile,
        user: docData // Frontend expects `user.name`, so map it to `user`
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

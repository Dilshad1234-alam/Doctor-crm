import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/backend/utils/getAuthenticatedUser";
import { connectDB } from "@/backend/database/connectDB";
import ClinicProfile from "@/backend/models/ClinicProfile";

export async function GET(request) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user || user.role !== "admin") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 });
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    const { default: ClinicProfile } = await import("@/backend/models/ClinicProfile");
    
    let profileQuery = {};
    if (status && status !== "all") {
      profileQuery.status = status;
    }
    
    if (search) {
      const matchingClinics = await ClinicProfile.find({ name: { $regex: search, $options: "i" } }).select('_id').lean();
      const clinicIds = matchingClinics.map(c => c._id);
      
      profileQuery.$or = [
        { clinicId: { $in: clinicIds } },
        { "address.city": { $regex: search, $options: "i" } }
      ];
    }

    const profiles = await ClinicProfile.find(profileQuery)
      .populate("clinicId", "name email phone")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await ClinicProfile.countDocuments(profileQuery);
    const pages = Math.ceil(total / limit);

    const clinics = profiles.map(p => {
       const clinicInfo = p.clinicId || {};
       return {
         _id: clinicInfo._id || p._id, // the frontend uses this _id to navigate to clinic details
         name: clinicInfo.name,
         email: clinicInfo.email,
         phone: clinicInfo.phone,
         ownerId: {
           name: clinicInfo.name,
           email: clinicInfo.email,
           phone: clinicInfo.phone
         },
         address: p.address,
         status: p.status,
         createdAt: p.createdAt
       };
    });

    return NextResponse.json({
      success: true,
      clinics,
      pagination: { total, pages, page, limit }
    });
  } catch (error) {
    console.error("Admin clinics error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

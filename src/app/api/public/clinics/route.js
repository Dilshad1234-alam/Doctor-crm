import { NextResponse } from "next/server";
import { connectDB } from "@/backend/database/connectDB";
import ClinicProfile from "@/backend/models/ClinicProfile";
import ClinicSettings from "@/backend/models/ClinicSettings";
import DoctorProfile from "@/backend/models/DoctorProfile";

export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const city = searchParams.get("city") || "";
    const state = searchParams.get("state") || "";
    const area = searchParams.get("area") || "";
    const specialty = searchParams.get("specialty") || "";
    const openNow = searchParams.get("openNow") === "true";
    const maxFee = searchParams.get("maxFee");

    const pipeline = [
      {
        $lookup: {
          from: "clinics",
          localField: "clinicId",
          foreignField: "_id",
          as: "clinic"
        }
      },
      { $unwind: "$clinic" },
      {
        $match: {
          "clinic.isActive": true,
        }
      }
    ];

    if (city) pipeline.push({ $match: { "address.city": { $regex: new RegExp(city, "i") } } });
    if (state) pipeline.push({ $match: { "address.state": { $regex: new RegExp(state, "i") } } });
    if (area) pipeline.push({ $match: { "address.area": { $regex: new RegExp(area, "i") } } });
    if (specialty) pipeline.push({ $match: { specialties: { $regex: new RegExp(`^${specialty}$`, "i") } } });

    if (search) {
      pipeline.push({
        $match: {
          $or: [
            { "clinic.name": { $regex: new RegExp(search, "i") } },
            { specialties: { $regex: new RegExp(search, "i") } },
            { "address.area": { $regex: new RegExp(search, "i") } },
          ]
        }
      });
    }

    const rawProfiles = await ClinicProfile.aggregate(pipeline);

    let clinics = rawProfiles.map(p => ({
      _id: p.clinicId,
      name: p.clinic.name,
      slug: p.slug || p.clinic.name.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w\-]+/g, '').replace(/\-\-+/g, '-'),
      logo: p.logo,
      logoUrl: p.logoUrl,
      coverImage: p.coverImage,
      coverImageUrl: p.coverImageUrl,
      address: p.address,
      specialties: p.specialties,
      about: p.about,
      consultationDuration: p.consultationDuration
    }));

    // Attach basic stats and filter by maxFee / openNow if needed
    const filteredClinics = [];
    
    const today = new Date();
    const currentDay = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"][today.getDay()];
    const currentHour = today.getHours();
    const currentMinute = today.getMinutes();
    const currentTimeStr = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;

    for (let clinic of clinics) {
      const doctors = await DoctorProfile.find({
        clinicId: clinic._id,
        isActive: true,
      }).lean();

      clinic.doctorsCount = doctors.length;
      
      const settings = await ClinicSettings.findOne({ clinicId: clinic._id }).select("workingHours").lean();
      clinic.workingHours = settings?.workingHours || [];
      
      let meetsFeeCriteria = true;
      let meetsOpenCriteria = true;

      if (maxFee && doctors.length > 0) {
        const lowestFee = Math.min(...doctors.map(d => d.consultationFee || Infinity));
        if (lowestFee > parseInt(maxFee)) {
          meetsFeeCriteria = false;
        }
      }

      if (openNow && clinic.workingHours.length > 0) {
        const todayHours = clinic.workingHours.find(wh => wh.day === currentDay);
        if (!todayHours || !todayHours.isOpen) {
          meetsOpenCriteria = false;
        } else {
          if (currentTimeStr < todayHours.openTime || currentTimeStr > todayHours.closeTime) {
            meetsOpenCriteria = false;
          }
        }
      }

      if (meetsFeeCriteria && meetsOpenCriteria) {
        filteredClinics.push(clinic);
      }
    }

    return NextResponse.json({
      success: true,
      data: filteredClinics,
    });
  } catch (error) {
    console.error("Error fetching public clinics:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

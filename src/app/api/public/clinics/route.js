import { NextResponse } from "next/server";
import { connectDB } from "@/backend/database/connectDB";
import Clinic from "@/backend/models/Clinic";
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

    const query = {
      isPublic: true,
      isActive: true,
    };

    if (city) query["address.city"] = { $regex: new RegExp(city, "i") };
    if (state) query["address.state"] = { $regex: new RegExp(state, "i") };
    if (area) query["address.area"] = { $regex: new RegExp(area, "i") };
    if (specialty) query.specialties = { $regex: new RegExp(`^${specialty}$`, "i") };

    if (search) {
      query.$or = [
        { name: { $regex: new RegExp(search, "i") } },
        { specialties: { $regex: new RegExp(search, "i") } },
        { "address.area": { $regex: new RegExp(search, "i") } },
      ];
    }

    let clinics = await Clinic.find(query)
      .select("name slug logo address specialties about consultationDuration")
      .lean();

    clinics = clinics.map(c => ({
      ...c,
      slug: c.slug || c.name.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w\-]+/g, '').replace(/\-\-+/g, '-')
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
        isPublic: true,
        isActive: true,
      }).lean();

      clinic.doctorsCount = doctors.length;
      
      const settings = await ClinicSettings.findOne({ clinicId: clinic._id }).select("workingHours").lean();
      clinic.workingHours = settings?.workingHours || [];
      
      let meetsFeeCriteria = true;
      let meetsOpenCriteria = true;

      // Check maxFee (if clinic has doctors, check if ANY doctor fee <= maxFee)
      if (maxFee && doctors.length > 0) {
        const lowestFee = Math.min(...doctors.map(d => d.consultationFee || Infinity));
        if (lowestFee > parseInt(maxFee)) {
          meetsFeeCriteria = false;
        }
      }

      // Check openNow
      if (openNow && clinic.workingHours.length > 0) {
        const todayHours = clinic.workingHours.find(wh => wh.day === currentDay);
        if (!todayHours || !todayHours.isOpen) {
          meetsOpenCriteria = false;
        } else {
          // Check if current time is within open and close time
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

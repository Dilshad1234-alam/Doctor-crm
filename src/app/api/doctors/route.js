import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/backend/utils/getAuthenticatedUser";
import { createDoctorForClinic, getDoctorsForClinic } from "@/backend/services/doctorService";
import { createDoctorSchema, doctorListQuerySchema } from "@/backend/validations/doctorValidation";

export async function POST(request) {
  try {
    const authUser = await getAuthenticatedUser();
    if (!authUser) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    
    const validatedData = createDoctorSchema.parse(body);
    const doctor = await createDoctorForClinic(authUser, validatedData);

    return NextResponse.json(
      { success: true, message: "Doctor created successfully", doctor },
      { status: 201 }
    );
  } catch (error) {
    if (error.name === "ZodError") {
      return NextResponse.json(
        { success: false, message: "Validation failed", errors: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { success: false, message: error.message || "Failed to create doctor" },
      { status: 400 }
    );
  }
}

export async function GET(request) {
  try {
    const authUser = await getAuthenticatedUser();
    if (!authUser) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const query = Object.fromEntries(searchParams.entries());
    const validatedQuery = doctorListQuerySchema.parse(query);

    const result = await getDoctorsForClinic(authUser, validatedQuery);

    return NextResponse.json({
      success: true,
      doctors: result.doctors,
      pagination: {
        page: result.page,
        limit: validatedQuery.limit,
        total: result.total,
        totalPages: result.totalPages,
      }
    });
  } catch (error) {
    if (error.name === "ZodError") {
      return NextResponse.json(
        { success: false, message: "Invalid query parameters" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, message: error.message || "Failed to fetch doctors" },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/backend/utils/getAuthenticatedUser";
import { getDoctorQueue } from "@/backend/services/queueService";
import { queueListQuerySchema } from "@/backend/validations/queueValidation";

export async function GET(request) {
  try {
    const authUser = await getAuthenticatedUser();
    if (!authUser) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    if (!authUser.doctorId) {
      return NextResponse.json({ success: false, message: "User is not associated with a doctor profile" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const query = Object.fromEntries(searchParams.entries());
    const validatedQuery = queueListQuerySchema.parse(query);

    const queue = await getDoctorQueue(authUser, authUser.doctorId, validatedQuery);

    return NextResponse.json({ success: true, queue });
  } catch (error) {
    if (error.name === "ZodError") {
      return NextResponse.json(
        { success: false, message: "Invalid query parameters" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, message: error.message || "Failed to fetch doctor queue" },
      { status: 400 }
    );
  }
}

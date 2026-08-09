import DoctorProfile from "@/backend/models/DoctorProfile";

export async function generateDoctorEmployeeId(clinicId) {
  try {
    // Find the doctor with the highest employee ID for this clinic
    const lastDoctor = await DoctorProfile.findOne({ clinicId })
      .sort({ employeeId: -1 })
      .select("employeeId");

    if (!lastDoctor || !lastDoctor.employeeId) {
      return "DOC-0001";
    }

    // Extract the number part of the ID (assuming format DOC-XXXX)
    const match = lastDoctor.employeeId.match(/^DOC-(\d+)$/);
    if (!match) {
      // Fallback if there's a malformed ID
      const count = await DoctorProfile.countDocuments({ clinicId });
      return `DOC-${(count + 1).toString().padStart(4, "0")}`;
    }

    const currentNumber = parseInt(match[1], 10);
    const nextNumber = currentNumber + 1;
    
    return `DOC-${nextNumber.toString().padStart(4, "0")}`;
  } catch (error) {
    console.error("Error generating doctor employee ID:", error);
    throw new Error("Failed to generate employee ID");
  }
}

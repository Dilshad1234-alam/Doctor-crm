import { writeFile, mkdir, unlink } from "fs/promises";
import path from "path";
import crypto from "crypto";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "medical-reports");

// Ensure the directory exists
const ensureDirectoryExists = async () => {
  try {
    await mkdir(UPLOAD_DIR, { recursive: true });
  } catch (err) {
    if (err.code !== "EEXIST") throw err;
  }
};

/**
 * Uploads a file to local storage.
 * In a real production app, swap this out for AWS S3, Cloudinary, etc.
 * @param {File} file - The file object from multipart form data.
 * @returns {Promise<string>} The public URL to the uploaded file.
 */
export async function uploadMedicalReport(file) {
  await ensureDirectoryExists();

  const buffer = Buffer.from(await file.arrayBuffer());
  
  // Generate a unique safe filename
  const uniqueId = crypto.randomBytes(8).toString("hex");
  const originalName = file.name || "report.unknown";
  const extension = path.extname(originalName).toLowerCase();
  
  // Allow only safe extensions
  const allowedExtensions = [".pdf", ".jpg", ".jpeg", ".png", ".webp"];
  if (!allowedExtensions.includes(extension)) {
    throw new Error(`Invalid file type. Allowed: ${allowedExtensions.join(", ")}`);
  }

  const safeFilename = `${uniqueId}-${Date.now()}${extension}`;
  const filePath = path.join(UPLOAD_DIR, safeFilename);

  await writeFile(filePath, buffer);

  // Return the public URL
  return `/uploads/medical-reports/${safeFilename}`;
}

export async function deleteMedicalReport(fileUrl) {
  try {
    // fileUrl looks like: /uploads/medical-reports/filename.pdf
    if (!fileUrl.startsWith("/uploads/medical-reports/")) return;

    const filename = fileUrl.split("/").pop();
    const filePath = path.join(UPLOAD_DIR, filename);

    await unlink(filePath);
  } catch (err) {
    console.error("Error deleting medical report file:", err);
    // We don't throw here to prevent blocking main database operations if cleanup fails
  }
}

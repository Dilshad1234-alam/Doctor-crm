const mongoose = require("mongoose");
const path = require("path");
const fs = require("fs");
const { pathToFileURL } = require("url");

const envPath = path.resolve(__dirname, "../.env.local");
if (fs.existsSync(envPath)) {
  const envConfig = fs.readFileSync(envPath, "utf-8");
  envConfig.split("\n").forEach((line) => {
    const match = line.match(/^([^#\s][^=]+)=(.*)$/);
    if (match) {
      process.env[match[1].trim()] = match[2].trim().replace(/(^"|"$)/g, "");
    }
  });
}

const MONGODB_URI = process.env.MONGODB_URI;

async function run() {
  await mongoose.connect(MONGODB_URI);
  console.log("Connected");

  const modelsPath = path.resolve(__dirname, "../src/backend/models");
  const fileUrl = pathToFileURL(path.join(modelsPath, "DoctorProfile.js")).href;
  const mod = await import(fileUrl);
  const DoctorProfile = mod.default || mod;

  // Good doctor portrait images from unsplash
  const doctorImages = [
    "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=200",
    "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=200",
    "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=200",
    "https://images.unsplash.com/photo-1594824436998-d446b9a896ce?auto=format&fit=crop&q=80&w=200",
    "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=200"
  ];

  const doctors = await DoctorProfile.find();
  for (let i = 0; i < doctors.length; i++) {
    const img = doctorImages[i % doctorImages.length];
    await DoctorProfile.updateOne({ _id: doctors[i]._id }, { $set: { profileImageUrl: img } });
  }
  
  console.log("Updated all doctor profile images");
  process.exit(0);
}

run().catch(console.error);

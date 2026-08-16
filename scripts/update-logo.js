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
  const fileUrl = pathToFileURL(path.join(modelsPath, "ClinicProfile.js")).href;
  const mod = await import(fileUrl);
  const ClinicProfile = mod.default || mod;

  // Good clinic logo image
  const logoUrl = "https://images.unsplash.com/photo-1538108149393-fbbd81895907?auto=format&fit=crop&q=80&w=400";
  
  await ClinicProfile.updateMany(
    { slug: "patna-demo" },
    { $set: { logoUrl: logoUrl } }
  );
  
  console.log("Updated Patna Care logoUrl");
  process.exit(0);
}

run().catch(console.error);

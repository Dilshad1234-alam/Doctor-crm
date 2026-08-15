const fs = require('fs');
const path = require('path');

const backendDir = path.join(__dirname, '..', 'src', 'backend');

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  // Replace nested populate for doctorId.userId -> doctorId
  // .populate({ path: "doctorId", select: "specialization title", populate: { path: "userId", select: "name" } })
  // becomes .populate("doctorId", "name") or if we want specialization we need to populate DoctorProfile separately...
  // Since DoctorProfile isn't directly referenced from Appointment, it's a bit harder to populate. 
  // Let's just replace the populate({ path: "doctorId", populate: { path: "userId", select: "name" } })
  // with .populate("doctorId", "name")
  const regex1 = /\.populate\(\{\s*path:\s*['"]doctorId['"]\s*,\s*populate:\s*\{\s*path:\s*['"]userId['"]\s*,\s*select:\s*['"]name['"]\s*\}\s*\}\)/g;
  if (regex1.test(content)) {
    content = content.replace(regex1, '.populate("doctorId", "name")');
    changed = true;
  }

  // Replace .populate({ path: "doctorId", select: "specialization title", populate: { path: "userId", select: "name" } })
  const regex1b = /\.populate\(\{\s*path:\s*['"]doctorId['"]\s*,\s*select:\s*['"]specialization title['"]\s*,\s*populate:\s*\{\s*path:\s*['"]userId['"]\s*,\s*select:\s*['"]name['"]\s*\}\s*\}\)/g;
  if (regex1b.test(content)) {
    content = content.replace(regex1b, '.populate("doctorId", "name")');
    changed = true;
  }

  // Replace populate: { path: "userId", select: "name" } inside other arrays
  const regex2 = /populate:\s*\{\s*path:\s*['"]userId['"]\s*,\s*select:\s*['"]name['"]\s*\}/g;
  if (regex2.test(content)) {
    // If it's inside an object like { path: "doctorId", populate: ... }
    // It's tricky to regex replace reliably without breaking json. 
    // Let's just use string replacement for specific known lines.
  }

  // Actually, let's just do a blanket regex:
  // replace: populate: { path: "userId", select: "name" }
  // with: select: "name"
  // Wait, if it's `{ path: "doctorId", populate: { path: "userId", select: "name" } }`, 
  // replacing the inner populate with `select: "name"` makes it `{ path: "doctorId", select: "name" }`. This is perfect!
  const regex3 = /populate:\s*\{\s*path:\s*['"]userId['"]\s*,\s*select:\s*['"]name['"]\s*\}/g;
  if (regex3.test(content)) {
    content = content.replace(regex3, 'select: "name"');
    changed = true;
  }

  // Replace `recordedByUserId` with `recordedById`
  if (content.includes('recordedByUserId')) {
    content = content.replace(/recordedByUserId/g, 'recordedById');
    changed = true;
  }

  // Replace `createdByUserId` with `createdById`
  if (content.includes('createdByUserId')) {
    content = content.replace(/createdByUserId/g, 'createdById');
    changed = true;
  }
  
  // Replace `uploadedByUserId` with `uploadedById`
  if (content.includes('uploadedByUserId')) {
    content = content.replace(/uploadedByUserId/g, 'uploadedById');
    changed = true;
  }

  // Replace `receivedByUserId` with `receivedById`
  if (content.includes('receivedByUserId')) {
    content = content.replace(/receivedByUserId/g, 'receivedById');
    changed = true;
  }

  // Replace `lastUpdatedByUserId` with `lastUpdatedById`
  if (content.includes('lastUpdatedByUserId')) {
    content = content.replace(/lastUpdatedByUserId/g, 'lastUpdatedById');
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${filePath}`);
  }
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walkDir(fullPath);
    } else if (fullPath.endsWith('.js')) {
      processFile(fullPath);
    }
  }
}

walkDir(backendDir);
console.log('Done!');

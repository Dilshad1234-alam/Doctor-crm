/**
 * Calculates age based on date of birth
 * @param {Date|string} dateOfBirth 
 * @returns {number|null} Age in years
 */
export function calculateAge(dateOfBirth) {
  if (!dateOfBirth) return null;

  const dob = new Date(dateOfBirth);
  if (isNaN(dob.getTime())) return null;

  const today = new Date();
  if (dob > today) {
    throw new Error("Date of birth cannot be in the future");
  }

  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age--;
  }

  // Enforce realistic bounds, minimum 0, max 130
  if (age < 0) return 0;
  if (age > 130) return 130;

  return age;
}

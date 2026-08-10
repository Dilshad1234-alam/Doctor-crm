import { createHistoryEvent } from "../repositories/patientHistoryRepository.js";

export async function logPatientHistoryEvent({ clinicId, patientId, type, title, description, userId, metadata = {} }) {
  return createHistoryEvent({
    clinicId,
    patientId,
    type,
    title,
    description,
    createdByUserId: userId,
    metadata
  });
}

export function detectMedicalProfileChanges(oldPatient, newPatientData) {
  const events = [];
  
  // Example for allergies
  const oldAllergies = oldPatient.allergies || [];
  const newAllergies = newPatientData.allergies || [];
  
  const addedAllergies = newAllergies.filter(a => !oldAllergies.includes(a));
  const removedAllergies = oldAllergies.filter(a => !newAllergies.includes(a));
  
  addedAllergies.forEach(allergy => {
    events.push({
      type: "allergy_added",
      title: "Allergy Added",
      description: `${allergy} was added to the patient's allergy list.`
    });
  });
  
  removedAllergies.forEach(allergy => {
    events.push({
      type: "allergy_removed",
      title: "Allergy Removed",
      description: `${allergy} was removed from the patient's allergy list.`
    });
  });
  
  // Chronic Conditions
  const oldConditions = oldPatient.chronicConditions || [];
  const newConditions = newPatientData.chronicConditions || [];
  
  const addedConditions = newConditions.filter(c => !oldConditions.includes(c));
  const removedConditions = oldConditions.filter(c => !newConditions.includes(c));
  
  addedConditions.forEach(c => {
    events.push({
      type: "condition_added",
      title: "Chronic Condition Added",
      description: `${c} was added to chronic conditions.`
    });
  });

  removedConditions.forEach(c => {
    events.push({
      type: "condition_removed",
      title: "Chronic Condition Removed",
      description: `${c} was removed from chronic conditions.`
    });
  });

  // Medicines
  const oldMeds = oldPatient.currentMedicines || [];
  const newMeds = newPatientData.currentMedicines || [];
  
  const addedMeds = newMeds.filter(m => !oldMeds.includes(m));
  const removedMeds = oldMeds.filter(m => !newMeds.includes(m));

  addedMeds.forEach(m => {
    events.push({
      type: "medicine_added",
      title: "Medicine Added",
      description: `${m} was added to current medicines.`
    });
  });

  removedMeds.forEach(m => {
    events.push({
      type: "medicine_removed",
      title: "Medicine Removed",
      description: `${m} was removed from current medicines.`
    });
  });

  // Notes
  if (newPatientData.notes !== undefined && newPatientData.notes !== oldPatient.notes) {
    events.push({
      type: "medical_note_updated",
      title: "Medical Note Updated",
      description: `Patient's medical notes were updated.`
    });
  }

  return events;
}

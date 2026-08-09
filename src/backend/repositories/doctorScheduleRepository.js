import DoctorScheduleException from "@/backend/models/DoctorScheduleException";

export async function createScheduleException(data) {
  return DoctorScheduleException.create(data);
}

export async function findScheduleExceptions(doctorId, clinicId, dateRange) {
  const filter = {
    doctorId,
    clinicId,
  };

  if (dateRange && (dateRange.startDate || dateRange.endDate)) {
    filter.date = {};
    if (dateRange.startDate) {
      filter.date.$gte = new Date(dateRange.startDate);
    }
    if (dateRange.endDate) {
      filter.date.$lte = new Date(dateRange.endDate);
    }
  }

  return DoctorScheduleException.find(filter).sort({ date: 1 });
}

export async function updateScheduleException(exceptionId, doctorId, clinicId, data) {
  return DoctorScheduleException.findOneAndUpdate(
    { _id: exceptionId, doctorId, clinicId },
    { $set: data },
    { new: true, runValidators: true }
  );
}

export async function deleteScheduleException(exceptionId, doctorId, clinicId) {
  return DoctorScheduleException.findOneAndDelete({
    _id: exceptionId,
    doctorId,
    clinicId,
  });
}

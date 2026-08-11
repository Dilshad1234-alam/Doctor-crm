import Counter from "../models/Counter.js";

export const generatePaymentCode = async (clinicId, session = null) => {
  const counterId = `payment_${clinicId}`;
  
  const options = { new: true, upsert: true };
  if (session) {
    options.session = session;
  }

  const counter = await Counter.findByIdAndUpdate(
    counterId,
    { $inc: { seq: 1 } },
    options
  );
  
  // Format: PAY-000001
  const sequenceStr = counter.seq.toString().padStart(6, "0");
  return `PAY-${sequenceStr}`;
};

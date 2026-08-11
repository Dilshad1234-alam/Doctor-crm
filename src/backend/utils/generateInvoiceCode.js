import Counter from "../models/Counter.js";

export const generateInvoiceCode = async (clinicId, session = null) => {
  const counterId = `invoice_${clinicId}`;
  
  const options = { new: true, upsert: true };
  if (session) {
    options.session = session;
  }

  const counter = await Counter.findByIdAndUpdate(
    counterId,
    { $inc: { seq: 1 } },
    options
  );
  
  // Format: INV-000001
  const sequenceStr = counter.seq.toString().padStart(6, "0");
  return `INV-${sequenceStr}`;
};

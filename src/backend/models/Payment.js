import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    clinicId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ClinicProfile",
      required: true,
    },
    paymentCode: {
      type: String,
      required: true,
      trim: true,
    },
    invoiceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Invoice",
      required: true,
    },
    serviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Service",
    },
    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Appointment",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0.01,
    },
    paymentMethod: {
      type: String,
      enum: ["cash", "upi", "card", "bank_transfer", "online", "other"],
      required: true,
    },
    status: {
      type: String,
      enum: ["success", "pending", "failed", "refunded"],
      default: "success",
      required: true,
    },
    transactionId: {
      type: String,
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
    },
    receivedById: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    receivedByModel: {
      type: String,
      enum: ["Admin", "Clinic"],
      required: true,
      default: "Clinic"
    },
    paidAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
paymentSchema.index({ clinicId: 1, paymentCode: 1 }, { unique: true });
paymentSchema.index({ clinicId: 1, invoiceId: 1 });


export default mongoose.models.Payment || mongoose.model("Payment", paymentSchema);

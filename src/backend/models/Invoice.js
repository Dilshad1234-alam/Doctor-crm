import mongoose from "mongoose";

const invoiceItemSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["consultation", "procedure", "test", "service", "other"],
    required: true,
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  unitPrice: {
    type: Number,
    required: true,
    min: 0,
  },
  amount: {
    type: Number,
    required: true,
    min: 0,
  },
}, { _id: false });

const invoiceSchema = new mongoose.Schema(
  {
    clinicId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Clinic",
      required: true,
    },
    invoiceCode: {
      type: String,
      required: true,
      trim: true,
    },
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DoctorProfile",
      required: true,
    },
    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Appointment",
      required: true,
    },
    consultationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Consultation",
    },
    items: {
      type: [invoiceItemSchema],
      default: [],
    },
    subtotal: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    discount: {
      type: {
        type: String,
        enum: ["none", "flat", "percentage"],
        default: "none",
      },
      value: { type: Number, default: 0, min: 0 },
      amount: { type: Number, default: 0, min: 0 },
      reason: { type: String, trim: true },
    },
    tax: {
      enabled: { type: Boolean, default: false },
      percentage: { type: Number, default: 0, min: 0 },
      amount: { type: Number, default: 0, min: 0 },
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    paidAmount: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    pendingAmount: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    status: {
      type: String,
      enum: ["draft", "unpaid", "partially_paid", "paid", "cancelled", "refunded"],
      default: "draft",
      required: true,
    },
    notes: {
      type: String,
      trim: true,
    },
    createdByUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    lastUpdatedByUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    issuedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
invoiceSchema.index({ clinicId: 1, invoiceCode: 1 }, { unique: true });
// One Appointment -> One Main Invoice constraint
invoiceSchema.index({ clinicId: 1, appointmentId: 1 }, { unique: true });
invoiceSchema.index({ clinicId: 1, patientId: 1, createdAt: -1 });

export default mongoose.models.Invoice || mongoose.model("Invoice", invoiceSchema);

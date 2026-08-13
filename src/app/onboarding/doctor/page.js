"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/frontend/context/AuthContext";
import Logo from "@/frontend/components/branding/Logo";
import {
  User, Phone, Mail, MapPin, Shield, Activity,
  ArrowRight, ArrowLeft, CheckCircle2, AlertCircle, X,
  Stethoscope, Briefcase, GraduationCap, Award,
  FileText, Upload, ImagePlus, UserCheck, ChevronRight,
  PenLine, FileCheck
} from "lucide-react";

/* ─── Constants ─────────────────────────────────────────── */
const STEPS = [
  { id: 1, label: "Personal Info",     icon: User },
  { id: 2, label: "Professional Info", icon: Briefcase },
  { id: 3, label: "Documents",         icon: FileText },
  { id: 4, label: "Review",            icon: CheckCircle2 },
];

const GENDER_OPTIONS = [
  { value: "male",           label: "Male" },
  { value: "female",         label: "Female" },
  { value: "other",          label: "Other" },
  { value: "prefer_not_to_say", label: "Prefer not to say" },
];

const SPECIALTY_OPTIONS = [
  "General Medicine", "Cardiology", "Neurology", "Orthopedics",
  "Pediatrics", "Ophthalmology", "Gynecology", "Dermatology", "ENT", "Psychiatry"
];

const INITIAL_DATA = {
  // Step 1
  fullName: "",
  dateOfBirth: "",
  gender: "",
  phone: "",
  email: "",
  // Step 2
  specialty: "",
  subSpecialty: "",
  experienceYears: "",
  consultationFee: "",
  qualification: "",
  registrationNumber: "",
  bio: "",
  // Step 3 (base64 strings)
  profilePhoto: "",
  medicalLicense: "",
  degreeCertificate: "",
  idProof: "",
  // Step 4
  confirmed: false,
};

/* ─── Helpers ────────────────────────────────────────────── */
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function validate(step, data) {
  const errors = {};
  if (step === 1) {
    if (!data.fullName.trim()) errors.fullName = "Full name is required";
    if (!data.dateOfBirth)     errors.dateOfBirth = "Date of birth is required";
    if (!data.gender)          errors.gender = "Please select a gender";
    if (!data.phone.trim())    errors.phone = "Phone number is required";
    else if (data.phone.replace(/\D/g, "").length < 10) errors.phone = "Enter a valid 10-digit number";
    if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) errors.email = "Enter a valid email";
  }
  if (step === 2) {
    if (!data.specialty)            errors.specialty = "Specialty is required";
    if (!data.experienceYears)      errors.experienceYears = "Experience is required";
    if (!data.consultationFee)      errors.consultationFee = "Consultation fee is required";
    if (!data.qualification.trim()) errors.qualification = "Qualification is required";
    if (!data.registrationNumber.trim()) errors.registrationNumber = "Registration number is required";
  }
  return errors;
}

/* ─── Shared Field Components ────────────────────────────── */
function FieldLabel({ children, required }) {
  return (
    <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">
      {children}
      {required && <span className="text-blue-500 ml-0.5">*</span>}
    </label>
  );
}

function InputField({ icon: Icon, error, className = "", ...props }) {
  return (
    <div className="relative">
      {Icon && (
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none z-10">
          <Icon size={15} className="text-slate-400" />
        </div>
      )}
      <input
        className={`w-full ${Icon ? "pl-10" : "pl-3.5"} pr-3.5 py-2.5 bg-slate-50 border rounded-xl text-sm font-medium text-slate-900 placeholder-slate-400
          focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all
          ${error ? "border-red-400 bg-red-50 focus:ring-red-300" : "border-slate-200 hover:border-slate-300"} ${className}`}
        {...props}
      />
      {error && (
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
          <AlertCircle size={14} className="text-red-400" />
        </div>
      )}
    </div>
  );
}

function SelectField({ icon: Icon, error, children, className = "", ...props }) {
  return (
    <div className="relative">
      {Icon && (
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none z-10">
          <Icon size={15} className="text-slate-400" />
        </div>
      )}
      <select
        className={`w-full ${Icon ? "pl-10" : "pl-3.5"} pr-9 py-2.5 bg-slate-50 border rounded-xl text-sm font-medium text-slate-900
          focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all appearance-none
          ${error ? "border-red-400 bg-red-50 focus:ring-red-300" : "border-slate-200 hover:border-slate-300"} ${className}`}
        {...props}
      >
        {children}
      </select>
      <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
        <ChevronRight size={13} className="text-slate-400 rotate-90" />
      </div>
    </div>
  );
}

function TextAreaField({ icon: Icon, error, className = "", ...props }) {
  return (
    <div className="relative">
      {Icon && (
        <div className="absolute top-3 left-0 pl-3.5 flex items-start pointer-events-none z-10">
          <Icon size={15} className="text-slate-400" />
        </div>
      )}
      <textarea
        rows={3}
        className={`w-full ${Icon ? "pl-10" : "pl-3.5"} pr-3.5 py-2.5 bg-slate-50 border rounded-xl text-sm font-medium text-slate-900 placeholder-slate-400
          focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all resize-none
          ${error ? "border-red-400 bg-red-50" : "border-slate-200 hover:border-slate-300"} ${className}`}
        {...props}
      />
    </div>
  );
}

function ErrorText({ error }) {
  if (!error) return null;
  return <p className="mt-1 text-xs text-red-500 font-semibold flex items-center gap-1"><AlertCircle size={11} />{error}</p>;
}

function DocumentUploader({ label, value, onChange, icon: Icon = Upload }) {
  const inputRef = useRef(null);
  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      {value ? (
        <div className="relative rounded-2xl overflow-hidden border-2 border-blue-300 bg-slate-100" style={{ height: 120 }}>
          {/* If it's an image, show it. Otherwise show a placeholder icon */}
          {value.startsWith('data:image') ? (
            <img src={value} alt={label} className="w-full h-full object-cover" />
          ) : (
             <div className="w-full h-full flex items-center justify-center text-blue-500 bg-blue-50">
               <FileCheck size={32} />
             </div>
          )}
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute top-2 right-2 w-7 h-7 bg-white rounded-full shadow flex items-center justify-center text-slate-600 hover:text-red-500 transition-colors"
          >
            <X size={14} />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="w-full border-2 border-dashed border-slate-300 hover:border-blue-400 hover:bg-blue-50 rounded-2xl flex flex-col items-center justify-center gap-2 py-6 text-slate-400 hover:text-blue-600 transition-all duration-200"
        >
          <Icon size={24} strokeWidth={1.5} />
          <span className="text-xs font-semibold">Click to upload</span>
          <span className="text-[10px]">JPG, PNG, PDF up to 2MB</span>
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*,application/pdf"
        className="hidden"
        onChange={async (e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          if (file.size > 2 * 1024 * 1024) { alert("File must be under 2MB"); return; }
          const b64 = await fileToBase64(file);
          onChange(b64);
        }}
      />
    </div>
  );
}

/* ─── Stepper ────────────────────────────────────────────── */
function StepperBar({ current }) {
  return (
    <div className="flex items-center w-full">
      {STEPS.map((step, idx) => {
        const done   = current > step.id;
        const active = current === step.id;
        const StepIcon = step.icon;
        return (
          <div key={step.id} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1.5">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-black border-2 transition-all duration-300 ${
                done   ? "bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-200"
                : active ? "bg-white border-blue-600 text-blue-700 shadow-md shadow-blue-100 ring-4 ring-blue-50"
                : "bg-white border-slate-200 text-slate-400"
              }`}>
                {done
                  ? <CheckCircle2 size={18} strokeWidth={2.5} />
                  : <StepIcon size={16} strokeWidth={2} />}
              </div>
              <span className={`text-[10px] font-bold whitespace-nowrap hidden sm:block tracking-wide ${
                active ? "text-blue-700" : done ? "text-blue-600" : "text-slate-400"
              }`}>{step.label}</span>
            </div>
            {idx < STEPS.length - 1 && (
              <div className="flex-1 mx-2 h-0.5 rounded-full overflow-hidden bg-slate-200 mb-4 sm:mb-0">
                <div className={`h-full rounded-full transition-all duration-700 ${done ? "bg-blue-600 w-full" : "w-0"}`} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ─── Illustration Panel ─────────────────────────────────── */
function IllustrationPanel({ step }) {
  const content = {
    1: {
      title: "Personal Details",
      desc: "Tell us a bit about yourself to set up your professional profile.",
      color: "from-blue-500 to-blue-700",
      icon: <User size={48} strokeWidth={1.5} className="text-white/90" />,
      badge: "Step 1 of 4",
    },
    2: {
      title: "Professional Expertise",
      desc: "Highlight your qualifications and medical experience.",
      color: "from-indigo-500 to-indigo-700",
      icon: <Stethoscope size={48} strokeWidth={1.5} className="text-white/90" />,
      badge: "Step 2 of 4",
    },
    3: {
      title: "Verification Documents",
      desc: "Upload necessary documents to verify your credentials.",
      color: "from-violet-500 to-violet-700",
      icon: <FileText size={48} strokeWidth={1.5} className="text-white/90" />,
      badge: "Step 3 of 4",
    },
    4: {
      title: "Almost There!",
      desc: "Review your information before completing your profile.",
      color: "from-emerald-500 to-teal-700",
      icon: <CheckCircle2 size={48} strokeWidth={1.5} className="text-white/90" />,
      badge: "Final Step",
    },
  };
  const c = content[step];
  return (
    <div className={`hidden lg:flex flex-col justify-between bg-gradient-to-br ${c.color} rounded-2xl p-8 text-white relative overflow-hidden min-h-[520px] transition-colors duration-500`}>
      {/* Decorative circles */}
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full" />
      <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-white/10 rounded-full" />
      <div className="absolute top-1/2 right-0 w-24 h-24 bg-white/5 rounded-full" />

      <div className="relative z-10">
        <span className="inline-block text-xs font-bold bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full mb-6 tracking-wide">
          {c.badge}
        </span>
        <div className="w-20 h-20 bg-white/20 rounded-3xl flex items-center justify-center mb-6">
          {c.icon}
        </div>
        <h3 className="text-2xl font-black mb-3 leading-tight">{c.title}</h3>
        <p className="text-white/80 text-sm leading-relaxed font-medium">{c.desc}</p>
      </div>

      {/* Info Card */}
      <div className="relative z-10 bg-white/15 backdrop-blur-sm border border-white/20 rounded-2xl p-5 mt-6">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center shrink-0 mt-0.5">
            <Shield size={17} className="text-white" />
          </div>
          <div>
            <p className="font-bold text-sm mb-1">Join Our Healthcare Network</p>
            <p className="text-white/75 text-xs leading-relaxed font-medium">
              Your details will help patients find and connect with you easily.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Step Panels ────────────────────────────────────────── */
function Step1Panel({ data, errors, onChange }) {
  return (
    <div className="space-y-5">
      <div>
        <FieldLabel required>Full Name (as per ID)</FieldLabel>
        <InputField
          icon={User}
          name="fullName"
          value={data.fullName}
          onChange={onChange}
          placeholder="e.g. Dr. Rajesh Kumar"
          error={errors.fullName}
        />
        <ErrorText error={errors.fullName} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <FieldLabel required>Date of Birth</FieldLabel>
          <InputField
            icon={Activity}
            name="dateOfBirth"
            type="date"
            value={data.dateOfBirth}
            onChange={onChange}
            error={errors.dateOfBirth}
          />
          <ErrorText error={errors.dateOfBirth} />
        </div>
        <div>
          <FieldLabel required>Gender</FieldLabel>
          <SelectField
            icon={UserCheck}
            name="gender"
            value={data.gender}
            onChange={onChange}
            error={errors.gender}
          >
            <option value="">Select Gender</option>
            {GENDER_OPTIONS.map((g) => (
              <option key={g.value} value={g.value}>{g.label}</option>
            ))}
          </SelectField>
          <ErrorText error={errors.gender} />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <FieldLabel required>Phone Number</FieldLabel>
          <InputField
            icon={Phone}
            name="phone"
            type="tel"
            value={data.phone}
            onChange={onChange}
            placeholder="+91 98765 43210"
            error={errors.phone}
          />
          <ErrorText error={errors.phone} />
        </div>
        <div>
          <FieldLabel required>Email Address</FieldLabel>
          <InputField
            icon={Mail}
            name="email"
            type="email"
            value={data.email}
            onChange={onChange}
            placeholder="doctor@clinic.com"
            error={errors.email}
          />
          <ErrorText error={errors.email} />
        </div>
      </div>
    </div>
  );
}

function Step2Panel({ data, errors, onChange }) {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <FieldLabel required>Specialty</FieldLabel>
          <SelectField
            icon={Stethoscope}
            name="specialty"
            value={data.specialty}
            onChange={onChange}
            error={errors.specialty}
          >
            <option value="">Select Specialty</option>
            {SPECIALTY_OPTIONS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </SelectField>
          <ErrorText error={errors.specialty} />
        </div>
        <div>
          <FieldLabel>Sub-specialty</FieldLabel>
          <InputField
            icon={Award}
            name="subSpecialty"
            value={data.subSpecialty}
            onChange={onChange}
            placeholder="e.g. Interventional Cardiology"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <FieldLabel required>Experience (Years)</FieldLabel>
          <InputField
            icon={Activity}
            name="experienceYears"
            type="number"
            min="0"
            value={data.experienceYears}
            onChange={onChange}
            placeholder="e.g. 10"
            error={errors.experienceYears}
          />
          <ErrorText error={errors.experienceYears} />
        </div>
        <div>
          <FieldLabel required>Consultation Fee (₹)</FieldLabel>
          <InputField
            icon={Briefcase}
            name="consultationFee"
            type="number"
            min="0"
            value={data.consultationFee}
            onChange={onChange}
            placeholder="e.g. 500"
            error={errors.consultationFee}
          />
          <ErrorText error={errors.consultationFee} />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <FieldLabel required>Qualification</FieldLabel>
          <InputField
            icon={GraduationCap}
            name="qualification"
            value={data.qualification}
            onChange={onChange}
            placeholder="e.g. MBBS, MD"
            error={errors.qualification}
          />
          <ErrorText error={errors.qualification} />
        </div>
        <div>
          <FieldLabel required>Registration Number</FieldLabel>
          <InputField
            icon={FileCheck}
            name="registrationNumber"
            value={data.registrationNumber}
            onChange={onChange}
            placeholder="e.g. MCI-12345"
            error={errors.registrationNumber}
          />
          <ErrorText error={errors.registrationNumber} />
        </div>
      </div>

      <div>
        <FieldLabel>Bio / About (Optional)</FieldLabel>
        <TextAreaField
          icon={UserCheck}
          name="bio"
          value={data.bio}
          onChange={onChange}
          placeholder="Brief professional summary for your patients..."
        />
      </div>
    </div>
  );
}

function Step3Panel({ data, onChange }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <DocumentUploader
          label="Profile Photo (Optional)"
          value={data.profilePhoto}
          onChange={(val) => onChange("profilePhoto", val)}
          icon={ImagePlus}
        />
        <DocumentUploader
          label="Medical License (Optional)"
          value={data.medicalLicense}
          onChange={(val) => onChange("medicalLicense", val)}
          icon={Shield}
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <DocumentUploader
          label="Degree Certificate (Optional)"
          value={data.degreeCertificate}
          onChange={(val) => onChange("degreeCertificate", val)}
          icon={GraduationCap}
        />
        <DocumentUploader
          label="ID Proof (Optional)"
          value={data.idProof}
          onChange={(val) => onChange("idProof", val)}
          icon={UserCheck}
        />
      </div>
    </div>
  );
}

function ReviewRow({ label, value, onEdit, step }) {
  return (
    <div className="flex items-start justify-between gap-3 py-2.5 border-b border-slate-100 last:border-0">
      <div className="min-w-0">
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">{label}</p>
        <p className="text-sm font-semibold text-slate-800 leading-snug break-words">
          {value || <span className="text-slate-300 italic">Not provided</span>}
        </p>
      </div>
      <button
        type="button"
        onClick={() => onEdit(step)}
        className="shrink-0 text-[11px] font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 mt-0.5 transition-colors"
      >
        <PenLine size={11} /> Edit
      </button>
    </div>
  );
}

function Step4Panel({ data, onEdit, confirmed, onConfirmChange }) {
  return (
    <div className="space-y-5">
      {/* Personal Info */}
      <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center">
            <User size={13} className="text-blue-600" />
          </div>
          <p className="text-xs font-black text-slate-700 uppercase tracking-wider">Personal Info</p>
        </div>
        <ReviewRow label="Full Name" value={data.fullName} onEdit={onEdit} step={1} />
        <ReviewRow label="Date of Birth" value={data.dateOfBirth} onEdit={onEdit} step={1} />
        <ReviewRow label="Gender" value={data.gender} onEdit={onEdit} step={1} />
        <ReviewRow label="Phone" value={data.phone} onEdit={onEdit} step={1} />
        <ReviewRow label="Email" value={data.email} onEdit={onEdit} step={1} />
      </div>

      {/* Professional Info */}
      <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-7 h-7 rounded-lg bg-indigo-100 flex items-center justify-center">
            <Briefcase size={13} className="text-indigo-600" />
          </div>
          <p className="text-xs font-black text-slate-700 uppercase tracking-wider">Professional Info</p>
        </div>
        <ReviewRow label="Specialty" value={data.specialty} onEdit={onEdit} step={2} />
        <ReviewRow label="Experience" value={`${data.experienceYears} Years`} onEdit={onEdit} step={2} />
        <ReviewRow label="Consultation Fee" value={`₹${data.consultationFee}`} onEdit={onEdit} step={2} />
        <ReviewRow label="Qualification" value={data.qualification} onEdit={onEdit} step={2} />
        <ReviewRow label="Registration No." value={data.registrationNumber} onEdit={onEdit} step={2} />
      </div>

      {/* Documents */}
      <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
        <div className="flex items-center justify-between mb-3">
           <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-violet-100 flex items-center justify-center">
              <FileText size={13} className="text-violet-600" />
            </div>
            <p className="text-xs font-black text-slate-700 uppercase tracking-wider">Documents</p>
           </div>
           <button
            type="button"
            onClick={() => onEdit(3)}
            className="shrink-0 text-[11px] font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors"
          >
            <PenLine size={11} /> Edit
          </button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {["profilePhoto", "medicalLicense", "degreeCertificate", "idProof"].map((doc) => (
                <div key={doc} className={`p-2 rounded-lg border text-center ${data[doc] ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-slate-200 bg-white text-slate-400"}`}>
                    <CheckCircle2 size={16} className={`mx-auto mb-1 ${data[doc] ? "" : "opacity-30"}`} />
                    <span className="text-[10px] font-bold block truncate">{doc.replace(/([A-Z])/g, ' $1').trim()}</span>
                </div>
            ))}
        </div>
      </div>

      {/* Confirm checkbox */}
      <label className="flex items-start gap-3 cursor-pointer group p-4 rounded-2xl border-2 border-blue-200 bg-blue-50/60 hover:bg-blue-50 transition-colors">
        <div className={`mt-0.5 w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all ${
          confirmed ? "border-blue-600 bg-blue-600" : "border-slate-300 bg-white group-hover:border-blue-400"
        }`}>
          {confirmed && <CheckCircle2 size={13} className="text-white" strokeWidth={3} />}
        </div>
        <input type="checkbox" className="sr-only" checked={confirmed} onChange={onConfirmChange} />
        <p className="text-sm font-semibold text-slate-700 leading-snug">
          I declare that the information provided is accurate and my documents are authentic.
        </p>
      </label>
    </div>
  );
}

/* ─── Animations ─────────────────────────────────────────── */
const slideVariants = {
  enter: (dir) => ({ x: dir > 0 ? 40 : -40, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir)  => ({ x: dir > 0 ? -40 : 40, opacity: 0 }),
};

/* ─── Main Page ──────────────────────────────────────────── */
export default function DoctorOnboardingPage() {
  const router = useRouter();
  const { user, loading: authLoading, refreshUser } = useAuth();

  const [step, setStep]       = useState(1);
  const [dir, setDir]         = useState(1); // 1 = forward, -1 = backward
  const [data, setData]       = useState(INITIAL_DATA);
  const [errors, setErrors]   = useState({});
  const [submitErr, setSubmitErr] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Pre-fill name and email from auth user
  useEffect(() => {
    if (user) {
      setData((prev) => ({
        ...prev,
        fullName: prev.fullName || user.name || "",
        email:    prev.email    || user.email || "",
      }));
    }
  }, [user]);

  // Auth guard
  useEffect(() => {
    if (!authLoading) {
      if (!user)                        router.push("/login");
      else if (user.role !== "doctor")  router.push("/dashboard");
      else if (user.onboardingCompleted) router.push("/dashboard");
    }
  }, [user, authLoading, router]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleDocChange = (name, value) => {
      setData(prev => ({ ...prev, [name]: value }));
  }

  const goNext = () => {
    const errs = validate(step, data);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setDir(1);
    setStep((s) => Math.min(s + 1, 4));
  };

  const goPrev = () => {
    setErrors({});
    setDir(-1);
    setStep((s) => Math.max(s - 1, 1));
  };

  const jumpTo = (s) => {
    setErrors({});
    setDir(s > step ? 1 : -1);
    setStep(s);
  };

  const handleSubmit = async () => {
    if (!data.confirmed) {
      setErrors({ confirmed: "Please confirm the declaration" });
      return;
    }
    setSubmitErr("");
    setSubmitting(true);

    try {
      const res = await fetch("/api/onboarding/doctor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Failed to complete profile");

      await refreshUser();
      router.push("/dashboard");
    } catch (err) {
      setSubmitErr(err.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  /* Loading state */
  if (authLoading || !user || user.role !== "doctor") {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-blue-100 border-t-blue-600 animate-spin" />
          <p className="text-sm font-semibold text-slate-400">Loading…</p>
        </div>
      </div>
    );
  }

  const stepMeta = {
    1: { title: "Personal Information",  sub: "Tell us about yourself" },
    2: { title: "Professional Expertise",sub: "Highlight your medical credentials" },
    3: { title: "Upload Documents",      sub: "Verify your qualifications" },
    4: { title: "Review Your Profile",   sub: "Confirm everything looks right" },
  };

  const isLastStep = step === 4;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col" style={{ fontFamily: "'Inter', sans-serif" }}>

      {/* Top accent bar */}
      <div className="h-1 w-full bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500 shrink-0" />

      {/* Header */}
      <header className="bg-white border-b border-slate-100 shadow-sm shrink-0">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Logo />
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline text-xs font-bold bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full border border-blue-100">
              Doctor Onboarding
            </span>
            <button
              onClick={() => router.push("/dashboard")}
              className="text-xs font-bold text-slate-400 hover:text-slate-600 flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <X size={13} /> Cancel
            </button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 flex flex-col items-center justify-start px-4 sm:px-6 py-8 md:py-12">

        {/* Page heading */}
        <div className="text-center mb-8 max-w-xl">
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight mb-2">
            Doctor Onboarding
          </h1>
          <p className="text-slate-500 text-sm font-medium">
            Let's complete your profile to join our network
          </p>
        </div>

        {/* Card grid */}
        <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-5 gap-6">

          {/* Illustration (left, desktop only) */}
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              <motion.div
                key={`illus-${step}`}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.3 }}
                className="h-full"
              >
                <IllustrationPanel step={step} />
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Form Card (right) */}
          <div className="lg:col-span-3 bg-white rounded-2xl shadow-xl shadow-blue-900/5 border border-slate-100 overflow-hidden flex flex-col">

            {/* Stepper header */}
            <div className="px-6 pt-6 pb-5 border-b border-slate-100">
              <StepperBar current={step} />
            </div>

            {/* Step title */}
            <div className="px-6 pt-5 pb-0">
              <AnimatePresence mode="wait">
                <motion.div
                  key={`title-${step}`}
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  transition={{ duration: 0.2 }}
                >
                  <h2 className="text-lg font-black text-slate-900">{stepMeta[step].title}</h2>
                  <p className="text-xs text-slate-400 font-medium mt-0.5">{stepMeta[step].sub}</p>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Step content */}
            <div className="flex-1 px-6 py-5 overflow-y-auto min-h-[350px]">
              {submitErr && (
                <div className="mb-4 flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm font-semibold">
                  <X size={15} className="shrink-0" /> {submitErr}
                </div>
              )}

              <AnimatePresence mode="wait" custom={dir}>
                <motion.div
                  key={`step-${step}`}
                  custom={dir}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.25, ease: "easeInOut" }}
                >
                  {step === 1 && <Step1Panel data={data} errors={errors} onChange={handleChange} />}
                  {step === 2 && <Step2Panel data={data} errors={errors} onChange={handleChange} />}
                  {step === 3 && <Step3Panel data={data} onChange={handleDocChange} />}
                  {step === 4 && (
                    <Step4Panel
                      data={data}
                      onEdit={jumpTo}
                      confirmed={data.confirmed}
                      onConfirmChange={(e) => {
                        setData((prev) => ({ ...prev, confirmed: e.target.checked }));
                        if (errors.confirmed) setErrors((p) => ({ ...p, confirmed: "" }));
                      }}
                    />
                  )}
                  {errors.confirmed && <ErrorText error={errors.confirmed} />}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Footer navigation */}
            <div className="px-6 py-5 border-t border-slate-100 flex items-center justify-between gap-3 bg-slate-50/60">
              <button
                type="button"
                onClick={step === 1 ? () => router.push("/dashboard") : goPrev}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 border-slate-200 text-sm font-bold text-slate-600 hover:border-slate-300 hover:bg-white transition-all"
              >
                <ArrowLeft size={15} />
                {step === 1 ? "Cancel" : "Back"}
              </button>

              {/* Progress dots */}
              <div className="flex items-center gap-1.5 hidden sm:flex">
                {STEPS.map((s) => (
                  <div key={s.id} className={`rounded-full transition-all duration-300 ${
                    s.id === step ? "w-5 h-2 bg-blue-600" : s.id < step ? "w-2 h-2 bg-blue-400" : "w-2 h-2 bg-slate-200"
                  }`} />
                ))}
              </div>

              {isLastStep ? (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={submitting || !data.confirmed}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-bold shadow-md shadow-blue-200 transition-all"
                >
                  {submitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Creating…
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={15} />
                      Complete Profile
                    </>
                  )}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={goNext}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold shadow-md shadow-blue-200 hover:shadow-blue-300 transition-all hover:-translate-y-0.5"
                >
                  Next Step <ArrowRight size={15} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Bottom note */}
        <p className="mt-6 text-xs text-slate-400 font-medium text-center">
          All fields can be updated later from your Profile settings.
        </p>
      </main>
    </div>
  );
}

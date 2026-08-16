"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/frontend/context/AuthContext";
import Logo from "@/frontend/components/branding/Logo";
import {
  User, Phone, Mail, MapPin, Heart, Shield, Activity,
  ArrowRight, ArrowLeft, CheckCircle2, AlertCircle, X,
  Droplets, UserCheck, Home, Building2, Hash, Clipboard,
  Pill, Zap, PhoneCall, PenLine, Eye, ChevronRight,
} from "lucide-react";

/* ─── Constants ─────────────────────────────────────────── */
const STEPS = [
  { id: 1, label: "Personal Info",  icon: User },
  { id: 2, label: "Contact Info",   icon: MapPin },
  { id: 3, label: "Health Info",    icon: Heart },
  { id: 4, label: "Review",         icon: CheckCircle2 },
];

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", "unknown"];
const GENDER_OPTIONS = [
  { value: "male",           label: "Male" },
  { value: "female",        label: "Female" },
  { value: "other",         label: "Other" },
  { value: "prefer_not_to_say", label: "Prefer not to say" },
];

const INITIAL_DATA = {
  // Step 1
  fullName: "",
  dateOfBirth: "",
  gender: "",
  bloodGroup: "",
  // Step 2
  phone: "",
  email: "",
  address: "",
  city: "",
  state: "",
  pincode: "",
  // Step 3
  allergies: "",
  chronicConditions: "",
  currentMedicines: "",
  emergencyContactName: "",
  emergencyContactPhone: "",
  // Step 4
  confirmed: false,
};

/* ─── Validation ─────────────────────────────────────────── */
function validate(step, data) {
  const errors = {};
  if (step === 1) {
    if (!data.fullName.trim()) errors.fullName = "Full name is required";
    if (!data.dateOfBirth)     errors.dateOfBirth = "Date of birth is required";
    if (!data.gender)          errors.gender = "Please select a gender";
  }
  if (step === 2) {
    if (!data.phone.trim()) errors.phone = "Phone number is required";
    else if (data.phone.replace(/\D/g, "").length < 10) errors.phone = "Enter a valid 10-digit number";
    if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) errors.email = "Enter a valid email";
    if (!data.city.trim())  errors.city  = "City is required";
    if (!data.state.trim()) errors.state = "State is required";
  }
  if (step === 3) {
    if (!data.emergencyContactName.trim())  errors.emergencyContactName  = "Emergency contact name is required";
    if (!data.emergencyContactPhone.trim()) errors.emergencyContactPhone = "Emergency contact phone is required";
  }
  return errors;
}

/* ─── Shared Field Components ────────────────────────────── */
function FieldLabel({ children, required }) {
  return (
    <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">
      {children}
      {required && <span className="text-emerald-500 ml-0.5">*</span>}
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
          focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all
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
          focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all appearance-none
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
        rows={2}
        className={`w-full ${Icon ? "pl-10" : "pl-3.5"} pr-3.5 py-2.5 bg-slate-50 border rounded-xl text-sm font-medium text-slate-900 placeholder-slate-400
          focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all resize-none
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
                done   ? "bg-emerald-500 border-emerald-500 text-white shadow-md shadow-emerald-200"
                : active ? "bg-white border-emerald-500 text-emerald-600 shadow-md shadow-emerald-100 ring-4 ring-emerald-50"
                : "bg-white border-slate-200 text-slate-400"
              }`}>
                {done
                  ? <CheckCircle2 size={18} strokeWidth={2.5} />
                  : <StepIcon size={16} strokeWidth={2} />}
              </div>
              <span className={`text-[10px] font-bold whitespace-nowrap hidden sm:block tracking-wide ${
                active ? "text-emerald-600" : done ? "text-emerald-500" : "text-slate-400"
              }`}>{step.label}</span>
            </div>
            {idx < STEPS.length - 1 && (
              <div className="flex-1 mx-2 h-0.5 rounded-full overflow-hidden bg-slate-200 mb-4 sm:mb-0">
                <div className={`h-full rounded-full transition-all duration-700 ${done ? "bg-emerald-500 w-full" : "w-0"}`} />
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
      desc: "Tell us a bit about yourself to personalize your healthcare experience.",
      color: "from-emerald-400 to-emerald-600",
      icon: <User size={48} strokeWidth={1.5} className="text-white/90" />,
      badge: "Step 1 of 4",
    },
    2: {
      title: "Contact & Address",
      desc: "Help us reach you and locate nearby healthcare services.",
      color: "from-blue-400 to-blue-600",
      icon: <MapPin size={48} strokeWidth={1.5} className="text-white/90" />,
      badge: "Step 2 of 4",
    },
    3: {
      title: "Health Information",
      desc: "Share your health background so doctors can provide better care.",
      color: "from-violet-400 to-violet-600",
      icon: <Heart size={48} strokeWidth={1.5} className="text-white/90" />,
      badge: "Step 3 of 4",
    },
    4: {
      title: "Almost There!",
      desc: "Review your information before completing your profile.",
      color: "from-emerald-400 to-teal-600",
      icon: <CheckCircle2 size={48} strokeWidth={1.5} className="text-white/90" />,
      badge: "Final Step",
    },
  };
  const c = content[step];
  return (
    <div className={`hidden lg:flex flex-col justify-between bg-gradient-to-br ${c.color} rounded-2xl p-8 text-white relative overflow-hidden min-h-[520px]`}>
      {/* Decorative circles */}
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full" />
      <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-white/10 rounded-full" />
      <div className="absolute top-1/2 right-0 w-24 h-24 bg-white/5 rounded-full" />

      <div className="relative">
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
      <div className="relative bg-white/15 backdrop-blur-sm border border-white/20 rounded-2xl p-5 mt-6">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center shrink-0 mt-0.5">
            <Shield size={17} className="text-white" />
          </div>
          <div>
            <p className="font-bold text-sm mb-1">Your Health, Our Priority</p>
            <p className="text-white/75 text-xs leading-relaxed font-medium">
              Your information is secure and will only be used to provide you better healthcare.
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
        <FieldLabel required>Full Name</FieldLabel>
        <InputField
          icon={User}
          name="fullName"
          value={data.fullName}
          onChange={onChange}
          placeholder="e.g. Priya Sharma"
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

      <div>
        <FieldLabel>Blood Group</FieldLabel>
        <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
          {BLOOD_GROUPS.map((bg) => (
            <button
              key={bg}
              type="button"
              onClick={() => onChange({ target: { name: "bloodGroup", value: bg === data.bloodGroup ? "" : bg } })}
              className={`py-2 rounded-xl text-sm font-bold border-2 transition-all duration-200 ${
                data.bloodGroup === bg
                  ? "border-emerald-500 bg-emerald-50 text-emerald-700 shadow-sm shadow-emerald-100"
                  : "border-slate-200 text-slate-500 hover:border-emerald-300 hover:bg-emerald-50/50"
              }`}
            >
              {bg === "unknown" ? "?" : bg}
            </button>
          ))}
        </div>
        <p className="text-xs text-slate-400 mt-1.5 font-medium">Optional — helps doctors in emergencies</p>
      </div>
    </div>
  );
}

function Step2Panel({ data, errors, onChange }) {
  return (
    <div className="space-y-5">
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
          <FieldLabel>Email Address</FieldLabel>
          <InputField
            icon={Mail}
            name="email"
            type="email"
            value={data.email}
            onChange={onChange}
            placeholder="you@email.com"
            error={errors.email}
          />
          <ErrorText error={errors.email} />
        </div>
      </div>

      <div>
        <FieldLabel>Street Address</FieldLabel>
        <InputField
          icon={Home}
          name="address"
          value={data.address}
          onChange={onChange}
          placeholder="123, Healthcare Avenue"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div>
          <FieldLabel required>City</FieldLabel>
          <InputField
            icon={Building2}
            name="city"
            value={data.city}
            onChange={onChange}
            placeholder="Mumbai"
            error={errors.city}
          />
          <ErrorText error={errors.city} />
        </div>
        <div>
          <FieldLabel required>State</FieldLabel>
          <InputField
            icon={MapPin}
            name="state"
            value={data.state}
            onChange={onChange}
            placeholder="Maharashtra"
            error={errors.state}
          />
          <ErrorText error={errors.state} />
        </div>
        <div>
          <FieldLabel>Pincode</FieldLabel>
          <InputField
            icon={Hash}
            name="pincode"
            value={data.pincode}
            onChange={onChange}
            placeholder="400001"
          />
        </div>
      </div>
    </div>
  );
}

function Step3Panel({ data, errors, onChange }) {
  return (
    <div className="space-y-5">
      <div>
        <FieldLabel>Allergies</FieldLabel>
        <TextAreaField
          icon={Zap}
          name="allergies"
          value={data.allergies}
          onChange={onChange}
          placeholder="e.g. Penicillin, Pollen, Dust mites (comma separated)"
        />
        <p className="text-xs text-slate-400 mt-1 font-medium">Separate multiple entries with commas</p>
      </div>

      <div>
        <FieldLabel>Chronic Conditions</FieldLabel>
        <TextAreaField
          icon={Activity}
          name="chronicConditions"
          value={data.chronicConditions}
          onChange={onChange}
          placeholder="e.g. Diabetes Type 2, Hypertension (comma separated)"
        />
      </div>

      <div>
        <FieldLabel>Current Medications</FieldLabel>
        <TextAreaField
          icon={Pill}
          name="currentMedicines"
          value={data.currentMedicines}
          onChange={onChange}
          placeholder="e.g. Metformin 500mg, Amlodipine (comma separated)"
        />
      </div>

      <div className="pt-2 border-t border-slate-100">
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
          Emergency Contact
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <FieldLabel required>Contact Name</FieldLabel>
            <InputField
              icon={UserCheck}
              name="emergencyContactName"
              value={data.emergencyContactName}
              onChange={onChange}
              placeholder="e.g. Rahul Sharma"
              error={errors.emergencyContactName}
            />
            <ErrorText error={errors.emergencyContactName} />
          </div>
          <div>
            <FieldLabel required>Contact Phone</FieldLabel>
            <InputField
              icon={PhoneCall}
              name="emergencyContactPhone"
              type="tel"
              value={data.emergencyContactPhone}
              onChange={onChange}
              placeholder="+91 98765 43210"
              error={errors.emergencyContactPhone}
            />
            <ErrorText error={errors.emergencyContactPhone} />
          </div>
        </div>
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
        className="shrink-0 text-[11px] font-bold text-blue-500 hover:text-blue-600 flex items-center gap-1 mt-0.5 transition-colors"
      >
        <PenLine size={11} /> Edit
      </button>
    </div>
  );
}

function Step4Panel({ data, onEdit, confirmed, onConfirmChange }) {
  return (
    <div className="space-y-5">
      {/* Personal */}
      <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-7 h-7 rounded-lg bg-emerald-100 flex items-center justify-center">
            <User size={13} className="text-emerald-600" />
          </div>
          <p className="text-xs font-black text-slate-700 uppercase tracking-wider">Personal Info</p>
        </div>
        <ReviewRow label="Full Name"    value={data.fullName}    onEdit={onEdit} step={1} />
        <ReviewRow label="Date of Birth" value={data.dateOfBirth} onEdit={onEdit} step={1} />
        <ReviewRow label="Gender"       value={data.gender}      onEdit={onEdit} step={1} />
        <ReviewRow label="Blood Group"  value={data.bloodGroup}  onEdit={onEdit} step={1} />
      </div>

      {/* Contact */}
      <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center">
            <MapPin size={13} className="text-blue-600" />
          </div>
          <p className="text-xs font-black text-slate-700 uppercase tracking-wider">Contact Info</p>
        </div>
        <ReviewRow label="Phone"   value={data.phone}   onEdit={onEdit} step={2} />
        <ReviewRow label="Email"   value={data.email}   onEdit={onEdit} step={2} />
        <ReviewRow label="Address" value={[data.address, data.city, data.state, data.pincode].filter(Boolean).join(", ")} onEdit={onEdit} step={2} />
      </div>

      {/* Health */}
      <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-7 h-7 rounded-lg bg-violet-100 flex items-center justify-center">
            <Heart size={13} className="text-violet-600" />
          </div>
          <p className="text-xs font-black text-slate-700 uppercase tracking-wider">Health Info</p>
        </div>
        <ReviewRow label="Allergies"          value={data.allergies}          onEdit={onEdit} step={3} />
        <ReviewRow label="Chronic Conditions" value={data.chronicConditions}  onEdit={onEdit} step={3} />
        <ReviewRow label="Current Medicines"  value={data.currentMedicines}   onEdit={onEdit} step={3} />
        <ReviewRow label="Emergency Contact"  value={data.emergencyContactName ? `${data.emergencyContactName} — ${data.emergencyContactPhone}` : ""} onEdit={onEdit} step={3} />
      </div>

      {/* Confirm checkbox */}
      <label className="flex items-start gap-3 cursor-pointer group p-4 rounded-2xl border-2 border-emerald-200 bg-emerald-50/60 hover:bg-emerald-50 transition-colors">
        <div className={`mt-0.5 w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all ${
          confirmed ? "border-emerald-500 bg-emerald-500" : "border-slate-300 bg-white group-hover:border-emerald-400"
        }`}>
          {confirmed && <CheckCircle2 size={13} className="text-white" strokeWidth={3} />}
        </div>
        <input type="checkbox" className="sr-only" checked={confirmed} onChange={onConfirmChange} />
        <p className="text-sm font-semibold text-slate-700 leading-snug">
          I confirm that all the information provided is accurate and up to date.
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
export default function PatientOnboardingPage() {
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
      else if (user.role !== "patient") router.push("/dashboard");
      else if (user.onboardingCompleted) router.push("/patient/dashboard");
    }
  }, [user, authLoading, router]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

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
      setErrors({ confirmed: "Please confirm the information is correct" });
      return;
    }
    setSubmitErr("");
    setSubmitting(true);

    // Parse comma-separated arrays
    const parse = (str) => str.split(",").map((s) => s.trim()).filter(Boolean);

    try {
      const res = await fetch("/api/onboarding/patient", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName:              data.fullName,
          dateOfBirth:           data.dateOfBirth,
          gender:                data.gender,
          bloodGroup:            data.bloodGroup || undefined,
          phone:                 data.phone,
          email:                 data.email || undefined,
          address:               data.address || undefined,
          city:                  data.city,
          state:                 data.state,
          pincode:               data.pincode || undefined,
          allergies:             parse(data.allergies),
          chronicConditions:     parse(data.chronicConditions),
          currentMedicines:      parse(data.currentMedicines),
          emergencyContactName:  data.emergencyContactName,
          emergencyContactPhone: data.emergencyContactPhone,
          clinicId: typeof window !== "undefined" ? localStorage.getItem("selectedClinicId") : undefined,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Failed to complete profile");

      await refreshUser();
      router.push("/patient/dashboard");
    } catch (err) {
      setSubmitErr(err.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  /* Loading state */
  if (authLoading || !user || user.role !== "patient") {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-emerald-100 border-t-emerald-500 animate-spin" />
          <p className="text-sm font-semibold text-slate-400">Loading…</p>
        </div>
      </div>
    );
  }

  const stepMeta = {
    1: { title: "Personal Information",  sub: "Tell us about yourself" },
    2: { title: "Contact Information",   sub: "How can we reach you?" },
    3: { title: "Health Information",    sub: "Help doctors serve you better" },
    4: { title: "Review Your Profile",   sub: "Confirm everything looks right" },
  };

  const isLastStep = step === 4;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col" style={{ fontFamily: "'Inter', sans-serif" }}>

      {/* Top accent bar */}
      <div className="h-1 w-full bg-gradient-to-r from-emerald-400 via-blue-400 to-violet-400 shrink-0" />

      {/* Header */}
      <header className="bg-white border-b border-slate-100 shadow-sm shrink-0">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Logo />
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline text-xs font-bold bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-full">
              Patient Onboarding
            </span>
            <button
              onClick={() => router.push("/patient/dashboard")}
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
            Patient Onboarding
          </h1>
          <p className="text-slate-500 text-sm font-medium">
            Let's complete your profile to get started
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
          <div className="lg:col-span-3 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden flex flex-col">

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
            <div className="flex-1 px-6 py-5 overflow-y-auto">
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
                  {step === 3 && <Step3Panel data={data} errors={errors} onChange={handleChange} />}
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
                onClick={step === 1 ? () => router.push("/patient/dashboard") : goPrev}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 border-slate-200 text-sm font-bold text-slate-600 hover:border-slate-300 hover:bg-white transition-all"
              >
                <ArrowLeft size={15} />
                {step === 1 ? "Cancel" : "Back"}
              </button>

              {/* Progress dots */}
              <div className="flex items-center gap-1.5">
                {STEPS.map((s) => (
                  <div key={s.id} className={`rounded-full transition-all duration-300 ${
                    s.id === step ? "w-5 h-2 bg-emerald-500" : s.id < step ? "w-2 h-2 bg-emerald-400" : "w-2 h-2 bg-slate-200"
                  }`} />
                ))}
              </div>

              {isLastStep ? (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={submitting || !data.confirmed}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-bold shadow-md shadow-emerald-200 transition-all"
                >
                  {submitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Saving…
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
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-bold shadow-md shadow-emerald-200 hover:shadow-emerald-300 transition-all hover:-translate-y-0.5"
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

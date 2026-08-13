"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { setupClinic } from "@/frontend/services/authApi";
import { useAuth } from "@/frontend/context/AuthContext";
import {
  Building2, Mail, Phone, MapPin, Clock, ArrowRight, ArrowLeft,
  Activity, CheckCircle2, Upload, X, Globe, Lock,
  Stethoscope, Wifi, Car, FlaskConical, Ambulance, Baby,
  Eye, Heart, Brain, Bone, Pill, Shield,
  Coffee, ParkingSquare, Accessibility, Wind, Zap, Save,
  ImagePlus,
} from "lucide-react";

/* ─── Constants ─────────────────────────────────────────────── */
const STEPS = [
  { id: 1, label: "Basic Info",  short: "Info" },
  { id: 2, label: "Location",    short: "Location" },
  { id: 3, label: "Services",    short: "Services" },
  { id: 4, label: "Branding",    short: "Branding" },
];

const SPECIALTIES = [
  { label: "General Medicine",  icon: Stethoscope },
  { label: "Cardiology",        icon: Heart },
  { label: "Neurology",         icon: Brain },
  { label: "Orthopedics",       icon: Bone },
  { label: "Pediatrics",        icon: Baby },
  { label: "Ophthalmology",     icon: Eye },
  { label: "Pharmacy",          icon: Pill },
  { label: "Radiology",         icon: FlaskConical },
  { label: "Gynecology",        icon: Shield },
  { label: "Dermatology",       icon: Zap },
  { label: "ENT",               icon: Wind },
  { label: "Ambulance",         icon: Ambulance },
];

const FACILITIES = [
  { label: "WiFi",              icon: Wifi },
  { label: "Parking",           icon: Car },
  { label: "Cafeteria",         icon: Coffee },
  { label: "Wheelchair Access", icon: Accessibility },
  { label: "Paid Parking",      icon: ParkingSquare },
  { label: "ICU",               icon: Activity },
  { label: "Lab",               icon: FlaskConical },
  { label: "Pharmacy",          icon: Pill },
];

const INITIAL = {
  // Step 1
  name: "", phone: "", email: "",
  // Step 2
  state: "", city: "", area: "", addressLine1: "", addressLine2: "", pincode: "",
  // Step 3
  specialties: [], facilities: [], openingTime: "09:00", closingTime: "18:00", consultationDuration: 15,
  // Step 4
  logo: "", logoFile: null, coverImage: "", coverFile: null, isPublic: false,
};

const DRAFT_KEY = "clinora_clinic_draft";

/* ─── Helpers ────────────────────────────────────────────────── */
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function validate(step, data) {
  const errs = {};
  if (step === 1) {
    if (!data.name.trim())  errs.name  = "Clinic name is required";
    if (!data.phone.trim()) errs.phone = "Phone number is required";
    else if (data.phone.replace(/\D/g, "").length < 10) errs.phone = "Enter a valid 10-digit number";
    if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) errs.email = "Enter a valid email";
  }
  if (step === 2) {
    if (!data.state.trim())       errs.state       = "State is required";
    if (!data.city.trim())        errs.city        = "City is required";
    if (!data.addressLine1.trim()) errs.addressLine1 = "Full address is required";
    if (!data.pincode.trim())     errs.pincode     = "Pincode is required";
    else if (data.pincode.replace(/\D/g, "").length < 5) errs.pincode = "Enter a valid pincode";
  }
  return errs;
}

/* ─── Sub-components ─────────────────────────────────────────── */
function FullPageSpinner() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 rounded-full border-4 border-emerald-100 border-t-emerald-500 animate-spin" />
        <p className="text-sm font-semibold text-slate-400">Loading…</p>
      </div>
    </div>
  );
}

function StepperBar({ current }) {
  return (
    <div className="flex items-center w-full mb-8 md:mb-10">
      {STEPS.map((step, idx) => {
        const done   = current > step.id;
        const active = current === step.id;
        return (
          <div key={step.id} className="flex items-center flex-1 last:flex-none">
            {/* Circle */}
            <div className="flex flex-col items-center">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-black border-2 transition-all duration-300 ${
                done   ? "bg-emerald-500 border-emerald-500 text-white shadow-md shadow-emerald-200"
                : active ? "bg-white border-emerald-500 text-emerald-600 shadow-md shadow-emerald-100"
                : "bg-white border-slate-200 text-slate-400"
              }`}>
                {done ? <CheckCircle2 size={17} strokeWidth={2.5} /> : step.id}
              </div>
              <span className={`mt-1.5 text-[10px] font-bold whitespace-nowrap hidden sm:block ${
                active ? "text-emerald-600" : done ? "text-emerald-500" : "text-slate-400"
              }`}>{step.label}</span>
            </div>

            {/* Connector */}
            {idx < STEPS.length - 1 && (
              <div className="flex-1 mx-1.5 h-0.5 rounded-full overflow-hidden bg-slate-200">
                <div className={`h-full rounded-full transition-all duration-500 ${done ? "bg-emerald-500 w-full" : "w-0"}`} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function InputField({ label, required, error, icon: Icon, children }) {
  return (
    <div>
      <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">
        {label}{required && <span className="text-emerald-500 ml-0.5">*</span>}
      </label>
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <Icon size={15} className="text-slate-400" />
          </div>
        )}
        {children}
      </div>
      {error && <p className="mt-1 text-xs text-red-500 font-medium">{error}</p>}
    </div>
  );
}

function Input({ icon, error, ...props }) {
  return (
    <input
      className={`w-full ${icon ? "pl-10" : "pl-3.5"} pr-3.5 py-2.5 bg-slate-50 border rounded-xl text-sm font-medium text-slate-900 placeholder-slate-400
        focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all
        ${error ? "border-red-400 bg-red-50" : "border-slate-200 hover:border-slate-300"}`}
      {...props}
    />
  );
}

function MultiSelectGrid({ items, selected, onToggle, accent = "emerald" }) {
  const colors = {
    emerald: { active: "border-emerald-400 bg-emerald-50 text-emerald-700", icon: "text-emerald-500" },
    blue:    { active: "border-blue-400 bg-blue-50 text-blue-700",         icon: "text-blue-500" },
  };
  const c = colors[accent];
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
      {items.map(({ label, icon: Icon }) => {
        const active = selected.includes(label);
        return (
          <button
            key={label}
            type="button"
            onClick={() => onToggle(label)}
            className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border-2 text-sm font-semibold text-left transition-all duration-200 hover:shadow-sm
              ${active ? c.active : "border-slate-200 text-slate-600 bg-white hover:border-slate-300"}`}
          >
            <Icon size={14} className={active ? c.icon : "text-slate-400"} strokeWidth={2} />
            <span className="leading-tight">{label}</span>
            {active && <CheckCircle2 size={12} className={`ml-auto flex-shrink-0 ${c.icon}`} strokeWidth={2.5} />}
          </button>
        );
      })}
    </div>
  );
}

function ImageUploader({ label, value, onChange, icon: Icon = ImagePlus }) {
  const inputRef = useRef(null);
  return (
    <div>
      <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">{label}</label>
      {value ? (
        <div className="relative rounded-2xl overflow-hidden border-2 border-emerald-300 bg-slate-100" style={{ height: 140 }}>
          <img src={value} alt={label} className="w-full h-full object-cover" />
          <button
            type="button"
            onClick={() => onChange("", null)}
            className="absolute top-2 right-2 w-7 h-7 bg-white rounded-full shadow flex items-center justify-center text-slate-600 hover:text-red-500 transition-colors"
          >
            <X size={14} />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="w-full border-2 border-dashed border-slate-300 hover:border-emerald-400 hover:bg-emerald-50 rounded-2xl flex flex-col items-center justify-center gap-2 py-8 text-slate-400 hover:text-emerald-600 transition-all duration-200"
        >
          <Icon size={28} strokeWidth={1.5} />
          <span className="text-xs font-semibold">Click to upload</span>
          <span className="text-[10px]">PNG, JPG up to 2MB</span>
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={async (e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          if (file.size > 2 * 1024 * 1024) { alert("File must be under 2MB"); return; }
          const b64 = await fileToBase64(file);
          onChange(b64, file);
        }}
      />
    </div>
  );
}

/* ─── Step Panels ────────────────────────────────────────────── */
function Step1({ data, errors, onChange }) {
  return (
    <div className="space-y-5">
      <InputField label="Clinic Name" required error={errors.name} icon={Building2}>
        <Input icon name="name" value={data.name} onChange={onChange} placeholder="e.g. City Health Care" error={errors.name} />
      </InputField>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <InputField label="Phone Number" required error={errors.phone} icon={Phone}>
          <Input icon name="phone" type="tel" value={data.phone} onChange={onChange} placeholder="+91 98765 43210" error={errors.phone} />
        </InputField>
        <InputField label="Email Address" error={errors.email} icon={Mail}>
          <Input icon name="email" type="email" value={data.email} onChange={onChange} placeholder="contact@clinic.com" error={errors.email} />
        </InputField>
      </div>
    </div>
  );
}

function Step2({ data, errors, onChange }) {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <InputField label="State" required error={errors.state} icon={MapPin}>
          <Input icon name="state" value={data.state} onChange={onChange} placeholder="Maharashtra" error={errors.state} />
        </InputField>
        <InputField label="City" required error={errors.city} icon={MapPin}>
          <Input icon name="city" value={data.city} onChange={onChange} placeholder="Mumbai" error={errors.city} />
        </InputField>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <InputField label="Area / Locality" icon={MapPin}>
          <Input icon name="area" value={data.area} onChange={onChange} placeholder="Andheri West" />
        </InputField>
        <InputField label="Pincode" required error={errors.pincode} icon={MapPin}>
          <Input icon name="pincode" value={data.pincode} onChange={onChange} placeholder="400001" error={errors.pincode} />
        </InputField>
      </div>
      <InputField label="Full Address" required error={errors.addressLine1} icon={MapPin}>
        <Input icon name="addressLine1" value={data.addressLine1} onChange={onChange} placeholder="123 Health Avenue, Sector 4" error={errors.addressLine1} />
      </InputField>
      <InputField label="Address Line 2 (Optional)" icon={MapPin}>
        <Input icon name="addressLine2" value={data.addressLine2} onChange={onChange} placeholder="Near City Hospital" />
      </InputField>
    </div>
  );
}

function Step3({ data, onToggle, onChange }) {
  return (
    <div className="space-y-7">
      <div>
        <p className="text-xs font-bold text-slate-600 mb-3 uppercase tracking-wider">Specialties</p>
        <MultiSelectGrid items={SPECIALTIES} selected={data.specialties} onToggle={(v) => onToggle("specialties", v)} accent="emerald" />
      </div>
      <div>
        <p className="text-xs font-bold text-slate-600 mb-3 uppercase tracking-wider">Facilities</p>
        <MultiSelectGrid items={FACILITIES} selected={data.facilities} onToggle={(v) => onToggle("facilities", v)} accent="blue" />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-5">
        <InputField label="Opening Time" icon={Clock}>
          <Input icon name="openingTime" type="time" value={data.openingTime} onChange={onChange} />
        </InputField>
        <InputField label="Closing Time" icon={Clock}>
          <Input icon name="closingTime" type="time" value={data.closingTime} onChange={onChange} />
        </InputField>
        <InputField label="Consult. Duration (mins)" icon={Clock}>
          <Input icon name="consultationDuration" type="number" min="5" value={data.consultationDuration} onChange={onChange} />
        </InputField>
      </div>
    </div>
  );
}

function Step4({ data, onImageChange, onTogglePublic }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <ImageUploader label="Clinic Logo" value={data.logo} onChange={(b64, file) => onImageChange("logo", "logoFile", b64, file)} icon={Upload} />
        <ImageUploader label="Cover Image" value={data.coverImage} onChange={(b64, file) => onImageChange("coverImage", "coverFile", b64, file)} icon={ImagePlus} />
      </div>

      {/* Public Listing Toggle */}
      <div className={`flex items-center justify-between gap-4 p-5 rounded-2xl border-2 transition-all duration-200 ${
        data.isPublic ? "border-emerald-400 bg-emerald-50" : "border-slate-200 bg-slate-50"
      }`}>
        <div className="flex items-start gap-3">
          {data.isPublic
            ? <Globe size={22} className="text-emerald-500 mt-0.5" strokeWidth={2} />
            : <Lock  size={22} className="text-slate-400  mt-0.5" strokeWidth={2} />}
          <div>
            <p className="text-sm font-bold text-slate-800">
              {data.isPublic ? "Publicly Listed" : "Private Clinic"}
            </p>
            <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
              {data.isPublic
                ? "Patients can discover and book appointments online."
                : "Only accessible via direct link or invite."}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onTogglePublic}
          className={`relative w-12 h-6 rounded-full transition-all duration-300 flex-shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 ${
            data.isPublic ? "bg-emerald-500" : "bg-slate-300"
          }`}
        >
          <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-300 ${
            data.isPublic ? "translate-x-6" : "translate-x-0"
          }`} />
        </button>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 flex items-center gap-3 text-blue-700 text-xs font-semibold">
        <Shield size={15} strokeWidth={2.5} />
        <span>You can update branding & visibility anytime from your Clinic Settings.</span>
      </div>
    </div>
  );
}

/* ─── Main Wizard ────────────────────────────────────────────── */
export default function ClinicOnboardingClient() {
  const router = useRouter();
  const { user, loading: authLoading, refreshUser } = useAuth();

  const [step, setStep]           = useState(1);
  const [data, setData]           = useState(INITIAL);
  const [errors, setErrors]       = useState({});
  const [loading, setLoading]     = useState(false);
  const [submitErr, setSubmitErr] = useState("");
  const [draftSaved, setDraftSaved] = useState(false);

  /* Load draft on mount */
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(DRAFT_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        setData((prev) => ({ ...prev, ...parsed, logoFile: null, coverFile: null }));
        setStep(parsed._step || 1);
      }
    } catch (_) {}
  }, []);

  /* Auth guard */
  useEffect(() => {
    if (!authLoading) {
      if (!user) router.push("/login");
      else if (user.onboardingCompleted) router.push("/dashboard");
    }
  }, [user, authLoading, router]);

  const saveDraft = useCallback(() => {
    try {
      const { logoFile, coverFile, ...rest } = data;
      sessionStorage.setItem(DRAFT_KEY, JSON.stringify({ ...rest, _step: step }));
      setDraftSaved(true);
      setTimeout(() => setDraftSaved(false), 2000);
    } catch (_) {}
  }, [data, step]);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setData((prev) => ({ ...prev, [name]: type === "number" ? (parseInt(value) || "") : value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleToggle = (field, value) => {
    setData((prev) => {
      const arr = prev[field];
      return { ...prev, [field]: arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value] };
    });
  };

  const handleImageChange = (b64Field, fileField, b64, file) => {
    setData((prev) => ({ ...prev, [b64Field]: b64, [fileField]: file }));
  };

  const handleTogglePublic = () => {
    setData((prev) => ({ ...prev, isPublic: !prev.isPublic }));
  };

  const goNext = () => {
    const errs = validate(step, data);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    saveDraft();
    setStep((s) => Math.min(s + 1, 4));
  };

  const goPrev = () => { setErrors({}); setStep((s) => Math.max(s - 1, 1)); };

  const handleSubmit = async () => {
    setSubmitErr("");
    setLoading(true);
    try {
      const payload = {
        name:                data.name,
        email:               data.email,
        phone:               data.phone,
        state:               data.state,
        city:                data.city,
        area:                data.area,
        addressLine1:        data.addressLine1,
        addressLine2:        data.addressLine2,
        pincode:             data.pincode,
        specialties:         data.specialties,
        facilities:          data.facilities,
        openingTime:         data.openingTime,
        closingTime:         data.closingTime,
        consultationDuration: Number(data.consultationDuration) || 15,
        isPublic:            data.isPublic,
        logo:                data.logo || "",
        coverImage:          data.coverImage || "",
      };

      await setupClinic(payload);
      await refreshUser();
      sessionStorage.removeItem(DRAFT_KEY);
      router.push("/dashboard");
    } catch (err) {
      setSubmitErr(err.message || "Failed to set up clinic. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || !user) return <FullPageSpinner />;

  const stepTitles = {
    1: { title: "Basic Information",  sub: "Tell us about your clinic." },
    2: { title: "Location Details",   sub: "Where is your clinic located?" },
    3: { title: "Services & Hours",   sub: "What services do you offer?" },
    4: { title: "Branding & Listing", sub: "Customise your clinic's appearance." },
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col" style={{ fontFamily: "'Poppins', sans-serif" }}>

      {/* Top accent bar */}
      <div className="h-1 w-full bg-gradient-to-r from-emerald-400 via-blue-400 to-violet-400" />

      {/* Header */}
      <header className="flex items-center justify-between px-5 md:px-10 py-4 bg-white border-b border-slate-100 shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center shadow">
            <Activity size={17} className="text-white" strokeWidth={2.5} />
          </div>
          <span className="text-base font-black text-slate-900 tracking-tight">Clinora</span>
        </div>
        <button
          onClick={saveDraft}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-emerald-600 transition-colors px-3 py-1.5 rounded-lg hover:bg-emerald-50"
        >
          <Save size={13} />
          {draftSaved ? <span className="text-emerald-600">Saved!</span> : "Save Draft"}
        </button>
      </header>

      {/* Main */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 py-8 md:py-12">

        {/* Page title */}
        <div className="text-center mb-8 max-w-lg">
          <span className="inline-block text-xs font-bold bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full mb-3">
            Step {step} of {STEPS.length}
          </span>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">{stepTitles[step].title}</h1>
          <p className="text-slate-500 text-sm mt-1.5 font-medium">{stepTitles[step].sub}</p>
        </div>

        {/* Card */}
        <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">

          {/* Stepper inside card header */}
          <div className="px-6 pt-6 pb-4 border-b border-slate-100">
            <StepperBar current={step} />
          </div>

          {/* Step content */}
          <div className="px-6 md:px-8 py-7">
            {submitErr && (
              <div className="mb-5 flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm font-semibold">
                <X size={16} /> {submitErr}
              </div>
            )}

            {step === 1 && <Step1 data={data} errors={errors} onChange={handleChange} />}
            {step === 2 && <Step2 data={data} errors={errors} onChange={handleChange} />}
            {step === 3 && <Step3 data={data} onToggle={handleToggle} onChange={handleChange} />}
            {step === 4 && (
              <Step4
                data={data}
                onImageChange={handleImageChange}
                onTogglePublic={handleTogglePublic}
              />
            )}
          </div>

          {/* Navigation footer */}
          <div className="px-6 md:px-8 pb-6 pt-2 flex items-center justify-between gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={goPrev}
              disabled={step === 1}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 border-slate-200 text-sm font-bold text-slate-600 hover:border-slate-300 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <ArrowLeft size={15} /> Previous
            </button>

            <div className="flex items-center gap-1.5">
              {STEPS.map((s) => (
                <div key={s.id} className={`rounded-full transition-all duration-300 ${
                  s.id === step ? "w-5 h-2 bg-emerald-500" : s.id < step ? "w-2 h-2 bg-emerald-400" : "w-2 h-2 bg-slate-200"
                }`} />
              ))}
            </div>

            {step < 4 ? (
              <button
                type="button"
                onClick={goNext}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-bold shadow-md shadow-emerald-200 transition-all"
              >
                Next <ArrowRight size={15} />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60 disabled:cursor-wait text-white text-sm font-bold shadow-md shadow-emerald-200 transition-all"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Setting up…
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={15} /> Launch Clinic
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        <p className="mt-5 text-xs text-slate-400 font-medium">
          All fields can be updated later from your Clinic Settings.
        </p>
      </main>
    </div>
  );
}

import React from "react";

export function GenericStatusBadge({ status }) {
  const normalized = (status || "").toLowerCase();
  let colorClass = "bg-[#F1F5F9] text-[#64748B]"; // Draft / default (Gray)

  if (normalized === "scheduled" || normalized === "recommended" || normalized === "report_uploaded") {
    colorClass = "bg-[#EFF6FF] text-[#2563EB]"; // Blue
  }
  if (normalized === "waiting" || normalized === "pending" || normalized === "pending_review") {
    colorClass = "bg-[#FEF3C7] text-[#F59E0B]"; // Orange
  }
  if (normalized === "completed" || normalized === "finalized" || normalized === "paid" || normalized === "reviewed" || normalized === "confirmed") {
    colorClass = "bg-[#EFF6FF] text-[#2563EB]"; // Green
  }
  if (normalized === "cancelled" || normalized === "no_show") {
    colorClass = "bg-[#FEF2F2] text-[#EF4444]"; // Red
  }

  const label = normalized.replace(/_/g, " ");

  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${colorClass}`}>
      {label}
    </span>
  );
}

export function TestStatusBadge({ status }) {
  return <GenericStatusBadge status={status} />;
}

export function ReportStatusBadge({ status }) {
  return <GenericStatusBadge status={status} />;
}

export function AppointmentStatusBadge({ status }) {
  return <GenericStatusBadge status={status} />;
}

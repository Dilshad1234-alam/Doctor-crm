import React from "react";

export function TestStatusBadge({ status }) {
  const normalized = (status || "").toLowerCase();
  let colorClass = "bg-gray-100 text-gray-800 border-gray-200";

  if (normalized === "recommended") colorClass = "bg-blue-100 text-blue-800 border-blue-200";
  if (normalized === "pending") colorClass = "bg-yellow-100 text-yellow-800 border-yellow-200";
  if (normalized === "report_uploaded") colorClass = "bg-purple-100 text-purple-800 border-purple-200";
  if (normalized === "reviewed") colorClass = "bg-green-100 text-green-800 border-green-200";
  if (normalized === "cancelled") colorClass = "bg-red-100 text-red-800 border-red-200";

  const label = normalized.replace(/_/g, " ");

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize ${colorClass}`}>
      {label}
    </span>
  );
}

export function ReportStatusBadge({ status }) {
  const normalized = (status || "").toLowerCase();
  let colorClass = "bg-gray-100 text-gray-800 border-gray-200";

  if (normalized === "pending_review") colorClass = "bg-yellow-100 text-yellow-800 border-yellow-200";
  if (normalized === "reviewed") colorClass = "bg-green-100 text-green-800 border-green-200";

  const label = normalized.replace(/_/g, " ");

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize ${colorClass}`}>
      {label}
    </span>
  );
}

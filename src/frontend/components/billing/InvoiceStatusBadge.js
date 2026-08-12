import React from "react";

export default function InvoiceStatusBadge({ status }) {
  const getBadgeStyles = () => {
    switch (status) {
      case "paid": return "bg-blue-100 text-blue-800 border-blue-200";
      case "unpaid": return "bg-red-100 text-red-800 border-red-200";
      case "partially_paid": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "draft": return "bg-gray-100 text-gray-800 border-gray-200";
      case "cancelled": return "bg-gray-300 text-gray-800 border-gray-400";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const label = status?.replace("_", " ") || "Unknown";

  return (
    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${getBadgeStyles()} capitalize`}>
      {label}
    </span>
  );
}

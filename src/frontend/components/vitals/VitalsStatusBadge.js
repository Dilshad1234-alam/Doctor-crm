export default function VitalsStatusBadge({ status, hasVitals }) {
  // If explicitly passed `hasVitals` boolean
  if (hasVitals === true) {
    return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">Recorded</span>;
  }
  if (hasVitals === false) {
    return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Pending</span>;
  }

  // Fallback to string status (e.g. from an API response if mapped that way)
  if (status === "recorded") {
    return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">Recorded</span>;
  }
  
  return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Pending</span>;
}

export default function QueueStatusBadge({ status }) {
  const getBadgeStyle = (status) => {
    switch (status) {
      case "checked_in":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "waiting":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "called":
        return "bg-purple-100 text-purple-800 border-purple-200 animate-pulse";
      case "in_consultation":
        return "bg-green-100 text-green-800 border-green-200";
      case "skipped":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "removed":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getLabel = (status) => {
    if (!status) return "Unknown";
    return status.split("_").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getBadgeStyle(status)}`}>
      {getLabel(status)}
    </span>
  );
}

export default function PriorityBadge({ priority }) {
  const getBadgeStyle = (priority) => {
    switch (priority) {
      case "urgent":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "emergency":
        return "bg-red-100 text-red-800 border-red-200 font-bold";
      case "normal":
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getLabel = (priority) => {
    if (!priority) return "Normal";
    return priority.charAt(0).toUpperCase() + priority.slice(1);
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs border ${getBadgeStyle(priority)}`}>
      {getLabel(priority)}
    </span>
  );
}

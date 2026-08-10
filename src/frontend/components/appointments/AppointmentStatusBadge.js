export default function AppointmentStatusBadge({ status }) {
  const statusStyles = {
    scheduled: "bg-blue-100 text-blue-800",
    confirmed: "bg-indigo-100 text-indigo-800",
    checked_in: "bg-purple-100 text-purple-800",
    waiting: "bg-yellow-100 text-yellow-800",
    in_consultation: "bg-orange-100 text-orange-800",
    completed: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800",
    no_show: "bg-gray-100 text-gray-800",
  };

  const style = statusStyles[status] || "bg-gray-100 text-gray-800";
  const label = status ? status.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') : "Unknown";

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${style}`}>
      {label}
    </span>
  );
}

export default function FeatureCard({ icon, title, description }) {
  return (
    <div className="group flex flex-col items-start p-6 bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-xl hover:shadow-teal-100/50 hover:-translate-y-1 transition-all duration-300 cursor-default">
      <div className="flex items-center justify-center w-12 h-12 mb-4 rounded-lg bg-gradient-to-br from-teal-50 to-emerald-50 text-2xl group-hover:scale-110 group-hover:from-teal-100 group-hover:to-emerald-100 transition-all duration-300">
        {icon}
      </div>
      <h3 className="mb-2 text-lg font-semibold text-gray-900">{title}</h3>
      <p className="text-gray-500 text-sm leading-relaxed">{description}</p>
    </div>
  );
}

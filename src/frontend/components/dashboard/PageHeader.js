export default function PageHeader({ title, description, action }) {
  return (
    <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 className="text-3xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-[#0f3d69] to-[#2ab5e1]">{title}</h1>
        {description && <p className="mt-2 text-sm font-medium text-gray-500">{description}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

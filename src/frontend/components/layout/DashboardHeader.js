export default function DashboardHeader() {
  return (
    <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6">
      <div className="flex flex-1 items-center">
        <span className="text-sm font-medium text-gray-500 hidden sm:block">
          City General Clinic
        </span>
      </div>
      <div className="flex items-center space-x-4">
        <div className="text-sm text-gray-700 font-medium">Dr. Smith</div>
        <div className="h-8 w-8 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-bold text-xs">
          DS
        </div>
      </div>
    </header>
  );
}

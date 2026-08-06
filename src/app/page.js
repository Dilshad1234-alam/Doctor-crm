import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center bg-white p-10 rounded-xl shadow-lg border border-gray-100">
        <div>
          <h1 className="text-4xl font-extrabold text-teal-700 tracking-tight">
            Doctor CRM
          </h1>
          <p className="mt-3 text-lg text-gray-600">
            Multi-Clinic and Multi-Doctor Management System
          </p>
        </div>
        
        <div className="bg-teal-50 text-teal-800 rounded-md p-4 text-sm font-medium">
          The project foundation is ready.
        </div>

        <div className="text-left space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 border-b pb-2">Tech Stack</h2>
          <ul className="list-disc pl-5 text-gray-600 space-y-2">
            <li>Next.js App Router</li>
            <li>JavaScript</li>
            <li>Tailwind CSS</li>
            <li>MongoDB</li>
            <li>Mongoose</li>
            <li>Frontend and Backend Separation</li>
          </ul>
        </div>

        <div className="pt-6 space-y-4 flex flex-col">
          <Link
            href="/api/health/database"
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-colors"
          >
            Test Database Connection
          </Link>
          <Link
            href="/dashboard"
            className="w-full flex justify-center py-3 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-colors"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}

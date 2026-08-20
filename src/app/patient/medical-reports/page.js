import { FileText, Download, Calendar, Activity, Eye } from "lucide-react";
import { connectDB } from "@/backend/database/connectDB";
import MedicalReport from "@/backend/models/MedicalReport";
import { getAuthenticatedUser } from "@/backend/utils/getAuthenticatedUser";
import Link from "next/link";

export const metadata = {
  title: "Medical Reports | Patient Portal",
};

export default async function PatientReportsPage() {
  await connectDB();
  const authUser = await getAuthenticatedUser();
  
  let reports = [];
  if (authUser && authUser.patientId) {
    reports = await MedicalReport.find({ patientId: authUser.patientId })
      .populate('clinicId', 'name')
      .populate('doctorId', 'name specialization')
      .sort({ reportDate: -1, createdAt: -1 })
      .lean();
  }

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Medical Reports</h1>
        <p className="text-gray-600">View and download your test results and clinical reports.</p>
      </div>

      {reports.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <div className="w-16 h-16 bg-gray-50 text-gray-400 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="h-8 w-8" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">No Medical Reports</h3>
          <p className="text-gray-500 max-w-md mx-auto">
            You don't have any medical reports uploaded to your account.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Report Info</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Clinic & Doctor</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {reports.map((report) => (
                  <tr key={report._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-gray-900 flex items-center gap-2">
                        <FileText className="w-4 h-4 text-blue-500" />
                        {report.title}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">ID: {report.reportCode}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 uppercase tracking-wider border border-blue-100">
                        {report.reportType.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-sm text-gray-600">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        {new Date(report.reportDate).toLocaleDateString('en-GB')}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{report.clinicId?.name || 'External'}</div>
                      <div className="text-xs text-gray-500">Dr. {report.doctorId?.name || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <Link href={report.fileUrl || '#'} target="_blank" className="text-gray-500 hover:text-blue-600 transition-colors flex items-center gap-1 text-sm font-medium">
                          <Eye className="w-4 h-4" /> View
                        </Link>
                        <Link href={report.fileUrl || '#'} download className="text-gray-500 hover:text-blue-600 transition-colors flex items-center gap-1 text-sm font-medium">
                          <Download className="w-4 h-4" /> Download
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useState, useEffect, use } from "react";
import { getReport } from "@/frontend/services/reportApi";
import ReportReviewCard from "@/frontend/components/reports/ReportReviewCard";
import PageHeader from "@/frontend/components/dashboard/PageHeader";
import Button from "@/frontend/components/ui/Button";
import { useRouter } from "next/navigation";
import { ReportStatusBadge } from "@/frontend/components/reports/StatusBadge";
import Link from "next/link";
import { useAuth } from "@/frontend/context/AuthContext";

export default function ReportDetailPage({ params }) {
  const router = useRouter();
  const { reportId } = use(params);
  const { user } = useAuth();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchReport();
  }, [reportId]);

  const fetchReport = async () => {
    try {
      setLoading(true);
      const data = await getReport(reportId);
      setReport(data);
    } catch (err) {
      setError(err.message || "Failed to load report");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500 animate-pulse">Loading report...</div>;
  }

  if (error || !report) {
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-4">{error || "Report not found"}</div>
        <Button variant="outline" onClick={() => router.back()}>Go Back</Button>
      </div>
    );
  }

  const isImage = [".jpg", ".jpeg", ".png", ".webp"].some(ext => report.fileUrl?.toLowerCase().endsWith(ext));
  
  // Can review only if user is a doctor
  const canReview = user?.role === "doctor" && report.reviewStatus !== "reviewed";

  return (
    <div className="pb-10 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <PageHeader 
          title="Medical Report Details" 
          description={`Report Code: ${report.reportCode} | Linked to Patient: ${report.patientId?.fullName}`} 
        />
        <Button variant="outline" onClick={() => router.back()}>Back</Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Metadata & Review */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border p-5">
             <div className="flex justify-between items-start mb-4 pb-4 border-b">
               <div>
                 <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">Status</h3>
                 <ReportStatusBadge status={report.reviewStatus} />
               </div>
               <div className="text-right">
                 <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">Date</h3>
                 <p className="font-medium">{new Date(report.reportDate).toLocaleDateString()}</p>
               </div>
             </div>

             <dl className="space-y-4 text-sm">
               <div>
                 <dt className="text-gray-500 mb-1">Report Title & Type</dt>
                 <dd className="font-medium text-gray-900">{report.title}</dd>
                 <dd className="text-gray-600 capitalize">{report.reportType.replace(/_/g, ' ')}</dd>
               </div>

               <div>
                 <dt className="text-gray-500 mb-1">Patient</dt>
                 <dd className="font-medium text-blue-600 hover:underline">
                   <Link href={`/dashboard/patients/${report.patientId?._id}`}>
                     {report.patientId?.fullName} ({report.patientId?.patientCode})
                   </Link>
                 </dd>
               </div>

               {report.recommendedTestId && (
                 <div>
                   <dt className="text-gray-500 mb-1">Linked Test</dt>
                   <dd className="font-medium text-gray-900">
                     {report.recommendedTestId.name} 
                     <span className="text-gray-500 ml-2">({report.recommendedTestId.testCode})</span>
                   </dd>
                 </div>
               )}

               <div>
                 <dt className="text-gray-500 mb-1">Uploaded By</dt>
                 <dd className="text-gray-900">{report.uploadedByUserId?.name} <span className="text-gray-500 capitalize">({report.uploadedByUserId?.role})</span></dd>
                 <dd className="text-xs text-gray-500 mt-1">{new Date(report.uploadedAt).toLocaleString()}</dd>
               </div>

               {report.notes && (
                 <div className="pt-4 border-t">
                   <dt className="text-gray-500 mb-1">Additional Notes</dt>
                   <dd className="text-gray-700 bg-gray-50 p-3 rounded-lg border">{report.notes}</dd>
                 </div>
               )}
             </dl>
          </div>

          {(canReview || report.reviewStatus === "reviewed") && (
            <ReportReviewCard report={report} onSuccess={fetchReport} />
          )}

        </div>

        {/* Right Column: File Preview */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border p-5 h-full flex flex-col">
            <div className="flex justify-between items-center mb-4 pb-4 border-b">
              <div>
                <h3 className="font-bold text-gray-900">File Preview</h3>
                <p className="text-xs text-gray-500">{report.fileName} ({(report.fileSize / 1024 / 1024).toFixed(2)} MB)</p>
              </div>
              <a 
                href={report.fileUrl} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="px-4 py-2 bg-blue-50 text-blue-700 text-sm font-medium rounded-lg hover:bg-blue-100 transition-colors"
              >
                Open in New Tab
              </a>
            </div>

            <div className="flex-1 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center min-h-[500px]">
              {isImage ? (
                <img src={report.fileUrl} alt={report.title} className="max-w-full max-h-full object-contain" />
              ) : report.fileUrl?.toLowerCase().endsWith(".pdf") ? (
                <iframe src={report.fileUrl} className="w-full h-full border-0" title="PDF Preview"></iframe>
              ) : (
                <div className="text-center text-gray-500 p-8">
                  <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                  <p>Preview not available for this file type.</p>
                  <p className="text-sm mt-2">Please click "Open in New Tab" to view or download.</p>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

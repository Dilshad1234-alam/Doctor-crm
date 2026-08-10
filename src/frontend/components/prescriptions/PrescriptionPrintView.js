"use client";

import React from "react";

export default function PrescriptionPrintView({ prescription }) {
  if (!prescription) return null;

  const {
    clinic,
    doctor,
    patient,
    medicines = [],
    generalInstructions,
    recommendedTests = [],
    followUp,
    prescriptionCode,
    finalizedAt,
    createdAt
  } = prescription;

  // We are missing clinic details in the lookup right now, but assuming we pass it in or it's fetched
  // Currently the API just returns object IDs for some of these unless they were fully populated.
  // We'll render based on what is available.

  const doc = doctor || {};
  const docUser = doc.userId || {};
  const pat = patient || {};
  
  const dateToPrint = finalizedAt || createdAt;

  return (
    <div className="bg-white text-black p-8 max-w-4xl mx-auto shadow-sm print:shadow-none print:w-full print:max-w-none print:p-0">
      
      {/* Header */}
      <div className="border-b-2 border-gray-800 pb-4 mb-6 flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold uppercase tracking-wider">{docUser.name || "Doctor Name"}</h1>
          <p className="text-sm font-semibold">{doc.qualification || "MBBS"}</p>
          <p className="text-sm text-gray-700">{doc.specialization || "General Physician"}</p>
          <p className="text-sm text-gray-700">Reg No: {doc.registrationNumber || "N/A"}</p>
        </div>
        <div className="text-right">
          {/* If we had clinic data, it goes here. Using a placeholder for now as per spec */}
          <h2 className="text-xl font-bold">The Clinic</h2>
          <p className="text-sm text-gray-700">123 Health Avenue, City</p>
          <p className="text-sm text-gray-700">Phone: +1 234 567 890</p>
        </div>
      </div>

      {/* Patient Info */}
      <div className="flex justify-between items-center mb-6 text-sm border-b border-gray-300 pb-4">
        <div>
          <p><strong>Patient Name:</strong> {pat.fullName || "N/A"}</p>
          <p><strong>Age / Gender:</strong> {pat.age || "--"} / {pat.gender || "--"}</p>
          <p><strong>Patient ID:</strong> {pat.patientCode || "--"}</p>
        </div>
        <div className="text-right">
          <p><strong>Date:</strong> {dateToPrint ? new Date(dateToPrint).toLocaleDateString() : "N/A"}</p>
          <p><strong>RX Code:</strong> {prescriptionCode || "RX-XXXXXX"}</p>
        </div>
      </div>

      <div className="min-h-[500px]">
        {/* RX Symbol */}
        <div className="text-3xl font-serif font-bold italic mb-6">Rx</div>

        {/* Medicines */}
        {medicines.length > 0 && (
          <div className="mb-8">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-gray-300">
                  <th className="py-2 w-10 text-center">#</th>
                  <th className="py-2">Medicine & Strength</th>
                  <th className="py-2">Dosage & Freq</th>
                  <th className="py-2">Duration</th>
                  <th className="py-2">Timing</th>
                </tr>
              </thead>
              <tbody>
                {medicines.map((m, i) => (
                  <tr key={i} className="border-b border-gray-100 align-top">
                    <td className="py-3 text-center text-gray-600">{i + 1}.</td>
                    <td className="py-3 font-semibold">
                      {m.medicineName} {m.strength && <span className="font-normal text-gray-600">({m.strength})</span>}
                      {m.route && m.route !== 'oral' && <div className="text-xs text-gray-500 font-normal">Route: {m.route}</div>}
                      {m.instructions && <div className="text-xs italic text-gray-600 mt-1">{m.instructions}</div>}
                    </td>
                    <td className="py-3">
                      {m.dosage} <br/>
                      <span className="text-gray-600 text-xs uppercase">{m.frequency === 'custom' ? m.customFrequency : m.frequency.replace(/_/g, ' ')}</span>
                    </td>
                    <td className="py-3">{m.durationValue} {m.durationUnit}</td>
                    <td className="py-3 capitalize text-gray-800">{m.foodTiming.replace(/_/g, ' ')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* General Instructions */}
        {generalInstructions && (
          <div className="mb-8">
            <h3 className="font-bold border-b border-gray-200 pb-1 mb-2">Advice / Instructions</h3>
            <p className="text-sm whitespace-pre-wrap">{generalInstructions}</p>
          </div>
        )}

        {/* Recommended Tests */}
        {recommendedTests && recommendedTests.length > 0 && (
          <div className="mb-8">
            <h3 className="font-bold border-b border-gray-200 pb-1 mb-2">Recommended Tests</h3>
            <ul className="list-disc pl-5 text-sm space-y-1">
              {recommendedTests.map((t, i) => (
                <li key={i}>
                  {t.name}
                  {t.instructions && <span className="text-gray-500 text-xs ml-2">({t.instructions})</span>}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Follow Up */}
        {followUp?.required && (
          <div className="mb-8">
            <h3 className="font-bold border-b border-gray-200 pb-1 mb-2">Follow Up</h3>
            <p className="text-sm">
              <strong>Date:</strong> {followUp.date ? new Date(followUp.date).toLocaleDateString() : "TBD"}
            </p>
            {followUp.reason && <p className="text-sm mt-1 text-gray-700">{followUp.reason}</p>}
          </div>
        )}
      </div>

      {/* Footer / Signature */}
      <div className="mt-16 flex justify-end">
        <div className="text-center w-64">
          <div className="border-b border-gray-800 mb-2 h-10"></div>
          <p className="font-bold text-sm">{docUser.name || "Doctor Signature"}</p>
          <p className="text-xs text-gray-600">Reg: {doc.registrationNumber || "N/A"}</p>
        </div>
      </div>
    </div>
  );
}

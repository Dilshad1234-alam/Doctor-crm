import React, { useState } from "react";
import Button from "@/frontend/components/ui/Button";

export default function BillingFilters({ filters, onFilterChange }) {
  const [localFilters, setLocalFilters] = useState(filters);

  const handleChange = (e) => {
    setLocalFilters({ ...localFilters, [e.target.name]: e.target.value });
  };

  const handleApply = () => {
    onFilterChange(localFilters);
  };

  const handleClear = () => {
    const cleared = { search: "", status: "all", dateFrom: "", dateTo: "" };
    setLocalFilters(cleared);
    onFilterChange(cleared);
  };

  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm mb-6 flex flex-col md:flex-row gap-4 items-end">
      <div className="flex-1 w-full">
        <label className="block text-xs font-medium text-gray-700 mb-1">Search</label>
        <input
          type="text"
          name="search"
          value={localFilters.search}
          onChange={handleChange}
          placeholder="Invoice Code, Patient Name..."
          className="w-full text-sm border-gray-300 rounded-md"
        />
      </div>
      <div className="w-full md:w-48">
        <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
        <select
          name="status"
          value={localFilters.status}
          onChange={handleChange}
          className="w-full text-sm border-gray-300 rounded-md"
        >
          <option value="all">All Statuses</option>
          <option value="paid">Paid</option>
          <option value="partially_paid">Partially Paid</option>
          <option value="unpaid">Unpaid</option>
        </select>
      </div>
      <div className="w-full md:w-40">
        <label className="block text-xs font-medium text-gray-700 mb-1">From Date</label>
        <input
          type="date"
          name="dateFrom"
          value={localFilters.dateFrom}
          onChange={handleChange}
          className="w-full text-sm border-gray-300 rounded-md"
        />
      </div>
      <div className="w-full md:w-40">
        <label className="block text-xs font-medium text-gray-700 mb-1">To Date</label>
        <input
          type="date"
          name="dateTo"
          value={localFilters.dateTo}
          onChange={handleChange}
          className="w-full text-sm border-gray-300 rounded-md"
        />
      </div>
      <div className="flex gap-2 w-full md:w-auto">
        <Button onClick={handleApply}>Apply</Button>
        <Button variant="outline" onClick={handleClear}>Clear</Button>
      </div>
    </div>
  );
}

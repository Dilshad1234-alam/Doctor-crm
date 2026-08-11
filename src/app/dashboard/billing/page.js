"use client";

import { useState, useEffect } from "react";
import PageHeader from "@/frontend/components/dashboard/PageHeader";
import BillingSummaryCards from "@/frontend/components/billing/BillingSummaryCards";
import BillingFilters from "@/frontend/components/billing/BillingFilters";
import InvoiceTable from "@/frontend/components/billing/InvoiceTable";
import { getInvoices } from "@/frontend/services/billingApi";

export default function BillingPage() {
  const [invoices, setInvoices] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [filters, setFilters] = useState({
    status: "all",
    search: "",
    dateFrom: "",
    dateTo: ""
  });

  const fetchData = async (currentFilters) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getInvoices(currentFilters);
      setInvoices(data.invoices || []);
      setSummary(data.summary || null);
    } catch (err) {
      console.error(err);
      setError("Unable to load billing information.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(filters);
  }, []);

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    fetchData(newFilters);
  };

  return (
    <div className="pb-20 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-[#0f3d69] to-[#2ab5e1]">Billing</h1>
          <p className="mt-2 text-sm font-medium text-gray-500">Manage invoices, payments and pending balances.</p>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl border border-red-100 shadow-sm font-medium">
          {error}
        </div>
      )}

      {!error && (
        <>
          <BillingSummaryCards summary={summary} />
          
          <BillingFilters 
            filters={filters} 
            onFilterChange={handleFilterChange} 
          />

          <div className="bg-white rounded-[2rem] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
            <InvoiceTable invoices={invoices} loading={loading} />
          </div>
        </>
      )}
    </div>
  );
}

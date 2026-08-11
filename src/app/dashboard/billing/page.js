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
      <PageHeader 
        title="Billing" 
        description="Manage invoices, payments and pending balances." 
      />

      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">
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

          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <InvoiceTable invoices={invoices} loading={loading} />
          </div>
        </>
      )}
    </div>
  );
}

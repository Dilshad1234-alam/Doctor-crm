export async function getInvoices(query = {}) {
  const params = new URLSearchParams();
  if (query.status) params.append("status", query.status);
  if (query.search) params.append("search", query.search);
  if (query.dateFrom) params.append("dateFrom", query.dateFrom);
  if (query.dateTo) params.append("dateTo", query.dateTo);

  const res = await fetch(`/api/invoices?${params.toString()}`);
  return res.json();
}

export async function getInvoiceById(invoiceId) {
  const res = await fetch(`/api/invoices/${invoiceId}`);
  return res.json();
}

export async function createInvoice(appointmentId, data) {
  const res = await fetch(`/api/appointments/${appointmentId}/invoice`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  return res.json();
}

export async function recordPayment(invoiceId, data) {
  const res = await fetch(`/api/invoices/${invoiceId}/payments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  return res.json();
}

export async function getPayments(invoiceId) {
  const res = await fetch(`/api/invoices/${invoiceId}/payments`);
  return res.json();
}

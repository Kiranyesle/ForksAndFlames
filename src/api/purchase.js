// Utility to fetch purchase data with filters
export async function fetchPurchaseData({ companyId, date }) {
  const params = [];
  if (companyId) params.push(`companyId=${companyId}`);
  if (date) params.push(`date=${encodeURIComponent(date)}`);
  const query = params.length ? `?${params.join('&')}` : '';
  const res = await fetch(`https://forkandflamesapi.onrender.com/api/purchase${query}`);
  if (!res.ok) throw new Error('Failed to fetch purchase data');
  return res.json();
}

// Utility to download purchase data as Excel
export function downloadPurchaseExcel({ companyId, date }) {
  const params = [];
  if (companyId) params.push(`companyId=${companyId}`);
  if (date) params.push(`date=${encodeURIComponent(date)}`);
  const query = params.length ? `?${params.join('&')}` : '';
  window.open(`https://forkandflamesapi.onrender.com/api/purchase/download${query}`, '_blank');
}

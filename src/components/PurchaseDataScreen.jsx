
import React, { useEffect, useState } from 'react';
import Select from 'react-select';
import { fetchPurchaseData, downloadPurchaseExcel } from '../api/purchase';

export default function PurchaseDataScreen() {
  const [purchaseData, setPurchaseData] = useState([]);
  const [filters, setFilters] = useState({ companyId: '', date: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setError('');
    // Only fetch if any filter is set, otherwise show nothing
    if (!filters.companyId && !filters.date) {
      setPurchaseData([]);
      return;
    }
    setLoading(true);
    fetchPurchaseData(filters)
      .then(setPurchaseData)
      .catch(e => setError(e.message || 'Failed to fetch purchase data'))
      .finally(() => setLoading(false));
  }, [filters]);

  // Dummy companies for filter dropdown (replace with prop if needed)
  const [companies, setCompanies] = useState([]);
  useEffect(() => {
    fetch('https://forkandflamesapi.onrender.com/api/companies')
      .then(res => res.json())
      .then(setCompanies)
      .catch(() => setCompanies([]));
  }, []);

  // Prepare options for react-select
  const companyOptions = [
    { value: '', label: 'All Companies' },
    ...companies.map(c => ({ value: c.id, label: c.name }))
  ];

  return (
    <div
      style={{
        maxWidth: 900,
        margin: '40px auto',
        background: '#fff',
        borderRadius: 12,
        boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
        padding: 32,
        width: '100%',
      }}
    >
      <h1 style={{ color: '#1976d2', marginBottom: 24, fontSize: '1.5rem' }}>Purchase Data</h1>
      <div
        className="purchase-data-filter"
        style={{
          display: 'flex',
          gap: 12,
          marginBottom: 16,
          flexWrap: 'wrap',
          alignItems: 'center',
        }}
      >
        <div style={{ width: 220, minWidth: 120, maxWidth: 260, flex: '0 0 220px' }}>
          <Select
            options={companyOptions}
            value={companyOptions.find(opt => opt.value === filters.companyId) || companyOptions[0]}
            onChange={opt => setFilters(f => ({ ...f, companyId: opt.value }))}
            placeholder="Search and select company"
            isSearchable
            styles={{
              container: base => ({ ...base, width: 220, minWidth: 120, maxWidth: 260 }),
              menu: base => ({ ...base, zIndex: 9999 }),
              control: base => ({ ...base, minHeight: 38, fontSize: 15 }),
            }}
          />
        </div>
        <input
          type="date"
          placeholder="Date"
          value={filters.date}
          onChange={e => setFilters(f => ({ ...f, date: e.target.value }))}
          style={{
            minWidth: 140,
            flex: 1,
            padding: '10px 14px',
            borderRadius: 8,
            border: '2px solid #1976d2',
            fontSize: 15,
            background: '#f4f8fd',
            color: '#1a237e',
            marginRight: 0,
            marginBottom: 0,
            outline: 'none',
            boxShadow: '0 1px 4px rgba(25, 118, 210, 0.07)',
            transition: 'border 0.2s, box-shadow 0.2s',
          }}
        />
        <button
          className="btn btn-secondary"
          onClick={() => downloadPurchaseExcel(filters)}
          style={{ minWidth: 120, flex: 1, marginLeft: 0 }}
        >Download Excel</button>
      </div>
      {loading && <div>Loading...</div>}
      {error && <div style={{ color: 'red' }}>{error}</div>}
      <div style={{ width: '100%', overflowX: 'auto' }}>
        {purchaseData.length > 0 ? (
          <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fafbfc', minWidth: 500 }}>
            <thead>
              <tr style={{ background: '#e3f2fd' }}>
                <th style={{ border: '1px solid #bbb', padding: 10 }}>Company Name</th>
                <th style={{ border: '1px solid #bbb', padding: 10 }}>Date</th>
                <th style={{ border: '1px solid #bbb', padding: 10 }}>Quantity</th>
                <th style={{ border: '1px solid #bbb', padding: 10 }}>Total Price</th>
              </tr>
            </thead>
            <tbody>
              {purchaseData.map((row, idx) => (
                <tr key={idx}>
                  <td style={{ border: '1px solid #ddd', padding: 8 }}>{row.companyName || row.companyId}</td>
                  <td style={{ border: '1px solid #ddd', padding: 8 }}>
                    {row.purchaseTime
                      ? new Date(row.purchaseTime).toLocaleString()
                      : row.date
                        ? new Date(row.date).toLocaleString()
                        : row.createdAt
                          ? new Date(row.createdAt).toLocaleString()
                          : ''}
                  </td>
                  <td style={{ border: '1px solid #ddd', padding: 8 }}>{row.quantity}</td>
                  <td style={{ border: '1px solid #ddd', padding: 8 }}>{row.totalPrice}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : !loading && (
          <div style={{ color: '#888' }}>No purchase data found for selected filters.</div>
        )}
      </div>
    </div>
  );
}

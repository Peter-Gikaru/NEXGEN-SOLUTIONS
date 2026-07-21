import React, { useState } from 'react';
import { Plus, Trash2, Download, Play, Table as TableIcon } from 'lucide-react';
import api from '../../services/api';
import Papa from 'papaparse';
import toast from 'react-hot-toast';

const ALLOWED_TABLES: Record<string, string[]> = {
  user: ['id', 'email', 'name', 'role', 'status', 'createdAt', 'updatedAt'],
  product: ['id', 'name', 'slug', 'description', 'price', 'stock', 'brand', 'isActive', 'condition', 'createdAt', 'updatedAt'],
  order: ['id', 'userId', 'totalAmount', 'orderStatus', 'paymentStatus', 'paymentMethod', 'shippingAddress', 'createdAt', 'updatedAt'],
  orderitem: ['id', 'orderId', 'productId', 'quantity', 'price', 'createdAt'],
  category: ['id', 'name', 'slug'],
  review: ['id', 'productId', 'userId', 'rating', 'comment', 'createdAt'],
  promocode: ['id', 'code', 'discountValue', 'discountType', 'expiryDate', 'active', 'usedCount', 'createdAt'],
  returnrequest: ['id', 'orderId', 'userId', 'reason', 'status', 'adminNotes', 'createdAt', 'updatedAt'],
  warrantyclaim: ['id', 'orderId', 'productId', 'userId', 'issueType', 'description', 'status', 'adminNotes', 'createdAt', 'updatedAt'],
  adminlog: ['id', 'adminId', 'action', 'details', 'ipAddress', 'createdAt'],
  paymenttransaction: ['id', 'orderId', 'provider', 'providerRef', 'amount', 'status', 'createdAt', 'updatedAt'],
  auditlog: ['id', 'userId', 'sessionId', 'action', 'details', 'ipAddress', 'userAgent', 'severity', 'createdAt']
};

interface FilterRule {
  id: string;
  field: string;
  operator: string;
  value: string;
}

export const AdminCustomReports = () => {
  const [selectedTable, setSelectedTable] = useState<string>('order');
  const [selectedFields, setSelectedFields] = useState<string[]>(ALLOWED_TABLES['order']);
  const [filters, setFilters] = useState<FilterRule[]>([]);
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const handleTableChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const table = e.target.value;
    setSelectedTable(table);
    setSelectedFields(ALLOWED_TABLES[table]); // Select all by default
    setFilters([]); // Reset filters
    setResults([]);
  };

  const handleFieldToggle = (field: string) => {
    setSelectedFields(prev => 
      prev.includes(field) 
        ? prev.filter(f => f !== field)
        : [...prev, field]
    );
  };

  const addFilter = () => {
    setFilters([...filters, {
      id: Math.random().toString(36).substring(7),
      field: ALLOWED_TABLES[selectedTable][0],
      operator: '=',
      value: ''
    }]);
  };

  const removeFilter = (id: string) => {
    setFilters(filters.filter(f => f.id !== id));
  };

  const updateFilter = (id: string, key: keyof FilterRule, value: string) => {
    setFilters(filters.map(f => f.id === id ? { ...f, [key]: value } : f));
  };

  const executeQuery = async () => {
    if (selectedFields.length === 0) {
      toast.error('Please select at least one field');
      return;
    }
    setLoading(true);
    try {
      const payload = {
        table: selectedTable,
        fields: selectedFields,
        filters: filters.filter(f => f.value.trim() !== '') // ignore empty filters
      };
      const res = await api.post('/admin/reports/dynamic', payload);
      setResults(res.data);
      if (res.data.length === 0) {
        toast.success('Query executed successfully, but returned 0 results.');
      } else {
        toast.success(`Fetched ${res.data.length} records.`);
      }
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Failed to execute query');
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    if (results.length === 0) {
      toast.error('No results to export');
      return;
    }
    const csv = Papa.unparse(results);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `${selectedTable}_report_${new Date().getTime()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <TableIcon className="w-6 h-6 text-blue-600" />
            Custom Report Builder
          </h2>
          <p className="text-sm text-gray-500">Construct dynamic queries across all database tables.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <h3 className="font-bold text-slate-800 mb-3 text-sm uppercase tracking-wider">1. Select Data Source</h3>
            <select
              value={selectedTable}
              onChange={handleTableChange}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {Object.keys(ALLOWED_TABLES).map(t => (
                <option key={t} value={t}>{t.toUpperCase()}</option>
              ))}
            </select>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <h3 className="font-bold text-slate-800 mb-3 text-sm uppercase tracking-wider flex items-center justify-between">
              2. Select Fields
              <span className="text-xs font-normal text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">{selectedFields.length} selected</span>
            </h3>
            <div className="max-h-[300px] overflow-y-auto pr-2 space-y-2">
              {ALLOWED_TABLES[selectedTable].map(field => (
                <label key={field} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-slate-50 p-1.5 rounded">
                  <input 
                    type="checkbox"
                    checked={selectedFields.includes(field)}
                    onChange={() => handleFieldToggle(field)}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-slate-700 font-medium">{field}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-3 space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider">3. Filter Rules</h3>
              <button onClick={addFilter} className="text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors">
                <Plus className="w-3 h-3" /> Add Rule
              </button>
            </div>
            
            {filters.length === 0 ? (
              <div className="text-center py-6 border-2 border-dashed border-slate-200 rounded-lg bg-slate-50">
                <p className="text-sm text-slate-500">No filters applied. Query will return all records (up to 1000 limit).</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filters.map((filter, index) => (
                  <div key={filter.id} className="flex flex-wrap items-center gap-2 bg-slate-50 p-3 rounded-lg border border-slate-200">
                    <span className="text-xs font-bold text-slate-400 w-6">{index + 1}.</span>
                    <select
                      value={filter.field}
                      onChange={(e) => updateFilter(filter.id, 'field', e.target.value)}
                      className="border border-slate-200 rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[140px]"
                    >
                      {ALLOWED_TABLES[selectedTable].map(f => <option key={f} value={f}>{f}</option>)}
                    </select>
                    <select
                      value={filter.operator}
                      onChange={(e) => updateFilter(filter.id, 'operator', e.target.value)}
                      className="border border-slate-200 rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    >
                      <option value="=">Equals (=)</option>
                      <option value="!=">Not Equals (!=)</option>
                      <option value=">">Greater Than (&gt;)</option>
                      <option value=">=">Greater/Equal (&gt;=)</option>
                      <option value="<">Less Than (&lt;)</option>
                      <option value="<=">Less/Equal (&lt;=)</option>
                      <option value="contains">Contains</option>
                      <option value="startsWith">Starts With</option>
                      <option value="endsWith">Ends With</option>
                      <option value="in">In (comma separated)</option>
                    </select>
                    <input
                      type="text"
                      placeholder="Value"
                      value={filter.value}
                      onChange={(e) => updateFilter(filter.id, 'value', e.target.value)}
                      className="flex-1 border border-slate-200 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[150px]"
                    />
                    <button onClick={() => removeFilter(filter.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-md transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                onClick={executeQuery}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-bold text-sm shadow-sm transition-colors flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                ) : (
                  <Play className="w-4 h-4 fill-current" />
                )}
                Execute Query
              </button>
            </div>
          </div>
          
          {/* Results Grid */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col h-[500px]">
            <div className="px-5 py-4 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between shrink-0">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                Results Preview 
                <span className="bg-blue-100 text-blue-700 text-xs py-0.5 px-2 rounded-full font-black">{results.length}</span>
              </h3>
              <button
                onClick={handleExportCSV}
                disabled={results.length === 0}
                className="text-xs font-bold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 px-3 py-1.5 rounded-lg flex items-center gap-2 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download className="w-3.5 h-3.5" /> Export to CSV
              </button>
            </div>
            
            <div className="flex-1 overflow-auto bg-white p-0 relative">
              {results.length === 0 ? (
                <div className="absolute inset-0 flex items-center justify-center text-slate-400 text-sm">
                  {loading ? 'Running query...' : 'Execute a query to see results here.'}
                </div>
              ) : (
                <table className="w-full text-left text-sm border-collapse whitespace-nowrap">
                  <thead className="sticky top-0 bg-slate-100 shadow-[0_1px_0_0_#e2e8f0] z-10">
                    <tr>
                      {selectedFields.map(field => (
                        <th key={field} className="py-2.5 px-4 font-semibold text-slate-700">{field}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((row, i) => (
                      <tr key={i} className="border-b border-slate-100 hover:bg-blue-50/50 transition-colors">
                        {selectedFields.map(field => {
                          let val = row[field];
                          if (typeof val === 'boolean') val = val ? 'True' : 'False';
                          else if (val === null) val = 'NULL';
                          else if (typeof val === 'object') val = JSON.stringify(val);
                          return (
                            <td key={field} className="py-2.5 px-4 text-slate-600">
                              <span className="truncate block max-w-[200px]" title={String(val)}>{String(val)}</span>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

export const AdminReturns: React.FC = () => {
  const [returns, setReturns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReturns();
    const interval = setInterval(() => fetchReturns(true), 15000);
    return () => clearInterval(interval);
  }, []);

  const fetchReturns = async (isBackground = false) => {
    try {
      if (!isBackground) setLoading(true);
      const response = await api.get('/admin/returns');
      setReturns(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      await api.put(`/admin/returns/${id}`, { status });
      toast.success('Return status updated');
      fetchReturns();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  if (loading && returns.length === 0) return <div>Loading returns...</div>;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Manage Returns</h2>
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-700">
            <tr>
              <th className="p-4 font-semibold">ID</th>
              <th className="p-4 font-semibold">Order ID</th>
              <th className="p-4 font-semibold">Reason</th>
              <th className="p-4 font-semibold">Status</th>
              <th className="p-4 font-semibold">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {returns.map(req => (
              <tr key={req.id}>
                <td className="p-4 text-xs font-mono">{req.id.slice(-6)}</td>
                <td className="p-4">{req.orderId}</td>
                <td className="p-4">{req.reason}</td>
                <td className="p-4">
                  <span className="px-2 py-1 bg-amber-100 text-amber-800 rounded font-semibold text-xs">
                    {req.status}
                  </span>
                </td>
                <td className="p-4 flex gap-2">
                  {req.status === 'PENDING' && (
                    <>
                      <button onClick={() => updateStatus(req.id, 'APPROVED')} className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded hover:bg-emerald-200">Approve</button>
                      <button onClick={() => updateStatus(req.id, 'REJECTED')} className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded hover:bg-red-200">Reject</button>
                    </>
                  )}
                </td>
              </tr>
            ))}
            {returns.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-slate-500">No returns found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminReturns;

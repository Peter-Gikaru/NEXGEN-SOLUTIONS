import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

export const AdminWarranties: React.FC = () => {
  const [warranties, setWarranties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWarranties();
  }, []);

  const fetchWarranties = async () => {
    try {
      const response = await api.get('/admin/warranties');
      setWarranties(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      await api.put(`/admin/warranties/${id}`, { status });
      toast.success('Warranty status updated');
      fetchWarranties();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  if (loading) return <div>Loading warranties...</div>;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Manage Warranties</h2>
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-700">
            <tr>
              <th className="p-4 font-semibold">ID</th>
              <th className="p-4 font-semibold">Product ID</th>
              <th className="p-4 font-semibold">Issue Type</th>
              <th className="p-4 font-semibold">Status</th>
              <th className="p-4 font-semibold">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {warranties.map(claim => (
              <tr key={claim.id}>
                <td className="p-4 text-xs font-mono">{claim.id.slice(-6)}</td>
                <td className="p-4">{claim.productId}</td>
                <td className="p-4">{claim.issueType}</td>
                <td className="p-4">
                  <span className="px-2 py-1 bg-amber-100 text-amber-800 rounded font-semibold text-xs">
                    {claim.status}
                  </span>
                </td>
                <td className="p-4 flex gap-2">
                  {claim.status === 'PENDING' && (
                    <>
                      <button onClick={() => updateStatus(claim.id, 'IN_PROGRESS')} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200">Start</button>
                      <button onClick={() => updateStatus(claim.id, 'REJECTED')} className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded hover:bg-red-200">Reject</button>
                    </>
                  )}
                  {claim.status === 'IN_PROGRESS' && (
                    <button onClick={() => updateStatus(claim.id, 'RESOLVED')} className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded hover:bg-emerald-200">Resolve</button>
                  )}
                </td>
              </tr>
            ))}
            {warranties.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-slate-500">No warranties found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminWarranties;

import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { Tag } from 'lucide-react';

export const AdminCoupons: React.FC = () => {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [form, setForm] = useState({
    code: '',
    discountType: 'PERCENT',
    discountValue: 10,
    maxUses: 100,
    expiryDate: '',
    isForAbandonedCart: false,
  });
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    fetchCoupons();
    const interval = setInterval(() => fetchCoupons(true), 15000);
    return () => clearInterval(interval);
  }, []);

  const fetchCoupons = async (isBackground = false) => {
    try {
      if (!isBackground) setLoading(true);
      const response = await api.get('/admin/coupons');
      setCoupons(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    try {
      const payload = {
        ...form,
        code: form.code.trim().toUpperCase(),
        discountValue: Number(form.discountValue),
        maxUses: Number(form.maxUses),
      };

      if (editingId) {
        await api.put(`/promo/${editingId}`, payload);
        toast.success('Coupon updated');
      } else {
        await api.post('/promo', payload);
        toast.success('Coupon created');
      }
      
      setForm({ code: '', discountType: 'PERCENT', discountValue: 10, maxUses: 100, expiryDate: '', isForAbandonedCart: false });
      setEditingId(null);
      await fetchCoupons();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save coupon');
    } finally {
      setIsCreating(false);
    }
  };

  const handleEdit = (coupon: any) => {
    setEditingId(coupon.id);
    setForm({
      code: coupon.code,
      discountType: coupon.discountType === 'PERCENTAGE' ? 'PERCENT' : coupon.discountType,
      discountValue: coupon.discountValue,
      maxUses: coupon.maxUses,
      expiryDate: new Date(coupon.expiryDate).toISOString().split('T')[0],
      isForAbandonedCart: coupon.isForAbandonedCart || false,
    });
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this coupon?')) return;
    try {
      await api.delete(`/promo/${id}`);
      toast.success('Coupon deleted');
      await fetchCoupons();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete coupon');
    }
  };


  if (loading) return <div>Loading coupons...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Tag className="w-6 h-6 text-[#F59E0B]" />
          Manage Coupons
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 mb-6 grid grid-cols-1 md:grid-cols-6 gap-4 items-end">
        <div className="md:col-span-2">
          <label className="block text-xs font-bold uppercase tracking-wide text-slate-500 mb-1.5">Code</label>
          <input
            required
            value={form.code}
            onChange={(e) => setForm((prev) => ({ ...prev, code: e.target.value.toUpperCase() }))}
            placeholder="BACKTOSCHOOL"
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:border-[#F59E0B]"
          />
        </div>
        <div>
          <label className="block text-xs font-bold uppercase tracking-wide text-slate-500 mb-1.5">Type</label>
          <select
            value={form.discountType}
            onChange={(e) => setForm((prev) => ({ ...prev, discountType: e.target.value }))}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#F59E0B]"
          >
            <option value="PERCENT">Percent</option>
            <option value="FLAT">Flat KES</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold uppercase tracking-wide text-slate-500 mb-1.5">Value</label>
          <input
            type="number"
            min="1"
            required
            value={form.discountValue}
            onChange={(e) => setForm((prev) => ({ ...prev, discountValue: Number(e.target.value) }))}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#F59E0B]"
          />
        </div>
        <div>
          <label className="block text-xs font-bold uppercase tracking-wide text-slate-500 mb-1.5">Max Uses</label>
          <input
            type="number"
            min="1"
            required
            value={form.maxUses}
            onChange={(e) => setForm((prev) => ({ ...prev, maxUses: Number(e.target.value) }))}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#F59E0B]"
          />
        </div>
        <div>
          <label className="block text-xs font-bold uppercase tracking-wide text-slate-500 mb-1.5">Expiry</label>
          <input
            type="date"
            required
            value={form.expiryDate}
            onChange={(e) => setForm((prev) => ({ ...prev, expiryDate: e.target.value }))}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#F59E0B]"
          />
        </div>
        <div className="md:col-span-6 flex items-center justify-between mt-2">
          <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 cursor-pointer">
            <input 
              type="checkbox" 
              checked={form.isForAbandonedCart}
              onChange={(e) => setForm(prev => ({ ...prev, isForAbandonedCart: e.target.checked }))}
              className="w-4 h-4 text-[#F59E0B] rounded border-slate-300 focus:ring-[#F59E0B]"
            />
            Use for Abandoned Cart Emails
          </label>
          <div className="flex gap-2">
            {editingId && (
              <button
                type="button"
                onClick={() => {
                  setEditingId(null);
                  setForm({ code: '', discountType: 'PERCENT', discountValue: 10, maxUses: 100, expiryDate: '', isForAbandonedCart: false });
                }}
                className="bg-slate-200 text-slate-700 px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-slate-300"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              disabled={isCreating}
              className="bg-[#1a1a2e] text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-slate-800 disabled:opacity-60"
            >
              {isCreating ? 'Saving...' : editingId ? 'Update Coupon' : 'Create Coupon'}
            </button>
          </div>
        </div>
      </form>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-700">
            <tr>
              <th className="p-4 font-semibold">Code</th>
              <th className="p-4 font-semibold">Discount</th>
              <th className="p-4 font-semibold">Uses</th>
              <th className="p-4 font-semibold">Expiry</th>
              <th className="p-4 font-semibold">Tags</th>
              <th className="p-4 font-semibold">Status</th>
              <th className="p-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {coupons.map(coupon => (
              <tr key={coupon.id}>
                <td className="p-4 font-mono font-bold text-[#1a1a2e]">{coupon.code}</td>
                <td className="p-4">
                  {coupon.discountType === 'PERCENTAGE' || coupon.discountType === 'PERCENT' ? `${coupon.discountValue}%` : `KES ${coupon.discountValue}`}
                </td>
                <td className="p-4">{coupon.usedCount} / {coupon.maxUses}</td>
                <td className="p-4">{new Date(coupon.expiryDate).toLocaleDateString()}</td>
                <td className="p-4">
                  {coupon.isForAbandonedCart && (
                    <span className="bg-amber-100 text-amber-800 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded">Abandoned Cart</span>
                  )}
                </td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded font-semibold text-xs ${coupon.active ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                    {coupon.active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="p-4 text-right space-x-3">
                  <button onClick={() => handleEdit(coupon)} className="text-blue-600 hover:text-blue-800 font-medium text-sm">Edit</button>
                  <button onClick={() => handleDelete(coupon.id)} className="text-red-600 hover:text-red-800 font-medium text-sm">Delete</button>
                </td>
              </tr>
            ))}
            {coupons.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-slate-500">No coupons found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminCoupons;

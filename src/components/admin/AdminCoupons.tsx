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
  });

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      const response = await api.get('/admin/coupons');
      setCoupons(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const createCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    try {
      await api.post('/promo', {
        ...form,
        code: form.code.trim().toUpperCase(),
        discountValue: Number(form.discountValue),
        maxUses: Number(form.maxUses),
      });
      toast.success('Coupon created');
      setForm({ code: '', discountType: 'PERCENT', discountValue: 10, maxUses: 100, expiryDate: '' });
      await fetchCoupons();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create coupon');
    } finally {
      setIsCreating(false);
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

      <form onSubmit={createCoupon} className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 mb-6 grid grid-cols-1 md:grid-cols-6 gap-4 items-end">
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
        <button
          type="submit"
          disabled={isCreating}
          className="md:col-span-6 bg-[#1a1a2e] text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-slate-800 disabled:opacity-60"
        >
          {isCreating ? 'Creating...' : 'Create Coupon'}
        </button>
      </form>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-700">
            <tr>
              <th className="p-4 font-semibold">Code</th>
              <th className="p-4 font-semibold">Discount</th>
              <th className="p-4 font-semibold">Uses</th>
              <th className="p-4 font-semibold">Expiry</th>
              <th className="p-4 font-semibold">Status</th>
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
                  <span className={`px-2 py-1 rounded font-semibold text-xs ${coupon.active ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                    {coupon.active ? 'Active' : 'Inactive'}
                  </span>
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

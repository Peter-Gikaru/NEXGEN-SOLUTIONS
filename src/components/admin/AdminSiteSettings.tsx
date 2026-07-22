import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { Save, MapPin } from 'lucide-react';

export const AdminSiteSettings = () => {
  const [storeLocation, setStoreLocation] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);
      try {
        const response = await api.get('/settings');
        setStoreLocation(response.data.storeLocation || '');
      } catch (error) {
        toast.error('Failed to load site settings');
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put('/settings', { storeLocation });
      toast.success('Site settings updated successfully');
    } catch (error) {
      toast.error('Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
        <MapPin className="text-blue-600" />
        Site Settings
      </h2>

      <form onSubmit={handleSave} className="space-y-6 max-w-xl">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Store Location</label>
          <textarea
            value={storeLocation}
            onChange={(e) => setStoreLocation(e.target.value)}
            className="w-full border border-slate-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
            placeholder="Enter the physical address of the store..."
          />
          <p className="text-xs text-gray-500 mt-1">This address will be displayed in the footer and contact pages.</p>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-bold flex items-center gap-2 transition-colors disabled:opacity-70"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </form>
    </div>
  );
};

export default AdminSiteSettings;

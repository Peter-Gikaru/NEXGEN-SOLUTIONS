import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Save, AlertCircle, Volume2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface Announcement {
  id: string;
  text: string;
  link: string;
}

export const AdminAnnouncements: React.FC = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    
    const saved = localStorage.getItem('nexgen_announcements');
    if (saved) {
      try {
        setAnnouncements(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse announcements', e);
        setAnnouncements(getDefaultAnnouncements());
      }
    } else {
      setAnnouncements(getDefaultAnnouncements());
    }
    setLoading(false);
  }, []);

  const getDefaultAnnouncements = (): Announcement[] => [
    {
      id: '1',
      text: "⚡ Flash Sale: Get up to 10% off selected MacBooks today!",
      link: "/products?brand=Apple"
    },
    {
      id: '2',
      text: "🔥 Order Now via WhatsApp: +254 717 043408",
      link: "tel:+254717043408"
    },
    {
      id: '3',
      text: "✅ Free Same-Day Delivery Within Nairobi CBD",
      link: "/shipping"
    }
  ];

  const handleAdd = () => {
    if (announcements.length >= 5) {
      toast.error('You can only have up to 5 announcements.');
      return;
    }
    const newAnn: Announcement = {
      id: Date.now().toString(),
      text: '',
      link: ''
    };
    setAnnouncements([...announcements, newAnn]);
  };

  const handleRemove = (id: string) => {
    setAnnouncements(announcements.filter(a => a.id !== id));
  };

  const handleChange = (id: string, field: keyof Announcement, value: string) => {
    setAnnouncements(announcements.map(a => 
      a.id === id ? { ...a, [field]: value } : a
    ));
  };

  const handleSave = () => {
    setSaving(true);
    // Validate
    const invalid = announcements.find(a => !a.text.trim());
    if (invalid) {
      toast.error('Announcement text cannot be empty.');
      setSaving(false);
      return;
    }
    
    // Save to localStorage
    localStorage.setItem('nexgen_announcements', JSON.stringify(announcements));
    
    
    window.dispatchEvent(new Event('announcements_updated'));
    
    setTimeout(() => {
      setSaving(false);
      toast.success('Announcements updated successfully! Changes are live on the site.');
    }, 500);
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Loading...</div>;
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden text-left">
      <div className="p-6 border-b border-slate-200 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Volume2 className="h-6 w-6 text-[#F59E0B]" />
            Site Announcements
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Manage the scrolling banner at the very top of the website.
          </p>
        </div>
        <button
          onClick={handleAdd}
          disabled={announcements.length >= 5}
          className="flex items-center gap-2 bg-blue-50 text-blue-600 px-4 py-2 rounded-lg font-semibold hover:bg-blue-100 transition-colors disabled:opacity-50 cursor-pointer"
        >
          <Plus className="h-4.5 w-4.5" />
          Add New
        </button>
      </div>

      <div className="p-6">
        <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-6 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800">
            <strong>Pro Tip:</strong> Emojis work great here! To make a phone number clickable on mobile, use <code>tel:+254XXXXXXXXX</code> in the link field. For internal links, use <code>/products</code> or <code>/shipping</code>.
          </div>
        </div>

        {announcements.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-xl">
            <Volume2 className="h-12 w-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-900">No Announcements</h3>
            <p className="text-slate-500 mb-4">You currently have no announcements active.</p>
            <button
              onClick={handleAdd}
              className="bg-[#1a1a2e] text-white px-6 py-2 rounded-lg font-semibold hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Add Your First Announcement
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {announcements.map((ann, index) => (
              <div key={ann.id} className="border border-slate-200 rounded-xl p-4 bg-slate-50 flex gap-4">
                <div className="bg-[#1a1a2e] text-white font-bold h-8 w-8 rounded-full flex items-center justify-center shrink-0">
                  {index + 1}
                </div>
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Announcement Text *</label>
                    <input
                      type="text"
                      value={ann.text}
                      onChange={(e) => handleChange(ann.id, 'text', e.target.value)}
                      placeholder="e.g., ⚡ Flash Sale: Get up to 10% off!"
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#F59E0B]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Link (Optional)</label>
                    <input
                      type="text"
                      value={ann.link}
                      onChange={(e) => handleChange(ann.id, 'link', e.target.value)}
                      placeholder="e.g., /products?category=MacBook or tel:+254..."
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#F59E0B]"
                    />
                  </div>
                </div>
                <button
                  onClick={() => handleRemove(ann.id)}
                  className="shrink-0 p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg h-fit mt-5 transition-colors cursor-pointer"
                  title="Remove Announcement"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="mt-8 pt-6 border-t border-slate-200 flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 bg-[#F59E0B] text-[#1a1a2e] px-8 py-2.5 rounded-lg font-bold hover:bg-amber-500 transition-colors disabled:opacity-50 cursor-pointer shadow-sm"
          >
            {saving ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-[#1a1a2e]/30 border-t-[#1a1a2e] rounded-full animate-spin" />
                Saving...
              </span>
            ) : (
              <>
                <Save className="h-5 w-5" />
                Save & Publish
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
export default AdminAnnouncements;

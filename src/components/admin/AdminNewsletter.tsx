import React, { useState } from 'react';
import { Send, Users, Mail, AlertCircle, CheckCircle2 } from 'lucide-react';
import api from '../../services/api';

const AdminNewsletter: React.FC = () => {
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({ type: null, message: '' });

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !content.trim()) {
      setStatus({ type: 'error', message: 'Subject and content are required.' });
      return;
    }

    if (!window.confirm('Are you sure you want to blast this email to ALL subscribers?')) return;

    setLoading(true);
    setStatus({ type: null, message: '' });

    try {
      const response = await api.post('/newsletter/send-promotion', { subject, content });
      setStatus({ type: 'success', message: response.data.message });
      setSubject('');
      setContent('');
    } catch (error: any) {
      setStatus({ type: 'error', message: error.response?.data?.message || 'Failed to send promotional emails.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-6 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Mail className="h-6 w-6 text-[#F59E0B]" />
            Newsletter Broadcast
          </h2>
          <p className="text-gray-500 text-sm mt-1">Send promotional emails to all your subscribers</p>
        </div>
        <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-full flex items-center gap-2 text-sm font-semibold border border-blue-200">
          <Users className="h-4 w-4" />
          Powered by Brevo
        </div>
      </div>

      <div className="p-6">
        {status.type === 'success' && (
          <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-lg flex items-start gap-3 border border-green-200">
            <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5" />
            <p>{status.message}</p>
          </div>
        )}
        
        {status.type === 'error' && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg flex items-start gap-3 border border-red-200">
            <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
            <p>{status.message}</p>
          </div>
        )}

        <form onSubmit={handleSend} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Email Subject</label>
            <input
              type="text"
              required
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. 🚀 Massive Weekend Sale! Up to 50% Off Laptops"
              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F59E0B] focus:border-transparent transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Email Content (HTML supported)</label>
            <textarea
              required
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={12}
              placeholder="<p>Hello Tech Lovers,</p><p>We are having a massive sale...</p>"
              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F59E0B] focus:border-transparent transition-all font-mono text-sm"
            />
            <p className="text-xs text-gray-500 mt-2">
              Note: This content will automatically be wrapped in the premium NexGen Gadgets email layout (with the header, navigation menu, and footer).
            </p>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="bg-[#F59E0B] text-white font-bold py-3 px-8 rounded-lg flex items-center gap-2 hover:bg-amber-600 transition-colors disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Sending Broadcast...
                </span>
              ) : (
                <>
                  <Send className="h-5 w-5" />
                  Send to All Subscribers
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminNewsletter;

import { useState, useEffect } from 'react';
import api from '../../services/api';
import { ShieldAlert, ShieldCheck, AlertTriangle, Info, Clock, Search, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

export const AdminSecurity = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [logsRes, alertsRes] = await Promise.all([
        api.get(`/admin/security/logs?page=${page}&limit=20`),
        api.get('/admin/security/alerts')
      ]);
      setLogs(logsRes.data.data);
      setTotalPages(logsRes.data.totalPages);
      setAlerts(alertsRes.data);
    } catch (error) {
      console.error('Failed to fetch security data:', error);
      toast.error('Failed to load security logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [page]);

  const handleResolveAlert = async (id: string) => {
    try {
      await api.put(`/admin/security/alerts/${id}/resolve`);
      toast.success('Alert resolved successfully');
      setAlerts(alerts.map(a => a.id === id ? { ...a, isResolved: true } : a));
    } catch (error) {
      toast.error('Failed to resolve alert');
    }
  };

  const filteredLogs = logs.filter(log => 
    log.action.toLowerCase().includes(searchTerm.toLowerCase()) || 
    log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (log.user?.email && log.user.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': return <ShieldAlert className="w-5 h-5 text-red-600" />;
      case 'HIGH': return <AlertTriangle className="w-5 h-5 text-orange-500" />;
      case 'WARNING': return <AlertTriangle className="w-5 h-5 text-amber-500" />;
      default: return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const activeAlerts = alerts.filter(a => !a.isResolved);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Security Center</h2>
          <p className="text-sm text-gray-500">Monitor system access, abuse patterns, and audit logs.</p>
        </div>
        <button onClick={fetchData} className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {}
      {activeAlerts.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center animate-pulse">
              <ShieldAlert className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-lg font-bold text-red-900">Active Security Alerts ({activeAlerts.length})</h3>
          </div>
          <div className="space-y-3">
            {activeAlerts.map(alert => (
              <div key={alert.id} className="flex items-start justify-between bg-white p-4 rounded-lg border border-red-100 shadow-sm">
                <div>
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="bg-red-100 text-red-800 text-xs font-bold px-2 py-0.5 rounded uppercase tracking-wider">{alert.type}</span>
                    <span className="text-sm text-gray-500 flex items-center"><Clock className="w-3 h-3 mr-1"/> {new Date(alert.createdAt).toLocaleString()}</span>
                  </div>
                  <p className="text-gray-900 font-medium">{alert.description}</p>
                  <div className="mt-2 text-sm text-gray-500 flex items-center space-x-4">
                    {alert.ipAddress && <span>IP: {alert.ipAddress}</span>}
                    {alert.user && <span>User: {alert.user.email}</span>}
                  </div>
                </div>
                <button 
                  onClick={() => handleResolveAlert(alert.id)}
                  className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded hover:bg-red-700 transition-colors"
                >
                  Resolve
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <h3 className="text-lg font-bold text-gray-900 flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <span>Audit Trail</span>
          </h3>
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search logs..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase tracking-wider text-gray-500 font-semibold">
                <th className="p-4">Time</th>
                <th className="p-4">Severity</th>
                <th className="p-4">Action</th>
                <th className="p-4">Details</th>
                <th className="p-4">Actor</th>
                <th className="p-4">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr><td colSpan={6} className="p-8 text-center text-gray-500">Loading logs...</td></tr>
              ) : filteredLogs.length === 0 ? (
                <tr><td colSpan={6} className="p-8 text-center text-gray-500">No logs found.</td></tr>
              ) : (
                filteredLogs.map(log => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="p-4 text-sm text-gray-500 whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        {getSeverityIcon(log.severity)}
                        <span className="text-xs font-medium text-gray-700">{log.severity}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="bg-gray-100 text-gray-800 text-xs font-bold px-2 py-1 rounded">
                        {log.action}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-gray-900 max-w-md truncate" title={log.details}>
                      {log.details}
                    </td>
                    <td className="p-4 text-sm text-gray-600">
                      {log.user ? (
                        <div className="flex flex-col">
                          <span className="font-medium">{log.user.name}</span>
                          <span className="text-xs text-gray-400">{log.user.email}</span>
                        </div>
                      ) : (
                        <span className="text-gray-400 italic">Guest</span>
                      )}
                    </td>
                    <td className="p-4 text-sm text-gray-500 font-mono text-xs">
                      {log.ipAddress || 'Unknown'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {}
        <div className="p-4 border-t border-gray-200 flex items-center justify-between bg-gray-50">
          <span className="text-sm text-gray-500">Page {page} of {totalPages}</span>
          <div className="flex items-center space-x-2">
            <button 
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
              className="px-3 py-1 bg-white border border-gray-200 rounded text-sm disabled:opacity-50"
            >
              Previous
            </button>
            <button 
              disabled={page === totalPages}
              onClick={() => setPage(p => p + 1)}
              className="px-3 py-1 bg-white border border-gray-200 rounded text-sm disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
export default AdminSecurity;

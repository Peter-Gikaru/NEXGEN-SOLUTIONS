import { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  LineChart, Line, AreaChart, Area, PieChart, Pie, Cell
} from 'recharts';
import api from '../../services/api';
import { TrendingUp, Users, ShoppingBag, DollarSign, AlertCircle } from 'lucide-react';

export const AdminAnalytics = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [category, setCategory] = useState('');
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get('/categories');
        setCategories(res.data);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);
        if (category) params.append('category', category);
        const res = await api.get(`/admin/analytics/full?${params.toString()}`);
        setData(res.data);
      } catch (error) {
        console.error('Failed to fetch analytics:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [startDate, endDate, category]);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-8 bg-slate-200 rounded w-48 mb-2"></div>
            <div className="h-4 bg-slate-100 rounded w-72"></div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm h-32 flex flex-col justify-between">
              <div className="h-4 bg-slate-200 rounded w-24"></div>
              <div className="h-8 bg-slate-200 rounded w-32 mt-2"></div>
              <div className="h-3 bg-slate-100 rounded w-16 mt-auto"></div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm h-80 flex flex-col">
              <div className="h-5 bg-slate-200 rounded w-48 mb-6"></div>
              <div className="flex-1 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-center">
                <TrendingUp className="w-12 h-12 text-slate-200" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!data || !data.metrics) {
    return (
      <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm flex flex-col items-center justify-center min-h-[60vh] animate-fade-in relative overflow-hidden">
        {}
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-50 rounded-full blur-3xl opacity-50 translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>
        
        <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mb-6 shadow-inner relative z-10">
          <AlertCircle className="w-12 h-12 text-red-500 animate-bounce" />
        </div>
        <h2 className="text-3xl font-black text-slate-900 mb-3 relative z-10 tracking-tight">Analytics Unavailable</h2>
        <p className="text-slate-500 max-w-md mx-auto mb-8 relative z-10 text-lg leading-relaxed">
          We couldn't reach the analytics engine. It seems the backend server might be offline or sleeping.
        </p>
        <button 
          onClick={() => window.location.reload()}
          className="bg-slate-900 text-white px-8 py-3 rounded-full font-bold hover:bg-slate-800 transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 relative z-10 flex items-center gap-2"
        >
          <TrendingUp className="w-5 h-5" />
          Retry Connection
        </button>
      </div>
    );
  }

  const { metrics, userGrowthData, inventoryCategoryData, topSellingData } = data;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Analytics Hub</h2>
          <p className="text-sm text-gray-500">Comprehensive overview of your store's performance.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="">All Categories</option>
            {categories.map((c: any) => (
              <option key={c.id} value={c.slug}>{c.name}</option>
            ))}
          </select>
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-slate-400">-</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Total Revenue</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">KES {metrics.totalRevenue.toLocaleString()}</h3>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600">
              <DollarSign className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
            <span className="text-green-500 font-medium">+12.5%</span>
            <span className="text-gray-400 ml-2">vs last month</span>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Total Orders</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">{metrics.totalOrders.toLocaleString()}</h3>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
              <ShoppingBag className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
            <span className="text-green-500 font-medium">+8.2%</span>
            <span className="text-gray-400 ml-2">vs last month</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Active Users</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">{metrics.activeUsers.toLocaleString()}</h3>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-purple-600">
              <Users className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
            <span className="text-green-500 font-medium">+24.1%</span>
            <span className="text-gray-400 ml-2">vs last month</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Low Stock Items</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">{metrics.lowStockItems}</h3>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center text-orange-600">
              <AlertCircle className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-orange-500 font-medium">Requires attention</span>
          </div>
        </div>
      </div>

      {}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Revenue Trend (30 Days)</h3>
          <div className="h-80">
            {data.salesByDay && data.salesByDay.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.salesByDay} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0088FE" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#0088FE" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" />
                  <YAxis />
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <RechartsTooltip />
                  <Area type="monotone" dataKey="sales" stroke="#0088FE" fillOpacity={1} fill="url(#colorSales)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">
                {loading ? 'Loading chart...' : 'No sales data available'}
              </div>
            )}
          </div>
        </div>

        {}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-4">User Acquisition</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={userGrowthData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <RechartsTooltip />
                <Legend />
                <Line type="monotone" dataKey="users" stroke="#8884d8" activeDot={{ r: 8 }} strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Inventory Distribution</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={inventoryCategoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                  label
                >
                  {inventoryCategoryData.map((_entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Top Selling Models</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topSellingData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <RechartsTooltip />
                <Bar dataKey="sales" fill="#10B981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
      </div>
    </div>
  );
};
export default AdminAnalytics;

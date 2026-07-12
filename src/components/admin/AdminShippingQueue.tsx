import React, { useState, useEffect } from 'react';
import { Truck, Package, Clock, AlertCircle } from 'lucide-react';
import { Loader } from '../Loader';
import api from '../../services/api';
import toast from 'react-hot-toast';

interface Order {
  id: string;
  totalAmount: number;
  orderStatus: string;
  paymentStatus: string;
  createdAt: string;
  shippingAddress?: any;
  user?: { name: string; email: string };
}

const AdminShippingQueue: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchQueue = async () => {
    try {
      setLoading(true);
      
      
      const response = await api.get('/admin/orders?page=1&limit=200');
      const queue = response.data.data
        .filter((o: Order) => 
          (o.orderStatus === 'CONFIRMED' || o.orderStatus === 'PACKED') && 
          o.paymentStatus === 'SUCCESS'
        )
        .sort((a: Order, b: Order) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      
      setOrders(queue);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load shipping queue');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, []);

  const updateStatus = async (orderId: string, newStatus: string) => {
    try {
      await api.patch(`/admin/orders/${orderId}/status`, { orderStatus: newStatus });
      toast.success(`Order marked as ${newStatus}`);
      fetchQueue();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  if (loading) {
    return <Loader text="Fetching shipping queue..." />;
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
      <div className="px-6 py-5 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Truck className="h-5 w-5 text-blue-600" />
          <h3 className="font-bold text-slate-800">Fulfillment Queue (FIFO)</h3>
        </div>
        <div className="text-sm font-semibold text-slate-500">
          {orders.length} orders pending shipment
        </div>
      </div>
      
      <div className="p-6 overflow-x-auto">
        {orders.length === 0 ? (
          <div className="text-center py-12">
            <Package className="h-12 w-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">No orders in the shipping queue!</p>
            <p className="text-sm text-slate-400 mt-1">All paid & confirmed orders have been shipped.</p>
          </div>
        ) : (
          <table className="w-full text-left text-sm border-collapse min-w-[800px]">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500">
                <th className="pb-3 px-2 font-semibold">Order ID & Date</th>
                <th className="pb-3 px-2 font-semibold">Customer</th>
                <th className="pb-3 px-2 font-semibold">Status</th>
                <th className="pb-3 px-2 font-semibold">Wait Time</th>
                <th className="pb-3 px-2 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => {
                const waitTimeHours = (new Date().getTime() - new Date(order.createdAt).getTime()) / (1000 * 60 * 60);
                const isDelayed = waitTimeHours > 24;
                
                return (
                  <tr key={order.id} className={`border-b border-slate-100 hover:bg-slate-50 transition-colors ${isDelayed ? 'bg-red-50/30' : ''}`}>
                    <td className="py-4 px-2">
                      <div className="font-mono text-xs text-blue-600 font-semibold mb-1">{order.id}</div>
                      <div className="text-xs text-slate-500">{new Date(order.createdAt).toLocaleString()}</div>
                    </td>
                    <td className="py-4 px-2">
                      <div className="font-semibold text-slate-900">{order.shippingAddress?.guestName || order.user?.name || 'Guest'}</div>
                      <div className="text-xs text-slate-500">{order.shippingAddress?.city}, {order.shippingAddress?.area}</div>
                    </td>
                    <td className="py-4 px-2">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wide ${
                        order.orderStatus === 'PACKED' ? 'bg-indigo-100 text-indigo-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {order.orderStatus}
                      </span>
                    </td>
                    <td className="py-4 px-2">
                      <div className={`flex items-center gap-1.5 text-xs font-bold ${isDelayed ? 'text-red-600' : 'text-slate-600'}`}>
                        {isDelayed ? <AlertCircle className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
                        {Math.floor(waitTimeHours)} hours
                      </div>
                    </td>
                    <td className="py-4 px-2 text-right space-x-2">
                      {order.orderStatus === 'CONFIRMED' && (
                        <button 
                          onClick={() => updateStatus(order.id, 'PACKED')}
                          className="px-3 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                        >
                          Mark Packed
                        </button>
                      )}
                      <button 
                        onClick={() => updateStatus(order.id, 'DISPATCHED')}
                        className="px-3 py-1.5 bg-blue-600 text-white hover:bg-blue-700 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                      >
                        Dispatch Order
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AdminShippingQueue;

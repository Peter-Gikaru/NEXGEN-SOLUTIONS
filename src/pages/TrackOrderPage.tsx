import React, { useState } from 'react';
import { PackageSearch, Mail, Key, Clock, Package, Truck, CheckCircle, ArrowRight, ShieldAlert, X, Loader2 } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';
export const TrackOrderPage: React.FC = () => {
  const [trackingNumber, setTrackingNumber] = useState('');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [orderData, setOrderData] = useState<any>(null);
  const [showRecoverModal, setShowRecoverModal] = useState(false);
  const [recoverEmail, setRecoverEmail] = useState('');
  const [recovering, setRecovering] = useState(false);
  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setOrderData(null);
    try {
      const response = await api.get(`/track`, {
        params: { trackingNumber, email }
      });
      setOrderData(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to track order. Please check your details.');
    } finally {
      setIsLoading(false);
    }
  };
  const handleRecover = async (e: React.FormEvent) => {
    e.preventDefault();
    setRecovering(true);
    try {
      await api.post('/track/recover', { email: recoverEmail });
      toast.success('If orders exist, tracking details have been sent to your email.');
      setShowRecoverModal(false);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to recover tracking details');
    } finally {
      setRecovering(false);
    }
  };
  const getStatusStep = (status: string) => {
    switch (status) {
      case 'PENDING': return 1;
      case 'CONFIRMED': return 2;
      case 'SHIPPED': return 3;
      case 'DELIVERED': return 4;
      default: return 0;
    }
  };
  const handleCancelOrder = async () => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    try {
      setIsLoading(true);
      await api.put(`/orders/${orderData.id}/cancel`, { email });
      const response = await api.get(`/track`, { params: { trackingNumber, email } });
      setOrderData(response.data);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to cancel order.');
    } finally {
      setIsLoading(false);
    }
  };
  const handleReturnOrder = async () => {
    if (!window.confirm('Are you sure you want to request a return for this order?')) return;
    try {
      setIsLoading(true);
      await api.put(`/orders/${orderData.id}/return`, { email });
      const response = await api.get(`/track`, { params: { trackingNumber, email } });
      setOrderData(response.data);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to request return.');
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="flex-1 bg-slate-50 text-slate-900 min-h-[80vh] py-16 px-4 font-sans">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <div className="inline-flex p-4 bg-white border border-slate-200 shadow-sm rounded-full mb-4">
            <PackageSearch className="h-10 w-10 text-[#F59E0B]" />
          </div>
          <h1 className="font-sans text-3xl font-bold tracking-tight text-slate-900">Track Your Order</h1>
          <p className="text-slate-500 mt-3 max-w-lg mx-auto">
            Enter your tracking number and the email address used during checkout to see the current status of your delivery.
          </p>
        </div>
        {!orderData ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm max-w-xl mx-auto">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-6 flex items-center gap-2">
                <ShieldAlert className="h-5 w-5" />
                {error}
              </div>
            )}
            <form onSubmit={handleTrack} className="space-y-6">
              <div>
                <label className="block text-slate-700 text-sm font-bold mb-2">Tracking Number</label>
                <div className="relative">
                  <Key className="absolute left-3.5 top-3.5 h-5 w-5 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. NXG-123456"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-11 pr-4 py-3 text-sm focus:outline-none focus:border-[#F59E0B] focus:ring-1 focus:ring-[#F59E0B] text-slate-900 transition-colors"
                  />
                </div>
              </div>
              <div>
                <label className="block text-slate-700 text-sm font-bold mb-2">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3.5 h-5 w-5 text-slate-400" />
                  <input
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-11 pr-4 py-3 text-sm focus:outline-none focus:border-[#F59E0B] focus:ring-1 focus:ring-[#F59E0B] text-slate-900 transition-colors"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#F59E0B] text-white font-bold py-3.5 px-4 rounded-lg flex items-center justify-center gap-2 hover:bg-amber-600 transition-colors disabled:opacity-50 cursor-pointer shadow-md shadow-amber-500/20"
              >
                <span>{isLoading ? 'Searching...' : 'Track Order'}</span>
                {!isLoading && <ArrowRight className="h-5 w-5" />}
              </button>
              <div className="mt-4 text-center">
                <button
                  type="button"
                  onClick={() => setShowRecoverModal(true)}
                  className="text-sm text-slate-500 hover:text-[#F59E0B] transition-colors"
                >
                  Lost your tracking number?
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-200 pb-6 mb-8 gap-4">
              <div>
                <h2 className="text-2xl font-sans font-bold text-slate-900">Order Details</h2>
                <p className="text-slate-500 mt-1 font-mono font-medium">{orderData.trackingNumber}</p>
              </div>
              <div className="bg-slate-50 border border-slate-200 px-4 py-2 rounded-lg">
                <span className="text-slate-500 text-sm block mb-1">Order Date</span>
                <span className="font-bold text-slate-900">{new Date(orderData.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
            {}
            {['CANCELLED', 'RETURN_REQUESTED', 'RETURNED'].includes(orderData.orderStatus) ? (
              <div className="mb-12 bg-red-50 border border-red-200 p-6 rounded-xl flex items-center gap-4">
                <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center shrink-0">
                  <ShieldAlert className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-red-800 font-bold text-lg capitalize">Order {orderData.orderStatus.replace('_', ' ').toLowerCase()}</h3>
                  <p className="text-red-600 text-sm mt-1">This order is no longer on the standard delivery path. Please contact support if you need assistance.</p>
                </div>
              </div>
            ) : (
              <div className="mb-12 relative">
                <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-200 -translate-y-1/2 z-0 hidden md:block rounded-full"></div>
                <div className="absolute top-1/2 left-0 h-1 bg-[#F59E0B] -translate-y-1/2 z-0 transition-all duration-500 hidden md:block rounded-full" style={{ width: `${((getStatusStep(orderData.orderStatus) - 1) / 3) * 100}%` }}></div>
                <div className="relative z-10 flex flex-col md:flex-row justify-between gap-6 md:gap-0">
                  {[
                    { step: 1, label: 'Order Placed', icon: Clock },
                    { step: 2, label: 'Confirmed', icon: Package },
                    { step: 3, label: 'Shipped', icon: Truck },
                    { step: 4, label: 'Delivered', icon: CheckCircle },
                  ].map((item) => {
                    const Icon = item.icon;
                    const isActive = getStatusStep(orderData.orderStatus) >= item.step;
                    return (
                      <div key={item.step} className="flex md:flex-col items-center gap-4 md:gap-3">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center border-4 border-white shadow-sm ${isActive ? 'bg-[#F59E0B] text-white' : 'bg-slate-100 text-slate-400'}`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <span className={`text-sm font-bold ${isActive ? 'text-slate-900' : 'text-slate-400'}`}>
                          {item.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            {}
            <div className="space-y-6">
              <h3 className="font-bold text-slate-800 border-b border-slate-200 pb-2 text-lg">Items in this shipment</h3>
              {orderData.items.map((item: any) => {
                let images = [];
                try {
                  images = JSON.parse(item.product.imageUrls);
                } catch {
                  images = [item.product.imageUrls];
                }
                return (
                  <div key={item.id} className="flex gap-4 items-center bg-slate-50 p-4 rounded-xl border border-slate-200 hover:shadow-sm transition-shadow">
                    <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center p-1 shrink-0 border border-slate-200">
                      <img src={images[0]} alt={item.product.name} className="max-w-full max-h-full object-contain" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-slate-900 truncate">{item.product.name}</h4>
                      <p className="text-slate-500 text-sm font-medium mt-1">Qty: {item.quantity}</p>
                    </div>
                    <div className="font-black text-slate-900 shrink-0">
                      KES {(item.price * item.quantity).toLocaleString()}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-8 pt-6 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-4">
              <button 
                onClick={() => setOrderData(null)}
                className="text-slate-500 hover:text-[#F59E0B] font-semibold text-sm transition-colors cursor-pointer"
              >
                Track another order
              </button>
              <div className="flex items-center gap-6">
                {orderData.orderStatus === 'PENDING' && (
                  <button onClick={handleCancelOrder} disabled={isLoading} className="text-red-500 hover:text-red-600 font-semibold text-sm cursor-pointer disabled:opacity-50">
                    Cancel Order
                  </button>
                )}
                {orderData.orderStatus === 'DELIVERED' && (
                  <button onClick={handleReturnOrder} disabled={isLoading} className="text-amber-600 hover:text-amber-700 font-semibold text-sm cursor-pointer disabled:opacity-50">
                    Request Return
                  </button>
                )}
                <div className="text-right">
                  <span className="text-slate-500 text-sm block font-bold">Total Paid</span>
                  <span className="text-2xl font-black text-[#F59E0B]">KES {orderData.totalAmount.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      {showRecoverModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl max-w-md w-full p-6 text-slate-900">
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-3 text-[#F59E0B]">
                <div className="p-2 bg-amber-50 rounded-lg">
                  <Mail className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold">Recover Tracking</h3>
              </div>
              <button 
                onClick={() => setShowRecoverModal(false)}
                className="text-slate-400 hover:text-slate-600 bg-slate-50 hover:bg-slate-100 p-1.5 rounded-full transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="text-slate-600 mb-6 text-sm">
              Enter the email address you used during checkout, and we'll send you a list of your recent orders and their tracking numbers.
            </p>
            <form onSubmit={handleRecover}>
              <div className="mb-6">
                <label className="block text-slate-700 text-sm font-bold mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={recoverEmail}
                  onChange={(e) => setRecoverEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#F59E0B] focus:ring-1 focus:ring-[#F59E0B]"
                />
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowRecoverModal(false)}
                  className="px-5 py-2.5 rounded-xl font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={recovering}
                  className="bg-[#F59E0B] hover:bg-amber-500 text-white px-5 py-2.5 rounded-xl font-bold transition-colors flex items-center gap-2 disabled:opacity-70"
                >
                  {recovering ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Send Details'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default TrackOrderPage;

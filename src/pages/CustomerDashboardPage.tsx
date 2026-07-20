import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import api from '../services/api';
import { 
  Package, 
  MapPin, 
  CreditCard, 
  Clock, 
  CheckCircle2, 
  Truck, 
  AlertCircle, 
  CornerDownLeft, 
  ArrowLeft,
  Key
} from 'lucide-react';
import { startRegistration } from '@simplewebauthn/browser';
interface OrderItem {
  id: string;
  productId: string;
  price: number;
  quantity: number;
  product: {
    id: string;
    name: string;
    imageUrls: string;
    brand: string;
  };
}
interface Order {
  id: string;
  totalAmount: number;
  shippingAddress: {
    phoneNumber: string;
    city: string;
    area: string;
    detailedAddress: string;
  };
  paymentStatus: string;
  orderStatus: string;
  paymentMethod: string;
  expectedDeliveryDate?: string;
  trackingNumber: string | null;
  createdAt: string;
  items: OrderItem[];
}
export const CustomerDashboardPage: React.FC = () => {
  const { isAuthenticated, logout } = useAuth();
  const { addToast } = useCart();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDeactivateModalOpen, setIsDeactivateModalOpen] = useState(false);
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    const fetchOrders = async () => {
      try {
        const response = await api.get('/orders');
        setOrders(response.data);
        if (response.data.length > 0 && !selectedOrder) {
          setSelectedOrder(response.data[0]);
        }
      } catch (err: any) {
        if (err.response?.status === 401) {
          navigate('/login');
        }
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [isAuthenticated, navigate]);
  const handleDeactivateAccount = async () => {
    try {
      await api.post('/auth/deactivate');
      addToast('Account scheduled for deletion.');
      setIsDeactivateModalOpen(false);
      await logout();
      navigate('/login');
    } catch (err: any) {
      addToast(err.response?.data?.message || 'Failed to deactivate account');
    }
  };
  const handleCancelOrder = async (orderId: string) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    try {
      await api.put(`/orders/${orderId}/cancel`);
      addToast('Order cancelled successfully.');
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, orderStatus: 'CANCELLED' } : o));
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(prev => prev ? { ...prev, orderStatus: 'CANCELLED' } : null);
      }
    } catch (err: any) {
      addToast(err.response?.data?.message || 'Failed to cancel order');
    }
  };
  const handleReturnOrder = async (orderId: string) => {
    if (!window.confirm('Are you sure you want to initiate a return request for this order?')) return;
    try {
      await api.put(`/orders/${orderId}/return`);
      addToast('Return request submitted successfully.');
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, orderStatus: 'RETURN_REQUESTED' } : o));
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(prev => prev ? { ...prev, orderStatus: 'RETURN_REQUESTED' } : null);
      }
    } catch (err: any) {
      addToast(err.response?.data?.message || 'Failed to request return');
    }
  };

  const handleEnrollPasskey = async () => {
    try {
      const resp = await api.post('/auth/passkey/register/start');
      const options = resp.data;
      
      let attResp;
      try {
        attResp = await startRegistration({ optionsJSON: options });
      } catch (error: any) {
        addToast(error.message || 'Passkey enrollment cancelled.');
        return;
      }
      
      const verificationResp = await api.post('/auth/passkey/register/finish', attResp);
      if (verificationResp.data.verified) {
        addToast('Passkey enrolled successfully!');
      } else {
        addToast('Passkey verification failed.');
      }
    } catch (err: any) {
      addToast(err.response?.data?.message || 'Failed to start passkey enrollment');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-amber-100 text-amber-800 border-amber-250';
      case 'CONFIRMED':
        return 'bg-blue-100 text-blue-800 border-blue-250';
      case 'SHIPPED':
        return 'bg-purple-100 text-purple-800 border-purple-250';
      case 'DELIVERED':
        return 'bg-emerald-100 text-emerald-800 border-emerald-250';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800 border-red-250';
      case 'RETURN_REQUESTED':
        return 'bg-indigo-100 text-indigo-800 border-indigo-250';
      case 'RETURNED':
        return 'bg-slate-200 text-[#1a1a2e] border-[#1a1a2e]';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-250';
    }
  };
  const getTimelineStep = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 1;
      case 'CONFIRMED':
        return 2;
      case 'SHIPPED':
        return 3;
      case 'DELIVERED':
        return 4;
      default:
        return 0;
    }
  };
  const formatPrice = (amount: number) => {
    return `KES ${amount.toLocaleString()}`;
  };
  const calculateProfileCompletion = () => {
    let score = 0;
    const steps = [];
    score += 33;
    steps.push({ name: 'Account Created', completed: true });
    const hasAddress = !!user?.defaultAddress;
    if (hasAddress) score += 33;
    steps.push({ name: 'Add Shipping Address', completed: hasAddress });
    const hasOrder = orders.length > 0;
    if (hasOrder) score += 34;
    steps.push({ name: 'Place First Order', completed: hasOrder });
    return { score, steps };
  };
  if (loading) {
    return (
      <div className="flex-1 min-h-screen bg-slate-50 flex items-center justify-center font-sans">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#F59E0B] mx-auto mb-4"></div>
          <p className="text-gray-600 text-sm">Loading your orders...</p>
        </div>
      </div>
    );
  }
  return (
    <div className="flex-1 bg-slate-50 min-h-screen text-[#1a1a2e] font-sans py-10 px-4 md:px-8">
      <div className="max-w-[1600px] mx-auto flex flex-col gap-8">
        <div className="flex items-center justify-between border-b border-gray-200 pb-5">
          <div className="text-left">
            <h1 className="text-3xl font-bold text-[#1a1a2e]">My Orders</h1>
            <p className="text-gray-500 text-sm mt-1">Manage and track your premium notebook orders</p>
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => navigate('/')}
              className="bg-white border border-gray-300 text-slate-700 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-colors flex items-center gap-2 cursor-pointer shadow-sm"
            >
              <ArrowLeft className="h-4 w-4" /> Keep Shopping
            </button>
            <button
              onClick={() => setIsDeactivateModalOpen(true)}
              className="bg-red-50 text-red-650 border border-red-200 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-red-100 transition-colors cursor-pointer shadow-sm"
            >
              Deactivate Account
            </button>
            <button
              onClick={handleEnrollPasskey}
              className="bg-slate-700 text-white border border-slate-600 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-slate-600 transition-colors flex items-center gap-2 cursor-pointer shadow-sm"
            >
              <Key className="h-4 w-4 text-[#F59E0B]" /> Enroll Passkey
            </button>
            <button
              onClick={async () => {
                await logout();
                navigate('/login');
              }}
              className="bg-slate-800 text-white border border-slate-700 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-slate-700 transition-colors cursor-pointer shadow-sm"
            >
              Sign Out
            </button>
          </div>
        </div>
        {}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-4">
            <div>
              <h2 className="text-lg font-bold text-[#1a1a2e]">Profile Completion</h2>
              <p className="text-sm text-gray-500 mt-1">Complete your profile to unlock future rewards and exclusive offers!</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-2xl font-black text-[#F59E0B]">{calculateProfileCompletion().score}%</div>
            </div>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2.5 mb-6">
            <div 
              className="bg-[#F59E0B] h-2.5 rounded-full transition-all duration-1000 ease-out" 
              style={{ width: `${calculateProfileCompletion().score}%` }}
            ></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {calculateProfileCompletion().steps.map((step, index) => (
              <div key={index} className={`flex items-center gap-3 p-3 rounded-lg border ${step.completed ? 'bg-emerald-50 border-emerald-100 text-emerald-800' : 'bg-slate-50 border-gray-200 text-gray-500'}`}>
                {step.completed ? (
                  <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
                ) : (
                  <div className="h-5 w-5 rounded-full border-2 border-gray-300 flex items-center justify-center shrink-0">
                    <span className="text-[10px] font-bold">{index + 1}</span>
                  </div>
                )}
                <span className={`text-sm font-bold ${step.completed ? '' : 'opacity-80'}`}>{step.name}</span>
              </div>
            ))}
          </div>
        </div>
        {orders.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-xl p-12 text-center shadow-sm max-w-lg mx-auto mt-10">
            <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-[#1a1a2e] mb-2">No Orders Found</h2>
            <p className="text-gray-500 text-sm mb-6">You have not placed any orders yet. Explore our high-performance systems and pick one today!</p>
            <button
              onClick={() => navigate('/')}
              className="bg-[#F59E0B] text-slate-950 font-bold px-6 py-2.5 rounded-lg hover:bg-amber-500 transition-colors cursor-pointer"
            >
              Browse Notebooks
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden flex flex-col h-[700px]">
              <div className="bg-slate-900 text-white px-4 py-3.5 text-left border-b border-slate-800">
                <span className="font-semibold text-sm">Order History ({orders.length})</span>
              </div>
              <div className="flex-1 overflow-y-auto divide-y divide-gray-150">
                {orders.map((ord) => (
                  <button
                    key={ord.id}
                    onClick={() => setSelectedOrder(ord)}
                    className={`w-full text-left p-4 hover:bg-slate-50 transition-colors flex flex-col gap-2 cursor-pointer ${
                      selectedOrder?.id === ord.id ? 'bg-amber-50/40 border-l-4 border-[#F59E0B]' : ''
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <span className="font-mono text-xs text-gray-400">ID: {ord.id.slice(0, 8)}...</span>
                      <span className="text-xs text-gray-500">{new Date(ord.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between items-center mt-1">
                      <span className="font-bold text-sm text-[#1a1a2e]">{formatPrice(ord.totalAmount)}</span>
                      <span className={`px-2 py-0.5 rounded text-[11px] font-bold border ${getStatusColor(ord.orderStatus)}`}>
                        {ord.orderStatus}
                      </span>
                    </div>
                    <span className="text-xs text-slate-500 truncate mt-0.5">
                      {ord.items[0]?.product?.name} {ord.items.length > 1 ? `(+${ord.items.length - 1} other items)` : ''}
                    </span>
                  </button>
                ))}
              </div>
            </div>
            <div className="lg:col-span-2 bg-white border border-gray-200 rounded-xl shadow-sm p-6 text-left flex flex-col min-h-[700px]">
              {selectedOrder ? (
                <div className="space-y-6 flex-1 flex flex-col">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-150 pb-5">
                    <div>
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-sm text-gray-500 font-bold">Order ID: {selectedOrder.id}</span>
                        {selectedOrder.trackingNumber && (
                          <span className="bg-slate-100 border border-slate-200 text-slate-700 px-2 py-0.5 rounded text-xs font-bold">
                            Tracking: {selectedOrder.trackingNumber}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 mt-1">Placed on {new Date(selectedOrder.createdAt).toLocaleString()}</p>
                      {selectedOrder.expectedDeliveryDate && (
                        <p className="text-xs font-bold text-[#F59E0B] mt-1 flex items-center gap-1">
                          <Truck className="h-3 w-3" /> Expected Delivery: {new Date(selectedOrder.expectedDeliveryDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {selectedOrder.orderStatus === 'PENDING' && (
                        <button
                          onClick={() => handleCancelOrder(selectedOrder.id)}
                          className="bg-red-50 text-red-650 border border-red-200 px-4.5 py-2 rounded-lg text-sm font-bold hover:bg-red-100 transition-colors cursor-pointer shadow-sm"
                        >
                          Cancel Order
                        </button>
                      )}
                      {selectedOrder.orderStatus === 'DELIVERED' && (
                        <button
                          onClick={() => handleReturnOrder(selectedOrder.id)}
                          className="bg-indigo-50 text-indigo-750 border border-indigo-200 px-4.5 py-2 rounded-lg text-sm font-bold hover:bg-indigo-100 transition-colors cursor-pointer shadow-sm flex items-center gap-1.5"
                        >
                          <CornerDownLeft className="h-4 w-4" /> Request Return
                        </button>
                      )}
                    </div>
                  </div>
                  {selectedOrder.orderStatus === 'CANCELLED' ? (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-5 flex items-center gap-3 text-red-800">
                      <AlertCircle className="h-6 w-6 text-red-500 shrink-0" />
                      <div>
                        <h4 className="font-bold text-sm">Order Cancelled</h4>
                        <p className="text-xs text-red-650 mt-0.5">This order has been cancelled and any paid amounts will be refunded according to our return policies.</p>
                      </div>
                    </div>
                  ) : selectedOrder.orderStatus === 'RETURN_REQUESTED' ? (
                    <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-5 flex items-center gap-3 text-indigo-800">
                      <Clock className="h-6 w-6 text-indigo-500 shrink-0" />
                      <div>
                        <h4 className="font-bold text-sm">Return Requested</h4>
                        <p className="text-xs text-indigo-650 mt-0.5">Your return request is processing. Our logistics support team will contact you to schedule pickup within 24-48 hours.</p>
                      </div>
                    </div>
                  ) : selectedOrder.orderStatus === 'RETURNED' ? (
                    <div className="bg-slate-100 border border-slate-200 rounded-xl p-5 flex items-center gap-3 text-[#1a1a2e]">
                      <CheckCircle2 className="h-6 w-6 text-slate-500 shrink-0" />
                      <div>
                        <h4 className="font-bold text-sm">Item Returned & Refunded</h4>
                        <p className="text-xs text-slate-600 mt-0.5">This transaction has been closed. Returns were completed successfully and refunds issued.</p>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-[#1a1a2e] rounded-xl p-6">
                      <h4 className="font-bold text-sm text-slate-700 mb-6 flex items-center gap-2">
                        <Truck className="h-4.5 w-4.5 text-[#F59E0B]" /> Delivery Status
                      </h4>
                      <div className="grid grid-cols-4 relative select-none">
                        <div className="absolute top-4 left-[12.5%] right-[12.5%] h-0.5 bg-gray-200 -z-1">
                          <div 
                            className="bg-emerald-500 h-0.5 transition-all duration-500"
                            style={{ width: `${(Math.max(0, getTimelineStep(selectedOrder.orderStatus) - 1) / 3) * 100}%` }}
                          ></div>
                        </div>
                        <div className="flex flex-col items-center text-center">
                          <div className={`h-8.5 w-8.5 rounded-full flex items-center justify-center border-2 z-10 transition-colors bg-white ${
                            getTimelineStep(selectedOrder.orderStatus) >= 1 ? 'border-emerald-500 text-emerald-500' : 'border-gray-300 text-gray-400'
                          }`}>
                            <CheckCircle2 className="h-4.5 w-4.5" />
                          </div>
                          <span className="text-[11px] font-bold mt-2 text-slate-700">Placed</span>
                        </div>
                        <div className="flex flex-col items-center text-center">
                          <div className={`h-8.5 w-8.5 rounded-full flex items-center justify-center border-2 z-10 transition-colors bg-white ${
                            getTimelineStep(selectedOrder.orderStatus) >= 2 ? 'border-emerald-500 text-emerald-500' : 'border-gray-300 text-gray-400'
                          }`}>
                            <Clock className="h-4.5 w-4.5" />
                          </div>
                          <span className="text-[11px] font-bold mt-2 text-slate-700">Confirmed</span>
                        </div>
                        <div className="flex flex-col items-center text-center">
                          <div className={`h-8.5 w-8.5 rounded-full flex items-center justify-center border-2 z-10 transition-colors bg-white ${
                            getTimelineStep(selectedOrder.orderStatus) >= 3 ? 'border-emerald-500 text-emerald-500' : 'border-gray-300 text-gray-400'
                          }`}>
                            <Truck className="h-4.5 w-4.5" />
                          </div>
                          <span className="text-[11px] font-bold mt-2 text-slate-700">Shipped</span>
                        </div>
                        <div className="flex flex-col items-center text-center">
                          <div className={`h-8.5 w-8.5 rounded-full flex items-center justify-center border-2 z-10 transition-colors bg-white ${
                            getTimelineStep(selectedOrder.orderStatus) >= 4 ? 'border-emerald-500 text-emerald-500' : 'border-gray-300 text-gray-400'
                          }`}>
                            <Package className="h-4.5 w-4.5" />
                          </div>
                          <span className="text-[11px] font-bold mt-2 text-slate-700">Delivered</span>
                        </div>
                      </div>
                    </div>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-b border-gray-150 pb-5">
                    <div className="bg-slate-50 rounded-xl p-5 border border-gray-200">
                      <h4 className="font-bold text-sm text-slate-700 mb-3 flex items-center gap-1.5">
                        <MapPin className="h-4 w-4 text-[#F59E0B]" /> Shipping Details
                      </h4>
                      <div className="space-y-1.5 text-sm text-slate-600">
                        <p><strong className="text-[#1a1a2e]">Phone:</strong> {selectedOrder.shippingAddress.phoneNumber}</p>
                        <p><strong className="text-[#1a1a2e]">Location:</strong> {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.area}</p>
                        <p><strong className="text-[#1a1a2e]">Details:</strong> {selectedOrder.shippingAddress.detailedAddress}</p>
                      </div>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-5 border border-gray-200">
                      <h4 className="font-bold text-sm text-slate-700 mb-3 flex items-center gap-1.5">
                        <CreditCard className="h-4 w-4 text-[#F59E0B]" /> Payment Details
                      </h4>
                      <div className="space-y-1.5 text-sm text-slate-600">
                        <p><strong className="text-[#1a1a2e]">Method:</strong> {selectedOrder.paymentMethod === 'COD' ? 'Cash on Delivery (COD)' : selectedOrder.paymentMethod}</p>
                        <p className="flex items-center gap-2">
                          <strong className="text-[#1a1a2e]">Status:</strong>
                          <span className={`px-2 py-0.5 rounded text-[11px] font-bold border ${
                            selectedOrder.paymentStatus === 'PAID' 
                              ? 'bg-emerald-100 text-emerald-800 border-emerald-250' 
                              : 'bg-amber-100 text-amber-800 border-amber-250'
                          }`}>
                            {selectedOrder.paymentStatus}
                          </span>
                        </p>
                        <p><strong className="text-[#1a1a2e]">Total Charged:</strong> <span className="font-bold text-[#1a1a2e]">{formatPrice(selectedOrder.totalAmount)}</span></p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4 flex-1">
                    <h4 className="font-bold text-sm text-slate-700 flex items-center gap-1.5">
                      <Package className="h-4.5 w-4.5 text-[#F59E0B]" /> Items In Order
                    </h4>
                    <div className="divide-y divide-gray-150 border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
                      {selectedOrder.items.map((item) => {
                        let parsedImage = '';
                        try {
                          const imagesArray = JSON.parse(item.product.imageUrls);
                          parsedImage = imagesArray[0];
                        } catch (e) {
                          parsedImage = item.product.imageUrls;
                        }
                        return (
                          <div key={item.id} className="p-4 flex gap-4 items-center">
                            <div className="w-16 h-16 bg-white border border-gray-200 rounded shrink-0 p-1 flex items-center justify-center">
                              <img 
                                src={parsedImage} 
                                alt={item.product.name} 
                                className="w-full h-full object-contain"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h5 className="font-semibold text-sm text-[#1a1a2e] truncate">{item.product.name}</h5>
                              <p className="text-xs text-gray-500 uppercase mt-0.5">{item.product.brand}</p>
                              <p className="text-xs text-gray-400 mt-1">Quantity: {item.quantity}</p>
                              {selectedOrder.orderStatus === 'DELIVERED' && (
                                <button
                                  onClick={() => navigate(`/warranty-claim?orderId=${selectedOrder.id}&productId=${item.product.id}`)}
                                  className="mt-1 text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors cursor-pointer"
                                >
                                  Claim Warranty
                                </button>
                              )}
                            </div>
                            <span className="font-bold text-sm text-[#1a1a2e] shrink-0">{formatPrice(item.price * item.quantity)}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center text-center p-6">
                  <p className="text-gray-400 text-sm">Select an order from the history to view detailed status and tracking timelines.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      {isDeactivateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4 text-red-600">
              <AlertCircle className="h-6 w-6" />
              <h3 className="text-lg font-bold">Deactivate Account</h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Are you sure you want to deactivate your account? 
              Your account will be scheduled for deletion. We will hold your data for <strong className="text-gray-800">7 days</strong>.
              If you change your mind within this period, simply log back in to restore your account.
            </p>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setIsDeactivateModalOpen(false)}
                className="px-4 py-2 text-sm font-bold text-gray-600 hover:text-gray-800 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDeactivateAccount}
                className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-red-700 transition-colors cursor-pointer shadow-sm"
              >
                Yes, Deactivate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default CustomerDashboardPage;

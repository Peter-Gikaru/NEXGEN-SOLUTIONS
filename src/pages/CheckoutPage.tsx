import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { 
  ArrowLeft, 
  MapPin, 
  Phone, 
  ShoppingBag, 
  CheckCircle, 
  CreditCard,
  Truck,
  Smartphone
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
export const CheckoutPage: React.FC = () => {
  const { cartItems, clearCart } = useCart();
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const buyNowItem = location.state?.buyNowItem;
  const checkoutItems = buyNowItem ? [buyNowItem] : cartItems;
  const [guestName, setGuestName] = useState(user?.name || '');
  const [guestEmail, setGuestEmail] = useState(user?.email || '');
  const defaultAddr = user?.defaultAddress as any;
  const [phoneNumber, setPhoneNumber] = useState(defaultAddr?.phoneNumber || '');
  const [shippingZones, setShippingZones] = useState<any[]>([]);
  const [selectedZoneId, setSelectedZoneId] = useState('');
  const [city, setCity] = useState(defaultAddr?.city || '');
  const [area, setArea] = useState(defaultAddr?.area || '');
  const [detailedAddress, setDetailedAddress] = useState(defaultAddr?.detailedAddress || '');
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [saveAddress, setSaveAddress] = useState(!defaultAddr);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successOrder, setSuccessOrder] = useState<any>(null);
  useEffect(() => {
    const fetchZones = async () => {
      try {
        const response = await api.get('/shipping');
        setShippingZones(response.data);
        if (response.data.length > 0) {
          let defaultZone = response.data[0];
          if (defaultAddr?.city) {
            const match = response.data.find((z: any) => z.regionName === defaultAddr.city);
            if (match) defaultZone = match;
          }
          setSelectedZoneId(defaultZone.id);
          setCity(defaultZone.regionName);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchZones();
  }, []);
  const subtotal = checkoutItems.reduce((acc: number, item: any) => acc + item.product.price * item.quantity, 0);
  const selectedZone = shippingZones.find(z => z.id === selectedZoneId);
  const zoneFee = selectedZone ? selectedZone.fee : 500; 
  const deliveryFee = subtotal >= 50000 ? 0 : zoneFee;
  const [requireEtims, setRequireEtims] = useState(false);
  const vatAmount = requireEtims ? Math.round(subtotal * 0.16) : 0;
  const total = subtotal + deliveryFee + vatAmount;

  const [promoCode, setPromoCode] = useState('');

  useEffect(() => {
    const isNairobi = selectedZone?.regionName?.toLowerCase() === 'nairobi';
    if (!isNairobi && paymentMethod === 'COD') {
      setPaymentMethod('MPESA');
    }
  }, [selectedZoneId, paymentMethod, selectedZone]);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (checkoutItems.length === 0) return;
    setIsSubmitting(true);
    const payload = {
      shippingAddress: {
        phoneNumber,
        city,
        area,
        detailedAddress,
        requireEtims,
      },
      guestName: !isAuthenticated ? guestName : undefined,
      guestEmail: !isAuthenticated ? guestEmail : undefined,
      items: checkoutItems.map(item => ({
        productId: item.product.id,
        quantity: item.quantity,
        price: item.product.price,
        variant: item.variant
      })),
      expectedSubtotal: subtotal + vatAmount,
      paymentMethod,
      promoCode: promoCode ? promoCode : undefined,
    };
    try {
      const response = await api.post('/orders', payload);
      if (isAuthenticated && saveAddress) {
        await api.put('/auth/profile/address', {
          address: { phoneNumber, city, area, detailedAddress }
        });
      }
      setSuccessOrder(response.data);
      if (!buyNowItem) clearCart();
      toast.success('Order placed successfully!');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to place order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleRetryPayment = async () => {
    if (!successOrder) return;
    try {
      toast.loading('Resending M-Pesa prompt...', { id: 'retry' });
      await api.post('/payments/retry', { 
        orderId: successOrder.id, 
        phoneNumber: phoneNumber 
      });
      toast.success('M-Pesa prompt sent to your phone. Please check and enter your PIN.', { id: 'retry' });
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to resend prompt. Please try again.', { id: 'retry' });
    }
  };

  if (successOrder) {
    return (
      <div className="flex-1 bg-slate-50 text-slate-900 min-h-screen py-16 px-4">
        <div className="max-w-2xl mx-auto bg-white border border-slate-200 rounded-2xl p-8 shadow-xl text-center">
          <div className="inline-flex p-4 bg-emerald-50 text-emerald-500 rounded-full mb-6">
            <CheckCircle className="h-16 w-16" />
          </div>
          <h2 className="font-sans text-3xl font-bold tracking-tight text-slate-900">Order Placed Successfully!</h2>
          
          {successOrder.paymentMethod === 'MPESA' ? (
            <div className="my-6 p-6 bg-blue-50 border border-blue-200 rounded-xl text-center">
              <h3 className="font-bold text-blue-900 text-lg flex items-center justify-center gap-2 mb-2">
                <Smartphone className="h-6 w-6" /> M-Pesa Request Sent
              </h3>
              <p className="text-blue-800 mb-4">Please check your phone ({phoneNumber}) and enter your M-Pesa PIN to complete the payment.</p>
              <div className="flex flex-col gap-3 max-w-sm mx-auto">
                <button 
                   onClick={() => navigate(`/track?order=${successOrder.id}`)}
                   className="bg-blue-600 text-white font-bold py-3 px-4 rounded-xl hover:bg-blue-700 transition cursor-pointer"
                >
                   Check Payment Status
                </button>
                <button 
                   onClick={handleRetryPayment}
                   className="text-blue-700 font-bold py-2 px-4 hover:underline cursor-pointer"
                >
                   Did not receive prompt? Resend
                </button>
              </div>
            </div>
          ) : (
            <p className="text-slate-500 mt-2">Thank you for shopping with NexGen Gadgets. Your order is being processed.</p>
          )}
          <div className="my-8 p-6 bg-slate-50 rounded-xl border border-slate-200 text-left space-y-4 font-sans shadow-inner">
            <div className="flex justify-between items-center border-b border-slate-200 pb-3">
              <span className="text-slate-500 text-sm font-medium">Tracking Number</span>
              <span className="font-mono text-[#F59E0B] font-bold bg-amber-50 px-2 py-1 rounded">{successOrder.trackingNumber}</span>
            </div>
            <div className="flex justify-between items-center border-b border-slate-200 pb-3">
              <span className="text-slate-500 text-sm font-medium">Estimated Delivery</span>
              <span className="font-bold text-slate-800">
                {selectedZone ? selectedZone.estimatedDays : (city.toLowerCase().includes('nairobi') ? 'Next Day Delivery' : '2 - 3 Business Days')}
              </span>
            </div>
            <div className="flex justify-between items-center border-b border-slate-200 pb-3">
              <span className="text-slate-500 text-sm font-medium">Total Paid</span>
              <span className="font-bold text-slate-800">KES {successOrder.totalAmount.toLocaleString()}</span>
            </div>
            <div>
              <span className="text-slate-500 text-sm font-medium block mb-1">Shipping Address</span>
              <span className="text-slate-800 text-sm font-semibold leading-relaxed">
                {phoneNumber} <br />
                {detailedAddress}, {area}, {city}
              </span>
            </div>
          </div>
          <button
            onClick={() => navigate('/')}
            className="w-full bg-[#F59E0B] text-white font-bold py-3.5 px-4 rounded-xl hover:bg-amber-500 transition-colors cursor-pointer shadow-lg shadow-amber-500/20"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }
  return (
    <div className="flex-1 bg-slate-50 text-slate-900 min-h-screen py-10 px-4">
      <Toaster position="top-center" />
      <div className="max-w-6xl mx-auto">
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center gap-2 text-slate-500 hover:text-[#F59E0B] mb-8 text-sm font-semibold transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to cart</span>
        </button>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
              <h2 className="font-sans text-xl font-bold flex items-center gap-2 border-b border-slate-100 pb-4 mb-6 text-slate-800">
                <MapPin className="h-6 w-6 text-[#F59E0B]" />
                <span>Shipping & Delivery Details</span>
              </h2>
              <form onSubmit={handleSubmit} id="checkout-form" className="space-y-5">
                {!isAuthenticated && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-2">
                    <div>
                      <label className="block text-slate-700 text-sm font-bold uppercase tracking-wider mb-2">Full Name</label>
                      <input 
                        type="text"
                        required
                        placeholder="e.g. John Doe"
                        value={guestName}
                        onChange={(e) => setGuestName(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3.5 text-base focus:outline-none focus:ring-2 focus:ring-[#F59E0B]/50 focus:border-[#F59E0B] text-slate-900 transition-all placeholder:text-slate-400"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 text-sm font-bold uppercase tracking-wider mb-2">Email Address</label>
                      <input 
                        type="email"
                        required
                        placeholder="e.g. john@example.com"
                        value={guestEmail}
                        onChange={(e) => setGuestEmail(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3.5 text-base focus:outline-none focus:ring-2 focus:ring-[#F59E0B]/50 focus:border-[#F59E0B] text-slate-900 transition-all placeholder:text-slate-400"
                      />
                    </div>
                  </div>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-slate-700 text-sm font-bold uppercase tracking-wider mb-2">Phone Number</label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-4 h-5 w-5 text-slate-400" />
                      <input 
                        type="tel"
                        required
                        placeholder="e.g. 0712345678"
                        pattern="^(?:254|\+254|0)?(7[0-9]{8}|1[0-9]{8})$"
                        title="Must be a valid Kenyan phone number (e.g. 0712345678 or +254712345678)"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-12 pr-4 py-3.5 text-base focus:outline-none focus:ring-2 focus:ring-[#F59E0B]/50 focus:border-[#F59E0B] text-slate-900 transition-all placeholder:text-slate-400"
                      />
                      <span className="text-xs text-slate-500 absolute -bottom-5 left-1 font-medium">Format: 07XX or +2547XX</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-slate-700 text-sm font-bold uppercase tracking-wider mb-2">Region / City</label>
                    <select
                      required
                      value={selectedZoneId}
                      onChange={(e) => {
                        setSelectedZoneId(e.target.value);
                        const zone = shippingZones.find(z => z.id === e.target.value);
                        if (zone) setCity(zone.regionName);
                      }}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3.5 text-base focus:outline-none focus:ring-2 focus:ring-[#F59E0B]/50 focus:border-[#F59E0B] text-slate-900 transition-all cursor-pointer"
                    >
                      {shippingZones.length === 0 && <option value="">Loading regions...</option>}
                      {shippingZones.map((zone) => (
                        <option key={zone.id} value={zone.id}>
                          {zone.regionName} (KES {zone.fee})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-3">
                  <div>
                    <label className="block text-slate-700 text-sm font-bold uppercase tracking-wider mb-2">County</label>
                    <select
                      required
                      value={area}
                      onChange={(e) => setArea(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3.5 text-base focus:outline-none focus:ring-2 focus:ring-[#F59E0B]/50 focus:border-[#F59E0B] text-slate-900 transition-all cursor-pointer"
                    >
                      <option value="">Select a county</option>
                      {selectedZone?.counties && Array.isArray(selectedZone.counties) ? (
                        selectedZone.counties.map((county: string) => (
                          <option key={county} value={county}>{county}</option>
                        ))
                      ) : (
                        <option value={selectedZone?.regionName || ''}>{selectedZone?.regionName || 'Default'}</option>
                      )}
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-700 text-sm font-bold uppercase tracking-wider mb-2">Detailed Address</label>
                    <input 
                      type="text"
                      required
                      placeholder="e.g. Block B, Apartment 4G, Ring Road"
                      value={detailedAddress}
                      onChange={(e) => setDetailedAddress(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3.5 text-base focus:outline-none focus:ring-2 focus:ring-[#F59E0B]/50 focus:border-[#F59E0B] text-slate-900 transition-all placeholder:text-slate-400"
                    />
                  </div>
                </div>
                {isAuthenticated && (
                  <div className="pt-2">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input 
                        type="checkbox" 
                        checked={saveAddress}
                        onChange={(e) => setSaveAddress(e.target.checked)}
                        className="w-4 h-4 text-[#F59E0B] accent-[#F59E0B] border-gray-300 rounded focus:ring-[#F59E0B]"
                      />
                      <span className="text-sm font-semibold text-slate-700">Save this address to my profile for faster checkout next time</span>
                    </label>
                  </div>
                )}
              </form>
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
              <h2 className="font-sans text-xl font-bold flex items-center gap-2 border-b border-slate-100 pb-4 mb-6 text-slate-800">
                <CreditCard className="h-6 w-6 text-[#F59E0B]" />
                <span>Payment Method</span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <label className={`border-2 ${paymentMethod === 'COD' ? 'border-[#F59E0B] bg-amber-50' : 'border-slate-200 bg-slate-50'} p-5 rounded-xl flex items-center justify-between shadow-sm transition-colors ${!city.toLowerCase().includes('nairobi') ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-amber-100/50'}`}>
                  <div className="flex items-center gap-4">
                    <input 
                      type="radio" 
                      name="payment" 
                      value="COD" 
                      checked={paymentMethod === 'COD'}
                      onChange={() => setPaymentMethod('COD')}
                      disabled={!city.toLowerCase().includes('nairobi')}
                      className="accent-[#F59E0B] w-5 h-5 cursor-pointer disabled:cursor-not-allowed"
                    />
                    <div>
                      <span className="block font-bold text-slate-900 text-base">Cash on Delivery</span>
                      <span className="text-sm text-slate-600 font-medium mt-1">
                        {city.toLowerCase().includes('nairobi') ? 'Pay when goods arrive' : 'Only available in Nairobi'}
                      </span>
                    </div>
                  </div>
                </label>
                <div className="space-y-4">
                  <label 
                    className={`flex items-start gap-4 p-5 rounded-xl border-2 cursor-pointer transition-all ${
                      paymentMethod === 'MPESA' 
                        ? 'border-[#F59E0B] bg-amber-50 shadow-md' 
                        : 'border-slate-200 bg-white hover:border-[#F59E0B]/50'
                    }`}
                  >
                    <input 
                      type="radio" 
                      name="paymentMethod" 
                      value="MPESA" 
                      checked={paymentMethod === 'MPESA'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="mt-1 w-5 h-5 text-[#F59E0B] focus:ring-[#F59E0B] border-slate-300"
                    />
                    <div className="flex-1">
                      <div className="font-bold text-slate-900 text-lg flex items-center justify-between">
                        Cash on Order (M-Pesa)
                        <Smartphone className="h-6 w-6 text-green-600" />
                      </div>
                      <p className="text-slate-500 text-sm mt-1 leading-relaxed">
                        Pay securely upfront via M-Pesa. A payment prompt will be sent directly to your phone.
                      </p>
                    </div>
                  </label>

                  {selectedZone?.regionName?.toLowerCase() === 'nairobi' && (
                    <label 
                      className={`flex items-start gap-4 p-5 rounded-xl border-2 cursor-pointer transition-all ${
                        paymentMethod === 'COD' 
                          ? 'border-[#F59E0B] bg-amber-50 shadow-md' 
                          : 'border-slate-200 bg-white hover:border-[#F59E0B]/50'
                      }`}
                    >
                      <input 
                        type="radio" 
                        name="paymentMethod" 
                        value="COD" 
                        checked={paymentMethod === 'COD'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="mt-1 w-5 h-5 text-[#F59E0B] focus:ring-[#F59E0B] border-slate-300"
                      />
                      <div className="flex-1">
                        <div className="font-bold text-slate-900 text-lg flex items-center justify-between">
                          Cash on Delivery (Nairobi Only)
                          <Truck className="h-6 w-6 text-blue-600" />
                        </div>
                        <p className="text-slate-500 text-sm mt-1 leading-relaxed">
                          Pay when the product arrives at your doorstep. Available exclusively for Nairobi residents.
                        </p>
                      </div>
                    </label>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="space-y-6">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm sticky top-24">
              <h2 className="font-sans text-xl font-bold flex items-center gap-2 border-b border-slate-100 pb-4 mb-4 text-slate-800">
                <ShoppingBag className="h-6 w-6 text-[#F59E0B]" />
                <span>Summary ({checkoutItems.length} items)</span>
              </h2>
              <div className="max-h-80 overflow-y-auto space-y-4 pr-2 mb-4 scrollbar-thin">
                {checkoutItems.map((item: any) => (
                  <div key={`${item.product.id}-${item.variant || 'base'}`} className="flex gap-4 justify-between items-center text-base border-b border-slate-100 pb-4">
                    <div className="flex gap-3 items-center min-w-0">
                      <div className="w-14 h-14 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-center p-1.5 shrink-0">
                        <img src={item.product.image} className="max-w-full max-h-full object-contain mix-blend-multiply" alt="" />
                      </div>
                      <div className="min-w-0">
                        <span className="block text-slate-900 font-bold truncate text-base">{item.product.title}</span>
                        {item.variant && <span className="block text-sm font-semibold text-[#F59E0B] truncate mt-0.5">{item.variant}</span>}
                        <span className="text-sm font-semibold text-slate-500 mt-1 block">Qty: {item.quantity}</span>
                      </div>
                    </div>
                    <span className="text-base font-black text-slate-900 shrink-0">KES {(item.product.price * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-slate-100 pt-5 space-y-4 font-sans text-base">
                <div className="mb-2">
                  <input
                    type="text"
                    placeholder="Enter Promo Code"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#F59E0B]/50 focus:border-[#F59E0B] text-slate-900 transition-all uppercase placeholder:normal-case placeholder:text-slate-400"
                  />
                </div>
                
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mt-6 mb-2">
                  <label className="flex items-start gap-3 cursor-pointer select-none">
                    <div className="flex items-center h-5 mt-0.5">
                      <input 
                        type="checkbox" 
                        checked={requireEtims}
                        onChange={(e) => setRequireEtims(e.target.checked)}
                        className="w-4 h-4 text-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500 focus:ring-2 cursor-pointer"
                      />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-slate-800">Request official eTIMS Receipt</span>
                      <span className="text-xs text-slate-500 font-medium mt-0.5">Adds 16% VAT to your order total. Required for corporate accounting.</span>
                    </div>
                  </label>
                </div>
                <div className="flex justify-between font-semibold text-slate-600">
                  <span>Subtotal</span>
                  <span className="text-slate-900">KES {subtotal.toLocaleString()}</span>
                </div>
                {requireEtims && (
                  <div className="flex justify-between font-semibold text-slate-600 mt-2">
                    <span>VAT (16%)</span>
                    <span className="text-slate-900">KES {vatAmount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between font-semibold text-slate-600">
                  <span>Delivery</span>
                  <span className="flex items-center gap-1">
                    {deliveryFee === 0 ? (
                      <span className="text-emerald-500 uppercase font-black tracking-wider text-sm bg-emerald-50 px-2 py-0.5 rounded">Free</span>
                    ) : (
                      <span className="text-slate-900">KES {deliveryFee.toLocaleString()}</span>
                    )}
                  </span>
                </div>
                <div className="border-t border-slate-100 pt-5 mt-3 flex justify-between text-2xl font-black">
                  <span className="text-slate-900">Total</span>
                  <span className="text-[#F59E0B]">KES {total.toLocaleString()}</span>
                </div>
              </div>
              <button
                type="submit"
                form="checkout-form"
                disabled={isSubmitting || checkoutItems.length === 0}
                className="w-full bg-[#F59E0B] text-white font-bold py-4 px-4 rounded-xl flex items-center justify-center gap-2 hover:bg-amber-500 transition-colors disabled:opacity-50 mt-8 cursor-pointer shadow-lg shadow-amber-500/20 text-lg tracking-wide"
              >
                <Truck className="h-6 w-6" />
                <span>{isSubmitting ? 'Processing Order...' : 'Confirm & Place Order'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default CheckoutPage;

import React, { useEffect } from 'react';
import { ArrowLeft, Truck, MapPin, Clock, CalendarDays, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { SEO } from '../components/SEO';

export const ShippingDetailsPage: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 font-sans flex flex-col">
      <SEO 
        title="Shipping & Delivery Details | NexGen Gadgets"
        description="Learn about our shipping and delivery timelines in Kenya. Fast, secure, and reliable delivery right to your doorstep."
        url="/shipping"
      />
      <div className="max-w-4xl mx-auto w-full flex-1">
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center gap-2 text-slate-500 hover:text-[#F59E0B] mb-8 font-semibold transition-colors cursor-pointer w-fit"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back</span>
        </button>

        <div className="bg-white border border-gray-200 rounded-2xl p-8 md:p-12 shadow-sm mb-12">
          <div className="flex items-center gap-4 mb-8 border-b border-gray-100 pb-6">
            <div className="bg-emerald-100 p-3 rounded-xl">
              <Truck className="h-8 w-8 text-emerald-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Shipping & Delivery</h1>
              <p className="text-slate-500 mt-1">Fast, secure, and reliable delivery right to your doorstep.</p>
            </div>
          </div>

          <div className="prose prose-slate max-w-none text-slate-700 space-y-8 leading-relaxed">
            
            <section>
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2 mb-4">
                <MapPin className="h-5 w-5 text-emerald-600" />
                1. Delivery Zones & Timelines
              </h2>
              <div className="grid md:grid-cols-2 gap-4 mt-4">
                <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
                  <h3 className="font-bold text-slate-900 flex items-center gap-2 mb-2">
                    <Clock className="h-4 w-4 text-[#F59E0B]" />
                    Nairobi CBD & Environs
                  </h3>
                  <p className="text-sm">
                    <strong>Same-Day Delivery:</strong> Available for all orders placed and confirmed before <strong>2:00 PM</strong> on weekdays.
                    <br /><br />
                    Orders placed after 2:00 PM will be delivered by noon the following business day.
                  </p>
                </div>
                <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
                  <h3 className="font-bold text-slate-900 flex items-center gap-2 mb-2">
                    <CalendarDays className="h-4 w-4 text-[#F59E0B]" />
                    Outside Nairobi (Countrywide)
                  </h3>
                  <p className="text-sm">
                    <strong>Standard Delivery (2-3 Business Days):</strong> We use trusted courier partners (G4S, Fargo Courier, Wells Fargo) to ensure your items reach you safely across the country.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2 mb-4">
                <ShieldCheck className="h-5 w-5 text-emerald-600" />
                2. Shipping Rates & Insurance
              </h2>
              <p>
                We offer <strong>Free Delivery within Nairobi CBD</strong> for all laptop purchases. For accessories or deliveries outside the CBD and countrywide, standard courier rates apply based on the delivery location and the weight of the package.
              </p>
              <p className="mt-2">
                All high-value items, including laptops, are fully insured during transit. In the rare event that your package is lost or damaged by the courier, NexGen Gadgets assumes full responsibility and will dispatch a replacement immediately.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-4">3. Security and Verification</h2>
              <p>
                For your protection, our delivery agents are instructed to hand over the package only to the person whose name appears on the shipping address. 
              </p>
              <ul className="list-disc pl-5 space-y-2 mt-2">
                <li>You must present a valid National ID or Passport upon delivery.</li>
                <li>If you wish to have someone else receive the package on your behalf, you must contact our support team in advance to authorize them.</li>
                <li>Our couriers will not leave packages unattended at a doorstep or reception desk without direct verification.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-4">4. In-Store Pickup</h2>
              <p>
                Prefer to collect it yourself? You can opt for "Local Pickup" during checkout. Your order will be prepared and ready for collection at our Nairobi CBD store within 2 hours of payment confirmation. Please bring your order confirmation email and ID.
              </p>
            </section>
            
          </div>
        </div>
      </div>
    </div>
  );
};

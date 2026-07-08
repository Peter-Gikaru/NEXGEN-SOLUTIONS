import React, { useEffect } from 'react';
import { ArrowLeft, ShieldAlert, RotateCcw, Box, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { SEO } from '../components/SEO';

export const ReturnPolicyPage: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 font-sans flex flex-col">
      <SEO 
        title="Return & Refund Policy | NexGen Solutions"
        description="Read our return and refund policy. Clear, fair, and transparent guidelines for returns and refunds on laptops and accessories in Kenya."
        url="/returns"
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
            <div className="bg-amber-100 p-3 rounded-xl">
              <RotateCcw className="h-8 w-8 text-[#F59E0B]" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Return & Refund Policy</h1>
              <p className="text-slate-500 mt-1">Clear, fair, and transparent guidelines for returns and refunds.</p>
            </div>
          </div>

          <div className="prose prose-slate max-w-none text-slate-700 space-y-8 leading-relaxed">
            
            <section>
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2 mb-4">
                <ShieldAlert className="h-5 w-5 text-[#F59E0B]" />
                1. Standard Return Window
              </h2>
              <p>
                At NexGen Solutions, we stand behind the quality of our products. If you are not entirely satisfied with your purchase, you may return the item within <strong>7 calendar days</strong> from the date of delivery. To be eligible for a full refund (excluding shipping costs), the item must be completely <strong>unused, sealed in its original packaging, and in the same condition that you received it</strong>.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2 mb-4">
                <Box className="h-5 w-5 text-[#F59E0B]" />
                2. Opened or Unsealed Items
              </h2>
              <p>
                Because we guarantee that our customers receive brand new, factory-sealed electronics, any product that has been opened or unsealed is subject to a strict <strong>15% restocking fee</strong>. This fee covers the diminished value of the item, as we can no longer sell it as new. We reserve the right to reject returns of opened items if they show any signs of use, scratches, missing accessories, or tampered software.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2 mb-4">
                <AlertTriangle className="h-5 w-5 text-[#F59E0B]" />
                3. Defective or Damaged Upon Arrival
              </h2>
              <p>
                If your item arrives damaged or suffers from an out-of-the-box hardware defect, you must report it to us within <strong>48 hours of delivery</strong>. We will arrange a free return and issue a full replacement or refund immediately upon inspecting the defective unit. 
              </p>
              <div className="bg-red-50 text-red-800 p-4 rounded-lg mt-3 text-sm">
                <strong>Note:</strong> Software glitches, unauthorized OS modifications, or physical damage caused after delivery are not considered out-of-the-box defects and will be handled under the manufacturer's warranty instead.
              </div>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2 mb-4">
                <CheckCircle2 className="h-5 w-5 text-[#F59E0B]" />
                4. Non-Returnable Items
              </h2>
              <ul className="list-disc pl-5 space-y-2 mt-2">
                <li>Software licenses, digital downloads, and activation keys.</li>
                <li>Custom-built or heavily upgraded laptops (e.g., custom RAM/SSD upgrades requested prior to shipping).</li>
                <li>Items damaged through user error, power surges, or liquid spills.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-4">5. Refund Process</h2>
              <p>
                Once we receive and inspect your returned item, we will notify you of the approval or rejection of your refund. Approved refunds are initiated within <strong>2 business days</strong> and will be applied to your original method of payment or via M-PESA. Depending on your bank, it may take an additional 3-5 business days for the funds to clear.
              </p>
            </section>
            
          </div>
        </div>
      </div>
    </div>
  );
};

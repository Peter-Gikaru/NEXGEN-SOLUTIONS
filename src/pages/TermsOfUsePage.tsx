import React, { useEffect } from 'react';
import { ArrowLeft, Scale, AlertCircle, RefreshCw, CheckSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { SEO } from '../components/SEO';

export const TermsOfUsePage: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 font-sans flex flex-col">
      <SEO 
        title="Terms of Use | NexGen Solutions"
        description="Read our terms and conditions. Rules, guidelines, and agreements for using the NexGen Solutions platform."
        url="/terms"
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
            <div className="bg-indigo-100 p-3 rounded-xl">
              <Scale className="h-8 w-8 text-indigo-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Terms of Use</h1>
              <p className="text-slate-500 mt-1">Last Updated: July 2026. Please read these terms carefully before using our services.</p>
            </div>
          </div>

          <div className="bg-[#1a1a2e] text-white p-6 rounded-xl mb-10 shadow-sm border border-slate-800">
            <h3 className="font-bold text-lg mb-4 text-[#F59E0B]">Quick Summary for Customers</h3>
            <ul className="space-y-2 text-sm text-slate-300">
              <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-[#F59E0B] rounded-full"></div> Must be 18 years or older to create an account or make a purchase</li>
              <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-[#F59E0B] rounded-full"></div> Provide only authentic billing and shipping information</li>
              <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-[#F59E0B] rounded-full"></div> Placed orders are binding once confirmed</li>
              <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-[#F59E0B] rounded-full"></div> Review products fairly based on actual purchase experience</li>
            </ul>
          </div>

          <div className="prose prose-slate max-w-none text-slate-700 space-y-8 leading-relaxed">
            
            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-4">
                1. Acceptance of Terms
              </h2>
              <p>
                By accessing or using the NexGen Solutions Platform as a customer, you acknowledge & accept these Terms of Use.
              </p>
              <p className="font-bold text-indigo-800 bg-indigo-50 p-4 rounded-lg mt-4 border border-indigo-100">
                Important: By submitting an order, you confirm all information provided is truthful, accurate, and complete. Fraudulent activity results in immediate ban and legal action.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-4">
                2. Definitions
              </h2>
              <ul className="list-disc pl-5 space-y-2">
                <li><strong>Platform:</strong> The NexGen Solutions eCommerce application, including all subdomains, APIs, and related services.</li>
                <li><strong>Order:</strong> The formal request submitted by a customer to purchase a product from our inventory.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2 mb-4">
                <CheckSquare className="h-5 w-5 text-indigo-600" />
                3. Eligibility
              </h2>
              <p>To be eligible to make a purchase or create an account, you must:</p>
              <ul className="list-disc pl-5 mt-2 space-y-2">
                <li>Be at least 18 years of age (or have parental consent).</li>
                <li>Be authorized to use the chosen payment method (Credit Card, M-PESA, etc.).</li>
                <li>Provide a valid delivery address within our shipping zones.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-4">
                4. Account Responsibilities
              </h2>
              <p>You agree to:</p>
              <ul className="list-disc pl-5 mt-2 space-y-2">
                <li>Provide accurate, current, and complete information.</li>
                <li>Keep your password confidential and secure.</li>
                <li>Notify us immediately of any unauthorized account use.</li>
                <li>Be solely responsible for all activities under your account.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-4">
                5. Orders & Cancellations
              </h2>
              <h3 className="text-lg font-bold text-slate-800 mt-4 mb-2">5.1 Order Submission</h3>
              <p>Once an order is submitted and confirmed, it is binding. Ensure all shipping and item details are correct before checking out.</p>
              
              <h3 className="text-lg font-bold text-slate-800 mt-4 mb-2">5.2 Cancellations</h3>
              <p>You may cancel your order at any time while its status remains "PENDING". Once the order has been processed and changed to "CONFIRMED" or "SHIPPED", it can no longer be cancelled from your dashboard. However, you may request a return upon delivery.</p>

              <h3 className="text-lg font-bold text-slate-800 mt-4 mb-2">5.3 Product Availability</h3>
              <p>Submission of an order does not strictly guarantee fulfillment if the product sells out concurrently. The platform will automatically restore stock and notify you if your order cannot be fulfilled.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2 mb-4">
                <RefreshCw className="h-5 w-5 text-indigo-600" />
                6. Product Reviews & Ratings
              </h2>
              <h3 className="text-lg font-bold text-slate-800 mt-4 mb-2">6.1 Verified Purchases</h3>
              <p>You may only submit product and service reviews for orders that have been officially marked as "DELIVERED". We rely on your honest feedback to improve our catalog and services.</p>
              
              <h3 className="text-lg font-bold text-slate-800 mt-4 mb-2">6.2 Review Content</h3>
              <p>Reviews must be clean, fair, and relevant. Submitting false, malicious, or highly inappropriate reviews will lead to account suspension.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-4">
                7. Code of Conduct
              </h2>
              <p>You agree not to:</p>
              <ul className="list-disc pl-5 mt-2 space-y-2">
                <li>Provide false or misleading billing/shipping information.</li>
                <li>Harass, threaten, or discriminate against our delivery personnel.</li>
                <li>Attempt to manipulate pricing, flash sales, or the review system.</li>
                <li>Upload malicious code or compromise Platform security via XSS or other exploits.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2 mb-4">
                <AlertCircle className="h-5 w-5 text-indigo-600" />
                8. Termination
              </h2>
              <p>
                We may suspend or terminate your account for violations of these Terms, suspected fraudulent activity, or at your request. If your customer account remains completely inactive for a continuous period of 24 months, we may securely archive or terminate your account.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-4">
                9. Changes to Terms
              </h2>
              <p>
                If we modify these Terms, we will notify you via email or a Platform alert. Kindly check for any updates, as your continued use of the Platform constitutes acceptance of the changes.
              </p>
            </section>
            
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsOfUsePage;

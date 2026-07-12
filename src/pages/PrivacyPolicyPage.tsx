import React, { useEffect } from 'react';
import { ArrowLeft, Shield, Lock, FileText, Mail, Cookie } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { SEO } from '../components/SEO';

export const PrivacyPolicyPage: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 font-sans flex flex-col">
      <SEO 
        title="Privacy Policy | NexGen Gadgets"
        description="Learn how NexGen Gadgets collects, uses, and protects your personal data when you use our platform."
        url="/privacy"
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
            <div className="bg-blue-100 p-3 rounded-xl">
              <Shield className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Privacy Policy</h1>
              <p className="text-slate-500 mt-1">Last Updated: July 2026. Your privacy and security are our top priority.</p>
            </div>
          </div>

          <div className="bg-[#1a1a2e] text-white p-6 rounded-xl mb-10 shadow-sm border border-slate-800">
            <h3 className="font-bold text-lg mb-4 text-[#F59E0B]">Our Privacy Promise</h3>
            <ul className="space-y-2 text-sm text-slate-300">
              <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-[#F59E0B] rounded-full"></div> We never sell your personal data</li>
              <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-[#F59E0B] rounded-full"></div> We encrypt all sensitive information</li>
              <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-[#F59E0B] rounded-full"></div> You are in control of your data</li>
            </ul>
          </div>

          <div className="prose prose-slate max-w-none text-slate-700 space-y-8 leading-relaxed">
            
            <section>
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2 mb-4">
                <FileText className="h-5 w-5 text-blue-600" />
                1. Introduction
              </h2>
              <p>
                This Privacy notice explains how data is collected, used, shared, and safeguarded when you use the NexGen eCommerce Platform ("the Platform", "we", "our" or "us"). This policy is designed to comply with the <strong>General Data Protection Regulation (GDPR)</strong> and the <strong>Kenyan Data Protection Act of 2019</strong>.
              </p>
              <h3 className="text-lg font-bold text-slate-800 mt-4 mb-2">1.1 Scope & Key Parties</h3>
              <p>
                This notice applies to all users of the NexGen Platform, including customers, guest shoppers, and administrators. By continuing to use the Platform, you consent to the data practices described in this notice. For the purpose of data governance on this Platform:
              </p>
              <ul className="list-disc pl-5 mt-2 space-y-2">
                <li><strong>NexGen (Data Controller):</strong> As the Data Controller, NexGen hosts the platform and determines how your personal data is collected and used to fulfill your orders.</li>
                <li><strong>Delivery & Logistics Partners:</strong> When your order is shipped, relevant information necessary for delivery is shared with our trusted Courier Partners. Upon receiving your data, they process it solely for the purpose of fulfilling your delivery.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-4">
                2. Data We Collect
              </h2>
              <p>We collect information to provide, improve, and secure the NexGen Platform. The types of data we collect depend on how you interact with us.</p>
              
              <h3 className="text-lg font-bold text-slate-800 mt-4 mb-2">2.1 Information You Provide</h3>
              <ul className="list-disc pl-5 mt-2 space-y-2">
                <li><strong>Identity Data:</strong> Full name and contact preferences.</li>
                <li><strong>Contact Data:</strong> Email address, phone number, and billing/shipping address.</li>
                <li><strong>Checkout & Cart Data:</strong> Contact information entered during the checkout process (such as your email address) may be captured and stored even if the checkout process is not completed. This allows us to offer cart recovery services and send promotional updates.</li>
                <li><strong>Financial Data:</strong> Selected payment methods. (Note: We do not store full credit card numbers or raw M-PESA PINs on our servers).</li>
              </ul>

              <h3 className="text-lg font-bold text-slate-800 mt-4 mb-2">2.2 Information We Collect Automatically</h3>
              <p>When you use the Platform, we automatically collect technical data to ensure its functionality and security for all users:</p>
              <ul className="list-disc pl-5 mt-2 space-y-2">
                <li><strong>Usage Data:</strong> Pages visited, products viewed, and time spent on the Platform.</li>
                <li><strong>Device Data:</strong> IP address, browser type, and operating system.</li>
                <li><strong>Log & Audit Data:</strong> Access times, error logs, and a strict audit trail of actions taken by Administrator accounts.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-4">
                3. Legal Basis for Processing
              </h2>
              <ul className="list-disc pl-5 mt-2 space-y-2">
                <li><strong>Consent:</strong> You consent to processing your data when you create an account or place an order. You may withdraw consent at any time (subject to legal or contractual restrictions).</li>
                <li><strong>Contractual Necessity:</strong> We process data where necessary to facilitate the fulfillment of your orders and deliveries.</li>
                <li><strong>Legitimate Interests:</strong> We process data to ensure the security and integrity of the Platform and detect fraudulent activity.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-4">
                4. How We Use Your Data
              </h2>
              <p>We use your personal data exclusively for purposes related to your shopping experience on NexGen. We do not sell your data.</p>
              <ul className="list-disc pl-5 mt-2 space-y-2">
                <li>To process and fulfill your orders, and manage returns.</li>
                <li>To send you order status updates and tracking information.</li>
                <li>To detect and prevent fraudulent transactions on the Platform.</li>
                <li>To monitor and improve overall Platform performance and stability.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-4">
                5. Data Retention
              </h2>
              <p>We retain your personal data only as long as necessary to fulfill the purposes outlined in this notice.</p>
              <ul className="list-disc pl-5 mt-2 space-y-2">
                <li><strong>Active Customers:</strong> Your account data is retained for the duration of your active account lifecycle.</li>
                <li><strong>Order History:</strong> Your purchase records are retained for 7 years to meet tax, audit, and financial reporting obligations.</li>
                <li><strong>Data Deletion:</strong> After the retention period expires, we securely delete your data. You may also request earlier deletion of your account data as described under your rights.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2 mb-4">
                <Lock className="h-5 w-5 text-blue-600" />
                6. Data Security
              </h2>
              <p>We implement enterprise-grade technical and organizational measures to protect your personal data from unauthorized access, use, or disclosure.</p>
              <ul className="list-disc pl-5 mt-2 space-y-2">
                <li>Encryption in transit (TLS) and at rest (AES-256).</li>
                <li>Multi-factor authentication for administrative access.</li>
                <li>Automated backups and disaster recovery plans.</li>
              </ul>
              <p className="mt-4"><strong>Your Responsibilities:</strong> You are responsible for maintaining the confidentiality of your account password. Notify us immediately if you suspect unauthorized access to your account.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2 mb-4">
                <Mail className="h-5 w-5 text-blue-600" />
                7. Your Rights & Dispute Resolution
              </h2>
              <h3 className="text-lg font-bold text-slate-800 mt-4 mb-2">7.1 Your Privacy Rights</h3>
              <p>To exercise any of these rights, kindly reach out to us by submitting a request via our support channels.</p>
              <ul className="list-disc pl-5 mt-2 space-y-2">
                <li><strong>Right to Access:</strong> Request a copy of the personal data we hold about you.</li>
                <li><strong>Right to Correction:</strong> Request correction of inaccurate or incomplete data.</li>
                <li><strong>Right to Deletion:</strong> Request deletion of your data, subject to legal requirements.</li>
                <li><strong>Right to Restrict Processing:</strong> Request to limit how we use your data in certain circumstances.</li>
              </ul>
              
              <h3 className="text-lg font-bold text-slate-800 mt-6 mb-2">7.2 Dispute Resolution</h3>
              <p>In case of any complaints, kindly reach out to us through <strong>support@nexgen-gadgets.com</strong>.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2 mb-4">
                <Cookie className="h-5 w-5 text-blue-600" />
                8. Cookies & Tracking Technologies
              </h2>
              <p>We use cookies and similar technologies to enhance your experience, remember your shopping cart, and improve the Platform.</p>
              <ul className="list-disc pl-5 mt-2 space-y-2">
                <li><strong>Essential Cookies:</strong> Required for core Platform functionality, including authentication, security, and session management.</li>
                <li><strong>Analytics Cookies:</strong> Help us understand how users interact with the Platform so we can improve performance.</li>
              </ul>
              <p className="mt-4">You can control cookies through your browser settings. Note that disabling essential cookies may prevent you from placing orders.</p>
            </section>

          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;

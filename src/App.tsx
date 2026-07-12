import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Header } from './components/Header';
import { CartDrawer } from './components/CartDrawer';
import { HomePage } from './pages/HomePage';
import { ProductListingPage } from './pages/ProductListingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { CustomerDashboardPage } from './pages/CustomerDashboardPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { TrackOrderPage } from './pages/TrackOrderPage';
import { WishlistPage } from './pages/WishlistPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { FAQPage } from './pages/FAQPage';
import { ShippingDetailsPage } from './pages/ShippingDetailsPage';
import { ReturnPolicyPage } from './pages/ReturnPolicyPage';
import { PrivacyPolicyPage } from './pages/PrivacyPolicyPage';
import { TermsOfUsePage } from './pages/TermsOfUsePage';
import { HowToShopPage } from './pages/HowToShopPage';
import { ComparePage } from './pages/ComparePage';
import ReturnRequestPage from './pages/ReturnRequestPage';
import WarrantyClaimPage from './pages/WarrantyClaimPage';
import HelpCenterPage from './pages/HelpCenterPage';
import { AnnouncementBar } from './components/AnnouncementBar';
import { Footer } from './components/Footer';
import { FollowUsSidebar } from './components/FollowUsSidebar';
import { SupportWidget } from './components/SupportWidget';
import { InstallPWA } from './components/InstallPWA';
import { CookieConsent } from './components/CookieConsent';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';
import { ForceChangePasswordPage } from './pages/ForceChangePasswordPage';
import { LiveChatWidget } from './components/LiveChatWidget';

import { Link } from 'react-router-dom';

const AuthLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen flex font-sans antialiased bg-[#021024] overflow-hidden">
      <div className="flex-1 w-full flex flex-col lg:flex-row items-center justify-center p-6 lg:p-12 gap-12 lg:gap-24">
        
        {/* Left Side: Text and Value Props */}
        <div className="hidden lg:block w-full max-w-xl text-white space-y-8">
          <Link to="/" className="inline-block mb-4">
            <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center text-white hover:bg-red-700 transition-colors shadow-lg shadow-red-500/20">
              <span className="font-bold text-xl tracking-tighter">NX</span>
            </div>
          </Link>
          
          <h1 className="text-3xl lg:text-4xl font-bold leading-tight text-white tracking-tight">
            Start your premium shopping experience today to test out the NexGen platform with <span className="text-white">no strings attached:</span>
          </h1>
          
          <ul className="space-y-3 text-base text-slate-300 mt-6 font-medium">
            <li className="flex items-center gap-3">
              <span className="text-blue-500 text-xl font-bold">✓</span> No credit card required to browse
            </li>
            <li className="flex items-center gap-3">
              <span className="text-blue-500 text-xl font-bold">✓</span> Free express shipping available
            </li>
            <li className="flex items-center gap-3">
              <span className="text-blue-500 text-xl font-bold">✓</span> Access to all premium tech products across our platform
            </li>
          </ul>

          <h2 className="text-2xl font-bold pt-8 text-white tracking-tight">Get up and running</h2>
          <ul className="space-y-3 text-base text-slate-300 font-medium">
            <li className="flex items-center gap-3">
              <span className="text-blue-500 text-xl font-bold">✓</span> Verify your email address & phone number
            </li>
            <li className="flex items-center gap-3">
              <span className="text-blue-500 text-xl font-bold">✓</span> Tell us what gadgets you love
            </li>
            <li className="flex items-center gap-3">
              <span className="text-blue-500 text-xl font-bold">✓</span> Start shopping!
            </li>
          </ul>
          
          <p className="text-xs text-slate-500 pt-8 max-w-md font-medium leading-relaxed">
            *Free shipping and member discounts may be limited by time, location, and usage caps, and are subject to change without notice.
          </p>
        </div>

        {/* Right Side: Form Card */}
        <div className="w-full max-w-[500px]">
          {/* Mobile Logo Fallback */}
          <div className="flex lg:hidden justify-center mb-8">
            <Link to="/">
              <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center text-white shadow-lg shadow-red-500/20">
                <span className="font-bold text-xl tracking-tighter">NX</span>
              </div>
            </Link>
          </div>

          <div className="bg-white rounded-xl p-8 sm:p-10 shadow-2xl">
            {children}
          </div>
        </div>

      </div>
      <Toaster position="top-center" />
    </div>
  );
};

const AdminLayout: React.FC = () => {
  return (
    <div className="h-screen w-full font-sans antialiased bg-slate-50 flex flex-col overflow-hidden">
      <Routes>
        <Route path="/" element={<AdminDashboardPage />} />
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
      <Toaster position="top-center" />
    </div>
  );
};

const CustomerLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col font-sans text-slate-800 antialiased overflow-x-hidden selection:bg-amber-200 selection:text-slate-900">
      <AnnouncementBar />
      <Header />
      
      <main className="flex flex-col flex-1 relative w-full pt-[64px] md:pt-[72px] overflow-x-hidden">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/products" element={<ProductListingPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/orders" element={<CustomerDashboardPage />} />
          <Route path="/product/:slug" element={<ProductDetailPage />} />
          <Route path="/return-request" element={<ReturnRequestPage />} />
          <Route path="/warranty-claim" element={<WarrantyClaimPage />} />
          <Route path="/track" element={<TrackOrderPage />} />
          <Route path="/help" element={<HelpCenterPage />} />
          <Route path="/wishlist" element={<WishlistPage />} />
          <Route path="/compare" element={<ComparePage />} />
          <Route path="/faq" element={<FAQPage />} />
          <Route path="/shipping" element={<ShippingDetailsPage />} />
          <Route path="/returns" element={<ReturnPolicyPage />} />
          <Route path="/privacy" element={<PrivacyPolicyPage />} />
          <Route path="/terms" element={<TermsOfUsePage />} />
          <Route path="/how-to-shop" element={<HowToShopPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>

      <Footer />
      <FollowUsSidebar />
      <SupportWidget />
      <LiveChatWidget />
      <InstallPWA />
      <CookieConsent />
      <CartDrawer />
      <Toaster position="top-center" />
    </div>
  );
};

const AppContent: React.FC = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-bg-gray flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-blue"></div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={<AuthLayout><LoginPage /></AuthLayout>} />
      <Route path="/register" element={<AuthLayout><RegisterPage /></AuthLayout>} />
      <Route path="/forgot-password" element={<AuthLayout><ForgotPasswordPage /></AuthLayout>} />
      <Route path="/reset-password/:token" element={<AuthLayout><ResetPasswordPage /></AuthLayout>} />
      <Route path="/force-change-password" element={<AuthLayout><ForceChangePasswordPage /></AuthLayout>} />

      <Route 
        path="/admin/*" 
        element={user?.role === 'ADMIN' ? <AdminLayout /> : <Navigate to="/login" replace />} 
      />
      <Route 
        path="/*" 
        element={<CustomerLayout />} 
      />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>
          <Router>
            <AppContent />
          </Router>
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  );
};

export default App;

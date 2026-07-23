import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Header } from './components/Header';
import { CartDrawer } from './components/CartDrawer';
const HomePage = lazy(() => import('./pages/HomePage').then((m: any) => ({ default: m.HomePage || m.default })));
const ProductListingPage = lazy(() => import('./pages/ProductListingPage').then((m: any) => ({ default: m.ProductListingPage || m.default })));
const LoginPage = lazy(() => import('./pages/LoginPage').then((m: any) => ({ default: m.LoginPage || m.default })));
const RegisterPage = lazy(() => import('./pages/RegisterPage').then((m: any) => ({ default: m.RegisterPage || m.default })));
const AdminDashboardPage = lazy(() => import('./pages/AdminDashboardPage').then((m: any) => ({ default: m.AdminDashboardPage || m.default })));
const CheckoutPage = lazy(() => import('./pages/CheckoutPage').then((m: any) => ({ default: m.CheckoutPage || m.default })));
const CustomerDashboardPage = lazy(() => import('./pages/CustomerDashboardPage').then((m: any) => ({ default: m.CustomerDashboardPage || m.default })));
const ProductDetailPage = lazy(() => import('./pages/ProductDetailPage').then((m: any) => ({ default: m.ProductDetailPage || m.default })));
const TrackOrderPage = lazy(() => import('./pages/TrackOrderPage').then((m: any) => ({ default: m.TrackOrderPage || m.default })));
const WishlistPage = lazy(() => import('./pages/WishlistPage').then((m: any) => ({ default: m.WishlistPage || m.default })));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage').then((m: any) => ({ default: m.NotFoundPage || m.default })));
const FAQPage = lazy(() => import('./pages/FAQPage').then((m: any) => ({ default: m.FAQPage || m.default })));
const ShippingDetailsPage = lazy(() => import('./pages/ShippingDetailsPage').then((m: any) => ({ default: m.ShippingDetailsPage || m.default })));
const ReturnPolicyPage = lazy(() => import('./pages/ReturnPolicyPage').then((m: any) => ({ default: m.ReturnPolicyPage || m.default })));
const PrivacyPolicyPage = lazy(() => import('./pages/PrivacyPolicyPage').then((m: any) => ({ default: m.PrivacyPolicyPage || m.default })));
const TermsOfUsePage = lazy(() => import('./pages/TermsOfUsePage').then((m: any) => ({ default: m.TermsOfUsePage || m.default })));
const HowToShopPage = lazy(() => import('./pages/HowToShopPage').then((m: any) => ({ default: m.HowToShopPage || m.default })));
const ComparePage = lazy(() => import('./pages/ComparePage').then((m: any) => ({ default: m.ComparePage || m.default })));
const ReturnRequestPage = lazy(() => import('./pages/ReturnRequestPage').then((m: any) => ({ default: m.default || m.ReturnRequestPage })));
const WarrantyClaimPage = lazy(() => import('./pages/WarrantyClaimPage').then((m: any) => ({ default: m.default || m.WarrantyClaimPage })));
const HelpCenterPage = lazy(() => import('./pages/HelpCenterPage').then((m: any) => ({ default: m.default || m.HelpCenterPage })));
import { AnnouncementBar } from './components/AnnouncementBar';
import { Footer } from './components/Footer';
import { FollowUsSidebar } from './components/FollowUsSidebar';

import { CookieConsent } from './components/CookieConsent';
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage').then((m: any) => ({ default: m.ForgotPasswordPage || m.default })));
const ResetPasswordPage = lazy(() => import('./pages/ResetPasswordPage').then((m: any) => ({ default: m.ResetPasswordPage || m.default })));
const ForceChangePasswordPage = lazy(() => import('./pages/ForceChangePasswordPage').then((m: any) => ({ default: m.ForceChangePasswordPage || m.default })));
import { LiveChatWidget } from './components/LiveChatWidget';
import { MobileBottomNav } from './components/MobileBottomNav';

import { Link } from 'react-router-dom';


const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-white">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
  </div>
);

const AuthLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen w-full flex font-sans antialiased bg-white overflow-hidden">
      {}
      <div className="hidden lg:flex w-1/2 bg-[#0f172a] items-center justify-center relative">
        {}
        <div className="flex flex-col items-center justify-center transform transition-transform hover:scale-105 duration-300">
          <img src="/favicon.png" alt="NexGen Logo" className="h-40 w-auto object-contain drop-shadow-2xl" />
          <h2 className="text-white text-3xl font-bold mt-8 tracking-wide">NexGen Gadgets</h2>
          <p className="text-slate-400 mt-2 font-medium">Premium Tech, Delivered.</p>
        </div>
        
        {}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 to-transparent pointer-events-none"></div>
      </div>

      {}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center py-12 px-4 sm:px-12 xl:px-24 bg-white relative">
        <div className="w-full max-w-[440px]">
          {}
          <div className="flex lg:hidden justify-center mb-8">
            <Link to="/">
              <img src="/favicon.png" alt="NexGen Logo" className="h-16 w-auto object-contain" />
            </Link>
          </div>
          
          {children}
        </div>
      </div>
      
      <Toaster position="top-center" />
    </div>
  );
};

const AdminLayout: React.FC = () => {
  return (
    <div className="h-screen w-full font-sans antialiased bg-slate-50 flex flex-col overflow-hidden">
      <Suspense fallback={<PageLoader />}><Routes>
        <Route path="/" element={<AdminDashboardPage />} />
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes></Suspense>
      <Toaster position="top-center" />
    </div>
  );
};

const CustomerLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col font-sans text-slate-800 antialiased overflow-x-hidden selection:bg-amber-200 selection:text-slate-900 pb-16 md:pb-0">
      <AnnouncementBar />
      <Header />
      
      <main className="flex flex-col flex-1 relative w-full pt-[64px] md:pt-[72px] overflow-x-hidden">
        <Suspense fallback={<PageLoader />}><Routes>
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
        </Routes></Suspense>
      </main>

      <Footer />
      <FollowUsSidebar />
      <LiveChatWidget />
      {}
      <CookieConsent />
      <MobileBottomNav />
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
    <Suspense fallback={<PageLoader />}><Routes>
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
        element={user?.role === 'ADMIN' ? <Navigate to="/admin" replace /> : <CustomerLayout />} 
      />
    </Routes></Suspense>
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

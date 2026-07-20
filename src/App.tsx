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

import { CookieConsent } from './components/CookieConsent';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';
import { ForceChangePasswordPage } from './pages/ForceChangePasswordPage';
import { LiveChatWidget } from './components/LiveChatWidget';
import { MobileBottomNav } from './components/MobileBottomNav';

import { Link } from 'react-router-dom';

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
    <div className="min-h-screen flex flex-col font-sans text-slate-800 antialiased overflow-x-hidden selection:bg-amber-200 selection:text-slate-900 pb-16 md:pb-0">
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
        element={user?.role === 'ADMIN' ? <Navigate to="/admin" replace /> : <CustomerLayout />} 
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

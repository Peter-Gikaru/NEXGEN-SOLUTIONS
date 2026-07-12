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

import { Link } from 'react-router-dom';

const AuthLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col font-sans bg-slate-50 antialiased overflow-x-hidden">
      <div className="flex-1 flex justify-center items-center py-12 px-4">
        <div className="w-full max-w-[540px]">
          <div className="w-full bg-white border border-slate-200/60 rounded-[24px] p-8 sm:p-12 shadow-xl shadow-slate-200/40">
            <div className="flex justify-center mb-8">
              <Link to="/" className="flex justify-center hover:opacity-90 transition-opacity">
                <img src="/favicon.png" alt="NexGen Logo" className="h-20 md:h-24 w-auto object-contain drop-shadow-sm" />
              </Link>
            </div>
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

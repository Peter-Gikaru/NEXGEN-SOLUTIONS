import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import api from '../services/api';
import { 
  User, 
  Shield, 
  MapPin, 
  CreditCard, 
  Bell, 
  Save,
  Key,
  Smartphone
} from 'lucide-react';
import { startRegistration } from '@simplewebauthn/browser';

export const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  const { addToast } = useCart();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);

  
  const [name, setName] = useState(user?.name || '');
  
  // Security Form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  
  // Address Form
  const [address, setAddress] = useState<any>(user?.defaultAddress && typeof user.defaultAddress === 'object' ? user.defaultAddress : {
    phoneNumber: '', city: '', area: '', detailedAddress: ''
  });

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.put('/auth/profile', { name });
      addToast('Profile updated successfully.');
    } catch (err: any) {
      addToast(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/force-change-password', { currentPassword, newPassword });
      addToast('Password updated securely.');
      setCurrentPassword('');
      setNewPassword('');
    } catch (err: any) {
      addToast(err.response?.data?.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  const handleAddressUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.put('/auth/profile/address', { address });
      addToast('Default address updated.');
    } catch (err: any) {
      addToast(err.response?.data?.message || 'Failed to update address');
    } finally {
      setLoading(false);
    }
  };

  const handleEnrollPasskey = async () => {
    try {
      const resp = await api.post('/auth/passkey/register/start');
      const attResp = await startRegistration({ optionsJSON: resp.data });
      const verification = await api.post('/auth/passkey/register/finish', attResp);
      if (verification.data.verified) {
        addToast('Passkey enrolled successfully!');
      } else {
        addToast('Passkey verification failed.');
      }
    } catch (err: any) {
      addToast(err.message || 'Passkey enrollment cancelled.');
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile Info', icon: User },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'address', label: 'Address Book', icon: MapPin },
    { id: 'payment', label: 'Payment Vault', icon: CreditCard },
    { id: 'preferences', label: 'Preferences', icon: Bell },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Account Settings</h1>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {}
        <div className="w-full md:w-64 space-y-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {}
        <div className="flex-1 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 md:p-8">
          
          {}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Profile Information</h2>
                <p className="text-gray-500 dark:text-gray-400">Update your basic profile details here.</p>
              </div>
              <form onSubmit={handleProfileUpdate} className="space-y-4 max-w-lg">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email Address</label>
                  <input type="email" value={user?.email || ''} disabled className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-500 cursor-not-allowed" />
                  <p className="text-xs text-gray-400 mt-1">Email addresses cannot be changed for security reasons.</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <button type="submit" disabled={loading} className="flex items-center justify-center space-x-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors w-full sm:w-auto">
                  <Save className="w-4 h-4" />
                  <span>{loading ? 'Saving...' : 'Save Changes'}</span>
                </button>
              </form>
            </div>
          )}

          {}
          {activeTab === 'security' && (
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Security & Authentication</h2>
                <p className="text-gray-500 dark:text-gray-400">Manage your password and secure your account with passkeys.</p>
              </div>
              
              <form onSubmit={handlePasswordUpdate} className="space-y-4 max-w-lg bg-gray-50 dark:bg-gray-800/50 p-6 rounded-xl border border-gray-100 dark:border-gray-700">
                <h3 className="text-lg font-bold flex items-center space-x-2 text-gray-900 dark:text-white">
                  <Key className="w-5 h-5 text-blue-500" />
                  <span>Update Password</span>
                </h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Current Password</label>
                  <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">New Password</label>
                  <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg outline-none" />
                </div>
                <button type="submit" disabled={loading} className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-6 py-2 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors">
                  Update Password
                </button>
              </form>

              <div className="max-w-lg bg-blue-50 dark:bg-blue-900/20 p-6 rounded-xl border border-blue-100 dark:border-blue-800">
                <h3 className="text-lg font-bold flex items-center space-x-2 text-blue-900 dark:text-blue-100 mb-2">
                  <Shield className="w-5 h-5" />
                  <span>Biometric Login (Passkeys)</span>
                </h3>
                <p className="text-sm text-blue-700 dark:text-blue-300 mb-4">
                  Log in faster and more securely using your device's fingerprint, face scan, or PIN.
                </p>
                <button onClick={handleEnrollPasskey} className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                  Enroll New Passkey
                </button>
              </div>
            </div>
          )}

          {}
          {activeTab === 'address' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Address Book</h2>
                <p className="text-gray-500 dark:text-gray-400">Set your default shipping address for faster checkout.</p>
              </div>
              <form onSubmit={handleAddressUpdate} className="space-y-4 max-w-lg">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone Number</label>
                  <input type="text" value={address.phoneNumber} onChange={(e) => setAddress({...address, phoneNumber: e.target.value})} required className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg outline-none" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">City</label>
                    <input type="text" value={address.city} onChange={(e) => setAddress({...address, city: e.target.value})} required className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Area</label>
                    <input type="text" value={address.area} onChange={(e) => setAddress({...address, area: e.target.value})} required className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg outline-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Detailed Address</label>
                  <textarea value={address.detailedAddress} onChange={(e) => setAddress({...address, detailedAddress: e.target.value})} required className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg outline-none h-24 resize-none" />
                </div>
                <button type="submit" disabled={loading} className="flex items-center justify-center space-x-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors w-full sm:w-auto">
                  <Save className="w-4 h-4" />
                  <span>{loading ? 'Saving...' : 'Save Default Address'}</span>
                </button>
              </form>
            </div>
          )}

          {}
          {activeTab === 'payment' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Payment Vault</h2>
                <p className="text-gray-500 dark:text-gray-400">Manage your saved payment methods securely.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {}
                <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-xl border border-green-200 dark:border-green-800">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                        <Smartphone className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-green-900 dark:text-green-100">M-Pesa</h3>
                        <p className="text-sm text-green-700 dark:text-green-300">Default Mobile Money</p>
                      </div>
                    </div>
                    <span className="bg-green-200 text-green-800 text-xs px-2 py-1 rounded-full font-bold">ACTIVE</span>
                  </div>
                  <p className="text-sm text-green-800 dark:text-green-200">
                    Linked to your default shipping phone number: 
                    <p className="font-medium text-slate-800">{user && typeof user !== 'string' && (user as any).phoneNumber ? (user as any).phoneNumber : 'Not added'}</p>
                  </p>
                </div>

                {}
                <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-xl border border-gray-200 dark:border-gray-700 relative overflow-hidden group cursor-not-allowed">
                  <div className="absolute inset-0 bg-white/50 dark:bg-black/50 backdrop-blur-[2px] z-10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="bg-gray-900 text-white px-4 py-2 rounded-lg font-bold text-sm shadow-xl">Coming Soon</span>
                  </div>
                  <div className="flex items-center justify-between mb-4 opacity-50">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                        <CreditCard className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 dark:text-gray-100">Credit / Debit Card</h3>
                        <p className="text-sm text-gray-500">Stripe Integration</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2 opacity-50">
                    <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                    <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {}
          {activeTab === 'preferences' && (
            <div className="space-y-6 max-w-lg">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Notification Preferences</h2>
                <p className="text-gray-500 dark:text-gray-400">Control how we communicate with you.</p>
              </div>

              <div className="space-y-4">
                <label className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-100 dark:border-gray-700 cursor-pointer">
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-white">Order Updates</h4>
                    <p className="text-sm text-gray-500">Receive email and SMS updates about your orders.</p>
                  </div>
                  <input type="checkbox" defaultChecked className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500" />
                </label>

                <label className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-100 dark:border-gray-700 cursor-pointer">
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-white">Price Drop Alerts</h4>
                    <p className="text-sm text-gray-500">Get notified when products in your wishlist drop in price.</p>
                  </div>
                  <input type="checkbox" defaultChecked className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500" />
                </label>

                <label className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-100 dark:border-gray-700 cursor-pointer">
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-white">Marketing Newsletter</h4>
                    <p className="text-sm text-gray-500">Receive weekly updates on our latest tech and offers.</p>
                  </div>
                  <input type="checkbox" className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500" />
                </label>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

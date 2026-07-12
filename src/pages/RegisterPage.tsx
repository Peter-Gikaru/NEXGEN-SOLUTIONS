import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { GoogleLogin } from '@react-oauth/google';

const isGoogleEnabled = import.meta.env.VITE_GOOGLE_CLIENT_ID && import.meta.env.VITE_GOOGLE_CLIENT_ID !== 'your_google_client_id.apps.googleusercontent.com';

export const RegisterPage: React.FC = () => {
  const { register, googleLogin } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const role = 'USER';
  const [showPassword, setShowPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;
    if (!passwordRegex.test(password)) {
      toast.error('Password does not meet the security requirements.');
      return;
    }
    if (password !== confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }
    
    setIsSubmitting(true);

    try {
      await register(email, name, password, role);
      toast.success('Account created securely!');
      navigate('/');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to register account. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      const userData = await googleLogin(credentialResponse.credential);
      toast.success('Successfully registered and logged in with Google');
      if (userData.requiresPasswordChange) {
        navigate('/force-change-password');
      } else {
        navigate('/');
      }
    } catch (err: any) {
      toast.error(err.message || 'Google Login failed');
    }
  };

  const handleFacebookLogin = () => {
    toast.error('Facebook login not implemented yet');
  };

  return (
    <>
        <div className="text-center mb-8">
          <img src="/favicon.png" alt="NexGen Logo" className="h-12 w-auto mx-auto mb-4 object-contain lg:hidden" />
          <h2 className="font-sans text-3xl font-extrabold tracking-tight text-slate-900">
            Create <span className="text-[#F59E0B]">Account</span>
          </h2>
          <p className="text-slate-500 text-sm mt-2 font-medium">
            Join us to manage your orders and track deliveries
          </p>
        </div>

        

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-slate-700 text-sm font-bold mb-2" htmlFor="name">
              Full Name
            </label>
            <div className="relative">
              <svg className="absolute left-3.5 top-3.5 h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <input
                id="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-3.5 text-sm focus:outline-none focus:bg-white focus:border-[#F59E0B] focus:ring-2 focus:ring-[#F59E0B]/20 transition-all placeholder-slate-400 text-slate-900 font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 text-sm font-bold mb-2" htmlFor="email">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3.5 h-5 w-5 text-slate-400" />
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-3.5 text-sm focus:outline-none focus:bg-white focus:border-[#F59E0B] focus:ring-2 focus:ring-[#F59E0B]/20 transition-all placeholder-slate-400 text-slate-900 font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 text-sm font-bold mb-2" htmlFor="password">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3.5 h-5 w-5 text-slate-400" />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-12 py-3.5 text-sm focus:outline-none focus:bg-white focus:border-[#F59E0B] focus:ring-2 focus:ring-[#F59E0B]/20 transition-all placeholder-slate-400 text-slate-900 font-medium"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 transition-colors"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            <div className="mt-3 bg-slate-50 border border-slate-200 rounded-lg p-3">
              <p className="text-xs font-bold text-slate-700 mb-2">Your password must contain:</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-medium">
                <div className={`flex items-center gap-1.5 ${password.length >= 8 ? 'text-emerald-600' : 'text-slate-500'}`}>
                  <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center border ${password.length >= 8 ? 'bg-emerald-100 border-emerald-500 text-emerald-600' : 'border-slate-300'}`}>
                    {password.length >= 8 && <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                  </div>
                  At least 8 characters
                </div>
                <div className={`flex items-center gap-1.5 ${/[A-Z]/.test(password) && /[a-z]/.test(password) ? 'text-emerald-600' : 'text-slate-500'}`}>
                  <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center border ${/[A-Z]/.test(password) && /[a-z]/.test(password) ? 'bg-emerald-100 border-emerald-500 text-emerald-600' : 'border-slate-300'}`}>
                    {/[A-Z]/.test(password) && /[a-z]/.test(password) && <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                  </div>
                  Upper & lowercase letters
                </div>
                <div className={`flex items-center gap-1.5 ${/\d/.test(password) ? 'text-emerald-600' : 'text-slate-500'}`}>
                  <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center border ${/\d/.test(password) ? 'bg-emerald-100 border-emerald-500 text-emerald-600' : 'border-slate-300'}`}>
                    {/\d/.test(password) && <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                  </div>
                  At least 1 number
                </div>
                <div className={`flex items-center gap-1.5 ${/[@$!%*?&#]/.test(password) ? 'text-emerald-600' : 'text-slate-500'}`}>
                  <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center border ${/[@$!%*?&#]/.test(password) ? 'bg-emerald-100 border-emerald-500 text-emerald-600' : 'border-slate-300'}`}>
                    {/[@$!%*?&#]/.test(password) && <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                  </div>
                  At least 1 special char
                </div>
              </div>
            </div>
          </div>


          <div>
            <label className="block text-slate-700 text-sm font-bold mb-2" htmlFor="confirmPassword">
              Confirm Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3.5 h-5 w-5 text-slate-400" />
              <input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-12 py-3.5 text-sm focus:outline-none focus:bg-white focus:border-[#F59E0B] focus:ring-2 focus:ring-[#F59E0B]/20 transition-all placeholder-slate-400 text-slate-900 font-medium"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 transition-colors"
              >
                {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-[#F59E0B] text-white font-bold py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 hover:bg-amber-600 transition-colors disabled:opacity-50 cursor-pointer shadow-lg shadow-amber-500/30"
          >
            <span>{isSubmitting ? 'Creating Account...' : 'Create Account'}</span>
            {!isSubmitting && <ArrowRight className="h-5 w-5" />}
          </button>
        </form>

        <div className="mt-6 flex flex-col items-center gap-3">
          {isGoogleEnabled && (
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => toast.error('Google Login Failed')}
              theme="outline"
              shape="rectangular"
              text="signup_with"
            />
          )}
          
          <button
            onClick={handleFacebookLogin}
            className="w-full max-w-[280px] bg-[#1877F2] text-white font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 hover:bg-[#166FE5] transition-colors shadow-sm text-sm"
          >
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path
                fillRule="evenodd"
                d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
                clipRule="evenodd"
              />
            </svg>
            <span>Continue with Facebook</span>
          </button>
        </div>

        <div className="mt-8 text-center pt-6">
          <p className="text-slate-500 text-sm font-medium">
            Already have an account?{' '}
            <Link to="/login" className="text-[#F59E0B] hover:text-amber-600 hover:underline font-bold transition-colors">
              Sign In
            </Link>
          </p>
        </div>
    </>
  );
};
export default RegisterPage;

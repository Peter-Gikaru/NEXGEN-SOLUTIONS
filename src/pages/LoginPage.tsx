import React, { useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Key, Eye, EyeOff, ArrowRight, ArrowLeft, AlertCircle, Lock, Mail } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';
import { GoogleLogin } from '@react-oauth/google';
import { startAuthentication, WebAuthnAbortService } from '@simplewebauthn/browser';

const isGoogleEnabled = import.meta.env.VITE_GOOGLE_CLIENT_ID && import.meta.env.VITE_GOOGLE_CLIENT_ID !== 'your_google_client_id.apps.googleusercontent.com';

export const LoginPage: React.FC = () => {
  const { login, googleLogin, facebookLogin, passkeyLoginAction } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRestoreModalOpen, setIsRestoreModalOpen] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [step, setStep] = useState<'email' | 'password'>('email');

  React.useEffect(() => {
    const initConditionalUI = async () => {
      try {
        if (window.PublicKeyCredential && PublicKeyCredential.isConditionalMediationAvailable) {
          const isAvailable = await PublicKeyCredential.isConditionalMediationAvailable();
          if (isAvailable) {
            const resp = await api.post('/auth/passkey/login/start');
            const options = resp.data;
            const asseResp = await startAuthentication({ 
              optionsJSON: options, 
              useBrowserAutofill: true
            });
            
            const verificationResp = await api.post('/auth/passkey/login/finish', asseResp);
            passkeyLoginAction(verificationResp.data);
            toast.success('Successfully logged in with Passkey');
            
            if (verificationResp.data.requiresPasswordChange) {
              navigate('/force-change-password');
            } else if (redirect) {
              navigate(`/${redirect}`);
            } else {
              navigate('/');
            }
          }
        }
      } catch (err: any) {
        if (err.code === 'ERROR_CEREMONY_ABORTED' || err.name === 'AbortError') {
          console.log('Conditional UI gracefully aborted');
        } else {
          console.log('Conditional UI failed', err);
        }
      }
    };
    initConditionalUI();

    return () => {
      WebAuthnAbortService.cancelCeremony();
    };
  }, [passkeyLoginAction, navigate, redirect]);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    setIsSubmitting(true);
    try {
      const checkResp = await api.get(`/auth/passkey/check?email=${encodeURIComponent(email)}`);
      
      if (!checkResp.data.exists) {
        toast.error('Account not found. Please register an account first.');
        return;
      }
      
      if (checkResp.data.hasPasskey) {
        // Prompt passkey automatically
        handlePasskeyLogin();
      } else {
        setStep('password');
      }
    } catch (err: any) {
      toast.error('Failed to verify email. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const userData = await login(email, password);
      toast.success('Successfully logged in');
      if (userData.requiresPasswordChange) {
        navigate('/force-change-password');
      } else if (redirect) {
        navigate(`/${redirect}`);
      } else {
        navigate('/');
      }
    } catch (err: any) {
      if (err.response?.data?.message === 'ACCOUNT_DELETED_GRACE_PERIOD') {
        setIsRestoreModalOpen(true);
      } else {
        toast.error(err.response?.data?.message || 'Login failed. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRestore = async () => {
    setIsRestoring(true);
    try {
      await api.post('/auth/restore', { email, password });
      await login(email, password);
      toast.success('Account successfully restored!');
      setIsRestoreModalOpen(false);
      if (redirect) {
        navigate(`/${redirect}`);
      } else {
        navigate('/');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to restore account');
    } finally {
      setIsRestoring(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      const userData = await googleLogin(credentialResponse.credential);
      toast.success('Successfully logged in with Google');
      if (userData.requiresPasswordChange) {
        navigate('/force-change-password');
      } else if (redirect) {
        navigate(`/${redirect}`);
      } else {
        navigate('/');
      }
    } catch (err: any) {
      toast.error(err.message || 'Google Login failed');
    }
  };

  const handleFacebookLogin = () => {
    if (!(window as any).FB) {
      toast.error('Facebook SDK not loaded yet. Please try again.');
      return;
    }
    
    (window as any).FB.init({
      appId      : import.meta.env.VITE_FACEBOOK_APP_ID || '',
      cookie     : true,
      xfbml      : true,
      version    : 'v19.0'
    });
    
    (window as any).FB.login(async (response: any) => {
      if (response.status === 'connected') {
        const accessToken = response.authResponse.accessToken;
        try {
          const userData = await facebookLogin(accessToken);
          toast.success('Successfully logged in with Facebook');
          if (userData.requiresPasswordChange) {
            navigate('/force-change-password');
          } else if (redirect) {
            navigate(`/${redirect}`);
          } else {
            navigate('/');
          }
        } catch (err: any) {
          toast.error(err.message || 'Facebook login failed');
        }
      } else {
        toast.error('Facebook login cancelled or failed.');
      }
    }, { scope: 'public_profile,email' });
  };

  const handlePasskeyLogin = async () => {
    if (!email) {
      toast.error('Please enter your email first to use a passkey.');
      return;
    }
    try {
      const checkResp = await api.get(`/auth/passkey/check?email=${encodeURIComponent(email)}`);
      if (!checkResp.data.hasPasskey) {
        toast.error('No passkey registered for this email. Please log in with your password.');
        return;
      }
      
      const resp = await api.post('/auth/passkey/login/start');
      const options = resp.data;
      
      let asseResp;
      try {
        asseResp = await startAuthentication({ optionsJSON: options });
      } catch (error: any) {
        toast.error(error.message || 'Passkey authentication cancelled or failed.');
        return;
      }
      
      const verificationResp = await api.post('/auth/passkey/login/finish', asseResp);
      passkeyLoginAction(verificationResp.data);
      toast.success('Successfully logged in with Passkey');
      
      if (verificationResp.data.requiresPasswordChange) {
        navigate('/force-change-password');
      } else if (redirect) {
        navigate(`/${redirect}`);
      } else {
        navigate('/');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to start passkey login');
    }
  };

  return (
    <>
        <div className="text-center mb-8">
          <h2 className="font-sans text-3xl font-extrabold tracking-tight text-slate-900">
            Welcome <span className="text-[#F59E0B]">Back</span>
          </h2>
          <p className="text-slate-500 text-sm mt-2 font-medium">
            Access your secure portal and manage your orders
          </p>
        </div>

        

        <form onSubmit={step === 'email' ? handleEmailSubmit : handlePasswordSubmit} className="space-y-6">
          {step === 'email' ? (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              <label className="block text-slate-700 text-sm font-bold mb-2" htmlFor="email">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 h-5 w-5 text-slate-500" />
                <input
                  id="email"
                  type="email"
                  autoComplete="username webauthn"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-3.5 text-sm focus:outline-none focus:bg-white focus:border-[#F59E0B] focus:ring-2 focus:ring-[#F59E0B]/20 transition-all placeholder-slate-400 text-slate-900 font-medium"
                />
              </div>
            </div>
          ) : (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300 space-y-4">
              <div className="flex items-center gap-2 mb-4 bg-slate-50 p-3 rounded-lg border border-slate-200">
                <Mail className="h-4 w-4 text-slate-500" />
                <span className="text-sm text-slate-700 font-medium">{email}</span>
                <button type="button" onClick={() => setStep('email')} className="ml-auto text-xs text-[#F59E0B] font-bold hover:underline">Change</button>
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-slate-700 text-sm font-bold" htmlFor="password">
                    Password
                  </label>
                  <Link to="/forgot-password" className="text-xs text-[#F59E0B] hover:underline font-bold">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3.5 h-5 w-5 text-slate-500" />
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
                    className="absolute right-3.5 top-3.5 text-slate-500 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-[#F59E0B] text-white font-bold py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 hover:bg-amber-600 transition-colors disabled:opacity-50 cursor-pointer shadow-lg shadow-amber-500/30"
          >
            <span>{isSubmitting ? 'Please wait...' : step === 'email' ? 'Continue' : 'Secure Sign In'}</span>
            {!isSubmitting && <ArrowRight className="h-5 w-5" />}
          </button>
        </form>

        <div className="mt-8">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-3 bg-white text-slate-500 font-medium">Or continue with</span>
            </div>
          </div>

          <div className="mt-6 flex flex-col items-center gap-3">
            {isGoogleEnabled ? (
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => toast.error('Google Login Failed')}
                theme="filled_black"
                shape="rectangular"
                text="signin_with"
              />
            ) : (
              <button
                type="button"
                onClick={() => toast.error('Google Login is not configured in .env')}
                className="w-full max-w-[280px] bg-white text-slate-900 font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 hover:bg-slate-100 transition-colors shadow-sm text-sm border border-slate-200"
              >
                <img src="https://www.google.com/favicon.ico" className="w-5 h-5" alt="Google" />
                <span>Continue with Google</span>
              </button>
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
            
            <button
              onClick={handlePasskeyLogin}
              className="w-full max-w-[280px] bg-slate-50 text-slate-700 font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 hover:bg-slate-100 transition-colors shadow-sm text-sm border border-slate-200"
            >
              <Key className="h-5 w-5 text-slate-500" />
              <span>Continue with Passkey</span>
            </button>
          </div>
        </div>

        <div className="mt-8 text-center pt-6">
          <p className="text-slate-500 text-sm font-medium">
            Don't have an account?{' '}
            <Link to="/register" className="text-[#F59E0B] hover:text-amber-500 hover:underline font-bold transition-colors">
              Create secure account
            </Link>
          </p>
          <div className="mt-8 flex justify-center">
            <Link to="/" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors py-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Link>
          </div>
        </div>
      {isRestoreModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-xl shadow-xl max-w-md w-full p-6 text-slate-900">
            <div className="flex items-center gap-3 mb-4 text-[#F59E0B]">
              <AlertCircle className="h-6 w-6" />
              <h3 className="text-lg font-bold">Restore Account</h3>
            </div>
            <p className="text-sm text-slate-700 mb-6 leading-relaxed">
              Your account was recently scheduled for deletion but is still within the 7-day grace period. 
              Would you like to cancel the deletion and fully restore your account?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setIsRestoreModalOpen(false)}
                className="px-4 py-2 text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
              >
                No, Keep Deleted
              </button>
              <button
                onClick={handleRestore}
                disabled={isRestoring}
                className="bg-[#F59E0B] text-slate-950 px-5 py-2 rounded-lg text-sm font-bold hover:bg-amber-500 transition-colors cursor-pointer shadow-sm disabled:opacity-50"
              >
                {isRestoring ? 'Restoring...' : 'Yes, Restore Account'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
export default LoginPage;

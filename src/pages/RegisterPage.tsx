import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User as UserIcon, Mail, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { GoogleLogin } from '@react-oauth/google';

export const RegisterPage: React.FC = () => {
  const { register, googleLogin } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const role = 'USER';
  const [showPassword, setShowPassword] = useState(false);
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;
    if (!passwordRegex.test(password)) {
      toast.error('Password does not meet the security requirements.');
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

  return (
    <div className="flex-1 flex items-center justify-center px-4 py-16 bg-slate-900 text-white min-h-[80vh]">
      <Toaster position="top-center" />
      <div className="w-full max-w-md bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8 shadow-2xl">
        <div className="text-center mb-8">
          <h2 className="font-sans text-3xl font-bold tracking-tight">
            Create <span className="text-[#F59E0B]">Account</span>
          </h2>
          <p className="text-slate-400 text-sm mt-2">
            Sign up for secure checkout, tracking, and review features
          </p>
        </div>

        

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-slate-300 text-sm font-semibold mb-2" htmlFor="name">
              Full Name
            </label>
            <div className="relative">
              <UserIcon className="absolute left-3.5 top-3.5 h-5 w-5 text-slate-500" />
              <input
                id="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                className="w-full bg-slate-950/55 border border-slate-700 rounded-lg pl-11 pr-4 py-3 text-sm focus:outline-none focus:border-[#F59E0B] focus:ring-1 focus:ring-[#F59E0B] transition-all placeholder-slate-600 text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 text-sm font-semibold mb-2" htmlFor="email">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3.5 h-5 w-5 text-slate-500" />
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full bg-slate-950/55 border border-slate-700 rounded-lg pl-11 pr-4 py-3 text-sm focus:outline-none focus:border-[#F59E0B] focus:ring-1 focus:ring-[#F59E0B] transition-all placeholder-slate-600 text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 text-sm font-semibold mb-2" htmlFor="password">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3.5 h-5 w-5 text-slate-500" />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-950/55 border border-slate-700 rounded-lg pl-11 pr-12 py-3 text-sm focus:outline-none focus:border-[#F59E0B] focus:ring-1 focus:ring-[#F59E0B] transition-all placeholder-slate-600 text-white"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3.5 text-slate-500 hover:text-white"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            <p className="text-[10px] text-slate-400 mt-1.5 leading-relaxed">
              Must be at least 8 characters and include uppercase, lowercase, number, and special character.
            </p>
          </div>


          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-[#F59E0B] text-slate-950 font-bold py-3.5 px-4 rounded-lg flex items-center justify-center gap-2 hover:bg-amber-500 transition-colors disabled:opacity-50 cursor-pointer shadow-lg shadow-amber-950/20"
          >
            <span>{isSubmitting ? 'Creating Secure Account...' : 'Register Securely'}</span>
            {!isSubmitting && <ArrowRight className="h-5 w-5" />}
          </button>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-700/50"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-slate-800 text-slate-400">Or continue with</span>
            </div>
          </div>

          <div className="mt-6 flex justify-center">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => toast.error('Google Login Failed')}
              theme="filled_black"
              shape="rectangular"
              text="signup_with"
            />
          </div>
        </div>

        <div className="mt-8 text-center border-t border-slate-700/50 pt-6">
          <p className="text-slate-400 text-sm">
            Already have an account?{' '}
            <Link to="/login" className="text-[#F59E0B] hover:underline font-semibold">
              Sign in securely
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
export default RegisterPage;

import React from 'react';
import { useGoogleOneTapLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { useNavigate, useLocation } from 'react-router-dom';

export const GoogleOneTapPrompt: React.FC = () => {
  const { googleLogin, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useGoogleOneTapLogin({
    onSuccess: async (credentialResponse) => {
      if (credentialResponse.credential) {
        try {
          await googleLogin(credentialResponse.credential);
          toast.success('Successfully logged in with Google!');
          
          // If on login/register page, redirect to home or where they were going
          if (location.pathname === '/login' || location.pathname === '/register') {
             navigate('/');
          }
        } catch (error) {
          console.error('Google One Tap login failed', error);
          toast.error('Failed to login with Google.');
        }
      }
    },
    onError: () => {
      console.log('Google One Tap Login Failed or Closed');
    },
    // Only prompt if user is not authenticated and not loading
    disabled: isAuthenticated || isLoading,
    auto_select: false,
    cancel_on_tap_outside: true,
  });

  return null;
};

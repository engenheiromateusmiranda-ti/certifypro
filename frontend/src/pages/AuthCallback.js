import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';

const API_URL = process.env.REACT_APP_BACKEND_URL + '/api';

const AuthCallback = () => {
  const navigate = useNavigate();
  const hasProcessed = useRef(false);

  useEffect(() => {
    // Prevent double processing in StrictMode
    if (hasProcessed.current) return;
    hasProcessed.current = true;

    const processAuth = async () => {
      try {
        // Extract session_id from URL fragment
        const hash = window.location.hash;
        const params = new URLSearchParams(hash.substring(1));
        const sessionId = params.get('session_id');

        if (!sessionId) {
          toast.error('No session ID found');
          navigate('/login');
          return;
        }

        // Exchange session_id for user data
        const response = await axios.post(
          `${API_URL}/auth/google`,
          { session_id: sessionId },
          { withCredentials: true }
        );

        if (response.status === 200) {
          // Get user data
          const userResponse = await axios.get(`${API_URL}/auth/me/cookie`, {
            withCredentials: true
          });

          toast.success('Login successful!');
          
          // Navigate to dashboard with user data
          navigate('/dashboard', { 
            state: { user: userResponse.data },
            replace: true 
          });
        }
      } catch (error) {
        console.error('Auth callback error:', error);
        toast.error('Authentication failed');
        navigate('/login');
      }
    };

    processAuth();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F3F4F6]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0A58CA] mx-auto mb-4"></div>
        <p className="text-[#4B5563]">Completing sign in...</p>
      </div>
    </div>
  );
};

export default AuthCallback;

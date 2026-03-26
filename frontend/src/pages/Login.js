import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { toast } from 'sonner';
import { LogIn } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login(email, password);
      toast.success('Login successful!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="flex-1 flex items-center justify-center p-6 bg-white">
        <div className="w-full max-w-md space-y-8">
          <div>
            <h1 className="font-heading text-4xl font-bold tracking-tight text-[#111827]">
              ArkCertify
            </h1>
            <p className="mt-2 text-[#4B5563] leading-relaxed">
              Sign in to your account
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-[#111827] font-medium">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                data-testid="login-email-input"
                className="rounded-none focus:ring-2 focus:ring-[#0A58CA]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-[#111827] font-medium">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                data-testid="login-password-input"
                className="rounded-none focus:ring-2 focus:ring-[#0A58CA]"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              data-testid="login-submit-button"
              className="w-full bg-[#0A58CA] hover:bg-[#084298] text-white rounded-none transition-all duration-200"
            >
              <LogIn className="w-4 h-4 mr-2" />
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <p className="text-center text-[#4B5563]">
            Don't have an account?{' '}
            <Link
              to="/register"
              data-testid="register-link"
              className="text-[#0A58CA] hover:underline font-medium"
            >
              Register
            </Link>
          </p>
        </div>
      </div>

      <div className="hidden lg:flex flex-1 bg-[#0A58CA] items-center justify-center p-12">
        <div className="text-white space-y-6 max-w-lg">
          <h2 className="font-heading text-5xl font-bold tracking-tight">
            Professional Certificate Automation
          </h2>
          <p className="text-lg text-white/90 leading-relaxed">
            Generate, verify, and deliver certificates at scale. Trusted by organizations worldwide.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;

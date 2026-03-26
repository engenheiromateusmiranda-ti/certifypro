import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { toast } from 'sonner';
import { UserPlus } from 'lucide-react';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await register(name, email, password);
      toast.success('Account created successfully!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Registration failed');
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
              Create your account
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-[#111827] font-medium">
                Full Name
              </Label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                data-testid="register-name-input"
                className="rounded-none focus:ring-2 focus:ring-[#0A58CA]"
              />
            </div>

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
                data-testid="register-email-input"
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
                minLength={6}
                data-testid="register-password-input"
                className="rounded-none focus:ring-2 focus:ring-[#0A58CA]"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              data-testid="register-submit-button"
              className="w-full bg-[#0A58CA] hover:bg-[#084298] text-white rounded-none transition-all duration-200"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              {loading ? 'Creating Account...' : 'Create Account'}
            </Button>
          </form>

          <p className="text-center text-[#4B5563]">
            Already have an account?{' '}
            <Link
              to="/login"
              data-testid="login-link"
              className="text-[#0A58CA] hover:underline font-medium"
            >
              Sign In
            </Link>
          </p>
        </div>
      </div>

      <div className="hidden lg:flex flex-1 bg-[#0A58CA] items-center justify-center p-12">
        <div className="text-white space-y-6 max-w-lg">
          <h2 className="font-heading text-5xl font-bold tracking-tight">
            Start Issuing Certificates Today
          </h2>
          <div className="space-y-4 text-lg text-white/90 leading-relaxed">
            <p>✓ 10 free certificates per month</p>
            <p>✓ Custom templates</p>
            <p>✓ QR code verification</p>
            <p>✓ Email delivery</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;

import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import {
  LayoutDashboard,
  FileText,
  Award,
  Calendar,
  CreditCard,
  Settings,
  LogOut
} from 'lucide-react';

const DashboardLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/templates', icon: FileText, label: 'Templates' },
    { path: '/certificates', icon: Award, label: 'Certificates' },
    { path: '/events', icon: Calendar, label: 'Events' },
    { path: '/billing', icon: CreditCard, label: 'Billing' },
    { path: '/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <div className="flex h-screen bg-[#F3F4F6]">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-[#E5E7EB] flex flex-col">
        <div className="p-6 border-b border-[#E5E7EB]">
          <h1 className="font-heading text-2xl font-bold tracking-tight text-[#111827]">
            ArkCertify
          </h1>
          <p className="text-sm text-[#4B5563] mt-1">{user?.name}</p>
          <div className="mt-2">
            <span className="inline-block px-2 py-1 text-xs font-mono bg-[#0A58CA] text-white rounded-sm">
              {user?.plan}
            </span>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1" data-testid="dashboard-nav">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                data-testid={`nav-${item.label.toLowerCase()}`}
                className={
                  `flex items-center px-4 py-3 rounded-sm transition-all duration-200 ${
                    isActive
                      ? 'bg-[#0A58CA] text-white'
                      : 'text-[#4B5563] hover:bg-[#F3F4F6]'
                  }`
                }
              >
                <Icon className="w-5 h-5 mr-3" strokeWidth={1.5} />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-[#E5E7EB]">
          <Button
            onClick={handleLogout}
            data-testid="logout-button"
            variant="outline"
            className="w-full justify-start rounded-none border-[#E5E7EB] hover:bg-[#F3F4F6]"
          >
            <LogOut className="w-5 h-5 mr-3" strokeWidth={1.5} />
            Logout
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="sticky top-0 z-50 bg-white/70 backdrop-blur-xl border-b border-[#E5E7EB] px-6 py-4">
          <h2 className="font-heading text-2xl font-bold tracking-tight text-[#111827]">
            {menuItems.find(item => item.path === location.pathname)?.label || 'Dashboard'}
          </h2>
        </div>
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;

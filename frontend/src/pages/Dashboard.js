import React, { useEffect, useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { apiClient } from '../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Award, FileText, Calendar, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

const Dashboard = () => {
  const [stats, setStats] = useState({
    total_certificates: 0,
    total_templates: 0,
    total_events: 0,
    month_certificates: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await apiClient.get('/dashboard/stats');
      setStats(response.data);
    } catch (error) {
      toast.error('Failed to fetch statistics');
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Certificates',
      value: stats.total_certificates,
      icon: Award,
      color: '#0A58CA'
    },
    {
      title: 'Templates',
      value: stats.total_templates,
      icon: FileText,
      color: '#198754'
    },
    {
      title: 'Events',
      value: stats.total_events,
      icon: Calendar,
      color: '#FFC107'
    },
    {
      title: 'This Month',
      value: stats.month_certificates,
      icon: TrendingUp,
      color: '#0DCAF0'
    }
  ];

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-[#9CA3AF]">Loading...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8" data-testid="dashboard-content">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card
                key={index}
                data-testid={`stat-card-${index}`}
                className="border border-[#E5E7EB] rounded-sm shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-1"
              >
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-[#4B5563]">
                    {stat.title}
                  </CardTitle>
                  <div
                    className="p-2 rounded-sm"
                    style={{ backgroundColor: `${stat.color}15` }}
                  >
                    <Icon
                      className="w-5 h-5"
                      style={{ color: stat.color }}
                      strokeWidth={1.5}
                    />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold font-heading tracking-tight text-[#111827]">
                    {stat.value}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Quick Actions */}
        <Card className="border border-[#E5E7EB] rounded-sm">
          <CardHeader>
            <CardTitle className="font-heading text-xl font-bold tracking-tight text-[#111827]">
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                data-testid="quick-action-template"
                onClick={() => window.location.href = '/templates/new'}
                className="p-6 border-2 border-[#E5E7EB] rounded-sm hover:border-[#0A58CA] hover:bg-[#0A58CA]/5 transition-all duration-200"
              >
                <FileText className="w-8 h-8 mb-3 text-[#0A58CA]" strokeWidth={1.5} />
                <h3 className="font-heading font-bold text-[#111827] mb-1">Create Template</h3>
                <p className="text-sm text-[#4B5563]">Design a new certificate template</p>
              </button>

              <button
                data-testid="quick-action-certificate"
                onClick={() => window.location.href = '/certificates/new'}
                className="p-6 border-2 border-[#E5E7EB] rounded-sm hover:border-[#0A58CA] hover:bg-[#0A58CA]/5 transition-all duration-200"
              >
                <Award className="w-8 h-8 mb-3 text-[#0A58CA]" strokeWidth={1.5} />
                <h3 className="font-heading font-bold text-[#111827] mb-1">Generate Certificate</h3>
                <p className="text-sm text-[#4B5563]">Create a single certificate</p>
              </button>

              <button
                data-testid="quick-action-event"
                onClick={() => window.location.href = '/events/new'}
                className="p-6 border-2 border-[#E5E7EB] rounded-sm hover:border-[#0A58CA] hover:bg-[#0A58CA]/5 transition-all duration-200"
              >
                <Calendar className="w-8 h-8 mb-3 text-[#0A58CA]" strokeWidth={1.5} />
                <h3 className="font-heading font-bold text-[#111827] mb-1">Create Event</h3>
                <p className="text-sm text-[#4B5563]">Setup a new event</p>
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="border border-[#E5E7EB] rounded-sm">
          <CardHeader>
            <CardTitle className="font-heading text-xl font-bold tracking-tight text-[#111827]">
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-[#4B5563]">No recent activity to display.</p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;

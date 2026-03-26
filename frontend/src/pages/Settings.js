import React from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Settings as SettingsIcon } from 'lucide-react';

const Settings = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <Card className="border border-[#E5E7EB] rounded-sm">
          <CardHeader>
            <CardTitle className="font-heading text-2xl font-bold tracking-tight text-[#111827]">
              <SettingsIcon className="inline w-6 h-6 mr-2" />
              Account Settings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-[#4B5563]">
              Settings page coming soon. Configure your account preferences, API keys, and integrations.
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Settings;

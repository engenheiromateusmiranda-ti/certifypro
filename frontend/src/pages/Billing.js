import React from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { CheckCircle, CreditCard } from 'lucide-react';

const Billing = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <Card className="border border-[#E5E7EB] rounded-sm">
          <CardHeader>
            <CardTitle className="font-heading text-2xl font-bold tracking-tight text-[#111827]">
              Current Plan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-heading text-3xl font-bold text-[#111827] mb-2">Free Plan</h3>
                <p className="text-[#4B5563]">10 certificates per month</p>
              </div>
              <Button
                data-testid="upgrade-button"
                className="bg-[#0A58CA] hover:bg-[#084298] text-white rounded-none"
              >
                <CreditCard className="w-4 h-4 mr-2" />
                Upgrade to Pro
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border border-[#E5E7EB] rounded-sm">
            <CardContent className="p-6">
              <h4 className="font-heading text-xl font-bold text-[#111827] mb-2">Free</h4>
              <p className="text-3xl font-bold text-[#111827] mb-4">$0<span className="text-lg text-[#4B5563]">/mo</span></p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-[#198754] mr-2 mt-0.5" strokeWidth={1.5} />
                  <span className="text-sm text-[#4B5563]">10 certificates/month</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-[#198754] mr-2 mt-0.5" strokeWidth={1.5} />
                  <span className="text-sm text-[#4B5563]">Basic templates</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-[#198754] mr-2 mt-0.5" strokeWidth={1.5} />
                  <span className="text-sm text-[#4B5563]">QR verification</span>
                </li>
              </ul>
              <Button disabled variant="outline" className="w-full rounded-none">
                Current Plan
              </Button>
            </CardContent>
          </Card>

          <Card className="border-2 border-[#0A58CA] rounded-sm">
            <CardContent className="p-6">
              <div className="text-center mb-2">
                <span className="inline-block bg-[#0A58CA] text-white px-3 py-1 rounded-sm text-xs font-medium">
                  Recommended
                </span>
              </div>
              <h4 className="font-heading text-xl font-bold text-[#111827] mb-2">Pro</h4>
              <p className="text-3xl font-bold text-[#111827] mb-4">$19<span className="text-lg text-[#4B5563]">/mo</span></p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-[#198754] mr-2 mt-0.5" strokeWidth={1.5} />
                  <span className="text-sm text-[#4B5563]">Unlimited certificates</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-[#198754] mr-2 mt-0.5" strokeWidth={1.5} />
                  <span className="text-sm text-[#4B5563]">Custom templates</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-[#198754] mr-2 mt-0.5" strokeWidth={1.5} />
                  <span className="text-sm text-[#4B5563]">Email delivery</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-[#198754] mr-2 mt-0.5" strokeWidth={1.5} />
                  <span className="text-sm text-[#4B5563]">Bulk generation</span>
                </li>
              </ul>
              <Button
                data-testid="upgrade-to-pro-button"
                className="w-full bg-[#0A58CA] hover:bg-[#084298] text-white rounded-none"
              >
                Upgrade Now
              </Button>
            </CardContent>
          </Card>

          <Card className="border border-[#E5E7EB] rounded-sm">
            <CardContent className="p-6">
              <h4 className="font-heading text-xl font-bold text-[#111827] mb-2">Enterprise</h4>
              <p className="text-3xl font-bold text-[#111827] mb-4">$99<span className="text-lg text-[#4B5563]">/mo</span></p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-[#198754] mr-2 mt-0.5" strokeWidth={1.5} />
                  <span className="text-sm text-[#4B5563]">Everything in Pro</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-[#198754] mr-2 mt-0.5" strokeWidth={1.5} />
                  <span className="text-sm text-[#4B5563]">API access</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-[#198754] mr-2 mt-0.5" strokeWidth={1.5} />
                  <span className="text-sm text-[#4B5563]">Team accounts</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-[#198754] mr-2 mt-0.5" strokeWidth={1.5} />
                  <span className="text-sm text-[#4B5563]">Priority support</span>
                </li>
              </ul>
              <Button
                data-testid="contact-sales-button"
                variant="outline"
                className="w-full rounded-none border-[#E5E7EB]"
              >
                Contact Sales
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card className="border border-[#E5E7EB] rounded-sm">
          <CardHeader>
            <CardTitle className="font-heading text-xl font-bold tracking-tight text-[#111827]">
              PayPal Subscription Integration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-[#4B5563] mb-4">
              Payment processing via PayPal. Subscriptions support Visa, Mastercard, and PayPal balance.
            </p>
            <p className="text-sm text-[#9CA3AF]">
              Note: PayPal integration will be activated when you upgrade to a paid plan.
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Billing;

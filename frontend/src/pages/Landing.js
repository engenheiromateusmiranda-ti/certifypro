import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Award, FileText, Mail, CheckCircle, ArrowRight } from 'lucide-react';

const Landing = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/70 backdrop-blur-xl border-b border-[#E5E7EB] px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="font-heading text-2xl font-bold tracking-tight text-[#111827]">
            ArkCertify
          </h1>
          <div className="flex gap-4">
            <Link to="/login">
              <Button
                data-testid="header-login-button"
                variant="outline"
                className="rounded-none border-[#E5E7EB]"
              >
                Sign In
              </Button>
            </Link>
            <Link to="/register">
              <Button
                data-testid="header-register-button"
                className="bg-[#0A58CA] hover:bg-[#084298] text-white rounded-none"
              >
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="px-6 py-24 lg:py-32">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-3xl">
            <h2 className="font-heading text-6xl lg:text-7xl font-bold tracking-tight text-[#111827] mb-6">
              Professional Certificate Automation
            </h2>
            <p className="text-xl text-[#4B5563] leading-relaxed mb-8">
              Generate, verify, and deliver certificates at scale. 
              Trusted by organizations worldwide to automate their certification process.
            </p>
            <div className="flex gap-4">
              <Link to="/register">
                <Button
                  data-testid="hero-get-started-button"
                  className="bg-[#0A58CA] hover:bg-[#084298] text-white rounded-none px-8 py-6 text-lg"
                >
                  Start Free
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-6 py-24 bg-[#FAFAFA]">
        <div className="max-w-7xl mx-auto">
          <h3 className="font-heading text-4xl font-bold tracking-tight text-[#111827] mb-12">
            Everything you need
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white border border-[#E5E7EB] p-8 rounded-sm">
              <div className="w-12 h-12 bg-[#0A58CA]/10 rounded-sm flex items-center justify-center mb-4">
                <FileText className="w-6 h-6 text-[#0A58CA]" strokeWidth={1.5} />
              </div>
              <h4 className="font-heading text-xl font-bold text-[#111827] mb-2">
                Custom Templates
              </h4>
              <p className="text-[#4B5563] leading-relaxed">
                Design beautiful certificates with drag-and-drop editor. Front and back page support.
              </p>
            </div>

            <div className="bg-white border border-[#E5E7EB] p-8 rounded-sm">
              <div className="w-12 h-12 bg-[#0A58CA]/10 rounded-sm flex items-center justify-center mb-4">
                <Award className="w-6 h-6 text-[#0A58CA]" strokeWidth={1.5} />
              </div>
              <h4 className="font-heading text-xl font-bold text-[#111827] mb-2">
                Bulk Generation
              </h4>
              <p className="text-[#4B5563] leading-relaxed">
                Generate hundreds of certificates at once via CSV upload. Automated processing.
              </p>
            </div>

            <div className="bg-white border border-[#E5E7EB] p-8 rounded-sm">
              <div className="w-12 h-12 bg-[#0A58CA]/10 rounded-sm flex items-center justify-center mb-4">
                <CheckCircle className="w-6 h-6 text-[#0A58CA]" strokeWidth={1.5} />
              </div>
              <h4 className="font-heading text-xl font-bold text-[#111827] mb-2">
                QR Verification
              </h4>
              <p className="text-[#4B5563] leading-relaxed">
                Every certificate includes QR code for instant verification. Public validation page.
              </p>
            </div>

            <div className="bg-white border border-[#E5E7EB] p-8 rounded-sm">
              <div className="w-12 h-12 bg-[#0A58CA]/10 rounded-sm flex items-center justify-center mb-4">
                <Mail className="w-6 h-6 text-[#0A58CA]" strokeWidth={1.5} />
              </div>
              <h4 className="font-heading text-xl font-bold text-[#111827] mb-2">
                Email Delivery
              </h4>
              <p className="text-[#4B5563] leading-relaxed">
                Automatically send certificates via email. Professional templates included.
              </p>
            </div>

            <div className="bg-white border border-[#E5E7EB] p-8 rounded-sm">
              <div className="w-12 h-12 bg-[#0A58CA]/10 rounded-sm flex items-center justify-center mb-4">
                <Award className="w-6 h-6 text-[#0A58CA]" strokeWidth={1.5} />
              </div>
              <h4 className="font-heading text-xl font-bold text-[#111827] mb-2">
                Event Management
              </h4>
              <p className="text-[#4B5563] leading-relaxed">
                Organize courses and events. Track participants and certificate issuance.
              </p>
            </div>

            <div className="bg-white border border-[#E5E7EB] p-8 rounded-sm">
              <div className="w-12 h-12 bg-[#0A58CA]/10 rounded-sm flex items-center justify-center mb-4">
                <FileText className="w-6 h-6 text-[#0A58CA]" strokeWidth={1.5} />
              </div>
              <h4 className="font-heading text-xl font-bold text-[#111827] mb-2">
                Analytics Dashboard
              </h4>
              <p className="text-[#4B5563] leading-relaxed">
                Track certificate generation, verification rates, and usage statistics.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="px-6 py-24">
        <div className="max-w-7xl mx-auto">
          <h3 className="font-heading text-4xl font-bold tracking-tight text-[#111827] mb-12 text-center">
            Simple, transparent pricing
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="border-2 border-[#E5E7EB] p-8 rounded-sm">
              <h4 className="font-heading text-2xl font-bold text-[#111827] mb-2">Free</h4>
              <p className="text-4xl font-bold text-[#111827] mb-4">$0<span className="text-lg text-[#4B5563]">/mo</span></p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-[#198754] mr-2 mt-0.5" strokeWidth={1.5} />
                  <span className="text-[#4B5563]">10 certificates/month</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-[#198754] mr-2 mt-0.5" strokeWidth={1.5} />
                  <span className="text-[#4B5563]">Basic templates</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-[#198754] mr-2 mt-0.5" strokeWidth={1.5} />
                  <span className="text-[#4B5563]">QR verification</span>
                </li>
              </ul>
              <Link to="/register">
                <Button variant="outline" className="w-full rounded-none border-[#E5E7EB]">
                  Get Started
                </Button>
              </Link>
            </div>

            <div className="border-2 border-[#0A58CA] p-8 rounded-sm relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-[#0A58CA] text-white px-4 py-1 rounded-sm text-sm font-medium">
                Popular
              </div>
              <h4 className="font-heading text-2xl font-bold text-[#111827] mb-2">Pro</h4>
              <p className="text-4xl font-bold text-[#111827] mb-4">$19<span className="text-lg text-[#4B5563]">/mo</span></p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-[#198754] mr-2 mt-0.5" strokeWidth={1.5} />
                  <span className="text-[#4B5563]">Unlimited certificates</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-[#198754] mr-2 mt-0.5" strokeWidth={1.5} />
                  <span className="text-[#4B5563]">Custom templates</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-[#198754] mr-2 mt-0.5" strokeWidth={1.5} />
                  <span className="text-[#4B5563]">Email delivery</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-[#198754] mr-2 mt-0.5" strokeWidth={1.5} />
                  <span className="text-[#4B5563]">Bulk generation</span>
                </li>
              </ul>
              <Link to="/register">
                <Button className="w-full bg-[#0A58CA] hover:bg-[#084298] text-white rounded-none">
                  Get Started
                </Button>
              </Link>
            </div>

            <div className="border-2 border-[#E5E7EB] p-8 rounded-sm">
              <h4 className="font-heading text-2xl font-bold text-[#111827] mb-2">Enterprise</h4>
              <p className="text-4xl font-bold text-[#111827] mb-4">$99<span className="text-lg text-[#4B5563]">/mo</span></p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-[#198754] mr-2 mt-0.5" strokeWidth={1.5} />
                  <span className="text-[#4B5563]">Everything in Pro</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-[#198754] mr-2 mt-0.5" strokeWidth={1.5} />
                  <span className="text-[#4B5563]">API access</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-[#198754] mr-2 mt-0.5" strokeWidth={1.5} />
                  <span className="text-[#4B5563]">Team accounts</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-[#198754] mr-2 mt-0.5" strokeWidth={1.5} />
                  <span className="text-[#4B5563]">Priority support</span>
                </li>
              </ul>
              <Link to="/register">
                <Button variant="outline" className="w-full rounded-none border-[#E5E7EB]">
                  Contact Sales
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-24 bg-[#0A58CA]">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="font-heading text-5xl font-bold tracking-tight text-white mb-6">
            Ready to get started?
          </h3>
          <p className="text-xl text-white/90 mb-8">
            Join hundreds of organizations automating their certificate process.
          </p>
          <Link to="/register">
            <Button
              data-testid="cta-button"
              className="bg-white text-[#0A58CA] hover:bg-gray-100 rounded-none px-8 py-6 text-lg"
            >
              Start Free Trial
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-12 border-t border-[#E5E7EB]">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-[#9CA3AF]">
            © 2024 ArkCertify. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;

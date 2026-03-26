import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Card, CardContent } from '../components/ui/card';
import { CheckCircle, XCircle } from 'lucide-react';
import QRCode from 'react-qr-code';

const API_URL = process.env.REACT_APP_BACKEND_URL + '/api';

const Verification = () => {
  const { code } = useParams();
  const [certificate, setCertificate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCertificate();
  }, [code]);

  const fetchCertificate = async () => {
    try {
      const response = await axios.get(`${API_URL}/verify/${code}`);
      setCertificate(response.data);
    } catch (error) {
      setError('Certificate not found');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F3F4F6]">
        <p className="text-[#9CA3AF]">Verifying certificate...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F3F4F6] p-6">
        <Card className="max-w-md w-full border border-[#E5E7EB] rounded-sm">
          <CardContent className="p-12 text-center">
            <XCircle className="w-16 h-16 mx-auto mb-4 text-[#DC3545]" />
            <h2 className="font-heading text-2xl font-bold text-[#111827] mb-2">
              Certificate Not Found
            </h2>
            <p className="text-[#4B5563]">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F3F4F6] p-6">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="font-heading text-4xl font-bold tracking-tight text-[#111827] mb-2">
            ArkCertify
          </h1>
          <p className="text-[#4B5563]">Certificate Verification</p>
        </div>

        <Card className="border border-[#E5E7EB] rounded-sm" data-testid="verification-card">
          <CardContent className="p-8">
            <div className="flex items-center justify-center mb-6">
              <CheckCircle className="w-12 h-12 text-[#198754]" />
            </div>

            <div className="text-center mb-8">
              <h2 className="font-heading text-3xl font-bold text-[#111827] mb-2">
                Valid Certificate
              </h2>
              <p className="text-[#4B5563]">
                This certificate has been verified and is authentic.
              </p>
            </div>

            <div className="space-y-4 border-t border-[#E5E7EB] pt-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-[#9CA3AF] mb-1">Recipient</p>
                  <p className="font-heading font-bold text-[#111827]" data-testid="participant-name">
                    {certificate.participant_name}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-[#9CA3AF] mb-1">Course</p>
                  <p className="font-heading font-bold text-[#111827]" data-testid="course-name">
                    {certificate.course}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-[#9CA3AF] mb-1">Institution</p>
                  <p className="font-medium text-[#4B5563]">{certificate.institution}</p>
                </div>
                <div>
                  <p className="text-sm text-[#9CA3AF] mb-1">Issue Date</p>
                  <p className="font-medium text-[#4B5563]">
                    {new Date(certificate.issue_date).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {certificate.hours && (
                <div>
                  <p className="text-sm text-[#9CA3AF] mb-1">Duration</p>
                  <p className="font-medium text-[#4B5563]">{certificate.hours} hours</p>
                </div>
              )}

              {certificate.description && (
                <div>
                  <p className="text-sm text-[#9CA3AF] mb-1">Description</p>
                  <p className="text-[#4B5563] leading-relaxed">{certificate.description}</p>
                </div>
              )}

              <div className="border-t border-[#E5E7EB] pt-4">
                <p className="text-xs text-[#9CA3AF] mb-2">Certificate ID</p>
                <p className="font-mono text-sm text-[#4B5563] break-all" data-testid="certificate-code">
                  {certificate.certificate_code}
                </p>
              </div>
            </div>

            <div className="flex justify-center mt-8 pt-6 border-t border-[#E5E7EB]">
              <div className="bg-white p-4 rounded-sm">
                <QRCode
                  value={window.location.href}
                  size={128}
                  data-testid="qr-code"
                />
              </div>
            </div>

            <div className="mt-6 text-center">
              <p className="text-sm text-[#9CA3AF]">
                Powered by <span className="font-heading font-bold text-[#0A58CA]">ArkCertify</span>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Verification;

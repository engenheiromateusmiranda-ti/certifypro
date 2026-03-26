import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import { apiClient } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Plus, Download, Eye, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

const Certificates = () => {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCertificates();
  }, []);

  const fetchCertificates = async () => {
    try {
      const response = await apiClient.get('/certificates');
      setCertificates(response.data);
    } catch (error) {
      toast.error('Failed to fetch certificates');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this certificate?')) return;

    try {
      await apiClient.delete(`/certificates/${id}`);
      toast.success('Certificate deleted');
      fetchCertificates();
    } catch (error) {
      toast.error('Failed to delete certificate');
    }
  };

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
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <p className="text-[#4B5563]">
            View and manage all issued certificates
          </p>
          <Link to="/certificates/new">
            <Button
              data-testid="generate-certificate-button"
              className="bg-[#0A58CA] hover:bg-[#084298] text-white rounded-none"
            >
              <Plus className="w-4 h-4 mr-2" />
              Generate Certificate
            </Button>
          </Link>
        </div>

        {certificates.length === 0 ? (
          <Card className="border border-[#E5E7EB] rounded-sm p-12 text-center">
            <p className="text-[#9CA3AF] mb-4">No certificates generated yet</p>
            <Link to="/certificates/new">
              <Button
                data-testid="generate-first-certificate"
                className="bg-[#0A58CA] hover:bg-[#084298] text-white rounded-none"
              >
                Generate Your First Certificate
              </Button>
            </Link>
          </Card>
        ) : (
          <div className="space-y-4">
            {certificates.map((cert) => (
              <Card
                key={cert.id}
                data-testid={`certificate-card-${cert.id}`}
                className="border border-[#E5E7EB] rounded-sm hover:shadow-md transition-all duration-200"
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-heading text-lg font-bold text-[#111827] mb-1">
                        {cert.participant_name}
                      </h3>
                      <p className="text-[#4B5563] mb-1">{cert.course}</p>
                      <p className="text-sm text-[#9CA3AF]">
                        Issued: {new Date(cert.issue_date).toLocaleDateString()}
                      </p>
                      <p className="text-xs font-mono text-[#9CA3AF] mt-2">
                        ID: {cert.certificate_code}
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <a
                        href={`/verify/${cert.certificate_code}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button
                          data-testid={`view-certificate-${cert.id}`}
                          variant="outline"
                          className="rounded-none border-[#E5E7EB]"
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View
                        </Button>
                      </a>
                      <Button
                        data-testid={`delete-certificate-${cert.id}`}
                        variant="outline"
                        onClick={() => handleDelete(cert.id)}
                        className="rounded-none border-[#DC3545] text-[#DC3545] hover:bg-[#DC3545] hover:text-white"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Certificates;

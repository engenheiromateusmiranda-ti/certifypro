import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import { apiClient } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

const Templates = () => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const response = await apiClient.get('/templates');
      setTemplates(response.data);
    } catch (error) {
      toast.error('Failed to fetch templates');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this template?')) return;

    try {
      await apiClient.delete(`/templates/${id}`);
      toast.success('Template deleted');
      fetchTemplates();
    } catch (error) {
      toast.error('Failed to delete template');
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
            Manage your certificate templates
          </p>
          <Link to="/templates/new">
            <Button
              data-testid="create-template-button"
              className="bg-[#0A58CA] hover:bg-[#084298] text-white rounded-none"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Template
            </Button>
          </Link>
        </div>

        {templates.length === 0 ? (
          <Card className="border border-[#E5E7EB] rounded-sm p-12 text-center">
            <p className="text-[#9CA3AF] mb-4">No templates yet</p>
            <Link to="/templates/new">
              <Button
                data-testid="create-first-template"
                className="bg-[#0A58CA] hover:bg-[#084298] text-white rounded-none"
              >
                Create Your First Template
              </Button>
            </Link>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((template) => (
              <Card
                key={template.id}
                data-testid={`template-card-${template.id}`}
                className="border border-[#E5E7EB] rounded-sm hover:shadow-md transition-all duration-200 hover:-translate-y-1"
              >
                <CardContent className="p-6">
                  <div className="aspect-[4/3] bg-[#F3F4F6] rounded-sm mb-4 flex items-center justify-center">
                    {template.background_front ? (
                      <img
                        src={`${process.env.REACT_APP_BACKEND_URL}/api/files/${template.background_front.split('/').pop()}`}
                        alt={template.name}
                        className="w-full h-full object-cover rounded-sm"
                      />
                    ) : (
                      <span className="text-[#9CA3AF]">No Preview</span>
                    )}
                  </div>

                  <h3 className="font-heading text-lg font-bold text-[#111827] mb-4">
                    {template.name}
                  </h3>

                  <div className="flex gap-2">
                    <Link to={`/templates/${template.id}/edit`} className="flex-1">
                      <Button
                        data-testid={`edit-template-${template.id}`}
                        variant="outline"
                        className="w-full rounded-none border-[#E5E7EB]"
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                    </Link>
                    <Button
                      data-testid={`delete-template-${template.id}`}
                      variant="outline"
                      onClick={() => handleDelete(template.id)}
                      className="rounded-none border-[#DC3545] text-[#DC3545] hover:bg-[#DC3545] hover:text-white"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
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

export default Templates;

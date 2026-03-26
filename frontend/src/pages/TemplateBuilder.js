import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import { apiClient } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { toast } from 'sonner';
import { Upload, Save } from 'lucide-react';

const TemplateBuilder = () => {
  const [name, setName] = useState('');
  const [logoFile, setLogoFile] = useState(null);
  const [frontBgFile, setFrontBgFile] = useState(null);
  const [backBgFile, setBackBgFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  const handleFileUpload = async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await apiClient.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data.path;
    } catch (error) {
      toast.error('File upload failed');
      throw error;
    }
  };

  const handleSave = async () => {
    if (!name) {
      toast.error('Please enter a template name');
      return;
    }

    setSaving(true);
    setUploading(true);

    try {
      let logoUrl = null;
      let frontBgUrl = null;
      let backBgUrl = null;

      if (logoFile) {
        logoUrl = await handleFileUpload(logoFile);
      }

      if (frontBgFile) {
        frontBgUrl = await handleFileUpload(frontBgFile);
      }

      if (backBgFile) {
        backBgUrl = await handleFileUpload(backBgFile);
      }

      const templateData = {
        name,
        logo_url: logoUrl,
        background_front: frontBgUrl,
        background_back: backBgUrl,
        elements: {}
      };

      await apiClient.post('/templates', templateData);
      toast.success('Template created successfully!');
      navigate('/templates');
    } catch (error) {
      toast.error('Failed to create template');
    } finally {
      setSaving(false);
      setUploading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl">
        <Card className="border border-[#E5E7EB] rounded-sm">
          <CardHeader>
            <CardTitle className="font-heading text-2xl font-bold tracking-tight text-[#111827]">
              Create Template
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="template-name" className="text-[#111827] font-medium">
                Template Name
              </Label>
              <Input
                id="template-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Course Completion Certificate"
                data-testid="template-name-input"
                className="rounded-none focus:ring-2 focus:ring-[#0A58CA]"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-[#111827] font-medium">Logo</Label>
              <div className="border-2 border-dashed border-[#E5E7EB] rounded-sm p-8 text-center">
                <Upload className="w-8 h-8 mx-auto mb-2 text-[#9CA3AF]" />
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setLogoFile(e.target.files[0])}
                  data-testid="logo-upload"
                  className="mt-2"
                />
                {logoFile && (
                  <p className="mt-2 text-sm text-[#4B5563]">{logoFile.name}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-[#111827] font-medium">Front Background</Label>
              <div className="border-2 border-dashed border-[#E5E7EB] rounded-sm p-8 text-center">
                <Upload className="w-8 h-8 mx-auto mb-2 text-[#9CA3AF]" />
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setFrontBgFile(e.target.files[0])}
                  data-testid="front-bg-upload"
                  className="mt-2"
                />
                {frontBgFile && (
                  <p className="mt-2 text-sm text-[#4B5563]">{frontBgFile.name}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-[#111827] font-medium">Back Background</Label>
              <div className="border-2 border-dashed border-[#E5E7EB] rounded-sm p-8 text-center">
                <Upload className="w-8 h-8 mx-auto mb-2 text-[#9CA3AF]" />
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setBackBgFile(e.target.files[0])}
                  data-testid="back-bg-upload"
                  className="mt-2"
                />
                {backBgFile && (
                  <p className="mt-2 text-sm text-[#4B5563]">{backBgFile.name}</p>
                )}
              </div>
            </div>

            <div className="flex gap-4">
              <Button
                onClick={handleSave}
                disabled={saving || uploading}
                data-testid="save-template-button"
                className="bg-[#0A58CA] hover:bg-[#084298] text-white rounded-none"
              >
                <Save className="w-4 h-4 mr-2" />
                {saving ? 'Saving...' : 'Save Template'}
              </Button>
              <Button
                onClick={() => navigate('/templates')}
                variant="outline"
                data-testid="cancel-template-button"
                className="rounded-none border-[#E5E7EB]"
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default TemplateBuilder;

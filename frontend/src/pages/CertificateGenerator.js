import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import { apiClient } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Switch } from '../components/ui/switch';
import { toast } from 'sonner';
import { Award, Upload } from 'lucide-react';

const CertificateGenerator = () => {
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [participantName, setParticipantName] = useState('');
  const [participantEmail, setParticipantEmail] = useState('');
  const [course, setCourse] = useState('');
  const [institution, setInstitution] = useState('ArkCertify');
  const [hours, setHours] = useState('');
  const [description, setDescription] = useState('');
  const [sendEmail, setSendEmail] = useState(false);
  const [csvFile, setCsvFile] = useState(null);
  const [generating, setGenerating] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const response = await apiClient.get('/templates');
      setTemplates(response.data);
    } catch (error) {
      toast.error('Failed to fetch templates');
    }
  };

  const handleSingleGenerate = async () => {
    if (!selectedTemplate || !participantName || !course) {
      toast.error('Please fill in all required fields');
      return;
    }

    setGenerating(true);

    try {
      const response = await apiClient.post('/certificates/generate', {
        template_id: selectedTemplate,
        participant_name: participantName,
        participant_email: participantEmail,
        course,
        institution,
        hours,
        description,
        send_email: sendEmail
      });

      toast.success('Certificate generated successfully!');
      navigate('/certificates');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to generate certificate');
    } finally {
      setGenerating(false);
    }
  };

  const handleBulkGenerate = async () => {
    if (!selectedTemplate || !csvFile) {
      toast.error('Please select a template and upload a CSV file');
      return;
    }

    setGenerating(true);

    try {
      const formData = new FormData();
      formData.append('file', csvFile);

      await apiClient.post(
        `/certificates/bulk?template_id=${selectedTemplate}&send_email=${sendEmail}`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );

      toast.success('Certificates generated successfully!');
      navigate('/certificates');
    } catch (error) {
      toast.error('Failed to generate certificates');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl">
        <Card className="border border-[#E5E7EB] rounded-sm">
          <CardHeader>
            <CardTitle className="font-heading text-2xl font-bold tracking-tight text-[#111827]">
              <Award className="inline w-6 h-6 mr-2" />
              Generate Certificates
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="single" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="single" data-testid="single-tab">Single Certificate</TabsTrigger>
                <TabsTrigger value="bulk" data-testid="bulk-tab">Bulk Generation</TabsTrigger>
              </TabsList>

              <TabsContent value="single" className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="template" className="text-[#111827] font-medium">
                    Template *
                  </Label>
                  <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                    <SelectTrigger data-testid="template-select" className="rounded-none">
                      <SelectValue placeholder="Select a template" />
                    </SelectTrigger>
                    <SelectContent>
                      {templates.map((template) => (
                        <SelectItem key={template.id} value={template.id}>
                          {template.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="participant-name" className="text-[#111827] font-medium">
                    Participant Name *
                  </Label>
                  <Input
                    id="participant-name"
                    value={participantName}
                    onChange={(e) => setParticipantName(e.target.value)}
                    placeholder="John Doe"
                    data-testid="participant-name-input"
                    className="rounded-none focus:ring-2 focus:ring-[#0A58CA]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="participant-email" className="text-[#111827] font-medium">
                    Email (optional)
                  </Label>
                  <Input
                    id="participant-email"
                    type="email"
                    value={participantEmail}
                    onChange={(e) => setParticipantEmail(e.target.value)}
                    placeholder="john@example.com"
                    data-testid="participant-email-input"
                    className="rounded-none focus:ring-2 focus:ring-[#0A58CA]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="course" className="text-[#111827] font-medium">
                    Course Name *
                  </Label>
                  <Input
                    id="course"
                    value={course}
                    onChange={(e) => setCourse(e.target.value)}
                    placeholder="Web Development Fundamentals"
                    data-testid="course-input"
                    className="rounded-none focus:ring-2 focus:ring-[#0A58CA]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="institution" className="text-[#111827] font-medium">
                    Institution
                  </Label>
                  <Input
                    id="institution"
                    value={institution}
                    onChange={(e) => setInstitution(e.target.value)}
                    data-testid="institution-input"
                    className="rounded-none focus:ring-2 focus:ring-[#0A58CA]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="hours" className="text-[#111827] font-medium">
                    Duration (hours)
                  </Label>
                  <Input
                    id="hours"
                    value={hours}
                    onChange={(e) => setHours(e.target.value)}
                    placeholder="40"
                    data-testid="hours-input"
                    className="rounded-none focus:ring-2 focus:ring-[#0A58CA]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-[#111827] font-medium">
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Course description and modules..."
                    data-testid="description-input"
                    className="rounded-none focus:ring-2 focus:ring-[#0A58CA]"
                    rows={4}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="send-email"
                    checked={sendEmail}
                    onCheckedChange={setSendEmail}
                    data-testid="send-email-switch"
                  />
                  <Label htmlFor="send-email" className="text-[#111827] font-medium cursor-pointer">
                    Send via email
                  </Label>
                </div>

                <Button
                  onClick={handleSingleGenerate}
                  disabled={generating}
                  data-testid="generate-single-button"
                  className="bg-[#0A58CA] hover:bg-[#084298] text-white rounded-none"
                >
                  {generating ? 'Generating...' : 'Generate Certificate'}
                </Button>
              </TabsContent>

              <TabsContent value="bulk" className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="template-bulk" className="text-[#111827] font-medium">
                    Template *
                  </Label>
                  <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                    <SelectTrigger data-testid="template-bulk-select" className="rounded-none">
                      <SelectValue placeholder="Select a template" />
                    </SelectTrigger>
                    <SelectContent>
                      {templates.map((template) => (
                        <SelectItem key={template.id} value={template.id}>
                          {template.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-[#111827] font-medium">Upload CSV File *</Label>
                  <div className="border-2 border-dashed border-[#E5E7EB] rounded-sm p-8 text-center">
                    <Upload className="w-8 h-8 mx-auto mb-2 text-[#9CA3AF]" />
                    <p className="text-sm text-[#4B5563] mb-2">
                      CSV should have columns: name, email, course, institution, hours, description
                    </p>
                    <Input
                      type="file"
                      accept=".csv"
                      onChange={(e) => setCsvFile(e.target.files[0])}
                      data-testid="csv-upload"
                      className="mt-2"
                    />
                    {csvFile && (
                      <p className="mt-2 text-sm text-[#4B5563]">{csvFile.name}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="send-email-bulk"
                    checked={sendEmail}
                    onCheckedChange={setSendEmail}
                    data-testid="send-email-bulk-switch"
                  />
                  <Label htmlFor="send-email-bulk" className="text-[#111827] font-medium cursor-pointer">
                    Send via email to all participants
                  </Label>
                </div>

                <Button
                  onClick={handleBulkGenerate}
                  disabled={generating}
                  data-testid="generate-bulk-button"
                  className="bg-[#0A58CA] hover:bg-[#084298] text-white rounded-none"
                >
                  {generating ? 'Generating...' : 'Generate Certificates'}
                </Button>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default CertificateGenerator;

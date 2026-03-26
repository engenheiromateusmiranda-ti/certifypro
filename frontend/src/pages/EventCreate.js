import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import { apiClient } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { toast } from 'sonner';
import { Calendar, Save } from 'lucide-react';

const EventCreate = () => {
  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [templates, setTemplates] = useState([]);
  const [saving, setSaving] = useState(false);
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

  const handleSave = async () => {
    if (!name || !date || !selectedTemplate) {
      toast.error('Please fill in all fields');
      return;
    }

    setSaving(true);

    try {
      await apiClient.post('/events', {
        name,
        date,
        template_id: selectedTemplate
      });
      toast.success('Event created successfully!');
      navigate('/events');
    } catch (error) {
      toast.error('Failed to create event');
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl">
        <Card className="border border-[#E5E7EB] rounded-sm">
          <CardHeader>
            <CardTitle className="font-heading text-2xl font-bold tracking-tight text-[#111827]">
              <Calendar className="inline w-6 h-6 mr-2" />
              Create Event
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="event-name" className="text-[#111827] font-medium">
                Event Name *
              </Label>
              <Input
                id="event-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Web Development Bootcamp 2024"
                data-testid="event-name-input"
                className="rounded-none focus:ring-2 focus:ring-[#0A58CA]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="event-date" className="text-[#111827] font-medium">
                Date *
              </Label>
              <Input
                id="event-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                data-testid="event-date-input"
                className="rounded-none focus:ring-2 focus:ring-[#0A58CA]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="template" className="text-[#111827] font-medium">
                Certificate Template *
              </Label>
              <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                <SelectTrigger data-testid="event-template-select" className="rounded-none">
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

            <div className="flex gap-4">
              <Button
                onClick={handleSave}
                disabled={saving}
                data-testid="save-event-button"
                className="bg-[#0A58CA] hover:bg-[#084298] text-white rounded-none"
              >
                <Save className="w-4 h-4 mr-2" />
                {saving ? 'Creating...' : 'Create Event'}
              </Button>
              <Button
                onClick={() => navigate('/events')}
                variant="outline"
                data-testid="cancel-event-button"
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

export default EventCreate;

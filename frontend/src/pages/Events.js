import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import { apiClient } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Plus, Calendar as CalendarIcon, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

const Events = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await apiClient.get('/events');
      setEvents(response.data);
    } catch (error) {
      toast.error('Failed to fetch events');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this event?')) return;

    try {
      await apiClient.delete(`/events/${id}`);
      toast.success('Event deleted');
      fetchEvents();
    } catch (error) {
      toast.error('Failed to delete event');
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
            Manage your events and courses
          </p>
          <Link to="/events/new">
            <Button
              data-testid="create-event-button"
              className="bg-[#0A58CA] hover:bg-[#084298] text-white rounded-none"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Event
            </Button>
          </Link>
        </div>

        {events.length === 0 ? (
          <Card className="border border-[#E5E7EB] rounded-sm p-12 text-center">
            <p className="text-[#9CA3AF] mb-4">No events yet</p>
            <Link to="/events/new">
              <Button
                data-testid="create-first-event"
                className="bg-[#0A58CA] hover:bg-[#084298] text-white rounded-none"
              >
                Create Your First Event
              </Button>
            </Link>
          </Card>
        ) : (
          <div className="space-y-4">
            {events.map((event) => (
              <Card
                key={event.id}
                data-testid={`event-card-${event.id}`}
                className="border border-[#E5E7EB] rounded-sm hover:shadow-md transition-all duration-200"
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="w-12 h-12 bg-[#0A58CA]/10 rounded-sm flex items-center justify-center">
                        <CalendarIcon className="w-6 h-6 text-[#0A58CA]" strokeWidth={1.5} />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-heading text-lg font-bold text-[#111827] mb-1">
                          {event.name}
                        </h3>
                        <p className="text-sm text-[#4B5563] mb-2">
                          Date: {new Date(event.date).toLocaleDateString()}
                        </p>
                        <div className="flex items-center gap-2">
                          <span className="inline-block px-2 py-1 text-xs font-medium bg-[#FFC107]/10 text-[#FFC107] rounded-sm">
                            {event.status}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        data-testid={`delete-event-${event.id}`}
                        variant="outline"
                        onClick={() => handleDelete(event.id)}
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

export default Events;

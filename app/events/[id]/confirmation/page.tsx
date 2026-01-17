'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { format } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';
import {
  CheckCircle2,
  Calendar,
  MapPin,
  Clock,
  Globe,
  Building2,
  ExternalLink,
  ArrowLeft,
  Loader2,
  AlertCircle,
  Mail,
  User
} from 'lucide-react';

interface Registration {
  id: string;
  attendee_name: string;
  attendee_email: string;
  registered_at: string;
}

interface Event {
  id: string;
  title: string;
  description: string;
  event_date: string;
  location_type: 'online' | 'offline' | 'hybrid';
  city: string | null;
  venue_address: string | null;
  meeting_link: string | null;
  max_capacity: number;
  current_registrations: number;
}

export default function ConfirmationPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const eventId = params.id as string;
  const registrationId = searchParams.get('registration_id');

  const [registration, setRegistration] = useState<Registration | null>(null);
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!registrationId) {
      setError('Invalid registration link');
      setLoading(false);
      return;
    }

    fetchRegistrationDetails();
  }, [eventId, registrationId]);

  const fetchRegistrationDetails = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/events/${eventId}/registrations/${registrationId}`);

      if (!res.ok) {
        if (res.status === 404) {
          setError('Registration not found');
        } else {
          setError('Failed to load registration details');
        }
        return;
      }

      const data = await res.json();
      setRegistration(data.registration);
      setEvent(data.event);
      setError(null);
    } catch (err) {
      console.error('Error fetching registration:', err);
      setError('Failed to load registration details');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCalendar = () => {
    if (!event) return;

    // Create Google Calendar link
    const eventDate = new Date(event.event_date);
    const startTime = format(eventDate, "yyyyMMdd'T'HHmmss");
    const endTime = format(new Date(eventDate.getTime() + 2 * 60 * 60 * 1000), "yyyyMMdd'T'HHmmss"); // +2 hours

    const calendarUrl = new URL('https://calendar.google.com/calendar/render');
    calendarUrl.searchParams.set('action', 'TEMPLATE');
    calendarUrl.searchParams.set('text', event.title);
    calendarUrl.searchParams.set('dates', `${startTime}/${endTime}`);
    calendarUrl.searchParams.set('details', event.description);

    if (event.location_type === 'online' || event.location_type === 'hybrid') {
      calendarUrl.searchParams.set('location', event.meeting_link || 'Online');
    } else if (event.venue_address) {
      calendarUrl.searchParams.set('location', event.venue_address);
    }

    window.open(calendarUrl.toString(), '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <div className="flex items-center gap-3">
          <Loader2 className="w-8 h-8 text-accent-primary animate-spin" />
          <span className="text-text-secondary">Loading registration details...</span>
        </div>
      </div>
    );
  }

  if (error || !registration || !event) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center p-4">
        <Card className="max-w-md w-full border-border-default bg-bg-tertiary">
          <CardContent className="pt-6 text-center space-y-4">
            <AlertCircle className="w-12 h-12 text-red-400 mx-auto" />
            <h2 className="text-xl font-semibold text-text-primary">
              {error || 'Registration not found'}
            </h2>
            <p className="text-text-secondary">
              Unable to load your registration details. Please check your link or contact support.
            </p>
            <Button
              onClick={() => router.push('/')}
              className="bg-accent-primary hover:bg-accent-primary/90 text-bg-primary"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Events
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Format date/time
  const istDate = toZonedTime(new Date(event.event_date), 'Asia/Kolkata');
  const formattedDate = format(istDate, 'EEEE, MMMM d, yyyy');
  const formattedTime = format(istDate, 'h:mm a');

  const locationIcon = {
    online: <Globe className="w-5 h-5" />,
    offline: <Building2 className="w-5 h-5" />,
    hybrid: <MapPin className="w-5 h-5" />
  };

  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Header */}
      <div className="border-b border-border-default bg-bg-secondary">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Button
            variant="ghost"
            onClick={() => router.push('/')}
            className="text-text-secondary hover:text-accent-light"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Events
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        {/* Success Message */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/20 border-2 border-green-500">
            <CheckCircle2 className="w-8 h-8 text-green-400" />
          </div>
          <h1 className="text-3xl font-bold text-text-primary">
            Registration Confirmed!
          </h1>
          <p className="text-text-secondary max-w-md mx-auto">
            You've successfully registered for <span className="text-accent-primary font-semibold">{event.title}</span>. We look forward to seeing you there!
          </p>
        </div>

        {/* Registration Details */}
        <Card className="border-border-default bg-bg-tertiary">
          <CardHeader>
            <h2 className="text-lg font-semibold text-text-primary">Your Registration</h2>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <User className="w-5 h-5 text-accent-primary mt-0.5" />
              <div>
                <p className="text-sm font-medium text-text-primary">{registration.attendee_name}</p>
                <p className="text-xs text-text-muted">Name</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-accent-primary mt-0.5" />
              <div>
                <p className="text-sm font-medium text-text-primary">{registration.attendee_email}</p>
                <p className="text-xs text-text-muted">Email</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Event Details */}
        <Card className="border-border-default bg-bg-tertiary">
          <CardHeader>
            <h2 className="text-lg font-semibold text-text-primary">Event Details</h2>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Date */}
            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-accent-primary mt-0.5" />
              <div>
                <p className="text-sm font-medium text-text-primary">{formattedDate}</p>
                <p className="text-xs text-text-muted">Date</p>
              </div>
            </div>

            {/* Time */}
            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-accent-primary mt-0.5" />
              <div>
                <p className="text-sm font-medium text-text-primary">{formattedTime} IST</p>
                <p className="text-xs text-text-muted">Time</p>
              </div>
            </div>

            {/* Location */}
            <div className="flex items-start gap-3">
              {locationIcon[event.location_type]}
              <div>
                <p className="text-sm font-medium text-text-primary capitalize">{event.location_type}</p>
                {event.city && (
                  <p className="text-xs text-text-secondary">{event.city}</p>
                )}
                <p className="text-xs text-text-muted">Location</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Meeting Link (Online/Hybrid Only) */}
        {event.meeting_link && (event.location_type === 'online' || event.location_type === 'hybrid') && (
          <Card className="border-accent-primary/50 bg-bg-tertiary">
            <CardHeader>
              <h2 className="text-lg font-semibold text-text-primary flex items-center gap-2">
                <Globe className="w-5 h-5 text-accent-primary" />
                Meeting Link
              </h2>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-text-secondary">
                Join the event using the link below. Save this link - you'll need it to attend!
              </p>
              <div className="bg-bg-secondary p-4 rounded-lg border border-border-default">
                <a
                  href={event.meeting_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent-primary hover:text-accent-light flex items-center gap-2 break-all transition-colors"
                >
                  {event.meeting_link}
                  <ExternalLink className="w-4 h-4 flex-shrink-0" />
                </a>
              </div>
              <Button
                onClick={() => window.open(event.meeting_link!, '_blank')}
                className="w-full bg-accent-primary hover:bg-accent-primary/90 text-bg-primary"
              >
                Open Meeting Link
                <ExternalLink className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Venue Address (Offline/Hybrid) */}
        {event.venue_address && (event.location_type === 'offline' || event.location_type === 'hybrid') && (
          <Card className="border-border-default bg-bg-tertiary">
            <CardHeader>
              <h2 className="text-lg font-semibold text-text-primary flex items-center gap-2">
                <MapPin className="w-5 h-5 text-accent-primary" />
                Venue
              </h2>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-text-secondary whitespace-pre-wrap">{event.venue_address}</p>
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button
            onClick={handleAddToCalendar}
            className="flex-1 bg-bg-tertiary hover:bg-bg-secondary text-text-primary border border-accent-primary/50 hover:border-accent-primary transition-colors"
          >
            <Calendar className="w-4 h-4 mr-2" />
            Add to Google Calendar
          </Button>
          <Button
            onClick={() => router.push('/')}
            variant="outline"
            className="flex-1 border-border-default text-text-secondary hover:text-text-primary hover:border-accent-primary/50"
          >
            Browse More Events
          </Button>
        </div>

        {/* Info Notice */}
        <div className="bg-bg-secondary border border-border-default rounded-lg p-4">
          <p className="text-sm text-text-muted text-center">
            A confirmation has been recorded. Please save this page or bookmark the meeting link for easy access.
          </p>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Navigation } from '@/components/Navigation';
import { format } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';
import { Globe, Building, MapPin, Users, Calendar, Clock } from 'lucide-react';

interface Event {
  id: string;
  title: string;
  description: string;
  event_date: string;
  location_type: string;
  city: string | null;
  meeting_link: string | null;
  venue_address: string | null;
  max_capacity: number;
  current_registrations: number;
  status: string;
  submitted_at: string;
  expires_at: string;
  profiles: {
    full_name: string;
    email: string;
    affiliation: string;
  };
}

export default function EventReviewPage() {
  const router = useRouter();
  const params = useParams();
  const eventId = params.id as string;

  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Dialog states
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await fetch(`/api/admin/events?status=submitted&limit=1000`);

        if (response.status === 401) {
          router.push('/login');
          return;
        }

        if (!response.ok) {
          throw new Error('Failed to fetch event');
        }

        const data = await response.json();
        const foundEvent = data.events.find((e: Event) => e.id === eventId);

        if (!foundEvent) {
          setError('Event not found');
        } else {
          setEvent(foundEvent);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [eventId, router]);

  const handleApprove = async () => {
    try {
      setActionLoading(true);
      const response = await fetch(`/api/admin/events/${eventId}/approve`, {
        method: 'PUT'
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to approve event');
      }

      // Success - redirect to pending page
      router.push('/admin/pending?approved=true');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to approve event');
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (rejectionReason.trim().length < 10) {
      alert('Rejection reason must be at least 10 characters');
      return;
    }

    try {
      setActionLoading(true);
      const response = await fetch(`/api/admin/events/${eventId}/reject`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: rejectionReason })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to reject event');
      }

      // Success - redirect to pending page
      router.push('/admin/pending?rejected=true');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to reject event');
      setActionLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const istDate = toZonedTime(new Date(dateString), 'Asia/Kolkata');
    return format(istDate, 'MMMM dd, yyyy');
  };

  const formatTime = (dateString: string) => {
    const istDate = toZonedTime(new Date(dateString), 'Asia/Kolkata');
    return format(istDate, 'h:mm a');
  };

  const getLocationIcon = (locationType: string) => {
    const icons = {
      online: <Globe className="w-5 h-5" />,
      offline: <Building className="w-5 h-5" />,
      hybrid: <MapPin className="w-5 h-5" />
    };
    return icons[locationType as keyof typeof icons] || <MapPin className="w-5 h-5" />;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin h-12 w-12 border-4 border-orange-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-black">
        <Navigation />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-red-400 mb-4">Error</h1>
            <p className="text-gray-400">{error || 'Event not found'}</p>
            <Button
              onClick={() => router.push('/admin/pending')}
              className="mt-6 bg-orange-500 hover:bg-orange-600"
            >
              Back to Pending Events
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <Navigation />

      <main className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Header */}
        <div className="mb-8">
          <Button
            onClick={() => router.push('/admin/pending')}
            variant="outline"
            className="mb-4 border-gray-600"
          >
            ← Back to Pending
          </Button>

          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-10 w-1 bg-gradient-to-b from-orange-500 to-orange-500/0"></div>
                <h1 className="text-4xl font-bold text-white">{event.title}</h1>
              </div>
              <p className="text-gray-400 ml-4">Review and approve or reject this event</p>
            </div>
            <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30 px-4 py-2">
              Pending Review
            </Badge>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 mb-8">
          <Button
            onClick={() => setApproveDialogOpen(true)}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-6 text-lg"
            disabled={actionLoading}
          >
            ✓ Approve Event
          </Button>
          <Button
            onClick={() => setRejectDialogOpen(true)}
            variant="destructive"
            className="flex-1 py-6 text-lg font-semibold"
            disabled={actionLoading}
          >
            ✗ Reject Event
          </Button>
        </div>

        <Separator className="my-8 bg-[#2A2A2A]" />

        {/* Event Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Main Info */}
          <Card className="lg:col-span-2 bg-[#1A1A1A] border-[#2A2A2A]">
            <CardHeader>
              <CardTitle className="text-white">Event Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">Description</h3>
                <p className="text-white leading-relaxed">{event.description}</p>
              </div>

              <Separator className="bg-[#2A2A2A]" />

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-3 bg-[#141414] rounded-lg border border-[#2A2A2A]">
                  <Calendar className="w-5 h-5 text-orange-400" />
                  <div>
                    <p className="text-xs text-gray-400">Date</p>
                    <p className="text-white font-medium">{formatDate(event.event_date)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-[#141414] rounded-lg border border-[#2A2A2A]">
                  <Clock className="w-5 h-5 text-orange-400" />
                  <div>
                    <p className="text-xs text-gray-400">Time</p>
                    <p className="text-white font-medium">{formatTime(event.event_date)}</p>
                  </div>
                </div>
              </div>

              <Separator className="bg-[#2A2A2A]" />

              <div>
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Location Details</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-[#141414] rounded-lg border border-[#2A2A2A]">
                    {getLocationIcon(event.location_type)}
                    <div>
                      <p className="text-xs text-gray-400">Type</p>
                      <p className="text-white font-medium capitalize">{event.location_type}</p>
                    </div>
                  </div>

                  {event.city && (
                    <div className="p-3 bg-[#141414] rounded-lg border border-[#2A2A2A]">
                      <p className="text-xs text-gray-400 mb-1">City</p>
                      <p className="text-white">{event.city}</p>
                    </div>
                  )}

                  {event.meeting_link && (
                    <div className="p-3 bg-[#141414] rounded-lg border border-[#2A2A2A]">
                      <p className="text-xs text-gray-400 mb-1">Meeting Link</p>
                      <a
                        href={event.meeting_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-orange-400 hover:text-orange-300 underline break-all"
                      >
                        {event.meeting_link}
                      </a>
                    </div>
                  )}

                  {event.venue_address && (
                    <div className="p-3 bg-[#141414] rounded-lg border border-[#2A2A2A]">
                      <p className="text-xs text-gray-400 mb-1">Venue Address</p>
                      <p className="text-white whitespace-pre-wrap">{event.venue_address}</p>
                    </div>
                  )}
                </div>
              </div>

              <Separator className="bg-[#2A2A2A]" />

              <div className="flex items-center gap-3 p-3 bg-[#141414] rounded-lg border border-[#2A2A2A]">
                <Users className="w-5 h-5 text-orange-400" />
                <div>
                  <p className="text-xs text-gray-400">Capacity</p>
                  <p className="text-white font-medium">{event.max_capacity} attendees</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Host Info */}
            <Card className="bg-[#1A1A1A] border-[#2A2A2A]">
              <CardHeader>
                <CardTitle className="text-white text-lg">Host Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-xs text-gray-400 mb-1">Name</p>
                  <p className="text-white font-medium">{event.profiles.full_name}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">Email</p>
                  <p className="text-white text-sm">{event.profiles.email}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">Affiliation</p>
                  <Badge variant="outline" className="border-orange-500/30 text-orange-400">
                    {event.profiles.affiliation}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Submission Info */}
            <Card className="bg-[#1A1A1A] border-[#2A2A2A]">
              <CardHeader>
                <CardTitle className="text-white text-lg">Submission Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-xs text-gray-400 mb-1">Submitted</p>
                  <p className="text-white text-sm">{formatDate(event.submitted_at)}</p>
                  <p className="text-gray-400 text-xs">{formatTime(event.submitted_at)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">Expires</p>
                  <p className="text-white text-sm">{formatDate(event.expires_at)}</p>
                  <p className="text-gray-400 text-xs">{formatTime(event.expires_at)}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Approve Dialog */}
        <Dialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
          <DialogContent className="bg-[#1A1A1A] border-[#2A2A2A] text-white">
            <DialogHeader>
              <DialogTitle>Approve Event?</DialogTitle>
              <DialogDescription className="text-gray-400">
                This event will be published and visible to all users. The host will be able to see registrations.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <p className="text-white font-medium">{event.title}</p>
              <p className="text-sm text-gray-400 mt-1">by {event.profiles.full_name}</p>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setApproveDialogOpen(false)}
                disabled={actionLoading}
                className="border-gray-600"
              >
                Cancel
              </Button>
              <Button
                onClick={handleApprove}
                disabled={actionLoading}
                className="bg-green-600 hover:bg-green-700"
              >
                {actionLoading ? 'Approving...' : 'Approve Event'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Reject Dialog */}
        <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
          <DialogContent className="bg-[#1A1A1A] border-[#2A2A2A] text-white">
            <DialogHeader>
              <DialogTitle>Reject Event?</DialogTitle>
              <DialogDescription className="text-gray-400">
                Please provide a reason for rejection. This will be visible to the host.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-4">
              <div>
                <p className="text-white font-medium">{event.title}</p>
                <p className="text-sm text-gray-400 mt-1">by {event.profiles.full_name}</p>
              </div>
              <Textarea
                placeholder="Reason for rejection (minimum 10 characters)..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="bg-[#141414] border-[#2A2A2A] text-white min-h-[100px]"
              />
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setRejectDialogOpen(false)}
                disabled={actionLoading}
                className="border-gray-600"
              >
                Cancel
              </Button>
              <Button
                onClick={handleReject}
                disabled={actionLoading || rejectionReason.trim().length < 10}
                variant="destructive"
              >
                {actionLoading ? 'Rejecting...' : 'Reject Event'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}

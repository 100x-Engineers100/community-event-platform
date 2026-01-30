'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Navigation } from '@/components/Navigation';
import { format } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';
import {
  MapPin,
  Users,
  Calendar,
  ArrowLeft,
  Check,
  X,
  User,
  Hourglass,
  AlertTriangle,
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';


interface Event {
  id: string;
  host_id: string;
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

  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  // Cohort verification state
  const [verificationData, setVerificationData] = useState<{
    is_verified: boolean;
    cohort: string | null;
    matched_by: string | null;
  } | null>(null);
  const [verificationLoading, setVerificationLoading] = useState(false);

  useEffect(() => {
    const fetchEvent = async () => {
      if (!eventId) return;
      try {
        setLoading(true);
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
          setError('Event not found or already reviewed.');
        } else {
          setEvent(foundEvent);
          // Fetch verification data for this host
          fetchVerification(foundEvent.host_id);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [eventId, router]);

  const fetchVerification = async (hostId: string) => {
    try {
      setVerificationLoading(true);
      console.log('[VERIFY] Fetching verification for host:', hostId);

      const verifyResponse = await fetch(`/api/admin/verify-host/${hostId}`);

      console.log('[VERIFY] Response status:', verifyResponse.status);

      if (verifyResponse.ok) {
        const verifyData = await verifyResponse.json();
        console.log('[VERIFY] Success:', verifyData);
        setVerificationData(verifyData);
      } else {
        const errorText = await verifyResponse.text();
        console.error('[VERIFY] API failed with status:', verifyResponse.status);
        console.error('[VERIFY] Error response:', errorText);
        setVerificationData({ is_verified: false, cohort: null, matched_by: null });
      }
    } catch (err) {
      console.error('[VERIFY] Exception:', err);
      setVerificationData({ is_verified: false, cohort: null, matched_by: null });
    } finally {
      setVerificationLoading(false);
    }
  };

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

      router.push('/admin/pending?rejected=true');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to reject event');
      setActionLoading(false);
    }
  };

  const InfoCard = ({ icon: Icon, title, children }: {
    icon: React.ComponentType<{ className?: string }>,
    title: string,
    children: React.ReactNode
  }) => (
    <Card className="bg-100x-bg-secondary border-100x-border-default">
      <CardHeader className="flex flex-row items-center gap-3 space-y-0 pb-4">
        <Icon className="w-5 h-5 text-100x-accent-primary" />
        <CardTitle className="text-lg text-100x-text-primary">{title}</CardTitle>
      </CardHeader>
      <CardContent className="text-100x-text-secondary space-y-3 text-sm">
        {children}
      </CardContent>
    </Card>
  );

  const InfoDetail = ({ label, value, isLink = false }: { label: string, value: string | null, isLink?: boolean }) => {
    if (!value) return null;
    return (
      <div>
        <p className="text-xs text-100x-text-muted uppercase tracking-wider">{label}</p>
        {isLink ? (
          <a
            href={value}
            target="_blank"
            rel="noopener noreferrer"
            className="text-100x-accent-primary hover:underline break-all"
          >
            {value}
          </a>
        ) : (
          <p className="text-100x-text-primary font-medium break-words">{value}</p>
        )}
      </div>
    )
  };


  if (loading) {
    return (
      <div className="min-h-screen bg-100x-bg-primary text-100x-text-primary p-4 sm:p-6 lg:p-8">
        <Navigation />
        <main className="container mx-auto max-w-5xl mt-10">
          <Skeleton className="h-8 w-48 mb-8 bg-100x-bg-tertiary" />
          <Skeleton className="h-12 w-3/4 mb-2 bg-100x-bg-tertiary" />
          <Skeleton className="h-6 w-1/2 mb-8 bg-100x-bg-tertiary" />
          <div className="flex gap-4 mb-8">
            <Skeleton className="h-16 flex-1 bg-green-500/10" />
            <Skeleton className="h-16 flex-1 bg-red-500/10" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Skeleton className="h-64 w-full bg-100x-bg-secondary" />
              <Skeleton className="h-48 w-full bg-100x-bg-secondary" />
            </div>
            <div className="space-y-6">
              <Skeleton className="h-48 w-full bg-100x-bg-secondary" />
              <Skeleton className="h-48 w-full bg-100x-bg-secondary" />
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-100x-bg-primary text-100x-text-primary flex items-center justify-center">
        <Navigation />
        <main className="container mx-auto text-center">
          <AlertTriangle className="w-16 h-16 text-red-400 mb-6 mx-auto" />
          <h1 className="text-3xl font-bold text-red-400 mb-4">Could not load event</h1>
          <p className="text-100x-text-secondary max-w-md mb-8 mx-auto">{error || 'The requested event could not be found or loaded.'}</p>
          <Button onClick={() => router.push('/admin/pending')} className="bg-100x-accent-primary hover:bg-100x-accent-primary/90 text-black font-bold group">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Pending Queue
          </Button>
        </main>
      </div>
    );
  }

  const { title, description, event_date, location_type, city, meeting_link, venue_address, max_capacity, profiles, submitted_at, expires_at } = event;

  return (
    <div className="min-h-screen bg-100x-bg-primary text-100x-text-primary">
      <Navigation
        actions={
          <Button
            onClick={() => router.push('/admin/pending')}
            variant="outline"
            className="border-100x-border-default hover:bg-100x-bg-secondary group"
          >
            <ArrowLeft className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1" />
            Back to Queue
          </Button>
        }
      />
      <main className="container mx-auto px-4 py-8 pt-24 max-w-5xl">

        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-100x-text-primary">{title}</h1>
          <p className="text-100x-text-secondary mt-3 max-w-3xl">Review the details below and take action.</p>
        </div>

        <div className="sticky top-0 z-10 bg-100x-bg-primary/80 backdrop-blur-lg py-4 -my-4 mb-8 flex gap-4">
          <Button onClick={() => setApproveDialogOpen(true)} className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-6 text-lg group" disabled={actionLoading}>
            <Check className="w-6 h-6 mr-3 transition-transform group-hover:scale-125" />
            Approve
          </Button>
          <Button onClick={() => setRejectDialogOpen(true)} variant="destructive" className="flex-1 py-6 text-lg font-bold group" disabled={actionLoading}>
            <X className="w-6 h-6 mr-3 transition-transform group-hover:rotate-12" />
            Reject
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <InfoCard icon={MapPin} title="Event Details">
              <p className="whitespace-pre-wrap">{description}</p>
            </InfoCard>

            <InfoCard icon={Calendar} title="Date & Location">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InfoDetail label="Date" value={format(toZonedTime(new Date(event_date), 'Asia/Kolkata'), 'MMMM dd, yyyy')} />
                <InfoDetail label="Time" value={format(toZonedTime(new Date(event_date), 'Asia/Kolkata'), 'h:mm a')} />
              </div>
              <Separator className="bg-100x-border-default" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InfoDetail label="Type" value={location_type} />
                <InfoDetail label="City" value={city} />
              </div>
              <InfoDetail label="Venue" value={venue_address} />
              <InfoDetail label="Meeting Link" value={meeting_link} isLink={true} />
            </InfoCard>
          </div>

          <div className="space-y-6">
            <InfoCard icon={User} title="Host Information">
              <InfoDetail label="Name" value={profiles.full_name} />
              <InfoDetail label="Email" value={profiles.email} />


              {/* Cohort Verification Badge */}
              <div className="pt-4 border-t border-100x-border-default">
                <p className="text-xs text-100x-text-muted uppercase tracking-wider mb-2">Verification Status</p>
                {verificationLoading ? (
                  <div className="flex items-center gap-2">
                    <Hourglass className="w-4 h-4 animate-spin text-100x-text-muted" />
                    <span className="text-sm text-100x-text-secondary">Checking...</span>
                  </div>
                ) : verificationData?.is_verified ? (
                  <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                    <Check className="w-5 h-5 text-green-500" />
                    <div>
                      <p className="font-bold text-green-400">{verificationData.cohort}</p>
                      <p className="text-xs text-green-300/70">Verified 100x Member</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
                    <AlertTriangle className="w-5 h-5 text-yellow-500" />
                    <div>
                      <p className="font-bold text-yellow-400">Not Verified</p>
                      <p className="text-xs text-yellow-300/70">Manual verification required</p>
                    </div>
                  </div>
                )}
              </div>
            </InfoCard>

            <InfoCard icon={Hourglass} title="Submission Timeline">
              <InfoDetail label="Submitted On" value={format(new Date(submitted_at), 'MMM dd, yyyy, h:mm a')} />
              <InfoDetail label="Expires On" value={format(new Date(expires_at), 'MMM dd, yyyy, h:mm a')} />
            </InfoCard>

            <InfoCard icon={Users} title="Capacity">
              <InfoDetail label="Maximum Attendees" value={String(max_capacity)} />
            </InfoCard>
          </div>
        </div>

        {/* Dialogs */}
        <Dialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
          <DialogContent className="bg-100x-bg-secondary border-100x-border-default text-100x-text-primary">
            <DialogHeader>
              <DialogTitle className="text-2xl text-green-400">Approve Event?</DialogTitle>
              <DialogDescription className="text-100x-text-secondary">The event will go live and be visible to everyone. The host will be notified.</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setApproveDialogOpen(false)} disabled={actionLoading} className="border-100x-border-default hover:bg-100x-bg-tertiary">Cancel</Button>
              <Button onClick={handleApprove} disabled={actionLoading} className="bg-green-600 hover:bg-green-700 text-white">{actionLoading ? 'Approving...' : 'Confirm & Approve'}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
          <DialogContent className="bg-100x-bg-secondary border-100x-border-default text-100x-text-primary">
            <DialogHeader>
              <DialogTitle className="text-2xl text-red-400">Reject Event?</DialogTitle>
              <DialogDescription className="text-100x-text-secondary">Provide a clear reason for rejection. The host will be notified.</DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Textarea
                placeholder="Enter rejection reason (min 10 characters)..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="bg-100x-bg-primary border-100x-border-default min-h-[120px] focus:ring-100x-accent-primary"
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setRejectDialogOpen(false)} disabled={actionLoading} className="border-100x-border-default hover:bg-100x-bg-tertiary">Cancel</Button>
              <Button onClick={handleReject} disabled={actionLoading || rejectionReason.trim().length < 10} variant="destructive">{actionLoading ? 'Rejecting...' : 'Confirm & Reject'}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}

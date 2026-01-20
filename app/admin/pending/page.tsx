'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Navigation } from '@/components/Navigation';
import { format } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';
import { ArrowLeft, Hourglass, CheckCircle, AlertTriangle, Inbox, Flame, Calendar, MapPin, Users, Building, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Event {
  id: string;
  title: string;
  description: string;
  event_date: string;
  location_type: string;
  city: string | null;
  max_capacity: number;
  submitted_at: string;
  expires_at: string;
  profiles: {
    full_name: string;
    email: string;
    affiliation: string;
  };
}

export default function PendingEventsPage() {
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/admin/events?status=submitted');
        if (response.status === 401) {
          router.push('/login');
          return;
        }
        if (response.status === 403) {
          setError('Access denied - Admin privileges required');
          return;
        }
        if (!response.ok) {
          throw new Error('Failed to fetch events');
        }
        const data = await response.json();
        setEvents(data.events || []);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, [router]);

  const formatDate = (dateString: string) => {
    const istDate = toZonedTime(new Date(dateString), 'Asia/Kolkata');
    return format(istDate, 'MMM dd, yyyy h:mm a');
  };

  const getDaysUntilExpiry = (expiresAt: string) => {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diffMs = expiry.getTime() - now.getTime();
    return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  };

  const LocationInfo = ({ type, city }: { type: string; city: string | null }) => {
    const iconMap: { [key: string]: React.ReactNode } = {
      online: <Globe className="w-4 h-4 text-blue-400" />,
      offline: <Building className="w-4 h-4 text-green-400" />,
      hybrid: <MapPin className="w-4 h-4 text-purple-400" />,
    };
    return (
      <div className="flex items-center gap-2">
        {iconMap[type]}
        <span className="capitalize">{city || type}</span>
      </div>
    );
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-20">
          <Hourglass className="h-12 w-12 text-100x-accent-primary animate-spin" />
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center text-center py-20">
          <AlertTriangle className="w-16 h-16 text-red-400 mb-6" />
          <h2 className="text-3xl font-bold text-red-400 mb-4">An Error Occurred</h2>
          <p className="text-100x-text-secondary max-w-md">{error}</p>
        </div>
      );
    }

    if (events.length === 0) {
      return (
        <Card className="bg-100x-bg-secondary border-100x-border-default">
          <CardContent className="text-center py-20 flex flex-col items-center">
            <CheckCircle className="w-16 h-16 text-green-400 mb-6" />
            <h2 className="text-3xl font-bold text-100x-text-primary mb-2">Inbox Zero!</h2>
            <p className="text-100x-text-secondary">No pending events to review. Great job!</p>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card className="bg-100x-bg-secondary border-100x-border-default">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-100x-border-default">
                  <TableHead className="text-100x-text-secondary font-semibold">Event</TableHead>
                  <TableHead className="text-100x-text-secondary font-semibold">Host</TableHead>
                  <TableHead className="text-100x-text-secondary font-semibold">Details</TableHead>
                  <TableHead className="text-100x-text-secondary font-semibold">Submitted</TableHead>
                  <TableHead className="text-100x-text-secondary font-semibold text-right">Expires In</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {events.map((event) => {
                  const daysLeft = getDaysUntilExpiry(event.expires_at);
                  const isUrgent = daysLeft <= 2;
                  return (
                    <TableRow
                      key={event.id}
                      className="border-100x-border-default hover:bg-100x-bg-tertiary/50 transition-colors cursor-pointer"
                      onClick={() => router.push(`/admin/review/${event.id}`)}
                    >
                      <TableCell className="font-medium">
                        <div className="max-w-xs flex items-center gap-3">
                          <div className={cn("w-2 h-2 rounded-full", isUrgent ? "bg-red-500 animate-pulse" : "bg-100x-accent-primary")}></div>
                          <div>
                            <p className="text-100x-text-primary truncate font-bold">{event.title}</p>
                            <p className="text-sm text-100x-text-muted truncate">{event.description.substring(0, 40)}...</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="text-100x-text-primary text-sm font-semibold">{event.profiles.full_name}</p>
                        <p className="text-xs text-100x-text-muted">{event.profiles.affiliation}</p>
                      </TableCell>
                      <TableCell className="text-100x-text-secondary text-sm">
                        <div className="flex flex-col gap-2">
                          <LocationInfo type={event.location_type} city={event.city} />
                          <div className="flex items-center gap-2"><Users className="w-4 h-4" /><span>{event.max_capacity}</span></div>
                          <div className="flex items-center gap-2"><Calendar className="w-4 h-4" /><span>{format(toZonedTime(new Date(event.event_date), 'Asia/Kolkata'), 'MMM dd, yyyy')}</span></div>
                        </div>
                      </TableCell>
                      <TableCell className="text-100x-text-muted text-sm">
                        {format(new Date(event.submitted_at), 'dd MMM yyyy')}
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge
                          variant="outline"
                          className={cn(
                            "font-bold",
                            isUrgent
                              ? 'border-red-500/30 text-red-400'
                              : 'border-100x-accent-primary/30 text-100x-accent-primary'
                          )}
                        >
                          <Flame className={cn("w-3 h-3 mr-1.5", isUrgent && "text-red-400")} />
                          {daysLeft} day{daysLeft !== 1 ? 's' : ''}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-100x-bg-primary text-100x-text-primary">
      <Navigation showSignIn={false} />
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <Button
            onClick={() => router.push('/admin')}
            variant="outline"
            className="mb-6 border-100x-border-default hover:bg-100x-bg-secondary"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <div className="flex items-center justify-between">
            <div className='text-center w-full'>
              <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-100x-accent-primary/80 to-100x-accent-primary">
                Pending Review Queue
              </h1>
              <p className="text-100x-text-secondary mt-3 max-w-2xl mx-auto">
                {loading ? 'Fetching events...' : `You have ${events.length} events awaiting your approval.`}
              </p>
            </div>
          </div>
        </div>

        {renderContent()}
      </main>
    </div>
  );
}

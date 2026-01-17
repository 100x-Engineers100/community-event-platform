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

  useEffect(() => {
    fetchEvents();
  }, []);

  const formatDate = (dateString: string) => {
    const istDate = toZonedTime(new Date(dateString), 'Asia/Kolkata');
    return format(istDate, 'MMM dd, yyyy h:mm a');
  };

  const getDaysUntilExpiry = (expiresAt: string) => {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diffMs = expiry.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getLocationBadge = (locationType: string) => {
    const colors = {
      online: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      offline: 'bg-green-500/20 text-green-400 border-green-500/30',
      hybrid: 'bg-purple-500/20 text-purple-400 border-purple-500/30'
    };

    return (
      <Badge variant="outline" className={colors[locationType as keyof typeof colors] || 'bg-gray-500/20 text-gray-400'}>
        {locationType}
      </Badge>
    );
  };

  if (error) {
    return (
      <div className="min-h-screen bg-black">
        <Navigation />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-red-400 mb-4">Error</h1>
            <p className="text-gray-400">{error}</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <Navigation />

      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="h-10 w-1 bg-gradient-to-b from-orange-500 to-orange-500/0"></div>
                <h1 className="text-4xl font-bold text-white">Pending Reviews</h1>
                <Badge className="bg-orange-500 text-white px-3 py-1">
                  {events.length}
                </Badge>
              </div>
              <p className="text-gray-400 ml-4">Events awaiting approval</p>
            </div>
            <Button
              onClick={() => router.push('/admin')}
              variant="outline"
              className="border-gray-600"
            >
              Back to Dashboard
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin h-12 w-12 border-4 border-orange-500 border-t-transparent rounded-full"></div>
          </div>
        ) : events.length === 0 ? (
          <Card className="bg-[#1A1A1A] border-[#2A2A2A]">
            <CardContent className="text-center py-12">
              <div className="text-6xl mb-4">✓</div>
              <h2 className="text-2xl font-bold text-white mb-2">All Caught Up!</h2>
              <p className="text-gray-400">No pending events to review</p>
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-[#1A1A1A] border-[#2A2A2A]">
            <CardHeader>
              <CardTitle className="text-white">Review Queue</CardTitle>
              <CardDescription className="text-gray-400">
                Click on any event to review details and approve/reject
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-[#2A2A2A] hover:bg-[#141414]">
                      <TableHead className="text-gray-300 font-semibold">Event</TableHead>
                      <TableHead className="text-gray-300 font-semibold">Host</TableHead>
                      <TableHead className="text-gray-300 font-semibold">Date</TableHead>
                      <TableHead className="text-gray-300 font-semibold">Type</TableHead>
                      <TableHead className="text-gray-300 font-semibold">Capacity</TableHead>
                      <TableHead className="text-gray-300 font-semibold">Submitted</TableHead>
                      <TableHead className="text-gray-300 font-semibold">Expires</TableHead>
                      <TableHead className="text-gray-300 font-semibold">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {events.map((event) => {
                      const daysLeft = getDaysUntilExpiry(event.expires_at);
                      const isUrgent = daysLeft <= 2;

                      return (
                        <TableRow
                          key={event.id}
                          className="border-[#2A2A2A] hover:bg-[#141414] transition-colors cursor-pointer"
                          onClick={() => router.push(`/admin/review/${event.id}`)}
                        >
                          <TableCell className="font-medium">
                            <div className="max-w-xs">
                              <p className="text-white truncate">{event.title}</p>
                              <p className="text-sm text-gray-400 truncate">{event.description.substring(0, 50)}...</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="text-white text-sm">{event.profiles.full_name}</p>
                              <Badge variant="outline" className="mt-1 text-xs border-gray-600 text-gray-400">
                                {event.profiles.affiliation}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell className="text-gray-300">
                            {formatDate(event.event_date)}
                          </TableCell>
                          <TableCell>
                            {getLocationBadge(event.location_type)}
                          </TableCell>
                          <TableCell className="text-gray-300">
                            {event.max_capacity}
                          </TableCell>
                          <TableCell className="text-gray-400 text-sm">
                            {formatDate(event.submitted_at)}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={isUrgent ? 'border-red-500/30 text-red-400 animate-pulse' : 'border-orange-500/30 text-orange-400'}
                            >
                              {daysLeft} day{daysLeft !== 1 ? 's' : ''}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button
                              size="sm"
                              className="bg-orange-500 hover:bg-orange-600 text-white"
                              onClick={(e) => {
                                e.stopPropagation();
                                router.push(`/admin/review/${event.id}`);
                              }}
                            >
                              Review
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}

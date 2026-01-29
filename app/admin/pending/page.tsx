'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Navigation } from '@/components/Navigation';
import { format } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';
import {
  ArrowLeft,
  Hourglass,
  CheckCircle,
  AlertTriangle,
  Inbox,
  Flame,
  Calendar,
  MapPin,
  Users,
  Building,
  Globe,
  Loader2,
  Sparkles,
  Timer,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
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

  const getDaysUntilExpiry = (expiresAt: string) => {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diffMs = expiry.getTime() - now.getTime();
    return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  };

  const LocationInfo = ({ type, city }: { type: string; city: string | null }) => {
    const iconMap: { [key: string]: React.ReactNode } = {
      online: <Globe className="w-3.5 h-3.5 text-blue-400" />,
      offline: <Building className="w-3.5 h-3.5 text-zinc-400" />,
      hybrid: <MapPin className="w-3.5 h-3.5 text-purple-400" />,
    };
    return (
      <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/5 border border-white/5 mt-1 w-fit">
        {iconMap[type]}
        <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">{city || type}</span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center gap-4">
        <Loader2 className="h-10 w-10 text-amber-500 animate-spin" />
        <span className="text-zinc-500 font-bold uppercase tracking-widest text-xs">Opening Review Queue...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white selection:bg-amber-500/30">
      <Navigation showSignIn={false} />

      <main className="container mx-auto px-4 pt-32 pb-16 max-w-7xl">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-8"
        >
          <div className="space-y-4">
            <Button
              onClick={() => router.push('/admin')}
              variant="ghost"
              className="h-10 px-4 bg-white/5 border border-white/5 hover:bg-white/10 text-white rounded-full transition-all group"
            >
              <ArrowLeft className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1" />
              Dashboard
            </Button>
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full">
                <Timer className="w-3.5 h-3.5 text-amber-500" />
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-500">Awaiting Decison</span>
              </div>
              <h1 className="text-5xl font-black tracking-tighter leading-none">
                Pending <span className="text-amber-500">Queue</span>
              </h1>
              <p className="text-zinc-500 font-medium max-w-xl">
                Ready to review {events.length} submission{events.length === 1 ? '' : 's'}. Deciding what hits the community next.
              </p>
            </div>
          </div>
        </motion.div>

        {error ? (
          <Card className="bg-zinc-900/40 backdrop-blur-xl border-red-500/10 p-12 text-center space-y-6">
            <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto border border-red-500/20">
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-2xl font-black tracking-tight text-red-500">System Error</h2>
            <p className="text-zinc-500 font-medium">{error}</p>
            <Button onClick={() => window.location.reload()} className="w-full bg-white/5 hover:bg-white/10 text-white rounded-xl">Try Again</Button>
          </Card>
        ) : events.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Card className="bg-zinc-900/40 backdrop-blur-xl border-white/5 py-24 text-center">
              <CardContent className="space-y-6">
                <div className="w-20 h-20 bg-zinc-900 rounded-[32px] flex items-center justify-center mx-auto border border-white/5">
                  <CheckCircle className="w-10 h-10 text-emerald-500" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-white">Inbox Zero!</h2>
                  <p className="text-zinc-500 font-medium mt-1">No pending events to review. Great job!</p>
                </div>
                <Button onClick={() => router.push('/admin')} className="bg-amber-500 text-black font-black px-8 h-12 rounded-full hover:bg-amber-400 transition-colors">Return to Dashboard</Button>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-zinc-900/40 backdrop-blur-xl border-white/5 overflow-hidden rounded-[32px]">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-white/5 hover:bg-transparent">
                      <TableHead className="text-[10px] font-black uppercase tracking-widest text-zinc-500 py-6 pl-8">Submission</TableHead>
                      <TableHead className="text-[10px] font-black uppercase tracking-widest text-zinc-500 py-6">Host</TableHead>
                      <TableHead className="text-[10px] font-black uppercase tracking-widest text-zinc-500 py-6">Event Details</TableHead>
                      <TableHead className="text-[10px] font-black uppercase tracking-widest text-zinc-500 py-6">Submitted At</TableHead>
                      <TableHead className="text-[10px] font-black uppercase tracking-widest text-zinc-500 py-6 text-right pr-8">Deadline</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {events.map((event, i) => {
                      const daysLeft = getDaysUntilExpiry(event.expires_at);
                      const isUrgent = daysLeft <= 2;
                      return (
                        <motion.tr
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.3 + (i * 0.05) }}
                          key={event.id}
                          className="border-white/5 hover:bg-white/[0.02] group transition-colors cursor-pointer"
                          onClick={() => router.push(`/admin/review/${event.id}`)}
                        >
                          <TableCell className="py-6 pl-8">
                            <div className="max-w-xs space-y-1">
                              <div className="flex items-center gap-2">
                                <div className={cn(
                                  "w-1.5 h-1.5 rounded-full shadow-[0_0_8px_rgba(0,0,0,0.5)]",
                                  isUrgent ? "bg-red-500 shadow-red-500/50 animate-pulse" : "bg-amber-500 shadow-amber-500/50"
                                )} />
                                <p className="text-white font-black truncate text-lg group-hover:text-amber-500 transition-colors">{event.title}</p>
                              </div>
                              <p className="text-xs text-zinc-500 font-medium line-clamp-1">{event.description}</p>
                            </div>
                          </TableCell>
                          <TableCell className="py-6">
                            <div className="space-y-0.5">
                              <p className="text-white text-sm font-bold">{event.profiles.full_name}</p>
                              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-600">{event.profiles.affiliation || 'Member'}</p>
                            </div>
                          </TableCell>
                          <TableCell className="py-6 text-zinc-400">
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center gap-2 text-zinc-400">
                                <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                                <span className="text-xs font-bold leading-none">
                                  {format(toZonedTime(new Date(event.event_date), 'Asia/Kolkata'), 'MMM dd, yyyy')}
                                </span>
                              </div>
                              <LocationInfo type={event.location_type} city={event.city} />
                            </div>
                          </TableCell>
                          <TableCell className="py-6 text-zinc-500 font-bold text-xs uppercase tracking-tight">
                            {format(new Date(event.submitted_at), 'MMM dd, yyyy')}
                          </TableCell>
                          <TableCell className="py-6 text-right pr-8">
                            <Badge
                              variant="outline"
                              className={cn(
                                "font-black text-[10px] px-3 py-1 rounded-full uppercase tracking-tighter transition-all",
                                isUrgent
                                  ? 'bg-red-500/10 border-red-500/20 text-red-500 shadow-[0_0_20px_rgba(239,68,68,0.1)]'
                                  : 'bg-amber-500/10 border-amber-500/20 text-amber-500'
                              )}
                            >
                              <Flame className={cn("w-3 h-3 mr-1.5", isUrgent && "animate-bounce")} />
                              {daysLeft} day{daysLeft !== 1 ? 's' : ''} {isUrgent ? 'LEFT!!!' : 'LEFT'}
                            </Badge>
                          </TableCell>
                        </motion.tr>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </Card>
          </motion.div>
        )}
      </main>
    </div>
  );
}

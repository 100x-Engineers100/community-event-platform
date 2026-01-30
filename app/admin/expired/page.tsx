'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Navigation } from '@/components/Navigation';
import { format } from 'date-fns';
import {
  ArrowLeft,
  Clock,
  AlertTriangle,
  Calendar,
  MapPin,
  Building,
  Globe,
  Loader2,
  History,
  Sparkles,
  Timer
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface Event {
  id: string;
  title: string;
  description: string;
  event_date: string;
  location_type: string;
  city: string | null;
  submitted_at: string;
  expires_at: string;
  profiles: {
    full_name: string;
    email: string;
  };
}

export default function ExpiredEventsPage() {
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/events?status=expired');
      if (response.status === 401) {
        router.push('/login');
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

  const LocationInfo = ({ type, city }: { type: string; city: string | null }) => {
    const iconMap: { [key: string]: React.ReactNode } = {
      online: <Globe className="w-3.5 h-3.5 text-blue-400" />,
      offline: <Building className="w-3.5 h-3.5 text-zinc-400" />,
      hybrid: <MapPin className="w-3.5 h-3.5 text-purple-400" />,
    };
    return (
      <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/5 border border-white/5 mt-1.5 w-fit">
        {iconMap[type]}
        <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">{city || type}</span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center gap-4">
        <Loader2 className="h-10 w-10 text-zinc-500 animate-spin" />
        <span className="text-zinc-500 font-bold uppercase tracking-widest text-xs">Retrieving ghost events...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white selection:bg-zinc-500/30">
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
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-zinc-800 border border-white/5 rounded-full">
                <Timer className="w-3.5 h-3.5 text-zinc-500" />
                <span className="text-[10px] font-black uppercase tracking-wider text-zinc-500">Unreviewed Lost</span>
              </div>
              <h1 className="text-5xl font-black tracking-tighter leading-none">
                Expired <span className="text-zinc-500">Submissions</span>
              </h1>
              <p className="text-zinc-500 font-medium max-w-xl">
                Events that were not reviewed before their scheduled date. {events.length} submission{events.length === 1 ? '' : 's'} lost in time.
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
            <Button onClick={fetchEvents} className="w-full bg-white/5 hover:bg-white/10 text-white rounded-xl">Try Again</Button>
          </Card>
        ) : events.length === 0 ? (
          <Card className="bg-zinc-900/40 backdrop-blur-xl border-white/5 py-24">
            <CardContent className="text-center space-y-6">
              <div className="w-20 h-20 bg-zinc-900 rounded-[32px] flex items-center justify-center mx-auto border border-white/5">
                <History className="w-10 h-10 text-zinc-700" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-white">Archives Clean</h2>
                <p className="text-zinc-500 font-medium mt-1">No expired events currently on record.</p>
              </div>
              <Button onClick={() => router.push('/admin')} className="bg-white/5 hover:bg-white/10 text-white font-black px-8 h-12 rounded-full border border-white/5">Back to Dashboard</Button>
            </CardContent>
          </Card>
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
                      <TableHead className="text-[10px] font-black uppercase tracking-widest text-zinc-500 py-6 pl-8">Event Record</TableHead>
                      <TableHead className="text-[10px] font-black uppercase tracking-widest text-zinc-500 py-6">Host</TableHead>
                      <TableHead className="text-[10px] font-black uppercase tracking-widest text-zinc-500 py-6">Submitted Date</TableHead>
                      <TableHead className="text-[10px] font-black uppercase tracking-widest text-zinc-500 py-6 pr-8">Expired On</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {events.map((event, i) => (
                      <motion.tr
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 + (i * 0.05) }}
                        key={event.id}
                        className="border-white/5 hover:bg-white/[0.02] group transition-colors"
                      >
                        <TableCell className="py-6 pl-8">
                          <div className="max-w-xs space-y-1">
                            <p className="text-white font-black truncate text-lg group-hover:text-zinc-400 transition-colors">{event.title}</p>
                            <LocationInfo type={event.location_type} city={event.city} />
                          </div>
                        </TableCell>
                        <TableCell className="py-6">
                          <div className="space-y-0.5">
                            <p className="text-white text-sm font-bold">{event.profiles.full_name}</p>
                          </div>
                        </TableCell>
                        <TableCell className="py-6 text-zinc-500 font-bold text-xs uppercase tracking-tight">
                          {format(new Date(event.submitted_at), 'MMM dd, yyyy')}
                        </TableCell>
                        <TableCell className="py-6 pr-8">
                          <div className="flex items-center gap-2 text-rose-500/50">
                            <Clock className="w-3.5 h-3.5" />
                            <span className="font-bold text-xs uppercase tracking-tight">
                              {format(new Date(event.expires_at), 'MMM dd, yyyy')}
                            </span>
                          </div>
                        </TableCell>
                      </motion.tr>
                    ))}
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

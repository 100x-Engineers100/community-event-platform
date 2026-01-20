'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
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
  User,
  PartyPopper,
  MessageCircle
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface Registration {
  id: string;
  attendee_name: string;
  attendee_email: string;
  whatsapp_number?: string;
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
        setError(res.status === 404 ? 'Registration not found' : 'Failed to load details');
        return;
      }
      const data = await res.json();
      setRegistration(data.registration);
      setEvent(data.event);
      setError(null);
    } catch (err) {
      setError('Failed to load registration details');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCalendar = () => {
    if (!event) return;
    const eventDate = new Date(event.event_date);
    const startTime = format(eventDate, "yyyyMMdd'T'HHmmss");
    const endTime = format(new Date(eventDate.getTime() + 2 * 60 * 60 * 1000), "yyyyMMdd'T'HHmmss");
    const calendarUrl = new URL('https://calendar.google.com/calendar/render');
    calendarUrl.searchParams.set('action', 'TEMPLATE');
    calendarUrl.searchParams.set('text', event.title);
    calendarUrl.searchParams.set('dates', `${startTime}/${endTime}`);
    calendarUrl.searchParams.set('details', event.description);
    if (event.location_type !== 'offline') {
      calendarUrl.searchParams.set('location', event.meeting_link || 'Online');
    } else if (event.venue_address) {
      calendarUrl.searchParams.set('location', event.venue_address);
    }
    window.open(calendarUrl.toString(), '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-100x-accent-primary animate-spin" />
      </div>
    );
  }

  if (error || !registration || !event) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-zinc-900 border border-zinc-800 rounded-3xl p-8 text-center space-y-6">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
          <h2 className="text-2xl font-bold text-white">{error || 'Registration Not Found'}</h2>
          <Button onClick={() => router.push('/')} className="w-full bg-100x-accent-primary text-black font-bold">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back Home
          </Button>
        </div>
      </div>
    );
  }

  const istDate = toZonedTime(new Date(event.event_date), 'Asia/Kolkata');
  const formattedDate = format(istDate, 'EEEE, MMM do');
  const formattedTime = format(istDate, 'h:mm a');

  return (
    <div className="min-h-screen bg-black text-white selection:bg-100x-accent-primary/30 overflow-x-hidden">
      {/* Background Decor */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-100x-accent-primary/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-100x-accent-primary/5 blur-[120px] rounded-full" />
      </div>

      <div className="relative max-w-4xl mx-auto px-4 py-12 md:py-24 space-y-16">
        {/* Success Header */}
        <div className="text-center space-y-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', damping: 12, stiffness: 200 }}
            className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-100x-accent-primary/20 border-2 border-100x-accent-primary/50 relative"
          >
            <CheckCircle2 className="w-12 h-12 text-100x-accent-primary" />
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="absolute -top-2 -right-2 bg-black border border-zinc-800 p-2 rounded-xl"
            >
              <PartyPopper className="w-6 h-6 text-100x-accent-primary" />
            </motion.div>
          </motion.div>

          <div className="space-y-2">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-6xl font-black tracking-tight"
            >
              Boom! You're <span className="text-100x-accent-primary italic">In.</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-zinc-500 text-lg font-medium"
            >
              Pack your bags (metaphorically). We'll see you at <span className="text-white font-bold">{event.title}</span>!
            </motion.p>
          </div>
        </div>

        {/* The Ticket Card */}
        <motion.div
          initial={{ opacity: 0, rotateX: 20 }}
          animate={{ opacity: 1, rotateX: 0 }}
          transition={{ delay: 0.4 }}
          className="relative perspective-1000"
        >
          <div className="bg-zinc-900/80 backdrop-blur-3xl border border-zinc-800 rounded-[40px] overflow-hidden shadow-2xl relative">
            {/* Cutouts for ticket look */}
            <div className="absolute left-[-15px] top-1/2 -translate-y-1/2 w-8 h-8 bg-black rounded-full border border-zinc-800 z-10 hidden md:block" />
            <div className="absolute right-[-15px] top-1/2 -translate-y-1/2 w-8 h-8 bg-black rounded-full border border-zinc-800 z-10 hidden md:block" />

            <div className="grid md:grid-cols-12">
              {/* Left Side: Event Details */}
              <div className="md:col-span-8 p-8 md:p-12 space-y-10 border-b md:border-b-0 md:border-r border-dashed border-zinc-800">
                <div className="space-y-6">
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-zinc-800 rounded-full text-[10px] font-black uppercase tracking-widest text-zinc-400">
                    Admission Ticket
                  </div>
                  <h2 className="text-3xl font-black leading-tight tracking-tight">{event.title}</h2>
                </div>

                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-wider">Date</p>
                    <p className="font-bold flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-100x-accent-primary" />
                      {formattedDate}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-wider">Time</p>
                    <p className="font-bold flex items-center gap-2">
                      <Clock className="w-4 h-4 text-100x-accent-primary" />
                      {formattedTime} IST
                    </p>
                  </div>
                  <div className="space-y-1 col-span-2">
                    <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-wider">Location</p>
                    <p className="font-bold flex items-center gap-2">
                      {event.location_type === 'online' ? <Globe className="w-4 h-4 text-100x-accent-primary" /> : <MapPin className="w-4 h-4 text-100x-accent-primary" />}
                      {event.location_type === 'online' ? 'Online Experience' : (event.city || 'In-Person Event')}
                    </p>
                  </div>
                </div>

                {/* Secret Link for Online Events */}
                {event.meeting_link && (
                  <motion.div
                    initial={{ scale: 0.95 }}
                    animate={{ scale: 1 }}
                    className="p-6 bg-100x-accent-primary/10 border border-100x-accent-primary/20 rounded-3xl space-y-3"
                  >
                    <p className="text-xs font-bold text-100x-accent-primary uppercase tracking-widest">Joining Credentials</p>
                    <a
                      href={event.meeting_link}
                      target="_blank"
                      className="text-white hover:text-100x-accent-primary transition-colors flex items-center gap-3 font-mono text-sm break-all"
                    >
                      <ExternalLink className="w-4 h-4 flex-shrink-0" />
                      {event.meeting_link}
                    </a>
                  </motion.div>
                )}
              </div>

              {/* Right Side: Guest Details */}
              <div className="md:col-span-4 p-8 md:p-12 bg-zinc-900 flex flex-col justify-between space-y-8">
                <div className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                        <User className="w-5 h-5 text-zinc-400" />
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-[10px] font-bold text-zinc-600 uppercase">Passenger</p>
                        <p className="text-sm font-bold truncate max-w-[120px]">{registration.attendee_name}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                        <Mail className="w-5 h-5 text-zinc-400" />
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-[10px] font-bold text-zinc-600 uppercase">Email</p>
                        <p className="text-sm font-bold truncate max-w-[120px]">{registration.attendee_email}</p>
                      </div>
                    </div>

                    {registration.whatsapp_number && (
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                          <MessageCircle className="w-5 h-5 text-zinc-400" />
                        </div>
                        <div className="space-y-0.5">
                          <p className="text-[10px] font-bold text-zinc-600 uppercase">WhatsApp</p>
                          <p className="text-sm font-bold">{registration.whatsapp_number}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="pt-6 border-t border-zinc-800 text-center space-y-1">
                    <p className="text-[9px] font-black text-zinc-700 uppercase tracking-[0.3em]">Order ID</p>
                    <p className="text-[10px] font-mono text-zinc-500 uppercase">{registration.id.split('-')[0]}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-6 max-w-2xl mx-auto">
          <Button
            onClick={handleAddToCalendar}
            className="flex-1 h-16 bg-white overflow-hidden text-black hover:bg-zinc-200 font-black text-lg rounded-2xl transition-all hover:scale-[1.02] active:scale-[0.98] group relative"
          >
            <Calendar className="w-6 h-6 mr-3 transition-transform group-hover:rotate-12" />
            Add to Calendar
          </Button>

          <Button
            onClick={() => router.push('/')}
            variant="outline"
            className="flex-1 h-16 border-zinc-800 bg-zinc-900/50 text-zinc-400 hover:text-white hover:bg-zinc-900 font-bold text-lg rounded-2xl transition-all"
          >
            Explore More
          </Button>
        </div>

        {/* Footer Note */}
        <p className="text-center text-zinc-600 text-sm font-big">
          Add event to your calendar for future reference or Save the meeting link.
        </p>

        {/* Back navigation */}
        <div className="text-center">
          <Button
            variant="ghost"
            onClick={() => router.push('/')}
            className="text-zinc-500 hover:text-100x-accent-primary transition-colors gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to All Events
          </Button>
        </div>
      </div>

      <style jsx global>{`
        .perspective-1000 {
          perspective: 1000px;
        }
      `}</style>
    </div>
  );
}

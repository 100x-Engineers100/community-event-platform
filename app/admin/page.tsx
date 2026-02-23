'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Navigation } from '@/components/Navigation';
import { format } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';
import {
  AlertTriangle,
  ArrowRight,
  Clock,
  CheckCircle,
  XCircle,
  Archive,
  Users,
  BarChart,
  Eye,
  Hourglass,
  Server,
  Zap,
  LayoutDashboard,
  Sparkles,
  ArrowUpRight,
  PlusCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { cn } from '@/lib/utils';

interface DashboardStats {
  pending: number;
  published: number;
  rejected: number;
  expired: number;
  completed: number;
  totalRegistrations: number;
  recentSubmissions: Array<{
    id: string;
    title: string;
    submitted_at: string;
    profiles: {
      full_name: string;
      email: string;
    };
  }>;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/admin/stats');
        if (response.status === 401) {
          router.push('/login');
          return;
        }
        if (response.status === 403) {
          setError('Access denied - Admin privileges required');
          return;
        }
        if (!response.ok) {
          throw new Error('Failed to fetch stats');
        }
        const data = await response.json();
        setStats(data.stats);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [router]);

  const formatDate = (dateString: string) => {
    const istDate = toZonedTime(new Date(dateString), 'Asia/Kolkata');
    return format(istDate, 'MMM dd, h:mm a');
  };

  const StatCard = ({
    title,
    value,
    icon: Icon,
    color,
    description,
    onClick,
    index,
  }: {
    title: string;
    value: string | number;
    icon: React.ElementType;
    color: string;
    description: string;
    onClick?: () => void;
    index: number;
  }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card
        className={cn(
          "relative overflow-hidden group bg-zinc-900/40 backdrop-blur-xl border-white/5 transition-all duration-500 hover:border-white/20 hover:shadow-2xl hover:shadow-white/5",
          onClick && "cursor-pointer"
        )}
        onClick={onClick}
      >
        {/* Hover Glow Effect */}
        <div className={cn(
          "absolute -right-8 -top-8 w-24 h-24 blur-3xl opacity-0 group-hover:opacity-20 transition-opacity duration-500",
          color.includes('green') ? 'bg-green-500' :
            color.includes('primary') ? 'bg-100x-accent-primary' :
              color.includes('red') ? 'bg-red-500' :
                color.includes('yellow') ? 'bg-yellow-500' : 'bg-white'
        )} />

        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xs font-black uppercase tracking-widest text-zinc-500">{title}</CardTitle>
          <div className={cn("p-2 rounded-xl bg-white/5 border border-white/5 transition-colors group-hover:border-white/10", color)}>
            <Icon className="w-5 h-5" />
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="flex items-baseline gap-2">
            <div className={cn('text-4xl font-black tracking-tighter', color)}>{value}</div>
            {onClick && <ArrowUpRight className="w-4 h-4 text-zinc-700 group-hover:text-white transition-colors" />}
          </div>
          <p className="text-[10px] font-bold text-zinc-600 mt-2 uppercase tracking-wider">{description}</p>
        </CardContent>
      </Card>
    </motion.div>
  );

  const renderContent = () => {
    if (loading) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-3xl bg-zinc-900/50 border border-white/5" />
          ))}
        </div>
      );
    }

    return (
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <StatCard
            index={0}
            title="Pending Review"
            value={stats?.pending || 0}
            icon={Hourglass}
            color="text-100x-accent-primary"
            description="Awaiting approval"
            onClick={() => router.push('/admin/pending')}
          />
          <StatCard
            index={1}
            title="Published"
            value={stats?.published || 0}
            icon={CheckCircle}
            color="text-emerald-400"
            description="Live events"
            onClick={() => router.push('/admin/published')}
          />
          <StatCard
            index={2}
            title="Total Registrations"
            value={stats?.totalRegistrations || 0}
            icon={Users}
            color="text-blue-400"
            description="Across all events"
          />
          <StatCard
            index={3}
            title="Completed Events"
            value={stats?.completed || 0}
            icon={Archive}
            color="text-zinc-400"
            description="Finished events"
            onClick={() => router.push('/admin/completed')}
          />
          <StatCard
            index={4}
            title="Rejected"
            value={stats?.rejected || 0}
            icon={XCircle}
            color="text-rose-400"
            description="Not approved"
            onClick={() => router.push('/admin/rejected')}
          />
          <StatCard
            index={5}
            title="Expired"
            value={stats?.expired || 0}
            icon={Clock}
            color="text-amber-500"
            description="Timed out events"
            onClick={() => router.push('/admin/expired')}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            className="lg:col-span-1"
          >
            <Card className="h-full bg-zinc-900/40 backdrop-blur-xl border-white/5 overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-100x-accent-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <CardHeader>
                <CardTitle className="text-xl font-black flex items-center gap-3">
                  <div className="p-2 bg-100x-accent-primary/10 rounded-xl">
                    <Zap className="w-5 h-5 text-100x-accent-primary" />
                  </div>
                  Quick Actions
                </CardTitle>
                <CardDescription className="text-zinc-500 font-medium">
                  Operational control center.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-4 relative z-10">
                <Button
                  onClick={() => router.push('/create-event')}
                  className="w-full h-14 bg-100x-accent-primary hover:bg-100x-accent-primary/90 text-black font-black rounded-2xl group/btn overflow-hidden relative"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    <PlusCircle className="w-4 h-4" />
                    Create Event
                  </span>
                  <div className="absolute inset-0 bg-white/20 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300" />
                </Button>

                <Button
                  onClick={() => router.push('/admin/pending')}
                  variant="ghost"
                  className="w-full h-14 bg-white/5 hover:bg-white/10 text-white font-bold rounded-2xl border border-white/5 flex items-center justify-between px-6"
                  disabled={!stats?.pending}
                >
                  <div className="flex items-center gap-3">
                    <Hourglass className="w-5 h-5 text-zinc-500" />
                    <span>Review Pending</span>
                    {stats?.pending ? (
                      <span className="px-2 py-0.5 bg-100x-accent-primary/20 text-100x-accent-primary text-xs font-black rounded-full">
                        {stats.pending}
                      </span>
                    ) : null}
                  </div>
                  <ArrowRight className="w-4 h-4 text-zinc-700" />
                </Button>

                <Button
                  onClick={() => router.push('/admin/cron')}
                  variant="ghost"
                  className="w-full h-14 bg-white/5 hover:bg-white/10 text-white font-bold rounded-2xl border border-white/5 flex items-center justify-between px-6"
                >
                  <div className="flex items-center gap-3">
                    <Server className="w-5 h-5 text-zinc-500" />
                    <span>Cron Jobs</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-zinc-700" />
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Recent Submissions */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7 }}
            className="lg:col-span-2"
          >
            <Card className="bg-zinc-900/40 backdrop-blur-xl border-white/5 h-full overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-black flex items-center gap-3">
                    <div className="p-2 bg-blue-500/10 rounded-xl">
                      <BarChart className="w-5 h-5 text-blue-400" />
                    </div>
                    Latest Events
                  </CardTitle>
                  <CardDescription className="text-zinc-500 font-medium pt-1">
                    Fresh submissions awaiting review.
                  </CardDescription>
                </div>
                {stats?.recentSubmissions && stats.recentSubmissions.length > 0 && (
                  <Button variant="ghost" size="sm" className="text-xs font-bold text-zinc-500 hover:text-white" onClick={() => router.push('/admin/pending')}>
                    View All
                  </Button>
                )}
              </CardHeader>
              <CardContent className="pt-4">
                {!stats?.recentSubmissions || stats.recentSubmissions.length === 0 ? (
                  <div className="flex flex-col items-center justify-center text-center text-zinc-600 py-16 px-4">
                    <div className="w-16 h-16 bg-zinc-900 rounded-3xl flex items-center justify-center mb-6 border border-white/5">
                      <Sparkles className="w-8 h-8 text-zinc-700" />
                    </div>
                    <p className="font-black text-white text-lg">Inbox Zero</p>
                    <p className="text-sm font-medium pt-1">No recent submissions to review right now.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {stats.recentSubmissions.map((event, i) => (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.8 + (i * 0.05) }}
                        key={event.id}
                        className="group flex items-center justify-between p-4 bg-white/[0.02] rounded-2xl border border-white/5 hover:border-100x-accent-primary/30 hover:bg-white/[0.04] transition-all cursor-pointer"
                        onClick={() => router.push(`/admin/review/${event.id}`)}
                      >
                        <div className="flex-1 min-w-0 pr-4">
                          <h3 className="text-white font-bold truncate group-hover:text-100x-accent-primary transition-colors">
                            {event.title}
                          </h3>
                          <div className="flex items-center gap-3 mt-1.5">
                            <span className="text-xs font-medium text-zinc-500">by {event.profiles.full_name}</span>
                            <span className="w-1 h-1 bg-zinc-800 rounded-full" />
                            <span className="text-xs font-semibold text-zinc-600">{formatDate(event.submitted_at)}</span>
                          </div>
                        </div>
                        <div className="p-2 bg-zinc-900 rounded-xl border border-white/5 group-hover:border-100x-accent-primary/20 transition-all text-zinc-700 group-hover:text-100x-accent-primary">
                          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    );
  };

  if (error) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full text-center space-y-8 p-12 rounded-[40px] bg-zinc-900/40 backdrop-blur-xl border border-red-500/10 shadow-2xl shadow-red-500/5"
        >
          <div className="w-20 h-20 bg-red-500/10 rounded-3xl flex items-center justify-center mx-auto border border-red-500/20">
            <AlertTriangle className="w-10 h-10 text-red-500" />
          </div>
          <div className="space-y-4">
            <h1 className="text-4xl font-black tracking-tighter text-red-500">Access Denied</h1>
            <p className="text-zinc-500 font-medium leading-relaxed">{error}</p>
          </div>
          <Button
            onClick={() => router.push('/dashboard')}
            className="w-full h-14 bg-100x-accent-primary hover:bg-100x-accent-primary/90 text-black font-black rounded-2xl group"
          >
            Back to Dashboard
            <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white selection:bg-100x-accent-primary/30 relative overflow-hidden">
      {/* Orange Glow Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-orange-500/15 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-orange-600/15 blur-[150px] rounded-full" />
      </div>
      <Navigation showSignIn={false} />

      <main className="container mx-auto px-4 pt-32 pb-16 max-w-7xl relative z-10">
        {/* Header Section */}
        <div className="mb-16 relative">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative z-10 space-y-4"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-zinc-900/50 backdrop-blur-md border border-white/5 rounded-full">
              <LayoutDashboard className="w-3.5 h-3.5 text-100x-accent-primary" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">System Overview</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-none">
              Command <span className="text-transparent bg-clip-text bg-gradient-to-r from-100x-accent-primary to-orange-400">Center</span>
            </h1>

            <p className="text-zinc-500 font-medium max-w-xl text-lg leading-relaxed">
              Unified control panel for managing 100x community bangers and orchestrating event lifecycles.
            </p>
          </motion.div>

          {/* Subtle background element */}
          <div className="absolute -top-32 -left-32 w-64 h-64 bg-100x-accent-primary/5 blur-[120px] rounded-full pointer-events-none" />
        </div>

        {renderContent()}
      </main>
    </div>
  );
}

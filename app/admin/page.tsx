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
} from 'lucide-react';

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
  }: {
    title: string;
    value: string | number;
    icon: React.ElementType;
    color: string;
    description: string;
  }) => (
    <Card className="bg-100x-bg-secondary border-100x-border-default transition-all duration-300 hover:border-100x-accent-primary/50 hover:shadow-2xl hover:shadow-100x-accent-glow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-100x-text-secondary">{title}</CardTitle>

      </CardHeader>
      <CardContent>
        <div className={cn('text-4xl font-bold', color)}>{value}</div>
        <p className="text-xs text-100x-text-muted">{description}</p>
      </CardContent>
    </Card>
  );

  const renderContent = () => {
    if (loading) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="bg-100x-bg-secondary border-100x-border-default">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-2/5 bg-100x-bg-tertiary" />
                <Skeleton className="h-5 w-5 rounded-full bg-100x-bg-tertiary" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-10 w-1/3 bg-100x-bg-tertiary" />
                <Skeleton className="h-3 w-3/5 mt-2 bg-100x-bg-tertiary" />
              </CardContent>
            </Card>
          ))}
        </div>
      );
    }

    return (
      <>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <StatCard
            title="Pending Review"
            value={stats?.pending || 0}
            icon={Hourglass}
            color="text-100x-accent-primary"
            description="Awaiting approval"
          />
          <StatCard
            title="Published"
            value={stats?.published || 0}
            icon={CheckCircle}
            color="text-green-400"
            description="Live events"
          />
          <StatCard
            title="Total Registrations"
            value={stats?.totalRegistrations || 0}
            icon={Users}
            color="text-blue-400"
            description="Across all events"
          />
          <StatCard
            title="Completed Events"
            value={stats?.completed || 0}
            icon={Archive}
            color="text-100x-text-muted"
            description="Finished events"
          />
          <StatCard
            title="Rejected"
            value={stats?.rejected || 0}
            icon={XCircle}
            color="text-red-400"
            description="Not approved"
          />
          <StatCard
            title="Expired"
            value={stats?.expired || 0}
            icon={Clock}
            color="text-yellow-500"
            description="Not reviewed in 7 days"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card className="lg:col-span-1 bg-100x-bg-secondary border-100x-border-default hover:border-100x-accent-primary/50 transition-all duration-300 flex flex-col justify-between">
            <CardHeader>
              <CardTitle className="text-100x-text-primary flex items-center gap-3">
                <Zap className="text-100x-accent-primary" />
                Quick Actions
              </CardTitle>
              <CardDescription className="text-100x-text-secondary pt-2">
                Manage pending events and system processes.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                onClick={() => router.push('/admin/pending')}
                className="w-full bg-100x-accent-primary hover:bg-100x-accent-primary/90 text-black font-bold group"
                disabled={!stats?.pending}
              >
                Review {stats?.pending || 0} Pending Events
                <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
              </Button>
              <Button
                onClick={() => router.push('/admin/cron')}
                variant="outline"
                className="w-full border-100x-border-default hover:bg-100x-bg-tertiary hover:text-100x-text-primary"
              >
                <Server className="w-4 h-4 mr-2" />
                Monitor Cron Jobs
              </Button>
            </CardContent>
          </Card>
          <Card className="lg:col-span-2 bg-100x-bg-secondary border-100x-border-default">
            <CardHeader>
              <CardTitle className="text-100x-text-primary flex items-center gap-3">
                <BarChart className="text-100x-accent-primary" />
                Recent Submissions
              </CardTitle>
              <CardDescription className="text-100x-text-secondary pt-2">
                Latest events submitted for review.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!stats?.recentSubmissions || stats.recentSubmissions.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-center text-100x-text-muted py-10">
                  <Eye className="w-12 h-12 mb-4" />
                  <p className="font-semibold">All clear!</p>
                  <p>No recent submissions to review.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {stats.recentSubmissions.map((event) => (
                    <div
                      key={event.id}
                      className="flex items-center justify-between p-3 bg-100x-bg-tertiary rounded-lg border border-100x-border-default hover:border-100x-accent-primary/50 transition-all cursor-pointer group"
                      onClick={() => router.push(`/admin/review/${event.id}`)}
                    >
                      <div className="flex-1">
                        <h3 className="text-100x-text-primary font-medium group-hover:text-100x-accent-primary transition-colors">
                          {event.title}
                        </h3>
                        <p className="text-sm text-100x-text-muted mt-1">
                          by {event.profiles.full_name} • {formatDate(event.submitted_at)}
                        </p>
                      </div>
                      <ArrowRight className="w-5 h-5 text-100x-text-muted transition-transform group-hover:translate-x-1 group-hover:text-100x-accent-primary" />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </>
    );
  };

  if (error) {
    return (
      <div className="relative min-h-screen bg-100x-bg-primary text-100x-text-primary">

        <Navigation />
        <main className="container relative mx-auto px-4 py-8 max-w-7xl">
          <div className="flex flex-col items-center justify-center min-h-[70vh] text-center">
            <AlertTriangle className="w-16 h-16 text-red-400 mb-6" />
            <h1 className="text-3xl font-bold text-red-400 mb-4">Access Denied</h1>
            <p className="text-100x-text-secondary max-w-md mb-8">{error}</p>
            <Button
              onClick={() => router.push('/dashboard')}
              className="bg-100x-accent-primary hover:bg-100x-accent-primary/90 text-black font-bold group"
            >
              Back to Dashboard
              <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-100x-bg-primary text-100x-text-primary">

      <Navigation showSignIn={false} />
      <main className="container relative mx-auto px-4 pt-24 pb-8 max-w-7xl">
        <div className="mb-12 text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-100x-accent-primary/80 to-100x-accent-primary">
            Admin Command Center
          </h1>
          <p className="text-100x-text-secondary mt-4 max-w-2xl mx-auto">
            Oversee, manage, and analyze all community events from a single, unified dashboard.
          </p>
        </div>
        {renderContent()}
      </main>
    </div>
  );
}

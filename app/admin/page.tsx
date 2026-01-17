'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Navigation } from '@/components/Navigation';
import { format } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';

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

  const StatCard = ({ title, value, description, trend, color }: {
    title: string;
    value: number;
    description: string;
    trend?: string;
    color: 'orange' | 'green' | 'red' | 'gray' | 'blue';
  }) => {
    const colorClasses = {
      orange: 'from-orange-500/20 to-orange-500/5 border-orange-500/30',
      green: 'from-green-500/20 to-green-500/5 border-green-500/30',
      red: 'from-red-500/20 to-red-500/5 border-red-500/30',
      gray: 'from-gray-500/20 to-gray-500/5 border-gray-500/30',
      blue: 'from-blue-500/20 to-blue-500/5 border-blue-500/30'
    };

    const textColor = {
      orange: 'text-orange-400',
      green: 'text-green-400',
      red: 'text-red-400',
      gray: 'text-gray-400',
      blue: 'text-blue-400'
    };

    return (
      <Card className={`bg-gradient-to-br ${colorClasses[color]} border transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-${color}-500/20`}>
        <CardHeader className="pb-3">
          <CardDescription className="text-xs uppercase tracking-wider text-gray-400">
            {title}
          </CardDescription>
          <CardTitle className={`text-4xl font-bold ${textColor[color]}`}>
            {value.toLocaleString()}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-400">{description}</p>
          {trend && (
            <p className="text-xs text-gray-500 mt-1">{trend}</p>
          )}
        </CardContent>
      </Card>
    );
  };

  if (error) {
    return (
      <div className="min-h-screen bg-black">
        <Navigation />
        <main className="container mx-auto px-4 py-8 max-w-7xl">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-red-400 mb-4">Access Denied</h1>
            <p className="text-gray-400">{error}</p>
            <Button
              onClick={() => router.push('/dashboard')}
              className="mt-6 bg-orange-500 hover:bg-orange-600"
            >
              Back to Dashboard
            </Button>
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
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-1 bg-gradient-to-b from-orange-500 to-orange-500/0"></div>
            <h1 className="text-4xl font-bold text-white">Admin Command Center</h1>
          </div>
          <p className="text-gray-400 ml-4">Monitor and manage community events</p>
        </div>

        {loading ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <Card key={i} className="bg-[#1A1A1A] border-[#2A2A2A]">
                  <CardHeader>
                    <Skeleton className="h-4 w-24 bg-gray-700" />
                    <Skeleton className="h-10 w-16 bg-gray-600" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-3 w-full bg-gray-700" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ) : (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <StatCard
                title="Pending Review"
                value={stats?.pending || 0}
                description="Awaiting approval"
                color="orange"
                trend="Requires action"
              />
              <StatCard
                title="Published"
                value={stats?.published || 0}
                description="Live events"
                color="green"
                trend="Active now"
              />
              <StatCard
                title="Total Registrations"
                value={stats?.totalRegistrations || 0}
                description="Across all events"
                color="blue"
              />
              <StatCard
                title="Completed"
                value={stats?.completed || 0}
                description="Past events"
                color="gray"
              />
            </div>

            {/* Secondary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <StatCard
                title="Rejected"
                value={stats?.rejected || 0}
                description="Not approved"
                color="red"
              />
              <StatCard
                title="Expired"
                value={stats?.expired || 0}
                description="Not reviewed in 7 days"
                color="gray"
              />
            </div>

            <Separator className="my-8 bg-[#2A2A2A]" />

            {/* Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <Card className="bg-[#1A1A1A] border-[#2A2A2A] hover:border-orange-500/30 transition-all duration-300">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <span className="inline-block w-2 h-2 bg-orange-500 rounded-full animate-pulse"></span>
                    Review Pending Events
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    {stats?.pending || 0} events awaiting your approval
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    onClick={() => router.push('/admin/pending')}
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium"
                    disabled={!stats?.pending}
                  >
                    {stats?.pending ? 'Start Reviewing' : 'No Pending Events'}
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-[#1A1A1A] border-[#2A2A2A] hover:border-orange-500/30 transition-all duration-300">
                <CardHeader>
                  <CardTitle className="text-white">Monitor Automation</CardTitle>
                  <CardDescription className="text-gray-400">
                    View cron job execution logs
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    onClick={() => router.push('/admin/cron')}
                    variant="outline"
                    className="w-full border-gray-600 hover:bg-[#141414]"
                  >
                    View Cron Logs
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Recent Submissions */}
            <Card className="bg-[#1A1A1A] border-[#2A2A2A]">
              <CardHeader>
                <CardTitle className="text-white">Recent Submissions</CardTitle>
                <CardDescription className="text-gray-400">
                  Latest events submitted for review
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!stats?.recentSubmissions || stats.recentSubmissions.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No recent submissions</p>
                ) : (
                  <div className="space-y-3">
                    {stats.recentSubmissions.map((event) => (
                      <div
                        key={event.id}
                        className="flex items-center justify-between p-4 bg-[#141414] rounded-lg border border-[#2A2A2A] hover:border-orange-500/30 transition-all cursor-pointer group"
                        onClick={() => router.push(`/admin/review/${event.id}`)}
                      >
                        <div className="flex-1">
                          <h3 className="text-white font-medium group-hover:text-orange-400 transition-colors">
                            {event.title}
                          </h3>
                          <p className="text-sm text-gray-400 mt-1">
                            by {event.profiles.full_name} • {formatDate(event.submitted_at)}
                          </p>
                        </div>
                        <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">
                          Pending
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </main>
    </div>
  );
}

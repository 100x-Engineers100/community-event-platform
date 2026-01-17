'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { format } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';
import { Navigation } from '@/components/Navigation';

interface CronLog {
  id: string;
  job_name: string;
  job_type: 'expire_events' | 'complete_events';
  executed_at: string;
  status: 'success' | 'error';
  events_affected: number;
  error_message: string | null;
  execution_time_ms: number;
  triggered_by: string;
}

export default function CronMonitoringPage() {
  const [logs, setLogs] = useState<CronLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'expire_events' | 'complete_events'>('all');

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const url = filter === 'all'
        ? '/api/cron/logs'
        : `/api/cron/logs?job_type=${filter}`;

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error('Failed to fetch logs');
      }

      const data = await response.json();
      setLogs(data.logs || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [filter]);

  const formatDate = (dateString: string) => {
    const istDate = toZonedTime(new Date(dateString), 'Asia/Kolkata');
    return format(istDate, 'MMM dd, yyyy h:mm a');
  };

  const getStatusBadge = (status: 'success' | 'error') => {
    if (status === 'success') {
      return <Badge className="bg-orange-500 hover:bg-orange-600">Success</Badge>;
    }
    return <Badge variant="destructive">Error</Badge>;
  };

  const getJobTypeBadge = (jobType: string) => {
    if (jobType === 'expire_events') {
      return <Badge variant="outline" className="border-orange-500/30 text-orange-400">Expire</Badge>;
    }
    return <Badge variant="outline" className="border-peach-500/30 text-peach-400">Complete</Badge>;
  };

  return (
    <div className="min-h-screen bg-black">
      <Navigation />

      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Cron Job Monitoring</h1>
          <p className="text-gray-400">Track automated event status transitions</p>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="mb-6 flex gap-2">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            onClick={() => setFilter('all')}
            className={filter === 'all' ? 'bg-orange-500 hover:bg-orange-600' : ''}
          >
            All Jobs
          </Button>
          <Button
            variant={filter === 'expire_events' ? 'default' : 'outline'}
            onClick={() => setFilter('expire_events')}
            className={filter === 'expire_events' ? 'bg-orange-500 hover:bg-orange-600' : ''}
          >
            Expiry Jobs
          </Button>
          <Button
            variant={filter === 'complete_events' ? 'default' : 'outline'}
            onClick={() => setFilter('complete_events')}
            className={filter === 'complete_events' ? 'bg-orange-500 hover:bg-orange-600' : ''}
          >
            Completion Jobs
          </Button>
          <Button
            variant="outline"
            onClick={fetchLogs}
            className="ml-auto"
          >
            Refresh
          </Button>
        </div>

        <Card className="bg-[#1A1A1A] border-[#2A2A2A]">
          <CardHeader>
            <CardTitle className="text-white">Execution History</CardTitle>
            <CardDescription className="text-gray-400">
              Last 50 cron job executions
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin h-8 w-8 border-4 border-orange-500 border-t-transparent rounded-full"></div>
              </div>
            ) : logs.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                No cron job executions found
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-[#2A2A2A] hover:bg-[#141414]">
                      <TableHead className="text-gray-300">Job Name</TableHead>
                      <TableHead className="text-gray-300">Type</TableHead>
                      <TableHead className="text-gray-300">Status</TableHead>
                      <TableHead className="text-gray-300">Events Affected</TableHead>
                      <TableHead className="text-gray-300">Execution Time</TableHead>
                      <TableHead className="text-gray-300">Executed At</TableHead>
                      <TableHead className="text-gray-300">Triggered By</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {logs.map((log) => (
                      <TableRow
                        key={log.id}
                        className="border-[#2A2A2A] hover:bg-[#141414] transition-colors"
                      >
                        <TableCell className="text-white font-medium">
                          {log.job_name}
                        </TableCell>
                        <TableCell>{getJobTypeBadge(log.job_type)}</TableCell>
                        <TableCell>{getStatusBadge(log.status)}</TableCell>
                        <TableCell className="text-gray-300">
                          {log.events_affected}
                        </TableCell>
                        <TableCell className="text-gray-300">
                          {log.execution_time_ms}ms
                        </TableCell>
                        <TableCell className="text-gray-300">
                          {formatDate(log.executed_at)}
                        </TableCell>
                        <TableCell className="text-gray-400 text-sm">
                          {log.triggered_by}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-[#1A1A1A] border-[#2A2A2A] mt-6">
          <CardHeader>
            <CardTitle className="text-white">Cron Schedule</CardTitle>
            <CardDescription className="text-gray-400">
              Automated job execution times (IST)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-[#141414] rounded-lg border border-[#2A2A2A]">
              <div>
                <p className="text-white font-medium">Mark Expired Events</p>
                <p className="text-sm text-gray-400">Events not reviewed within 7 days</p>
              </div>
              <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">
                Daily at 1:00 AM IST
              </Badge>
            </div>
            <div className="flex items-center justify-between p-4 bg-[#141414] rounded-lg border border-[#2A2A2A]">
              <div>
                <p className="text-white font-medium">Mark Completed Events</p>
                <p className="text-sm text-gray-400">Published events after event date passes</p>
              </div>
              <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">
                Daily at 2:00 AM IST
              </Badge>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

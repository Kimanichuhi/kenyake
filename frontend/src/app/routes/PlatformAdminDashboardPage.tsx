import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Activity, AlertTriangle, CheckCircle2, Clock, Database, Globe,
  Loader2, Server, Shield, TrendingUp, Users, Wifi, Zap
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import FooterSection from '@/components/FooterSection';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar
} from 'recharts';

// Sample monitoring data
const uptimeData = Array.from({ length: 24 }, (_, i) => ({
  hour: `${i}:00`,
  responseTime: Math.floor(80 + Math.random() * 60),
  requests: Math.floor(200 + Math.random() * 300),
}));

const errorLog = [
  { id: 1, timestamp: '2026-03-09 14:23', type: 'warn', message: 'Slow query on accommodations (>2s)', source: 'database' },
  { id: 2, timestamp: '2026-03-09 12:11', type: 'error', message: 'Edge function timeout: wildlife-intel', source: 'functions' },
  { id: 3, timestamp: '2026-03-09 09:45', type: 'info', message: 'Storage bucket cleanup completed', source: 'storage' },
  { id: 4, timestamp: '2026-03-08 22:30', type: 'warn', message: 'Rate limit approached: 80% of quota', source: 'api' },
  { id: 5, timestamp: '2026-03-08 18:15', type: 'info', message: 'Database migration applied successfully', source: 'database' },
];

export default function PlatformAdminDashboardPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [dbStats, setDbStats] = useState({ tables: 0, totalRows: 0 });
  const [userCount, setUserCount] = useState(0);

  useEffect(() => {
    if (user) fetchStats();
  }, [user]);

  const fetchStats = async () => {
    // Get some real counts
    const [
      { count: expCount },
      { count: accCount },
      { count: guideCount },
      { count: communityCount },
      { count: eventCount },
    ] = await Promise.all([
      supabase.from('experiences').select('*', { count: 'exact', head: true }),
      supabase.from('accommodations').select('*', { count: 'exact', head: true }),
      supabase.from('guides').select('*', { count: 'exact', head: true }),
      supabase.from('communities').select('*', { count: 'exact', head: true }),
      supabase.from('community_events').select('*', { count: 'exact', head: true }),
    ]);

    setDbStats({
      tables: 35,
      totalRows: (expCount || 0) + (accCount || 0) + (guideCount || 0) + (communityCount || 0) + (eventCount || 0),
    });
    setLoading(false);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-32 text-center container mx-auto px-4">
          <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h1 className="font-serif text-2xl font-bold text-foreground mb-2">Sign In Required</h1>
          <Button onClick={() => window.location.href = '/auth'} className="rounded-full">Sign In</Button>
        </div>
        <FooterSection />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-32 flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-7xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center gap-3 mb-2">
              <Server className="h-7 w-7 text-primary" />
              <h1 className="font-serif text-3xl font-bold text-foreground">Platform Admin</h1>
              <Badge className="bg-primary text-primary-foreground">Live</Badge>
            </div>
            <p className="text-muted-foreground mb-8">System health, monitoring, and platform-wide analytics</p>
          </motion.div>

          {/* Health Status */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            {[
              { label: 'API', status: 'healthy', icon: Globe },
              { label: 'Database', status: 'healthy', icon: Database },
              { label: 'Functions', status: 'warning', icon: Zap },
              { label: 'Storage', status: 'healthy', icon: Server },
              { label: 'Auth', status: 'healthy', icon: Shield },
            ].map(({ label, status, icon: Icon }) => (
              <Card key={label}>
                <CardContent className="p-3 flex items-center gap-3">
                  <Icon className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">{label}</p>
                    <div className="flex items-center gap-1">
                      {status === 'healthy' ? (
                        <CheckCircle2 className="h-3 w-3 text-primary" />
                      ) : (
                        <AlertTriangle className="h-3 w-3 text-secondary" />
                      )}
                      <span className="text-xs text-muted-foreground capitalize">{status}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Database Records', value: dbStats.totalRows.toLocaleString(), icon: Database, color: 'text-primary' },
              { label: 'Tables', value: dbStats.tables, icon: Activity, color: 'text-accent' },
              { label: 'Avg Response', value: '124ms', icon: Clock, color: 'text-secondary' },
              { label: 'Uptime', value: '99.97%', icon: TrendingUp, color: 'text-primary' },
            ].map(({ label, value, icon: Icon, color }) => (
              <Card key={label}>
                <CardContent className="p-4">
                  <Icon className={`h-5 w-5 ${color} mb-2`} />
                  <div className="text-2xl font-serif font-bold text-foreground">{value}</div>
                  <div className="text-xs text-muted-foreground">{label}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Tabs defaultValue="performance">
            <TabsList className="mb-6">
              <TabsTrigger value="performance">Performance</TabsTrigger>
              <TabsTrigger value="errors">Error Log</TabsTrigger>
              <TabsTrigger value="resources">Resources</TabsTrigger>
            </TabsList>

            <TabsContent value="performance">
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Response Time (ms) — Last 24h</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={280}>
                      <LineChart data={uptimeData}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                        <XAxis dataKey="hour" className="text-xs" interval={3} />
                        <YAxis className="text-xs" />
                        <Tooltip />
                        <Line type="monotone" dataKey="responseTime" stroke="hsl(145 35% 28%)" strokeWidth={2} dot={false} name="Response Time" />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Requests per Hour — Last 24h</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={280}>
                      <BarChart data={uptimeData}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                        <XAxis dataKey="hour" className="text-xs" interval={3} />
                        <YAxis className="text-xs" />
                        <Tooltip />
                        <Bar dataKey="requests" fill="hsl(38 55% 55%)" radius={[2, 2, 0, 0]} name="Requests" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="errors">
              <Card>
                <CardContent className="p-6">
                  <div className="space-y-3">
                    {errorLog.map(entry => (
                      <div key={entry.id} className="flex items-start gap-3 p-3 rounded-lg border border-border">
                        {entry.type === 'error' ? (
                          <AlertTriangle className="h-4 w-4 text-destructive mt-0.5" />
                        ) : entry.type === 'warn' ? (
                          <AlertTriangle className="h-4 w-4 text-secondary mt-0.5" />
                        ) : (
                          <CheckCircle2 className="h-4 w-4 text-primary mt-0.5" />
                        )}
                        <div className="flex-1">
                          <p className="text-sm font-medium">{entry.message}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-muted-foreground">{entry.timestamp}</span>
                            <Badge variant="outline" className="text-xs">{entry.source}</Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="resources">
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader><CardTitle>Database Usage</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-muted-foreground">Storage</span>
                        <span className="font-medium">45 MB / 500 MB</span>
                      </div>
                      <Progress value={9} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-muted-foreground">Connections</span>
                        <span className="font-medium">12 / 60</span>
                      </div>
                      <Progress value={20} className="h-2" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader><CardTitle>Edge Functions</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-muted-foreground">Invocations (today)</span>
                        <span className="font-medium">1,240 / 500K</span>
                      </div>
                      <Progress value={0.25} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-muted-foreground">Active functions</span>
                        <span className="font-medium">3</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      {['trip-assistant', 'wildlife-intel', 'nearby-discover'].map(fn => (
                        <div key={fn} className="flex items-center justify-between p-2 rounded border border-border">
                          <span className="text-sm font-mono">{fn}</span>
                          <Badge variant="outline" className="text-xs text-primary">Active</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader><CardTitle>Storage Buckets</CardTitle></CardHeader>
                  <CardContent className="space-y-2">
                    {[
                      { name: 'community-media', public: true, files: 24 },
                      { name: 'review-media', public: true, files: 8 },
                    ].map(bucket => (
                      <div key={bucket.name} className="flex items-center justify-between p-2 rounded border border-border">
                        <div>
                          <span className="text-sm font-mono">{bucket.name}</span>
                          <p className="text-xs text-muted-foreground">{bucket.files} files</p>
                        </div>
                        <Badge variant={bucket.public ? 'default' : 'secondary'} className="text-xs">
                          {bucket.public ? 'Public' : 'Private'}
                        </Badge>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader><CardTitle>Authentication</CardTitle></CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Auth provider</span>
                      <span className="font-medium text-sm">Email/Password</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Email confirm</span>
                      <Badge variant="outline" className="text-xs">Required</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Role system</span>
                      <Badge variant="outline" className="text-xs text-primary">Active</Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <FooterSection />
    </div>
  );
}

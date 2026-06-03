import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3, Globe, Loader2, MapPin, Shield, TrendingDown,
  TrendingUp, Users, DollarSign, Activity, Calendar
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import FooterSection from '@/components/FooterSection';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';

// Sample data for analytics
const monthlyVisitors = [
  { month: 'Jan', domestic: 12400, international: 4200 },
  { month: 'Feb', domestic: 11800, international: 3900 },
  { month: 'Mar', domestic: 14200, international: 5100 },
  { month: 'Apr', domestic: 15600, international: 6300 },
  { month: 'May', domestic: 13100, international: 4800 },
  { month: 'Jun', domestic: 16800, international: 7200 },
  { month: 'Jul', domestic: 22400, international: 11500 },
  { month: 'Aug', domestic: 24100, international: 13200 },
  { month: 'Sep', domestic: 19800, international: 9400 },
  { month: 'Oct', domestic: 21300, international: 10100 },
  { month: 'Nov', domestic: 17600, international: 7800 },
  { month: 'Dec', domestic: 20100, international: 9600 },
];

const countyRevenue = [
  { county: 'Narok', revenue: 2400 },
  { county: 'Mombasa', revenue: 1800 },
  { county: 'Kwale', revenue: 1200 },
  { county: 'Kajiado', revenue: 950 },
  { county: 'Lamu', revenue: 780 },
  { county: 'Nakuru', revenue: 720 },
  { county: 'Nyeri', revenue: 540 },
  { county: 'Taita Taveta', revenue: 480 },
];

const touristOrigins = [
  { name: 'Kenya (Domestic)', value: 45 },
  { name: 'Europe', value: 22 },
  { name: 'North America', value: 15 },
  { name: 'Asia', value: 10 },
  { name: 'Africa (Other)', value: 8 },
];

const bookingTrends = [
  { week: 'W1', bookings: 340, cancellations: 18 },
  { week: 'W2', bookings: 420, cancellations: 22 },
  { week: 'W3', bookings: 380, cancellations: 15 },
  { week: 'W4', bookings: 510, cancellations: 28 },
  { week: 'W5', bookings: 460, cancellations: 20 },
  { week: 'W6', bookings: 530, cancellations: 25 },
  { week: 'W7', bookings: 610, cancellations: 30 },
  { week: 'W8', bookings: 580, cancellations: 22 },
];

const CHART_COLORS = ['hsl(145 35% 28%)', 'hsl(38 55% 55%)', 'hsl(20 70% 52%)', 'hsl(200 50% 45%)', 'hsl(100 25% 45%)'];

const COUNTIES = [
  'All Counties', 'Narok', 'Mombasa', 'Kwale', 'Kajiado', 'Lamu', 'Nakuru', 'Nyeri', 'Taita Taveta',
];

export default function CountyAnalyticsDashboardPage() {
  const { user } = useAuth();
  const [selectedCounty, setSelectedCounty] = useState('All Counties');
  const [selectedPeriod, setSelectedPeriod] = useState('2025');

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

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-7xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <Globe className="h-7 w-7 text-primary" />
                  <h1 className="font-serif text-3xl font-bold text-foreground">Tourism Analytics</h1>
                </div>
                <p className="text-muted-foreground">County-level tourism data and economic impact reports</p>
              </div>
              <div className="flex gap-3">
                <Select value={selectedCounty} onValueChange={setSelectedCounty}>
                  <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {COUNTIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                  <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2025">2025</SelectItem>
                    <SelectItem value="2024">2024</SelectItem>
                    <SelectItem value="2023">2023</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </motion.div>

          {/* KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Total Visitors', value: '198,400', change: '+12%', icon: Users, up: true },
              { label: 'Tourism Revenue', value: 'KES 8.9B', change: '+8%', icon: DollarSign, up: true },
              { label: 'Active Bookings', value: '3,840', change: '+15%', icon: Calendar, up: true },
              { label: 'Avg Stay Duration', value: '4.2 days', change: '-3%', icon: Activity, up: false },
            ].map(({ label, value, change, icon: Icon, up }) => (
              <Card key={label}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Icon className="h-5 w-5 text-primary" />
                    <Badge variant="outline" className={`text-xs ${up ? 'text-primary' : 'text-destructive'}`}>
                      {up ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                      {change}
                    </Badge>
                  </div>
                  <div className="text-2xl font-serif font-bold text-foreground">{value}</div>
                  <div className="text-xs text-muted-foreground">{label}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Tabs defaultValue="visitors">
            <TabsList className="mb-6">
              <TabsTrigger value="visitors">Visitor Flow</TabsTrigger>
              <TabsTrigger value="revenue">Economic Impact</TabsTrigger>
              <TabsTrigger value="bookings">Booking Trends</TabsTrigger>
              <TabsTrigger value="demographics">Demographics</TabsTrigger>
            </TabsList>

            <TabsContent value="visitors">
              <Card>
                <CardHeader>
                  <CardTitle>Monthly Visitor Flow — Domestic vs International</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={360}>
                    <AreaChart data={monthlyVisitors}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis dataKey="month" className="text-xs" />
                      <YAxis className="text-xs" />
                      <Tooltip />
                      <Area type="monotone" dataKey="domestic" stackId="1" stroke="hsl(145 35% 28%)" fill="hsl(145 35% 28% / 0.3)" name="Domestic" />
                      <Area type="monotone" dataKey="international" stackId="1" stroke="hsl(38 55% 55%)" fill="hsl(38 55% 55% / 0.3)" name="International" />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="revenue">
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Revenue by County (M KES)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={320}>
                      <BarChart data={countyRevenue} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                        <XAxis type="number" className="text-xs" />
                        <YAxis dataKey="county" type="category" width={80} className="text-xs" />
                        <Tooltip />
                        <Bar dataKey="revenue" fill="hsl(145 35% 28%)" radius={[0, 4, 4, 0]} name="Revenue (M KES)" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Economic Impact Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {[
                      { label: 'Direct Employment', value: '24,500 jobs', change: '+8%' },
                      { label: 'Community Revenue Share', value: 'KES 1.2B', change: '+15%' },
                      { label: 'Conservation Funding', value: 'KES 340M', change: '+22%' },
                      { label: 'Infrastructure Investment', value: 'KES 560M', change: '+5%' },
                      { label: 'Schools Supported', value: '142', change: '+12' },
                      { label: 'Hectares Conserved', value: '45,200', change: '+2,100' },
                    ].map(({ label, value, change }) => (
                      <div key={label} className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">{label}</span>
                        <div className="text-right">
                          <span className="font-bold text-sm">{value}</span>
                          <Badge variant="outline" className="ml-2 text-xs text-primary">{change}</Badge>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="bookings">
              <Card>
                <CardHeader>
                  <CardTitle>Weekly Booking Trends</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={360}>
                    <LineChart data={bookingTrends}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis dataKey="week" className="text-xs" />
                      <YAxis className="text-xs" />
                      <Tooltip />
                      <Line type="monotone" dataKey="bookings" stroke="hsl(145 35% 28%)" strokeWidth={2} name="Bookings" />
                      <Line type="monotone" dataKey="cancellations" stroke="hsl(0 84% 60%)" strokeWidth={2} name="Cancellations" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="demographics">
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Tourist Origins</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie data={touristOrigins} cx="50%" cy="50%" outerRadius={100} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                          {touristOrigins.map((_, i) => (
                            <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Behavioral Insights</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {[
                      { label: 'Most popular destination', value: 'Masai Mara' },
                      { label: 'Peak season', value: 'Jul–Aug (Migration)' },
                      { label: 'Avg booking lead time', value: '18 days' },
                      { label: 'Top experience category', value: 'Wildlife Safari' },
                      { label: 'Mobile bookings', value: '72%' },
                      { label: 'Return visitor rate', value: '34%' },
                      { label: 'Avg spend per trip', value: 'KES 45,200' },
                    ].map(({ label, value }) => (
                      <div key={label} className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">{label}</span>
                        <span className="font-bold text-sm">{value}</span>
                      </div>
                    ))}
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

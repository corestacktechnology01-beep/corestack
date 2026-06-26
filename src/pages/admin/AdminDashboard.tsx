import { useState, useEffect } from 'react';
import { supabase } from '@/db/supabase';
import { Users, Briefcase, FolderKanban, UserCheck, MessageSquare, Mail, TrendingUp, Activity } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts';

interface Metrics {
  leads: number;
  clients: number;
  projects: number;
  subscribers: number;
  applications: number;
  contacts: number;
}

const METRIC_CARDS = (m: Metrics) => [
  { label: 'Total Leads', value: m.leads, icon: UserCheck, color: 'text-orange-400', bg: 'bg-orange-500/10', trend: '+12%' },
  { label: 'Active Clients', value: m.clients, icon: Briefcase, color: 'text-blue-400', bg: 'bg-blue-500/10', trend: '+5%' },
  { label: 'Projects', value: m.projects, icon: FolderKanban, color: 'text-purple-400', bg: 'bg-purple-500/10', trend: '+8%' },
  { label: 'Newsletter', value: m.subscribers, icon: Mail, color: 'text-green-400', bg: 'bg-green-500/10', trend: '+23%' },
  { label: 'Applications', value: m.applications, icon: Users, color: 'text-cyan-400', bg: 'bg-cyan-500/10', trend: '+15%' },
  { label: 'Messages', value: m.contacts, icon: MessageSquare, color: 'text-pink-400', bg: 'bg-pink-500/10', trend: '+3%' },
];

const MONTHLY_DATA = [
  { month: 'Jan', leads: 12, projects: 3, revenue: 24000 },
  { month: 'Feb', leads: 19, projects: 5, revenue: 38000 },
  { month: 'Mar', leads: 15, projects: 4, revenue: 31000 },
  { month: 'Apr', leads: 28, projects: 7, revenue: 52000 },
  { month: 'May', leads: 24, projects: 6, revenue: 47000 },
  { month: 'Jun', leads: 35, projects: 9, revenue: 68000 },
  { month: 'Jul', leads: 42, projects: 11, revenue: 79000 },
  { month: 'Aug', leads: 38, projects: 8, revenue: 71000 },
  { month: 'Sep', leads: 51, projects: 13, revenue: 92000 },
  { month: 'Oct', leads: 47, projects: 10, revenue: 85000 },
  { month: 'Nov', leads: 56, projects: 14, revenue: 103000 },
  { month: 'Dec', leads: 63, projects: 16, revenue: 118000 },
];

interface Lead { id: string; full_name: string; email: string; status: string; created_at: string; }
interface ActivityLog { id: string; action: string; entity_type: string | null; created_at: string; }

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState<Metrics>({ leads: 0, clients: 0, projects: 0, subscribers: 0, applications: 0, contacts: 0 });
  const [recentLeads, setRecentLeads] = useState<Lead[]>([]);
  const [recentActivity, setRecentActivity] = useState<ActivityLog[]>([]);

  useEffect(() => {
    const fetchMetrics = async () => {
      const [leads, clients, projects, subscribers, applications] = await Promise.all([
        supabase.from('leads').select('id', { count: 'exact', head: true }),
        supabase.from('clients').select('id', { count: 'exact', head: true }),
        supabase.from('projects').select('id', { count: 'exact', head: true }),
        supabase.from('newsletter_subscribers').select('id', { count: 'exact', head: true }).eq('status', 'active'),
        supabase.from('job_applications').select('id', { count: 'exact', head: true }),
      ]);
      setMetrics({
        leads: leads.count || 0,
        clients: clients.count || 0,
        projects: projects.count || 0,
        subscribers: subscribers.count || 0,
        applications: applications.count || 0,
        contacts: 0,
      });
    };

    const fetchRecent = async () => {
      const [leadsRes, activityRes] = await Promise.all([
        supabase.from('leads').select('id,full_name,email,status,created_at').order('created_at', { ascending: false }).limit(5),
        supabase.from('activity_logs').select('id,action,entity_type,created_at').order('created_at', { ascending: false }).limit(8),
      ]);
      if (leadsRes.data) setRecentLeads(leadsRes.data);
      if (activityRes.data) setRecentActivity(activityRes.data);
    };

    fetchMetrics();
    fetchRecent();
  }, []);

  const STATUS_COLORS: Record<string, string> = {
    new: 'bg-blue-500/20 text-blue-400',
    contacted: 'bg-yellow-500/20 text-yellow-400',
    qualified: 'bg-green-500/20 text-green-400',
    converted: 'bg-purple-500/20 text-purple-400',
    lost: 'bg-red-500/20 text-red-400',
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">Welcome back! Here's what's happening.</p>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        {METRIC_CARDS(metrics).map(card => (
          <div key={card.label} className="p-4 rounded-xl border border-border bg-card h-full">
            <div className={`w-9 h-9 rounded-lg ${card.bg} flex items-center justify-center mb-3`}>
              <card.icon className={`w-4 h-4 ${card.color}`} />
            </div>
            <div className="text-2xl font-display font-bold text-foreground">{card.value}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{card.label}</div>
            <div className="flex items-center gap-1 mt-1">
              <TrendingUp className="w-3 h-3 text-green-400" />
              <span className="text-xs text-green-400">{card.trend}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="p-5 rounded-xl border border-border bg-card">
          <h3 className="font-display font-semibold text-foreground mb-4">Monthly Leads & Projects</h3>
          <div className="w-full min-w-0 overflow-hidden" style={{ height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={MONTHLY_DATA} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                <Tooltip
                  contentStyle={{ background: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }}
                  labelStyle={{ color: 'hsl(var(--foreground))' }}
                />
                <Legend layout="horizontal" wrapperStyle={{ paddingTop: 8 }} />
                <Bar dataKey="leads" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Leads" />
                <Bar dataKey="projects" fill="hsl(217 50% 50%)" radius={[4, 4, 0, 0]} name="Projects" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="p-5 rounded-xl border border-border bg-card">
          <h3 className="font-display font-semibold text-foreground mb-4">Revenue Trend ($)</h3>
          <div className="w-full min-w-0 overflow-hidden" style={{ height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={MONTHLY_DATA} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
                <Tooltip
                  contentStyle={{ background: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }}
                  formatter={(v: number) => [`$${v.toLocaleString()}`, 'Revenue']}
                />
                <Line type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ fill: 'hsl(var(--primary))', r: 3 }} name="Revenue" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottom panels */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent leads */}
        <div className="rounded-xl border border-border bg-card">
          <div className="p-5 border-b border-border">
            <h3 className="font-display font-semibold text-foreground">Recent Leads</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-max">
              <thead><tr className="border-b border-border">{['Name', 'Email', 'Status'].map(h => <th key={h} className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground whitespace-nowrap">{h}</th>)}</tr></thead>
              <tbody>
                {recentLeads.length === 0 ? (
                  <tr><td colSpan={3} className="px-4 py-8 text-center text-sm text-muted-foreground">No leads yet</td></tr>
                ) : recentLeads.map(lead => (
                  <tr key={lead.id} className="border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 text-sm text-foreground font-medium whitespace-nowrap">{lead.full_name}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground whitespace-nowrap">{lead.email}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${STATUS_COLORS[lead.status] || 'bg-muted text-muted-foreground'}`}>
                        {lead.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Activity log */}
        <div className="rounded-xl border border-border bg-card">
          <div className="p-5 border-b border-border">
            <h3 className="font-display font-semibold text-foreground">Recent Activity</h3>
          </div>
          <div className="p-3 space-y-1">
            {recentActivity.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">No activity recorded yet</p>
            ) : recentActivity.map(log => (
              <div key={log.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/30 transition-colors">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Activity className="w-3.5 h-3.5 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm text-foreground font-medium capitalize">{log.action.replace(/_/g, ' ')}</div>
                  {log.entity_type && <div className="text-xs text-muted-foreground capitalize">{log.entity_type}</div>}
                </div>
                <div className="text-xs text-muted-foreground whitespace-nowrap shrink-0">
                  {new Date(log.created_at).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

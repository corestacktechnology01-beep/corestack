import { useState, useEffect } from 'react';
import { supabase } from '@/db/supabase';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  Search, Download, RefreshCw, Eye, MoreHorizontal, CheckCircle,
  Clock, AlertCircle, XCircle, Rocket, Filter,
} from 'lucide-react';
import { toast } from 'sonner';

interface ProjectRequest {
  id: string;
  project_id: string;
  full_name: string;
  company_name: string | null;
  email: string;
  phone: string | null;
  project_name: string;
  project_type: string | null;
  industry: string | null;
  technologies: string[] | null;
  features: string | null;
  budget: string | null;
  deadline: string | null;
  reference_website: string | null;
  additional_notes: string | null;
  document_url: string | null;
  logo_url: string | null;
  status: string;
  created_at: string;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ComponentType<{ className?: string }> }> = {
  new: { label: 'New', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20', icon: AlertCircle },
  reviewing: { label: 'Reviewing', color: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20', icon: Clock },
  proposal_sent: { label: 'Proposal Sent', color: 'bg-purple-500/10 text-purple-400 border-purple-500/20', icon: Rocket },
  in_progress: { label: 'In Progress', color: 'bg-primary/10 text-primary border-primary/20', icon: Clock },
  completed: { label: 'Completed', color: 'bg-green-500/10 text-green-400 border-green-500/20', icon: CheckCircle },
  rejected: { label: 'Rejected', color: 'bg-red-500/10 text-red-400 border-red-500/20', icon: XCircle },
};

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.new;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${cfg.color}`}>
      <cfg.icon className="w-3 h-3" /> {cfg.label}
    </span>
  );
}

export default function ProjectRequestsPage() {
  const [requests, setRequests] = useState<ProjectRequest[]>([]);
  const [filtered, setFiltered] = useState<ProjectRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selected, setSelected] = useState<ProjectRequest | null>(null);

  const fetchData = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('project_requests')
      .select('*')
      .order('created_at', { ascending: false });
    setRequests(Array.isArray(data) ? data : []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  useEffect(() => {
    let list = [...requests];
    if (statusFilter !== 'all') list = list.filter(r => r.status === statusFilter);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(r =>
        r.full_name.toLowerCase().includes(q) ||
        r.email.toLowerCase().includes(q) ||
        r.project_name.toLowerCase().includes(q) ||
        (r.company_name || '').toLowerCase().includes(q) ||
        (r.project_id || '').toLowerCase().includes(q)
      );
    }
    setFiltered(list);
  }, [requests, search, statusFilter]);

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from('project_requests').update({ status }).eq('id', id);
    if (error) { toast.error('Update failed'); return; }
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status } : r));
    if (selected?.id === id) setSelected(prev => prev ? { ...prev, status } : null);
    toast.success('Status updated');
  };

  const exportCSV = () => {
    const headers = ['Project ID', 'Name', 'Company', 'Email', 'Project Name', 'Type', 'Budget', 'Deadline', 'Status', 'Date'];
    const rows = filtered.map(r => [
      r.project_id, r.full_name, r.company_name || '', r.email,
      r.project_name, r.project_type || '', r.budget || '',
      r.deadline || '', r.status, new Date(r.created_at).toLocaleDateString(),
    ]);
    const csv = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(',')).join('\n');
    const a = document.createElement('a');
    a.href = 'data:text/csv,' + encodeURIComponent(csv);
    a.download = `project-requests-${Date.now()}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground flex items-center gap-2">
            <Rocket className="w-6 h-6 text-primary" /> Project Requests
          </h1>
          <p className="text-muted-foreground text-sm mt-1">Manage incoming project enquiries and proposals</p>
        </div>
        <div className="flex gap-2 shrink-0">
          <Button variant="outline" size="sm" onClick={fetchData} className="gap-1.5">
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={exportCSV} className="gap-1.5">
            <Download className="w-3.5 h-3.5" /> Export CSV
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total', value: requests.length, color: 'text-foreground' },
          { label: 'New', value: requests.filter(r => r.status === 'new').length, color: 'text-blue-400' },
          { label: 'In Progress', value: requests.filter(r => r.status === 'in_progress').length, color: 'text-primary' },
          { label: 'Completed', value: requests.filter(r => r.status === 'completed').length, color: 'text-green-400' },
        ].map(s => (
          <div key={s.label} className="p-4 rounded-xl border border-border bg-card">
            <div className={`text-2xl font-display font-bold ${s.color}`}>{s.value}</div>
            <div className="text-xs text-muted-foreground">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search by name, email, project, or ID…" className="pl-9"
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-44">
            <Filter className="w-3.5 h-3.5 mr-2 text-muted-foreground" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {Object.entries(STATUS_CONFIG).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border bg-card overflow-x-auto">
        <table className="w-full min-w-[800px]">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              {['Project ID', 'Contact', 'Project', 'Type', 'Budget', 'Status', 'Date', 'Actions'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-b border-border last:border-0">
                  {Array.from({ length: 8 }).map((_, j) => (
                    <td key={j} className="px-4 py-3">
                      <div className="h-4 rounded bg-muted animate-pulse" />
                    </td>
                  ))}
                </tr>
              ))
            ) : filtered.length === 0 ? (
              <tr><td colSpan={8} className="px-4 py-12 text-center text-muted-foreground text-sm">
                No project requests found
              </td></tr>
            ) : filtered.map(req => (
              <tr key={req.id} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                <td className="px-4 py-3 font-mono text-xs text-primary whitespace-nowrap">{req.project_id}</td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="text-sm font-medium text-foreground">{req.full_name}</div>
                  <div className="text-xs text-muted-foreground">{req.email}</div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="text-sm text-foreground max-w-[180px] truncate">{req.project_name}</div>
                  {req.company_name && <div className="text-xs text-muted-foreground">{req.company_name}</div>}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className="text-xs text-muted-foreground">{req.project_type || '—'}</span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className="text-xs text-foreground">{req.budget || '—'}</span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap"><StatusBadge status={req.status} /></td>
                <td className="px-4 py-3 whitespace-nowrap text-xs text-muted-foreground">
                  {new Date(req.created_at).toLocaleDateString()}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="flex items-center gap-1.5">
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => setSelected(req)}>
                      <Eye className="w-3.5 h-3.5" />
                    </Button>
                    <Select value={req.status} onValueChange={v => updateStatus(req.id, v)}>
                      <SelectTrigger className="h-7 w-7 p-0 border-0 bg-transparent [&>svg]:hidden">
                        <MoreHorizontal className="w-3.5 h-3.5" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(STATUS_CONFIG).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-muted-foreground">{filtered.length} of {requests.length} requests</p>

      {/* Detail modal */}
      <Dialog open={!!selected} onOpenChange={v => !v && setSelected(null)}>
        <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-2xl max-h-[90dvh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Rocket className="w-5 h-5 text-primary" />
              {selected?.project_name}
            </DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4 text-sm">
              <div className="flex flex-wrap gap-2 items-center">
                <span className="font-mono text-xs text-primary bg-primary/10 px-2 py-1 rounded">{selected.project_id}</span>
                <StatusBadge status={selected.status} />
                <span className="text-xs text-muted-foreground">{new Date(selected.created_at).toLocaleString()}</span>
              </div>
              {[
                { title: 'Contact Details', rows: [['Name', selected.full_name], ['Company', selected.company_name || '—'], ['Email', selected.email], ['Phone', selected.phone || '—']] },
                { title: 'Project Details', rows: [['Type', selected.project_type || '—'], ['Industry', selected.industry || '—'], ['Budget', selected.budget || '—'], ['Deadline', selected.deadline || '—']] },
              ].map(sec => (
                <div key={sec.title} className="rounded-xl border border-border overflow-hidden">
                  <div className="px-4 py-2 bg-muted/30 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{sec.title}</div>
                  <div className="grid grid-cols-2 divide-x divide-border">
                    {sec.rows.map(([k, v]) => (
                      <div key={k} className="px-4 py-2.5 border-b border-border last:border-0">
                        <div className="text-xs text-muted-foreground">{k}</div>
                        <div className="text-sm text-foreground mt-0.5">{v}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              {selected.technologies && selected.technologies.length > 0 && (
                <div>
                  <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Technologies</div>
                  <div className="flex flex-wrap gap-1">
                    {selected.technologies.map(t => <Badge key={t} variant="secondary" className="text-xs">{t}</Badge>)}
                  </div>
                </div>
              )}
              {selected.features && (
                <div>
                  <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Key Features</div>
                  <p className="text-sm text-foreground bg-muted/30 rounded-lg p-3 whitespace-pre-wrap">{selected.features}</p>
                </div>
              )}
              {selected.additional_notes && (
                <div>
                  <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Additional Notes</div>
                  <p className="text-sm text-foreground bg-muted/30 rounded-lg p-3 whitespace-pre-wrap">{selected.additional_notes}</p>
                </div>
              )}
              <div className="flex gap-2 pt-2">
                <div className="flex-1 space-y-1">
                  <Label>Update Status</Label>
                  <Select value={selected.status} onValueChange={v => updateStatus(selected.id, v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(STATUS_CONFIG).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <div className="text-xs font-normal text-muted-foreground mb-1.5">{children}</div>;
}

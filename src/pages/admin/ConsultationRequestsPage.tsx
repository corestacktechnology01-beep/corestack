import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/db/supabase';
import { AdminTable } from '@/components/admin/AdminTable';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Eye, Pencil, FileDown } from 'lucide-react';

interface ConsultationRequest {
  id: string;
  application_id: string;
  full_name: string;
  company_name: string | null;
  email: string;
  phone: string | null;
  service_interested: string | null;
  preferred_date: string | null;
  preferred_time: string | null;
  meeting_mode: string;
  project_budget: string | null;
  project_description: string | null;
  status: string;
  notes: string | null;
  created_at: string;
}

type Status = 'new' | 'contacted' | 'scheduled' | 'completed' | 'cancelled';

const STATUS_COLORS: Record<string, string> = {
  new: 'bg-blue-500/20 text-blue-400',
  contacted: 'bg-yellow-500/20 text-yellow-400',
  scheduled: 'bg-purple-500/20 text-purple-400',
  completed: 'bg-green-500/20 text-green-400',
  cancelled: 'bg-red-500/20 text-red-400',
};
const STATUS_OPTS: Status[] = ['new', 'contacted', 'scheduled', 'completed', 'cancelled'];

export default function ConsultationRequestsPage() {
  const [items, setItems] = useState<ConsultationRequest[]>([]);
  const [filtered, setFiltered] = useState<ConsultationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<ConsultationRequest | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [status, setStatus] = useState<Status>('new');
  const [notes, setNotes] = useState('');

  const fetchData = useCallback(async () => {
    const { data } = await supabase.from('consultation_requests').select('*').order('created_at', { ascending: false });
    setItems(data || []); setFiltered(data || []); setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSearch = (q: string) => {
    const lq = q.toLowerCase();
    setFiltered(items.filter(i => i.full_name.toLowerCase().includes(lq) || i.email.toLowerCase().includes(lq) || (i.company_name || '').toLowerCase().includes(lq)));
  };

  const handleUpdate = async () => {
    if (!selected) return;
    const { error } = await supabase.from('consultation_requests').update({ status, notes }).eq('id', selected.id);
    if (error) { toast.error('Update failed'); return; }
    toast.success('Request updated'); setEditMode(false); setSelected(null); fetchData();
  };

  const exportCSV = () => {
    const rows = [
      ['ID', 'Name', 'Company', 'Email', 'Phone', 'Service', 'Date', 'Time', 'Mode', 'Budget', 'Status', 'Created'],
      ...filtered.map(i => [i.application_id, i.full_name, i.company_name || '', i.email, i.phone || '', i.service_interested || '', i.preferred_date || '', i.preferred_time || '', i.meeting_mode, i.project_budget || '', i.status, new Date(i.created_at).toLocaleDateString()]),
    ];
    const csv = rows.map(r => r.map(c => `"${c}"`).join(',')).join('\n');
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    a.download = 'consultation_requests.csv'; a.click();
  };

  const columns = [
    { key: 'full_name', label: 'Name' },
    { key: 'company_name', label: 'Company', render: (r: ConsultationRequest) => r.company_name || '—' },
    { key: 'email', label: 'Email' },
    { key: 'service_interested', label: 'Service', render: (r: ConsultationRequest) => r.service_interested || '—' },
    { key: 'preferred_date', label: 'Date', render: (r: ConsultationRequest) => r.preferred_date ? new Date(r.preferred_date).toLocaleDateString() : '—' },
    { key: 'meeting_mode', label: 'Mode', render: (r: ConsultationRequest) => <Badge variant="outline" className="text-xs">{r.meeting_mode}</Badge> },
    { key: 'status', label: 'Status', render: (r: ConsultationRequest) => <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${STATUS_COLORS[r.status] || ''}`}>{r.status}</span> },
  ];

  return (
    <>
      <div className="flex justify-end mb-4">
        <Button size="sm" variant="outline" className="gap-1.5 border-border text-primary" onClick={exportCSV}>
          <FileDown className="w-4 h-4" /> Export CSV
        </Button>
      </div>

      <AdminTable
        title="Consultation Requests"
        data={filtered}
        columns={columns}
        loading={loading}
        searchPlaceholder="Search requests…"
        onSearch={handleSearch}
        emptyMessage="No consultation requests yet"
        actions={row => (
          <div className="flex gap-1">
            <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => { setSelected(row); setEditMode(false); }}><Eye className="w-3.5 h-3.5" /></Button>
            <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => { setSelected(row); setStatus(row.status as Status); setNotes(row.notes || ''); setEditMode(true); }}><Pencil className="w-3.5 h-3.5" /></Button>
          </div>
        )}
      />

      {/* View dialog */}
      <Dialog open={!!selected && !editMode} onOpenChange={v => !v && setSelected(null)}>
        <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-lg max-h-[90dvh] overflow-y-auto">
          <DialogHeader><DialogTitle>Consultation Request Details</DialogTitle></DialogHeader>
          {selected && (
            <div className="space-y-2 text-sm">
              {[
                ['Ref ID', selected.application_id],
                ['Name', selected.full_name],
                ['Company', selected.company_name || '—'],
                ['Email', selected.email],
                ['Phone', selected.phone || '—'],
                ['Service', selected.service_interested || '—'],
                ['Date', selected.preferred_date ? new Date(selected.preferred_date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : '—'],
                ['Time', selected.preferred_time || '—'],
                ['Mode', selected.meeting_mode],
                ['Budget', selected.project_budget || '—'],
                ['Status', selected.status],
              ].map(([k, v]) => (
                <div key={k} className="flex gap-2"><span className="text-muted-foreground w-28 shrink-0">{k}:</span><span className="text-foreground capitalize">{v}</span></div>
              ))}
              {selected.project_description && (
                <div className="pt-2 border-t border-border">
                  <p className="text-muted-foreground text-xs mb-1">Project Description:</p>
                  <p className="text-foreground text-sm whitespace-pre-wrap text-pretty">{selected.project_description}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit dialog */}
      <Dialog open={editMode} onOpenChange={v => !v && setEditMode(false)}>
        <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-md">
          <DialogHeader><DialogTitle>Update Consultation Request</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-sm font-normal">Status</Label>
              <Select value={status} onValueChange={v => setStatus(v as Status)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{STATUS_OPTS.map(s => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-normal">Internal Notes</Label>
              <Textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setEditMode(false)}>Cancel</Button>
              <Button className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground" onClick={handleUpdate}>Save</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

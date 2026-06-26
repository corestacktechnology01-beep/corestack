import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/db/supabase';
import type { Lead } from '@/types/types';
import { AdminTable } from '@/components/admin/AdminTable';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Eye, Pencil, Trash2 } from 'lucide-react';

const STATUS_OPTS = ['new', 'contacted', 'qualified', 'converted', 'lost'] as const;
const STATUS_COLORS: Record<string, string> = {
  new: 'bg-blue-500/20 text-blue-400',
  contacted: 'bg-yellow-500/20 text-yellow-400',
  qualified: 'bg-green-500/20 text-green-400',
  converted: 'bg-purple-500/20 text-purple-400',
  lost: 'bg-red-500/20 text-red-400',
};

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filtered, setFiltered] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Lead | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState<Lead['status']>('new');

  const fetch = useCallback(async () => {
    const { data } = await supabase.from('leads').select('*').order('created_at', { ascending: false });
    setLeads(data || []); setFiltered(data || []); setLoading(false);
  }, []);
  useEffect(() => { fetch(); }, [fetch]);

  const handleSearch = (q: string) => {
    const lq = q.toLowerCase();
    setFiltered(leads.filter(l => l.full_name.toLowerCase().includes(lq) || l.email.toLowerCase().includes(lq) || (l.company || '').toLowerCase().includes(lq)));
  };

  const openEdit = (lead: Lead) => {
    setSelected(lead); setNotes(lead.notes || ''); setStatus(lead.status); setEditMode(true);
  };

  const handleUpdate = async () => {
    if (!selected) return;
    const { error } = await supabase.from('leads').update({ status, notes }).eq('id', selected.id);
    if (error) { toast.error('Update failed'); return; }
    toast.success('Lead updated');
    setEditMode(false); setSelected(null); fetch();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this lead?')) return;
    await supabase.from('leads').delete().eq('id', id);
    toast.success('Lead deleted'); fetch();
  };

  const columns = [
    { key: 'full_name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'company', label: 'Company', render: (r: Lead) => r.company || '—' },
    { key: 'source', label: 'Source', render: (r: Lead) => r.source || '—' },
    { key: 'status', label: 'Status', render: (r: Lead) => (
      <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${STATUS_COLORS[r.status] || ''}`}>{r.status}</span>
    )},
    { key: 'created_at', label: 'Date', render: (r: Lead) => new Date(r.created_at).toLocaleDateString() },
  ];

  return (
    <>
      <AdminTable
        title="Lead Management"
        data={filtered}
        columns={columns}
        loading={loading}
        searchPlaceholder="Search leads…"
        onSearch={handleSearch}
        emptyMessage="No leads found"
        actions={row => (
          <div className="flex gap-1">
            <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground" onClick={() => { setSelected(row); setEditMode(false); }}>
              <Eye className="w-3.5 h-3.5" />
            </Button>
            <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground" onClick={() => openEdit(row)}>
              <Pencil className="w-3.5 h-3.5" />
            </Button>
            <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive" onClick={() => handleDelete(row.id)}>
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </div>
        )}
      />

      {/* Detail dialog */}
      <Dialog open={!!selected && !editMode} onOpenChange={v => !v && setSelected(null)}>
        <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-lg">
          <DialogHeader><DialogTitle>Lead Details</DialogTitle></DialogHeader>
          {selected && (
            <div className="space-y-3 text-sm">
              {[['Name', selected.full_name], ['Email', selected.email], ['Phone', selected.phone || '—'], ['Company', selected.company || '—'], ['Subject', selected.subject || '—'], ['Source', selected.source || '—'], ['Status', selected.status]].map(([k, v]) => (
                <div key={k} className="flex gap-2"><span className="text-muted-foreground w-20 shrink-0">{k}:</span><span className="text-foreground capitalize">{v}</span></div>
              ))}
              {selected.message && <div className="pt-2 border-t border-border"><p className="text-muted-foreground text-xs mb-1">Message:</p><p className="text-foreground text-sm">{selected.message}</p></div>}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit dialog */}
      <Dialog open={editMode} onOpenChange={v => !v && setEditMode(false)}>
        <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-lg">
          <DialogHeader><DialogTitle>Update Lead</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-sm font-normal">Status</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as Lead['status'])}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{STATUS_OPTS.map(s => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-normal">Notes</Label>
              <Textarea value={notes} onChange={e => setNotes(e.target.value)} rows={4} placeholder="Add notes…" />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setEditMode(false)}>Cancel</Button>
              <Button className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground" onClick={handleUpdate}>Save Changes</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

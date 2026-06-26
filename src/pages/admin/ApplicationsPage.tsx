import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/db/supabase';
import type { JobApplication, Career } from '@/types/types';
import { AdminTable } from '@/components/admin/AdminTable';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Eye, Pencil, Download } from 'lucide-react';

const STATUS_COLORS: Record<string, string> = {
  new: 'bg-blue-500/20 text-blue-400',
  reviewing: 'bg-yellow-500/20 text-yellow-400',
  shortlisted: 'bg-green-500/20 text-green-400',
  rejected: 'bg-red-500/20 text-red-400',
  hired: 'bg-purple-500/20 text-purple-400',
};
const STATUS_OPTS: JobApplication['status'][] = ['new', 'reviewing', 'shortlisted', 'rejected', 'hired'];

export default function ApplicationsPage() {
  const [apps, setApps] = useState<JobApplication[]>([]);
  const [filtered, setFiltered] = useState<JobApplication[]>([]);
  const [careers, setCareers] = useState<Career[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<JobApplication | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [status, setStatus] = useState<JobApplication['status']>('new');
  const [notes, setNotes] = useState('');

  const fetch = useCallback(async () => {
    const [appsRes, careersRes] = await Promise.all([
      supabase.from('job_applications').select('*').order('created_at', { ascending: false }),
      supabase.from('careers').select('*'),
    ]);
    setApps(appsRes.data || []); setFiltered(appsRes.data || []);
    setCareers(careersRes.data || []);
    setLoading(false);
  }, []);
  useEffect(() => { fetch(); }, [fetch]);

  const handleSearch = (q: string) => {
    const lq = q.toLowerCase();
    setFiltered(apps.filter(a => a.full_name.toLowerCase().includes(lq) || a.email.toLowerCase().includes(lq)));
  };

  const getJobTitle = (id: string | null) => careers.find(c => c.id === id)?.title || '—';

  const openView = (app: JobApplication) => { setSelected(app); setEditMode(false); };
  const openEdit = (app: JobApplication) => { setSelected(app); setStatus(app.status); setNotes(app.notes || ''); setEditMode(true); };

  const handleUpdate = async () => {
    if (!selected) return;
    const { error } = await supabase.from('job_applications').update({ status, notes }).eq('id', selected.id);
    if (error) { toast.error('Update failed'); return; }
    toast.success('Application updated'); setEditMode(false); setSelected(null); fetch();
  };

  const columns = [
    { key: 'full_name', label: 'Applicant' },
    { key: 'email', label: 'Email' },
    { key: 'career_id', label: 'Position', render: (r: JobApplication) => getJobTitle(r.career_id) },
    { key: 'status', label: 'Status', render: (r: JobApplication) => <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${STATUS_COLORS[r.status] || ''}`}>{r.status}</span> },
    { key: 'created_at', label: 'Applied', render: (r: JobApplication) => new Date(r.created_at).toLocaleDateString() },
  ];

  return (
    <>
      <AdminTable title="Job Applications" data={filtered} columns={columns} loading={loading}
        searchPlaceholder="Search applicants…" onSearch={handleSearch} emptyMessage="No applications"
        actions={row => (
          <div className="flex gap-1">
            <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => openView(row)}><Eye className="w-3.5 h-3.5" /></Button>
            <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => openEdit(row)}><Pencil className="w-3.5 h-3.5" /></Button>
            {row.resume_url && (
              <a href={row.resume_url} target="_blank" rel="noopener noreferrer">
                <Button size="sm" variant="ghost" className="h-7 w-7 p-0"><Download className="w-3.5 h-3.5" /></Button>
              </a>
            )}
          </div>
        )}
      />

      <Dialog open={!!selected && !editMode} onOpenChange={v => !v && setSelected(null)}>
        <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-lg max-h-[90dvh] overflow-y-auto">
          <DialogHeader><DialogTitle>Application Details</DialogTitle></DialogHeader>
          {selected && (
            <div className="space-y-2 text-sm">
              {[['Name', selected.full_name], ['Email', selected.email], ['Phone', selected.phone || '—'], ['Position', getJobTitle(selected.career_id)], ['Status', selected.status], ['Portfolio', selected.portfolio_url || '—']].map(([k, v]) => (
                <div key={k} className="flex gap-2"><span className="text-muted-foreground w-24 shrink-0">{k}:</span><span className="text-foreground capitalize">{v}</span></div>
              ))}
              {selected.cover_letter && (
                <div className="pt-2 border-t border-border">
                  <p className="text-muted-foreground text-xs mb-1">Cover Letter:</p>
                  <p className="text-foreground text-sm whitespace-pre-wrap">{selected.cover_letter}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={editMode} onOpenChange={v => !v && setEditMode(false)}>
        <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-lg">
          <DialogHeader><DialogTitle>Update Application</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-sm font-normal">Status</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as JobApplication['status'])}>
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

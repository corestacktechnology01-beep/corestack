import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/db/supabase';
import { AdminTable } from '@/components/admin/AdminTable';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Eye, Pencil, Download, FileDown } from 'lucide-react';

interface InternshipApp {
  id: string;
  application_id: string;
  full_name: string;
  email: string;
  phone: string | null;
  date_of_birth: string | null;
  gender: string | null;
  college_name: string | null;
  university: string | null;
  degree: string | null;
  department: string | null;
  current_year: string | null;
  cgpa: string | null;
  internship_role: string | null;
  skills: string[] | null;
  project_experience: string | null;
  available_start_date: string | null;
  internship_duration: string | null;
  resume_url: string | null;
  college_id_url: string | null;
  declaration_accepted: boolean;
  status: string;
  notes: string | null;
  created_at: string;
}

type Status = 'new' | 'reviewing' | 'shortlisted' | 'selected' | 'rejected';

const STATUS_COLORS: Record<string, string> = {
  new: 'bg-blue-500/20 text-blue-400',
  reviewing: 'bg-yellow-500/20 text-yellow-400',
  shortlisted: 'bg-purple-500/20 text-purple-400',
  selected: 'bg-green-500/20 text-green-400',
  rejected: 'bg-red-500/20 text-red-400',
};
const STATUS_OPTS: Status[] = ['new', 'reviewing', 'shortlisted', 'selected', 'rejected'];

export default function InternshipApplicationsPage() {
  const [apps, setApps] = useState<InternshipApp[]>([]);
  const [filtered, setFiltered] = useState<InternshipApp[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<InternshipApp | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [status, setStatus] = useState<Status>('new');
  const [notes, setNotes] = useState('');

  const fetchData = useCallback(async () => {
    const { data } = await supabase.from('internship_applications').select('*').order('created_at', { ascending: false });
    setApps(data || []); setFiltered(data || []); setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSearch = (q: string) => {
    const lq = q.toLowerCase();
    setFiltered(apps.filter(a => a.full_name.toLowerCase().includes(lq) || a.email.toLowerCase().includes(lq) || (a.internship_role || '').toLowerCase().includes(lq)));
  };

  const handleUpdate = async () => {
    if (!selected) return;
    const { error } = await supabase.from('internship_applications').update({ status, notes }).eq('id', selected.id);
    if (error) { toast.error('Update failed'); return; }
    toast.success('Application updated'); setEditMode(false); setSelected(null); fetchData();
  };

  const exportCSV = () => {
    const rows = [
      ['ID', 'Name', 'Email', 'Phone', 'Role', 'College', 'Degree', 'Duration', 'Status', 'Applied'],
      ...filtered.map(a => [a.application_id, a.full_name, a.email, a.phone || '', a.internship_role || '', a.college_name || '', a.degree || '', a.internship_duration || '', a.status, new Date(a.created_at).toLocaleDateString()]),
    ];
    const csv = rows.map(r => r.map(c => `"${c}"`).join(',')).join('\n');
    const link = document.createElement('a'); link.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    link.download = 'internship_applications.csv'; link.click();
  };

  const columns = [
    { key: 'full_name', label: 'Applicant' },
    { key: 'email', label: 'Email' },
    { key: 'internship_role', label: 'Role', render: (r: InternshipApp) => r.internship_role || '—' },
    { key: 'college_name', label: 'College', render: (r: InternshipApp) => r.college_name || '—' },
    { key: 'internship_duration', label: 'Duration', render: (r: InternshipApp) => r.internship_duration || '—' },
    { key: 'status', label: 'Status', render: (r: InternshipApp) => <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${STATUS_COLORS[r.status] || ''}`}>{r.status}</span> },
    { key: 'created_at', label: 'Applied', render: (r: InternshipApp) => new Date(r.created_at).toLocaleDateString() },
  ];

  return (
    <>
      <div className="flex justify-end mb-4">
        <Button size="sm" variant="outline" className="gap-1.5 border-border text-primary" onClick={exportCSV}>
          <FileDown className="w-4 h-4" /> Export CSV
        </Button>
      </div>

      <AdminTable
        title="Internship Applications"
        data={filtered}
        columns={columns}
        loading={loading}
        searchPlaceholder="Search applicants…"
        onSearch={handleSearch}
        emptyMessage="No internship applications yet"
        actions={row => (
          <div className="flex gap-1">
            <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => { setSelected(row); setEditMode(false); }}><Eye className="w-3.5 h-3.5" /></Button>
            <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => { setSelected(row); setStatus(row.status as Status); setNotes(row.notes || ''); setEditMode(true); }}><Pencil className="w-3.5 h-3.5" /></Button>
            {row.resume_url && (
              <a href={row.resume_url} target="_blank" rel="noopener noreferrer">
                <Button size="sm" variant="ghost" className="h-7 w-7 p-0"><Download className="w-3.5 h-3.5" /></Button>
              </a>
            )}
          </div>
        )}
      />

      {/* View dialog */}
      <Dialog open={!!selected && !editMode} onOpenChange={v => !v && setSelected(null)}>
        <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-lg max-h-[90dvh] overflow-y-auto">
          <DialogHeader><DialogTitle>Internship Application Details</DialogTitle></DialogHeader>
          {selected && (
            <div className="space-y-2 text-sm">
              {[
                ['Ref ID', selected.application_id],
                ['Name', selected.full_name],
                ['Email', selected.email],
                ['Phone', selected.phone || '—'],
                ['Role', selected.internship_role || '—'],
                ['College', selected.college_name || '—'],
                ['University', selected.university || '—'],
                ['Degree', selected.degree || '—'],
                ['Department', selected.department || '—'],
                ['Current Year', selected.current_year || '—'],
                ['CGPA', selected.cgpa || '—'],
                ['Duration', selected.internship_duration || '—'],
                ['Start Date', selected.available_start_date ? new Date(selected.available_start_date).toLocaleDateString() : '—'],
                ['Status', selected.status],
              ].map(([k, v]) => (
                <div key={k} className="flex gap-2"><span className="text-muted-foreground w-32 shrink-0">{k}:</span><span className="text-foreground capitalize">{v}</span></div>
              ))}
              {(selected.skills || []).length > 0 && (
                <div className="flex gap-2"><span className="text-muted-foreground w-32 shrink-0">Skills:</span>
                  <div className="flex flex-wrap gap-1">{(selected.skills || []).map(s => <span key={s} className="text-xs px-2 py-0.5 rounded bg-primary/10 text-primary">{s}</span>)}</div>
                </div>
              )}
              {selected.project_experience && (
                <div className="pt-2 border-t border-border">
                  <p className="text-muted-foreground text-xs mb-1">Project Experience:</p>
                  <p className="text-foreground text-sm whitespace-pre-wrap text-pretty">{selected.project_experience}</p>
                </div>
              )}
              <div className="flex gap-3 mt-3">
                {selected.resume_url && <a href={selected.resume_url} target="_blank" rel="noopener noreferrer"><Button size="sm" variant="outline" className="gap-1.5 text-primary"><Download className="w-3.5 h-3.5" />Resume</Button></a>}
                {selected.college_id_url && <a href={selected.college_id_url} target="_blank" rel="noopener noreferrer"><Button size="sm" variant="outline" className="gap-1.5 text-primary"><Download className="w-3.5 h-3.5" />College ID</Button></a>}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit dialog */}
      <Dialog open={editMode} onOpenChange={v => !v && setEditMode(false)}>
        <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-md">
          <DialogHeader><DialogTitle>Update Application</DialogTitle></DialogHeader>
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

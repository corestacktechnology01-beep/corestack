import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/db/supabase';
import type { Project } from '@/types/types';
import { AdminTable } from '@/components/admin/AdminTable';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Pencil, Trash2 } from 'lucide-react';

type ProjForm = { title: string; slug: string; description: string; status: Project['status']; tags: string; technologies: string; results: string; is_featured: boolean; is_published: boolean; };
const EMPTY: ProjForm = { title: '', slug: '', description: '', status: 'planning', tags: '', technologies: '', results: '', is_featured: false, is_published: false };
const STATUS_COLORS: Record<string, string> = { planning: 'bg-blue-500/20 text-blue-400', in_progress: 'bg-yellow-500/20 text-yellow-400', completed: 'bg-green-500/20 text-green-400', on_hold: 'bg-orange-500/20 text-orange-400', cancelled: 'bg-red-500/20 text-red-400' };
const STATUS_OPTS: Project['status'][] = ['planning', 'in_progress', 'on_hold', 'completed', 'cancelled'];

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [filtered, setFiltered] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<ProjForm>(EMPTY);
  const [editId, setEditId] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    const { data } = await supabase.from('projects').select('*').order('created_at', { ascending: false });
    setProjects(data || []); setFiltered(data || []); setLoading(false);
  }, []);
  useEffect(() => { fetch(); }, [fetch]);

  const handleSearch = (q: string) => {
    const lq = q.toLowerCase();
    setFiltered(projects.filter(p => p.title.toLowerCase().includes(lq)));
  };

  const openAdd = () => { setForm(EMPTY); setEditId(null); setOpen(true); };
  const openEdit = (p: Project) => {
    setForm({ title: p.title, slug: p.slug, description: p.description || '', status: p.status, tags: (p.tags || []).join(', '), technologies: (p.technologies || []).join(', '), results: p.results || '', is_featured: p.is_featured, is_published: p.is_published });
    setEditId(p.id); setOpen(true);
  };

  const handleSave = async () => {
    if (!form.title) { toast.error('Title required'); return; }
    const slug = form.slug || form.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const payload = { title: form.title, slug, description: form.description || null, status: form.status, tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : null, technologies: form.technologies ? form.technologies.split(',').map(t => t.trim()).filter(Boolean) : null, results: form.results || null, is_featured: form.is_featured, is_published: form.is_published };
    if (editId) {
      const { error } = await supabase.from('projects').update(payload).eq('id', editId);
      if (error) { toast.error('Update failed'); return; }
      toast.success('Project updated');
    } else {
      const { error } = await supabase.from('projects').insert(payload);
      if (error) { toast.error('Insert failed'); return; }
      toast.success('Project created');
    }
    setOpen(false); fetch();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this project?')) return;
    await supabase.from('projects').delete().eq('id', id);
    toast.success('Deleted'); fetch();
  };

  const columns = [
    { key: 'title', label: 'Title' },
    { key: 'status', label: 'Status', render: (r: Project) => <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${STATUS_COLORS[r.status] || ''}`}>{r.status.replace('_', ' ')}</span> },
    { key: 'is_published', label: 'Published', render: (r: Project) => r.is_published ? <span className="text-xs text-green-400">Yes</span> : <span className="text-xs text-muted-foreground">No</span> },
    { key: 'is_featured', label: 'Featured', render: (r: Project) => r.is_featured ? <span className="text-xs text-primary">Yes</span> : <span className="text-xs text-muted-foreground">No</span> },
    { key: 'created_at', label: 'Created', render: (r: Project) => new Date(r.created_at).toLocaleDateString() },
  ];

  return (
    <>
      <AdminTable title="Project Management" data={filtered} columns={columns} loading={loading}
        searchPlaceholder="Search projects…" onSearch={handleSearch} onAdd={openAdd} addLabel="Add Project" emptyMessage="No projects"
        actions={row => (
          <div className="flex gap-1">
            <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => openEdit(row)}><Pencil className="w-3.5 h-3.5" /></Button>
            <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive" onClick={() => handleDelete(row.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
          </div>
        )}
      />
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-lg max-h-[90dvh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editId ? 'Edit Project' : 'Add Project'}</DialogTitle></DialogHeader>
          <div className="space-y-3 mt-2">
            <div className="space-y-1.5"><Label className="text-sm font-normal">Title *</Label><Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} /></div>
            <div className="space-y-1.5"><Label className="text-sm font-normal">Description</Label><Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} /></div>
            <div className="space-y-1.5">
              <Label className="text-sm font-normal">Status</Label>
              <Select value={form.status} onValueChange={(v) => setForm(f => ({ ...f, status: v as Project['status'] }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{STATUS_OPTS.map(s => <SelectItem key={s} value={s} className="capitalize">{s.replace('_', ' ')}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5"><Label className="text-sm font-normal">Tags (comma-separated)</Label><Input value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))} placeholder="React, Node.js, AWS" /></div>
            <div className="space-y-1.5"><Label className="text-sm font-normal">Technologies (comma-separated)</Label><Input value={form.technologies} onChange={e => setForm(f => ({ ...f, technologies: e.target.value }))} /></div>
            <div className="space-y-1.5"><Label className="text-sm font-normal">Results / Impact</Label><Input value={form.results} onChange={e => setForm(f => ({ ...f, results: e.target.value }))} /></div>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-sm cursor-pointer"><input type="checkbox" checked={form.is_published} onChange={e => setForm(f => ({ ...f, is_published: e.target.checked }))} className="w-4 h-4" /> Published</label>
              <label className="flex items-center gap-2 text-sm cursor-pointer"><input type="checkbox" checked={form.is_featured} onChange={e => setForm(f => ({ ...f, is_featured: e.target.checked }))} className="w-4 h-4" /> Featured</label>
            </div>
            <div className="flex gap-2 pt-1">
              <Button variant="outline" className="flex-1" onClick={() => setOpen(false)}>Cancel</Button>
              <Button className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground" onClick={handleSave}>{editId ? 'Save Changes' : 'Create'}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

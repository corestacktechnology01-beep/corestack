import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/db/supabase';
import type { Career } from '@/types/types';
import { AdminTable } from '@/components/admin/AdminTable';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Pencil, Trash2 } from 'lucide-react';

type CForm = { title: string; department: string; location: string; type: string; description: string; salary_range: string; is_active: boolean; is_internship: boolean; };
const EMPTY: CForm = { title: '', department: '', location: 'Remote', type: 'Full-time', description: '', salary_range: '', is_active: true, is_internship: false };

export default function CareersAdminPage() {
  const [items, setItems] = useState<Career[]>([]);
  const [filtered, setFiltered] = useState<Career[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<CForm>(EMPTY);
  const [editId, setEditId] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    const { data } = await supabase.from('careers').select('*').order('created_at', { ascending: false });
    setItems(data || []); setFiltered(data || []); setLoading(false);
  }, []);
  useEffect(() => { fetch(); }, [fetch]);

  const handleSearch = (q: string) => {
    const lq = q.toLowerCase();
    setFiltered(items.filter(c => c.title.toLowerCase().includes(lq) || c.department.toLowerCase().includes(lq)));
  };

  const openAdd = () => { setForm(EMPTY); setEditId(null); setOpen(true); };
  const openEdit = (c: Career) => {
    setForm({ title: c.title, department: c.department, location: c.location, type: c.type, description: c.description || '', salary_range: c.salary_range || '', is_active: c.is_active, is_internship: c.is_internship });
    setEditId(c.id); setOpen(true);
  };

  const handleSave = async () => {
    if (!form.title) { toast.error('Title required'); return; }
    const payload = { ...form, description: form.description || null, salary_range: form.salary_range || null };
    if (editId) {
      const { error } = await supabase.from('careers').update(payload).eq('id', editId);
      if (error) { toast.error('Update failed'); return; }
      toast.success('Position updated');
    } else {
      const { error } = await supabase.from('careers').insert(payload);
      if (error) { toast.error('Insert failed'); return; }
      toast.success('Position added');
    }
    setOpen(false); fetch();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete position?')) return;
    await supabase.from('careers').delete().eq('id', id);
    toast.success('Deleted'); fetch();
  };

  const columns = [
    { key: 'title', label: 'Position' },
    { key: 'department', label: 'Department' },
    { key: 'location', label: 'Location' },
    { key: 'type', label: 'Type' },
    { key: 'is_internship', label: 'Internship', render: (r: Career) => r.is_internship ? <span className="text-xs text-green-400">Yes</span> : <span className="text-xs text-muted-foreground">No</span> },
    { key: 'is_active', label: 'Active', render: (r: Career) => r.is_active ? <span className="text-xs text-green-400">Yes</span> : <span className="text-xs text-red-400">No</span> },
  ];

  return (
    <>
      <AdminTable title="Career Positions" data={filtered} columns={columns} loading={loading}
        onSearch={handleSearch} onAdd={openAdd} addLabel="Add Position" emptyMessage="No positions"
        actions={row => (
          <div className="flex gap-1">
            <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => openEdit(row)}><Pencil className="w-3.5 h-3.5" /></Button>
            <Button size="sm" variant="ghost" className="h-7 w-7 p-0 hover:text-destructive" onClick={() => handleDelete(row.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
          </div>
        )}
      />
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-lg max-h-[90dvh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editId ? 'Edit Position' : 'Add Position'}</DialogTitle></DialogHeader>
          <div className="space-y-3 mt-2">
            <div className="space-y-1.5"><Label className="text-sm font-normal">Job Title *</Label><Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label className="text-sm font-normal">Department</Label><Input value={form.department} onChange={e => setForm(f => ({ ...f, department: e.target.value }))} /></div>
              <div className="space-y-1.5"><Label className="text-sm font-normal">Location</Label><Input value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label className="text-sm font-normal">Type</Label><Input value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} placeholder="Full-time / Part-time" /></div>
              <div className="space-y-1.5"><Label className="text-sm font-normal">Salary Range</Label><Input value={form.salary_range} onChange={e => setForm(f => ({ ...f, salary_range: e.target.value }))} placeholder="$80K–$100K" /></div>
            </div>
            <div className="space-y-1.5"><Label className="text-sm font-normal">Description</Label><Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={4} /></div>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-sm cursor-pointer"><input type="checkbox" checked={form.is_active} onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))} className="w-4 h-4" /> Active</label>
              <label className="flex items-center gap-2 text-sm cursor-pointer"><input type="checkbox" checked={form.is_internship} onChange={e => setForm(f => ({ ...f, is_internship: e.target.checked }))} className="w-4 h-4" /> Internship</label>
            </div>
            <div className="flex gap-2 pt-1">
              <Button variant="outline" className="flex-1" onClick={() => setOpen(false)}>Cancel</Button>
              <Button className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground" onClick={handleSave}>{editId ? 'Save' : 'Add'}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/db/supabase';
import type { Service } from '@/types/types';
import { AdminTable } from '@/components/admin/AdminTable';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Pencil, Trash2 } from 'lucide-react';

type SForm = { title: string; slug: string; description: string; icon: string; features: string; is_active: boolean; sort_order: number; };
const EMPTY: SForm = { title: '', slug: '', description: '', icon: '', features: '', is_active: true, sort_order: 0 };

export default function ServicesAdminPage() {
  const [items, setItems] = useState<Service[]>([]);
  const [filtered, setFiltered] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<SForm>(EMPTY);
  const [editId, setEditId] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    const { data } = await supabase.from('services').select('*').order('sort_order');
    setItems(data || []); setFiltered(data || []); setLoading(false);
  }, []);
  useEffect(() => { fetch(); }, [fetch]);

  const handleSearch = (q: string) => setFiltered(items.filter(s => s.title.toLowerCase().includes(q.toLowerCase())));

  const openAdd = () => { setForm(EMPTY); setEditId(null); setOpen(true); };
  const openEdit = (s: Service) => {
    setForm({ title: s.title, slug: s.slug, description: s.description, icon: s.icon || '', features: (s.features || []).join('\n'), is_active: s.is_active, sort_order: s.sort_order });
    setEditId(s.id); setOpen(true);
  };

  const handleSave = async () => {
    if (!form.title) { toast.error('Title required'); return; }
    const slug = form.slug || form.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const payload = { title: form.title, slug, description: form.description, icon: form.icon || null, features: form.features.split('\n').map(f => f.trim()).filter(Boolean), is_active: form.is_active, sort_order: form.sort_order };
    const { error } = editId ? await supabase.from('services').update(payload).eq('id', editId) : await supabase.from('services').insert(payload);
    if (error) { toast.error('Save failed'); return; }
    toast.success(editId ? 'Updated' : 'Created'); setOpen(false); fetch();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete?')) return;
    await supabase.from('services').delete().eq('id', id);
    toast.success('Deleted'); fetch();
  };

  const columns = [
    { key: 'title', label: 'Service' },
    { key: 'icon', label: 'Icon', render: (r: Service) => r.icon || '—' },
    { key: 'sort_order', label: 'Order' },
    { key: 'is_active', label: 'Active', render: (r: Service) => r.is_active ? <span className="text-xs text-green-400">Yes</span> : <span className="text-xs text-red-400">No</span> },
  ];

  return (
    <>
      <AdminTable title="Services" data={filtered} columns={columns} loading={loading}
        onSearch={handleSearch} onAdd={openAdd} addLabel="Add Service" emptyMessage="No services"
        actions={row => (
          <div className="flex gap-1">
            <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => openEdit(row)}><Pencil className="w-3.5 h-3.5" /></Button>
            <Button size="sm" variant="ghost" className="h-7 w-7 p-0 hover:text-destructive" onClick={() => handleDelete(row.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
          </div>
        )}
      />
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-lg max-h-[90dvh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editId ? 'Edit Service' : 'Add Service'}</DialogTitle></DialogHeader>
          <div className="space-y-3 mt-2">
            <div className="space-y-1.5"><Label className="text-sm font-normal">Title *</Label><Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} /></div>
            <div className="space-y-1.5"><Label className="text-sm font-normal">Description</Label><Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} /></div>
            <div className="space-y-1.5"><Label className="text-sm font-normal">Icon (lucide name, e.g. Code2)</Label><Input value={form.icon} onChange={e => setForm(f => ({ ...f, icon: e.target.value }))} /></div>
            <div className="space-y-1.5"><Label className="text-sm font-normal">Features (one per line)</Label><Textarea value={form.features} onChange={e => setForm(f => ({ ...f, features: e.target.value }))} rows={4} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label className="text-sm font-normal">Sort Order</Label><Input type="number" value={form.sort_order} onChange={e => setForm(f => ({ ...f, sort_order: Number(e.target.value) }))} /></div>
            </div>
            <label className="flex items-center gap-2 text-sm cursor-pointer"><input type="checkbox" checked={form.is_active} onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))} className="w-4 h-4" /> Active</label>
            <div className="flex gap-2 pt-1">
              <Button variant="outline" className="flex-1" onClick={() => setOpen(false)}>Cancel</Button>
              <Button className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground" onClick={handleSave}>{editId ? 'Save' : 'Create'}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

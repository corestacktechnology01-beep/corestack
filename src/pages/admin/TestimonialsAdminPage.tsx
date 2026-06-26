import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/db/supabase';
import type { Testimonial } from '@/types/types';
import { AdminTable } from '@/components/admin/AdminTable';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Pencil, Trash2, Star } from 'lucide-react';

type TForm = { client_name: string; client_position: string; company_name: string; review_text: string; rating: number; is_featured: boolean; is_active: boolean; sort_order: number; };
const EMPTY: TForm = { client_name: '', client_position: '', company_name: '', review_text: '', rating: 5, is_featured: false, is_active: true, sort_order: 0 };

export default function TestimonialsAdminPage() {
  const [items, setItems] = useState<Testimonial[]>([]);
  const [filtered, setFiltered] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<TForm>(EMPTY);
  const [editId, setEditId] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    const { data } = await supabase.from('testimonials').select('*').order('sort_order');
    setItems(data || []); setFiltered(data || []); setLoading(false);
  }, []);
  useEffect(() => { fetch(); }, [fetch]);

  const handleSearch = (q: string) => {
    const lq = q.toLowerCase();
    setFiltered(items.filter(t => t.client_name.toLowerCase().includes(lq) || (t.company_name || '').toLowerCase().includes(lq)));
  };

  const openAdd = () => { setForm(EMPTY); setEditId(null); setOpen(true); };
  const openEdit = (t: Testimonial) => {
    setForm({ client_name: t.client_name, client_position: t.client_position || '', company_name: t.company_name || '', review_text: t.review_text, rating: t.rating, is_featured: t.is_featured, is_active: t.is_active, sort_order: t.sort_order });
    setEditId(t.id); setOpen(true);
  };

  const handleSave = async () => {
    if (!form.client_name || !form.review_text) { toast.error('Name and review required'); return; }
    const payload = { ...form, client_position: form.client_position || null, company_name: form.company_name || null };
    if (editId) {
      const { error } = await supabase.from('testimonials').update(payload).eq('id', editId);
      if (error) { toast.error('Update failed'); return; }
      toast.success('Testimonial updated');
    } else {
      const { error } = await supabase.from('testimonials').insert(payload);
      if (error) { toast.error('Insert failed'); return; }
      toast.success('Testimonial added');
    }
    setOpen(false); fetch();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete?')) return;
    await supabase.from('testimonials').delete().eq('id', id);
    toast.success('Deleted'); fetch();
  };

  const columns = [
    { key: 'client_name', label: 'Client' },
    { key: 'company_name', label: 'Company', render: (r: Testimonial) => r.company_name || '—' },
    { key: 'rating', label: 'Rating', render: (r: Testimonial) => <div className="flex gap-0.5">{Array.from({ length: r.rating }, (_, i) => <Star key={i} className="w-3 h-3 fill-primary text-primary" />)}</div> },
    { key: 'is_active', label: 'Active', render: (r: Testimonial) => r.is_active ? <span className="text-xs text-green-400">Yes</span> : <span className="text-xs text-muted-foreground">No</span> },
    { key: 'is_featured', label: 'Featured', render: (r: Testimonial) => r.is_featured ? <span className="text-xs text-primary">Yes</span> : <span className="text-xs text-muted-foreground">No</span> },
  ];

  return (
    <>
      <AdminTable title="Testimonials" data={filtered} columns={columns} loading={loading}
        onSearch={handleSearch} onAdd={openAdd} addLabel="Add Testimonial" emptyMessage="No testimonials"
        actions={row => (
          <div className="flex gap-1">
            <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => openEdit(row)}><Pencil className="w-3.5 h-3.5" /></Button>
            <Button size="sm" variant="ghost" className="h-7 w-7 p-0 hover:text-destructive" onClick={() => handleDelete(row.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
          </div>
        )}
      />
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-lg max-h-[90dvh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editId ? 'Edit Testimonial' : 'Add Testimonial'}</DialogTitle></DialogHeader>
          <div className="space-y-3 mt-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label className="text-sm font-normal">Client Name *</Label><Input value={form.client_name} onChange={e => setForm(f => ({ ...f, client_name: e.target.value }))} /></div>
              <div className="space-y-1.5"><Label className="text-sm font-normal">Position</Label><Input value={form.client_position} onChange={e => setForm(f => ({ ...f, client_position: e.target.value }))} /></div>
            </div>
            <div className="space-y-1.5"><Label className="text-sm font-normal">Company</Label><Input value={form.company_name} onChange={e => setForm(f => ({ ...f, company_name: e.target.value }))} /></div>
            <div className="space-y-1.5"><Label className="text-sm font-normal">Review *</Label><Textarea value={form.review_text} onChange={e => setForm(f => ({ ...f, review_text: e.target.value }))} rows={3} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-sm font-normal">Rating</Label>
                <Select value={String(form.rating)} onValueChange={(v) => setForm(f => ({ ...f, rating: Number(v) }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{[5, 4, 3, 2, 1].map(n => <SelectItem key={n} value={String(n)}>{n} Stars</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5"><Label className="text-sm font-normal">Sort Order</Label><Input type="number" value={form.sort_order} onChange={e => setForm(f => ({ ...f, sort_order: Number(e.target.value) }))} /></div>
            </div>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-sm cursor-pointer"><input type="checkbox" checked={form.is_active} onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))} className="w-4 h-4" /> Active</label>
              <label className="flex items-center gap-2 text-sm cursor-pointer"><input type="checkbox" checked={form.is_featured} onChange={e => setForm(f => ({ ...f, is_featured: e.target.checked }))} className="w-4 h-4" /> Featured</label>
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

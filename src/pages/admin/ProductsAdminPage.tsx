import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/db/supabase';
import type { Product } from '@/types/types';
import { AdminTable } from '@/components/admin/AdminTable';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Pencil, Trash2 } from 'lucide-react';

type PForm = { name: string; slug: string; tagline: string; description: string; features: string; price_monthly: string; price_yearly: string; demo_url: string; is_active: boolean; sort_order: number; };
const EMPTY: PForm = { name: '', slug: '', tagline: '', description: '', features: '', price_monthly: '', price_yearly: '', demo_url: '', is_active: true, sort_order: 0 };

export default function ProductsAdminPage() {
  const [items, setItems] = useState<Product[]>([]);
  const [filtered, setFiltered] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<PForm>(EMPTY);
  const [editId, setEditId] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    const { data } = await supabase.from('products').select('*').order('sort_order');
    setItems(data || []); setFiltered(data || []); setLoading(false);
  }, []);
  useEffect(() => { fetch(); }, [fetch]);

  const handleSearch = (q: string) => setFiltered(items.filter(p => p.name.toLowerCase().includes(q.toLowerCase())));

  const openAdd = () => { setForm(EMPTY); setEditId(null); setOpen(true); };
  const openEdit = (p: Product) => {
    setForm({ name: p.name, slug: p.slug, tagline: p.tagline || '', description: p.description, features: (p.features || []).join('\n'), price_monthly: p.price_monthly != null ? String(p.price_monthly) : '', price_yearly: p.price_yearly != null ? String(p.price_yearly) : '', demo_url: p.demo_url || '', is_active: p.is_active, sort_order: p.sort_order });
    setEditId(p.id); setOpen(true);
  };

  const handleSave = async () => {
    if (!form.name) { toast.error('Name required'); return; }
    const slug = form.slug || form.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const payload = { name: form.name, slug, tagline: form.tagline || null, description: form.description, features: form.features.split('\n').map(f => f.trim()).filter(Boolean), price_monthly: form.price_monthly ? Number(form.price_monthly) : null, price_yearly: form.price_yearly ? Number(form.price_yearly) : null, demo_url: form.demo_url || null, is_active: form.is_active, sort_order: form.sort_order };
    const { error } = editId ? await supabase.from('products').update(payload).eq('id', editId) : await supabase.from('products').insert(payload);
    if (error) { toast.error('Save failed'); return; }
    toast.success(editId ? 'Updated' : 'Created'); setOpen(false); fetch();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete?')) return;
    await supabase.from('products').delete().eq('id', id);
    toast.success('Deleted'); fetch();
  };

  const columns = [
    { key: 'name', label: 'Product Name' },
    { key: 'tagline', label: 'Tagline', render: (r: Product) => r.tagline || '—' },
    { key: 'price_monthly', label: 'Price/mo', render: (r: Product) => r.price_monthly != null ? `$${r.price_monthly}` : 'Custom' },
    { key: 'is_active', label: 'Active', render: (r: Product) => r.is_active ? <span className="text-xs text-green-400">Yes</span> : <span className="text-xs text-red-400">No</span> },
    { key: 'sort_order', label: 'Order' },
  ];

  return (
    <>
      <AdminTable title="Products" data={filtered} columns={columns} loading={loading}
        onSearch={handleSearch} onAdd={openAdd} addLabel="Add Product" emptyMessage="No products"
        actions={row => (
          <div className="flex gap-1">
            <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => openEdit(row)}><Pencil className="w-3.5 h-3.5" /></Button>
            <Button size="sm" variant="ghost" className="h-7 w-7 p-0 hover:text-destructive" onClick={() => handleDelete(row.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
          </div>
        )}
      />
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-lg max-h-[90dvh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editId ? 'Edit Product' : 'Add Product'}</DialogTitle></DialogHeader>
          <div className="space-y-3 mt-2">
            <div className="space-y-1.5"><Label className="text-sm font-normal">Name *</Label><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
            <div className="space-y-1.5"><Label className="text-sm font-normal">Tagline</Label><Input value={form.tagline} onChange={e => setForm(f => ({ ...f, tagline: e.target.value }))} /></div>
            <div className="space-y-1.5"><Label className="text-sm font-normal">Description</Label><Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} /></div>
            <div className="space-y-1.5"><Label className="text-sm font-normal">Features (one per line)</Label><Textarea value={form.features} onChange={e => setForm(f => ({ ...f, features: e.target.value }))} rows={4} placeholder="Feature 1&#10;Feature 2" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label className="text-sm font-normal">Monthly Price ($)</Label><Input type="number" value={form.price_monthly} onChange={e => setForm(f => ({ ...f, price_monthly: e.target.value }))} /></div>
              <div className="space-y-1.5"><Label className="text-sm font-normal">Yearly Price ($)</Label><Input type="number" value={form.price_yearly} onChange={e => setForm(f => ({ ...f, price_yearly: e.target.value }))} /></div>
            </div>
            <div className="space-y-1.5"><Label className="text-sm font-normal">Demo URL</Label><Input value={form.demo_url} onChange={e => setForm(f => ({ ...f, demo_url: e.target.value }))} /></div>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-sm cursor-pointer"><input type="checkbox" checked={form.is_active} onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))} className="w-4 h-4" /> Active</label>
            </div>
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

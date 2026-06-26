import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/db/supabase';
import type { Client } from '@/types/types';
import { AdminTable } from '@/components/admin/AdminTable';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Pencil, Trash2, Plus } from 'lucide-react';

type ClientForm = Omit<Client, 'id' | 'created_at' | 'updated_at'>;
const EMPTY: ClientForm = { company_name: '', contact_person: null, email: null, phone: null, industry: null, logo_url: null, status: 'active', notes: null };

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [filtered, setFiltered] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<ClientForm>(EMPTY);
  const [editId, setEditId] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    const { data } = await supabase.from('clients').select('*').order('created_at', { ascending: false });
    setClients(data || []); setFiltered(data || []); setLoading(false);
  }, []);
  useEffect(() => { fetch(); }, [fetch]);

  const handleSearch = (q: string) => {
    const lq = q.toLowerCase();
    setFiltered(clients.filter(c => c.company_name.toLowerCase().includes(lq) || (c.contact_person || '').toLowerCase().includes(lq)));
  };

  const openAdd = () => { setForm(EMPTY); setEditId(null); setOpen(true); };
  const openEdit = (c: Client) => {
    setForm({ company_name: c.company_name, contact_person: c.contact_person, email: c.email, phone: c.phone, industry: c.industry, logo_url: c.logo_url, status: c.status, notes: c.notes });
    setEditId(c.id); setOpen(true);
  };

  const handleSave = async () => {
    if (!form.company_name) { toast.error('Company name required'); return; }
    const payload = { ...form };
    if (editId) {
      const { error } = await supabase.from('clients').update(payload).eq('id', editId);
      if (error) { toast.error('Update failed'); return; }
      toast.success('Client updated');
    } else {
      const { error } = await supabase.from('clients').insert(payload);
      if (error) { toast.error('Insert failed'); return; }
      toast.success('Client added');
    }
    setOpen(false); fetch();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this client?')) return;
    await supabase.from('clients').delete().eq('id', id);
    toast.success('Client deleted'); fetch();
  };

  const STATUS_COLORS: Record<string, string> = { active: 'bg-green-500/20 text-green-400', inactive: 'bg-red-500/20 text-red-400', prospect: 'bg-yellow-500/20 text-yellow-400' };

  const columns = [
    { key: 'company_name', label: 'Company' },
    { key: 'contact_person', label: 'Contact', render: (r: Client) => r.contact_person || '—' },
    { key: 'email', label: 'Email', render: (r: Client) => r.email || '—' },
    { key: 'industry', label: 'Industry', render: (r: Client) => r.industry || '—' },
    { key: 'status', label: 'Status', render: (r: Client) => <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${STATUS_COLORS[r.status] || ''}`}>{r.status}</span> },
  ];

  return (
    <>
      <AdminTable
        title="Client Management"
        data={filtered} columns={columns} loading={loading}
        searchPlaceholder="Search clients…" onSearch={handleSearch}
        onAdd={openAdd} addLabel="Add Client" emptyMessage="No clients found"
        actions={row => (
          <div className="flex gap-1">
            <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground" onClick={() => openEdit(row)}><Pencil className="w-3.5 h-3.5" /></Button>
            <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive" onClick={() => handleDelete(row.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
          </div>
        )}
      />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-lg max-h-[90dvh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editId ? 'Edit Client' : 'Add Client'}</DialogTitle></DialogHeader>
          <div className="space-y-3 mt-2">
            {([['company_name', 'Company Name *', 'text'], ['contact_person', 'Contact Person', 'text'], ['email', 'Email', 'email'], ['phone', 'Phone', 'text'], ['industry', 'Industry', 'text']] as [keyof ClientForm, string, string][]).map(([key, label, type]) => (
              <div key={key} className="space-y-1.5">
                <Label className="text-sm font-normal">{label}</Label>
                <Input type={type} value={(form[key] as string) || ''} onChange={e => setForm(f => ({ ...f, [key]: e.target.value || null }))} />
              </div>
            ))}
            <div className="space-y-1.5">
              <Label className="text-sm font-normal">Status</Label>
              <Select value={form.status} onValueChange={(v) => setForm(f => ({ ...f, status: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="prospect">Prospect</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-normal">Notes</Label>
              <Textarea value={form.notes || ''} onChange={e => setForm(f => ({ ...f, notes: e.target.value || null }))} rows={3} />
            </div>
            <div className="flex gap-2 pt-1">
              <Button variant="outline" className="flex-1" onClick={() => setOpen(false)}>Cancel</Button>
              <Button className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground" onClick={handleSave}>{editId ? 'Save Changes' : 'Add Client'}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/db/supabase';
import type { Lead } from '@/types/types';
import { AdminTable } from '@/components/admin/AdminTable';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Eye, Pencil } from 'lucide-react';

const STATUS_COLORS: Record<string, string> = {
  new: 'bg-blue-500/20 text-blue-400',
  read: 'bg-yellow-500/20 text-yellow-400',
  replied: 'bg-green-500/20 text-green-400',
  archived: 'bg-muted text-muted-foreground',
};

export default function ContactsPage() {
  const [items, setItems] = useState<Lead[]>([]);
  const [filtered, setFiltered] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Lead | null>(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [status, setStatus] = useState<string>('new');

  const fetch = useCallback(async () => {
    const { data } = await supabase.from('leads').select('*').eq('source', 'contact_form').order('created_at', { ascending: false });
    setItems(data || []); setFiltered(data || []); setLoading(false);
  }, []);
  useEffect(() => { fetch(); }, [fetch]);

  const handleSearch = (q: string) => {
    const lq = q.toLowerCase();
    setFiltered(items.filter(l => l.full_name.toLowerCase().includes(lq) || l.email.toLowerCase().includes(lq)));
  };

  const openView = (item: Lead) => { setSelected(item); setViewOpen(true); };
  const openEdit = (item: Lead) => { setSelected(item); setStatus(item.status); setEditOpen(true); };

  const handleUpdate = async () => {
    if (!selected) return;
    await supabase.from('leads').update({ status: status as Lead['status'] }).eq('id', selected.id);
    toast.success('Status updated'); setEditOpen(false); fetch();
  };

  const columns = [
    { key: 'full_name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'subject', label: 'Subject', render: (r: Lead) => r.subject || '—' },
    { key: 'status', label: 'Status', render: (r: Lead) => <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${STATUS_COLORS[r.status] || ''}`}>{r.status}</span> },
    { key: 'created_at', label: 'Date', render: (r: Lead) => new Date(r.created_at).toLocaleDateString() },
  ];

  return (
    <>
      <AdminTable title="Contact Messages" data={filtered} columns={columns} loading={loading}
        onSearch={handleSearch} emptyMessage="No messages"
        actions={row => (
          <div className="flex gap-1">
            <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => openView(row)}><Eye className="w-3.5 h-3.5" /></Button>
            <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => openEdit(row)}><Pencil className="w-3.5 h-3.5" /></Button>
          </div>
        )}
      />

      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-lg">
          <DialogHeader><DialogTitle>Message Details</DialogTitle></DialogHeader>
          {selected && (
            <div className="space-y-3 text-sm">
              {[['From', selected.full_name], ['Email', selected.email], ['Company', selected.company || '—'], ['Phone', selected.phone || '—'], ['Subject', selected.subject || '—']].map(([k, v]) => (
                <div key={k} className="flex gap-2"><span className="text-muted-foreground w-20 shrink-0">{k}:</span><span className="text-foreground">{v}</span></div>
              ))}
              {selected.message && (
                <div className="pt-3 border-t border-border">
                  <p className="text-muted-foreground text-xs mb-1">Message:</p>
                  <p className="text-foreground whitespace-pre-wrap">{selected.message}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-sm">
          <DialogHeader><DialogTitle>Update Status</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label className="text-sm font-normal">Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="read">Read</SelectItem>
                  <SelectItem value="replied">Replied</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setEditOpen(false)}>Cancel</Button>
              <Button className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground" onClick={handleUpdate}>Save</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

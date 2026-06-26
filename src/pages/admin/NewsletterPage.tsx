import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/db/supabase';
import type { NewsletterSubscriber } from '@/types/types';
import { AdminTable } from '@/components/admin/AdminTable';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Trash2, Download } from 'lucide-react';

export default function NewsletterPage() {
  const [items, setItems] = useState<NewsletterSubscriber[]>([]);
  const [filtered, setFiltered] = useState<NewsletterSubscriber[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    const { data } = await supabase.from('newsletter_subscribers').select('*').order('subscribed_at', { ascending: false });
    setItems(data || []); setFiltered(data || []); setLoading(false);
  }, []);
  useEffect(() => { fetch(); }, [fetch]);

  const handleSearch = (q: string) => {
    setFiltered(items.filter(s => s.email.toLowerCase().includes(q.toLowerCase())));
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Remove subscriber?')) return;
    await supabase.from('newsletter_subscribers').delete().eq('id', id);
    toast.success('Subscriber removed'); fetch();
  };

  const handleExport = () => {
    const csv = ['Email,Status,Subscribed At', ...filtered.map(s => `${s.email},${s.status},${s.subscribed_at}`)].join('\n');
    const a = document.createElement('a'); a.href = `data:text/csv,${encodeURIComponent(csv)}`; a.download = 'subscribers.csv'; a.click();
  };

  const activeCount = items.filter(s => s.status === 'active').length;

  const STATUS_COLORS: Record<string, string> = { active: 'bg-green-500/20 text-green-400', unsubscribed: 'bg-red-500/20 text-red-400' };

  const columns = [
    { key: 'email', label: 'Email' },
    { key: 'status', label: 'Status', render: (r: NewsletterSubscriber) => <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${STATUS_COLORS[r.status] || ''}`}>{r.status}</span> },
    { key: 'subscribed_at', label: 'Subscribed', render: (r: NewsletterSubscriber) => new Date(r.subscribed_at).toLocaleDateString() },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl border border-border bg-card"><div className="text-2xl font-bold text-foreground">{items.length}</div><div className="text-xs text-muted-foreground">Total Subscribers</div></div>
        <div className="p-4 rounded-xl border border-border bg-card"><div className="text-2xl font-bold text-green-400">{activeCount}</div><div className="text-xs text-muted-foreground">Active</div></div>
        <div className="p-4 rounded-xl border border-border bg-card"><div className="text-2xl font-bold text-red-400">{items.length - activeCount}</div><div className="text-xs text-muted-foreground">Unsubscribed</div></div>
      </div>

      <div className="flex justify-end">
        <Button size="sm" variant="outline" onClick={handleExport} className="border-border text-primary hover:border-primary/60">
          <Download className="w-4 h-4 mr-1.5" /> Export CSV
        </Button>
      </div>

      <AdminTable title="Newsletter Subscribers" data={filtered} columns={columns} loading={loading}
        searchPlaceholder="Search emails…" onSearch={handleSearch} emptyMessage="No subscribers"
        actions={row => (
          <Button size="sm" variant="ghost" className="h-7 w-7 p-0 hover:text-destructive" onClick={() => handleDelete(row.id)}>
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        )}
      />
    </div>
  );
}

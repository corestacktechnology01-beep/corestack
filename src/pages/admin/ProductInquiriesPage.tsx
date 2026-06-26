import { useEffect, useState } from 'react';
import { supabase } from '@/db/supabase';
import AdminLayout from '@/components/layouts/AdminLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Search, Package, Mail, Phone, Building2, Calendar, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';

interface Inquiry {
  id: string;
  inquiry_id: string;
  product_name: string;
  full_name: string;
  email: string;
  phone: string | null;
  company_name: string | null;
  company_size: string | null;
  use_case: string | null;
  current_tools: string | null;
  budget: string | null;
  timeline: string | null;
  message: string | null;
  status: string;
  notes: string | null;
  created_at: string;
}

const STATUS_COLORS: Record<string, string> = {
  new: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  contacted: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
  in_progress: 'bg-primary/20 text-primary border-primary/30',
  closed: 'bg-green-500/20 text-green-300 border-green-500/30',
  lost: 'bg-muted text-muted-foreground border-border',
};

const STATUSES = ['new', 'contacted', 'in_progress', 'closed', 'lost'];

export default function ProductInquiriesPage() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [productFilter, setProductFilter] = useState('all');
  const [expanded, setExpanded] = useState<string | null>(null);

  const fetch = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('product_inquiries')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) { toast.error('Failed to load inquiries'); }
    else { setInquiries(data || []); }
    setLoading(false);
  };

  useEffect(() => { fetch(); }, []);

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from('product_inquiries').update({ status }).eq('id', id);
    if (error) { toast.error('Failed to update status'); return; }
    setInquiries(prev => prev.map(i => i.id === id ? { ...i, status } : i));
    toast.success('Status updated');
  };

  const products = ['all', ...Array.from(new Set(inquiries.map(i => i.product_name)))];

  const filtered = inquiries.filter(i => {
    const matchSearch = !search || [i.full_name, i.email, i.company_name, i.inquiry_id]
      .some(v => v?.toLowerCase().includes(search.toLowerCase()));
    const matchStatus = statusFilter === 'all' || i.status === statusFilter;
    const matchProduct = productFilter === 'all' || i.product_name === productFilter;
    return matchSearch && matchStatus && matchProduct;
  });

  const counts = STATUSES.reduce((acc, s) => ({ ...acc, [s]: inquiries.filter(i => i.status === s).length }), {} as Record<string, number>);

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground">Product Inquiries</h1>
            <p className="text-muted-foreground text-sm mt-1">Get Started form submissions from the Products section</p>
          </div>
          <Button variant="outline" size="sm" onClick={fetch} className="gap-2">
            <RefreshCw className="w-4 h-4" /> Refresh
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {STATUSES.map(s => (
            <div key={s} className="bg-card border border-border rounded-xl p-4 text-center">
              <div className="text-2xl font-display font-bold text-foreground">{counts[s] ?? 0}</div>
              <div className="text-xs text-muted-foreground capitalize mt-1">{s.replace('_', ' ')}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search by name, email, ID…" value={search} onChange={e => setSearch(e.target.value)} className="pl-9 bg-card" />
          </div>
          <Select value={productFilter} onValueChange={setProductFilter}>
            <SelectTrigger className="w-full sm:w-48 bg-card"><SelectValue placeholder="All Products" /></SelectTrigger>
            <SelectContent>
              {products.map(p => <SelectItem key={p} value={p}>{p === 'all' ? 'All Products' : p}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-40 bg-card"><SelectValue placeholder="All Statuses" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {STATUSES.map(s => <SelectItem key={s} value={s} className="capitalize">{s.replace('_', ' ')}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  {['ID', 'Product', 'Contact', 'Company', 'Budget / Timeline', 'Status', 'Date', ''].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={8} className="text-center py-12 text-muted-foreground">Loading…</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={8} className="text-center py-12 text-muted-foreground">No inquiries found</td></tr>
                ) : filtered.map(inq => (
                  <>
                    <tr key={inq.id} className="border-b border-border hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="text-xs font-mono text-primary">{inq.inquiry_id}</span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Package className="w-3.5 h-3.5 text-primary shrink-0" />
                          <span className="text-sm font-medium text-foreground">{inq.product_name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm font-medium text-foreground">{inq.full_name}</div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                          <Mail className="w-3 h-3" />{inq.email}
                        </div>
                        {inq.phone && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Phone className="w-3 h-3" />{inq.phone}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {inq.company_name ? (
                          <div className="flex items-center gap-1 text-sm text-foreground">
                            <Building2 className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                            {inq.company_name}
                          </div>
                        ) : <span className="text-muted-foreground text-xs">—</span>}
                        {inq.company_size && <div className="text-xs text-muted-foreground mt-0.5">{inq.company_size}</div>}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm text-foreground">{inq.budget || '—'}</div>
                        <div className="text-xs text-muted-foreground">{inq.timeline || ''}</div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <Select value={inq.status} onValueChange={v => updateStatus(inq.id, v)}>
                          <SelectTrigger className={`h-7 text-xs border rounded-full px-2.5 w-32 ${STATUS_COLORS[inq.status] || ''}`}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {STATUSES.map(s => <SelectItem key={s} value={s} className="capitalize text-xs">{s.replace('_', ' ')}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar className="w-3 h-3" />
                          {new Date(inq.created_at).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <button
                          onClick={() => setExpanded(expanded === inq.id ? null : inq.id)}
                          className="text-muted-foreground hover:text-foreground transition-colors p-1"
                        >
                          {expanded === inq.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      </td>
                    </tr>
                    {expanded === inq.id && (
                      <tr key={`${inq.id}-detail`} className="bg-muted/10">
                        <td colSpan={8} className="px-6 py-4">
                          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                            {inq.use_case && (
                              <div><span className="text-muted-foreground text-xs uppercase tracking-wider">Use Case</span><p className="text-foreground mt-1">{inq.use_case}</p></div>
                            )}
                            {inq.current_tools && (
                              <div><span className="text-muted-foreground text-xs uppercase tracking-wider">Current Tools</span><p className="text-foreground mt-1">{inq.current_tools}</p></div>
                            )}
                            {inq.message && (
                              <div className="sm:col-span-2 md:col-span-3"><span className="text-muted-foreground text-xs uppercase tracking-wider">Additional Requirements</span><p className="text-foreground mt-1 text-pretty">{inq.message}</p></div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 border-t border-border text-xs text-muted-foreground">
            Showing {filtered.length} of {inquiries.length} inquiries
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

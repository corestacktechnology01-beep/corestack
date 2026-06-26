import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/db/supabase';
import type { BlogPost } from '@/types/types';
import { AdminTable } from '@/components/admin/AdminTable';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Pencil, Trash2 } from 'lucide-react';

type BForm = { title: string; slug: string; excerpt: string; content: string; tags: string; status: BlogPost['status']; seo_title: string; seo_description: string; };
const EMPTY: BForm = { title: '', slug: '', excerpt: '', content: '', tags: '', status: 'draft', seo_title: '', seo_description: '' };
const STATUS_COLORS: Record<string, string> = { draft: 'bg-yellow-500/20 text-yellow-400', published: 'bg-green-500/20 text-green-400', scheduled: 'bg-blue-500/20 text-blue-400' };

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [filtered, setFiltered] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<BForm>(EMPTY);
  const [editId, setEditId] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    const { data } = await supabase.from('blog_posts').select('*').order('created_at', { ascending: false });
    setPosts(data || []); setFiltered(data || []); setLoading(false);
  }, []);
  useEffect(() => { fetch(); }, [fetch]);

  const handleSearch = (q: string) => setFiltered(posts.filter(p => p.title.toLowerCase().includes(q.toLowerCase())));

  const openAdd = () => { setForm(EMPTY); setEditId(null); setOpen(true); };
  const openEdit = (p: BlogPost) => {
    setForm({ title: p.title, slug: p.slug, excerpt: p.excerpt || '', content: p.content || '', tags: (p.tags || []).join(', '), status: p.status, seo_title: p.seo_title || '', seo_description: p.seo_description || '' });
    setEditId(p.id); setOpen(true);
  };

  const handleSave = async () => {
    if (!form.title) { toast.error('Title required'); return; }
    const slug = form.slug || form.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const payload = { title: form.title, slug, excerpt: form.excerpt || null, content: form.content || null, tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : null, status: form.status, published_at: form.status === 'published' ? new Date().toISOString() : null, seo_title: form.seo_title || null, seo_description: form.seo_description || null };
    const { error } = editId ? await supabase.from('blog_posts').update(payload).eq('id', editId) : await supabase.from('blog_posts').insert(payload);
    if (error) { toast.error('Save failed'); return; }
    toast.success(editId ? 'Updated' : 'Created'); setOpen(false); fetch();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete post?')) return;
    await supabase.from('blog_posts').delete().eq('id', id);
    toast.success('Deleted'); fetch();
  };

  const columns = [
    { key: 'title', label: 'Title' },
    { key: 'status', label: 'Status', render: (r: BlogPost) => <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${STATUS_COLORS[r.status] || ''}`}>{r.status}</span> },
    { key: 'tags', label: 'Tags', render: (r: BlogPost) => <div className="flex gap-1 flex-wrap max-w-[160px]">{(r.tags || []).slice(0, 2).map(t => <Badge key={t} variant="secondary" className="text-xs">{t}</Badge>)}</div> },
    { key: 'created_at', label: 'Created', render: (r: BlogPost) => new Date(r.created_at).toLocaleDateString() },
  ];

  return (
    <>
      <AdminTable title="Blog Posts" data={filtered} columns={columns} loading={loading}
        onSearch={handleSearch} onAdd={openAdd} addLabel="New Post" emptyMessage="No posts"
        actions={row => (
          <div className="flex gap-1">
            <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => openEdit(row)}><Pencil className="w-3.5 h-3.5" /></Button>
            <Button size="sm" variant="ghost" className="h-7 w-7 p-0 hover:text-destructive" onClick={() => handleDelete(row.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
          </div>
        )}
      />
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-2xl max-h-[90dvh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editId ? 'Edit Post' : 'New Post'}</DialogTitle></DialogHeader>
          <div className="space-y-3 mt-2">
            <div className="space-y-1.5"><Label className="text-sm font-normal">Title *</Label><Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} /></div>
            <div className="space-y-1.5"><Label className="text-sm font-normal">Excerpt</Label><Textarea value={form.excerpt} onChange={e => setForm(f => ({ ...f, excerpt: e.target.value }))} rows={2} /></div>
            <div className="space-y-1.5"><Label className="text-sm font-normal">Content</Label><Textarea value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} rows={8} className="font-mono text-xs" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label className="text-sm font-normal">Tags (comma-separated)</Label><Input value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))} /></div>
              <div className="space-y-1.5">
                <Label className="text-sm font-normal">Status</Label>
                <Select value={form.status} onValueChange={(v) => setForm(f => ({ ...f, status: v as BlogPost['status'] }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="pt-1 border-t border-border space-y-3">
              <p className="text-xs text-muted-foreground font-medium">SEO</p>
              <div className="space-y-1.5"><Label className="text-sm font-normal">SEO Title</Label><Input value={form.seo_title} onChange={e => setForm(f => ({ ...f, seo_title: e.target.value }))} /></div>
              <div className="space-y-1.5"><Label className="text-sm font-normal">SEO Description</Label><Textarea value={form.seo_description} onChange={e => setForm(f => ({ ...f, seo_description: e.target.value }))} rows={2} /></div>
            </div>
            <div className="flex gap-2 pt-1">
              <Button variant="outline" className="flex-1" onClick={() => setOpen(false)}>Cancel</Button>
              <Button className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground" onClick={handleSave}>{editId ? 'Save' : 'Publish'}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

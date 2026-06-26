import { useState, useEffect } from 'react';
import { supabase } from '@/db/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Save, Loader2 } from 'lucide-react';

interface SeoField { key: string; label: string; type: 'input' | 'textarea'; placeholder?: string; }

const SEO_FIELDS: SeoField[] = [
  { key: 'meta_title', label: 'Meta Title', type: 'input', placeholder: 'CoreStack Technology – Enterprise Software Development' },
  { key: 'meta_description', label: 'Meta Description', type: 'textarea', placeholder: 'Building intelligent digital solutions…' },
  { key: 'meta_keywords', label: 'Meta Keywords', type: 'input', placeholder: 'software development, AI solutions, cloud computing' },
  { key: 'og_image_url', label: 'Open Graph Image URL', type: 'input' },
  { key: 'twitter_card', label: 'Twitter Card Type', type: 'input', placeholder: 'summary_large_image' },
  { key: 'canonical_url', label: 'Canonical URL', type: 'input', placeholder: 'https://corestacktech.com' },
  { key: 'robots_txt', label: 'Robots.txt Content', type: 'textarea', placeholder: 'User-agent: *\nAllow: /' },
];

export default function SEOPage() {
  const [values, setValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase.from('seo_settings').select('*').then(({ data }) => {
      const map: Record<string, string> = {};
      (data || []).forEach((row: { key: string; value?: string }) => { map[row.key] = row.value || ''; });
      setValues(map); setLoading(false);
    });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    const upserts = Object.entries(values).map(([key, value]) => ({ key, value, updated_at: new Date().toISOString() }));
    const { error } = await supabase.from('seo_settings').upsert(upserts, { onConflict: 'key' });
    setSaving(false);
    if (error) { toast.error('Save failed'); return; }
    toast.success('SEO settings saved');
  };

  if (loading) return <div className="flex items-center justify-center h-48"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">SEO Settings</h1>
        <p className="text-muted-foreground text-sm mt-1">Configure meta tags, Open Graph, and search engine settings.</p>
      </div>

      <div className="rounded-xl border border-border bg-card p-6 space-y-5">
        {SEO_FIELDS.map(field => (
          <div key={field.key} className="space-y-1.5">
            <Label className="text-sm font-normal">{field.label}</Label>
            {field.type === 'textarea' ? (
              <Textarea value={values[field.key] || ''} onChange={e => setValues(v => ({ ...v, [field.key]: e.target.value }))} rows={3} placeholder={field.placeholder} />
            ) : (
              <Input value={values[field.key] || ''} onChange={e => setValues(v => ({ ...v, [field.key]: e.target.value }))} placeholder={field.placeholder} />
            )}
          </div>
        ))}

        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold" onClick={handleSave} disabled={saving}>
          {saving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving…</> : <><Save className="w-4 h-4 mr-2" /> Save SEO Settings</>}
        </Button>
      </div>
    </div>
  );
}

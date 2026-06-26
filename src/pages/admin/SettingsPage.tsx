import { useState, useEffect } from 'react';
import { supabase } from '@/db/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Save, Loader2 } from 'lucide-react';

const SETTING_FIELDS = [
  { key: 'site_name', label: 'Site Name', type: 'input' as const },
  { key: 'contact_email', label: 'Contact Email', type: 'input' as const },
  { key: 'contact_phone', label: 'Contact Phone', type: 'input' as const },
  { key: 'address', label: 'Office Address', type: 'textarea' as const },
  { key: 'whatsapp_number', label: 'WhatsApp Number', type: 'input' as const },
  { key: 'google_analytics_id', label: 'Google Analytics ID', type: 'input' as const },
  { key: 'facebook_url', label: 'Facebook URL', type: 'input' as const },
  { key: 'twitter_url', label: 'Twitter URL', type: 'input' as const },
  { key: 'linkedin_url', label: 'LinkedIn URL', type: 'input' as const },
  { key: 'github_url', label: 'GitHub URL', type: 'input' as const },
  { key: 'instagram_url', label: 'Instagram URL', type: 'input' as const },
];

export default function SettingsPage() {
  const [values, setValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase.from('website_settings').select('*').then(({ data }) => {
      const map: Record<string, string> = {};
      (data || []).forEach((row: { key: string; value?: string }) => { map[row.key] = row.value || ''; });
      setValues(map); setLoading(false);
    });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    const upserts = SETTING_FIELDS.map(f => ({ key: f.key, value: values[f.key] || null, type: 'string', updated_at: new Date().toISOString() }));
    const { error } = await supabase.from('website_settings').upsert(upserts, { onConflict: 'key' });
    setSaving(false);
    if (error) { toast.error('Save failed'); return; }
    toast.success('Settings saved');
  };

  if (loading) return <div className="flex items-center justify-center h-48"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Website Settings</h1>
        <p className="text-muted-foreground text-sm mt-1">Configure general website information and social media links.</p>
      </div>

      <div className="rounded-xl border border-border bg-card p-6 space-y-5">
        {SETTING_FIELDS.map(field => (
          <div key={field.key} className="space-y-1.5">
            <Label className="text-sm font-normal">{field.label}</Label>
            {field.type === 'textarea' ? (
              <Textarea value={values[field.key] || ''} onChange={e => setValues(v => ({ ...v, [field.key]: e.target.value }))} rows={3} />
            ) : (
              <Input value={values[field.key] || ''} onChange={e => setValues(v => ({ ...v, [field.key]: e.target.value }))} />
            )}
          </div>
        ))}

        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold" onClick={handleSave} disabled={saving}>
          {saving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving…</> : <><Save className="w-4 h-4 mr-2" /> Save Settings</>}
        </Button>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { supabase } from '@/db/supabase';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Loader2, CalendarDays, CheckCircle, User, Building2, Briefcase, ChevronRight } from 'lucide-react';

const SERVICES = [
  'Custom Software Development', 'Mobile App Development', 'Cloud & DevOps',
  'AI & Machine Learning', 'UI/UX Design', 'ERP / CRM Solutions',
  'Cybersecurity', 'Digital Transformation', 'End-to-End Technology Services', 'Other',
];
const COMPANY_SIZES = ['1–10', '11–50', '51–200', '201–1,000', '1,000+'];
const INDUSTRIES = [
  'Technology', 'Healthcare', 'Finance & Fintech', 'Retail & E-commerce',
  'Manufacturing', 'Logistics', 'Real Estate', 'Education', 'Government', 'Other',
];
const BUDGETS = [
  'Under ₹8,30,000', '₹8,30,000 – ₹20,75,000', '₹20,75,000 – ₹41,50,000',
  '₹41,50,000 – ₹83,00,000', '₹83,00,000 – ₹2,07,50,000', '₹2,07,50,000+', 'Not sure yet',
];
const TIMELINES = ['Less than 1 month', '1–3 months', '3–6 months', '6–12 months', '12+ months', 'Flexible'];
const TIME_SLOTS = ['9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM'];

interface ConsultationForm {
  full_name: string; company_name: string; email: string; phone: string;
  company_size: string; industry: string; website_url: string;
  service_interested: string; project_budget: string; preferred_timeline: string;
  preferred_date: string; preferred_time: string; meeting_mode: 'Online' | 'Offline';
  project_description: string;
}

interface Props { open: boolean; onClose: () => void; }

export default function BookConsultationModal({ open, onClose }: Props) {
  const EMPTY: ConsultationForm = {
    full_name: '', company_name: '', email: '', phone: '',
    company_size: '', industry: '', website_url: '',
    service_interested: '', project_budget: '', preferred_timeline: '',
    preferred_date: '', preferred_time: '', meeting_mode: 'Online', project_description: '',
  };
  const [form, setForm] = useState<ConsultationForm>(EMPTY);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [appId, setAppId] = useState('');

  const set = (k: keyof ConsultationForm, v: string) => setForm(p => ({ ...p, [k]: v }));

  const handleClose = () => {
    if (!loading) {
      setForm(EMPTY);
      setSuccess(false);
      setAppId('');
      onClose();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.full_name || !form.email) { toast.error('Name and email are required'); return; }
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('consultation_requests')
        .insert({
          full_name: form.full_name,
          company_name: form.company_name || null,
          email: form.email,
          phone: form.phone || null,
          service_interested: form.service_interested || null,
          preferred_date: form.preferred_date || null,
          preferred_time: form.preferred_time || null,
          meeting_mode: form.meeting_mode,
          project_budget: form.project_budget || null,
          project_description: form.project_description || null,
          status: 'new',
        })
        .select('id, application_id')
        .single();
      if (error) throw error;
      setAppId(data?.application_id || '');
      if (data?.id) {
        supabase.functions.invoke('send-notification', { body: { type: 'consultation_request', record_id: data.id } }).catch(console.warn);
      }
      setSuccess(true);
    } catch {
      toast.error('Booking failed. Please try again or email us directly.');
    } finally {
      setLoading(false);
    }
  };

  // Get today's date string for min date
  const today = new Date().toISOString().split('T')[0];

  return (
    <Dialog open={open} onOpenChange={v => !v && handleClose()}>
      <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-2xl max-h-[90dvh] overflow-y-auto">
        {success ? (
          <div className="py-10 text-center">
            <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-5">
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
            <h2 className="text-2xl font-display font-bold text-foreground mb-2">Consultation Booked!</h2>
            <p className="text-muted-foreground mb-4 text-pretty">
              Thank you, <strong className="text-foreground">{form.full_name}</strong>! Your consultation request has been submitted.
              Our team will confirm your booking within 2 business hours.
            </p>
            {appId && (
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 border border-primary/20 text-primary text-sm font-mono mb-6">
                <CalendarDays className="w-4 h-4" /> Reference ID: {appId}
              </div>
            )}
            <div className="p-4 rounded-xl border border-border bg-muted/30 text-sm text-left space-y-1.5 mb-6">
              {form.preferred_date && <div className="flex gap-2"><span className="text-muted-foreground w-32 shrink-0">Date:</span><span className="text-foreground">{new Date(form.preferred_date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span></div>}
              {form.preferred_time && <div className="flex gap-2"><span className="text-muted-foreground w-32 shrink-0">Time:</span><span className="text-foreground">{form.preferred_time}</span></div>}
              <div className="flex gap-2"><span className="text-muted-foreground w-32 shrink-0">Meeting Mode:</span><span className="text-foreground">{form.meeting_mode}</span></div>
            </div>
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground" onClick={handleClose}>Done</Button>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="text-balance flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-primary" /> Book a Consultation
              </DialogTitle>
              <p className="text-sm text-muted-foreground">Our experts will get back to you within 2 business hours.</p>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4 mt-2">
              {/* Personal */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-sm font-normal">Full Name *</Label>
                  <Input placeholder="John Smith" value={form.full_name} onChange={e => set('full_name', e.target.value)} required />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm font-normal">Company Name</Label>
                  <Input placeholder="Acme Corp" value={form.company_name} onChange={e => set('company_name', e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm font-normal">Email Address *</Label>
                  <Input type="email" placeholder="john@company.com" value={form.email} onChange={e => set('email', e.target.value)} required />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm font-normal">Phone Number</Label>
                  <Input placeholder="+1 (555) 000-0000" value={form.phone} onChange={e => set('phone', e.target.value)} />
                </div>
              </div>

              {/* Service */}
              <div className="space-y-1.5">
                <Label className="text-sm font-normal">Service Interested In</Label>
                <Select value={form.service_interested} onValueChange={v => set('service_interested', v)}>
                  <SelectTrigger><SelectValue placeholder="Select a service" /></SelectTrigger>
                  <SelectContent>{SERVICES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>

              {/* Scheduling */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-sm font-normal">Preferred Date</Label>
                  <Input type="date" min={today} value={form.preferred_date} onChange={e => set('preferred_date', e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm font-normal">Preferred Time</Label>
                  <Select value={form.preferred_time} onValueChange={v => set('preferred_time', v)}>
                    <SelectTrigger><SelectValue placeholder="Select time slot" /></SelectTrigger>
                    <SelectContent>{TIME_SLOTS.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>

              {/* Meeting mode */}
              <div className="space-y-2">
                <Label className="text-sm font-normal">Meeting Mode</Label>
                <div className="flex gap-3">
                  {(['Online', 'Offline'] as const).map(mode => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => set('meeting_mode', mode)}
                      className={`flex-1 py-2.5 rounded-xl border text-sm font-medium transition-all ${form.meeting_mode === mode ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground hover:text-foreground hover:border-primary/40'}`}
                    >
                      {mode === 'Online' ? '🖥️' : '🏢'} {mode}
                    </button>
                  ))}
                </div>
              </div>

              {/* Budget */}
              <div className="space-y-1.5">
                <Label className="text-sm font-normal">Project Budget</Label>
                <Select value={form.project_budget} onValueChange={v => set('project_budget', v)}>
                  <SelectTrigger><SelectValue placeholder="Select budget range" /></SelectTrigger>
                  <SelectContent>{BUDGETS.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent>
                </Select>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <Label className="text-sm font-normal">Project Description</Label>
                <Textarea
                  placeholder="Tell us about your project goals, current challenges, and what success looks like for you…"
                  rows={4}
                  value={form.project_description}
                  onChange={e => set('project_description', e.target.value)}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" className="flex-1" onClick={handleClose} disabled={loading}>Cancel</Button>
                <Button type="submit" className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold" disabled={loading}>
                  {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Booking…</> : <><CalendarDays className="w-4 h-4 mr-2" />Book Consultation</>}
                </Button>
              </div>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

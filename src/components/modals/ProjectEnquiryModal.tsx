import { useState, useRef } from 'react';
import { supabase } from '@/db/supabase';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  Loader2, CheckCircle, User, FolderKanban, FileText, Eye,
  Upload, X, ChevronRight, ChevronLeft, Rocket,
} from 'lucide-react';

const PROJECT_TYPES = [
  'Web Application', 'Mobile App', 'E-commerce Platform', 'SaaS Product',
  'Enterprise Software', 'AI / ML Solution', 'API / Backend System',
  'UI/UX Design', 'Digital Transformation', 'Other',
];
const INDUSTRIES = [
  'Technology', 'Healthcare', 'Finance & Fintech', 'Retail & E-commerce',
  'Manufacturing', 'Logistics', 'Real Estate', 'Education', 'Government', 'Other',
];
const TECH_OPTIONS = [
  'React', 'Next.js', 'Vue.js', 'Angular', 'Node.js', 'Python', 'Java',
  'AWS', 'Azure', 'GCP', 'PostgreSQL', 'MongoDB', 'React Native', 'Flutter',
  'TensorFlow', 'OpenAI', 'Docker', 'Kubernetes', 'Other',
];
const BUDGETS = [
  'Under $10,000', '$10,000 – $25,000', '$25,000 – $50,000',
  '$50,000 – $100,000', '$100,000 – $250,000', '$250,000+', 'Not sure yet',
];
const TIMELINES = [
  '1–2 months', '3–4 months', '5–6 months', '6–12 months', '12+ months', 'Flexible',
];

interface ProjectForm {
  // Step 1
  full_name: string; company_name: string; email: string; phone: string;
  // Step 2
  project_name: string; project_type: string; industry: string;
  technologies: string[]; features: string; budget: string; deadline: string;
  // Step 3
  reference_website: string; additional_notes: string;
  document_url: string; logo_url: string;
}

const EMPTY_FORM: ProjectForm = {
  full_name: '', company_name: '', email: '', phone: '',
  project_name: '', project_type: '', industry: '',
  technologies: [], features: '', budget: '', deadline: '',
  reference_website: '', additional_notes: '', document_url: '', logo_url: '',
};

const STEPS = [
  { label: 'Customer Details', icon: User, desc: 'Who you are' },
  { label: 'Project Details', icon: FolderKanban, desc: 'What you need' },
  { label: 'Additional Info', icon: FileText, desc: 'Extra context' },
  { label: 'Review & Submit', icon: Eye, desc: 'Confirm & send' },
];

interface Props { open: boolean; onClose: () => void; }

export default function ProjectEnquiryModal({ open, onClose }: Props) {
  const [form, setForm] = useState<ProjectForm>(EMPTY_FORM);
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState<'doc' | 'logo' | null>(null);
  const [success, setSuccess] = useState(false);
  const [projectId, setProjectId] = useState('');
  const docRef = useRef<HTMLInputElement>(null);
  const logoRef = useRef<HTMLInputElement>(null);

  const set = (k: keyof ProjectForm, v: string | string[]) => setForm(p => ({ ...p, [k]: v }));

  const toggleTech = (t: string) => {
    set('technologies', form.technologies.includes(t)
      ? form.technologies.filter(x => x !== t)
      : [...form.technologies, t]);
  };

  const handleClose = () => {
    if (!loading) {
      setForm(EMPTY_FORM);
      setStep(0);
      setSuccess(false);
      setProjectId('');
      onClose();
    }
  };

  const uploadFile = async (file: File, type: 'doc' | 'logo') => {
    setUploading(type);
    try {
      const ext = file.name.split('.').pop();
      const path = `project-enquiries/${Date.now()}-${type}.${ext}`;
      const { error } = await supabase.storage.from('resumes').upload(path, file, { upsert: true });
      if (error) throw error;
      const { data } = supabase.storage.from('resumes').getPublicUrl(path);
      if (type === 'doc') set('document_url', data.publicUrl);
      else set('logo_url', data.publicUrl);
      toast.success(`${type === 'doc' ? 'Document' : 'Logo'} uploaded`);
    } catch {
      toast.error('Upload failed. Please try again.');
    } finally {
      setUploading(null);
    }
  };

  const validateStep = () => {
    if (step === 0) {
      if (!form.full_name || !form.email) { toast.error('Name and email are required'); return false; }
    }
    if (step === 1) {
      if (!form.project_name) { toast.error('Project name is required'); return false; }
    }
    return true;
  };

  const handleNext = () => { if (validateStep()) setStep(s => s + 1); };
  const handleBack = () => setStep(s => s - 1);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('project_requests')
        .insert({
          full_name: form.full_name, company_name: form.company_name || null,
          email: form.email, phone: form.phone || null,
          project_name: form.project_name, project_type: form.project_type || null,
          industry: form.industry || null,
          technologies: form.technologies.length ? form.technologies : null,
          features: form.features || null, budget: form.budget || null,
          deadline: form.deadline || null,
          reference_website: form.reference_website || null,
          additional_notes: form.additional_notes || null,
          document_url: form.document_url || null, logo_url: form.logo_url || null,
          status: 'new',
        })
        .select('id, project_id').single();
      if (error) throw error;
      setProjectId(data?.project_id || '');
      if (data?.id) {
        supabase.functions.invoke('send-notification', { body: { type: 'project_request', record_id: data.id } }).catch(console.warn);
      }
      setSuccess(true);
    } catch {
      toast.error('Submission failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const progress = ((step + 1) / STEPS.length) * 100;

  return (
    <Dialog open={open} onOpenChange={v => !v && handleClose()}>
      <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-2xl max-h-[90dvh] overflow-y-auto">
        {success ? (
          <div className="py-10 text-center">
            <div className="relative w-20 h-20 mx-auto mb-5">
              <div className="absolute inset-0 rounded-full bg-green-500/20 animate-ping" />
              <div className="relative w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center">
                <CheckCircle className="w-10 h-10 text-green-400" />
              </div>
            </div>
            <h2 className="text-2xl font-display font-bold text-foreground mb-2">Project Enquiry Submitted!</h2>
            <p className="text-muted-foreground mb-4 text-pretty">
              Thank you, <strong className="text-foreground">{form.full_name}</strong>! We've received your project enquiry and will respond within 24 hours.
            </p>
            {projectId && (
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 border border-primary/20 text-primary text-sm font-mono mb-6">
                <Rocket className="w-4 h-4" /> Project ID: {projectId}
              </div>
            )}
            <div className="p-4 rounded-xl border border-border bg-muted/30 text-sm text-left space-y-1.5 mb-6 max-w-sm mx-auto">
              <div className="flex gap-2"><span className="text-muted-foreground w-28 shrink-0">Project:</span><span className="text-foreground">{form.project_name}</span></div>
              {form.project_type && <div className="flex gap-2"><span className="text-muted-foreground w-28 shrink-0">Type:</span><span className="text-foreground">{form.project_type}</span></div>}
              {form.budget && <div className="flex gap-2"><span className="text-muted-foreground w-28 shrink-0">Budget:</span><span className="text-foreground">{form.budget}</span></div>}
            </div>
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground" onClick={handleClose}>Done</Button>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="text-balance flex items-center gap-2">
                <Rocket className="w-5 h-5 text-primary" /> Start Your Project
              </DialogTitle>
              <p className="text-sm text-muted-foreground">Complete this enquiry form and we'll build a tailored proposal for you.</p>
            </DialogHeader>

            {/* Progress bar */}
            <div className="mt-2">
              <div className="flex items-center justify-between mb-2">
                {STEPS.map((s, i) => (
                  <div key={s.label} className="flex items-center">
                    <div className={`flex items-center gap-1.5 ${i <= step ? 'opacity-100' : 'opacity-40'}`}>
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${i < step ? 'bg-primary text-primary-foreground' : i === step ? 'bg-primary text-primary-foreground ring-2 ring-primary/30' : 'bg-muted text-muted-foreground border border-border'}`}>
                        {i < step ? <CheckCircle className="w-3.5 h-3.5" /> : <s.icon className="w-3.5 h-3.5" />}
                      </div>
                      <span className="hidden sm:block text-xs font-medium text-foreground">{s.label}</span>
                    </div>
                    {i < STEPS.length - 1 && <ChevronRight className="w-3 h-3 text-muted-foreground mx-1 sm:mx-2" />}
                  </div>
                ))}
              </div>
              <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
              </div>
            </div>

            {/* Step content */}
            <div className="space-y-4 py-2">

              {/* Step 0: Customer Details */}
              {step === 0 && (
                <div className="space-y-3 p-4 rounded-xl border border-border bg-muted/20">
                  <div className="flex items-center gap-2 mb-1">
                    <User className="w-4 h-4 text-primary" />
                    <span className="text-sm font-semibold text-foreground">Customer Details</span>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-sm font-normal">Full Name *</Label>
                      <Input placeholder="John Smith" value={form.full_name} onChange={e => set('full_name', e.target.value)} />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-sm font-normal">Company Name</Label>
                      <Input placeholder="Acme Corp" value={form.company_name} onChange={e => set('company_name', e.target.value)} />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-sm font-normal">Email Address *</Label>
                      <Input type="email" placeholder="john@company.com" value={form.email} onChange={e => set('email', e.target.value)} />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-sm font-normal">Phone Number</Label>
                      <Input placeholder="+1 (555) 000-0000" value={form.phone} onChange={e => set('phone', e.target.value)} />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 1: Project Details */}
              {step === 1 && (
                <div className="space-y-3 p-4 rounded-xl border border-border bg-muted/20">
                  <div className="flex items-center gap-2 mb-1">
                    <FolderKanban className="w-4 h-4 text-primary" />
                    <span className="text-sm font-semibold text-foreground">Project Details</span>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5 sm:col-span-2">
                      <Label className="text-sm font-normal">Project Name *</Label>
                      <Input placeholder="e.g., Customer Portal v2" value={form.project_name} onChange={e => set('project_name', e.target.value)} />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-sm font-normal">Project Type</Label>
                      <Select value={form.project_type} onValueChange={v => set('project_type', v)}>
                        <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                        <SelectContent>{PROJECT_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-sm font-normal">Industry</Label>
                      <Select value={form.industry} onValueChange={v => set('industry', v)}>
                        <SelectTrigger><SelectValue placeholder="Select industry" /></SelectTrigger>
                        <SelectContent>{INDUSTRIES.map(i => <SelectItem key={i} value={i}>{i}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-sm font-normal">Budget</Label>
                      <Select value={form.budget} onValueChange={v => set('budget', v)}>
                        <SelectTrigger><SelectValue placeholder="Select budget" /></SelectTrigger>
                        <SelectContent>{BUDGETS.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-sm font-normal">Deadline</Label>
                      <Select value={form.deadline} onValueChange={v => set('deadline', v)}>
                        <SelectTrigger><SelectValue placeholder="Select timeline" /></SelectTrigger>
                        <SelectContent>{TIMELINES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-sm font-normal">Required Technologies</Label>
                    <div className="flex flex-wrap gap-2">
                      {TECH_OPTIONS.map(t => (
                        <button key={t} type="button" onClick={() => toggleTech(t)}
                          className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all border ${form.technologies.includes(t) ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground hover:border-primary/40 hover:text-foreground'}`}>
                          {t}
                        </button>
                      ))}
                    </div>
                    {form.technologies.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {form.technologies.map(t => (
                          <Badge key={t} variant="secondary" className="text-xs gap-1">
                            {t}
                            <button onClick={() => toggleTech(t)}><X className="w-2.5 h-2.5" /></button>
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-sm font-normal">Key Features Required</Label>
                    <Textarea placeholder="List the main features you need (e.g., user auth, payments, dashboard, notifications…)" rows={3}
                      value={form.features} onChange={e => set('features', e.target.value)} />
                  </div>
                </div>
              )}

              {/* Step 2: Additional Info */}
              {step === 2 && (
                <div className="space-y-3 p-4 rounded-xl border border-border bg-muted/20">
                  <div className="flex items-center gap-2 mb-1">
                    <FileText className="w-4 h-4 text-primary" />
                    <span className="text-sm font-semibold text-foreground">Additional Information</span>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-sm font-normal">Reference Website</Label>
                    <Input placeholder="https://example.com — a site you like the look/feel of" value={form.reference_website} onChange={e => set('reference_website', e.target.value)} />
                  </div>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {/* Document upload */}
                    <div className="space-y-1.5">
                      <Label className="text-sm font-normal">Upload Document (optional)</Label>
                      <input ref={docRef} type="file" className="hidden" accept=".pdf,.doc,.docx,.txt" onChange={e => e.target.files?.[0] && uploadFile(e.target.files[0], 'doc')} />
                      {form.document_url ? (
                        <div className="flex items-center gap-2 p-2.5 rounded-lg border border-primary/30 bg-primary/5 text-xs text-primary">
                          <FileText className="w-3.5 h-3.5 shrink-0" />
                          <span className="flex-1 min-w-0 truncate">Document uploaded</span>
                          <button onClick={() => set('document_url', '')}><X className="w-3 h-3" /></button>
                        </div>
                      ) : (
                        <button type="button" onClick={() => docRef.current?.click()} disabled={uploading === 'doc'}
                          className="w-full flex items-center justify-center gap-2 h-10 rounded-lg border-2 border-dashed border-border hover:border-primary/40 text-sm text-muted-foreground hover:text-foreground transition-colors">
                          {uploading === 'doc' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                          {uploading === 'doc' ? 'Uploading…' : 'Upload brief / spec'}
                        </button>
                      )}
                    </div>
                    {/* Logo upload */}
                    <div className="space-y-1.5">
                      <Label className="text-sm font-normal">Upload Logo (optional)</Label>
                      <input ref={logoRef} type="file" className="hidden" accept="image/*" onChange={e => e.target.files?.[0] && uploadFile(e.target.files[0], 'logo')} />
                      {form.logo_url ? (
                        <div className="flex items-center gap-2 p-2.5 rounded-lg border border-primary/30 bg-primary/5 text-xs text-primary">
                          <CheckCircle className="w-3.5 h-3.5 shrink-0" />
                          <span className="flex-1 min-w-0 truncate">Logo uploaded</span>
                          <button onClick={() => set('logo_url', '')}><X className="w-3 h-3" /></button>
                        </div>
                      ) : (
                        <button type="button" onClick={() => logoRef.current?.click()} disabled={uploading === 'logo'}
                          className="w-full flex items-center justify-center gap-2 h-10 rounded-lg border-2 border-dashed border-border hover:border-primary/40 text-sm text-muted-foreground hover:text-foreground transition-colors">
                          {uploading === 'logo' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                          {uploading === 'logo' ? 'Uploading…' : 'Upload brand logo'}
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-sm font-normal">Additional Notes</Label>
                    <Textarea placeholder="Anything else we should know? Special requirements, constraints, or context…" rows={4}
                      value={form.additional_notes} onChange={e => set('additional_notes', e.target.value)} />
                  </div>
                </div>
              )}

              {/* Step 3: Review */}
              {step === 3 && (
                <div className="space-y-3 p-4 rounded-xl border border-border bg-muted/20">
                  <div className="flex items-center gap-2 mb-1">
                    <Eye className="w-4 h-4 text-primary" />
                    <span className="text-sm font-semibold text-foreground">Review Your Enquiry</span>
                  </div>
                  <div className="space-y-3 text-sm">
                    {[
                      { section: 'Customer', rows: [['Name', form.full_name], ['Company', form.company_name || '—'], ['Email', form.email], ['Phone', form.phone || '—']] },
                      { section: 'Project', rows: [['Name', form.project_name], ['Type', form.project_type || '—'], ['Industry', form.industry || '—'], ['Budget', form.budget || '—'], ['Deadline', form.deadline || '—']] },
                    ].map(sec => (
                      <div key={sec.section} className="rounded-lg overflow-hidden border border-border">
                        <div className="px-3 py-1.5 bg-muted/40 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{sec.section}</div>
                        {sec.rows.map(([k, v]) => (
                          <div key={k} className="flex gap-3 px-3 py-2 border-t border-border first:border-0">
                            <span className="text-muted-foreground w-24 shrink-0 text-xs">{k}</span>
                            <span className="text-foreground text-xs">{v}</span>
                          </div>
                        ))}
                      </div>
                    ))}
                    {form.technologies.length > 0 && (
                      <div className="rounded-lg border border-border overflow-hidden">
                        <div className="px-3 py-1.5 bg-muted/40 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Technologies</div>
                        <div className="px-3 py-2 flex flex-wrap gap-1">
                          {form.technologies.map(t => <Badge key={t} variant="secondary" className="text-xs">{t}</Badge>)}
                        </div>
                      </div>
                    )}
                    {form.features && (
                      <div className="rounded-lg border border-border overflow-hidden">
                        <div className="px-3 py-1.5 bg-muted/40 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Key Features</div>
                        <div className="px-3 py-2 text-xs text-foreground whitespace-pre-wrap">{form.features}</div>
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground text-pretty">
                      By submitting you agree that CoreStack Technology may contact you regarding this enquiry. We'll generate a unique Project ID and respond within 24 hours.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Navigation buttons */}
            <div className="flex gap-3 pt-1">
              {step > 0 ? (
                <Button type="button" variant="outline" className="flex-1" onClick={handleBack} disabled={loading}>
                  <ChevronLeft className="w-4 h-4 mr-1" /> Back
                </Button>
              ) : (
                <Button type="button" variant="outline" className="flex-1" onClick={handleClose} disabled={loading}>Cancel</Button>
              )}
              {step < STEPS.length - 1 ? (
                <Button type="button" className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold" onClick={handleNext}>
                  Next <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              ) : (
                <Button type="button" className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold" onClick={handleSubmit} disabled={loading}>
                  {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Submitting…</> : <><Rocket className="w-4 h-4 mr-2" />Submit Enquiry</>}
                </Button>
              )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

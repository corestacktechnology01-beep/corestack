import { useState, useEffect } from 'react';
import { supabase } from '@/db/supabase';
import type { Career } from '@/types/types';
import { MapPin, Clock, Briefcase, GraduationCap, ArrowRight, X, Upload, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

// ─── Tech Stack (imported inline — same data as TechnologiesSection) ──────────

type TechCategory = 'Frontend' | 'Backend' | 'Database' | 'Cloud' | 'AI';

const TECH_STACK: Record<TechCategory, { name: string; color: string }[]> = {
  Frontend: [
    { name: 'React', color: '#61DAFB' },
    { name: 'Next.js', color: '#ffffff' },
    { name: 'Angular', color: '#DD0031' },
    { name: 'Vue.js', color: '#42b883' },
    { name: 'TypeScript', color: '#3178C6' },
    { name: 'Tailwind CSS', color: '#38BDF8' },
  ],
  Backend: [
    { name: 'Node.js', color: '#339933' },
    { name: 'Python', color: '#3776AB' },
    { name: 'Java', color: '#ED8B00' },
    { name: '.NET', color: '#512BD4' },
    { name: 'Go', color: '#00ADD8' },
    { name: 'FastAPI', color: '#009688' },
  ],
  Database: [
    { name: 'PostgreSQL', color: '#336791' },
    { name: 'MySQL', color: '#4479A1' },
    { name: 'MongoDB', color: '#47A248' },
    { name: 'Redis', color: '#DC382D' },
    { name: 'Firebase', color: '#FFCA28' },
    { name: 'Supabase', color: '#3ECF8E' },
  ],
  Cloud: [
    { name: 'AWS', color: '#FF9900' },
    { name: 'Azure', color: '#0089D6' },
    { name: 'Google Cloud', color: '#4285F4' },
    { name: 'Docker', color: '#2496ED' },
    { name: 'Kubernetes', color: '#326CE5' },
    { name: 'Terraform', color: '#7B42BC' },
  ],
  AI: [
    { name: 'OpenAI', color: '#10A37F' },
    { name: 'TensorFlow', color: '#FF6F00' },
    { name: 'PyTorch', color: '#EE4C2C' },
    { name: 'LangChain', color: '#1C3C3C' },
    { name: 'HuggingFace', color: '#FFD21E' },
    { name: 'Vertex AI', color: '#4285F4' },
  ],
};

const TECH_CATEGORIES: TechCategory[] = ['Frontend', 'Backend', 'Database', 'Cloud', 'AI'];

const CATEGORY_COLORS: Record<TechCategory, string> = {
  Frontend: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  Backend: 'bg-green-500/10 text-green-400 border-green-500/20',
  Database: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  Cloud: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  AI: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
};

function TechBadge({ name, color }: { name: string; color: string }) {
  const initials = name.slice(0, 2).toUpperCase();
  return (
    <div className="group flex flex-col items-center gap-2 p-4 rounded-xl border border-border bg-card hover:border-primary/40 hover:-translate-y-1 transition-all duration-200 cursor-default">
      <div
        className="w-10 h-10 rounded-lg flex items-center justify-center text-xs font-bold font-display"
        style={{ backgroundColor: `${color}18`, color, border: `1px solid ${color}30` }}
      >
        {initials}
      </div>
      <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors text-center whitespace-nowrap">{name}</span>
    </div>
  );
}

function TechnologiesTab() {
  const [active, setActive] = useState<TechCategory>('Frontend');
  return (
    <div>
      <div className="flex flex-wrap gap-2 justify-center mb-10">
        {TECH_CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setActive(cat)}
            className={`px-5 py-2 rounded-full text-sm font-medium border transition-all ${
              active === cat
                ? CATEGORY_COLORS[cat]
                : 'border-border text-muted-foreground hover:text-foreground'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4 max-w-3xl mx-auto">
        {TECH_STACK[active].map(tech => (
          <TechBadge key={tech.name} {...tech} />
        ))}
      </div>
      <p className="text-center text-sm text-muted-foreground mt-10">
        And many more — we evaluate and adopt the right tool for each unique project requirement.
      </p>
    </div>
  );
}

// ─── Apply Modal ──────────────────────────────────────────────────────────────

function ApplyModal({ job, open, onClose }: { job: Career | null; open: boolean; onClose: () => void }) {
  const [form, setForm] = useState({ full_name: '', email: '', phone: '', cover_letter: '', portfolio_url: '' });
  const [resume, setResume] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!job) return;
    if (!form.full_name || !form.email) { toast.error('Name and email are required'); return; }
    setLoading(true);
    try {
      let resume_url: string | null = null;
      if (resume) {
        const filename = `${Date.now()}_${resume.name.replace(/\s+/g, '_')}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('resumes')
          .upload(filename, resume, { contentType: resume.type });
        if (!uploadError && uploadData) {
          const { data: urlData } = supabase.storage.from('resumes').getPublicUrl(uploadData.path);
          resume_url = urlData.publicUrl;
        }
      }
      const { error } = await supabase.from('job_applications').insert({
        career_id: job.id,
        full_name: form.full_name,
        email: form.email,
        phone: form.phone || null,
        cover_letter: form.cover_letter || null,
        portfolio_url: form.portfolio_url || null,
        resume_url,
      });
      if (error) throw error;
      toast.success("Application submitted! We'll be in touch soon.");
      onClose();
      setForm({ full_name: '', email: '', phone: '', cover_letter: '', portfolio_url: '' });
      setResume(null);
    } catch {
      toast.error('Failed to submit application. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-lg max-h-[90dvh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-balance">Apply for {job?.title}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-sm font-normal">Full Name *</Label>
              <Input placeholder="John Smith" value={form.full_name} onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))} required />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-normal">Email *</Label>
              <Input type="email" placeholder="john@example.com" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-sm font-normal">Phone</Label>
              <Input placeholder="+1 (555) 000-0000" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-normal">Portfolio / LinkedIn URL</Label>
              <Input placeholder="https://..." value={form.portfolio_url} onChange={e => setForm(f => ({ ...f, portfolio_url: e.target.value }))} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm font-normal">Resume / CV</Label>
            <div className="border border-dashed border-border rounded-xl p-4 text-center cursor-pointer hover:border-primary/40 transition-colors relative">
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                className="absolute inset-0 opacity-0 cursor-pointer"
                onChange={e => setResume(e.target.files?.[0] || null)}
              />
              {resume ? (
                <div className="flex items-center justify-center gap-2 text-sm text-foreground">
                  <Upload className="w-4 h-4 text-primary" />
                  {resume.name}
                  <button type="button" onClick={() => setResume(null)}><X className="w-3 h-3 text-muted-foreground" /></button>
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">
                  <Upload className="w-5 h-5 mx-auto mb-1 text-muted-foreground" />
                  Click to upload PDF, DOC, or DOCX (max 5MB)
                </div>
              )}
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm font-normal">Cover Letter</Label>
            <Textarea
              placeholder="Tell us why you're the perfect fit for this role..."
              rows={4}
              value={form.cover_letter}
              onChange={e => setForm(f => ({ ...f, cover_letter: e.target.value }))}
            />
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose} disabled={loading}>Cancel</Button>
            <Button type="submit" className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground" disabled={loading}>
              {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Submitting…</> : 'Submit Application'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Job / Internship Card ────────────────────────────────────────────────────

function JobCard({ job, onApply }: { job: Career; onApply: (job: Career) => void }) {
  return (
    <div className="group flex flex-col gap-4 p-5 rounded-2xl border border-border bg-card hover:border-primary/40 hover:-translate-y-0.5 transition-all duration-200 h-full">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <h3 className="font-display font-semibold text-foreground">{job.title}</h3>
        </div>
        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><Briefcase className="w-3 h-3" />{job.department}</span>
          <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{job.location}</span>
          <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{job.type}</span>
          {job.salary_range && <span className="text-primary font-medium">{job.salary_range}</span>}
        </div>
        {job.description && (
          <p className="text-sm text-muted-foreground mt-3 text-pretty line-clamp-2">{job.description}</p>
        )}
      </div>
      <Button
        size="sm"
        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shrink-0 mt-auto"
        onClick={() => onApply(job)}
      >
        Apply Now <ArrowRight className="w-3.5 h-3.5 ml-1" />
      </Button>
    </div>
  );
}

// ─── Main Section ─────────────────────────────────────────────────────────────

const TABS = ['Technologies', 'Job Positions', 'Internships'] as const;
type Tab = typeof TABS[number];

export default function CareersSection() {
  const [careers, setCareers] = useState<Career[]>([]);
  const [loadingCareers, setLoadingCareers] = useState(true);
  const [selected, setSelected] = useState<Career | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('Technologies');

  useEffect(() => {
    supabase
      .from('careers')
      .select('*')
      .eq('is_active', true)
      .order('created_at')
      .then(({ data }) => {
        setLoadingCareers(false);
        if (data) setCareers(data);
      });
  }, []);

  const jobPositions = careers.filter(c => !c.is_internship);
  const internships = careers.filter(c => c.is_internship);

  return (
    <section id="careers" className="section-padding bg-background">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="text-primary font-semibold text-sm uppercase tracking-widest">Careers</span>
          <h2 className="text-3xl md:text-5xl font-display font-bold text-foreground mt-3 mb-5 text-balance">
            Join Our World-Class{' '}
            <span className="gradient-text">Team</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto text-pretty">
            Work on challenging problems that impact millions. We hire exceptional people and give
            them the freedom, resources, and support to do their best work.
          </p>
        </div>

        {/* Culture highlights */}
        <div className="grid sm:grid-cols-3 gap-4 mb-12">
          {[
            { icon: '🌍', title: 'Remote First', desc: 'Work from anywhere in the world, with flexible hours.' },
            { icon: '📈', title: 'Growth & Learning', desc: '₹4.15 lakh annual learning budget + in-house mentorship programs.' },
            { icon: '⚡', title: 'Cutting-Edge Tech', desc: "Build with the world's best tools on problems that matter." },
          ].map(item => (
            <div key={item.title} className="p-5 rounded-xl border border-border bg-card text-center">
              <div className="text-3xl mb-2">{item.icon}</div>
              <div className="font-semibold text-foreground mb-1">{item.title}</div>
              <div className="text-sm text-muted-foreground">{item.desc}</div>
            </div>
          ))}
        </div>

        {/* Tab bar */}
        <div className="flex flex-wrap gap-2 justify-center mb-10">
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2.5 rounded-full text-sm font-semibold border transition-all duration-200 ${
                activeTab === tab
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'border-border text-muted-foreground hover:text-foreground hover:border-primary/40'
              }`}
            >
              {tab === 'Job Positions' && <Briefcase className="w-3.5 h-3.5 inline mr-1.5 -mt-0.5" />}
              {tab === 'Internships' && <GraduationCap className="w-3.5 h-3.5 inline mr-1.5 -mt-0.5" />}
              {tab}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {activeTab === 'Technologies' && <TechnologiesTab />}

        {activeTab === 'Job Positions' && (
          <>
            {loadingCareers ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {[1, 2, 3, 4].map(i => <div key={i} className="h-44 rounded-2xl bg-card animate-pulse" />)}
              </div>
            ) : jobPositions.length > 0 ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {jobPositions.map(job => (
                  <JobCard key={job.id} job={job} onApply={setSelected} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 text-muted-foreground">
                <Briefcase className="w-10 h-10 mx-auto mb-3 opacity-40" />
                <p>No open positions right now.</p>
                <p className="text-sm mt-1">Send your resume to{' '}
                  <a href="mailto:careers@corestacktech.com" className="text-primary hover:underline">
                    careers@corestacktech.com
                  </a>
                </p>
              </div>
            )}
          </>
        )}

        {activeTab === 'Internships' && (
          <>
            {loadingCareers ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {[1, 2, 3, 4].map(i => <div key={i} className="h-44 rounded-2xl bg-card animate-pulse" />)}
              </div>
            ) : internships.length > 0 ? (
              <>
                <div className="p-5 rounded-xl border border-green-500/20 bg-green-500/5 mb-8 flex items-start gap-3">
                  <GraduationCap className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
                  <p className="text-sm text-muted-foreground text-pretty">
                    Our internship program is designed for students and recent graduates ready to tackle
                    real challenges. You'll work alongside senior engineers on production-grade projects.
                  </p>
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
                  {internships.map(job => (
                    <JobCard key={job.id} job={job} onApply={setSelected} />
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-16 text-muted-foreground">
                <GraduationCap className="w-10 h-10 mx-auto mb-3 opacity-40" />
                <p>No internship openings right now.</p>
                <p className="text-sm mt-1">Check back soon or email{' '}
                  <a href="mailto:internships@corestacktech.com" className="text-primary hover:underline">
                    internships@corestacktech.com
                  </a>
                </p>
              </div>
            )}
          </>
        )}
      </div>

      <ApplyModal job={selected} open={!!selected} onClose={() => setSelected(null)} />
    </section>
  );
}

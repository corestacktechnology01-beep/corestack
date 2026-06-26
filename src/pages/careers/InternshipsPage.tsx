import { useState } from 'react';
import Header from '@/components/layouts/Header';
import Footer from '@/components/layouts/Footer';
import { supabase } from '@/db/supabase';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import BackButton from '@/components/ui/BackButton';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Clock, DollarSign, Zap, CheckCircle, Upload, X, ChevronRight, Loader2, GraduationCap } from 'lucide-react';

// ─── Static internship data ───────────────────────────────────────────────────
interface InternshipRole {
  id: string;
  title: string;
  department: string;
  duration: string;
  stipend: string;
  skills: string[];
  description: string;
  color: string;
}

const INTERNSHIPS: InternshipRole[] = [
  {
    id: 'sw-intern',
    title: 'Software Development Intern',
    department: 'Engineering',
    duration: '3–6 Months',
    stipend: '$1,500 / month',
    description: 'Work alongside senior engineers on production-grade features. Build scalable backend services, APIs, and contribute to architecture decisions.',
    skills: ['Python', 'Node.js', 'REST APIs', 'Git', 'PostgreSQL'],
    color: '#61DAFB',
  },
  {
    id: 'web-intern',
    title: 'Web Development Intern',
    department: 'Frontend',
    duration: '3–6 Months',
    stipend: '$1,200 / month',
    description: 'Build responsive, performant web interfaces using modern React stack. Turn Figma designs into pixel-perfect UI components.',
    skills: ['React', 'TypeScript', 'Tailwind CSS', 'Vite', 'HTML/CSS'],
    color: '#42b883',
  },
  {
    id: 'uiux-intern',
    title: 'UI/UX Design Intern',
    department: 'Design',
    duration: '3 Months',
    stipend: '$1,000 / month',
    description: 'Design beautiful and intuitive user experiences from wireframes to high-fidelity prototypes. Conduct user research and usability testing.',
    skills: ['Figma', 'Prototyping', 'User Research', 'Design Systems', 'Accessibility'],
    color: '#A855F7',
  },
  {
    id: 'marketing-intern',
    title: 'Digital Marketing Intern',
    department: 'Marketing',
    duration: '3 Months',
    stipend: '$800 / month',
    description: 'Drive brand awareness through SEO, social media, and content marketing. Analyze campaigns and optimize for ROI.',
    skills: ['SEO', 'Google Analytics', 'Content Marketing', 'Social Media', 'Copywriting'],
    color: '#F97316',
  },
];

const STEPS = ['Personal Details', 'Academic Details', 'Internship Preferences', 'Documents'];

function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center justify-center gap-2 mb-6">
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} className="flex items-center gap-2">
          <div className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold transition-all ${i < current ? 'bg-primary text-primary-foreground' : i === current ? 'bg-primary text-primary-foreground ring-2 ring-primary/30' : 'bg-muted text-muted-foreground'}`}>
            {i < current ? <CheckCircle className="w-4 h-4" /> : i + 1}
          </div>
          {i < total - 1 && <div className={`h-0.5 w-8 transition-all ${i < current ? 'bg-primary' : 'bg-border'}`} />}
        </div>
      ))}
    </div>
  );
}

// ─── Internship Apply Modal ───────────────────────────────────────────────────
function InternshipApplyModal({ role, open, onClose }: { role: InternshipRole | null; open: boolean; onClose: () => void }) {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [s1, setS1] = useState({ full_name: '', email: '', phone: '', date_of_birth: '', gender: '' });
  const [s2, setS2] = useState({ college_name: '', university: '', degree: '', department: '', current_year: '', cgpa: '' });
  const [s3, setS3] = useState({ internship_role: '', skills: '', project_experience: '', available_start_date: '', internship_duration: '' });
  const [s4, setS4] = useState({ resume: null as File | null, college_id: null as File | null, declaration: false });

  const reset = () => { setStep(0); setS1({ full_name: '', email: '', phone: '', date_of_birth: '', gender: '' }); setS2({ college_name: '', university: '', degree: '', department: '', current_year: '', cgpa: '' }); setS3({ internship_role: '', skills: '', project_experience: '', available_start_date: '', internship_duration: '' }); setS4({ resume: null, college_id: null, declaration: false }); };
  const handleClose = () => { reset(); onClose(); };

  const uploadFile = async (file: File) => {
    const fn = `${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
    const { data, error } = await supabase.storage.from('resumes').upload(fn, file, { contentType: file.type });
    if (error || !data) return null;
    return supabase.storage.from('resumes').getPublicUrl(data.path).data.publicUrl;
  };

  const handleSubmit = async () => {
    if (!s4.declaration) { toast.error('Please accept the declaration'); return; }
    setLoading(true);
    try {
      const [resume_url, college_id_url] = await Promise.all([
        s4.resume ? uploadFile(s4.resume) : Promise.resolve(null),
        s4.college_id ? uploadFile(s4.college_id) : Promise.resolve(null),
      ]);
      const { data: inserted, error } = await supabase.from('internship_applications').insert({
        full_name: s1.full_name, email: s1.email, phone: s1.phone || null,
        date_of_birth: s1.date_of_birth || null, gender: s1.gender || null,
        college_name: s2.college_name || null, university: s2.university || null,
        degree: s2.degree || null, department: s2.department || null,
        current_year: s2.current_year || null, cgpa: s2.cgpa || null,
        internship_role: s3.internship_role || role?.title || null,
        skills: s3.skills ? s3.skills.split(',').map(s => s.trim()).filter(Boolean) : null,
        project_experience: s3.project_experience || null,
        available_start_date: s3.available_start_date || null,
        internship_duration: s3.internship_duration || role?.duration || null,
        resume_url, college_id_url, declaration_accepted: s4.declaration, status: 'new',
      }).select('id').single();
      if (error) throw error;
      if (inserted?.id) {
        supabase.functions.invoke('send-notification', { body: { type: 'internship_application', record_id: inserted.id } }).catch(console.warn);
      }
      toast.success('Internship application submitted! We\'ll review and get back to you.');
      handleClose();
    } catch { toast.error('Submission failed. Please try again.'); }
    finally { setLoading(false); }
  };

  if (!role) return null;
  return (
    <Dialog open={open} onOpenChange={v => !v && handleClose()}>
      <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-2xl max-h-[90dvh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-balance">Apply — {role.title}</DialogTitle>
          <p className="text-sm text-muted-foreground">{role.department} · {role.duration} · {role.stipend}</p>
        </DialogHeader>
        <StepIndicator current={step} total={4} />
        <p className="text-center text-sm font-semibold text-primary mb-5">Step {step + 1}: {STEPS[step]}</p>

        {step === 0 && (
          <div className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5"><Label className="text-sm font-normal">Full Name *</Label><Input placeholder="Jane Doe" value={s1.full_name} onChange={e => setS1(p => ({ ...p, full_name: e.target.value }))} /></div>
              <div className="space-y-1.5"><Label className="text-sm font-normal">Email *</Label><Input type="email" placeholder="jane@college.edu" value={s1.email} onChange={e => setS1(p => ({ ...p, email: e.target.value }))} /></div>
              <div className="space-y-1.5"><Label className="text-sm font-normal">Mobile Number</Label><Input placeholder="+1 (555) 000-0000" value={s1.phone} onChange={e => setS1(p => ({ ...p, phone: e.target.value }))} /></div>
              <div className="space-y-1.5"><Label className="text-sm font-normal">Date of Birth</Label><Input type="date" value={s1.date_of_birth} onChange={e => setS1(p => ({ ...p, date_of_birth: e.target.value }))} /></div>
            </div>
            <div className="space-y-1.5"><Label className="text-sm font-normal">Gender</Label>
              <Select value={s1.gender} onValueChange={v => setS1(p => ({ ...p, gender: v }))}>
                <SelectTrigger><SelectValue placeholder="Select gender" /></SelectTrigger>
                <SelectContent><SelectItem value="male">Male</SelectItem><SelectItem value="female">Female</SelectItem><SelectItem value="other">Other</SelectItem><SelectItem value="prefer_not">Prefer not to say</SelectItem></SelectContent>
              </Select>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5"><Label className="text-sm font-normal">College Name</Label><Input placeholder="MIT" value={s2.college_name} onChange={e => setS2(p => ({ ...p, college_name: e.target.value }))} /></div>
              <div className="space-y-1.5"><Label className="text-sm font-normal">University</Label><Input placeholder="University of California" value={s2.university} onChange={e => setS2(p => ({ ...p, university: e.target.value }))} /></div>
              <div className="space-y-1.5"><Label className="text-sm font-normal">Degree</Label><Input placeholder="B.Tech / B.Sc / BCA" value={s2.degree} onChange={e => setS2(p => ({ ...p, degree: e.target.value }))} /></div>
              <div className="space-y-1.5"><Label className="text-sm font-normal">Department</Label><Input placeholder="Computer Science" value={s2.department} onChange={e => setS2(p => ({ ...p, department: e.target.value }))} /></div>
              <div className="space-y-1.5"><Label className="text-sm font-normal">Current Year / Semester</Label><Input placeholder="3rd Year / 6th Sem" value={s2.current_year} onChange={e => setS2(p => ({ ...p, current_year: e.target.value }))} /></div>
              <div className="space-y-1.5"><Label className="text-sm font-normal">CGPA / Percentage</Label><Input placeholder="8.5 / 85%" value={s2.cgpa} onChange={e => setS2(p => ({ ...p, cgpa: e.target.value }))} /></div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div className="space-y-1.5"><Label className="text-sm font-normal">Preferred Internship Role</Label><Input placeholder={role.title} value={s3.internship_role} onChange={e => setS3(p => ({ ...p, internship_role: e.target.value }))} /></div>
            <div className="space-y-1.5"><Label className="text-sm font-normal">Skills (comma-separated)</Label><Input placeholder="React, Python, Figma…" value={s3.skills} onChange={e => setS3(p => ({ ...p, skills: e.target.value }))} /></div>
            <div className="space-y-1.5"><Label className="text-sm font-normal">Project Experience</Label><Textarea placeholder="Describe any academic or personal projects…" rows={3} value={s3.project_experience} onChange={e => setS3(p => ({ ...p, project_experience: e.target.value }))} /></div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5"><Label className="text-sm font-normal">Available Start Date</Label><Input type="date" value={s3.available_start_date} onChange={e => setS3(p => ({ ...p, available_start_date: e.target.value }))} /></div>
              <div className="space-y-1.5"><Label className="text-sm font-normal">Preferred Duration</Label>
                <Select value={s3.internship_duration} onValueChange={v => setS3(p => ({ ...p, internship_duration: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select duration" /></SelectTrigger>
                  <SelectContent><SelectItem value="1 month">1 Month</SelectItem><SelectItem value="2 months">2 Months</SelectItem><SelectItem value="3 months">3 Months</SelectItem><SelectItem value="6 months">6 Months</SelectItem></SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-5">
            {[{ label: 'Resume / CV *', key: 'resume' as const }, { label: 'College ID Card (optional)', key: 'college_id' as const }].map(f => (
              <div key={f.key} className="space-y-1.5">
                <Label className="text-sm font-normal">{f.label}</Label>
                <div className="relative border border-dashed border-border rounded-xl p-5 text-center hover:border-primary/40 transition-colors cursor-pointer">
                  <input type="file" accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={e => setS4(p => ({ ...p, [f.key]: e.target.files?.[0] || null }))} />
                  {s4[f.key] ? (
                    <div className="flex items-center justify-center gap-2 text-sm text-foreground">
                      <Upload className="w-4 h-4 text-primary" />{(s4[f.key] as File).name}
                      <button type="button" onClick={e => { e.stopPropagation(); setS4(p => ({ ...p, [f.key]: null })); }}><X className="w-3 h-3 text-muted-foreground" /></button>
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground"><Upload className="w-5 h-5 mx-auto mb-1" />Click to upload</div>
                  )}
                </div>
              </div>
            ))}
            <label className="flex items-start gap-3 cursor-pointer">
              <div onClick={() => setS4(p => ({ ...p, declaration: !p.declaration }))}
                className={`w-5 h-5 rounded border mt-0.5 flex items-center justify-center shrink-0 transition-all cursor-pointer ${s4.declaration ? 'bg-primary border-primary' : 'border-border hover:border-primary/60'}`}>
                {s4.declaration && <CheckCircle className="w-3 h-3 text-white" />}
              </div>
              <span className="text-sm text-muted-foreground text-pretty">I declare that the information is accurate and I'm currently enrolled in a college/university.</span>
            </label>
          </div>
        )}

        <div className="flex gap-3 mt-6 pt-4 border-t border-border">
          <Button type="button" variant="outline" className="flex-1" onClick={() => step === 0 ? handleClose() : setStep(s => s - 1)}>
            {step === 0 ? 'Cancel' : '← Back'}
          </Button>
          {step < 3 ? (
            <Button className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
              onClick={() => { if (step === 0 && (!s1.full_name || !s1.email)) { toast.error('Name and email are required'); return; } setStep(s => s + 1); }}>
              Next <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          ) : (
            <Button className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground" onClick={handleSubmit} disabled={loading}>
              {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Submitting…</> : 'Submit Application'}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Internship Card ──────────────────────────────────────────────────────────
function InternshipCard({ role, onApply }: { role: InternshipRole; onApply: (r: InternshipRole) => void }) {
  return (
    <div className="group flex flex-col gap-4 p-6 rounded-2xl border border-border bg-card hover:border-primary/40 hover:-translate-y-1 hover:shadow-hover transition-all duration-300 h-full">
      <div className="flex-1">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"
          style={{ backgroundColor: `${role.color}18`, border: `1px solid ${role.color}30` }}>
          <GraduationCap className="w-6 h-6" style={{ color: role.color }} />
        </div>
        <h3 className="font-display font-bold text-foreground mb-1 text-balance">{role.title}</h3>
        <p className="text-xs text-muted-foreground mb-3">{role.department}</p>
        <p className="text-sm text-muted-foreground text-pretty mb-4">{role.description}</p>
        <div className="space-y-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-2"><Clock className="w-3.5 h-3.5 text-primary shrink-0" /><span>{role.duration}</span></div>
          <div className="flex items-center gap-2"><DollarSign className="w-3.5 h-3.5 text-primary shrink-0" /><span>{role.stipend}</span></div>
        </div>
        <div className="flex flex-wrap gap-1.5 mt-4">
          {role.skills.map(s => <span key={s} className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">{s}</span>)}
        </div>
      </div>
      <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground mt-auto shrink-0" onClick={() => onApply(role)}>
        Apply Now <Zap className="w-3.5 h-3.5 ml-1" />
      </Button>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function InternshipsPage() {
  const [selected, setSelected] = useState<InternshipRole | null>(null);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow pt-16">
        <section className="section-padding bg-background">
          <div className="container mx-auto px-4 max-w-7xl">
            <div className="mb-6"><BackButton /></div>
            <div className="text-center mb-16">
              <span className="text-primary font-semibold text-sm uppercase tracking-widest">Internships</span>
              <h1 className="text-3xl md:text-5xl font-display font-bold text-foreground mt-3 mb-5 text-balance">
                Launch Your Career with <span className="gradient-text">CoreStack</span>
              </h1>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto text-pretty">
                Gain real-world experience on production-grade software. Our internship program is
                designed to accelerate your career from day one.
              </p>
            </div>

            {/* Benefits strip */}
            <div className="grid sm:grid-cols-3 gap-4 mb-14">
              {[
                { emoji: '🎓', title: 'Real Projects', desc: 'Work on live production systems, not just toy projects.' },
                { emoji: '🧑‍🏫', title: 'Senior Mentors', desc: 'Paired with experienced engineers who invest in your growth.' },
                { emoji: '📜', title: 'Certificate + PPO', desc: 'Earn a certificate and potential Pre-Placement Offer.' },
              ].map(b => (
                <div key={b.title} className="p-5 rounded-xl border border-border bg-card text-center">
                  <div className="text-3xl mb-2">{b.emoji}</div>
                  <div className="font-semibold text-foreground mb-1">{b.title}</div>
                  <div className="text-sm text-muted-foreground">{b.desc}</div>
                </div>
              ))}
            </div>

            {/* 4 internship cards */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {INTERNSHIPS.map(role => <InternshipCard key={role.id} role={role} onApply={setSelected} />)}
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <InternshipApplyModal role={selected} open={!!selected} onClose={() => setSelected(null)} />
    </div>
  );
}

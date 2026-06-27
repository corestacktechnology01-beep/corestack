import { useState, useEffect } from 'react';
import Header from '@/components/layouts/Header';
import Footer from '@/components/layouts/Footer';
import { supabase } from '@/db/supabase';
import type { Career } from '@/types/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import BackButton from '@/components/ui/BackButton';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { MapPin, Clock, Briefcase, DollarSign, ArrowRight, Loader2, CheckCircle, X, Upload, ChevronRight } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────
interface Step1 { full_name: string; email: string; phone: string; date_of_birth: string; gender: string; address: string; city: string; state: string; }
interface Step2 { qualification: string; university: string; passing_year: string; percentage: string; certifications: string; }
interface Step3 { experience_years: string; current_company: string; current_salary: string; expected_salary: string; skills: string; linkedin_url: string; portfolio_url: string; }
interface Step4 { resume: File | null; cover_letter_file: File | null; declaration: boolean; }

const STEPS = ['Personal Details', 'Educational Details', 'Professional Details', 'Documents'];

// ─── Step indicator ───────────────────────────────────────────────────────────
function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center justify-center gap-2 mb-8">
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

// ─── Apply Modal ──────────────────────────────────────────────────────────────
function JobApplyModal({ job, open, onClose }: { job: Career | null; open: boolean; onClose: () => void }) {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [s1, setS1] = useState<Step1>({ full_name: '', email: '', phone: '', date_of_birth: '', gender: '', address: '', city: '', state: '' });
  const [s2, setS2] = useState<Step2>({ qualification: '', university: '', passing_year: '', percentage: '', certifications: '' });
  const [s3, setS3] = useState<Step3>({ experience_years: '', current_company: '', current_salary: '', expected_salary: '', skills: '', linkedin_url: '', portfolio_url: '' });
  const [s4, setS4] = useState<Step4>({ resume: null, cover_letter_file: null, declaration: false });

  const reset = () => { setStep(0); setS1({ full_name: '', email: '', phone: '', date_of_birth: '', gender: '', address: '', city: '', state: '' }); setS2({ qualification: '', university: '', passing_year: '', percentage: '', certifications: '' }); setS3({ experience_years: '', current_company: '', current_salary: '', expected_salary: '', skills: '', linkedin_url: '', portfolio_url: '' }); setS4({ resume: null, cover_letter_file: null, declaration: false }); };

  const handleClose = () => { reset(); onClose(); };

  const uploadFile = async (file: File, bucket: string) => {
    const filename = `${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
    const { data, error } = await supabase.storage.from(bucket).upload(filename, file, { contentType: file.type });
    if (error || !data) return null;
    return supabase.storage.from(bucket).getPublicUrl(data.path).data.publicUrl;
  };

  const handleSubmit = async () => {
    if (!s4.declaration) { toast.error('Please accept the declaration'); return; }
    if (!job) return;
    setLoading(true);
    try {
      const [resume_url, cover_letter_url] = await Promise.all([
        s4.resume ? uploadFile(s4.resume, 'resumes') : Promise.resolve(null),
        s4.cover_letter_file ? uploadFile(s4.cover_letter_file, 'resumes') : Promise.resolve(null),
      ]);
      const { data: inserted, error } = await supabase.from('job_applications').insert({
        career_id: job.id,
        full_name: s1.full_name, email: s1.email, phone: s1.phone || null,
        date_of_birth: s1.date_of_birth || null, gender: s1.gender || null,
        address: s1.address || null, city: s1.city || null, state: s1.state || null,
        qualification: s2.qualification || null, university: s2.university || null,
        passing_year: s2.passing_year || null, percentage: s2.percentage || null,
        certifications: s2.certifications || null,
        experience_years: s3.experience_years || null, current_company: s3.current_company || null,
        current_salary: s3.current_salary || null, expected_salary: s3.expected_salary || null,
        skills: s3.skills ? s3.skills.split(',').map(s => s.trim()).filter(Boolean) : null,
        linkedin_url: s3.linkedin_url || null, portfolio_url: s3.portfolio_url || null,
        resume_url, cover_letter_url, status: 'new',
      }).select('id').single();
      if (error) throw error;
      // Fire-and-forget email notification
      if (inserted?.id) {
        supabase.functions.invoke('send-notification', { body: { type: 'job_application', record_id: inserted.id } }).catch(console.warn);
      }
      toast.success('Application submitted successfully! You will receive a confirmation email shortly.');
      handleClose();
    } catch { toast.error('Submission failed. Please try again.'); }
    finally { setLoading(false); }
  };

  if (!job) return null;

  return (
    <Dialog open={open} onOpenChange={v => !v && handleClose()}>
      <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-2xl max-h-[90dvh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-balance">Apply for {job.title}</DialogTitle>
          <p className="text-sm text-muted-foreground">{job.department} · {job.location} · {job.type}</p>
        </DialogHeader>

        <StepIndicator current={step} total={4} />
        <p className="text-center text-sm font-semibold text-primary mb-6">Step {step + 1}: {STEPS[step]}</p>

        {/* Step 1 */}
        {step === 0 && (
          <div className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5"><Label className="text-sm font-normal">Full Name *</Label><Input placeholder="John Smith" value={s1.full_name} onChange={e => setS1(p => ({ ...p, full_name: e.target.value }))} /></div>
              <div className="space-y-1.5"><Label className="text-sm font-normal">Email *</Label><Input type="email" placeholder="john@example.com" value={s1.email} onChange={e => setS1(p => ({ ...p, email: e.target.value }))} /></div>
              <div className="space-y-1.5"><Label className="text-sm font-normal">Mobile Number</Label><Input placeholder="+1 (555) 000-0000" value={s1.phone} onChange={e => setS1(p => ({ ...p, phone: e.target.value }))} /></div>
              <div className="space-y-1.5"><Label className="text-sm font-normal">Date of Birth</Label><Input type="date" value={s1.date_of_birth} onChange={e => setS1(p => ({ ...p, date_of_birth: e.target.value }))} /></div>
              <div className="space-y-1.5"><Label className="text-sm font-normal">Gender</Label>
                <Select value={s1.gender} onValueChange={v => setS1(p => ({ ...p, gender: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select gender" /></SelectTrigger>
                  <SelectContent><SelectItem value="male">Male</SelectItem><SelectItem value="female">Female</SelectItem><SelectItem value="other">Other</SelectItem><SelectItem value="prefer_not">Prefer not to say</SelectItem></SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5"><Label className="text-sm font-normal">City</Label><Input placeholder="San Francisco" value={s1.city} onChange={e => setS1(p => ({ ...p, city: e.target.value }))} /></div>
            </div>
            <div className="space-y-1.5"><Label className="text-sm font-normal">Address</Label><Input placeholder="123 Main Street" value={s1.address} onChange={e => setS1(p => ({ ...p, address: e.target.value }))} /></div>
            <div className="space-y-1.5"><Label className="text-sm font-normal">State</Label><Input placeholder="California" value={s1.state} onChange={e => setS1(p => ({ ...p, state: e.target.value }))} /></div>
          </div>
        )}

        {/* Step 2 */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5"><Label className="text-sm font-normal">Highest Qualification</Label><Input placeholder="B.Tech / MBA / etc." value={s2.qualification} onChange={e => setS2(p => ({ ...p, qualification: e.target.value }))} /></div>
              <div className="space-y-1.5"><Label className="text-sm font-normal">University / Institution</Label><Input placeholder="Stanford University" value={s2.university} onChange={e => setS2(p => ({ ...p, university: e.target.value }))} /></div>
              <div className="space-y-1.5"><Label className="text-sm font-normal">Passing Year</Label><Input placeholder="2022" value={s2.passing_year} onChange={e => setS2(p => ({ ...p, passing_year: e.target.value }))} /></div>
              <div className="space-y-1.5"><Label className="text-sm font-normal">Percentage / CGPA</Label><Input placeholder="8.5 CGPA / 85%" value={s2.percentage} onChange={e => setS2(p => ({ ...p, percentage: e.target.value }))} /></div>
            </div>
            <div className="space-y-1.5"><Label className="text-sm font-normal">Certifications</Label><Textarea placeholder="AWS Certified, Google Cloud Professional, etc." rows={3} value={s2.certifications} onChange={e => setS2(p => ({ ...p, certifications: e.target.value }))} /></div>
          </div>
        )}

        {/* Step 3 */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5"><Label className="text-sm font-normal">Years of Experience</Label><Input placeholder="3 years" value={s3.experience_years} onChange={e => setS3(p => ({ ...p, experience_years: e.target.value }))} /></div>
              <div className="space-y-1.5"><Label className="text-sm font-normal">Current Company</Label><Input placeholder="Company Name (or N/A)" value={s3.current_company} onChange={e => setS3(p => ({ ...p, current_company: e.target.value }))} /></div>
              <div className="space-y-1.5"><Label className="text-sm font-normal">Current Salary</Label><Input placeholder="80,000 / year" value={s3.current_salary} onChange={e => setS3(p => ({ ...p, current_salary: e.target.value }))} /></div>
              <div className="space-y-1.5"><Label className="text-sm font-normal">Expected Salary</Label><Input placeholder="100,000 / year" value={s3.expected_salary} onChange={e => setS3(p => ({ ...p, expected_salary: e.target.value }))} /></div>
              <div className="space-y-1.5"><Label className="text-sm font-normal">LinkedIn Profile</Label><Input placeholder="https://linkedin.com/in/..." value={s3.linkedin_url} onChange={e => setS3(p => ({ ...p, linkedin_url: e.target.value }))} /></div>
              <div className="space-y-1.5"><Label className="text-sm font-normal">Portfolio URL</Label><Input placeholder="https://myportfolio.com" value={s3.portfolio_url} onChange={e => setS3(p => ({ ...p, portfolio_url: e.target.value }))} /></div>
            </div>
            <div className="space-y-1.5"><Label className="text-sm font-normal">Skills (comma-separated)</Label><Input placeholder="React, TypeScript, Node.js, AWS..." value={s3.skills} onChange={e => setS3(p => ({ ...p, skills: e.target.value }))} /></div>
          </div>
        )}

        {/* Step 4 */}
        {step === 3 && (
          <div className="space-y-5">
            {[
              { label: 'Resume / CV *', key: 'resume' as const, value: s4.resume },
              { label: 'Cover Letter (optional)', key: 'cover_letter_file' as const, value: s4.cover_letter_file },
            ].map(f => (
              <div key={f.key} className="space-y-1.5">
                <Label className="text-sm font-normal">{f.label}</Label>
                <div className="relative border border-dashed border-border rounded-xl p-5 text-center hover:border-primary/40 transition-colors cursor-pointer">
                  <input type="file" accept=".pdf,.doc,.docx" className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={e => setS4(p => ({ ...p, [f.key]: e.target.files?.[0] || null }))} />
                  {f.value ? (
                    <div className="flex items-center justify-center gap-2 text-sm text-foreground">
                      <Upload className="w-4 h-4 text-primary" />{f.value.name}
                      <button type="button" onClick={(e) => { e.stopPropagation(); setS4(p => ({ ...p, [f.key]: null })); }}><X className="w-3 h-3 text-muted-foreground" /></button>
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground"><Upload className="w-5 h-5 mx-auto mb-1" />Click to upload PDF, DOC, DOCX</div>
                  )}
                </div>
              </div>
            ))}
            <label className="flex items-start gap-3 cursor-pointer group">
              <div onClick={() => setS4(p => ({ ...p, declaration: !p.declaration }))}
                className={`w-5 h-5 rounded border mt-0.5 flex items-center justify-center shrink-0 transition-all cursor-pointer ${s4.declaration ? 'bg-primary border-primary' : 'border-border hover:border-primary/60'}`}>
                {s4.declaration && <CheckCircle className="w-3 h-3 text-white" />}
              </div>
              <span className="text-sm text-muted-foreground text-pretty">I declare that all information provided is accurate and complete. I authorize CoreStack Technology to verify the information provided.</span>
            </label>
          </div>
        )}

        {/* Navigation */}
        <div className="flex gap-3 mt-6 pt-4 border-t border-border">
          <Button type="button" variant="outline" className="flex-1" onClick={() => step === 0 ? handleClose() : setStep(s => s - 1)}>
            {step === 0 ? 'Cancel' : '← Back'}
          </Button>
          {step < 3 ? (
            <Button
              className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
              onClick={() => {
                if (step === 0 && (!s1.full_name || !s1.email)) { toast.error('Name and email are required'); return; }
                setStep(s => s + 1);
              }}
            >
              Next <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          ) : (
            <Button
              className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Submitting…</> : 'Submit Application'}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Job Card ─────────────────────────────────────────────────────────────────
function JobCard({ job, onApply }: { job: Career; onApply: (j: Career) => void }) {
  return (
    <div className="group flex flex-col gap-4 p-6 rounded-2xl border border-border bg-card hover:border-primary/40 hover:-translate-y-1 hover:shadow-hover transition-all duration-300 h-full">
      <div className="flex-1">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
          <Briefcase className="w-5 h-5 text-primary" />
        </div>
        <h3 className="font-display font-bold text-foreground mb-2 text-balance">{job.title}</h3>
        <div className="space-y-1.5 mb-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground"><Briefcase className="w-3 h-3 shrink-0" />{job.department}</div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground"><MapPin className="w-3 h-3 shrink-0" />{job.location}</div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground"><Clock className="w-3 h-3 shrink-0" />{job.type}</div>
          {job.salary_range && <div className="flex items-center gap-2 text-xs text-primary font-medium"><DollarSign className="w-3 h-3 shrink-0" />{job.salary_range}</div>}
        </div>
        {job.description && <p className="text-sm text-muted-foreground text-pretty line-clamp-3">{job.description}</p>}
        {(job.requirements || []).length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1">
            {(job.requirements || []).slice(0, 3).map(r => (
              <span key={r} className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">{r}</span>
            ))}
          </div>
        )}
      </div>
      <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shrink-0 mt-auto" onClick={() => onApply(job)}>
        Apply Now <ArrowRight className="w-3.5 h-3.5 ml-1" />
      </Button>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function JobPositionsPage() {
  const [jobs, setJobs] = useState<Career[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Career | null>(null);
  const [search, setSearch] = useState('');
  const [filterDept, setFilterDept] = useState('all');

  useEffect(() => {
    supabase.from('careers').select('*').eq('is_active', true).eq('is_internship', false).order('created_at')
      .then(({ data }) => { setLoading(false); if (data) setJobs(data); });
  }, []);

  const depts = ['all', ...Array.from(new Set(jobs.map(j => j.department).filter(Boolean)))];
  const displayed = jobs.filter(j =>
    (filterDept === 'all' || j.department === filterDept) &&
    (search === '' || j.title.toLowerCase().includes(search.toLowerCase()) || j.department.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow pt-16">
        <section className="section-padding bg-background">
          <div className="container mx-auto px-4 max-w-7xl">
            <div className="mb-6"><BackButton /></div>
            <div className="text-center mb-12">
              <span className="text-primary font-semibold text-sm uppercase tracking-widest">Open Positions</span>
              <h1 className="text-3xl md:text-5xl font-display font-bold text-foreground mt-3 mb-5 text-balance">
                Find Your Next{' '}
                <span className="gradient-text">Opportunity</span>
              </h1>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto text-pretty">
                Join a team of exceptional engineers building products used by enterprises worldwide.
              </p>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-10">
              <Input placeholder="Search positions…" value={search} onChange={e => setSearch(e.target.value)} className="flex-1" />
              <div className="flex flex-wrap gap-2">
                {depts.map(d => (
                  <button key={d}
                    onClick={() => setFilterDept(d)}
                    className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors whitespace-nowrap ${filterDept === d ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground hover:text-foreground'}`}
                  >
                    {d === 'all' ? 'All Departments' : d}
                  </button>
                ))}
              </div>
            </div>

            {loading ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {[1, 2, 3, 4].map(i => <div key={i} className="h-64 rounded-2xl bg-card animate-pulse" />)}
              </div>
            ) : displayed.length > 0 ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {displayed.map(job => <JobCard key={job.id} job={job} onApply={setSelected} />)}
              </div>
            ) : (
              <div className="text-center py-20 text-muted-foreground">
                <Briefcase className="w-12 h-12 mx-auto mb-4 opacity-30" />
                <p className="text-lg font-medium">No open positions right now</p>
                <p className="text-sm mt-2">Send your resume to <a href="mailto:careers@corestacktech.com" className="text-primary hover:underline">careers@corestacktech.com</a></p>
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
      <JobApplyModal job={selected} open={!!selected} onClose={() => setSelected(null)} />
    </div>
  );
}

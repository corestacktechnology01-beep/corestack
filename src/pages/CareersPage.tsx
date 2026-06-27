import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import Header from '@/components/layouts/Header';
import Footer from '@/components/layouts/Footer';
import BackButton from '@/components/ui/BackButton';
import {
  ChevronRight, ArrowRight, Rocket, Users, Award, Globe, Heart,
  BookOpen, Zap, Coffee, TrendingUp, Code2, Brain, Star,
  GraduationCap, Briefcase, Monitor, Clock, CheckCircle, Play,
  ChevronDown,
} from 'lucide-react';

// ─── Data ─────────────────────────────────────────────────────────────────────
const STATS = [
  { value: 120, suffix: '+', label: 'Open Positions', icon: Briefcase, color: 'text-orange-400', bg: 'bg-orange-500/10' },
  { value: 240, suffix: '+', label: 'Team Members', icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/10' },
  { value: 12, suffix: '', label: 'Office Locations', icon: Globe, color: 'text-green-400', bg: 'bg-green-500/10' },
  { value: 97, suffix: '%', label: 'Employee Satisfaction', icon: Heart, color: 'text-rose-400', bg: 'bg-rose-500/10' },
];

const BENEFITS = [
  { icon: Monitor, title: 'Remote-First Culture', desc: 'Work from anywhere — home, co-working space, or our premium offices worldwide.', color: 'text-blue-400', bg: 'bg-blue-500/10' },
  { icon: TrendingUp, title: 'Accelerated Growth', desc: 'Semi-annual performance reviews with guaranteed promotions tied to impact, not tenure.', color: 'text-green-400', bg: 'bg-green-500/10' },
  { icon: BookOpen, title: '₹2.49 lakh Learning Budget', desc: 'Annual stipend for courses, certifications, conferences, and technical books.', color: 'text-purple-400', bg: 'bg-purple-500/10' },
  { icon: Heart, title: 'Premium Healthcare', desc: 'Full family medical, dental, and vision coverage. Mental health support included.', color: 'text-rose-400', bg: 'bg-rose-500/10' },
  { icon: Coffee, title: 'Unlimited PTO', desc: 'We trust you to take time when you need it. No tracking, no questions asked.', color: 'text-amber-400', bg: 'bg-amber-500/10' },
  { icon: Zap, title: 'Equity Participation', desc: 'Join the ownership culture. All employees receive stock options from day one.', color: 'text-orange-400', bg: 'bg-orange-500/10' },
  { icon: Brain, title: 'AI Tools Access', desc: 'Every engineer gets premium access to the latest AI coding assistants and LLM APIs.', color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
  { icon: Globe, title: 'Global Team Retreats', desc: 'Twice-yearly all-hands retreats in world-class locations with the whole team.', color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
];

const GROWTH_TIMELINE = [
  { level: 'Junior Engineer', years: '0–2 yrs', salary: '₹54L–₹75L', desc: 'Onboarding, mentorship pairs, structured learning path, first product ownership.', color: 'bg-primary' },
  { level: 'Mid-Level Engineer', years: '2–4 yrs', salary: '₹75L–₹1.08Cr', desc: 'Feature ownership, code review responsibilities, tech talks and mentoring juniors.', color: 'bg-blue-500' },
  { level: 'Senior Engineer', years: '4–7 yrs', salary: '₹1.08Cr–₹1.46Cr', desc: 'Cross-team architecture decisions, leading sprints, client-facing technical discussions.', color: 'bg-green-500' },
  { level: 'Staff Engineer / Tech Lead', years: '7–10 yrs', salary: '₹1.46Cr–₹1.83Cr', desc: 'Platform-wide technical vision, mentoring seniors, representing engineering to leadership.', color: 'bg-purple-500' },
  { level: 'Principal / VP Engineering', years: '10+ yrs', salary: '₹1.83Cr+', desc: 'Company-wide technical strategy, investor relations, external thought leadership.', color: 'bg-amber-500' },
];

const LEARNING_PROGRAMS = [
  { icon: Code2, title: 'CoreStack Academy', desc: '200+ internal video courses across engineering, design, and product management. Self-paced with certificates.', badge: 'Free' },
  { icon: Brain, title: 'AI & ML Bootcamp', desc: '12-week intensive program on machine learning, LLMs, and AI product development. Quarterly cohorts.', badge: 'Quarterly' },
  { icon: Award, title: 'Leadership Track', desc: 'Structured 6-month program for senior engineers transitioning into engineering management.', badge: '6 Months' },
  { icon: Globe, title: 'Conference Budget', desc: '₹1.66 lakh annual allowance for external conferences — AWS re:Invent, Google I/O, KubeCon, and more.', badge: '₹1.66L/yr' },
];

const CULTURE_ITEMS = [
  { emoji: '🚀', title: 'Ship Fast, Learn Faster', desc: 'We deploy to production daily. Mistakes are learning opportunities, not career-enders.' },
  { emoji: '🤝', title: 'Radical Transparency', desc: 'Company P&L, roadmap, and OKRs are shared with every employee. No information silos.' },
  { emoji: '💡', title: 'Ideas From Anywhere', desc: 'The best idea wins regardless of seniority. Monthly "hack weeks" for passion projects.' },
  { emoji: '🌍', title: 'Globally Diverse', desc: '42 nationalities across 12 countries. We celebrate different perspectives and backgrounds.' },
];

const VALUES = [
  { icon: Star, title: 'Excellence', desc: 'We hold ourselves to the highest standard in code quality, design, and client outcomes.', color: 'text-amber-400', bg: 'bg-amber-500/10' },
  { icon: Heart, title: 'Empathy', desc: 'We build for humans. Every product decision starts with understanding the end user.', color: 'text-rose-400', bg: 'bg-rose-500/10' },
  { icon: Zap, title: 'Velocity', desc: 'Speed without sacrificing quality. We move fast because our processes are tight.', color: 'text-orange-400', bg: 'bg-orange-500/10' },
  { icon: Brain, title: 'Curiosity', desc: 'We stay ahead of the curve by deeply learning new technologies and sharing knowledge.', color: 'text-purple-400', bg: 'bg-purple-500/10' },
  { icon: TrendingUp, title: 'Ownership', desc: 'Every team member owns their domain end-to-end — from planning to production.', color: 'text-green-400', bg: 'bg-green-500/10' },
  { icon: Globe, title: 'Impact', desc: 'We only take on work that creates meaningful change for our clients and their users.', color: 'text-blue-400', bg: 'bg-blue-500/10' },
];

// ─── useCountUp ───────────────────────────────────────────────────────────────
function useCountUp(target: number, duration = 2000, start = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime: number | null = null;
    const step = (ts: number) => {
      if (!startTime) startTime = ts;
      const progress = Math.min((ts - startTime) / duration, 1);
      setCount(Math.floor((1 - Math.pow(1 - progress, 3)) * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration, start]);
  return count;
}

// ─── StatCard ─────────────────────────────────────────────────────────────────
function StatCard({ stat, start }: { stat: typeof STATS[0]; start: boolean }) {
  const count = useCountUp(stat.value, 2200, start);
  const Icon = stat.icon;
  return (
    <div className="flex flex-col items-center p-6 rounded-2xl border border-border bg-card/60 backdrop-blur-sm hover:-translate-y-1 transition-all duration-300 text-center">
      <div className={`w-12 h-12 rounded-xl ${stat.bg} flex items-center justify-center mb-4`}>
        <Icon className={`w-6 h-6 ${stat.color}`} />
      </div>
      <div className={`text-4xl font-display font-bold ${stat.color} mb-1`}>{start ? count : stat.value}{stat.suffix}</div>
      <div className="text-sm text-muted-foreground">{stat.label}</div>
    </div>
  );
}

// ─── AnimatedSection ──────────────────────────────────────────────────────────
function AnimatedSection({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.1 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return (
    <div ref={ref} style={{ transitionDelay: `${delay}ms` }}
      className={`transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'} ${className}`}>
      {children}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function CareersPage() {
  const [heroVisible, setHeroVisible] = useState(false);
  const statsRef = useRef<HTMLDivElement>(null);
  const [statsVisible, setStatsVisible] = useState(false);

  useEffect(() => { setTimeout(() => setHeroVisible(true), 80); }, []);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setStatsVisible(true); }, { threshold: 0.2 });
    if (statsRef.current) obs.observe(statsRef.current);
    return () => obs.disconnect();
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow">

        {/* ── Hero ──────────────────────────────────────────────────────────── */}
        <section className="relative overflow-hidden pt-32 pb-24 bg-background">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-primary/8 rounded-full blur-[120px]" />
            <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-purple-500/6 rounded-full blur-[100px]" />
            {/* Animated particles */}
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="absolute rounded-full bg-primary/20 animate-float pointer-events-none"
                style={{ width: `${Math.random() * 5 + 2}px`, height: `${Math.random() * 5 + 2}px`, left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`, opacity: Math.random() * 0.3 + 0.1, animationDelay: `${Math.random() * 4}s`, animationDuration: `${Math.random() * 4 + 4}s` }} />
            ))}
          </div>
          <div className="container mx-auto px-4 max-w-7xl relative">
            <div className="mb-6"><BackButton /></div>
            <nav className={`flex items-center gap-2 text-sm text-muted-foreground mb-8 transition-all duration-700 ${heroVisible ? 'opacity-100' : 'opacity-0'}`}>
              <Link to="/" className="hover:text-primary transition-colors">Home</Link>
              <ChevronRight className="w-3.5 h-3.5" />
              <span className="text-foreground font-medium">Careers</span>
            </nav>
            <div className={`max-w-5xl transition-all duration-700 delay-100 ${heroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-6">
                <Rocket className="w-3.5 h-3.5 text-primary" />
                <span className="text-primary text-xs font-semibold uppercase tracking-widest">We're Hiring</span>
              </div>
              <h1 className="text-5xl md:text-7xl font-display font-bold text-foreground mb-6 text-balance leading-tight">
                Find Your Next<br />
                <span className="gradient-text">Opportunity</span>
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl text-pretty leading-relaxed mb-10">
                Join 240+ engineers, designers, and product thinkers building the technology that powers the world's fastest-growing enterprises. We believe in people who love what they build.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/careers/jobs"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-primary text-primary-foreground font-bold text-lg hover:bg-primary/90 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary/30">
                  View Open Positions <Briefcase className="w-5 h-5" />
                </Link>
                <Link to="/careers/internships"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl border border-border bg-card/60 text-foreground font-bold text-lg hover:border-primary/40 transition-all">
                  Explore Internships <GraduationCap className="w-5 h-5" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ── Stats ─────────────────────────────────────────────────────────── */}
        <section ref={statsRef} className="py-16 bg-muted/20 border-y border-border">
          <div className="container mx-auto px-4 max-w-7xl">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
              {STATS.map((stat, i) => (
                <AnimatedSection key={stat.label} delay={i * 80}>
                  <StatCard stat={stat} start={statsVisible} />
                </AnimatedSection>
              ))}
            </div>
          </div>
        </section>

        {/* ── Benefits ──────────────────────────────────────────────────────── */}
        <section className="py-20 bg-background">
          <div className="container mx-auto px-4 max-w-7xl">
            <AnimatedSection>
              <div className="text-center mb-14">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 mb-4">
                  <Star className="w-3.5 h-3.5 text-primary" />
                  <span className="text-primary text-xs font-semibold uppercase tracking-widest">Benefits</span>
                </div>
                <h2 className="text-3xl md:text-5xl font-display font-bold text-foreground mb-4 text-balance">
                  Built for People Who<br />
                  <span className="gradient-text">Love Their Work</span>
                </h2>
                <p className="text-muted-foreground max-w-xl mx-auto text-pretty">
                  We've designed every benefit to support your growth, wellbeing, and life outside of work.
                </p>
              </div>
            </AnimatedSection>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {BENEFITS.map((b, i) => {
                const Icon = b.icon;
                return (
                  <AnimatedSection key={b.title} delay={i * 60}>
                    <div className="group h-full p-6 rounded-2xl border border-border bg-card/60 backdrop-blur-sm hover:border-primary/30 hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
                      <div className={`w-11 h-11 rounded-xl ${b.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                        <Icon className={`w-5 h-5 ${b.color}`} />
                      </div>
                      <h3 className="font-display font-semibold text-foreground mb-2 text-balance">{b.title}</h3>
                      <p className="text-sm text-muted-foreground text-pretty leading-relaxed">{b.desc}</p>
                    </div>
                  </AnimatedSection>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── Career Growth Timeline ────────────────────────────────────────── */}
        <section className="py-20 bg-muted/20">
          <div className="container mx-auto px-4 max-w-5xl">
            <AnimatedSection>
              <div className="text-center mb-14">
                <h2 className="text-3xl md:text-5xl font-display font-bold text-foreground mb-4 text-balance">
                  Your <span className="gradient-text">Growth Path</span>
                </h2>
                <p className="text-muted-foreground max-w-xl mx-auto text-pretty">
                  Clear, transparent career progression with defined milestones and compensation bands.
                </p>
              </div>
            </AnimatedSection>
            <div className="space-y-0">
              {GROWTH_TIMELINE.map((level, i) => (
                <AnimatedSection key={level.level} delay={i * 100}>
                  <div className="flex gap-6 group">
                    {/* Line + dot */}
                    <div className="flex flex-col items-center shrink-0">
                      <div className={`w-4 h-4 rounded-full ${level.color} ring-4 ring-background z-10 group-hover:scale-125 transition-transform duration-300`} />
                      {i < GROWTH_TIMELINE.length - 1 && <div className="w-0.5 flex-1 bg-border mt-1" />}
                    </div>
                    {/* Content */}
                    <div className={`pb-8 flex-1 min-w-0 ${i < GROWTH_TIMELINE.length - 1 ? '' : ''}`}>
                      <div className="p-5 rounded-2xl border border-border bg-card/60 backdrop-blur-sm hover:border-primary/30 transition-colors">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                          <h3 className="font-display font-bold text-foreground text-lg">{level.level}</h3>
                          <div className="flex gap-3 shrink-0">
                            <span className="text-xs px-2.5 py-1 rounded-full bg-muted text-muted-foreground font-medium">{level.years}</span>
                            <span className="text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary font-semibold border border-primary/20">{level.salary}</span>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground text-pretty">{level.desc}</p>
                      </div>
                    </div>
                  </div>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </section>

        {/* ── Learning Programs ─────────────────────────────────────────────── */}
        <section className="py-20 bg-background">
          <div className="container mx-auto px-4 max-w-7xl">
            <AnimatedSection>
              <div className="text-center mb-14">
                <h2 className="text-3xl md:text-5xl font-display font-bold text-foreground mb-4 text-balance">
                  Learning &<br />
                  <span className="gradient-text">Development</span>
                </h2>
                <p className="text-muted-foreground max-w-xl mx-auto text-pretty">
                  We invest $3,000 per engineer annually in structured learning programs.
                </p>
              </div>
            </AnimatedSection>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {LEARNING_PROGRAMS.map((prog, i) => {
                const Icon = prog.icon;
                return (
                  <AnimatedSection key={prog.title} delay={i * 80}>
                    <div className="group h-full p-6 rounded-2xl border border-border bg-card/60 hover:border-primary/30 hover:-translate-y-1 transition-all duration-300">
                      <div className="flex items-start justify-between mb-4">
                        <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                          <Icon className="w-5 h-5 text-primary" />
                        </div>
                        <span className="text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary font-semibold border border-primary/20">{prog.badge}</span>
                      </div>
                      <h3 className="font-display font-semibold text-foreground mb-2 text-balance">{prog.title}</h3>
                      <p className="text-sm text-muted-foreground text-pretty leading-relaxed">{prog.desc}</p>
                    </div>
                  </AnimatedSection>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── Work Culture ──────────────────────────────────────────────────── */}
        <section className="py-20 bg-muted/20">
          <div className="container mx-auto px-4 max-w-7xl">
            <AnimatedSection>
              <div className="text-center mb-14">
                <h2 className="text-3xl md:text-5xl font-display font-bold text-foreground mb-4 text-balance">
                  Work <span className="gradient-text">Culture</span>
                </h2>
                <p className="text-muted-foreground max-w-xl mx-auto text-pretty">
                  What life actually looks like at CoreStack — no corporate jargon.
                </p>
              </div>
            </AnimatedSection>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5 mb-12">
              {CULTURE_ITEMS.map((item, i) => (
                <AnimatedSection key={item.title} delay={i * 80}>
                  <div className="p-6 rounded-2xl border border-border bg-card/60 backdrop-blur-sm hover:-translate-y-1 hover:border-primary/30 transition-all duration-300 h-full">
                    <div className="text-3xl mb-4">{item.emoji}</div>
                    <h3 className="font-display font-bold text-foreground mb-2 text-balance">{item.title}</h3>
                    <p className="text-sm text-muted-foreground text-pretty leading-relaxed">{item.desc}</p>
                  </div>
                </AnimatedSection>
              ))}
            </div>
            {/* Culture photo grid */}
            <AnimatedSection>
              <div className="grid grid-cols-3 md:grid-cols-6 gap-2 rounded-2xl overflow-hidden">
                {[
                  'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=300&q=80',
                  'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=300&q=80',
                  'https://images.unsplash.com/photo-1527689368864-3a821dbccc34?w=300&q=80',
                  'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=300&q=80',
                  'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=300&q=80',
                  'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=300&q=80',
                ].map((url, i) => (
                  <div key={i} className="aspect-square overflow-hidden">
                    <img src={url} alt="CoreStack culture" className="w-full h-full object-cover hover:scale-110 transition-transform duration-500" />
                  </div>
                ))}
              </div>
            </AnimatedSection>
          </div>
        </section>

        {/* ── Company Values ────────────────────────────────────────────────── */}
        <section className="py-20 bg-background">
          <div className="container mx-auto px-4 max-w-7xl">
            <AnimatedSection>
              <div className="text-center mb-14">
                <h2 className="text-3xl md:text-5xl font-display font-bold text-foreground mb-4 text-balance">
                  Our <span className="gradient-text">Values</span>
                </h2>
                <p className="text-muted-foreground max-w-xl mx-auto text-pretty">
                  The principles that guide every decision, product, and person at CoreStack.
                </p>
              </div>
            </AnimatedSection>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {VALUES.map((v, i) => {
                const Icon = v.icon;
                return (
                  <AnimatedSection key={v.title} delay={i * 80}>
                    <div className="group flex gap-4 p-6 rounded-2xl border border-border bg-card/60 hover:border-primary/30 hover:-translate-y-1 transition-all duration-300 h-full">
                      <div className={`w-11 h-11 rounded-xl ${v.bg} flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-110 transition-transform duration-300`}>
                        <Icon className={`w-5 h-5 ${v.color}`} />
                      </div>
                      <div>
                        <h3 className="font-display font-bold text-foreground mb-1.5">{v.title}</h3>
                        <p className="text-sm text-muted-foreground text-pretty leading-relaxed">{v.desc}</p>
                      </div>
                    </div>
                  </AnimatedSection>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── CTA ───────────────────────────────────────────────────────────── */}
        <section className="py-16 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-purple-500/5 pointer-events-none" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[250px] bg-primary/10 rounded-full blur-[80px] pointer-events-none" />
          <div className="container mx-auto px-4 max-w-3xl text-center relative">
            <AnimatedSection>
              <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4 text-balance">
                Ready to build something<br />
                <span className="gradient-text">extraordinary with us?</span>
              </h2>
              <p className="text-muted-foreground text-lg mb-8 text-pretty">
                Explore 120+ open roles across engineering, design, product, and operations.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/careers/jobs"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-primary text-primary-foreground font-bold text-lg hover:bg-primary/90 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary/30">
                  View Open Positions <ArrowRight className="w-5 h-5" />
                </Link>
                <Link to="/careers/internships"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl border border-border bg-card text-foreground font-bold text-lg hover:border-primary/40 transition-all">
                  Internship Program <GraduationCap className="w-5 h-5" />
                </Link>
              </div>
            </AnimatedSection>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

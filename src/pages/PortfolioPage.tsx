import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/db/supabase';
import type { Project, Category } from '@/types/types';
import Header from '@/components/layouts/Header';
import Footer from '@/components/layouts/Footer';
import ProjectEnquiryModal from '@/components/modals/ProjectEnquiryModal';
import BookConsultationModal from '@/components/modals/BookConsultationModal';
import BackButton from '@/components/ui/BackButton';
import {
  ChevronRight, ArrowRight, Rocket, TrendingUp, Users, CheckCircle,
  Award, Star, Code2, Globe, Smartphone, BarChart3, Layers, Search,
  Clock, DollarSign, Target, Zap,
} from 'lucide-react';

// ─── Static showcase data (used alongside DB projects) ────────────────────────
const FEATURED_PROJECTS = [
  {
    id: 'finedge',
    title: 'FinEdge Banking Platform',
    category: 'Fintech / SaaS',
    tech: ['React', 'Node.js', 'PostgreSQL', 'AWS'],
    result: '$2B+ transactions processed',
    roi: '70% faster ops',
    image: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&q=80',
    color: 'from-orange-500/20 to-amber-500/10',
    border: 'border-orange-500/30',
  },
  {
    id: 'healthsync',
    title: 'HealthSync AI Diagnostics',
    category: 'Healthcare / AI',
    tech: ['Python', 'TensorFlow', 'React', 'Azure'],
    result: '50k patients onboarded in Q1',
    roi: '70% less manual work',
    image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&q=80',
    color: 'from-blue-500/20 to-cyan-500/10',
    border: 'border-blue-500/30',
  },
  {
    id: 'logiflow',
    title: 'LogiFlow Supply Chain',
    category: 'Logistics / ERP',
    tech: ['Vue.js', 'Go', 'Redis', 'GCP'],
    result: '12 warehouses integrated globally',
    roi: '40% cost reduction',
    image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&q=80',
    color: 'from-green-500/20 to-emerald-500/10',
    border: 'border-green-500/30',
  },
  {
    id: 'edutech',
    title: 'EduTech LMS Platform',
    category: 'EdTech / SaaS',
    tech: ['Next.js', 'Node.js', 'MongoDB', 'Vercel'],
    result: '100k+ active learners',
    roi: '68% fewer support tickets',
    image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=80',
    color: 'from-purple-500/20 to-violet-500/10',
    border: 'border-purple-500/30',
  },
  {
    id: 'propspace',
    title: 'PropSpace Real Estate',
    category: 'Real Estate / Mobile',
    tech: ['React Native', 'Node.js', 'PostgreSQL', 'Stripe'],
    result: '$500M+ in property listings',
    roi: '3× lead conversion',
    image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80',
    color: 'from-indigo-500/20 to-blue-500/10',
    border: 'border-indigo-500/30',
  },
  {
    id: 'retailcore',
    title: 'RetailCore ERP Suite',
    category: 'Retail / Enterprise',
    tech: ['React', 'Java', 'MySQL', 'Docker'],
    result: '500+ retail outlets managed',
    roi: '35% inventory shrinkage cut',
    image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=800&q=80',
    color: 'from-rose-500/20 to-pink-500/10',
    border: 'border-rose-500/30',
  },
];

const CATEGORIES = ['All', 'Fintech', 'Healthcare', 'Logistics', 'EdTech', 'Real Estate', 'Retail', 'SaaS'];

const ROI_STATS = [
  { icon: CheckCircle, value: '500+', label: 'Projects Delivered', color: 'text-orange-400', bg: 'bg-orange-500/10' },
  { icon: Users, value: '200+', label: 'Enterprise Clients', color: 'text-blue-400', bg: 'bg-blue-500/10' },
  { icon: TrendingUp, value: '98%', label: 'Client Retention', color: 'text-green-400', bg: 'bg-green-500/10' },
  { icon: Award, value: '$4B+', label: 'Client Revenue Impact', color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
  { icon: Target, value: '10+', label: 'Years Experience', color: 'text-purple-400', bg: 'bg-purple-500/10' },
  { icon: Zap, value: '99.9%', label: 'Uptime SLA', color: 'text-amber-400', bg: 'bg-amber-500/10' },
];

const SUCCESS_STORIES = [
  { client: 'FinCore Capital', quote: 'CoreStack delivered our trading platform 3 weeks early. We\'ve processed $2B in transactions with zero downtime.', name: 'James Mitchell', role: 'CTO', rating: 5 },
  { client: 'MedLogix Healthcare', quote: 'Their AI diagnostics platform cut our manual workflow by 70%. Patient satisfaction scores are at an all-time high.', name: 'Dr. Priya Sharma', role: 'Chief Medical Officer', rating: 5 },
  { client: 'SupplyChain.io', quote: 'The global supply chain platform integrates 12 warehouse systems seamlessly. We cut operational costs by 40%.', name: 'Carlos Vega', role: 'VP Operations', rating: 5 },
];

// ─── AnimatedCounter ──────────────────────────────────────────────────────────
function useCountUp(target: number, duration = 2000, start = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime: number | null = null;
    const step = (ts: number) => {
      if (!startTime) startTime = ts;
      const progress = Math.min((ts - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration, start]);
  return count;
}

// ─── ProjectCard3D ────────────────────────────────────────────────────────────
function ProjectCard3D({ project, index }: { project: typeof FEATURED_PROJECTS[0]; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.1 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientY - rect.top) / rect.height - 0.5) * 12;
    const y = ((e.clientX - rect.left) / rect.width - 0.5) * -12;
    setTilt({ x, y });
  };

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${(index % 3) * 100}ms` }}
      className={`transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
    >
      <div
        className="group relative h-full rounded-2xl overflow-hidden border border-border hover:border-primary/40 transition-all duration-500 cursor-pointer bg-card/60 backdrop-blur-sm"
        style={{ transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`, transition: 'transform 0.15s ease-out, box-shadow 0.3s ease' }}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setTilt({ x: 0, y: 0 })}
      >
        {/* Image */}
        <div className="aspect-[16/9] overflow-hidden">
          <img src={project.image} alt={project.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
          <div className={`absolute inset-0 bg-gradient-to-br ${project.color} opacity-60`} />
        </div>

        {/* Glow on hover */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/40 to-transparent" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />

        {/* Content */}
        <div className="absolute bottom-0 left-0 right-0 p-5">
          <div className="flex flex-wrap gap-1.5 mb-3">
            {project.tech.map(t => (
              <span key={t} className="text-xs px-2 py-0.5 rounded-full bg-background/60 backdrop-blur-sm text-foreground font-medium border border-border">{t}</span>
            ))}
          </div>
          <h3 className="font-display font-bold text-white text-lg mb-1 text-balance">{project.title}</h3>
          <p className="text-xs text-white/70 mb-3">{project.category}</p>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-white/60">{project.result}</div>
              <div className="text-sm font-bold text-primary">{project.roi}</div>
            </div>
            <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <ArrowRight className="w-3.5 h-3.5 text-primary" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function PortfolioPage() {
  const [projectOpen, setProjectOpen] = useState(false);
  const [consultOpen, setConsultOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [heroVisible, setHeroVisible] = useState(false);
  const [statsVisible, setStatsVisible] = useState(false);
  const statsRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setTimeout(() => setHeroVisible(true), 80); }, []);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setStatsVisible(true); }, { threshold: 0.2 });
    if (statsRef.current) obs.observe(statsRef.current);
    return () => obs.disconnect();
  }, []);

  const filteredProjects = FEATURED_PROJECTS.filter(p => {
    const matchesCat = activeFilter === 'All' || p.category.toLowerCase().includes(activeFilter.toLowerCase());
    const matchesSearch = !searchTerm || p.title.toLowerCase().includes(searchTerm.toLowerCase()) || p.tech.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow">

        {/* ── Hero ──────────────────────────────────────────────────────────── */}
        <section className="relative overflow-hidden pt-32 pb-20 bg-background">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-primary/8 rounded-full blur-[120px]" />
            <div className="absolute bottom-0 right-1/3 w-[400px] h-[400px] bg-blue-500/6 rounded-full blur-[100px]" />
          </div>
          <div className="container mx-auto px-4 max-w-7xl relative">
            <div className="mb-6"><BackButton /></div>
            <nav className={`flex items-center gap-2 text-sm text-muted-foreground mb-8 transition-all duration-700 ${heroVisible ? 'opacity-100' : 'opacity-0'}`}>
              <Link to="/" className="hover:text-primary transition-colors">Home</Link>
              <ChevronRight className="w-3.5 h-3.5" />
              <span className="text-foreground font-medium">Portfolio</span>
            </nav>
            <div className={`max-w-4xl transition-all duration-700 delay-100 ${heroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-6">
                <Award className="w-3.5 h-3.5 text-primary" />
                <span className="text-primary text-xs font-semibold uppercase tracking-widest">Our Work</span>
              </div>
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-bold text-foreground mb-6 text-balance leading-tight">
                500+ Projects.<br />
                <span className="gradient-text">Real Results.</span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl text-pretty leading-relaxed mb-8">
                From fintech platforms processing billions to AI systems transforming healthcare — explore how we turn ambitious ideas into world-class digital products.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button onClick={() => setProjectOpen(true)}
                  className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/25">
                  Start Your Project <Rocket className="w-4 h-4" />
                </button>
                <button onClick={() => setConsultOpen(true)}
                  className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl border border-border bg-card/60 text-foreground font-semibold hover:border-primary/40 transition-all">
                  Book Consultation <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ── ROI Statistics ────────────────────────────────────────────────── */}
        <section ref={statsRef} className="py-16 bg-muted/20 border-y border-border">
          <div className="container mx-auto px-4 max-w-7xl">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {ROI_STATS.map((stat, i) => {
                const Icon = stat.icon;
                const num = parseInt(stat.value.replace(/[^0-9]/g, '')) || 0;
                const suffix = stat.value.replace(/[0-9]/g, '');
                const count = useCountUp(num, 2000, statsVisible);
                return (
                  <div key={stat.label} className={`text-center p-5 rounded-2xl border border-border bg-card/60 backdrop-blur-sm transition-all duration-700 ${statsVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
                    style={{ transitionDelay: `${i * 80}ms` }}>
                    <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center mx-auto mb-3`}>
                      <Icon className={`w-5 h-5 ${stat.color}`} />
                    </div>
                    <div className={`text-2xl font-display font-bold ${stat.color}`}>{statsVisible ? `${count}${suffix}` : stat.value}</div>
                    <div className="text-xs text-muted-foreground mt-1">{stat.label}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── Project Showcase ──────────────────────────────────────────────── */}
        <section className="py-20 bg-background">
          <div className="container mx-auto px-4 max-w-7xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
              <div>
                <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground text-balance">
                  Featured <span className="gradient-text">Projects</span>
                </h2>
                <p className="text-muted-foreground mt-2">3D hover cards — click to explore each case study</p>
              </div>
              {/* Search */}
              <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  placeholder="Search projects or tech..."
                  className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-border bg-card/60 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20 transition-colors"
                />
              </div>
            </div>

            {/* Category filters */}
            <div className="flex flex-wrap gap-2 mb-8">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveFilter(cat)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 border ${activeFilter === cat ? 'bg-primary text-primary-foreground border-primary' : 'border-border bg-card/60 text-muted-foreground hover:border-primary/40 hover:text-foreground'}`}
                >{cat}</button>
              ))}
            </div>

            {/* 3D Cards grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProjects.map((project, i) => (
                <ProjectCard3D key={project.id} project={project} index={i} />
              ))}
              {filteredProjects.length === 0 && (
                <div className="col-span-full text-center py-16 text-muted-foreground">
                  No projects match your search. <button className="text-primary hover:underline ml-1" onClick={() => { setActiveFilter('All'); setSearchTerm(''); }}>Clear filters</button>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ── Technology Used ───────────────────────────────────────────────── */}
        <section className="py-16 bg-muted/20 border-y border-border overflow-hidden">
          <div className="container mx-auto px-4 max-w-7xl">
            <h3 className="text-center text-sm font-semibold text-muted-foreground uppercase tracking-widest mb-8">Technologies We Master</h3>
            <div className="flex flex-wrap justify-center gap-3">
              {['React', 'Next.js', 'Vue.js', 'TypeScript', 'Node.js', 'Python', 'Go', 'Java', 'PostgreSQL', 'MongoDB', 'Redis', 'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'TensorFlow', 'Stripe', 'GraphQL', 'Terraform'].map(tech => (
                <span key={tech} className="px-3 py-1.5 rounded-full text-sm font-medium border border-border bg-card/60 text-muted-foreground hover:border-primary/40 hover:text-primary transition-colors">{tech}</span>
              ))}
            </div>
          </div>
        </section>

        {/* ── Case Studies ──────────────────────────────────────────────────── */}
        <section className="py-20 bg-background">
          <div className="container mx-auto px-4 max-w-7xl">
            <div className="text-center mb-14">
              <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-3 text-balance">
                Animated <span className="gradient-text">Case Studies</span>
              </h2>
              <p className="text-muted-foreground">Deep dives into how we deliver measurable business outcomes</p>
            </div>
            <div className="space-y-8">
              {[
                { title: 'FinEdge: Banking Platform', challenge: 'Legacy banking infrastructure processing only 200 TPS with 15min settlement delays', solution: 'Microservices architecture on AWS with Redis caching, event-driven processing, and real-time analytics dashboard', result: '10,000 TPS capacity, 2-second settlement, $2B processed in first year', metric1: '50×', label1: 'throughput increase', metric2: '99.97%', label2: 'uptime achieved', timeline: '24 weeks', team: '12 engineers', budget: '$380K', img: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=600&q=80' },
                { title: 'HealthSync: AI Diagnostics', challenge: 'Manual diagnostic workflows taking 3+ days per patient with high error rates in image analysis', solution: 'Custom CNN model for medical imaging, HIPAA-compliant cloud platform, automated workflow engine', result: '94% diagnostic accuracy, 4-hour turnaround, 50,000 patients in Q1', metric1: '94%', label1: 'diagnostic accuracy', metric2: '70%', label2: 'workflow reduction', timeline: '32 weeks', team: '15 engineers', budget: '$520K', img: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&q=80' },
              ].map((cs, i) => (
                <div key={i} className="grid lg:grid-cols-5 gap-0 rounded-2xl overflow-hidden border border-border bg-card/40 hover:-translate-y-1 transition-all duration-300">
                  <div className="lg:col-span-2 relative aspect-[4/3] lg:aspect-auto overflow-hidden">
                    <img src={cs.img} alt={cs.title} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-r from-background/80 to-transparent lg:bg-gradient-to-r lg:from-transparent lg:to-background/60" />
                    <div className="absolute bottom-4 left-4 flex gap-4">
                      <div className="text-center px-3 py-2 rounded-xl bg-background/80 backdrop-blur-sm border border-border">
                        <div className="text-lg font-bold text-primary">{cs.metric1}</div>
                        <div className="text-xs text-muted-foreground">{cs.label1}</div>
                      </div>
                      <div className="text-center px-3 py-2 rounded-xl bg-background/80 backdrop-blur-sm border border-border">
                        <div className="text-lg font-bold text-primary">{cs.metric2}</div>
                        <div className="text-xs text-muted-foreground">{cs.label2}</div>
                      </div>
                    </div>
                  </div>
                  <div className="lg:col-span-3 p-6 md:p-8 flex flex-col justify-center">
                    <h3 className="text-xl md:text-2xl font-display font-bold text-foreground mb-4 text-balance">{cs.title}</h3>
                    <div className="space-y-4 mb-5">
                      <div>
                        <span className="text-xs font-semibold text-orange-400 uppercase tracking-wide">Challenge</span>
                        <p className="text-sm text-muted-foreground mt-1 text-pretty">{cs.challenge}</p>
                      </div>
                      <div>
                        <span className="text-xs font-semibold text-blue-400 uppercase tracking-wide">Solution</span>
                        <p className="text-sm text-muted-foreground mt-1 text-pretty">{cs.solution}</p>
                      </div>
                      <div>
                        <span className="text-xs font-semibold text-green-400 uppercase tracking-wide">Result</span>
                        <p className="text-sm text-muted-foreground mt-1 text-pretty">{cs.result}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-3 pt-4 border-t border-border">
                      {[{ icon: Clock, v: cs.timeline, l: 'Timeline' }, { icon: Users, v: cs.team, l: 'Team Size' }, { icon: DollarSign, v: cs.budget, l: 'Investment' }].map(m => {
                        const Icon = m.icon;
                        return (
                          <div key={m.l} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Icon className="w-3.5 h-3.5 text-primary" /><span className="font-medium text-foreground">{m.v}</span><span>{m.l}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Before & After ────────────────────────────────────────────────── */}
        <section className="py-20 bg-muted/20">
          <div className="container mx-auto px-4 max-w-7xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-3 text-balance">
                Before & After <span className="gradient-text">Transformation</span>
              </h2>
            </div>
            <div className="grid md:grid-cols-2 gap-8">
              {[
                { label: 'RetailCore ERP', before: ['Spreadsheet-based inventory', '3-day reporting lag', 'Manual order processing', '15% stockout rate'], after: ['Real-time inventory sync', 'Live dashboards', 'Automated workflows', '2% stockout rate'] },
                { label: 'FinEdge Banking', before: ['200 TPS throughput', '15-min settlement', 'Manual reconciliation', '3% error rate'], after: ['10,000 TPS capacity', '2-second settlement', 'Automated reconciliation', '0.02% error rate'] },
              ].map(item => (
                <div key={item.label} className="rounded-2xl border border-border bg-card/60 overflow-hidden">
                  <div className="px-5 py-3 border-b border-border bg-muted/30">
                    <span className="font-semibold text-sm text-foreground">{item.label}</span>
                  </div>
                  <div className="grid grid-cols-2 divide-x divide-border">
                    <div className="p-5">
                      <div className="text-xs font-bold text-rose-400 uppercase tracking-wide mb-3">Before</div>
                      <ul className="space-y-2">
                        {item.before.map(b => <li key={b} className="flex items-start gap-2 text-xs text-muted-foreground"><span className="text-rose-400 mt-0.5">✕</span>{b}</li>)}
                      </ul>
                    </div>
                    <div className="p-5">
                      <div className="text-xs font-bold text-green-400 uppercase tracking-wide mb-3">After</div>
                      <ul className="space-y-2">
                        {item.after.map(a => <li key={a} className="flex items-start gap-2 text-xs text-muted-foreground"><CheckCircle className="w-3 h-3 text-green-400 mt-0.5 shrink-0" />{a}</li>)}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Success Stories ───────────────────────────────────────────────── */}
        <section className="py-20 bg-background">
          <div className="container mx-auto px-4 max-w-7xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-3 text-balance">
                Client <span className="gradient-text">Success Stories</span>
              </h2>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {SUCCESS_STORIES.map((s, i) => (
                <div key={i} className="p-6 rounded-2xl border border-border bg-card/60 backdrop-blur-sm hover:-translate-y-1 transition-all duration-300">
                  <div className="flex gap-0.5 mb-4">
                    {Array.from({ length: s.rating }).map((_, j) => <Star key={j} className="w-4 h-4 fill-amber-400 text-amber-400" />)}
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-5 text-pretty">"{s.quote}"</p>
                  <div className="flex items-center gap-3 pt-4 border-t border-border">
                    <div className="w-9 h-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                      <span className="text-xs font-bold text-primary">{s.name.charAt(0)}</span>
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-foreground">{s.name}</div>
                      <div className="text-xs text-muted-foreground">{s.role}, {s.client}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA ───────────────────────────────────────────────────────────── */}
        <section className="py-16 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-blue-500/5 pointer-events-none" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-primary/10 rounded-full blur-[80px] pointer-events-none" />
          <div className="container mx-auto px-4 max-w-3xl text-center relative">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4 text-balance">
              Your project could be our next<br />
              <span className="gradient-text">success story</span>
            </h2>
            <p className="text-muted-foreground text-lg mb-8 text-pretty">
              Share your vision and receive a tailored proposal within 24 hours.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button onClick={() => setProjectOpen(true)}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-primary text-primary-foreground font-bold text-lg hover:bg-primary/90 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary/30">
                Start Your Project <Rocket className="w-5 h-5" />
              </button>
              <button onClick={() => setConsultOpen(true)}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl border border-border bg-card text-foreground font-bold text-lg hover:border-primary/40 transition-all">
                Book Consultation <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <ProjectEnquiryModal open={projectOpen} onClose={() => setProjectOpen(false)} />
      <BookConsultationModal open={consultOpen} onClose={() => setConsultOpen(false)} />
    </div>
  );
}

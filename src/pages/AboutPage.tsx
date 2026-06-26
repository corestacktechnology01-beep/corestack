// @refresh reset
import { useEffect, useRef, useState } from 'react';
import Header from '@/components/layouts/Header';
import Footer from '@/components/layouts/Footer';
import { Link } from 'react-router-dom';
import BackButton from '@/components/ui/BackButton';
import { Button } from '@/components/ui/button';
import {
  Target, Eye, Rocket, Award, Users, Heart, BookOpen, TrendingUp,
  ShoppingBag, Cog, Truck, Building, Lightbulb, Globe,
  Zap, Shield, Star, ArrowRight, MapPin, CheckCircle,
  Quote, ChevronRight,
} from 'lucide-react';

// ─── Data ──────────────────────────────────────────────────────────────────────

const TIMELINE = [
  { year: '2023', title: 'Founded', desc: 'CoreStack Technology founded with a vision to build world-class software for enterprises.', color: 'bg-primary' },
  { year: '2023', title: 'First Enterprise Client', desc: 'Secured first Fortune 500 client and delivered a mission-critical fintech platform.', color: 'bg-blue-500' },
  { year: '2024', title: 'AI Division Launched', desc: 'Established dedicated AI/ML research division and deployed first production ML models.', color: 'bg-purple-500' },
  { year: '2024', title: 'Global Expansion', desc: 'Expanded operations to the Middle East, Southeast Asia, and Europe. 50+ team members.', color: 'bg-cyan-500' },
  { year: '2024', title: 'SaaS Products Portfolio', desc: 'Launched first proprietary SaaS products serving 10,000+ businesses.', color: 'bg-green-500' },
  { year: '2025', title: 'Series A Funding', desc: 'Raised Series A investment to scale engineering capabilities and product development.', color: 'bg-orange-500' },
  { year: '2026', title: '200+ Enterprise Clients', desc: 'Crossed 200 enterprise clients milestone and 500+ successfully delivered projects.', color: 'bg-pink-500' },
  { year: '2026+', title: 'Next Chapter', desc: 'Launching next-generation AI platform and expanding into new verticals globally.', color: 'bg-primary' },
];

const INDUSTRIES = [
  { icon: Heart, name: 'Healthcare', desc: 'Patient management, telemedicine, diagnostic AI.', color: 'text-red-400', bg: 'bg-red-500/10' },
  { icon: BookOpen, name: 'Education', desc: 'LMS platforms, e-learning, adaptive assessments.', color: 'text-blue-400', bg: 'bg-blue-500/10' },
  { icon: TrendingUp, name: 'Finance & Fintech', desc: 'Banking platforms, payment gateways, robo-advisory.', color: 'text-green-400', bg: 'bg-green-500/10' },
  { icon: ShoppingBag, name: 'Retail & E-commerce', desc: 'Omnichannel commerce, inventory, analytics.', color: 'text-orange-400', bg: 'bg-orange-500/10' },
  { icon: Cog, name: 'Manufacturing', desc: 'Industry 4.0, IoT integration, predictive maintenance.', color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
  { icon: Truck, name: 'Logistics', desc: 'Real-time tracking, route optimization, WMS.', color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
  { icon: Building, name: 'Real Estate', desc: 'Property marketplaces, virtual tours, CRM.', color: 'text-purple-400', bg: 'bg-purple-500/10' },
  { icon: Lightbulb, name: 'Startups', desc: 'MVP development, product-market fit validation.', color: 'text-pink-400', bg: 'bg-pink-500/10' },
  { icon: Globe, name: 'Enterprises', desc: 'Digital transformation, legacy modernization.', color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
];

const VALUES = [
  { icon: Target, title: 'Client Obsession', desc: 'Every decision starts with: does this create real value for our clients?', color: 'text-primary', bg: 'bg-primary/10' },
  { icon: Zap, title: 'Technical Excellence', desc: 'Clean code, robust architecture, security — non-negotiable standards.', color: 'text-blue-400', bg: 'bg-blue-500/10' },
  { icon: Users, title: 'Radical Transparency', desc: 'Open communication on progress, challenges, and trade-offs at every step.', color: 'text-purple-400', bg: 'bg-purple-500/10' },
  { icon: Rocket, title: 'Continuous Innovation', desc: 'We embrace change and invest in emerging tech before it goes mainstream.', color: 'text-orange-400', bg: 'bg-orange-500/10' },
  { icon: Globe, title: 'Global Mindset', desc: 'Diversity of thought and cultural empathy embedded in how we build.', color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
  { icon: Shield, title: 'Security First', desc: 'Enterprise-grade security by default — never as an afterthought.', color: 'text-green-400', bg: 'bg-green-500/10' },
];

const PROCESS = [
  { num: '01', title: 'Discovery', desc: 'Deep dive into business objectives, user needs, and technical landscape to create a bulletproof blueprint.' },
  { num: '02', title: 'Architecture', desc: 'System design, database schemas, API contracts, and UI wireframes documented before code is written.' },
  { num: '03', title: 'Agile Build', desc: '2-week sprints with daily standups, continuous integration, and stakeholder demos ensuring transparency.' },
  { num: '04', title: 'QA & Security', desc: 'Automated test suites, penetration testing, performance benchmarks before every release.' },
  { num: '05', title: 'Launch', desc: 'Zero-downtime deployment with full monitoring, rollback capabilities, and 24/7 on-call support.' },
  { num: '06', title: 'Growth', desc: 'Post-launch analytics, feature iteration, performance tuning, and long-term SLA-backed maintenance.' },
];

const STATS = [
  { value: 500, suffix: '+', label: 'Projects Delivered' },
  { value: 200, suffix: '+', label: 'Enterprise Clients' },
  { value: 12, suffix: '+', label: 'Countries Served' },
  { value: 99, suffix: '.9%', label: 'SLA Uptime' },
  { value: 50, suffix: '+', label: 'Expert Engineers' },
  { value: 8, suffix: '', label: 'Years Experience' },
];

const ACHIEVEMENTS = [
  { icon: Award, title: 'Quick & Fast', note: 'Service Management' },
  { icon: Star, title: '4.9/5 Client Rating', note: 'Across 200+ project reviews' },
  { icon: CheckCircle, title: '98% On-Time Delivery', note: 'Across all engagements' },
  { icon: Globe, title: '12 Countries Served', note: 'Global delivery capability' },
];

const OFFICES = [
  { city: 'San Francisco', country: 'USA', type: 'HQ' },
  { city: 'Dubai', country: 'UAE', type: 'Regional' },
  { city: 'Singapore', country: 'Singapore', type: 'Regional' },
  { city: 'London', country: 'UK', type: 'Sales' },
];

// ─── Scroll animation hook ────────────────────────────────────────────────────

function useScrollVisible(threshold = 0.1) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

function useCountUp(target: number, duration = 2000, start = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime: number | null = null;
    const step = (ts: number) => {
      if (!startTime) startTime = ts;
      const p = Math.min((ts - startTime) / duration, 1);
      setCount(Math.floor((1 - Math.pow(1 - p, 3)) * target));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration, start]);
  return count;
}

// ─── Sections ─────────────────────────────────────────────────────────────────

function HeroBanner() {
  return (
    <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden bg-background pt-16">
      {/* Animated gradient blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-primary/8 blur-[120px] animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full bg-purple-500/6 blur-[100px] animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] rounded-full bg-primary/4 blur-[150px]" />
      </div>
      {/* Grid */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.025]"
        style={{ backgroundImage: 'linear-gradient(hsl(var(--border)) 1px,transparent 1px),linear-gradient(90deg,hsl(var(--border)) 1px,transparent 1px)', backgroundSize: '60px 60px' }} />

      <div className="relative z-10 text-center px-4 max-w-6xl mx-auto py-20">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/5 text-primary text-sm font-medium mb-8">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          Founded 2023 · Global Technology Partner
        </div>
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-display font-black text-foreground leading-[0.95] mb-8 text-balance">
          Engineering
          <br /><span className="gradient-text">Tomorrow's</span>
          <br />Digital World
        </h1>
        <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-10 text-pretty font-light">
          From a boutique studio in 2023 to a global technology powerhouse — we build intelligent,
          scalable solutions that empower enterprises to lead in the digital economy.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" className="h-14 px-10 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-base" asChild>
            <Link to="/contact">Start Your Project <ArrowRight className="w-5 h-5 ml-2" /></Link>
          </Button>
          <Button size="lg" variant="ghost" className="h-14 px-10 border border-border text-foreground hover:bg-muted font-semibold text-base" asChild>
            <Link to="/portfolio">View Our Work <ChevronRight className="w-4 h-4 ml-1" /></Link>
          </Button>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-muted-foreground text-xs">
          <div className="w-5 h-8 rounded-full border-2 border-border flex items-start justify-center pt-1.5">
            <div className="w-1 h-2 rounded-full bg-primary animate-bounce" />
          </div>
        </div>
      </div>
    </section>
  );
}

function CompanyStory() {
  const { ref, visible } = useScrollVisible();
  return (
    <section className="section-padding bg-background">
      <div className="container mx-auto px-4 max-w-7xl">
        <div ref={ref} className={`grid lg:grid-cols-2 gap-16 items-center transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div>
            <span className="text-primary font-semibold text-sm uppercase tracking-widest">Our Story</span>
            <h2 className="text-3xl md:text-5xl font-display font-bold text-foreground mt-3 mb-6 text-balance">
              From a Bold Idea to a <span className="gradient-text">Global Force</span>
            </h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p className="text-pretty">
                CoreStack Technology was born from a simple but powerful conviction: enterprise-grade technology
                shouldn't be the exclusive privilege of the world's largest corporations. In 2023, our founders
                — a team of ex-FAANG engineers and enterprise architects — set out to change that.
              </p>
              <p className="text-pretty">
                What started as a 6-person consultancy in a co-working space has grown into a 50+ engineer
                powerhouse serving clients across 12 countries. We've delivered over 500 production systems —
                from AI-powered diagnostics platforms to billion-dollar fintech infrastructure.
              </p>
              <p className="text-pretty">
                Our philosophy has never changed: every line of code we write should create measurable,
                lasting business value. Not just beautiful software — but software that competes.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'Engineers', value: '50+', color: 'border-primary/30 bg-primary/5' },
              { label: 'Clients', value: '200+', color: 'border-purple-500/30 bg-purple-500/5' },
              { label: 'Projects', value: '500+', color: 'border-blue-500/30 bg-blue-500/5' },
              { label: 'Countries', value: '12+', color: 'border-cyan-500/30 bg-cyan-500/5' },
            ].map(stat => (
              <div key={stat.label} className={`p-8 rounded-2xl border ${stat.color} text-center`}>
                <div className="text-4xl font-display font-black text-foreground mb-1">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function VisionMission() {
  const { ref, visible } = useScrollVisible();
  return (
    <section className="section-padding bg-muted/20">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="text-center mb-12">
          <span className="text-primary font-semibold text-sm uppercase tracking-widest">Purpose</span>
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mt-3 text-balance">
            Vision &amp; <span className="gradient-text">Mission</span>
          </h2>
        </div>
        <div ref={ref} className={`grid md:grid-cols-2 gap-6 transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          {/* Mission */}
          <div className="group relative p-8 md:p-10 rounded-3xl border border-border bg-card overflow-hidden hover:border-primary/50 transition-all duration-500 hover:-translate-y-1"
            style={{ perspective: '1000px' }}>
            <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-primary/6 blur-3xl group-hover:bg-primary/12 transition-all duration-700" />
            <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full bg-primary/4 blur-2xl" />
            <div className="relative">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500">
                <Target className="w-7 h-7 text-primary" />
              </div>
              <div className="text-xs font-semibold text-primary uppercase tracking-widest mb-2">Our Mission</div>
              <h3 className="text-2xl font-display font-bold text-foreground mb-4">Democratize Enterprise Technology</h3>
              <p className="text-muted-foreground leading-relaxed text-pretty">
                To democratize enterprise-grade technology by building intelligent, scalable digital solutions
                that empower organizations of every size to compete, grow, and lead in the digital economy.
                We believe the best software doesn't just solve problems — it creates new possibilities.
              </p>
            </div>
          </div>
          {/* Vision */}
          <div className="group relative p-8 md:p-10 rounded-3xl border border-border bg-card overflow-hidden hover:border-purple-500/50 transition-all duration-500 hover:-translate-y-1"
            style={{ perspective: '1000px' }}>
            <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-purple-500/6 blur-3xl group-hover:bg-purple-500/12 transition-all duration-700" />
            <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full bg-purple-500/4 blur-2xl" />
            <div className="relative">
              <div className="w-14 h-14 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-500">
                <Eye className="w-7 h-7 text-purple-400" />
              </div>
              <div className="text-xs font-semibold text-purple-400 uppercase tracking-widest mb-2">Our Vision</div>
              <h3 className="text-2xl font-display font-bold text-foreground mb-4">Most Trusted Technology Partner</h3>
              <p className="text-muted-foreground leading-relaxed text-pretty">
                To be the most trusted technology partner for global enterprises — known not just for
                exceptional code, but for transformative outcomes. A world where every business has access
                to the kind of technology once reserved only for the largest corporations.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function CoreValues() {
  const { ref, visible } = useScrollVisible();
  return (
    <section className="section-padding bg-background">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="text-center mb-12">
          <span className="text-primary font-semibold text-sm uppercase tracking-widest">Culture</span>
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mt-3 text-balance">
            Core <span className="gradient-text">Values</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto mt-4 text-pretty">
            These aren't slogans on a wall — they're the operating principles guiding every decision we make.
          </p>
        </div>
        <div ref={ref} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {VALUES.map((v, i) => (
            <div key={v.title}
              className={`group relative p-6 rounded-2xl border border-border bg-card overflow-hidden cursor-default transition-all duration-500 hover:border-primary/40 hover:-translate-y-2 hover:shadow-lg ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
              style={{ transitionDelay: `${i * 80}ms` }}>
              <div className="absolute top-0 right-0 w-24 h-24 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-2xl"
                style={{ background: `hsl(var(--primary)/0.08)` }} />
              <div className={`w-12 h-12 rounded-xl ${v.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                <v.icon className={`w-6 h-6 ${v.color}`} />
              </div>
              <h4 className="font-display font-semibold text-foreground mb-2">{v.title}</h4>
              <p className="text-sm text-muted-foreground text-pretty">{v.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CEOMessage() {
  return (
    <section className="section-padding bg-muted/20">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="relative p-8 md:p-12 rounded-3xl border border-border bg-card overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-purple-500/5 blur-2xl" />
          <div className="relative grid md:grid-cols-[200px,1fr] gap-8 items-start">
            <div className="text-center md:text-left">
              <div className="w-28 h-28 rounded-3xl bg-gradient-to-br from-primary/20 to-orange-400/20 border border-primary/20 flex items-center justify-center mx-auto md:mx-0 mb-4 text-3xl font-display font-black text-primary">AK</div>
              <div className="font-display font-bold text-foreground">Alexander Kim</div>
              <div className="text-sm text-muted-foreground">Chief Executive Officer</div>
              <div className="text-xs text-primary mt-1">CoreStack Technology</div>
            </div>
            <div>
              <Quote className="w-8 h-8 text-primary/30 mb-4" />
              <blockquote className="text-lg md:text-xl text-foreground leading-relaxed font-light italic mb-6 text-pretty">
                "We started CoreStack with one belief: the best technology should be accessible to every ambitious
                organization, not just the Fortune 500. Every project we deliver is a proof point of that conviction.
                Our team doesn't just write code — we engineer competitive advantages that compound over time."
              </blockquote>
              <p className="text-muted-foreground text-pretty">
                With over 15 years in enterprise software and having led teams at Google and Microsoft before founding
                CoreStack, Alexander brings a rare combination of technical depth and business acumen to every client engagement.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Timeline() {
  const { ref, visible } = useScrollVisible(0.05);
  return (
    <section className="section-padding bg-background">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="text-center mb-12">
          <span className="text-primary font-semibold text-sm uppercase tracking-widest">History</span>
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mt-3 text-balance">
            Our <span className="gradient-text">Growth Journey</span>
          </h2>
        </div>
        <div ref={ref} className="relative">
          {/* Center line */}
          <div className={`absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-primary/60 via-border to-transparent hidden md:block transition-all duration-1000 ${visible ? 'opacity-100' : 'opacity-0'}`} />
          <div className="space-y-6">
            {TIMELINE.map((item, i) => (
              <div key={item.year}
                className={`flex flex-col md:flex-row gap-4 md:gap-8 items-start md:items-center transition-all duration-700 ${visible ? 'opacity-100 translate-x-0' : i % 2 === 0 ? 'opacity-0 -translate-x-8' : 'opacity-0 translate-x-8'}`}
                style={{ transitionDelay: `${i * 100}ms` }}>
                <div className={`flex-1 ${i % 2 === 0 ? 'md:text-right' : 'md:text-left md:order-2'}`}>
                  <div className={`inline-block p-5 rounded-2xl border border-border bg-card hover:border-primary/40 hover:-translate-y-0.5 transition-all duration-300 max-w-xs w-full ${i % 2 !== 0 ? 'md:ml-0' : 'md:ml-auto'}`}>
                    <div className="text-primary font-bold text-sm font-display">{item.year}</div>
                    <div className="font-semibold text-foreground mt-1">{item.title}</div>
                    <div className="text-xs text-muted-foreground mt-1 text-pretty">{item.desc}</div>
                  </div>
                </div>
                <div className="hidden md:flex items-center justify-center shrink-0 relative z-10">
                  <div className={`w-4 h-4 rounded-full ${item.color} border-4 border-background shadow-lg`} />
                </div>
                <div className={`flex-1 hidden md:block ${i % 2 !== 0 ? 'md:order-first' : ''}`} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function AnimatedStats() {
  const { ref, visible } = useScrollVisible();
  return (
    <section className="section-padding bg-muted/20">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="text-center mb-12">
          <span className="text-primary font-semibold text-sm uppercase tracking-widest">Achievements</span>
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mt-3 text-balance">
            Numbers That <span className="gradient-text">Speak</span>
          </h2>
        </div>
        <div ref={ref} className="grid grid-cols-2 lg:grid-cols-3 gap-5">
          {STATS.map((s, i) => {
            const count = useCountUp(s.value, 2500, visible);
            return (
              <div key={s.label}
                className={`group p-8 rounded-2xl border border-border bg-card text-center hover:border-primary/40 hover:-translate-y-1 transition-all duration-500 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                style={{ transitionDelay: `${i * 80}ms` }}>
                <div className="text-4xl md:text-5xl font-display font-black gradient-text mb-2">
                  {count}{s.suffix}
                </div>
                <div className="text-sm text-muted-foreground">{s.label}</div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function Achievements() {
  const { ref, visible } = useScrollVisible();
  return (
    <section className="section-padding bg-background">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="text-center mb-12">
          <span className="text-primary font-semibold text-sm uppercase tracking-widest">Recognition</span>
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mt-3 text-balance">
            Industry <span className="gradient-text">Recognition</span>
          </h2>
        </div>
        <div ref={ref} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {ACHIEVEMENTS.map((a, i) => (
            <div key={a.title}
              className={`group p-6 rounded-2xl border border-border bg-card text-center hover:border-primary/40 hover:-translate-y-1.5 transition-all duration-500 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
              style={{ transitionDelay: `${i * 100}ms` }}>
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 group-hover:bg-primary/20 transition-all duration-300">
                <a.icon className="w-7 h-7 text-primary" />
              </div>
              <h4 className="font-display font-semibold text-foreground mb-1 text-sm">{a.title}</h4>
              <p className="text-xs text-muted-foreground">{a.note}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function IndustriesSection() {
  const { ref, visible } = useScrollVisible();
  return (
    <section className="section-padding bg-muted/20">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="text-center mb-12">
          <span className="text-primary font-semibold text-sm uppercase tracking-widest">Industries</span>
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mt-3 text-balance">
            Industries We <span className="gradient-text">Transform</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto mt-4 text-pretty">
            Deep domain expertise across 9 verticals — we understand your industry before writing a single line.
          </p>
        </div>
        <div ref={ref} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {INDUSTRIES.map((ind, i) => (
            <div key={ind.name}
              className={`group p-6 rounded-2xl border border-border bg-card hover:border-primary/40 hover:-translate-y-1 transition-all duration-500 h-full ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
              style={{ transitionDelay: `${i * 60}ms` }}>
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl ${ind.bg} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                  <ind.icon className={`w-6 h-6 ${ind.color}`} />
                </div>
                <div className="min-w-0">
                  <h3 className="font-display font-semibold text-foreground">{ind.name}</h3>
                  <p className="text-xs text-muted-foreground text-pretty mt-0.5">{ind.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function OurProcess() {
  const { ref, visible } = useScrollVisible();
  return (
    <section className="section-padding bg-background">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="text-center mb-12">
          <span className="text-primary font-semibold text-sm uppercase tracking-widest">How We Work</span>
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mt-3 text-balance">
            Our <span className="gradient-text">Process</span>
          </h2>
        </div>
        <div ref={ref} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {PROCESS.map((p, i) => (
            <div key={p.num}
              className={`group relative p-6 rounded-2xl border border-border bg-card hover:border-primary/40 hover:-translate-y-1 transition-all duration-500 h-full flex flex-col ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
              style={{ transitionDelay: `${i * 80}ms` }}>
              <div className="absolute top-4 right-4 text-5xl font-display font-black text-primary/5 group-hover:text-primary/10 transition-colors select-none leading-none">{p.num}</div>
              <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-4 shrink-0">
                <span className="text-primary font-bold text-sm font-display">{p.num}</span>
              </div>
              <h4 className="font-display font-semibold text-foreground mb-2">{p.title}</h4>
              <p className="text-sm text-muted-foreground text-pretty flex-1">{p.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Culture() {
  const { ref, visible } = useScrollVisible();
  const CULTURE_POINTS = [
    'Fully remote-friendly with hubs in 4 cities',
    'Continuous learning & $2,000/year learning budget',
    'Bi-annual all-hands summits',
    'Open source contribution Fridays',
    '360° performance reviews with transparent criteria',
    'Mental health support & flexible working hours',
  ];
  return (
    <section className="section-padding bg-muted/20">
      <div className="container mx-auto px-4 max-w-7xl">
        <div ref={ref} className={`grid lg:grid-cols-2 gap-12 items-center transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div>
            <span className="text-primary font-semibold text-sm uppercase tracking-widest">People</span>
            <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mt-3 mb-6 text-balance">
              Our <span className="gradient-text">Culture</span>
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-6 text-pretty">
              We've built a culture that attracts the best engineers and designers from around the world.
              Not through perks alone — but through meaningful work, intellectual challenge, and a genuine
              commitment to each other's growth.
            </p>
            <div className="space-y-3">
              {CULTURE_POINTS.map(point => (
                <div key={point} className="flex items-start gap-3">
                  <CheckCircle className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <span className="text-sm text-foreground">{point}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { bg: 'from-primary/20 to-orange-400/10', text: 'Innovation Labs', sub: 'Where tomorrow is built today' },
              { bg: 'from-purple-500/20 to-pink-500/10', text: 'Remote-First', sub: 'Work from anywhere, excel everywhere' },
              { bg: 'from-blue-500/20 to-cyan-500/10', text: 'Open Source', sub: 'Contributing back to the community' },
              { bg: 'from-green-500/20 to-emerald-500/10', text: 'Continuous Learning', sub: 'Always growing, always improving' },
            ].map(card => (
              <div key={card.text} className={`p-6 rounded-2xl bg-gradient-to-br ${card.bg} border border-border hover:-translate-y-1 transition-transform duration-300 h-full`}>
                <div className="font-display font-bold text-foreground mb-1">{card.text}</div>
                <div className="text-xs text-muted-foreground">{card.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function GlobalPresence() {
  const { ref, visible } = useScrollVisible();
  return (
    <section className="section-padding bg-background">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="text-center mb-12">
          <span className="text-primary font-semibold text-sm uppercase tracking-widest">Worldwide</span>
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mt-3 text-balance">
            Global <span className="gradient-text">Presence</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto mt-4 text-pretty">
            Strategically positioned in 4 cities, serving clients across 12 countries.
          </p>
        </div>
        <div ref={ref} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {OFFICES.map((o, i) => (
            <div key={o.city}
              className={`group p-6 rounded-2xl border border-border bg-card hover:border-primary/40 hover:-translate-y-1.5 transition-all duration-500 text-center ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
              style={{ transitionDelay: `${i * 100}ms` }}>
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-300">
                <MapPin className="w-6 h-6 text-primary" />
              </div>
              <div className="font-display font-bold text-foreground">{o.city}</div>
              <div className="text-sm text-muted-foreground">{o.country}</div>
              <div className="mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">{o.type}</div>
            </div>
          ))}
        </div>
        <div className="mt-8 p-6 rounded-2xl border border-border bg-muted/20 grid sm:grid-cols-3 gap-6 text-center">
          {[
            { value: '12+', label: 'Countries Served' },
            { value: '6', label: 'Continents Reached' },
            { value: '24/7', label: 'Global Support Coverage' },
          ].map(stat => (
            <div key={stat.label}>
              <div className="text-3xl font-display font-bold gradient-text mb-1">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTABanner() {
  return (
    <section className="section-padding bg-muted/20">
      <div className="container mx-auto px-4 max-w-4xl text-center">
        <div className="relative p-10 rounded-3xl border border-primary/20 bg-primary/5 overflow-hidden">
          <div className="absolute inset-0 pointer-events-none"
            style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 50%, hsl(25 100% 50% / 0.08) 0%, transparent 70%)' }} />
          <div className="relative">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4 text-balance">
              Ready to Build <span className="gradient-text">Together?</span>
            </h2>
            <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto text-pretty">
              Join 200+ enterprises who trust CoreStack to deliver technology that matters.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="h-12 px-8 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold" asChild>
                <Link to="/contact">Get in Touch <ArrowRight className="w-4 h-4 ml-2" /></Link>
              </Button>
              <Button size="lg" variant="ghost" className="h-12 px-8 border border-border text-foreground hover:bg-muted" asChild>
                <Link to="https://wa.me/qr/LAU6DIEPYNU4H1">Join Our Team</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Page ───────────────────────────────────────────────────────────────────────

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        {/* Back button */}
        <div className="container mx-auto px-4 max-w-7xl pt-24 pb-0">
          <BackButton />
        </div>
        <HeroBanner />
        <CompanyStory />
        <VisionMission />
        <CoreValues />
        <CEOMessage />
        <Timeline />
        <AnimatedStats />
        <Achievements />
        <IndustriesSection />
        <OurProcess />
        <Culture />
        <GlobalPresence />
        <CTABanner />
      </main>
      <Footer />
    </div>
  );
}

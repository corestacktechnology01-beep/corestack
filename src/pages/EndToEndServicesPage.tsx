import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '@/components/layouts/Header';
import Footer from '@/components/layouts/Footer';
import { Button } from '@/components/ui/button';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import {
  ArrowRight, CheckCircle, Code2, Cloud, Brain, Smartphone, Shield,
  BarChart2, Layers, Zap, Globe, GitBranch, Cpu, Database,
  TrendingUp, Target, Users, Clock, Rocket,
} from 'lucide-react';

// ── Chart data ────────────────────────────────────────────────────────────────

const techAdoptionData = [
  { year: '2018', cloud: 38, ai: 12, saas: 52 },
  { year: '2019', cloud: 47, ai: 19, saas: 60 },
  { year: '2020', cloud: 61, ai: 29, saas: 71 },
  { year: '2021', cloud: 72, ai: 41, saas: 80 },
  { year: '2022', cloud: 81, ai: 57, saas: 87 },
  { year: '2023', cloud: 88, ai: 69, saas: 92 },
  { year: '2024', cloud: 93, ai: 79, saas: 95 },
  { year: '2025', cloud: 96, ai: 87, saas: 97 },
];

const marketSizeData = [
  { year: '2020', cloud: 371, ai: 58, saas: 157 },
  { year: '2021', cloud: 482, ai: 89, saas: 198 },
  { year: '2022', cloud: 591, ai: 136, saas: 237 },
  { year: '2023', cloud: 679, ai: 208, saas: 280 },
  { year: '2024', cloud: 790, ai: 305, saas: 330 },
  { year: '2025', cloud: 921, ai: 431, saas: 390 },
  { year: '2026', cloud: 1079, ai: 598, saas: 458 },
];

const aiGrowthData = [
  { year: '2020', value: 58 }, { year: '2021', value: 89 },
  { year: '2022', value: 136 }, { year: '2023', value: 208 },
  { year: '2024', value: 305 }, { year: '2025', value: 431 },
  { year: '2026', value: 598 }, { year: '2027', value: 826 },
];

const cloudGrowthData = [
  { year: '2020', aws: 140, azure: 96, gcp: 58 },
  { year: '2021', aws: 186, azure: 132, gcp: 80 },
  { year: '2022', aws: 236, azure: 176, gcp: 102 },
  { year: '2023', aws: 280, azure: 218, gcp: 128 },
  { year: '2024', aws: 338, azure: 265, gcp: 158 },
  { year: '2025', aws: 400, azure: 318, gcp: 192 },
];

const saasGrowthData = [
  { year: '2020', value: 157 }, { year: '2021', value: 198 },
  { year: '2022', value: 237 }, { year: '2023', value: 280 },
  { year: '2024', value: 330 }, { year: '2025', value: 390 },
  { year: '2026', value: 458 }, { year: '2027', value: 538 },
];

// ── Scroll animation hook ────────────────────────────────────────────────────

function useScrollVisible(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

// ── Animated chart wrapper ───────────────────────────────────────────────────

function AnimatedChart({ children, title, subtitle }: { children: React.ReactNode; title: string; subtitle: string }) {
  const { ref, visible } = useScrollVisible();
  return (
    <div ref={ref} className={`p-6 rounded-2xl border border-border bg-card h-full transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
      <div className="mb-4">
        <h3 className="font-display font-semibold text-foreground">{title}</h3>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      </div>
      <div className="h-52">
        {visible && (
          <ResponsiveContainer width="100%" height="100%">
            {children as React.ReactElement}
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

// ── Services data ─────────────────────────────────────────────────────────────

const SERVICES = [
  { icon: Code2, title: 'Custom Software Development', desc: 'Tailor-made applications built from the ground up — web, desktop, and embedded systems engineered for your exact workflow.', color: 'text-blue-400', bg: 'bg-blue-500/10' },
  { icon: Smartphone, title: 'Mobile App Development', desc: 'Native iOS, Android, and cross-platform apps with seamless UX and enterprise-grade security baked in.', color: 'text-green-400', bg: 'bg-green-500/10' },
  { icon: Cloud, title: 'Cloud & DevOps', desc: 'Multi-cloud architecture, CI/CD pipelines, Kubernetes orchestration, and infrastructure-as-code for reliable scale.', color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
  { icon: Brain, title: 'AI & Machine Learning', desc: 'Predictive analytics, NLP, computer vision, and LLM integrations that turn your data into competitive intelligence.', color: 'text-purple-400', bg: 'bg-purple-500/10' },
  { icon: Layers, title: 'ERP / CRM Solutions', desc: 'End-to-end enterprise systems that unify operations, streamline workflows, and deliver real-time business intelligence.', color: 'text-orange-400', bg: 'bg-orange-500/10' },
  { icon: Shield, title: 'Cybersecurity', desc: 'Zero-trust architecture, penetration testing, SIEM integration, and compliance frameworks to protect critical assets.', color: 'text-red-400', bg: 'bg-red-500/10' },
  { icon: BarChart2, title: 'UI/UX Design', desc: 'Research-driven design systems, interactive prototypes, and polished interfaces that convert and delight users.', color: 'text-pink-400', bg: 'bg-pink-500/10' },
  { icon: Globe, title: 'Digital Transformation', desc: 'End-to-end modernization roadmaps that migrate legacy systems, automate processes, and future-proof your enterprise.', color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
];

const WORKFLOW = [
  { step: '01', icon: Target, title: 'Discovery & Strategy', desc: 'Deep dive into your business objectives, technical landscape, and user needs to create a bulletproof solution blueprint.' },
  { step: '02', icon: Cpu, title: 'Architecture & Design', desc: 'System architecture, database schemas, API contracts, and UI/UX wireframes — all documented before a line of code is written.' },
  { step: '03', icon: Code2, title: 'Agile Development', desc: '2-week sprints with daily standups, continuous integration, and stakeholder demos ensuring transparent, on-track delivery.' },
  { step: '04', icon: Shield, title: 'QA & Security Testing', desc: 'Automated test suites, penetration testing, performance benchmarks, and accessibility audits before every release.' },
  { step: '05', icon: Rocket, title: 'Deployment & Launch', desc: 'Zero-downtime deployment with full monitoring, rollback capabilities, and 24/7 on-call support from day one.' },
  { step: '06', icon: TrendingUp, title: 'Optimization & Growth', desc: 'Post-launch analytics, feature iteration, performance tuning, and long-term SLA-backed maintenance partnerships.' },
];

const LIFECYCLE = [
  { phase: 'Plan', color: 'bg-primary', percent: 15 },
  { phase: 'Design', color: 'bg-purple-500', percent: 20 },
  { phase: 'Build', color: 'bg-blue-500', percent: 35 },
  { phase: 'Test', color: 'bg-cyan-500', percent: 15 },
  { phase: 'Deploy', color: 'bg-green-500', percent: 10 },
  { phase: 'Maintain', color: 'bg-orange-500', percent: 5 },
];

const FEATURES = [
  { feature: 'Dedicated Project Manager', basic: false, pro: true, enterprise: true },
  { feature: 'Source Code Ownership', basic: true, pro: true, enterprise: true },
  { feature: 'CI/CD Pipeline Setup', basic: false, pro: true, enterprise: true },
  { feature: 'Automated Testing Suite', basic: false, pro: true, enterprise: true },
  { feature: 'Security Audit', basic: false, pro: false, enterprise: true },
  { feature: 'SLA Guarantee (99.9%)', basic: false, pro: true, enterprise: true },
  { feature: 'Multi-Cloud Architecture', basic: false, pro: false, enterprise: true },
  { feature: '24/7 Support', basic: false, pro: false, enterprise: true },
  { feature: 'Custom Integrations', basic: false, pro: true, enterprise: true },
  { feature: 'Executive Reporting', basic: false, pro: false, enterprise: true },
];

const CHART_TOOLTIP_STYLE = {
  contentStyle: { background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' },
  labelStyle: { color: 'hsl(var(--foreground))' },
};

// ── Page sections ─────────────────────────────────────────────────────────────

function Hero() {
  return (
    <section className="relative min-h-[60vh] flex items-center justify-center overflow-hidden bg-background pt-16">
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 90% 60% at 50% 0%, hsl(25 100% 50% / 0.12) 0%, transparent 70%)' }} />
      <div className="absolute inset-0 pointer-events-none opacity-[0.025]"
        style={{ backgroundImage: 'linear-gradient(hsl(var(--border)) 1px,transparent 1px),linear-gradient(90deg,hsl(var(--border)) 1px,transparent 1px)', backgroundSize: '60px 60px' }} />
      <div className="relative z-10 text-center px-4 max-w-5xl mx-auto py-20">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/5 text-primary text-sm font-medium mb-6">
          <Layers className="w-3.5 h-3.5" /> End-to-End Technology Services
        </div>
        <h1 className="text-4xl md:text-6xl font-display font-bold text-foreground mb-6 text-balance">
          Complete Technology <span className="gradient-text">Lifecycle</span>
          <br />From Idea to Scale
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-8 text-pretty">
          One partner. Eight disciplines. Zero handoff friction. CoreStack delivers integrated technology services
          that cover every stage of your digital journey — strategy, design, engineering, and beyond.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" className="h-12 px-8 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold" asChild>
            <Link to="/contact">Start Your Project <ArrowRight className="w-4 h-4 ml-2" /></Link>
          </Button>
          <Button size="lg" variant="ghost" className="h-12 px-8 border border-border text-foreground hover:bg-muted" asChild>
            <Link to="/portfolio">View Portfolio</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

function ServiceCards() {
  return (
    <section className="section-padding bg-muted/20">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="text-center mb-12">
          <span className="text-primary font-semibold text-sm uppercase tracking-widest">What We Do</span>
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mt-3 text-balance">
            8 Core <span className="gradient-text">Service Disciplines</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto mt-4 text-pretty">
            Deep specialization in each domain — integrated seamlessly when your project demands it.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {SERVICES.map((s, i) => (
            <div key={s.title}
              className="group p-6 rounded-2xl border border-border bg-card hover:border-primary/40 hover:-translate-y-1.5 transition-all duration-300 h-full flex flex-col"
              style={{ animationDelay: `${i * 80}ms` }}>
              <div className={`w-12 h-12 rounded-xl ${s.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shrink-0`}>
                <s.icon className={`w-6 h-6 ${s.color}`} />
              </div>
              <h3 className="font-display font-semibold text-foreground mb-2 text-sm">{s.title}</h3>
              <p className="text-xs text-muted-foreground text-pretty flex-1">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Workflow() {
  return (
    <section className="section-padding bg-background">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="text-center mb-12">
          <span className="text-primary font-semibold text-sm uppercase tracking-widest">How We Work</span>
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mt-3 text-balance">
            Proven <span className="gradient-text">Service Workflow</span>
          </h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {WORKFLOW.map((w) => (
            <div key={w.step} className="group relative p-6 rounded-2xl border border-border bg-card hover:border-primary/40 hover:-translate-y-1 transition-all duration-300 h-full flex flex-col">
              <div className="absolute top-4 right-4 text-4xl font-display font-black text-primary/5 group-hover:text-primary/10 transition-colors select-none">{w.step}</div>
              <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center mb-4 shrink-0 group-hover:bg-primary/20 transition-colors">
                <w.icon className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-display font-semibold text-foreground mb-2">{w.title}</h3>
              <p className="text-sm text-muted-foreground text-pretty flex-1">{w.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function DevelopmentLifecycle() {
  const { ref, visible } = useScrollVisible();
  return (
    <section className="section-padding bg-muted/20">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="text-center mb-12">
          <span className="text-primary font-semibold text-sm uppercase tracking-widest">Process</span>
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mt-3 text-balance">
            Development <span className="gradient-text">Lifecycle</span>
          </h2>
        </div>
        <div ref={ref} className="relative p-8 rounded-2xl border border-border bg-card">
          {/* Phase bar */}
          <div className="flex rounded-xl overflow-hidden h-14 mb-8">
            {LIFECYCLE.map((l, i) => (
              <div key={l.phase} className={`${l.color} flex items-center justify-center text-white text-xs font-semibold transition-all duration-700`}
                style={{ width: visible ? `${l.percent}%` : '0%', transitionDelay: `${i * 120}ms`, minWidth: visible ? undefined : 0 }}>
                {visible && l.percent > 8 && l.phase}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {LIFECYCLE.map(l => (
              <div key={l.phase} className="text-center">
                <div className={`w-3 h-3 rounded-full ${l.color} mx-auto mb-1.5`} />
                <div className="text-xs font-medium text-foreground">{l.phase}</div>
                <div className="text-xs text-muted-foreground">{l.percent}%</div>
              </div>
            ))}
          </div>
          <div className="mt-8 grid sm:grid-cols-3 gap-4">
            {[
              { icon: Clock, label: 'Avg. Delivery', value: '12 Weeks', note: 'MVP to production' },
              { icon: Users, label: 'Team Size', value: '5–25', note: 'Dedicated engineers' },
              { icon: GitBranch, label: 'Sprint Cadence', value: '2 Weeks', note: 'With stakeholder demos' },
            ].map(stat => (
              <div key={stat.label} className="flex items-center gap-4 p-4 rounded-xl bg-muted/40 border border-border">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <stat.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <div className="text-xl font-display font-bold text-foreground">{stat.value}</div>
                  <div className="text-xs text-muted-foreground">{stat.label} · {stat.note}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function FeatureComparison() {
  return (
    <section className="section-padding bg-background">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="text-center mb-12">
          <span className="text-primary font-semibold text-sm uppercase tracking-widest">Engagement Models</span>
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mt-3 text-balance">
            Service <span className="gradient-text">Comparison</span>
          </h2>
        </div>
        <div className="rounded-2xl border border-border overflow-x-auto">
          <table className="w-full min-w-[520px]">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left p-4 text-sm font-semibold text-foreground w-1/2">Feature</th>
                <th className="text-center p-4 text-sm font-semibold text-foreground">Basic</th>
                <th className="text-center p-4 text-sm font-semibold text-primary">Pro</th>
                <th className="text-center p-4 text-sm font-semibold text-foreground">Enterprise</th>
              </tr>
            </thead>
            <tbody>
              {FEATURES.map((f, i) => (
                <tr key={f.feature} className={`border-b border-border last:border-0 ${i % 2 === 0 ? 'bg-transparent' : 'bg-muted/10'}`}>
                  <td className="p-4 text-sm text-foreground whitespace-nowrap">{f.feature}</td>
                  {(['basic', 'pro', 'enterprise'] as const).map(tier => (
                    <td key={tier} className="p-4 text-center">
                      {f[tier]
                        ? <CheckCircle className={`w-5 h-5 mx-auto ${tier === 'pro' ? 'text-primary' : 'text-green-400'}`} />
                        : <span className="text-muted-foreground text-lg leading-none">—</span>}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="text-center mt-8">
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold h-11 px-8" asChild>
            <Link to="/contact">Discuss Your Requirements <ArrowRight className="w-4 h-4 ml-2" /></Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

function MarketDemand() {
  return (
    <section className="section-padding bg-muted/20">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="text-center mb-12">
          <span className="text-primary font-semibold text-sm uppercase tracking-widest">Market Opportunity</span>
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mt-3 text-balance">
            Why the <span className="gradient-text">Demand is Exploding</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-3xl mx-auto mt-4 text-pretty">
            Global technology investment is accelerating at an unprecedented rate. Every chart below represents
            a market where CoreStack delivers measurable, compounding value.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
          {[
            { icon: Database, label: 'Cloud Market', value: '$921B', note: '2025 global spend', color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
            { icon: Brain, label: 'AI Market', value: '$431B', note: '2025 global spend', color: 'text-purple-400', bg: 'bg-purple-500/10' },
            { icon: Zap, label: 'SaaS Market', value: '$390B', note: '2025 global spend', color: 'text-orange-400', bg: 'bg-orange-500/10' },
            { icon: TrendingUp, label: 'AI CAGR', value: '37%', note: 'Compound annual growth', color: 'text-green-400', bg: 'bg-green-500/10' },
            { icon: Globe, label: 'Cloud Adoption', value: '96%', note: 'Enterprise adoption by 2025', color: 'text-blue-400', bg: 'bg-blue-500/10' },
            { icon: Rocket, label: 'SaaS CAGR', value: '18%', note: 'Compound annual growth', color: 'text-pink-400', bg: 'bg-pink-500/10' },
          ].map(stat => (
            <div key={stat.label} className="p-6 rounded-2xl border border-border bg-card flex items-center gap-4 hover:border-primary/40 transition-colors">
              <div className={`w-12 h-12 rounded-xl ${stat.bg} flex items-center justify-center shrink-0`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <div>
                <div className="text-2xl font-display font-bold text-foreground">{stat.value}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{stat.label} · {stat.note}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Charts() {
  return (
    <section className="section-padding bg-background">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="text-center mb-12">
          <span className="text-primary font-semibold text-sm uppercase tracking-widest">Data & Insights</span>
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mt-3 text-balance">
            Interactive <span className="gradient-text">Growth Charts</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto mt-4 text-pretty">
            Scroll-animated charts showing technology adoption, market growth, and investment trends.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <AnimatedChart title="Technology Adoption Rate (%)" subtitle="Cloud, AI & SaaS adoption across enterprises globally">
            <LineChart data={techAdoptionData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="year" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
              <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} unit="%" />
              <Tooltip {...CHART_TOOLTIP_STYLE} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Line type="monotone" dataKey="cloud" stroke="#06b6d4" strokeWidth={2} dot={false} name="Cloud" />
              <Line type="monotone" dataKey="ai" stroke="#a855f7" strokeWidth={2} dot={false} name="AI" />
              <Line type="monotone" dataKey="saas" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} name="SaaS" />
            </LineChart>
          </AnimatedChart>

          <AnimatedChart title="Global Market Size ($B)" subtitle="Combined cloud, AI and SaaS market size in USD billions">
            <AreaChart data={marketSizeData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="year" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
              <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} unit="B" />
              <Tooltip {...CHART_TOOLTIP_STYLE} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Area type="monotone" dataKey="cloud" stackId="1" stroke="#06b6d4" fill="#06b6d420" name="Cloud" />
              <Area type="monotone" dataKey="ai" stackId="1" stroke="#a855f7" fill="#a855f720" name="AI" />
              <Area type="monotone" dataKey="saas" stackId="1" stroke="hsl(var(--primary))" fill="hsl(var(--primary)/0.15)" name="SaaS" />
            </AreaChart>
          </AnimatedChart>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatedChart title="AI Market Growth ($B)" subtitle="Global artificial intelligence market size (USD billions)">
            <BarChart data={aiGrowthData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="year" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
              <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} unit="B" />
              <Tooltip {...CHART_TOOLTIP_STYLE} />
              <Bar dataKey="value" fill="#a855f7" radius={[4, 4, 0, 0]} name="AI Market ($B)" />
            </BarChart>
          </AnimatedChart>

          <AnimatedChart title="Cloud Provider Revenue ($B)" subtitle="AWS, Azure, Google Cloud annual revenue trend">
            <AreaChart data={cloudGrowthData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="year" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
              <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} unit="B" />
              <Tooltip {...CHART_TOOLTIP_STYLE} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Area type="monotone" dataKey="aws" stroke="#f97316" fill="#f9731615" name="AWS" />
              <Area type="monotone" dataKey="azure" stroke="#06b6d4" fill="#06b6d415" name="Azure" />
              <Area type="monotone" dataKey="gcp" stroke="#22c55e" fill="#22c55e15" name="GCP" />
            </AreaChart>
          </AnimatedChart>

          <AnimatedChart title="SaaS Market Growth ($B)" subtitle="Global Software-as-a-Service market size (USD billions)">
            <AreaChart data={saasGrowthData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="year" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
              <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} unit="B" />
              <Tooltip {...CHART_TOOLTIP_STYLE} />
              <Area type="monotone" dataKey="value" stroke="hsl(var(--primary))" fill="hsl(var(--primary)/0.15)" name="SaaS Market ($B)" />
            </AreaChart>
          </AnimatedChart>
        </div>
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section className="section-padding bg-muted/20">
      <div className="container mx-auto px-4 max-w-4xl text-center">
        <div className="p-10 rounded-3xl border border-primary/20 bg-primary/5 relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none"
            style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 50%, hsl(25 100% 50% / 0.08) 0%, transparent 70%)' }} />
          <div className="relative">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4 text-balance">
              Ready to Build Something <span className="gradient-text">Exceptional?</span>
            </h2>
            <p className="text-muted-foreground text-lg mb-8 text-pretty max-w-2xl mx-auto">
              Let's turn your vision into production-ready software. Book a free strategy session with our experts.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="h-12 px-8 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold" asChild>
                <Link to="/contact">Book Free Strategy Call <ArrowRight className="w-4 h-4 ml-2" /></Link>
              </Button>
              <Button size="lg" variant="ghost" className="h-12 px-8 border border-border text-foreground hover:bg-muted" asChild>
                <Link to="/portfolio">View Case Studies</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function EndToEndServicesPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        <Hero />
        <ServiceCards />
        <Workflow />
        <DevelopmentLifecycle />
        <FeatureComparison />
        <MarketDemand />
        <Charts />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}

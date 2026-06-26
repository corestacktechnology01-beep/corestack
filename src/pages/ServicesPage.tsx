import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '@/components/layouts/Header';
import Footer from '@/components/layouts/Footer';
import { ChevronRight, Code2, Globe, Smartphone, Cloud, Server, Palette, LayoutGrid, Lightbulb, ArrowRight, CheckCircle, TrendingUp, Users, Award, Zap } from 'lucide-react';
import BookConsultationModal from '@/components/modals/BookConsultationModal';
import BackButton from '@/components/ui/BackButton';

// ─── Data ──────────────────────────────────────────────────────────────────────
export const SERVICES_DATA = [
  {
    slug: 'custom-software-development',
    icon: Code2,
    title: 'Custom Software Development',
    tagline: 'Bespoke solutions engineered for your exact workflows.',
    desc: 'Tailor-made software solutions designed around your unique business processes and strategic objectives — from enterprise platforms to niche automation tools.',
    color: 'text-orange-400',
    bg: 'bg-orange-500/10',
    border: 'border-orange-500/30',
    glow: 'shadow-orange-500/10',
    highlights: ['Requirement Analysis', 'Architecture Design', 'Agile Development', 'QA & Testing', 'Deployment', '24/7 Support'],
  },
  {
    slug: 'web-development',
    icon: Globe,
    title: 'Web Development',
    tagline: 'High-performance web apps with bulletproof architecture.',
    desc: 'Full-stack web applications built with modern frameworks — React, Next.js, Vue — delivering exceptional performance, accessibility, and developer experience.',
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/30',
    glow: 'shadow-blue-500/10',
    highlights: ['React / Next.js', 'Node.js / Go APIs', 'PostgreSQL / Redis', 'CI/CD Pipelines', 'PWA', 'SEO Optimized'],
  },
  {
    slug: 'mobile-app-development',
    icon: Smartphone,
    title: 'Mobile App Development',
    tagline: 'Native and cross-platform apps users love.',
    desc: 'iOS and Android applications built with React Native and Flutter — native performance, pixel-perfect UI, and deep device integration.',
    color: 'text-green-400',
    bg: 'bg-green-500/10',
    border: 'border-green-500/30',
    glow: 'shadow-green-500/10',
    highlights: ['React Native', 'Flutter', 'iOS & Android', 'Push Notifications', 'Offline Mode', 'App Store Deployment'],
  },
  {
    slug: 'saas-development',
    icon: Cloud,
    title: 'SaaS Development',
    tagline: 'Scalable multi-tenant products built to grow.',
    desc: 'Complete SaaS products with multi-tenancy, subscription billing, usage analytics, and horizontally scalable infrastructure — from MVP to enterprise scale.',
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/10',
    border: 'border-cyan-500/30',
    glow: 'shadow-cyan-500/10',
    highlights: ['Multi-tenancy', 'Stripe Billing', 'Usage Analytics', 'Role-Based Access', 'API-First', 'White-Label Ready'],
  },
  {
    slug: 'cloud-solutions',
    icon: Server,
    title: 'Cloud Solutions',
    tagline: 'Architecture, migration, and optimization at scale.',
    desc: 'End-to-end cloud strategy across AWS, Azure, and GCP — infrastructure design, workload migration, Kubernetes orchestration, and FinOps optimization.',
    color: 'text-indigo-400',
    bg: 'bg-indigo-500/10',
    border: 'border-indigo-500/30',
    glow: 'shadow-indigo-500/10',
    highlights: ['AWS / Azure / GCP', 'Kubernetes', 'Terraform IaC', 'Cloud Migration', 'FinOps', '99.99% Uptime SLA'],
  },
  {
    slug: 'ui-ux-design',
    icon: Palette,
    title: 'UI/UX Design',
    tagline: 'Human-centered design that drives results.',
    desc: 'From user research and wireframes to polished design systems — we create intuitive, accessible interfaces that reduce friction and maximize conversion.',
    color: 'text-pink-400',
    bg: 'bg-pink-500/10',
    border: 'border-pink-500/30',
    glow: 'shadow-pink-500/10',
    highlights: ['UX Research', 'Wireframing', 'Figma Prototypes', 'Design Systems', 'Accessibility (WCAG)', 'Usability Testing'],
  },
  {
    slug: 'erp-crm-development',
    icon: LayoutGrid,
    title: 'ERP & CRM Development',
    tagline: 'Unified operations and accelerated growth.',
    desc: 'Custom ERP and CRM systems that integrate your finance, inventory, HR, sales, and customer service into a single source of truth for your business.',
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
    glow: 'shadow-amber-500/10',
    highlights: ['Inventory Management', 'Finance Modules', 'HR & Payroll', 'Sales Pipeline', 'Customer Portal', 'Real-time Dashboards'],
  },
  {
    slug: 'it-consulting',
    icon: Lightbulb,
    title: 'IT Consulting',
    tagline: 'Strategic technology advisory for sustainable growth.',
    desc: 'Expert advisory services that align technology investments with business goals — from digital transformation roadmaps to vendor selection and risk assessment.',
    color: 'text-rose-400',
    bg: 'bg-rose-500/10',
    border: 'border-rose-500/30',
    glow: 'shadow-rose-500/10',
    highlights: ['Digital Transformation', 'Tech Due Diligence', 'Architecture Review', 'Vendor Selection', 'Risk Assessment', 'IT Roadmapping'],
  },
];

const STATS = [
  { icon: TrendingUp, value: '500+', label: 'Projects Delivered', color: 'text-orange-400' },
  { icon: Users, value: '200+', label: 'Enterprise Clients', color: 'text-blue-400' },
  { icon: Award, value: '98%', label: 'Client Satisfaction', color: 'text-green-400' },
  { icon: Zap, value: '50+', label: 'Expert Engineers', color: 'text-cyan-400' },
];

// ─── AnimatedCard ──────────────────────────────────────────────────────────────
function AnimatedCard({ service, index }: { service: typeof SERVICES_DATA[0]; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const Icon = service.icon;

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.12 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${(index % 4) * 80}ms` }}
      className={`transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
    >
      <Link to={`/services/${service.slug}`} className="group block h-full">
        <div className={`relative h-full p-6 rounded-2xl border ${service.border} bg-card/60 backdrop-blur-sm hover:bg-card hover:-translate-y-2 hover:shadow-2xl ${service.glow} transition-all duration-300 flex flex-col overflow-hidden`}>
          {/* Glow orb */}
          <div className={`absolute -top-10 -right-10 w-32 h-32 rounded-full ${service.bg} blur-2xl opacity-0 group-hover:opacity-60 transition-opacity duration-500`} />

          <div className={`w-12 h-12 rounded-xl ${service.bg} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300 shrink-0`}>
            <Icon className={`w-6 h-6 ${service.color}`} />
          </div>

          <h3 className="font-display font-bold text-foreground text-lg mb-2 text-balance">{service.title}</h3>
          <p className={`text-sm font-medium mb-3 ${service.color}`}>{service.tagline}</p>
          <p className="text-sm text-muted-foreground text-pretty flex-1 leading-relaxed">{service.desc}</p>

          {/* Highlights */}
          <div className="flex flex-wrap gap-1.5 mt-4">
            {service.highlights.slice(0, 3).map(h => (
              <span key={h} className={`text-xs px-2 py-0.5 rounded-full ${service.bg} ${service.color} font-medium`}>{h}</span>
            ))}
          </div>

          <div className={`flex items-center gap-1.5 mt-5 text-sm font-semibold ${service.color} group-hover:gap-2.5 transition-all duration-200`}>
            <span>Explore Service</span>
            <ArrowRight className="w-4 h-4 shrink-0" />
          </div>
        </div>
      </Link>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function ServicesPage() {
  const [consultOpen, setConsultOpen] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);
  const [heroVisible, setHeroVisible] = useState(false);

  useEffect(() => {
    setTimeout(() => setHeroVisible(true), 100);
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow">

        {/* ── Hero ──────────────────────────────────────────────────────────── */}
        <section ref={heroRef} className="relative overflow-hidden pt-32 pb-20 bg-background">
          {/* BG gradient blobs */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-primary/8 rounded-full blur-[120px]" />
            <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-blue-500/6 rounded-full blur-[100px]" />
          </div>

          <div className="container mx-auto px-4 max-w-7xl relative">
            <div className="mb-6"><BackButton /></div>
            {/* Breadcrumb */}
            <nav className={`flex items-center gap-2 text-sm text-muted-foreground mb-8 transition-all duration-700 ${heroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              <Link to="/" className="hover:text-primary transition-colors">Home</Link>
              <ChevronRight className="w-3.5 h-3.5" />
              <span className="text-foreground font-medium">Services</span>
            </nav>

            <div className={`max-w-4xl transition-all duration-700 delay-100 ${heroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-6">
                <Zap className="w-3.5 h-3.5 text-primary" />
                <span className="text-primary text-xs font-semibold uppercase tracking-widest">What We Do</span>
              </div>
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-bold text-foreground mb-6 text-balance leading-tight">
                End-to-End{' '}
                <span className="gradient-text">Technology</span>{' '}
                Services
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl text-pretty leading-relaxed mb-8">
                From ideation to deployment and beyond — we deliver the full spectrum of modern technology services to fuel your digital transformation journey.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => setConsultOpen(true)}
                  className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/25"
                >
                  Book Free Consultation <ArrowRight className="w-4 h-4" />
                </button>
                <Link
                  to="/portfolio"
                  className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl border border-border bg-card/60 text-foreground font-semibold hover:border-primary/40 hover:bg-card transition-all"
                >
                  View Our Work
                </Link>
              </div>
            </div>

            {/* Stats bar */}
            <div className={`mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 transition-all duration-700 delay-300 ${heroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              {STATS.map(stat => {
                const Icon = stat.icon;
                return (
                  <div key={stat.label} className="flex items-center gap-3 p-4 rounded-xl border border-border bg-card/60 backdrop-blur-sm">
                    <div className={`w-9 h-9 rounded-lg bg-card flex items-center justify-center shrink-0`}>
                      <Icon className={`w-4 h-4 ${stat.color}`} />
                    </div>
                    <div>
                      <div className={`text-xl font-display font-bold ${stat.color}`}>{stat.value}</div>
                      <div className="text-xs text-muted-foreground">{stat.label}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── Services Grid ──────────────────────────────────────────────────── */}
        <section className="py-20 bg-muted/20">
          <div className="container mx-auto px-4 max-w-7xl">
            <div className="text-center mb-14">
              <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4 text-balance">
                Choose Your{' '}
                <span className="gradient-text">Service</span>
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto text-pretty">
                Click any service to explore detailed information, case studies, market analytics, and more.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {SERVICES_DATA.map((service, i) => (
                <AnimatedCard key={service.slug} service={service} index={i} />
              ))}
            </div>
          </div>
        </section>

        {/* ── Why CoreStack ──────────────────────────────────────────────────── */}
        <section className="py-20 bg-background">
          <div className="container mx-auto px-4 max-w-7xl">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 mb-5">
                  <span className="text-primary text-xs font-semibold uppercase tracking-widest">Why CoreStack</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-6 text-balance">
                  Enterprise quality,<br />
                  <span className="gradient-text">startup agility</span>
                </h2>
                <p className="text-muted-foreground text-pretty leading-relaxed mb-8">
                  We combine Fortune 500-level technical rigor with the speed and adaptability of a product-focused team. Every engagement is backed by dedicated architects, project managers, and 24/7 support.
                </p>
                <div className="space-y-3">
                  {['ISO-aligned development practices','Dedicated project managers on every engagement','Transparent reporting and weekly sprint demos','Post-launch support and SLA guarantees'].map(item => (
                    <div key={item} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <span className="text-sm text-muted-foreground">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { num: '10+', label: 'Years Experience', sub: 'Delivering excellence' },
                  { num: '50+', label: 'Certified Engineers', sub: 'AWS, Azure, GCP certified' },
                  { num: '99.9%', label: 'Uptime SLA', sub: 'On all managed services' },
                  { num: '4.9★', label: 'Client Rating', sub: 'Average across 200+ reviews' },
                ].map(item => (
                  <div key={item.label} className="p-5 rounded-2xl border border-border bg-card/60 backdrop-blur-sm hover:border-primary/30 transition-colors">
                    <div className="text-3xl font-display font-bold gradient-text mb-1">{item.num}</div>
                    <div className="text-sm font-semibold text-foreground mb-1">{item.label}</div>
                    <div className="text-xs text-muted-foreground">{item.sub}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── CTA ───────────────────────────────────────────────────────────── */}
        <section className="py-16 bg-primary/5 border-y border-primary/10">
          <div className="container mx-auto px-4 max-w-3xl text-center">
            <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-4 text-balance">
              Not sure which service fits your needs?
            </h2>
            <p className="text-muted-foreground mb-8">
              Book a free 30-minute consultation with our team and we'll map the right solution to your goals.
            </p>
            <button
              onClick={() => setConsultOpen(true)}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-primary text-primary-foreground font-bold text-lg hover:bg-primary/90 transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/30"
            >
              Book Free Consultation <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </section>
      </main>
      <Footer />
      <BookConsultationModal open={consultOpen} onClose={() => setConsultOpen(false)} />
    </div>
  );
}

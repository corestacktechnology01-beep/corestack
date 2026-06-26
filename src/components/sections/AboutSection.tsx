import { CheckCircle, Target, Eye, Rocket, Award, Users, Globe, Zap } from 'lucide-react';

const WHY_ITEMS = [
  { icon: Rocket, title: 'Delivery at Speed', desc: 'Agile workflows and battle-tested processes ensure on-time delivery without compromising quality.' },
  { icon: Award, title: 'Enterprise-Grade Quality', desc: 'ISO-aligned development standards, rigorous QA, and 99.9% SLA commitments on every engagement.' },
  { icon: Users, title: 'Dedicated Expert Teams', desc: 'Each project gets a dedicated senior team — no juniors, no outsourcing, no surprises.' },
  { icon: Globe, title: 'Global Scale Mindset', desc: 'We architect for scale from day one. Our solutions serve millions of users across 12+ countries.' },
  { icon: Zap, title: 'AI-First Approach', desc: 'We integrate intelligent automation and AI capabilities into every product we build, by default.' },
  { icon: CheckCircle, title: 'Full Lifecycle Support', desc: '24/7 maintenance, continuous iteration, and strategic partnership beyond the initial launch.' },
];

const TIMELINE = [
  { year: '2023', title: 'Founded', desc: 'CoreStack Technology founded with a vision to build world-class software for enterprises.' },
  { year: '2024', title: 'First Enterprise Clients', desc: 'Secured first enterprise clients and delivered mission-critical platforms across multiple industries.' },
  { year: '2025', title: 'AI & SaaS Expansion', desc: 'Launched dedicated AI/ML services and first proprietary SaaS products serving thousands of businesses.' },
  { year: '2026', title: 'Next Chapter', desc: 'Scaling engineering capabilities, expanding globally, and launching next-generation AI-powered products.' },
];

export default function AboutSection() {
  return (
    <section id="about" className="section-padding bg-background">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Section header */}
        <div className="text-center mb-16">
          <span className="text-primary font-semibold text-sm uppercase tracking-widest">About CoreStack</span>
          <h2 className="text-3xl md:text-5xl font-display font-bold text-foreground mt-3 mb-5 text-balance">
            Engineering the Future of{' '}
            <span className="gradient-text">Digital Business</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-3xl mx-auto text-pretty">
            Founded in 2023, CoreStack Technology has grown from a boutique software studio into a trusted
            technology partner serving enterprises across finance, healthcare, logistics, and beyond.
          </p>
        </div>

        {/* Vision & Mission cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-20">
          <div className="relative p-8 rounded-2xl border border-border bg-card overflow-hidden group hover:border-primary/50 transition-colors duration-300">
            <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-primary/5 blur-3xl group-hover:bg-primary/10 transition-colors duration-500" />
            <div className="relative">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-5">
                <Target className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-display font-bold text-foreground mb-3">Our Mission</h3>
              <p className="text-muted-foreground leading-relaxed text-pretty">
                To democratize enterprise-grade technology by building intelligent, scalable digital solutions
                that empower organizations of every size to compete, grow, and lead in the digital economy.
                We believe the best software doesn't just solve problems — it creates new possibilities.
              </p>
            </div>
          </div>
          <div className="relative p-8 rounded-2xl border border-border bg-card overflow-hidden group hover:border-primary/50 transition-colors duration-300">
            <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-purple-500/5 blur-3xl group-hover:bg-purple-500/10 transition-colors duration-500" />
            <div className="relative">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center mb-5">
                <Eye className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-xl font-display font-bold text-foreground mb-3">Our Vision</h3>
              <p className="text-muted-foreground leading-relaxed text-pretty">
                To be the most trusted technology partner for global enterprises — known not just for
                exceptional code, but for transformative outcomes. We envision a world where every business
                has access to the kind of technology that was once reserved only for the largest corporations.
              </p>
            </div>
          </div>
        </div>

        {/* Why CoreStack */}
        <div className="mb-20">
          <h3 className="text-2xl md:text-3xl font-display font-bold text-foreground text-center mb-12">
            Why Choose <span className="gradient-text">CoreStack Technology</span>
          </h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {WHY_ITEMS.map((item) => (
              <div
                key={item.title}
                className="p-6 rounded-xl border border-border bg-card group hover:border-primary/40 hover:-translate-y-1 transition-all duration-300"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <item.icon className="w-5 h-5 text-primary" />
                </div>
                <h4 className="font-semibold text-foreground mb-2">{item.title}</h4>
                <p className="text-sm text-muted-foreground text-pretty">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Timeline */}
        <div>
          <h3 className="text-2xl md:text-3xl font-display font-bold text-foreground text-center mb-12">
            Our <span className="gradient-text">Growth Journey</span>
          </h3>
          <div className="relative">
            {/* Center line */}
            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-border hidden md:block" />
            <div className="space-y-8">
              {TIMELINE.map((item, i) => (
                <div
                  key={item.year}
                  className={`flex flex-col md:flex-row gap-4 md:gap-8 items-start md:items-center ${i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}
                >
                  <div className={`flex-1 ${i % 2 === 0 ? 'md:text-right' : 'md:text-left'}`}>
                    <div className="p-5 rounded-xl border border-border bg-card hover:border-primary/40 transition-colors duration-300 inline-block w-full md:max-w-xs">
                      <div className="text-primary font-bold text-lg font-display">{item.year}</div>
                      <div className="font-semibold text-foreground mt-1">{item.title}</div>
                      <div className="text-sm text-muted-foreground mt-1 text-pretty">{item.desc}</div>
                    </div>
                  </div>
                  {/* Dot */}
                  <div className="hidden md:flex w-4 h-4 rounded-full bg-primary border-4 border-background shrink-0 relative z-10 animate-pulse-glow" />
                  <div className="flex-1" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

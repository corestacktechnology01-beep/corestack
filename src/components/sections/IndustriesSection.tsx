import { Heart, BookOpen, TrendingUp, ShoppingBag, Cog, Truck, Building, Lightbulb, Globe } from 'lucide-react';

const INDUSTRIES = [
  { icon: Heart, name: 'Healthcare', desc: 'Patient management, telemedicine, diagnostic AI, and hospital ERP systems.', color: 'text-red-400', bg: 'bg-red-500/10' },
  { icon: BookOpen, name: 'Education', desc: 'LMS platforms, e-learning tools, student information systems, and adaptive assessments.', color: 'text-blue-400', bg: 'bg-blue-500/10' },
  { icon: TrendingUp, name: 'Finance & Fintech', desc: 'Banking platforms, payment gateways, robo-advisory, and regulatory compliance tools.', color: 'text-green-400', bg: 'bg-green-500/10' },
  { icon: ShoppingBag, name: 'Retail & E-commerce', desc: 'Omnichannel commerce, inventory management, POS systems, and customer analytics.', color: 'text-orange-400', bg: 'bg-orange-500/10' },
  { icon: Cog, name: 'Manufacturing', desc: 'Industry 4.0 automation, IoT integration, predictive maintenance, and supply chain optimization.', color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
  { icon: Truck, name: 'Logistics & Supply Chain', desc: 'Real-time tracking, route optimization, warehouse management, and last-mile delivery solutions.', color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
  { icon: Building, name: 'Real Estate', desc: 'Property marketplaces, virtual tours, CRM for agents, and smart building management.', color: 'text-purple-400', bg: 'bg-purple-500/10' },
  { icon: Lightbulb, name: 'Startups', desc: 'MVP development, rapid prototyping, product-market fit validation, and growth engineering.', color: 'text-pink-400', bg: 'bg-pink-500/10' },
  { icon: Globe, name: 'Enterprises', desc: 'Digital transformation, legacy modernization, enterprise integrations, and workforce tools.', color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
];

export default function IndustriesSection() {
  return (
    <section id="industries" className="section-padding bg-muted/30">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="text-primary font-semibold text-sm uppercase tracking-widest">Industries</span>
          <h2 className="text-3xl md:text-5xl font-display font-bold text-foreground mt-3 mb-5 text-balance">
            Industries We{' '}
            <span className="gradient-text">Transform</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto text-pretty">
            Deep domain expertise across 9 verticals means we understand your industry's
            unique challenges before writing a single line of code.
          </p>
        </div>

        {/* Industry cards grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {INDUSTRIES.map(industry => (
            <div
              key={industry.name}
              className="group p-6 rounded-2xl border border-border bg-card hover:border-primary/40 hover:-translate-y-1 transition-all duration-300 cursor-default"
            >
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-xl ${industry.bg} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                  <industry.icon className={`w-6 h-6 ${industry.color}`} />
                </div>
                <div className="min-w-0">
                  <h3 className="font-display font-semibold text-foreground mb-1">{industry.name}</h3>
                  <p className="text-sm text-muted-foreground text-pretty">{industry.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

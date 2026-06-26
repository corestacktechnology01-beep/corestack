import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { SERVICES_DATA } from '@/pages/ServicesPage';

export default function ServicesSection() {
  const navigate = useNavigate();
  return (
    <section id="services" className="section-padding bg-muted/30">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="text-center mb-16">
          <span className="text-primary font-semibold text-sm uppercase tracking-widest">What We Do</span>
          <h2 className="text-3xl md:text-5xl font-display font-bold text-foreground mt-3 mb-5 text-balance">
            End-to-End Technology{' '}
            <span className="gradient-text">Services</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto text-pretty">
            From ideation to deployment and beyond — we offer the full spectrum of modern technology
            services to fuel your digital transformation journey.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {SERVICES_DATA.map((service, i) => {
            const Icon = service.icon;
            return (
              <button
                key={service.slug}
                onClick={() => navigate(`/services/${service.slug}`)}
                className="group relative p-6 rounded-2xl border border-border bg-card hover:border-primary/40 hover:-translate-y-1 hover:shadow-hover transition-all duration-300 cursor-pointer flex flex-col h-full text-left w-full"
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                <div className={`w-11 h-11 rounded-xl ${service.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className={`w-5 h-5 ${service.color}`} />
                </div>
                <h3 className="font-display font-semibold text-foreground mb-2 text-balance">{service.title}</h3>
                <p className="text-sm text-muted-foreground text-pretty flex-1">{service.tagline}</p>
                <div className="flex items-center gap-1 text-primary text-sm font-medium mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  Learn more <ArrowRight className="w-3 h-3" />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}

import { useState, useEffect } from 'react';
import { supabase } from '@/db/supabase';
import type { PricingPlan } from '@/types/types';
import { Check, Zap, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const FALLBACK_PLANS: PricingPlan[] = [
  { id: '1', name: 'Startup', tagline: 'Perfect for early-stage companies', price_monthly: 2999, price_yearly: 29990, features: ['Up to 5 Users', '1 Custom Web Application', 'Basic Cloud Hosting', 'Email Support (48h SLA)', '3 Months Free Maintenance', 'Basic Analytics Dashboard', 'REST API Access', 'Monthly Progress Reports'], is_popular: false, is_active: true, cta_label: 'Get Started', sort_order: 1, created_at: '' },
  { id: '2', name: 'Business', tagline: 'Designed for growing businesses', price_monthly: 7999, price_yearly: 79990, features: ['Up to 25 Users', '3 Custom Applications', 'Managed Cloud Infrastructure', 'Priority Support (8h SLA)', '6 Months Free Maintenance', 'Advanced Analytics & Reports', 'AI Integration (1 Model)', 'Dedicated Project Manager', 'Mobile App Development', 'CRM/ERP Module', 'CI/CD Pipeline Setup'], is_popular: true, is_active: true, cta_label: 'Most Popular', sort_order: 2, created_at: '' },
  { id: '3', name: 'Enterprise', tagline: 'For large-scale organizations', price_monthly: 0, price_yearly: 0, features: ['Unlimited Users', 'Unlimited Applications', 'Enterprise Cloud Architecture', '24/7 Dedicated Support', '12 Months Free Maintenance', 'Custom Analytics & BI', 'Unlimited AI Integrations', 'Dedicated Team of 10+', 'Full Digital Transformation', 'Custom Integrations', 'SLA Guarantee 99.9%', 'Compliance & Security Audit', 'On-site Consultation'], is_popular: false, is_active: true, cta_label: 'Contact Us', sort_order: 3, created_at: '' },
];

export default function PricingSection() {
  const [plans, setPlans] = useState<PricingPlan[]>(FALLBACK_PLANS);
  const [billing, setBilling] = useState<'monthly' | 'yearly'>('monthly');

  useEffect(() => {
    supabase.from('pricing_plans').select('*').eq('is_active', true).order('sort_order')
      .then(({ data }) => { if (data && data.length > 0) setPlans(data); });
  }, []);

  const scrollToContact = () => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });

  return (
    <section id="pricing" className="section-padding bg-muted/30">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="text-primary font-semibold text-sm uppercase tracking-widest">Pricing</span>
          <h2 className="text-3xl md:text-5xl font-display font-bold text-foreground mt-3 mb-5 text-balance">
            Transparent{' '}
            <span className="gradient-text">Pricing Plans</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto text-pretty">
            No hidden fees, no surprises. Choose the plan that fits your stage and scale with us as you grow.
          </p>

          {/* Billing toggle */}
          <div className="inline-flex items-center gap-2 mt-6 p-1 rounded-full border border-border bg-card">
            <button
              onClick={() => setBilling('monthly')}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${billing === 'monthly' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBilling('yearly')}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-1.5 ${billing === 'yearly' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            >
              Yearly
              <Badge variant="secondary" className="text-xs px-1.5 py-0 text-green-400 bg-green-500/10 border-green-500/20">
                Save 17%
              </Badge>
            </button>
          </div>
        </div>

        {/* Plans grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {plans.map(plan => {
            const price = billing === 'monthly' ? plan.price_monthly : (plan.price_yearly ? plan.price_yearly / 12 : 0);
            const isEnterprise = plan.price_monthly === 0;
            return (
              <div
                key={plan.id}
                className={`relative rounded-2xl border flex flex-col h-full ${
                  plan.is_popular
                    ? 'border-primary bg-card shadow-hover scale-[1.02]'
                    : 'border-border bg-card'
                }`}
              >
                {plan.is_popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <div className="flex items-center gap-1 px-4 py-1 rounded-full bg-primary text-primary-foreground text-xs font-bold">
                      <Zap className="w-3 h-3" /> Most Popular
                    </div>
                  </div>
                )}

                <div className="p-7 flex flex-col flex-1">
                  <div className="mb-6">
                    <h3 className="text-xl font-display font-bold text-foreground">{plan.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{plan.tagline}</p>
                  </div>

                  {/* Price */}
                  <div className="mb-6 pb-6 border-b border-border">
                    {isEnterprise ? (
                      <div>
                        <span className="text-3xl font-display font-bold gradient-text">Custom</span>
                        <p className="text-sm text-muted-foreground mt-1">Tailored to your requirements</p>
                      </div>
                    ) : (
                      <div>
                        <div className="flex items-end gap-1">
                          <span className="text-muted-foreground text-lg">$</span>
                          <span className="text-4xl font-display font-bold gradient-text">{price.toLocaleString()}</span>
                          <span className="text-muted-foreground text-sm mb-1">/mo</span>
                        </div>
                        {billing === 'yearly' && plan.price_yearly && (
                          <p className="text-xs text-muted-foreground mt-1">Billed as ${plan.price_yearly.toLocaleString()}/year</p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Features */}
                  <ul className="space-y-3 flex-1 mb-7">
                    {plan.features.map(f => (
                      <li key={f} className="flex items-start gap-2.5 text-sm">
                        <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                        <span className="text-foreground">{f}</span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  <button
                    onClick={scrollToContact}
                    className={`mt-auto flex items-center justify-center gap-2 w-full h-11 rounded-xl font-semibold text-sm transition-all ${
                      plan.is_popular
                        ? 'bg-primary text-primary-foreground hover:bg-primary/90 animate-pulse-glow'
                        : 'border border-border text-foreground hover:border-primary/40 hover:bg-primary/5'
                    }`}
                  >
                    {plan.cta_label || 'Get Started'}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <p className="text-center text-sm text-muted-foreground mt-10">
          All plans include free onboarding, architecture review, and project kick-off workshop.
          <button onClick={scrollToContact} className="text-primary hover:underline ml-1">Contact us for custom quotes.</button>
        </p>
      </div>
    </section>
  );
}

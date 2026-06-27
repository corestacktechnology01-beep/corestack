import { useState } from 'react';
import { ArrowRight, Check, X, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/db/supabase';
import { toast } from 'sonner';

const PRODUCTS = [
  {
    name: 'StackFlow ERP',
    tagline: 'Enterprise Resource Planning Reimagined',
    description: 'A modern, AI-powered ERP system that unifies finance, HR, operations, and supply chain in a single intelligent platform built for the cloud era.',
    badge: 'Most Popular',
    badgeColor: 'bg-primary/20 text-primary border-primary/30',
    features: ['Real-time Analytics & BI', 'AI-Powered Forecasting', 'Multi-Company Support', 'Mobile-First Design', 'Open API & Integrations', '99.9% Uptime SLA'],
    price: 'From ₹24,700/mo',
    color: 'from-orange-500/10 to-amber-500/5',
    accent: 'border-primary/30',
    fields: ['company_size', 'use_case', 'current_tools', 'budget', 'timeline'],
  },
  {
    name: 'CoreCRM Pro',
    tagline: 'Customer Relationships at Scale',
    description: 'An intelligent CRM platform with built-in AI lead scoring, automated workflows, and deep analytics that helps sales teams close 3x more deals.',
    badge: 'New Release',
    badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    features: ['AI Lead Scoring', 'Sales Pipeline Automation', 'Email & WhatsApp Integration', 'Custom Reports & Dashboards', 'Team Collaboration Tools', 'Unlimited Contacts'],
    price: 'From ₹12,300/mo',
    color: 'from-purple-500/10 to-indigo-500/5',
    accent: 'border-purple-500/20',
    fields: ['company_size', 'use_case', 'current_tools', 'budget', 'timeline'],
  },
  {
    name: 'DeployIQ Platform',
    tagline: 'DevOps Intelligence for Modern Teams',
    description: 'A unified DevOps platform that automates CI/CD pipelines, infrastructure provisioning, and monitoring with built-in AI anomaly detection.',
    badge: 'Enterprise',
    badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    features: ['One-click Cloud Deployment', 'AI Anomaly Detection', 'Multi-Cloud Support', 'Security Scanning', 'Cost Optimization Engine', 'Team Access Controls'],
    price: 'From ₹41,300/mo',
    color: 'from-blue-500/10 to-cyan-500/5',
    accent: 'border-blue-500/20',
    fields: ['company_size', 'use_case', 'current_tools', 'budget', 'timeline'],
  },
];

type Product = typeof PRODUCTS[0];

interface InquiryForm {
  full_name: string;
  email: string;
  phone: string;
  company_name: string;
  company_size: string;
  use_case: string;
  current_tools: string;
  budget: string;
  timeline: string;
  message: string;
}

const EMPTY_FORM: InquiryForm = {
  full_name: '', email: '', phone: '', company_name: '',
  company_size: '', use_case: '', current_tools: '',
  budget: '', timeline: '', message: '',
};

function GetStartedModal({ product, onClose }: { product: Product; onClose: () => void }) {
  const [form, setForm] = useState<InquiryForm>(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const set = (k: keyof InquiryForm, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.full_name || !form.email) { toast.error('Name and email are required'); return; }
    setLoading(true);
    try {
      const { error } = await supabase.from('product_inquiries').insert({
        product_name: product.name,
        full_name: form.full_name,
        email: form.email,
        phone: form.phone || null,
        company_name: form.company_name || null,
        company_size: form.company_size || null,
        use_case: form.use_case || null,
        current_tools: form.current_tools || null,
        budget: form.budget || null,
        timeline: form.timeline || null,
        message: form.message || null,
      });
      if (error) throw error;
      setDone(true);
    } catch {
      toast.error('Submission failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full max-w-lg max-h-[90dvh] overflow-y-auto bg-card border border-border rounded-2xl shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-card border-b border-border px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
          <div>
            <h2 className="font-display font-bold text-foreground text-lg">Get Started — {product.name}</h2>
            <p className="text-xs text-muted-foreground mt-0.5">{product.tagline}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-6 py-6">
          {done ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-green-400" />
              </div>
              <h3 className="text-lg font-display font-bold text-foreground mb-2">Enquiry Submitted!</h3>
              <p className="text-sm text-muted-foreground text-pretty mb-6">
                Thank you! Our team will review your enquiry for <strong className="text-foreground">{product.name}</strong> and get back to you within 24 hours.
              </p>
              <Button onClick={onClose} className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">
                Close
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name + Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-sm font-normal text-muted-foreground">Full Name <span className="text-destructive">*</span></Label>
                  <Input placeholder="Your name" value={form.full_name} onChange={e => set('full_name', e.target.value)} className="h-10 bg-muted/30" required disabled={loading} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm font-normal text-muted-foreground">Email Address <span className="text-destructive">*</span></Label>
                  <Input type="email" placeholder="you@company.com" value={form.email} onChange={e => set('email', e.target.value)} className="h-10 bg-muted/30" required disabled={loading} />
                </div>
              </div>

              {/* Phone + Company */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-sm font-normal text-muted-foreground">Phone Number</Label>
                  <Input placeholder="+91 98765 43210" value={form.phone} onChange={e => set('phone', e.target.value)} className="h-10 bg-muted/30" disabled={loading} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm font-normal text-muted-foreground">Company Name</Label>
                  <Input placeholder="Your company" value={form.company_name} onChange={e => set('company_name', e.target.value)} className="h-10 bg-muted/30" disabled={loading} />
                </div>
              </div>

              {/* Company Size */}
              <div className="space-y-1.5">
                <Label className="text-sm font-normal text-muted-foreground">Company Size</Label>
                <Select value={form.company_size} onValueChange={v => set('company_size', v)} disabled={loading}>
                  <SelectTrigger className="h-10 bg-muted/30"><SelectValue placeholder="Select team size" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1-10">1–10 employees</SelectItem>
                    <SelectItem value="11-50">11–50 employees</SelectItem>
                    <SelectItem value="51-200">51–200 employees</SelectItem>
                    <SelectItem value="201-500">201–500 employees</SelectItem>
                    <SelectItem value="500+">500+ employees</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Use Case */}
              <div className="space-y-1.5">
                <Label className="text-sm font-normal text-muted-foreground">Primary Use Case for {product.name}</Label>
                <Input placeholder="e.g. Replace legacy ERP, automate HR workflows…" value={form.use_case} onChange={e => set('use_case', e.target.value)} className="h-10 bg-muted/30" disabled={loading} />
              </div>

              {/* Current Tools */}
              <div className="space-y-1.5">
                <Label className="text-sm font-normal text-muted-foreground">Current Tools / Software in Use</Label>
                <Input placeholder="e.g. SAP, Salesforce, Excel…" value={form.current_tools} onChange={e => set('current_tools', e.target.value)} className="h-10 bg-muted/30" disabled={loading} />
              </div>

              {/* Budget + Timeline */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-sm font-normal text-muted-foreground">Budget Range</Label>
                  <Select value={form.budget} onValueChange={v => set('budget', v)} disabled={loading}>
                    <SelectTrigger className="h-10 bg-muted/30"><SelectValue placeholder="Select budget" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="under-500">Under ₹41,500/mo</SelectItem>
                      <SelectItem value="500-1000">₹41,500–₹83,000/mo</SelectItem>
                      <SelectItem value="1000-5000">₹83,000–₹4,15,000/mo</SelectItem>
                      <SelectItem value="5000+">₹4,15,000+/mo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm font-normal text-muted-foreground">Expected Timeline</Label>
                  <Select value={form.timeline} onValueChange={v => set('timeline', v)} disabled={loading}>
                    <SelectTrigger className="h-10 bg-muted/30"><SelectValue placeholder="When to start?" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="immediately">Immediately</SelectItem>
                      <SelectItem value="1-month">Within 1 month</SelectItem>
                      <SelectItem value="3-months">Within 3 months</SelectItem>
                      <SelectItem value="6-months">Within 6 months</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Additional Message */}
              <div className="space-y-1.5">
                <Label className="text-sm font-normal text-muted-foreground">Additional Requirements</Label>
                <Textarea
                  placeholder="Any specific requirements, integrations needed, or questions…"
                  value={form.message}
                  onChange={e => set('message', e.target.value)}
                  className="bg-muted/30 min-h-20 resize-none"
                  disabled={loading}
                />
              </div>

              <Button type="submit" disabled={loading} className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">
                {loading
                  ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Submitting…</>
                  : <><ArrowRight className="w-4 h-4 mr-2" />Submit Enquiry</>
                }
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ProductsSection() {
  const [activeProduct, setActiveProduct] = useState<Product | null>(null);

  return (
    <section id="products" className="section-padding bg-background">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="text-primary font-semibold text-sm uppercase tracking-widest">Our Products</span>
          <h2 className="text-3xl md:text-5xl font-display font-bold text-foreground mt-3 mb-5 text-balance">
            Premium Software{' '}
            <span className="gradient-text">Products</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto text-pretty">
            Beyond custom development, we offer battle-tested SaaS products that you can deploy
            today and scale to millions of users tomorrow.
          </p>
        </div>

        {/* Products */}
        <div className="grid lg:grid-cols-3 gap-6 mb-12">
          {PRODUCTS.map(product => (
            <div
              key={product.name}
              className={`relative rounded-2xl border ${product.accent} bg-gradient-to-br ${product.color} p-px overflow-hidden group`}
            >
              <div className="rounded-2xl bg-card p-7 h-full flex flex-col">
                {/* Badge */}
                <div className="flex items-start justify-between mb-4">
                  <Badge variant="outline" className={`text-xs ${product.badgeColor}`}>
                    {product.badge}
                  </Badge>
                </div>

                {/* Product info */}
                <h3 className="text-xl font-display font-bold text-foreground mb-1">{product.name}</h3>
                <p className="text-primary text-sm font-medium mb-3">{product.tagline}</p>
                <p className="text-muted-foreground text-sm mb-6 text-pretty flex-1">{product.description}</p>

                {/* Features */}
                <ul className="space-y-2 mb-6">
                  {product.features.map(f => (
                    <li key={f} className="flex items-center gap-2 text-sm text-foreground">
                      <Check className="w-4 h-4 text-primary shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>

                {/* Price + CTA */}
                <div className="mt-auto pt-5 border-t border-border">
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-display font-bold text-lg text-foreground">{product.price}</span>
                    <button
                      onClick={() => setActiveProduct(product)}
                      className="flex items-center justify-center gap-1.5 h-9 px-5 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium shrink-0"
                    >
                      Get Started <ArrowRight className="w-3.5 h-3.5 shrink-0" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom hint */}
        <div className="text-center">
          <p className="text-muted-foreground text-sm">
            Need a custom product built exclusively for your enterprise?{' '}
            <button
              onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
              className="text-primary hover:underline font-medium"
            >
              Let's talk →
            </button>
          </p>
        </div>
      </div>

      {/* Get Started Modal */}
      {activeProduct && (
        <GetStartedModal product={activeProduct} onClose={() => setActiveProduct(null)} />
      )}
    </section>
  );
}

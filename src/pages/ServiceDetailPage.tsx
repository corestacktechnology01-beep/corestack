import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Header from '@/components/layouts/Header';
import Footer from '@/components/layouts/Footer';
import BookConsultationModal from '@/components/modals/BookConsultationModal';
import ProjectEnquiryModal from '@/components/modals/ProjectEnquiryModal';
import { SERVICES_DATA } from './ServicesPage';
import {
  LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts';
import {
  ChevronRight, CheckCircle, ArrowRight, Star, ChevronDown,
  Rocket, TrendingUp, Globe, Shield, Zap, Users, Award, Clock,
  ArrowLeft,
} from 'lucide-react';
// ─── Per-service market trend data (historical + forecast) ────────────────────
interface MarketPoint {
  year: string;
  value: number;
  forecast?: boolean;
}

const SERVICE_MARKET_DATA: Record<string, {
  title: string;
  unit: string;
  cagr: string;
  size: string;
  forecast2030: string;
  points: MarketPoint[];
}> = {
  'custom-software-development': {
    title: 'Enterprise Software Market Trend',
    unit: 'USD Billions',
    cagr: '11.2% CAGR',
    size: '$270B Market',
    forecast2030: '$520B by 2030',
    points: [
      { year: '2019', value: 185 }, { year: '2020', value: 202 }, { year: '2021', value: 226 },
      { year: '2022', value: 255 }, { year: '2023', value: 288 }, { year: '2024', value: 318 },
      { year: '2025', value: 354, forecast: true }, { year: '2026', value: 394, forecast: true },
      { year: '2027', value: 438, forecast: true }, { year: '2028', value: 479, forecast: true },
      { year: '2029', value: 521, forecast: true }, { year: '2030', value: 568, forecast: true },
    ],
  },
  'web-development': {
    title: 'Web Development Global Market Trend',
    unit: 'USD Billions',
    cagr: '14.3% CAGR',
    size: '$96B Market',
    forecast2030: '$202B by 2030',
    points: [
      { year: '2019', value: 42 }, { year: '2020', value: 50 }, { year: '2021', value: 60 },
      { year: '2022', value: 72 }, { year: '2023', value: 86 }, { year: '2024', value: 96 },
      { year: '2025', value: 112, forecast: true }, { year: '2026', value: 130, forecast: true },
      { year: '2027', value: 151, forecast: true }, { year: '2028', value: 168, forecast: true },
      { year: '2029', value: 186, forecast: true }, { year: '2030', value: 202, forecast: true },
    ],
  },
  'mobile-app-development': {
    title: 'Mobile App Industry Trend',
    unit: 'USD Billions',
    cagr: '18.7% CAGR',
    size: '$228B Market',
    forecast2030: '$583B by 2030',
    points: [
      { year: '2019', value: 98 }, { year: '2020', value: 121 }, { year: '2021', value: 148 },
      { year: '2022', value: 177 }, { year: '2023', value: 211 }, { year: '2024', value: 228 },
      { year: '2025', value: 274, forecast: true }, { year: '2026', value: 330, forecast: true },
      { year: '2027', value: 394, forecast: true }, { year: '2028', value: 460, forecast: true },
      { year: '2029', value: 522, forecast: true }, { year: '2030', value: 583, forecast: true },
    ],
  },
  'saas-development': {
    title: 'SaaS Market Growth Trend',
    unit: 'USD Billions',
    cagr: '27.5% CAGR',
    size: '$243B Market',
    forecast2030: '$908B by 2030',
    points: [
      { year: '2019', value: 102 }, { year: '2020', value: 130 }, { year: '2021', value: 162 },
      { year: '2022', value: 195 }, { year: '2023', value: 231 }, { year: '2024', value: 243 },
      { year: '2025', value: 312, forecast: true }, { year: '2026', value: 400, forecast: true },
      { year: '2027', value: 511, forecast: true }, { year: '2028', value: 632, forecast: true },
      { year: '2029', value: 764, forecast: true }, { year: '2030', value: 908, forecast: true },
    ],
  },
  'cloud-solutions': {
    title: 'Cloud Computing Market Trend',
    unit: 'USD Billions',
    cagr: '22.4% CAGR',
    size: '$591B Market',
    forecast2030: '$1,616B by 2030',
    points: [
      { year: '2019', value: 234 }, { year: '2020', value: 312 }, { year: '2021', value: 396 },
      { year: '2022', value: 484 }, { year: '2023', value: 562 }, { year: '2024', value: 591 },
      { year: '2025', value: 726, forecast: true }, { year: '2026', value: 889, forecast: true },
      { year: '2027', value: 1090, forecast: true }, { year: '2028', value: 1285, forecast: true },
      { year: '2029', value: 1460, forecast: true }, { year: '2030', value: 1616, forecast: true },
    ],
  },
  'ui-ux-design': {
    title: 'UI/UX Industry Growth Trend',
    unit: 'USD Billions',
    cagr: '15.6% CAGR',
    size: '$36B Market',
    forecast2030: '$88B by 2030',
    points: [
      { year: '2019', value: 16 }, { year: '2020', value: 19 }, { year: '2021', value: 23 },
      { year: '2022', value: 28 }, { year: '2023', value: 33 }, { year: '2024', value: 36 },
      { year: '2025', value: 43, forecast: true }, { year: '2026', value: 51, forecast: true },
      { year: '2027', value: 60, forecast: true }, { year: '2028', value: 70, forecast: true },
      { year: '2029', value: 80, forecast: true }, { year: '2030', value: 88, forecast: true },
    ],
  },
  'erp-crm-development': {
    title: 'ERP Software Market Trend',
    unit: 'USD Billions',
    cagr: '11.8% CAGR',
    size: '$62B Market',
    forecast2030: '$120B by 2030',
    points: [
      { year: '2019', value: 36 }, { year: '2020', value: 40 }, { year: '2021', value: 45 },
      { year: '2022', value: 51 }, { year: '2023', value: 57 }, { year: '2024', value: 62 },
      { year: '2025', value: 70, forecast: true }, { year: '2026', value: 79, forecast: true },
      { year: '2027', value: 88, forecast: true }, { year: '2028', value: 98, forecast: true },
      { year: '2029', value: 109, forecast: true }, { year: '2030', value: 120, forecast: true },
    ],
  },
  'it-consulting': {
    title: 'IT Consulting Market Trend',
    unit: 'USD Billions',
    cagr: '9.8% CAGR',
    size: '$82B Market',
    forecast2030: '$145B by 2030',
    points: [
      { year: '2019', value: 51 }, { year: '2020', value: 54 }, { year: '2021', value: 59 },
      { year: '2022', value: 65 }, { year: '2023', value: 74 }, { year: '2024', value: 82 },
      { year: '2025', value: 91, forecast: true }, { year: '2026', value: 100, forecast: true },
      { year: '2027', value: 111, forecast: true }, { year: '2028', value: 122, forecast: true },
      { year: '2029', value: 133, forecast: true }, { year: '2030', value: 145, forecast: true },
    ],
  },
};

// Default fallback market data
function getMarketData(slug: string) {
  return SERVICE_MARKET_DATA[slug] ?? {
    title: 'Global IT Services Market Trend',
    unit: 'USD Billions',
    cagr: '10.5% CAGR',
    size: '$180B Market',
    forecast2030: '$300B by 2030',
    points: [
      { year: '2019', value: 95 }, { year: '2020', value: 106 }, { year: '2021', value: 120 },
      { year: '2022', value: 138 }, { year: '2023', value: 158 }, { year: '2024', value: 180 },
      { year: '2025', value: 200, forecast: true }, { year: '2026', value: 222, forecast: true },
      { year: '2027', value: 246, forecast: true }, { year: '2028', value: 265, forecast: true },
      { year: '2029', value: 283, forecast: true }, { year: '2030', value: 300, forecast: true },
    ],
  };
}

// ─── Static content per service ────────────────────────────────────────────────
const SERVICE_DETAIL_MAP: Record<string, {
  description: string; benefits: { icon: string; title: string; desc: string }[];
  features: string[]; process: { step: number; title: string; desc: string }[];
  techStack: string[]; industries: string[]; faqs: { q: string; a: string }[];
  reviews: { name: string; company: string; rating: number; text: string }[];
  caseStudies: { title: string; result: string; metric: string }[];
}> = {
  'custom-software-development': {
    description: 'Custom software development is the process of designing, creating, and deploying software specifically for a set of users, functions, or organizations. Unlike commercial off-the-shelf software, custom software is built to fit the exact needs of your business — your data model, your integrations, your user base, and your growth roadmap. CoreStack delivers battle-tested custom software across industries including fintech, healthcare, logistics, and enterprise operations.',
    benefits: [
      { icon: 'shield', title: 'Built Exactly for You', desc: 'No feature bloat or workarounds — every function aligns with your real workflows.' },
      { icon: 'trending', title: 'Scales With Growth', desc: 'Architecture designed for 10x growth from day one, with zero technical debt surprises.' },
      { icon: 'zap', title: 'Competitive Advantage', desc: 'Own your IP. Your software becomes a proprietary moat competitors can\'t replicate.' },
      { icon: 'globe', title: 'Full Integration', desc: 'Connect every tool in your stack — CRMs, ERPs, payment gateways, data warehouses.' },
    ],
    features: ['Custom Business Logic', 'API-First Architecture', 'Role-Based Access Control', 'Real-time Dashboards', 'Multi-tenant Support', 'Audit Logs & Compliance', 'Auto-scaling Infrastructure', 'White-label Options', 'Mobile Responsive', 'Advanced Reporting'],
    process: [
      { step: 1, title: 'Discovery & Scoping', desc: 'Deep-dive workshops to map requirements, user journeys, and success criteria.' },
      { step: 2, title: 'System Architecture', desc: 'Design scalable tech stack, database schema, and API contracts.' },
      { step: 3, title: 'Agile Development', desc: '2-week sprints with demos, retrospectives, and continuous delivery.' },
      { step: 4, title: 'QA & Security Testing', desc: 'Automated test suites, penetration testing, and performance benchmarking.' },
      { step: 5, title: 'Deployment & Launch', desc: 'Zero-downtime deployment to production with monitoring and alerting configured.' },
      { step: 6, title: 'Ongoing Support', desc: '24/7 SLA-backed maintenance, feature enhancements, and proactive monitoring.' },
    ],
    techStack: ['React', 'Node.js', 'PostgreSQL', 'Redis', 'Docker', 'Kubernetes', 'AWS', 'TypeScript', 'GraphQL', 'Terraform'],
    industries: ['Financial Services', 'Healthcare', 'Logistics', 'Manufacturing', 'Retail', 'Education', 'Real Estate', 'Government'],
    faqs: [
      { q: 'How long does it take to build custom software?', a: 'Timeline varies by complexity. MVPs typically take 8–16 weeks; enterprise platforms 6–18 months. We scope precisely in the discovery phase.' },
      { q: 'Who owns the source code after delivery?', a: 'You own 100% of all intellectual property. We transfer full source code, documentation, and deployment pipelines at project close.' },
      { q: 'Do you sign NDAs?', a: 'Absolutely. We sign NDAs before discovery calls as standard practice.' },
      { q: 'Can you integrate with our existing systems?', a: 'Yes — we specialize in complex integrations. We\'ve connected to 200+ third-party systems including SAP, Salesforce, Oracle, and custom legacy platforms.' },
    ],
    reviews: [
      { name: 'James Mitchell', company: 'FinCore Capital', rating: 5, text: 'CoreStack delivered our trading platform 3 weeks ahead of schedule. The quality exceeded our expectations — we\'ve processed $2B in transactions without a single downtime incident.' },
      { name: 'Priya Sharma', company: 'MedLogix', rating: 5, text: 'Their team understood our compliance requirements deeply. The custom HIPAA-compliant system has transformed our operations — we cut manual work by 70%.' },
      { name: 'Carlos Vega', company: 'SupplyChain.io', rating: 5, text: 'Best engineering team I\'ve worked with. Clear communication, clean code, and they genuinely care about outcomes, not just deliverables.' },
    ],
    caseStudies: [
      { title: 'Trading Platform for FinCore Capital', result: '$2B transactions processed, 0 downtime incidents in 18 months', metric: '70% faster trade execution' },
      { title: 'Healthcare Portal — MedLogix', result: '50,000 patients onboarded in first quarter after launch', metric: '70% reduction in manual admin work' },
      { title: 'Supply Chain Platform — SupplyChain.io', result: 'Integrated 12 warehouse systems across 3 continents', metric: '40% cost reduction in operations' },
    ],
  },
  'web-development': {
    description: 'Modern web development goes far beyond static pages. CoreStack builds high-performance web applications — from marketing sites to complex SaaS dashboards — using battle-tested frameworks like React, Next.js, and Vue. Every project is delivered with Core Web Vitals scores in the green, mobile-first responsiveness, and SEO architecture baked in from day one.',
    benefits: [
      { icon: 'zap', title: 'Blazing Performance', desc: 'Sub-second load times, optimized bundles, CDN delivery, and server-side rendering where it matters.' },
      { icon: 'globe', title: 'SEO-Ready Architecture', desc: 'Semantic HTML, structured data, sitemap generation, and Core Web Vitals optimization from the start.' },
      { icon: 'shield', title: 'Secure by Default', desc: 'HTTPS, CSP headers, input sanitization, and OWASP best practices on every project.' },
      { icon: 'trending', title: 'Conversion Optimized', desc: 'UX patterns, A/B testing infrastructure, and analytics integration that drive measurable results.' },
    ],
    features: ['React / Next.js / Vue', 'Server-Side Rendering', 'Progressive Web Apps', 'RESTful & GraphQL APIs', 'Real-time WebSockets', 'CMS Integration', 'E-Commerce Ready', 'Multi-language (i18n)', 'Dark Mode', 'Accessibility (WCAG 2.1 AA)'],
    process: [
      { step: 1, title: 'UX Discovery', desc: 'User research, sitemap architecture, and information design.' },
      { step: 2, title: 'Design & Prototype', desc: 'High-fidelity Figma prototypes with full design system documentation.' },
      { step: 3, title: 'Frontend Development', desc: 'Component-driven development with Storybook and automated testing.' },
      { step: 4, title: 'Backend & APIs', desc: 'RESTful or GraphQL APIs with authentication, authorization, and caching.' },
      { step: 5, title: 'Performance Optimization', desc: 'Lighthouse audits, bundle analysis, lazy loading, and image optimization.' },
      { step: 6, title: 'Launch & SEO', desc: 'Deployment to CDN, sitemap submission, analytics integration, and monitoring setup.' },
    ],
    techStack: ['React', 'Next.js', 'Vue.js', 'TypeScript', 'Tailwind CSS', 'Node.js', 'PostgreSQL', 'Vercel', 'Cloudflare', 'Stripe'],
    industries: ['E-Commerce', 'SaaS', 'Media & Publishing', 'Education', 'Healthcare', 'Finance', 'Real Estate', 'Startups'],
    faqs: [
      { q: 'Do you build with headless CMS?', a: 'Yes — we support Contentful, Sanity, Strapi, and custom CMS solutions depending on your editorial workflow.' },
      { q: 'What performance scores can I expect?', a: 'We target 90+ Lighthouse scores across all Core Web Vitals. Most projects achieve sub-1.5s LCP on 4G mobile.' },
      { q: 'Do you handle hosting and DevOps?', a: 'Yes — we can set up and manage the full hosting stack including Vercel, AWS, GCP, or on-premise infrastructure.' },
      { q: 'Can you redesign my existing website?', a: 'Absolutely. We specialize in modernizing legacy sites with zero data loss and SEO preservation throughout the migration.' },
    ],
    reviews: [
      { name: 'Sarah Chen', company: 'Luminary SaaS', rating: 5, text: 'Our new dashboard loads in under 800ms and our NPS jumped 22 points after launch. CoreStack\'s attention to UX details is unmatched.' },
      { name: 'Marcus Weber', company: 'Atlas Retail', rating: 5, text: 'They rebuilt our e-commerce site in 10 weeks. Conversion rate increased 34% and our Google Core Web Vitals went from red to all green.' },
      { name: 'Aisha Okonkwo', company: 'EduPath', rating: 5, text: 'Complex multi-tenant education platform delivered with perfect accessibility scores. Outstanding work.' },
    ],
    caseStudies: [
      { title: 'SaaS Dashboard — Luminary', result: '800ms load time, 22-point NPS increase', metric: '34% conversion uplift' },
      { title: 'E-Commerce Platform — Atlas Retail', result: '10-week full rebuild, 0 data migration issues', metric: '34% conversion rate increase' },
      { title: 'EdTech Platform — EduPath', result: 'WCAG 2.1 AA compliant, 50k+ active students', metric: '68% reduction in support tickets' },
    ],
  },
};

function getServiceContent(slug: string) {
  if (SERVICE_DETAIL_MAP[slug]) return SERVICE_DETAIL_MAP[slug];
  const service = SERVICES_DATA.find(s => s.slug === slug);
  return {
    description: `${service?.title ?? 'This service'} is one of CoreStack's flagship offerings. Our team of certified engineers and domain experts delivers production-ready solutions backed by 10+ years of enterprise experience, rigorous QA processes, and post-launch SLA guarantees.`,
    benefits: [
      { icon: 'shield', title: 'Enterprise-Grade Quality', desc: 'ISO-aligned processes, rigorous QA, and 99.9% uptime SLA commitments.' },
      { icon: 'trending', title: 'Proven Delivery', desc: 'Agile methodology with weekly demos and transparent reporting.' },
      { icon: 'zap', title: 'Rapid Time-to-Market', desc: 'Battle-tested processes that cut development time by up to 40%.' },
      { icon: 'globe', title: 'Global Standards', desc: 'Solutions built to scale across regions, languages, and regulatory environments.' },
    ],
    features: ['Requirement Analysis', 'Architecture Design', 'Agile Development', 'QA & Security Testing', 'CI/CD Deployment', 'Monitoring & Alerting', 'Documentation', 'Training & Handover', '24/7 Support', 'SLA Guarantees'],
    process: [
      { step: 1, title: 'Discovery', desc: 'Deep-dive into your requirements, goals, and constraints.' },
      { step: 2, title: 'Planning', desc: 'Architecture, roadmap, and sprint planning with stakeholder sign-off.' },
      { step: 3, title: 'Development', desc: '2-week agile sprints with continuous integration and delivery.' },
      { step: 4, title: 'Testing', desc: 'Automated testing, QA, security scanning, and performance benchmarking.' },
      { step: 5, title: 'Deployment', desc: 'Zero-downtime production deployment with rollback capabilities.' },
      { step: 6, title: 'Support', desc: 'Ongoing maintenance, monitoring, and feature enhancements.' },
    ],
    techStack: ['React', 'Node.js', 'PostgreSQL', 'Docker', 'Kubernetes', 'AWS', 'TypeScript', 'Redis', 'Terraform', 'GitHub Actions'],
    industries: ['Financial Services', 'Healthcare', 'Retail', 'Manufacturing', 'Logistics', 'Education', 'Real Estate', 'Startups'],
    faqs: [
      { q: 'How do you ensure project quality?', a: 'We follow ISO-aligned development practices with automated testing suites, code reviews, and dedicated QA engineers on every project.' },
      { q: 'What is your engagement model?', a: 'We offer fixed-price projects, time-and-materials, and dedicated team models depending on your needs and project clarity.' },
      { q: 'Do you provide post-launch support?', a: 'Yes — all projects include a 3-month warranty period, and we offer extended SLA-backed support contracts.' },
      { q: 'How transparent is the development process?', a: 'Very. You get weekly sprint demos, a live project dashboard, daily standups if needed, and full access to your repository at all times.' },
    ],
    reviews: [
      { name: 'Alexander Kim', company: 'TechVentures Ltd', rating: 5, text: 'CoreStack consistently delivers above expectations. Their engineering quality and communication are both world-class.' },
      { name: 'Sofia Rodriguez', company: 'InnovateCo', rating: 5, text: 'We\'ve partnered with CoreStack on 3 projects now. Every single one delivered on time and within budget. Exceptional team.' },
      { name: 'Marcus Thompson', company: 'Enterprise Corp', rating: 5, text: 'The technical depth and domain expertise CoreStack brought to our project was impressive. Highly recommended.' },
    ],
    caseStudies: [
      { title: 'Enterprise Platform Modernization', result: 'Legacy system migrated with zero data loss, 60% performance improvement', metric: '40% operational cost reduction' },
      { title: 'Customer Portal Launch', result: '10,000 users onboarded in first month, 99.99% uptime', metric: '55% reduction in support tickets' },
      { title: 'Digital Transformation Initiative', result: '12 business units integrated into unified platform', metric: '35% faster decision-making' },
    ],
  };
}

// ─── Custom Tooltip ────────────────────────────────────────────────────────────
function CustomTooltip({ active, payload, label, unit }: { active?: boolean; payload?: { value: number; payload: MarketPoint }[]; label?: string; unit: string }) {
  if (!active || !payload?.length) return null;
  const point = payload[0].payload;
  return (
    <div className="px-4 py-3 rounded-xl border border-border bg-card/95 backdrop-blur-md shadow-2xl">
      <div className="text-xs text-muted-foreground mb-1">{label}</div>
      <div className="text-lg font-bold text-primary">{payload[0].value}B</div>
      <div className="text-xs text-muted-foreground">{unit}</div>
      {point.forecast && <div className="text-xs text-amber-400 mt-1 font-medium">📈 Forecast</div>}
    </div>
  );
}

// ─── Animated Market Line Chart ────────────────────────────────────────────────
function MarketLineChart({ slug }: { slug: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const marketData = getMarketData(slug);
  const forecastStartYear = '2025';

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.15 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`relative rounded-2xl border border-border bg-card/60 backdrop-blur-sm overflow-hidden transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
    >
      {/* Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[200px] bg-primary/5 rounded-full blur-[60px] pointer-events-none" />

      <div className="relative p-6 md:p-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 mb-3">
              <TrendingUp className="w-3.5 h-3.5 text-primary" />
              <span className="text-primary text-xs font-semibold uppercase tracking-widest">Market Analytics</span>
            </div>
            <h3 className="text-xl md:text-2xl font-display font-bold text-foreground text-balance">{marketData.title}</h3>
            <p className="text-sm text-muted-foreground mt-1">Historical data + 5-year forecast · {marketData.unit}</p>
          </div>
          <div className="flex flex-wrap gap-3 shrink-0">
            {[
              { label: 'Market Size', value: marketData.size, color: 'text-orange-400' },
              { label: 'CAGR', value: marketData.cagr, color: 'text-blue-400' },
              { label: '2030 Forecast', value: marketData.forecast2030, color: 'text-green-400' },
            ].map(stat => (
              <div key={stat.label} className="text-center px-4 py-3 rounded-xl bg-muted/30 border border-border">
                <div className={`text-base font-bold font-display ${stat.color}`}>{stat.value}</div>
                <div className="text-xs text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-5 mb-5">
          <div className="flex items-center gap-2">
            <div className="w-4 h-0.5 bg-primary rounded-full" />
            <span className="text-xs text-muted-foreground">Historical</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-0.5 bg-amber-400 rounded-full border-dashed" style={{ borderTop: '2px dashed #F59E0B' }} />
            <span className="text-xs text-muted-foreground">Forecast (2025–2030)</span>
          </div>
        </div>

        {/* Chart */}
        <div className="w-full min-w-0 overflow-hidden" style={{ height: 280 }}>
          {visible ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={marketData.points} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#FF6B00" />
                    <stop offset="58%" stopColor="#FF6B00" />
                    <stop offset="58.01%" stopColor="#F59E0B" />
                    <stop offset="100%" stopColor="#F59E0B" />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis
                  dataKey="year"
                  tick={{ fontSize: 12, fill: '#6B7280' }}
                  tickLine={false}
                  axisLine={{ stroke: 'rgba(255,255,255,0.08)' }}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: '#6B7280' }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={v => `$${v}B`}
                  width={56}
                />
                <Tooltip content={<CustomTooltip unit={marketData.unit} />} cursor={{ stroke: 'rgba(255,107,0,0.2)', strokeWidth: 1 }} />
                <ReferenceLine x={forecastStartYear} stroke="rgba(245,158,11,0.3)" strokeDasharray="4 4" label={{ value: 'Forecast ▶', fill: '#F59E0B', fontSize: 11, position: 'insideTopRight' }} />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="url(#lineGradient)"
                  strokeWidth={3}
                  dot={(props) => {
                    const { cx, cy, payload } = props;
                    const isForecast = payload.forecast;
                    return (
                      <circle
                        key={`dot-${cx}-${cy}`}
                        cx={cx} cy={cy} r={4}
                        fill={isForecast ? '#F59E0B' : '#FF6B00'}
                        stroke={isForecast ? '#F59E0B20' : '#FF6B0020'}
                        strokeWidth={6}
                      />
                    );
                  }}
                  activeDot={{ r: 7, fill: '#FF6B00', stroke: '#FF6B0040', strokeWidth: 8 }}
                  animationDuration={1800}
                  animationEasing="ease-out"
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="w-full h-full bg-muted/20 rounded-xl animate-pulse flex items-center justify-center">
              <TrendingUp className="w-8 h-8 text-muted-foreground/30" />
            </div>
          )}
        </div>

        {/* Footer note */}
        <p className="text-xs text-muted-foreground mt-4 text-center">
          Source: Industry research & CoreStack market intelligence · Values in USD Billions
        </p>
      </div>
    </div>
  );
}

// ─── BenefitIcon ───────────────────────────────────────────────────────────────
function BenefitIcon({ name }: { name: string }) {
  const icons: Record<string, React.ElementType> = { shield: Shield, trending: TrendingUp, zap: Zap, globe: Globe, users: Users, award: Award, clock: Clock, rocket: Rocket };
  const Icon = icons[name] ?? Zap;
  return <Icon className="w-5 h-5 text-primary" />;
}

// ─── FAQ ──────────────────────────────────────────────────────────────────────
function FAQ({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-border rounded-2xl overflow-hidden bg-card/40 backdrop-blur-sm hover:border-primary/20 transition-colors">
      <button
        className="w-full flex items-center justify-between p-5 text-left hover:bg-muted/20 transition-colors"
        onClick={() => setOpen(v => !v)}
      >
        <span className="font-medium text-foreground text-pretty pr-4">{q}</span>
        <ChevronDown className={`w-4 h-4 text-muted-foreground shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="px-5 pb-5 text-sm text-muted-foreground leading-relaxed border-t border-border pt-4 text-pretty">
          {a}
        </div>
      )}
    </div>
  );
}

// ─── AnimatedSection ───────────────────────────────────────────────────────────
function AnimatedSection({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.08 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return (
    <div ref={ref} style={{ transitionDelay: `${delay}ms` }}
      className={`transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'} ${className}`}>
      {children}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function ServiceDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [consultOpen, setConsultOpen] = useState(false);
  const [projectOpen, setProjectOpen] = useState(false);
  const [heroVisible, setHeroVisible] = useState(false);

  const service = SERVICES_DATA.find(s => s.slug === slug);
  const content = slug ? getServiceContent(slug) : null;

  useEffect(() => { setTimeout(() => setHeroVisible(true), 80); }, []);

  if (!service || !content) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">Service Not Found</h1>
            <button onClick={() => navigate('/services')} className="text-primary hover:underline">← Back to Services</button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const Icon = service.icon;

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow">

        {/* ── Hero ──────────────────────────────────────────────────────────── */}
        <section className="relative overflow-hidden pt-28 pb-20 bg-background">
          {/* Background glows */}
          <div className="absolute inset-0 pointer-events-none">
            <div className={`absolute top-0 left-1/3 w-[600px] h-[600px] ${service.bg} rounded-full blur-[130px] opacity-40`} />
            <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[100px]" />
          </div>

          <div className="container mx-auto px-4 max-w-7xl relative">

            {/* ── Back Button (standard top-left) ──────────────────────────── */}
            <div className={`w-fit mb-6 mt-2 transition-all duration-500 ${heroVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}>
              <button
                onClick={() => navigate(-1)}
                className="group inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-card/70 backdrop-blur-md text-sm font-medium text-muted-foreground hover:text-primary hover:border-primary/40 hover:bg-primary/5 transition-all duration-200 shadow-sm"
              >
                <ArrowLeft className="w-4 h-4 transition-transform duration-200 group-hover:-translate-x-0.5" />
                Back
              </button>
            </div>

            {/* Breadcrumb */}
            <nav className={`flex items-center gap-2 text-sm text-muted-foreground mb-8 flex-wrap transition-all duration-700 delay-100 ${heroVisible ? 'opacity-100' : 'opacity-0'}`}>
              <Link to="/" className="hover:text-primary transition-colors">Home</Link>
              <ChevronRight className="w-3.5 h-3.5 shrink-0" />
              <Link to="/services" className="hover:text-primary transition-colors">Services</Link>
              <ChevronRight className="w-3.5 h-3.5 shrink-0" />
              <span className="text-foreground font-medium">{service.title}</span>
            </nav>

            {/* Hero content */}
            <div className={`flex flex-col lg:flex-row lg:items-start gap-12 transition-all duration-700 delay-150 ${heroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              <div className="flex-1 min-w-0">
                {/* Icon badge */}
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl ${service.bg} border ${service.border} mb-6`}>
                  <Icon className={`w-8 h-8 ${service.color}`} />
                </div>

                {/* Category tag */}
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 mb-5">
                  <span className="text-primary text-xs font-semibold uppercase tracking-widest">CoreStack Service</span>
                </div>

                <h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-bold text-foreground mb-4 text-balance leading-tight">
                  {service.title}
                </h1>
                <p className={`text-xl font-semibold mb-5 ${service.color}`}>{service.tagline}</p>
                <p className="text-muted-foreground text-lg leading-relaxed max-w-2xl text-pretty mb-8">{content.description}</p>

                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    onClick={() => setConsultOpen(true)}
                    className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary/25"
                  >
                    Book Consultation <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setProjectOpen(true)}
                    className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl border border-border bg-card/60 backdrop-blur-sm text-foreground font-semibold hover:border-primary/40 hover:bg-primary/5 transition-all"
                  >
                    Start Your Project <Rocket className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Key capabilities glass card */}
              <div className={`lg:w-80 shrink-0 p-6 rounded-2xl border ${service.border} bg-card/50 backdrop-blur-md shadow-xl`}>
                <div className="flex items-center gap-2 mb-5">
                  <div className={`w-2 h-2 rounded-full bg-primary animate-pulse`} />
                  <h3 className="text-sm font-bold text-foreground uppercase tracking-wide">Key Capabilities</h3>
                </div>
                <div className="space-y-3">
                  {service.highlights.map(h => (
                    <div key={h} className="flex items-center gap-3 p-2.5 rounded-xl bg-muted/20 border border-border/50">
                      <CheckCircle className={`w-4 h-4 ${service.color} shrink-0`} />
                      <span className="text-sm text-foreground font-medium">{h}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Benefits ──────────────────────────────────────────────────────── */}
        <section className="py-20 bg-muted/20">
          <div className="container mx-auto px-4 max-w-7xl">
            <AnimatedSection>
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-3 text-balance">
                  Key <span className="gradient-text">Benefits</span>
                </h2>
                <p className="text-muted-foreground">Why leading businesses choose CoreStack for {service.title}</p>
              </div>
            </AnimatedSection>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {content.benefits.map((b, i) => (
                <AnimatedSection key={i} delay={i * 80}>
                  <div className="group h-full p-6 rounded-2xl border border-border bg-card/60 backdrop-blur-sm hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg transition-all duration-300">
                    <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                      <BenefitIcon name={b.icon} />
                    </div>
                    <h3 className="font-display font-semibold text-foreground mb-2 text-balance">{b.title}</h3>
                    <p className="text-sm text-muted-foreground text-pretty leading-relaxed">{b.desc}</p>
                  </div>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </section>

        {/* ── Features + Development Workflow ──────────────────────────────── */}
        <section className="py-20 bg-background">
          <div className="container mx-auto px-4 max-w-7xl">
            <div className="grid lg:grid-cols-2 gap-14">
              {/* Features */}
              <AnimatedSection>
                <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-8 text-balance">
                  What's <span className="gradient-text">Included</span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {content.features.map((f, i) => (
                    <div key={f} className="flex items-center gap-2.5 p-3.5 rounded-xl border border-border bg-card/40 hover:border-primary/30 hover:bg-card/60 transition-all duration-200"
                      style={{ animationDelay: `${i * 40}ms` }}>
                      <CheckCircle className="w-4 h-4 text-primary shrink-0" />
                      <span className="text-sm text-foreground font-medium">{f}</span>
                    </div>
                  ))}
                </div>
              </AnimatedSection>

              {/* Development Workflow Timeline */}
              <AnimatedSection delay={100}>
                <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-8 text-balance">
                  Development <span className="gradient-text">Workflow</span>
                </h2>
                <div className="space-y-0">
                  {content.process.map((p, i) => (
                    <div key={i} className="flex gap-5 group">
                      <div className="flex flex-col items-center shrink-0">
                        <div className="w-9 h-9 rounded-full bg-primary/10 border-2 border-primary/30 flex items-center justify-center z-10 group-hover:border-primary group-hover:bg-primary/20 transition-colors duration-200">
                          <span className="text-xs font-bold text-primary">{p.step}</span>
                        </div>
                        {i < content.process.length - 1 && <div className="w-px flex-1 bg-border mt-1" />}
                      </div>
                      <div className={`pb-6 flex-1 min-w-0 ${i < content.process.length - 1 ? '' : 'pb-0'}`}>
                        <div className="p-4 rounded-xl border border-border bg-card/40 hover:border-primary/20 hover:bg-card/60 transition-all duration-200">
                          <h4 className="font-semibold text-foreground mb-1">{p.title}</h4>
                          <p className="text-sm text-muted-foreground text-pretty">{p.desc}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </AnimatedSection>
            </div>
          </div>
        </section>

        {/* ── Market Trend Line Chart ────────────────────────────────────────── */}
        <section className="py-20 bg-muted/20">
          <div className="container mx-auto px-4 max-w-7xl">
            <AnimatedSection>
              {slug && <MarketLineChart slug={slug} />}
            </AnimatedSection>
          </div>
        </section>

        {/* ── Tech Stack + Industries ────────────────────────────────────────── */}
        <section className="py-20 bg-background">
          <div className="container mx-auto px-4 max-w-7xl">
            <div className="grid lg:grid-cols-2 gap-12">
              <AnimatedSection>
                <div className={`p-7 rounded-2xl border ${service.border} bg-card/60 backdrop-blur-sm h-full`}>
                  <h2 className="text-2xl font-display font-bold text-foreground mb-5 text-balance">
                    Technology <span className="gradient-text">Stack</span>
                  </h2>
                  <div className="flex flex-wrap gap-2.5">
                    {content.techStack.map(t => (
                      <span key={t} className={`px-3.5 py-1.5 rounded-lg text-sm font-semibold ${service.bg} ${service.color} border ${service.border} hover:opacity-80 transition-opacity`}>{t}</span>
                    ))}
                  </div>
                </div>
              </AnimatedSection>
              <AnimatedSection delay={80}>
                <div className="p-7 rounded-2xl border border-border bg-card/60 backdrop-blur-sm h-full">
                  <h2 className="text-2xl font-display font-bold text-foreground mb-5 text-balance">
                    Industries <span className="gradient-text">Served</span>
                  </h2>
                  <div className="grid grid-cols-2 gap-2.5">
                    {content.industries.map(ind => (
                      <div key={ind} className="flex items-center gap-2.5 p-3 rounded-xl border border-border bg-muted/20 hover:border-primary/20 transition-colors">
                        <div className="w-2 h-2 rounded-full bg-primary shrink-0" />
                        <span className="text-sm text-foreground font-medium">{ind}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </AnimatedSection>
            </div>
          </div>
        </section>

        {/* ── Case Studies ──────────────────────────────────────────────────── */}
        <section className="py-20 bg-muted/20">
          <div className="container mx-auto px-4 max-w-7xl">
            <AnimatedSection>
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-3 text-balance">
                  Case <span className="gradient-text">Studies</span>
                </h2>
                <p className="text-muted-foreground">Real results from real clients</p>
              </div>
            </AnimatedSection>
            <div className="grid md:grid-cols-3 gap-6">
              {content.caseStudies.map((cs, i) => (
                <AnimatedSection key={i} delay={i * 80}>
                  <div className={`h-full p-6 rounded-2xl border ${service.border} bg-card/60 backdrop-blur-sm hover:-translate-y-1 transition-all duration-300`}>
                    <div className={`text-2xl font-display font-bold ${service.color} mb-3`}>{cs.metric}</div>
                    <h4 className="font-semibold text-foreground mb-2 text-balance">{cs.title}</h4>
                    <p className="text-sm text-muted-foreground text-pretty">{cs.result}</p>
                  </div>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </section>

        {/* ── FAQs ──────────────────────────────────────────────────────────── */}
        <section className="py-20 bg-background">
          <div className="container mx-auto px-4 max-w-3xl">
            <AnimatedSection>
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-3 text-balance">
                  Frequently Asked <span className="gradient-text">Questions</span>
                </h2>
              </div>
            </AnimatedSection>
            <div className="space-y-3">
              {content.faqs.map((faq, i) => (
                <AnimatedSection key={i} delay={i * 60}>
                  <FAQ q={faq.q} a={faq.a} />
                </AnimatedSection>
              ))}
            </div>
          </div>
        </section>

        {/* ── Customer Reviews ──────────────────────────────────────────────── */}
        <section className="py-20 bg-muted/20">
          <div className="container mx-auto px-4 max-w-7xl">
            <AnimatedSection>
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-3 text-balance">
                  Client <span className="gradient-text">Reviews</span>
                </h2>
              </div>
            </AnimatedSection>
            <div className="grid md:grid-cols-3 gap-6">
              {content.reviews.map((r, i) => (
                <AnimatedSection key={i} delay={i * 80}>
                  <div className="h-full p-6 rounded-2xl border border-border bg-card/60 backdrop-blur-sm hover:-translate-y-1 hover:border-primary/20 transition-all duration-300">
                    <div className="flex gap-1 mb-4">
                      {Array.from({ length: r.rating }).map((_, j) => <Star key={j} className="w-4 h-4 fill-amber-400 text-amber-400" />)}
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-5 text-pretty">"{r.text}"</p>
                    <div className="pt-4 border-t border-border">
                      <div className="font-semibold text-foreground text-sm">{r.name}</div>
                      <div className="text-xs text-muted-foreground">{r.company}</div>
                    </div>
                  </div>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA ───────────────────────────────────────────────────────────── */}
        <section className="py-20 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-blue-500/5 pointer-events-none" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[250px] bg-primary/10 rounded-full blur-[80px] pointer-events-none" />
          <div className="container mx-auto px-4 max-w-3xl text-center relative">
            <AnimatedSection>
              <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl ${service.bg} border ${service.border} mx-auto mb-6`}>
                <Icon className={`w-8 h-8 ${service.color}`} />
              </div>
              <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4 text-balance">
                Ready to get started with<br />
                <span className="gradient-text">{service.title}?</span>
              </h2>
              <p className="text-muted-foreground text-lg mb-8 text-pretty">
                Book a free consultation or submit your project details to receive a tailored proposal within 24 hours.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => setConsultOpen(true)}
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-primary text-primary-foreground font-bold text-lg hover:bg-primary/90 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary/30"
                >
                  Book Consultation <ArrowRight className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setProjectOpen(true)}
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl border border-border bg-card text-foreground font-bold text-lg hover:border-primary/40 hover:bg-primary/5 transition-all"
                >
                  Start Your Project <Rocket className="w-5 h-5" />
                </button>
              </div>
            </AnimatedSection>
          </div>
        </section>
      </main>
      <Footer />
      <BookConsultationModal open={consultOpen} onClose={() => setConsultOpen(false)} />
      <ProjectEnquiryModal open={projectOpen} onClose={() => setProjectOpen(false)} />
    </div>
  );
}

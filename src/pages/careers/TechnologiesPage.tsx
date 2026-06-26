import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import Header from '@/components/layouts/Header';
import Footer from '@/components/layouts/Footer';
import {
  ChevronRight, X, ExternalLink, TrendingUp, Zap, Shield, Globe,
  BarChart3, Server, Code2, Database, Cloud, Brain, GitBranch,
} from 'lucide-react';
import BackButton from '@/components/ui/BackButton';

type TechCategory = 'Frontend' | 'Backend' | 'Database' | 'Cloud' | 'AI & ML' | 'DevOps';

// ─── Tech Data ────────────────────────────────────────────────────────────────
interface Tech {
  name: string;
  color: string;
  logo: string;
  desc: string;
  advantages: string[];
  useCases: string[];
  performance: number;
  popularity: number;
  industryUsage: string[];
  version: string;
}

const TECH_STACK: Record<TechCategory, Tech[]> = {
  Frontend: [
    { name: 'React', color: '#61DAFB', logo: '⚛️', desc: 'The world\'s most popular component-based UI library, maintained by Meta and used by millions of production applications globally.', advantages: ['Virtual DOM for performance', 'Huge ecosystem & community', 'Composable component model', 'React Native for mobile'], useCases: ['SaaS dashboards', 'E-commerce platforms', 'Admin panels', 'Real-time UIs'], performance: 94, popularity: 98, industryUsage: ['Fintech', 'Healthcare', 'E-Commerce', 'SaaS'], version: '18.3' },
    { name: 'Next.js', color: '#ffffff', logo: '▲', desc: 'The React framework for production. Combines SSR, SSG, ISR and client rendering with a first-class developer experience.', advantages: ['Server-side rendering', 'App Router architecture', 'Built-in image optimization', 'Edge middleware'], useCases: ['Marketing sites', 'E-commerce', 'Blogs & CMS', 'Full-stack apps'], performance: 97, popularity: 92, industryUsage: ['Media', 'Retail', 'SaaS', 'Enterprise'], version: '14.2' },
    { name: 'TypeScript', color: '#3178C6', logo: '🔷', desc: 'Typed superset of JavaScript that compiles to plain JS. Dramatically improves code quality, IDE support, and team collaboration.', advantages: ['Static type checking', 'Better IDE autocomplete', 'Refactoring confidence', 'Catch bugs at compile time'], useCases: ['Large-scale apps', 'Team projects', 'API contracts', 'Library development'], performance: 91, popularity: 96, industryUsage: ['Enterprise', 'Fintech', 'Healthcare', 'All'], version: '5.4' },
    { name: 'Vue.js', color: '#42b883', logo: '💚', desc: 'Progressive JavaScript framework known for its gentle learning curve, flexibility, and excellent performance in mid-scale applications.', advantages: ['Progressive adoption', 'Excellent documentation', 'Composition API', 'Small bundle size'], useCases: ['SPAs', 'Progressive enhancement', 'Prototyping', 'Internal tools'], performance: 92, popularity: 78, industryUsage: ['Startups', 'E-Commerce', 'Education', 'Healthcare'], version: '3.4' },
    { name: 'Tailwind CSS', color: '#38BDF8', logo: '🎨', desc: 'Utility-first CSS framework that enables rapid UI development without leaving your HTML. Pairs perfectly with component-based frameworks.', advantages: ['Utility-first approach', 'Consistent design system', 'No CSS specificity fights', 'Tiny production bundle'], useCases: ['Rapid prototyping', 'Design systems', 'Landing pages', 'Dashboards'], performance: 96, popularity: 90, industryUsage: ['All industries', 'Startups', 'Enterprise', 'SaaS'], version: '3.4' },
    { name: 'Angular', color: '#DD0031', logo: '🅰️', desc: 'Enterprise-grade full framework from Google. Opinionated, batteries-included architecture ideal for large teams building complex SPAs.', advantages: ['Full MVC framework', 'Dependency injection', 'CLI tooling', 'Strong typing with TS'], useCases: ['Enterprise apps', 'Banking portals', 'Government systems', 'Large SPAs'], performance: 88, popularity: 72, industryUsage: ['Finance', 'Government', 'Enterprise', 'Telecom'], version: '17.3' },
  ],
  Backend: [
    { name: 'Node.js', color: '#339933', logo: '🟢', desc: 'JavaScript runtime built on V8 enabling server-side execution. Excellent for I/O-heavy applications and real-time systems with unified JS stack.', advantages: ['Non-blocking I/O', 'Unified JS/TS stack', 'Massive npm ecosystem', 'Excellent for microservices'], useCases: ['REST APIs', 'Real-time apps', 'Streaming services', 'BFF pattern'], performance: 90, popularity: 95, industryUsage: ['SaaS', 'Fintech', 'Media', 'E-Commerce'], version: '20 LTS' },
    { name: 'Python', color: '#3776AB', logo: '🐍', desc: 'The dominant language for data science, ML, and scripting. Django and FastAPI make it a serious contender for production web services too.', advantages: ['ML/AI ecosystem', 'Rapid prototyping', 'Readable syntax', 'Django & FastAPI'], useCases: ['ML APIs', 'Data pipelines', 'Analytics backends', 'Scientific computing'], performance: 82, popularity: 92, industryUsage: ['Healthcare', 'Finance', 'Research', 'AI/ML'], version: '3.12' },
    { name: 'Go', color: '#00ADD8', logo: '🐹', desc: 'Google\'s systems language delivering C-like performance with Go\'s simplicity. Ideal for high-throughput microservices and network-heavy workloads.', advantages: ['Exceptional concurrency', 'C-level performance', 'Single binary deployment', 'Built-in testing'], useCases: ['High-performance APIs', 'CLI tools', 'Network services', 'Cloud infrastructure'], performance: 97, popularity: 74, industryUsage: ['Cloud', 'DevOps', 'Finance', 'Logistics'], version: '1.22' },
    { name: 'Java', color: '#ED8B00', logo: '☕', desc: 'The backbone of enterprise computing. Spring Boot makes Java the go-to for large-scale, highly reliable backend systems with mature tooling.', advantages: ['Enterprise ecosystem', 'JVM performance', 'Spring Boot framework', 'Excellent monitoring'], useCases: ['Enterprise systems', 'Banking apps', 'ERP backends', 'Microservices'], performance: 91, popularity: 80, industryUsage: ['Banking', 'Insurance', 'Healthcare', 'Enterprise'], version: '21 LTS' },
    { name: 'Rust', color: '#CE4A08', logo: '🦀', desc: 'Memory-safe systems language with zero-cost abstractions. Increasingly popular for performance-critical services replacing C++ in production.', advantages: ['Memory safety', 'Zero-cost abstractions', 'Fearless concurrency', 'WebAssembly target'], useCases: ['Systems programming', 'WebAssembly', 'CLI tools', 'Performance-critical APIs'], performance: 99, popularity: 62, industryUsage: ['Systems', 'Game dev', 'Embedded', 'Blockchain'], version: '1.78' },
    { name: 'FastAPI', color: '#009688', logo: '⚡', desc: 'Modern, high-performance Python web framework for building APIs with automatic OpenAPI documentation, type hints, and async support.', advantages: ['Async-first', 'Auto OpenAPI docs', 'Python type hints', 'Pydantic validation'], useCases: ['ML model serving', 'Data APIs', 'Microservices', 'Prototype APIs'], performance: 93, popularity: 80, industryUsage: ['AI/ML', 'Data Science', 'Fintech', 'Healthcare'], version: '0.111' },
  ],
  Database: [
    { name: 'PostgreSQL', color: '#336791', logo: '🐘', desc: 'The world\'s most advanced open-source relational database. ACID-compliant with powerful extensions including PostGIS, pgvector, and full-text search.', advantages: ['ACID compliance', 'JSON/JSONB support', 'pgvector for AI', 'Mature & proven'], useCases: ['SaaS platforms', 'Financial systems', 'Analytics', 'AI applications'], performance: 95, popularity: 91, industryUsage: ['All industries', 'Fintech', 'Healthcare', 'SaaS'], version: '16.3' },
    { name: 'MongoDB', color: '#47A248', logo: '🍃', desc: 'Leading document database offering flexible schema design, horizontal scaling, and excellent developer experience for agile product teams.', advantages: ['Flexible schema', 'Horizontal scaling', 'Rich query language', 'Atlas cloud service'], useCases: ['CMS platforms', 'Catalogs', 'User profiles', 'IoT data'], performance: 88, popularity: 82, industryUsage: ['Retail', 'Gaming', 'IoT', 'Media'], version: '7.0' },
    { name: 'Redis', color: '#DC382D', logo: '🔴', desc: 'In-memory data structure store used as cache, message broker, and database. Sub-millisecond latency makes it essential for high-performance apps.', advantages: ['Sub-ms latency', 'Pub/Sub messaging', 'Atomic operations', 'Multiple data structures'], useCases: ['Caching layer', 'Session storage', 'Real-time leaderboards', 'Rate limiting'], performance: 99, popularity: 88, industryUsage: ['SaaS', 'Gaming', 'E-Commerce', 'Finance'], version: '7.2' },
    { name: 'Supabase', color: '#3ECF8E', logo: '⚡', desc: 'Open-source Firebase alternative built on PostgreSQL with real-time subscriptions, auth, Edge Functions, and instant REST/GraphQL APIs.', advantages: ['PostgreSQL backbone', 'Real-time subscriptions', 'Built-in auth', 'Edge Functions'], useCases: ['Rapid MVPs', 'Real-time apps', 'Mobile backends', 'SaaS products'], performance: 92, popularity: 82, industryUsage: ['Startups', 'SaaS', 'Mobile', 'Web apps'], version: '2.0' },
    { name: 'MySQL', color: '#4479A1', logo: '🐬', desc: 'The world\'s most popular open-source RDBMS. Proven at scale by Facebook, Twitter, and YouTube. Excellent for read-heavy workloads.', advantages: ['Proven at massive scale', 'Wide hosting support', 'Replication support', 'Strong ecosystem'], useCases: ['Web apps', 'E-commerce', 'Content sites', 'Analytics'], performance: 90, popularity: 85, industryUsage: ['E-Commerce', 'Media', 'SaaS', 'Enterprises'], version: '8.3' },
    { name: 'Elasticsearch', color: '#F04E98', logo: '🔍', desc: 'Distributed search and analytics engine powering full-text search, log analytics, and observability at petabyte scale.', advantages: ['Full-text search', 'Log analytics', 'Real-time indexing', 'Distributed architecture'], useCases: ['Search engines', 'Log management', 'Analytics', 'Observability'], performance: 93, popularity: 75, industryUsage: ['E-Commerce', 'Media', 'Finance', 'DevOps'], version: '8.13' },
  ],
  Cloud: [
    { name: 'AWS', color: '#FF9900', logo: '☁️', desc: 'The world\'s most comprehensive cloud platform with 200+ services. Market leader powering millions of businesses from startups to enterprises.', advantages: ['Widest service catalog', 'Global infrastructure', 'Mature ecosystem', 'Best-in-class AI/ML services'], useCases: ['Enterprise workloads', 'Global deployment', 'Serverless', 'Big data'], performance: 98, popularity: 97, industryUsage: ['All industries'], version: 'Platform' },
    { name: 'Azure', color: '#0089D6', logo: '🔷', desc: 'Microsoft\'s enterprise cloud with deep Active Directory integration, hybrid cloud excellence, and unmatched Microsoft ecosystem support.', advantages: ['AD integration', 'Hybrid cloud', '.NET ecosystem', 'Compliance certs'], useCases: ['Enterprise apps', 'Microsoft stack', 'Government', 'Hybrid cloud'], performance: 96, popularity: 89, industryUsage: ['Enterprise', 'Government', 'Healthcare', 'Finance'], version: 'Platform' },
    { name: 'Kubernetes', color: '#326CE5', logo: '🛞', desc: 'The de facto container orchestration standard. Automates deployment, scaling, and management of containerized applications across any infrastructure.', advantages: ['Auto-scaling', 'Self-healing', 'Infrastructure agnostic', 'Huge ecosystem'], useCases: ['Microservices', 'CI/CD', 'Multi-cloud', 'High-availability apps'], performance: 95, popularity: 86, industryUsage: ['All tech companies', 'SaaS', 'Fintech', 'Enterprise'], version: '1.30' },
    { name: 'Docker', color: '#2496ED', logo: '🐳', desc: 'The container platform that transformed software delivery. Package once, run anywhere — from developer laptops to production Kubernetes clusters.', advantages: ['Environment consistency', 'Fast deployments', 'Version control', 'Resource efficiency'], useCases: ['Development environments', 'CI/CD pipelines', 'Microservices', 'Legacy migration'], performance: 92, popularity: 94, industryUsage: ['All industries', 'SaaS', 'Enterprise', 'Startups'], version: '26.1' },
    { name: 'Terraform', color: '#7B42BC', logo: '⚙️', desc: 'HashiCorp\'s infrastructure-as-code tool. Define cloud resources in declarative HCL and deploy consistently across AWS, Azure, GCP, and more.', advantages: ['Multi-cloud support', 'Declarative syntax', 'State management', 'Huge provider ecosystem'], useCases: ['Infrastructure provisioning', 'DR automation', 'Compliance', 'Multi-cloud'], performance: 91, popularity: 82, industryUsage: ['DevOps', 'Enterprise', 'Cloud-native', 'Fintech'], version: '1.8' },
    { name: 'Google Cloud', color: '#4285F4', logo: '🌐', desc: 'Google\'s cloud platform with industry-leading data analytics, Kubernetes (born here), and unmatched AI/ML infrastructure with Vertex AI.', advantages: ['Best BigQuery', 'Born-on-Kubernetes', 'Superior ML infrastructure', 'Global network'], useCases: ['Big data', 'AI/ML workloads', 'Real-time analytics', 'Global apps'], performance: 95, popularity: 76, industryUsage: ['AI/ML', 'Analytics', 'Media', 'Startups'], version: 'Platform' },
  ],
  'AI & ML': [
    { name: 'TensorFlow', color: '#FF6F00', logo: '🧠', desc: 'Google\'s open-source ML framework powering production AI at scale. From mobile edge inference to distributed training on TPU clusters.', advantages: ['Production-grade', 'TensorFlow Serving', 'Mobile & edge support', 'TFX pipeline'], useCases: ['Image classification', 'NLP models', 'Recommendation systems', 'Time series'], performance: 92, popularity: 88, industryUsage: ['Healthcare', 'Finance', 'E-Commerce', 'Manufacturing'], version: '2.16' },
    { name: 'PyTorch', color: '#EE4C2C', logo: '🔥', desc: 'Facebook\'s research-first ML framework, now dominating both research and production. Pythonic API, dynamic graphs, and ecosystem that includes transformers.', advantages: ['Dynamic computation graphs', 'Pythonic API', 'Research community', 'TorchServe deployment'], useCases: ['Research & production', 'NLP', 'Computer vision', 'Generative AI'], performance: 94, popularity: 92, industryUsage: ['Research', 'Fintech', 'Healthcare', 'Autonomous vehicles'], version: '2.3' },
    { name: 'LangChain', color: '#1C3C3C', logo: '🔗', desc: 'Framework for building LLM-powered applications. Orchestrate prompts, chains, agents, and tools to build production-grade AI workflows.', advantages: ['LLM orchestration', 'Agent framework', 'Memory management', 'Tool integration'], useCases: ['AI chatbots', 'RAG systems', 'Autonomous agents', 'Document Q&A'], performance: 88, popularity: 86, industryUsage: ['SaaS', 'Legal', 'Healthcare', 'Finance'], version: '0.2' },
    { name: 'OpenCV', color: '#5C3EE8', logo: '👁️', desc: 'The world\'s largest computer vision library with 2,500+ optimized algorithms for image and video analysis across real-time and batch processing.', advantages: ['2,500+ algorithms', 'Real-time processing', 'GPU acceleration', 'Multi-language'], useCases: ['Facial recognition', 'Object detection', 'Medical imaging', 'Autonomous systems'], performance: 96, popularity: 78, industryUsage: ['Healthcare', 'Manufacturing', 'Security', 'Automotive'], version: '4.9' },
    { name: 'Hugging Face', color: '#FFD21E', logo: '🤗', desc: 'The GitHub of machine learning — 500k+ pretrained models for NLP, vision, audio. Hub, Transformers library, and Spaces all-in-one platform.', advantages: ['500k+ models', 'Easy fine-tuning', 'Inference API', 'Dataset hub'], useCases: ['NLP tasks', 'LLM deployment', 'Fine-tuning', 'Text generation'], performance: 90, popularity: 90, industryUsage: ['Research', 'Healthcare', 'Legal', 'Finance'], version: '4.40' },
    { name: 'Scikit-learn', color: '#F89939', logo: '📊', desc: 'Python\'s most trusted ML library for classical algorithms. Consistent API, excellent documentation, and seamless pandas/numpy integration.', advantages: ['Consistent API', 'Comprehensive algorithms', 'Pipeline support', 'Model evaluation tools'], useCases: ['Classification', 'Regression', 'Clustering', 'Feature engineering'], performance: 87, popularity: 91, industryUsage: ['Finance', 'Healthcare', 'Retail', 'Analytics'], version: '1.4' },
  ],
  DevOps: [
    { name: 'GitHub Actions', color: '#2088FF', logo: '⚙️', desc: 'CI/CD platform native to GitHub. Event-driven workflows with 20,000+ community actions for build, test, deploy, and everything in between.', advantages: ['GitHub-native', '20k+ community actions', 'Matrix builds', 'Self-hosted runners'], useCases: ['CI pipelines', 'Auto-deployment', 'Testing', 'Release automation'], performance: 93, popularity: 94, industryUsage: ['All tech companies', 'Open source', 'Startups', 'Enterprise'], version: 'Platform' },
    { name: 'Prometheus', color: '#E6522C', logo: '📡', desc: 'CNCF\'s leading time-series monitoring system. Pull-based metrics collection with powerful PromQL query language and Alertmanager integration.', advantages: ['Pull-based metrics', 'PromQL', 'Alertmanager', 'CNCF standard'], useCases: ['Infrastructure monitoring', 'Application metrics', 'Capacity planning', 'SLO tracking'], performance: 94, popularity: 84, industryUsage: ['Cloud-native', 'SaaS', 'Enterprise', 'DevOps'], version: '2.52' },
    { name: 'Grafana', color: '#F46800', logo: '📊', desc: 'The open-source analytics and monitoring platform. Beautiful dashboards for metrics, logs, and traces from 150+ data sources including Prometheus.', advantages: ['150+ data sources', 'Alerting', 'Dashboard templating', 'Loki log integration'], useCases: ['Metrics dashboards', 'Log analytics', 'Business KPIs', 'Incident response'], performance: 93, popularity: 86, industryUsage: ['DevOps', 'SaaS', 'Finance', 'IoT'], version: '11.0' },
    { name: 'Jenkins', color: '#D33833', logo: '🔧', desc: 'The original CI/CD server. 1,800+ plugins and unmatched flexibility for complex enterprise build pipelines with deep on-premise integration.', advantages: ['1,800+ plugins', 'On-premise support', 'Pipeline as code', 'Enterprise scale'], useCases: ['Enterprise CI/CD', 'Complex builds', 'Legacy integration', 'Multi-branch pipelines'], performance: 84, popularity: 72, industryUsage: ['Enterprise', 'Finance', 'Government', 'Telecom'], version: '2.462' },
    { name: 'Ansible', color: '#EE0000', logo: '🔴', desc: 'Agentless IT automation with YAML playbooks. Configuration management, application deployment, and orchestration without a central agent.', advantages: ['Agentless', 'YAML playbooks', 'Idempotent', 'Huge module library'], useCases: ['Config management', 'Application deployment', 'Compliance automation', 'Cloud provisioning'], performance: 88, popularity: 78, industryUsage: ['Enterprise', 'Government', 'Telecom', 'Finance'], version: '2.17' },
    { name: 'ArgoCD', color: '#EF7B4D', logo: '🚀', desc: 'GitOps continuous delivery for Kubernetes. Declarative application deployment with automatic sync, rollback, and multi-cluster support.', advantages: ['GitOps workflow', 'Auto-sync', 'Multi-cluster', 'Application health'], useCases: ['K8s deployments', 'GitOps', 'Multi-env management', 'Canary deployments'], performance: 94, popularity: 78, industryUsage: ['Cloud-native', 'SaaS', 'Fintech', 'Enterprise'], version: '2.11' },
  ],
};

const CATEGORY_META: Record<TechCategory, { icon: React.ElementType; color: string; bg: string; border: string; desc: string }> = {
  Frontend: { icon: Code2, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30', desc: 'Crafting pixel-perfect UIs with modern frameworks' },
  Backend: { icon: Server, color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/30', desc: 'High-performance APIs and scalable server systems' },
  Database: { icon: Database, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30', desc: 'Structured storage, caching, and search at scale' },
  Cloud: { icon: Cloud, color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/30', desc: 'Infrastructure, orchestration, and global deployment' },
  'AI & ML': { icon: Brain, color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/30', desc: 'Machine learning, computer vision, and LLM applications' },
  DevOps: { icon: GitBranch, color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/30', desc: 'CI/CD, monitoring, and infrastructure automation' },
};

// ─── ProgressBar ──────────────────────────────────────────────────────────────
function ProgressBar({ value, color, animate }: { value: number; color: string; animate: boolean }) {
  return (
    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
      <div className={`h-full ${color} rounded-full transition-all duration-1000 ease-out`} style={{ width: animate ? `${value}%` : '0%' }} />
    </div>
  );
}

// ─── TechCard ─────────────────────────────────────────────────────────────────
function TechCard({ tech, categoryMeta, onOpen, index }: { tech: Tech; categoryMeta: typeof CATEGORY_META[TechCategory]; onOpen: (t: Tech) => void; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [barAnimate, setBarAnimate] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setVisible(true); setTimeout(() => setBarAnimate(true), 300); }
    }, { threshold: 0.1 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <div ref={ref} style={{ transitionDelay: `${(index % 6) * 60}ms` }}
      className={`transition-all duration-600 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
      <button
        onClick={() => onOpen(tech)}
        className={`group w-full text-left p-5 rounded-2xl border ${categoryMeta.border} bg-card/60 backdrop-blur-sm hover:bg-card hover:-translate-y-1 hover:shadow-lg transition-all duration-300`}
      >
        <div className="flex items-center gap-3 mb-3">
          <span className="text-2xl">{tech.logo}</span>
          <div className="flex-1 min-w-0">
            <div className="font-display font-bold text-foreground">{tech.name}</div>
            <div className="text-xs text-muted-foreground">v{tech.version}</div>
          </div>
          <ExternalLink className={`w-3.5 h-3.5 ${categoryMeta.color} opacity-0 group-hover:opacity-100 transition-opacity`} />
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed mb-3 text-pretty line-clamp-2">{tech.desc}</p>
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Performance</span>
            <span className={`font-semibold ${categoryMeta.color}`}>{tech.performance}%</span>
          </div>
          <ProgressBar value={tech.performance} color={`bg-current ${categoryMeta.color}`} animate={barAnimate} />
          <div className="flex justify-between text-xs mt-1">
            <span className="text-muted-foreground">Popularity</span>
            <span className={`font-semibold ${categoryMeta.color}`}>{tech.popularity}%</span>
          </div>
          <ProgressBar value={tech.popularity} color={`bg-current ${categoryMeta.color}`} animate={barAnimate} />
        </div>
      </button>
    </div>
  );
}

// ─── Tech Detail Modal ────────────────────────────────────────────────────────
function TechModal({ tech, categoryMeta, onClose }: { tech: Tech; categoryMeta: typeof CATEGORY_META[TechCategory]; onClose: () => void }) {
  const [animate, setAnimate] = useState(false);
  useEffect(() => { setTimeout(() => setAnimate(true), 50); }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-md" onClick={onClose} />
      <div className={`relative w-full max-w-2xl max-h-[90dvh] overflow-y-auto rounded-2xl border ${categoryMeta.border} bg-card/95 backdrop-blur-xl shadow-2xl transition-all duration-300 ${animate ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-95'}`}>
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between p-5 border-b border-border bg-card/90 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{tech.logo}</span>
            <div>
              <h2 className="font-display font-bold text-foreground text-xl">{tech.name}</h2>
              <span className={`text-xs font-medium ${categoryMeta.color}`}>v{tech.version}</span>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        <div className="p-5 space-y-6">
          {/* Description */}
          <p className="text-muted-foreground leading-relaxed text-pretty">{tech.desc}</p>

          {/* Performance metrics */}
          <div className="grid grid-cols-2 gap-4">
            {[{ label: 'Performance', value: tech.performance }, { label: 'Popularity', value: tech.popularity }].map(m => (
              <div key={m.label} className="p-4 rounded-xl border border-border bg-muted/20">
                <div className="flex justify-between mb-2">
                  <span className="text-xs text-muted-foreground font-medium">{m.label}</span>
                  <span className={`text-sm font-bold ${categoryMeta.color}`}>{m.value}%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className={`h-full ${categoryMeta.color === 'text-blue-400' ? 'bg-blue-400' : categoryMeta.color === 'text-green-400' ? 'bg-green-400' : categoryMeta.color === 'text-amber-400' ? 'bg-amber-400' : categoryMeta.color === 'text-cyan-400' ? 'bg-cyan-400' : categoryMeta.color === 'text-purple-400' ? 'bg-purple-400' : 'bg-orange-400'} rounded-full transition-all duration-1000`}
                    style={{ width: `${m.value}%` }} />
                </div>
              </div>
            ))}
          </div>

          {/* Advantages */}
          <div>
            <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <Zap className={`w-4 h-4 ${categoryMeta.color}`} /> Key Advantages
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {tech.advantages.map(a => (
                <div key={a} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span className={`${categoryMeta.color} mt-0.5 shrink-0`}>✓</span>{a}
                </div>
              ))}
            </div>
          </div>

          {/* Use Cases */}
          <div>
            <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <BarChart3 className={`w-4 h-4 ${categoryMeta.color}`} /> Use Cases
            </h3>
            <div className="flex flex-wrap gap-2">
              {tech.useCases.map(u => (
                <span key={u} className={`text-xs px-3 py-1 rounded-full ${categoryMeta.bg} ${categoryMeta.color} border ${categoryMeta.border} font-medium`}>{u}</span>
              ))}
            </div>
          </div>

          {/* Industry Usage */}
          <div>
            <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <Globe className={`w-4 h-4 ${categoryMeta.color}`} /> Industry Usage
            </h3>
            <div className="flex flex-wrap gap-2">
              {tech.industryUsage.map(ind => (
                <span key={ind} className="text-xs px-3 py-1 rounded-full bg-muted text-muted-foreground border border-border font-medium">{ind}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function TechnologiesPage() {
  const [activeCategory, setActiveCategory] = useState<TechCategory>('Frontend');
  const [selectedTech, setSelectedTech] = useState<Tech | null>(null);
  const [heroVisible, setHeroVisible] = useState(false);

  useEffect(() => { setTimeout(() => setHeroVisible(true), 80); }, []);

  const categories = Object.keys(TECH_STACK) as TechCategory[];
  const currentMeta = CATEGORY_META[activeCategory];
  const CurrentIcon = currentMeta.icon;

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow">

        {/* ── Hero ──────────────────────────────────────────────────────────── */}
        <section className="relative overflow-hidden pt-32 pb-20 bg-background">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 right-1/3 w-[500px] h-[500px] bg-primary/8 rounded-full blur-[120px]" />
            <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-purple-500/6 rounded-full blur-[100px]" />
          </div>
          <div className="container mx-auto px-4 max-w-7xl relative">
            <div className="mb-6"><BackButton /></div>
            <nav className={`flex items-center gap-2 text-sm text-muted-foreground mb-8 transition-all duration-700 ${heroVisible ? 'opacity-100' : 'opacity-0'}`}>
              <Link to="/" className="hover:text-primary transition-colors">Home</Link>
              <ChevronRight className="w-3.5 h-3.5" />
              <span className="text-foreground font-medium">Technologies</span>
            </nav>
            <div className={`max-w-4xl transition-all duration-700 delay-100 ${heroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-6">
                <TrendingUp className="w-3.5 h-3.5 text-primary" />
                <span className="text-primary text-xs font-semibold uppercase tracking-widest">Our Stack</span>
              </div>
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-bold text-foreground mb-6 text-balance leading-tight">
                Enterprise-Grade<br />
                <span className="gradient-text">Technology Stack</span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl text-pretty leading-relaxed">
                36 battle-tested technologies across 6 domains. Click any technology card to explore capabilities, advantages, use cases, and performance benchmarks.
              </p>
            </div>
          </div>
        </section>

        {/* ── Category Tabs ─────────────────────────────────────────────────── */}
        <section className="sticky top-16 z-30 py-4 bg-background/80 backdrop-blur-md border-b border-border">
          <div className="container mx-auto px-4 max-w-7xl">
            <div className="flex gap-2 overflow-x-auto whitespace-nowrap pb-1">
              {categories.map(cat => {
                const meta = CATEGORY_META[cat];
                const Icon = meta.icon;
                return (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 border shrink-0 ${activeCategory === cat ? `${meta.bg} ${meta.color} ${meta.border}` : 'border-border bg-card/60 text-muted-foreground hover:border-primary/30 hover:text-foreground'}`}
                  >
                    <Icon className="w-3.5 h-3.5" />{cat}
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── Tech Grid ─────────────────────────────────────────────────────── */}
        <section className="py-16 bg-muted/10">
          <div className="container mx-auto px-4 max-w-7xl">
            {/* Category header */}
            <div className="flex items-center gap-4 mb-10">
              <div className={`w-12 h-12 rounded-xl ${currentMeta.bg} flex items-center justify-center`}>
                <CurrentIcon className={`w-6 h-6 ${currentMeta.color}`} />
              </div>
              <div>
                <h2 className="text-2xl font-display font-bold text-foreground">{activeCategory}</h2>
                <p className="text-sm text-muted-foreground">{currentMeta.desc}</p>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {TECH_STACK[activeCategory].map((tech, i) => (
                <TechCard key={tech.name} tech={tech} categoryMeta={currentMeta} onOpen={setSelectedTech} index={i} />
              ))}
            </div>
          </div>
        </section>

        {/* ── All Categories Overview ───────────────────────────────────────── */}
        <section className="py-20 bg-background">
          <div className="container mx-auto px-4 max-w-7xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-3 text-balance">
                Full Stack <span className="gradient-text">Overview</span>
              </h2>
              <p className="text-muted-foreground">Every category at a glance — click to explore</p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {categories.map(cat => {
                const meta = CATEGORY_META[cat];
                const Icon = meta.icon;
                const techs = TECH_STACK[cat];
                return (
                  <button key={cat} onClick={() => { setActiveCategory(cat); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                    className={`group text-left p-6 rounded-2xl border ${meta.border} bg-card/60 backdrop-blur-sm hover:bg-card hover:-translate-y-1 transition-all duration-300`}>
                    <div className={`w-12 h-12 rounded-xl ${meta.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className={`w-6 h-6 ${meta.color}`} />
                    </div>
                    <h3 className="font-display font-bold text-foreground text-lg mb-1">{cat}</h3>
                    <p className="text-sm text-muted-foreground mb-4 text-pretty">{meta.desc}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {techs.slice(0, 4).map(t => (
                        <span key={t.name} className={`text-xs px-2 py-0.5 rounded-full ${meta.bg} ${meta.color} font-medium`}>{t.name}</span>
                      ))}
                      {techs.length > 4 && <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-medium">+{techs.length - 4} more</span>}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </section>
      </main>
      <Footer />

      {/* Tech Detail Modal */}
      {selectedTech && (
        <TechModal
          tech={selectedTech}
          categoryMeta={CATEGORY_META[activeCategory]}
          onClose={() => setSelectedTech(null)}
        />
      )}
    </div>
  );
}


import { useState, useEffect } from 'react';
import { supabase } from '@/db/supabase';
import type { Project, Category } from '@/types/types';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, TrendingUp, Users, CheckCircle } from 'lucide-react';

const STATS = [
  { icon: CheckCircle, value: '500+', label: 'Projects Delivered' },
  { icon: Users, value: '200+', label: 'Happy Clients' },
  { icon: TrendingUp, value: '98%', label: 'Client Retention' },
];

export default function PortfolioSection({ onStartProject }: { onStartProject?: () => void }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const [{ data: proj }, { data: cats }] = await Promise.all([
        supabase.from('projects').select('*').eq('is_published', true).order('created_at'),
        supabase.from('categories').select('*').eq('type', 'portfolio').order('name'),
      ]);
      setProjects(Array.isArray(proj) ? proj : []);
      setCategories(Array.isArray(cats) ? cats : []);
      setLoading(false);
    };
    fetchData();
  }, []);

  const filtered = activeFilter === 'all'
    ? projects
    : projects.filter(p => p.category_id === activeFilter);

  const PROJECT_IMAGES: Record<string, string> = {
    'finedge-banking-platform': 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=600&q=80',
    'healthsync-ai-diagnostics': 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&q=80',
    'logiflow-supply-chain': 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=600&q=80',
    'edutech-lms-platform': 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&q=80',
    'propspace-real-estate': 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600&q=80',
    'retailcore-erp': 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=600&q=80',
  };

  return (
    <section id="portfolio" className="section-padding bg-background">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="text-primary font-semibold text-sm uppercase tracking-widest">Portfolio</span>
          <h2 className="text-3xl md:text-5xl font-display font-bold text-foreground mt-3 mb-5 text-balance">
            Work That Speaks{' '}
            <span className="gradient-text">For Itself</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto text-pretty">
            Real projects, real results. Explore some of our most impactful digital transformations
            across industries and technology stacks.
          </p>
        </div>

        {/* Stats row */}
        <div className="flex flex-wrap justify-center gap-8 mb-12 p-6 rounded-2xl glass border border-border">
          {STATS.map(s => (
            <div key={s.label} className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <s.icon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <div className="text-xl font-display font-bold gradient-text">{s.value}</div>
                <div className="text-xs text-muted-foreground">{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 justify-center mb-10">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${activeFilter === 'all' ? 'bg-primary text-primary-foreground' : 'border border-border text-muted-foreground hover:text-foreground hover:border-primary/40'}`}
          >
            All Projects
          </button>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveFilter(cat.id)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${activeFilter === cat.id ? 'bg-primary text-primary-foreground' : 'border border-border text-muted-foreground hover:text-foreground hover:border-primary/40'}`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Project grid */}
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="rounded-2xl border border-border bg-card h-80 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(project => (
              <div
                key={project.id}
                className="group rounded-2xl border border-border bg-card overflow-hidden hover:border-primary/40 hover:-translate-y-1 transition-all duration-300 flex flex-col h-full"
              >
                {/* Image */}
                <div className="aspect-[4/3] md:aspect-video w-full overflow-hidden bg-muted">
                  <img
                    src={PROJECT_IMAGES[project.slug] || `https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=600&q=80`}
                    alt={project.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>

                {/* Content */}
                <div className="p-5 flex flex-col flex-1">
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {(project.tags || []).slice(0, 3).map(tag => (
                      <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                    ))}
                  </div>
                  <h3 className="font-display font-bold text-foreground mb-2 text-balance">{project.title}</h3>
                  <p className="text-sm text-muted-foreground text-pretty flex-1">{project.description}</p>

                  {project.results && (
                    <div className="mt-3 p-3 rounded-lg bg-primary/5 border border-primary/10">
                      <p className="text-xs text-primary font-medium">{project.results}</p>
                    </div>
                  )}

                  {(project.technologies || []).length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3">
                      {(project.technologies || []).slice(0, 4).map(tech => (
                        <span key={tech} className="text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground">{tech}</span>
                      ))}
                    </div>
                  )}

                  <button className="mt-4 flex items-center gap-1 text-primary text-sm font-medium hover:gap-2 transition-all">
                    View Case Study <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

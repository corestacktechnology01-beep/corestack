import { useState } from 'react';

type TechCategory = 'Frontend' | 'Backend' | 'Database' | 'Cloud' | 'AI';

const TECH_STACK: Record<TechCategory, { name: string; color: string }[]> = {
  Frontend: [
    { name: 'React', color: '#61DAFB' },
    { name: 'Next.js', color: '#ffffff' },
    { name: 'Angular', color: '#DD0031' },
    { name: 'Vue.js', color: '#42b883' },
    { name: 'TypeScript', color: '#3178C6' },
    { name: 'Tailwind CSS', color: '#38BDF8' },
  ],
  Backend: [
    { name: 'Node.js', color: '#339933' },
    { name: 'Python', color: '#3776AB' },
    { name: 'Java', color: '#ED8B00' },
    { name: '.NET', color: '#512BD4' },
    { name: 'Go', color: '#00ADD8' },
    { name: 'FastAPI', color: '#009688' },
  ],
  Database: [
    { name: 'PostgreSQL', color: '#336791' },
    { name: 'MySQL', color: '#4479A1' },
    { name: 'MongoDB', color: '#47A248' },
    { name: 'Redis', color: '#DC382D' },
    { name: 'Firebase', color: '#FFCA28' },
    { name: 'Supabase', color: '#3ECF8E' },
  ],
  Cloud: [
    { name: 'AWS', color: '#FF9900' },
    { name: 'Azure', color: '#0089D6' },
    { name: 'Google Cloud', color: '#4285F4' },
    { name: 'Docker', color: '#2496ED' },
    { name: 'Kubernetes', color: '#326CE5' },
    { name: 'Terraform', color: '#7B42BC' },
  ],
  AI: [
    { name: 'OpenAI', color: '#10A37F' },
    { name: 'TensorFlow', color: '#FF6F00' },
    { name: 'PyTorch', color: '#EE4C2C' },
    { name: 'LangChain', color: '#1C3C3C' },
    { name: 'HuggingFace', color: '#FFD21E' },
    { name: 'Vertex AI', color: '#4285F4' },
  ],
};

const CATEGORIES: TechCategory[] = ['Frontend', 'Backend', 'Database', 'Cloud', 'AI'];

const CATEGORY_COLORS: Record<TechCategory, string> = {
  Frontend: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  Backend: 'bg-green-500/10 text-green-400 border-green-500/20',
  Database: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  Cloud: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  AI: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
};

// Tech initials for visual display (no external icons needed)
function TechBadge({ name, color }: { name: string; color: string }) {
  const initials = name.slice(0, 2).toUpperCase();
  return (
    <div className="group flex flex-col items-center gap-2 p-4 rounded-xl border border-border bg-card hover:border-primary/40 hover:-translate-y-1 transition-all duration-200 cursor-default">
      <div
        className="w-10 h-10 rounded-lg flex items-center justify-center text-xs font-bold font-display"
        style={{ backgroundColor: `${color}18`, color, border: `1px solid ${color}30` }}
      >
        {initials}
      </div>
      <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors text-center whitespace-nowrap">{name}</span>
    </div>
  );
}

export default function TechnologiesSection() {
  const [active, setActive] = useState<TechCategory>('Frontend');

  return (
    <section id="technologies" className="section-padding bg-muted/30">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="text-primary font-semibold text-sm uppercase tracking-widest">Tech Stack</span>
          <h2 className="text-3xl md:text-5xl font-display font-bold text-foreground mt-3 mb-5 text-balance">
            Powered by Modern{' '}
            <span className="gradient-text">Technologies</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto text-pretty">
            We work with the world's leading technologies to build solutions that are
            fast, scalable, secure, and built to last.
          </p>
        </div>

        {/* Category tabs */}
        <div className="flex flex-wrap gap-2 justify-center mb-10">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActive(cat)}
              className={`px-5 py-2 rounded-full text-sm font-medium border transition-all ${
                active === cat
                  ? CATEGORY_COLORS[cat]
                  : 'border-border text-muted-foreground hover:text-foreground'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Tech grid */}
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4 max-w-3xl mx-auto">
          {TECH_STACK[active].map(tech => (
            <TechBadge key={tech.name} {...tech} />
          ))}
        </div>

        {/* Bottom note */}
        <p className="text-center text-sm text-muted-foreground mt-10">
          And many more — we evaluate and adopt the right tool for each unique project requirement.
        </p>
      </div>
    </section>
  );
}

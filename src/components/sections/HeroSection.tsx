import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Play } from 'lucide-react';
import BookConsultationModal from '@/components/modals/BookConsultationModal';
import CelestialOrbCanvas from '@/components/ui/celestial-orb-canvas';

const STATS = [
  { value: 500, suffix: '+', label: 'Projects Delivered' },
  { value: 200, suffix: '+', label: 'Enterprise Clients' },
  { value: 50, suffix: '+', label: 'Expert Engineers' },
  { value: 12, suffix: '+', label: 'Countries Served' },
];

function useCountUp(target: number, duration = 2000, start = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime: number | null = null;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration, start]);
  return count;
}

function StatCounter({ value, suffix, label, start }: { value: number; suffix: string; label: string; start: boolean }) {
  const count = useCountUp(value, 2200, start);
  return (
    <div className="text-center">
      <div className="text-3xl md:text-4xl font-display font-bold gradient-text">
        {count}{suffix}
      </div>
      <div className="text-sm text-muted-foreground mt-1">{label}</div>
    </div>
  );
}

export default function HeroSection() {
  const statsRef = useRef<HTMLDivElement>(null);
  const [statsVisible, setStatsVisible] = useState(false);
  const [consultOpen, setConsultOpen] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setStatsVisible(true); },
      { threshold: 0.3 }
    );
    if (statsRef.current) observer.observe(statsRef.current);
    return () => observer.disconnect();
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-[#05050a] dark:bg-[#05050a]">
      {/* Canvas particle animation — base layer */}
      <CelestialOrbCanvas />

      {/* Radial gradient overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          zIndex: 1,
          background:
            'radial-gradient(ellipse 80% 60% at 50% -10%, hsl(25 100% 50% / 0.12) 0%, transparent 70%), radial-gradient(ellipse 60% 40% at 80% 80%, hsl(43 100% 60% / 0.06) 0%, transparent 60%)',
        }}
      />
      {/* Subtle grid pattern */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.025]"
        style={{
          zIndex: 1,
          backgroundImage:
            'linear-gradient(hsl(var(--border)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--border)) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      {/* ── Main content ────────────────────────────────────────────────────── */}
      <div className="relative z-10 flex flex-col items-center text-center px-4 w-full max-w-4xl mx-auto py-28 md:py-0 md:pt-28 md:pb-16">

        {/* Trust badge */}
        <div
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/5 text-primary text-sm font-medium mb-7 animate-fade-in"
          style={{ animationDelay: '80ms' }}
        >
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          Trusted by 200+ Enterprises Worldwide
        </div>

        {/* Main heading */}
        <h1
          className="text-4xl md:text-6xl lg:text-7xl font-display font-bold text-foreground leading-[1.08] tracking-tight mb-6 text-balance animate-fade-in"
          style={{ animationDelay: '160ms' }}
        >
          Building{' '}
          <span className="gradient-text">Intelligent</span>
          <br />
          Digital Solutions
          <br />
          <span className="text-muted-foreground">for Tomorrow</span>
        </h1>

        {/* Description */}
        <p
          className="text-base md:text-lg text-muted-foreground max-w-xl mx-auto mb-10 text-pretty leading-relaxed animate-fade-in"
          style={{ animationDelay: '240ms' }}
        >
          CoreStack Technology delivers world-class software, AI, and cloud solutions that transform
          enterprises into digital-first organizations. From concept to scale — we build what others can't.
        </p>

        {/* CTA buttons */}
        <div
          className="flex flex-col sm:flex-row gap-3 justify-center mb-16 animate-fade-in"
          style={{ animationDelay: '320ms' }}
        >
          <Button
            size="lg"
            className="h-12 px-8 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-base animate-pulse-glow"
            onClick={() => scrollTo('contact')}
          >
            Get Started
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
          <Button
            size="lg"
            variant="ghost"
            className="h-12 px-8 border border-white/10 text-foreground hover:bg-white/5 font-semibold text-base"
            onClick={() => setConsultOpen(true)}
          >
            <Play className="w-4 h-4 mr-2" />
            Book Consultation
          </Button>
        </div>

        {/* Animated stats */}
        <div
          ref={statsRef}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-10 w-full max-w-3xl mx-auto px-6 py-6 md:py-8 rounded-2xl border border-white/[0.07] bg-white/[0.03] backdrop-blur-md animate-fade-in"
          style={{ animationDelay: '400ms' }}
        >
          {STATS.map(stat => (
            <StatCounter key={stat.label} {...stat} start={statsVisible} />
          ))}
        </div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none bg-gradient-to-t from-background to-transparent" style={{ zIndex: 2 }} />

      <BookConsultationModal open={consultOpen} onClose={() => setConsultOpen(false)} />
    </section>
  );
}

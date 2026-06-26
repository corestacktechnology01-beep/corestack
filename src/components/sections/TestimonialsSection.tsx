import { useState, useEffect } from 'react';
import { supabase } from '@/db/supabase';
import type { Testimonial } from '@/types/types';
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react';

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={`w-4 h-4 ${i < rating ? 'text-primary fill-primary' : 'text-muted'}`}
        />
      ))}
    </div>
  );
}

function Avatar({ name, url }: { name: string; url?: string | null }) {
  if (url) return <img src={url} alt={name} className="w-12 h-12 rounded-full object-cover border-2 border-primary/20" />;
  const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  return (
    <div className="w-12 h-12 rounded-full bg-primary/20 border-2 border-primary/30 flex items-center justify-center text-primary font-bold text-sm">
      {initials}
    </div>
  );
}

const FALLBACK_TESTIMONIALS: Testimonial[] = [
  { id: '1', client_name: 'James Richardson', client_position: 'CTO', company_name: 'FinEdge Capital', review_text: "CoreStack transformed our legacy banking system into a cloud-native platform. We saw a 40% reduction in operational costs within 6 months.", rating: 5, is_featured: true, is_active: true, sort_order: 1, company_logo_url: null, avatar_url: null, created_at: '' },
  { id: '2', client_name: 'Priya Mehta', client_position: 'VP of Engineering', company_name: 'HealthSync India', review_text: "The AI diagnostic tool CoreStack built processes over 10,000 patient records daily with 98.7% accuracy. Outstanding technical execution.", rating: 5, is_featured: true, is_active: true, sort_order: 2, company_logo_url: null, avatar_url: null, created_at: '' },
  { id: '3', client_name: 'Carlos Vega', client_position: 'CEO', company_name: 'LogiFlow Solutions', review_text: "Our supply chain visibility improved dramatically after CoreStack built our real-time tracking platform. The mobile app is now used by 5,000+ drivers daily.", rating: 5, is_featured: true, is_active: true, sort_order: 3, company_logo_url: null, avatar_url: null, created_at: '' },
];

export default function TestimonialsSection() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>(FALLBACK_TESTIMONIALS);
  const [current, setCurrent] = useState(0);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    supabase
      .from('testimonials')
      .select('*')
      .eq('is_active', true)
      .order('sort_order')
      .then(({ data }) => {
        if (data && data.length > 0) setTestimonials(data);
      });
  }, []);

  const navigate = (dir: 1 | -1) => {
    if (animating) return;
    setAnimating(true);
    setTimeout(() => {
      setCurrent(i => (i + dir + testimonials.length) % testimonials.length);
      setAnimating(false);
    }, 250);
  };

  useEffect(() => {
    const interval = setInterval(() => navigate(1), 5000);
    return () => clearInterval(interval);
  }, [testimonials.length, animating]);

  const t = testimonials[current];

  return (
    <section id="testimonials" className="section-padding bg-background">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="text-primary font-semibold text-sm uppercase tracking-widest">Testimonials</span>
          <h2 className="text-3xl md:text-5xl font-display font-bold text-foreground mt-3 mb-5 text-balance">
            What Our Clients{' '}
            <span className="gradient-text">Say About Us</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Trusted by enterprise leaders across 12 countries. Here's what they have to say.
          </p>
        </div>

        {/* Main testimonial */}
        <div className="max-w-4xl mx-auto">
          <div className={`relative p-8 md:p-12 rounded-3xl border border-border bg-card transition-opacity duration-250 ${animating ? 'opacity-0' : 'opacity-100'}`}>
            <Quote className="absolute top-8 right-8 w-16 h-16 text-primary/10" />
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <div className="shrink-0">
                <Avatar name={t.client_name} url={t.avatar_url} />
              </div>
              <div className="min-w-0 flex-1">
                <StarRating rating={t.rating} />
                <blockquote className="text-lg md:text-xl text-foreground mt-4 mb-5 leading-relaxed text-pretty font-medium">
                  "{t.review_text}"
                </blockquote>
                <div>
                  <div className="font-display font-bold text-foreground">{t.client_name}</div>
                  <div className="text-sm text-muted-foreground">
                    {t.client_position}{t.company_name ? ` · ${t.company_name}` : ''}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <button
              onClick={() => navigate(-1)}
              className="w-10 h-10 rounded-full border border-border bg-card hover:border-primary/40 flex items-center justify-center transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-muted-foreground" />
            </button>

            {/* Dots */}
            <div className="flex gap-2">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className={`rounded-full transition-all duration-300 ${i === current ? 'w-8 h-2 bg-primary' : 'w-2 h-2 bg-border hover:bg-muted-foreground'}`}
                />
              ))}
            </div>

            <button
              onClick={() => navigate(1)}
              className="w-10 h-10 rounded-full border border-border bg-card hover:border-primary/40 flex items-center justify-center transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* Mini testimonials row */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-12">
          {testimonials.slice(0, 3).map((t2, i) => (
            <div
              key={t2.id}
              onClick={() => setCurrent(i)}
              className={`p-5 rounded-xl border transition-all duration-200 cursor-pointer ${i === current ? 'border-primary/50 bg-primary/5' : 'border-border bg-card hover:border-primary/30'}`}
            >
              <div className="flex items-center gap-3 mb-3">
                <Avatar name={t2.client_name} url={t2.avatar_url} />
                <div className="min-w-0">
                  <div className="font-semibold text-sm text-foreground truncate">{t2.client_name}</div>
                  <div className="text-xs text-muted-foreground truncate">{t2.company_name}</div>
                </div>
              </div>
              <StarRating rating={t2.rating} />
              <p className="text-sm text-muted-foreground mt-2 line-clamp-2 text-pretty">{t2.review_text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

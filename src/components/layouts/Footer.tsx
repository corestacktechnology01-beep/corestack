import { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/db/supabase';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Twitter, Linkedin, Github, Instagram, Send, ArrowRight } from 'lucide-react';

const FOOTER_LINKS = {
  Company: [
    { label: 'About Us', href: '#about' },
    { label: 'Portfolio', href: '#portfolio' },
    { label: 'Testimonials', href: '#testimonials' },
    { label: 'Careers', href: '#careers' },
    { label: 'Contact', href: '#contact' },
  ],
  Services: [
    { label: 'Custom Software', href: '#services' },
    { label: 'Web Development', href: '#services' },
    { label: 'Mobile Apps', href: '#services' },
    { label: 'AI & ML Solutions', href: '#services' },
    { label: 'Cloud Solutions', href: '#services' },
  ],
  Products: [
    { label: 'StackFlow ERP', href: '#products' },
    { label: 'CoreCRM Pro', href: '#products' },
    { label: 'DeployIQ Platform', href: '#products' },
    { label: 'Pricing Plans', href: '#pricing' },
  ],
};

const SOCIAL = [
  { icon: Twitter, href: 'https://twitter.com/corestacktech', label: 'Twitter' },
  { icon: Linkedin, href: 'https://linkedin.com/company/corestacktech', label: 'LinkedIn' },
  { icon: Github, href: 'https://github.com/corestacktech', label: 'GitHub' },
  { icon: Instagram, href: 'https://instagram.com/corestacktech', label: 'Instagram' },
];

export default function Footer() {
  const [email, setEmail] = useState('');

  const scrollTo = (href: string) => {
    if (href.startsWith('#')) {
      document.getElementById(href.slice(1))?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    try {
      const { error } = await supabase.from('newsletter_subscribers').insert({ email });
      if (error?.code === '23505') { toast.info('Already subscribed!'); return; }
      if (error) throw error;
      toast.success('You\'re now subscribed to CoreStack insights!');
      setEmail('');
    } catch {
      toast.error('Subscription failed. Please try again.');
    }
  };

  return (
    <footer className="bg-background border-t border-border">


      {/* Main footer */}
      <div className="container mx-auto px-4 max-w-7xl py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand column */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-display font-bold text-sm">CS</span>
              </div>
              <span className="font-display font-bold text-foreground text-lg">CoreStack Technology</span>
            </div>
            <p className="text-sm text-muted-foreground mb-2 text-pretty max-w-xs">
              Building Intelligent Digital Solutions for Tomorrow. Your trusted technology partner
              for enterprise software, AI, and cloud solutions.
            </p>
            <p className="text-xs text-muted-foreground mb-5">
              📍 Khopoli, Maharashtra, India
            </p>

            {/* Newsletter */}
            <p className="text-xs text-muted-foreground mb-2 font-medium uppercase tracking-wide">Newsletter</p>
            <form onSubmit={handleSubscribe} className="flex gap-2 max-w-xs">
              <Input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="flex-1 h-9 text-sm bg-muted/50"
                required
              />
              <Button type="submit" size="sm" className="shrink-0 h-9 px-3 bg-primary hover:bg-primary/90 text-primary-foreground">
                <Send className="w-3.5 h-3.5" />
              </Button>
            </form>

            {/* Social */}
            <div className="flex items-center gap-2 mt-5">
              {SOCIAL.map(s => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="w-8 h-8 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors"
                >
                  <s.icon className="w-3.5 h-3.5" />
                </a>
              ))}
            </div>
          </div>

          {/* Links columns */}
          {Object.entries(FOOTER_LINKS).map(([title, links]) => (
            <div key={title}>
              <h4 className="font-display font-semibold text-foreground mb-4 text-sm uppercase tracking-wide">{title}</h4>
              <ul className="space-y-2.5">
                {links.map(link => (
                  <li key={link.label}>
                    <button
                      onClick={() => scrollTo(link.href)}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors text-left"
                    >
                      {link.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
          <p>© 2025 CoreStack Technology. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-foreground transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-foreground transition-colors">Cookie Policy</a>
            <Link to="/admin/login" className="hover:text-foreground transition-colors">Admin</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

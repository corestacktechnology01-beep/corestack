import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, X, ChevronDown, LogIn, Cpu, BriefcaseIcon, GraduationCap } from 'lucide-react';

const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about' },
  { label: 'Services', href: '/services' },
  { label: 'Portfolio', href: '/portfolio' },
  { label: 'Contact', href: '#contact' },
];

const CAREERS_DROPDOWN = [
  { label: 'Technologies', href: '/careers/technologies', icon: Cpu },
  { label: 'Job Positions', href: '/careers/jobs', icon: BriefcaseIcon },
  { label: 'Internships', href: '/careers/internships', icon: GraduationCap },
];

function Logo() {
  return (
    <Link to="/" className="flex items-center">
      <img
        src="public/Logo.png"
        alt="CoreStack Technology"
        className="h-10 w-auto object-contain"
      />
    </Link>
  );
}

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [careersOpen, setCareersOpen] = useState(false);
  const careersRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => { document.documentElement.classList.add('dark'); }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (careersRef.current && !careersRef.current.contains(e.target as Node)) {
        setCareersOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleNav = (href: string) => {
    setMobileOpen(false);
    setCareersOpen(false);
    if (href === '/') { navigate('/'); window.scrollTo({ top: 0, behavior: 'smooth' }); return; }
    if (href.startsWith('/')) { navigate(href); return; }
    if (location.pathname === '/') {
      document.getElementById(href.slice(1))?.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigate('/');
      setTimeout(() => document.getElementById(href.slice(1))?.scrollIntoView({ behavior: 'smooth' }), 350);
    }
  };

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'glass border-b border-border py-2' : 'bg-transparent py-2'}`}>
      <div className="container mx-auto px-4 max-w-7xl flex items-center justify-between">
        <Logo />

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-1">
          {NAV_LINKS.map(link => (
            <button
              key={link.label}
              onClick={() => handleNav(link.href)}
              className="px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-muted/50"
            >
              {link.label}
            </button>
          ))}

          {/* Careers dropdown */}
          <div ref={careersRef} className="relative">
            <button
              onClick={() => setCareersOpen(v => !v)}
              className="flex items-center gap-1 px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-muted/50"
            >
              Careers <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${careersOpen ? 'rotate-180' : ''}`} />
            </button>
            {careersOpen && (
              <div className="absolute top-full mt-2 left-0 w-52 glass border border-border rounded-xl overflow-hidden shadow-xl z-50">
                {CAREERS_DROPDOWN.map(item => (
                  <button
                    key={item.label}
                    onClick={() => handleNav(item.href)}
                    className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
                  >
                    <item.icon className="w-4 h-4 text-primary shrink-0" />
                    {item.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </nav>

        {/* Desktop actions */}
        <div className="hidden lg:flex items-center gap-2">
          <Button
            size="sm"
            className="gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
            onClick={() => navigate('/login')}
          >
            <LogIn className="w-3.5 h-3.5" /> Login
          </Button>
        </div>

        {/* Mobile hamburger */}
        <div className="flex lg:hidden items-center gap-2">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <button className="w-9 h-9 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="bg-sidebar w-72 border-sidebar-border">
              <div className="flex flex-col h-full">
                <Logo />
                <nav className="flex flex-col gap-1 mt-8 flex-1 overflow-y-auto">
                  {NAV_LINKS.map(link => (
                    <button
                      key={link.label}
                      onClick={() => handleNav(link.href)}
                      className="text-left px-4 py-3 text-sm text-sidebar-foreground hover:text-foreground hover:bg-sidebar-accent rounded-xl transition-colors min-h-12 flex items-center"
                    >
                      {link.label}
                    </button>
                  ))}
                  <div className="px-4 pt-3 pb-1">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Careers</span>
                  </div>
                  {CAREERS_DROPDOWN.map(item => (
                    <button
                      key={item.label}
                      onClick={() => handleNav(item.href)}
                      className="text-left px-4 py-2.5 text-sm text-sidebar-foreground hover:text-foreground hover:bg-sidebar-accent rounded-xl transition-colors min-h-10 flex items-center gap-2.5 ml-2"
                    >
                      <item.icon className="w-4 h-4 text-primary shrink-0" />
                      {item.label}
                    </button>
                  ))}
                </nav>
                <div className="p-4">
                  <Button
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold gap-2"
                    onClick={() => { setMobileOpen(false); navigate('/login'); }}
                  >
                    <LogIn className="w-4 h-4" /> Login
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

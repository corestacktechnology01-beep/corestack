import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
  LayoutDashboard, Users, Briefcase, FolderKanban, Package, Wrench,
  FileText, GraduationCap, ClipboardList, Mail, Image, Star,
  Settings, Search, Activity, MessageSquare, LogOut, Menu, X, ChevronRight,
  Bot, Rocket, Trophy, Award, BarChart3,
} from 'lucide-react';

const NAV_ITEMS = [
  { group: 'Overview', items: [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/admin' },
    { label: 'Activity Logs', icon: Activity, path: '/admin/activity' },
  ]},
  { group: 'Business', items: [
    { label: 'Leads', icon: ClipboardList, path: '/admin/leads' },
    { label: 'Contacts', icon: MessageSquare, path: '/admin/contacts' },
    { label: 'Clients', icon: Briefcase, path: '/admin/clients' },
    { label: 'Projects', icon: FolderKanban, path: '/admin/projects' },
  ]},
  { group: 'Enquiries', items: [
    { label: 'Consultations', icon: MessageSquare, path: '/admin/consultations' },
    { label: 'Product Inquiries', icon: Package, path: '/admin/product-inquiries' },
    { label: 'Project Requests', icon: Rocket, path: '/admin/project-requests' },
    { label: 'AI Chat Logs', icon: Bot, path: '/admin/ai-chats' },
  ]},
  { group: 'Content', items: [
    { label: 'Products', icon: Package, path: '/admin/products' },
    { label: 'Services', icon: Wrench, path: '/admin/services' },
    { label: 'Blog Posts', icon: FileText, path: '/admin/blog' },
    { label: 'Testimonials', icon: Star, path: '/admin/testimonials' },
    { label: 'Media Library', icon: Image, path: '/admin/media' },
  ]},
  { group: 'HR', items: [
    { label: 'Career Positions', icon: GraduationCap, path: '/admin/careers' },
    { label: 'Job Applications', icon: Users, path: '/admin/applications' },
    { label: 'Internship Applications', icon: GraduationCap, path: '/admin/internship-applications' },
    { label: 'Newsletter', icon: Mail, path: '/admin/newsletter' },
  ]},
  { group: 'Challenges & Gamification', items: [
    { label: 'Quiz Questions', icon: GraduationCap, path: '/admin/challenges' },
    { label: 'Leaderboard', icon: Trophy, path: '/admin/leaderboard-mgmt' },
    { label: 'Certificates', icon: Award, path: '/admin/certificates' },
    { label: 'User Scores', icon: BarChart3, path: '/admin/user-scores' },
  ]},
  { group: 'System', items: [
    { label: 'Users', icon: Users, path: '/admin/users' },
    { label: 'SEO Settings', icon: Search, path: '/admin/seo' },
    { label: 'Website Settings', icon: Settings, path: '/admin/settings' },
  ]},
];

function SidebarContent({ onClose }: { onClose?: () => void }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut, profile } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate('/admin/login');
    onClose?.();
  };

  const isActive = (path: string) =>
    path === '/admin' ? location.pathname === '/admin' : location.pathname.startsWith(path);

  return (
    <div className="flex flex-col h-full bg-sidebar text-sidebar-foreground">
      {/* Logo */}
      <div className="p-5 border-b border-sidebar-border flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2" onClick={onClose}>
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-orange-300 flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">CS</span>
          </div>
          <span className="font-display font-bold text-foreground">CoreStack</span>
        </Link>
        {onClose && (
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground md:hidden">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* User badge */}
      <div className="px-4 py-3 border-b border-sidebar-border">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
            <span className="text-primary text-xs font-bold">{(profile?.full_name || profile?.email || 'A')[0].toUpperCase()}</span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-foreground truncate">{profile?.full_name || 'Admin'}</p>
            <p className="text-xs text-muted-foreground capitalize">{profile?.role}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-4">
        {NAV_ITEMS.map(group => (
          <div key={group.group}>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-1">{group.group}</p>
            {group.items.map(item => (
              <Link
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive(item.path) ? 'bg-sidebar-accent text-sidebar-accent-foreground' : 'text-sidebar-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground'}`}
              >
                <item.icon className="w-4 h-4 shrink-0" />
                <span className="flex-1 min-w-0 truncate">{item.label}</span>
                {isActive(item.path) && <ChevronRight className="w-3 h-3 shrink-0 opacity-60" />}
              </Link>
            ))}
          </div>
        ))}
      </nav>

      {/* Sign out */}
      <div className="p-3 border-t border-sidebar-border">
        <Button
          variant="ghost"
          className="w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/10"
          onClick={handleSignOut}
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </Button>
      </div>
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen w-full bg-background">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-64 shrink-0 border-r border-border h-screen sticky top-0">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetTrigger asChild>
          <button className="lg:hidden fixed top-4 left-4 z-40 p-2 rounded-lg bg-card border border-border text-foreground shadow-lg">
            <Menu className="w-5 h-5" />
          </button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-64 bg-sidebar" aria-describedby={undefined}>
          <SidebarContent onClose={() => setMobileOpen(false)} />
        </SheetContent>
      </Sheet>

      {/* Main content */}
      <div className="flex-1 min-w-0 overflow-x-hidden flex flex-col">
        <main className="flex-1 p-4 md:p-6 pl-16 lg:pl-6">
          {children}
        </main>
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, isAdminProfile } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Eye, EyeOff, Shield, Loader2, Mail, Lock, CheckCircle } from 'lucide-react';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const { signInWithEmail, profile, user } = useAuth();
  const navigate = useNavigate();

  // Auto-redirect when profile confirms admin role
  useEffect(() => {
    if (!user || profile === undefined) return;

    if (isAdminProfile(profile, user)) {
      navigate('/admin', { replace: true });
      return;
    }

    toast.error('You do not have admin access. Please sign in with an admin account.');
    setRedirecting(false);
  }, [user, profile, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      toast.error('Please enter your email and password');
      return;
    }
    setLoading(true);
    const { error } = await signInWithEmail(email.trim(), password);
    setLoading(false);
    if (error) {
      toast.error(
        error.message.includes('Email not confirmed')
          ? 'Please verify your email first. Check your inbox.'
          : 'Invalid credentials. Please try again.'
      );
      return;
    }
    // Login succeeded — show redirecting state while profile loads
    setRedirecting(true);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      {/* Background grid */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: 'linear-gradient(hsl(var(--border)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--border)) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />
      <div className="w-full max-w-md relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div><img src="/IMG_3354.PNG" alt="CoreStack Logo" className="mx-auto w-16 h-16 mb-4"/>
            
          </div>
          <h1 className="text-2xl font-display font-bold text-foreground">Admin Portal</h1>
          <p className="text-muted-foreground text-sm mt-1">CoreStack Technology</p>
        </div>

        {/* Card */}
        <div className="glass rounded-2xl border border-border p-8">
          {redirecting ? (
            /* ── Redirecting state ── */
            <div className="text-center py-6">
              <div className="w-14 h-14 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-7 h-7 text-green-400" />
              </div>
              <h2 className="text-lg font-display font-bold text-foreground mb-2">Login Successful</h2>
              <p className="text-sm text-muted-foreground mb-4">Redirecting to Admin Dashboard…</p>
              <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin mx-auto" />
            </div>
          ) : (
            /* ── Login form ── */
            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-2">
                <Label className="text-sm font-normal text-muted-foreground">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="admin@example.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="pl-9 h-11 bg-muted/50 border-border focus:border-primary"
                    autoComplete="email"
                    disabled={loading}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-normal text-muted-foreground">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="pl-9 pr-10 h-11 bg-muted/50 border-border focus:border-primary"
                    autoComplete="current-password"
                    disabled={loading}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <Button
                type="submit"
                className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
                disabled={loading}
              >
                {loading
                  ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Signing in…</>
                  : 'Sign In to Dashboard'
                }
              </Button>
              <p className="text-center text-xs text-muted-foreground">
                Restricted access. Authorized personnel only.
              </p>
            </form>
          )}
        </div>

        <p className="text-center text-xs text-muted-foreground mt-4">
          © 2025 CoreStack Technology. All rights reserved.
        </p>
      </div>
    </div>
  );
}

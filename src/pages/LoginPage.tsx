import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Eye, EyeOff, Loader2, Lock, Mail, ArrowLeft, UserPlus, LogIn, Shield, CheckCircle } from 'lucide-react';

// ─── Floating 3D shape ────────────────────────────────────────────────────────
interface Shape {
  id: number;
  x: number; y: number; size: number; opacity: number;
  rx: number; ry: number; rz: number;
  dx: number; dy: number; drx: number; dry: number; drz: number;
  type: 'cube' | 'sphere' | 'ring';
}

function FloatingShapes({ mouseX, mouseY }: { mouseX: number; mouseY: number }) {
  const shapes: Shape[] = [
    { id: 0, x: 10, y: 15, size: 60, opacity: 0.12, rx: 20, ry: 30, rz: 10, dx: 0.008, dy: 0.005, drx: 0.3, dry: 0.4, drz: 0.2, type: 'cube' },
    { id: 1, x: 85, y: 20, size: 80, opacity: 0.10, rx: 45, ry: 10, rz: 25, dx: -0.006, dy: 0.007, drx: 0.2, dry: 0.3, drz: 0.4, type: 'sphere' },
    { id: 2, x: 75, y: 70, size: 50, opacity: 0.14, rx: 60, ry: 20, rz: 40, dx: 0.005, dy: -0.008, drx: 0.4, dry: 0.2, drz: 0.3, type: 'ring' },
    { id: 3, x: 15, y: 75, size: 70, opacity: 0.09, rx: 10, ry: 50, rz: 15, dx: -0.007, dy: 0.006, drx: 0.25, dry: 0.35, drz: 0.15, type: 'cube' },
    { id: 4, x: 50, y: 5, size: 40, opacity: 0.11, rx: 30, ry: 40, rz: 50, dx: 0.004, dy: 0.009, drx: 0.35, dry: 0.25, drz: 0.45, type: 'sphere' },
    { id: 5, x: 90, y: 50, size: 55, opacity: 0.08, rx: 55, ry: 25, rz: 35, dx: -0.005, dy: -0.006, drx: 0.15, dry: 0.45, drz: 0.25, type: 'ring' },
  ];

  const parallax = (depth: number) => ({
    transform: `translate(${(mouseX - 50) * depth * 0.03}px, ${(mouseY - 50) * depth * 0.03}px)`,
  });

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {shapes.map((s, i) => (
        <div
          key={s.id}
          className="absolute transition-transform duration-700 ease-out"
          style={{ left: `${s.x}%`, top: `${s.y}%`, ...parallax(i % 3 + 1) }}
        >
          {s.type === 'cube' && (
            <div
              className="border-2 border-primary/30 rounded-lg"
              style={{
                width: s.size, height: s.size, opacity: s.opacity,
                transform: `rotateX(${s.rx + mouseX * 0.1}deg) rotateY(${s.ry + mouseY * 0.1}deg) rotateZ(${s.rz}deg)`,
                background: 'linear-gradient(135deg, hsl(var(--primary)/0.15), transparent)',
                boxShadow: `0 0 ${s.size / 2}px hsl(var(--primary)/0.2)`,
              }}
            />
          )}
          {s.type === 'sphere' && (
            <div
              className="rounded-full border border-primary/20"
              style={{
                width: s.size, height: s.size, opacity: s.opacity,
                background: 'radial-gradient(circle at 30% 30%, hsl(var(--primary)/0.3), hsl(var(--primary)/0.05))',
                boxShadow: `0 0 ${s.size}px hsl(var(--primary)/0.15), inset 0 0 ${s.size / 2}px hsl(var(--primary)/0.1)`,
                transform: `translate(${mouseX * 0.05}px, ${mouseY * 0.05}px)`,
              }}
            />
          )}
          {s.type === 'ring' && (
            <div
              className="rounded-full border-2 border-primary/25"
              style={{
                width: s.size, height: s.size, opacity: s.opacity,
                transform: `rotateX(${70 + mouseX * 0.05}deg) rotateZ(${s.rz + mouseY * 0.05}deg)`,
                boxShadow: `0 0 ${s.size / 3}px hsl(var(--primary)/0.3)`,
              }}
            />
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Login / Sign Up Page ─────────────────────────────────────────────────────
type AuthMode = 'login' | 'signup';

export default function LoginPage() {
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  const [mouseX, setMouseX] = useState(50);
  const [mouseY, setMouseY] = useState(50);
  const { signInWithEmail, signUpWithEmail } = useAuth();
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      setMouseX((e.clientX / window.innerWidth) * 100);
      setMouseY((e.clientY / window.innerHeight) * 100);
    };
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  const switchMode = (m: AuthMode) => {
    setMode(m);
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setVerificationSent(false);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) { toast.error('Please enter your email and password'); return; }
    setLoading(true);
    const { error } = await signInWithEmail(email.trim(), password);
    setLoading(false);
    if (error) {
      toast.error(error.message.includes('Email not confirmed')
        ? 'Please verify your email first. Check your inbox.'
        : 'Invalid credentials. Please try again.');
      return;
    }
    toast.success('Welcome back!');
    navigate('/', { replace: true });
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) { toast.error('Please fill in all fields'); return; }
    if (password.length < 8) { toast.error('Password must be at least 8 characters'); return; }
    if (password !== confirmPassword) { toast.error('Passwords do not match'); return; }
    setLoading(true);
    const { error } = await signUpWithEmail(email.trim(), password);
    setLoading(false);
    if (error) {
      toast.error(error.message || 'Sign up failed. Please try again.');
      return;
    }
    setVerificationSent(true);
  };

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden"
    >
      {/* Background grid */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(hsl(var(--border)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--border)) 1px, transparent 1px)',
          backgroundSize: '60px 60px', opacity: 0.04,
        }}
      />

      {/* Animated gradient orbs */}
      <div className="fixed inset-0 pointer-events-none">
        <div
          className="absolute w-96 h-96 rounded-full opacity-20 blur-3xl transition-all duration-1000"
          style={{
            background: 'radial-gradient(circle, hsl(var(--primary)) 0%, transparent 70%)',
            left: `${mouseX * 0.3}%`, top: `${mouseY * 0.2}%`,
            transform: 'translate(-50%, -50%)',
          }}
        />
        <div
          className="absolute w-64 h-64 rounded-full opacity-15 blur-3xl transition-all duration-1500"
          style={{
            background: 'radial-gradient(circle, hsl(270 80% 60%) 0%, transparent 70%)',
            right: `${mouseX * 0.2}%`, bottom: `${mouseY * 0.25}%`,
            transform: 'translate(50%, 50%)',
          }}
        />
      </div>

      {/* 3D floating shapes */}
      <FloatingShapes mouseX={mouseX} mouseY={mouseY} />

      {/* Back to Home */}
      <Link
        to="/"
        className="fixed top-6 left-6 z-20 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
        Back to Home
      </Link>

      {/* Admin login link */}
      <Link
        to="/admin/login"
        className="fixed top-6 right-6 z-20 flex items-center gap-2 text-xs text-muted-foreground hover:text-primary transition-colors group px-3 py-1.5 rounded-lg border border-border/50 hover:border-primary/40 bg-card/30 backdrop-blur-sm"
      >
        <Shield className="w-3.5 h-3.5 group-hover:text-primary transition-colors" />
        Admin
      </Link>

      {/* Card */}
      <div
        className="w-full max-w-md relative z-10 transition-all duration-300"
        style={{
          transform: `perspective(1000px) rotateX(${(mouseY - 50) * 0.02}deg) rotateY(${(mouseX - 50) * 0.02}deg)`,
        }}
      >
        {/* Card glow */}
        <div
          className="absolute inset-0 rounded-3xl opacity-30 blur-xl"
          style={{ background: 'linear-gradient(135deg, hsl(var(--primary)/0.4), hsl(270 80% 60%/0.2))' }}
        />

        <div
          className="relative glass rounded-3xl border border-border/60 p-8 md:p-10 shadow-2xl"
          style={{ backdropFilter: 'blur(40px)' }}
        >
          {/* Logo */}
          <div className="text-center mb-6">
            <div className="relative inline-flex mb-4">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center"
                
              >
                <img src="public/IMG_3354.PNG" alt="CoreStack Logo" className="w-15 h-15" />
              </div>
              <div
               
              />
            </div>
            <h1 className="text-xl font-display font-bold text-foreground">CoreStack Technology</h1>
          </div>

          {/* Tabs */}
          <div className="flex rounded-xl border border-border bg-muted/30 p-1 mb-6">
            <button
              type="button"
              onClick={() => switchMode('login')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${mode === 'login' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
            >
              <LogIn className="w-3.5 h-3.5" /> Sign In
            </button>
            <button
              type="button"
              onClick={() => switchMode('signup')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${mode === 'signup' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
            >
              <UserPlus className="w-3.5 h-3.5" /> Sign Up
            </button>
          </div>

          {/* Email verification success */}
          {verificationSent ? (
            <div className="text-center py-6">
              <div className="w-14 h-14 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-7 h-7 text-green-400" />
              </div>
              <h2 className="text-lg font-display font-bold text-foreground mb-2">Check Your Email</h2>
              <p className="text-sm text-muted-foreground text-pretty mb-5">
                We've sent a verification link to <strong className="text-foreground">{email}</strong>.
                Click the link in the email to activate your account.
              </p>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => switchMode('login')}
              >
                Back to Sign In
              </Button>
            </div>
          ) : mode === 'login' ? (
            /* ── Login form ── */
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-sm font-normal text-muted-foreground">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="pl-9 h-11 bg-muted/30 border-border/60 focus:border-primary"
                    autoComplete="email"
                    disabled={loading}
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm font-normal text-muted-foreground">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="pl-9 pr-10 h-11 bg-muted/30 border-border/60 focus:border-primary"
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
                disabled={loading}
                className="w-full h-11 font-semibold text-primary-foreground relative overflow-hidden group"
                style={{ background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(25 100% 65%))' }}
              >
                <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors" />
                {loading
                  ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Signing in…</>
                  : 'Sign In'
                }
              </Button>

              <p className="text-center text-xs text-muted-foreground">
                Don't have an account?{' '}
                <button type="button" onClick={() => switchMode('signup')} className="text-primary hover:underline font-medium">
                  Create one
                </button>
              </p>
            </form>
          ) : (
            /* ── Sign Up form ── */
            <form onSubmit={handleSignUp} className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-sm font-normal text-muted-foreground">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="pl-9 h-11 bg-muted/30 border-border/60 focus:border-primary"
                    autoComplete="email"
                    disabled={loading}
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm font-normal text-muted-foreground">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Min. 8 characters"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="pl-9 pr-10 h-11 bg-muted/30 border-border/60 focus:border-primary"
                    autoComplete="new-password"
                    disabled={loading}
                    required
                    minLength={8}
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

              <div className="space-y-1.5">
                <Label className="text-sm font-normal text-muted-foreground">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type={showConfirm ? 'text' : 'password'}
                    placeholder="Repeat your password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    className="pl-9 pr-10 h-11 bg-muted/30 border-border/60 focus:border-primary"
                    autoComplete="new-password"
                    disabled={loading}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <p className="text-xs text-muted-foreground bg-primary/5 border border-primary/15 rounded-lg px-3 py-2">
                📧 A verification email will be sent after registration. You must verify before signing in.
              </p>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-11 font-semibold text-primary-foreground relative overflow-hidden group"
                style={{ background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(25 100% 65%))' }}
              >
                <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors" />
                {loading
                  ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Creating account…</>
                  : <><UserPlus className="w-4 h-4 mr-2" />Create Account</>
                }
              </Button>

              <p className="text-center text-xs text-muted-foreground">
                Already have an account?{' '}
                <button type="button" onClick={() => switchMode('login')} className="text-primary hover:underline font-medium">
                  Sign in
                </button>
              </p>
            </form>
          )}

          <p className="text-center text-xs text-muted-foreground mt-5">
            🔒 Secured with Supabase Auth &amp; JWT
          </p>
        </div>
      </div>
    </div>
  );
}

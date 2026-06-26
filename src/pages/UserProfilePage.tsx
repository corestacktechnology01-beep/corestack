import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/layouts/Header';
import Footer from '@/components/layouts/Footer';
import BackButton from '@/components/ui/BackButton';
import { supabase } from '@/db/supabase';
import {
  Trophy, Star, Award, Download, QrCode, Calendar,
  BarChart3, Clock, Zap, ChevronRight, Shield,
} from 'lucide-react';
import QRCode from 'qrcode';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const BADGE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  Elite:    { bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500/30' },
  Master:   { bg: 'bg-purple-500/20', text: 'text-purple-400', border: 'border-purple-500/30' },
  Expert:   { bg: 'bg-blue-500/20',   text: 'text-blue-400',   border: 'border-blue-500/30'   },
  Advanced: { bg: 'bg-cyan-500/20',   text: 'text-cyan-400',   border: 'border-cyan-500/30'   },
  Skilled:  { bg: 'bg-green-500/20',  text: 'text-green-400',  border: 'border-green-500/30'  },
  Learner:  { bg: 'bg-amber-500/20',  text: 'text-amber-400',  border: 'border-amber-500/30'  },
  Beginner: { bg: 'bg-muted',         text: 'text-muted-foreground', border: 'border-border'  },
};

interface Profile {
  id: string; full_name: string; avatar_url: string | null;
  total_score: number; badge: string;
}
interface QuizResult {
  id: string; challenge_type: string; score: number;
  total: number; difficulty: string; time_taken: number; created_at: string;
}
interface ChallengeResult {
  id: string; challenge_type: string; score: number;
  max_score: number; created_at: string;
}
interface Certificate {
  id: string; cert_id: string; challenge_name: string;
  score: number; issued_at: string; full_name: string;
}

function StatCard({ icon: Icon, label, value, sub }: { icon: React.ElementType; label: string; value: string | number; sub?: string }) {
  return (
    <div className="p-5 rounded-2xl border border-border bg-card flex items-center gap-4">
      <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
        <Icon className="w-5 h-5 text-primary" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground font-medium">{label}</p>
        <p className="text-xl font-display font-black text-foreground leading-tight">{value}</p>
        {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
      </div>
    </div>
  );
}

// ─── Certificate card (also used for PDF export) ──────────────────────────────
function CertCard({ cert, onDownload }: { cert: Certificate; onDownload: (cert: Certificate) => void }) {
  return (
    <div className="p-5 rounded-2xl border border-primary/20 bg-primary/5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
        <Award className="w-6 h-6 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-display font-bold text-foreground text-sm">{cert.challenge_name}</p>
        <p className="text-xs text-muted-foreground mt-0.5">
          Score: <span className="text-primary font-semibold">{cert.score}%</span>
          {' · '}{new Date(cert.issued_at).toLocaleDateString()}
          {' · '}<span className="font-mono text-xs">{cert.cert_id}</span>
        </p>
      </div>
      <button onClick={() => onDownload(cert)}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-primary/30 bg-primary/10 text-primary text-xs font-semibold hover:bg-primary/20 transition-all shrink-0">
        <Download className="w-3.5 h-3.5" /> PDF
      </button>
    </div>
  );
}

export default function UserProfilePage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [quizHistory, setQuizHistory] = useState<QuizResult[]>([]);
  const [challengeHistory, setChallengeHistory] = useState<ChallengeResult[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'history' | 'certificates'>('overview');
  const certRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    async function load() {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate('/login'); return; }

      const [profileRes, quizRes, challengeRes, certRes] = await Promise.all([
        supabase.from('user_profiles').select('*').eq('id', user.id).single(),
        supabase.from('quiz_results').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(20),
        supabase.from('challenge_results').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(20),
        supabase.from('certificates').select('*').eq('user_id', user.id).order('issued_at', { ascending: false }),
      ]);

      setProfile(profileRes.data ?? { id: user.id, full_name: user.email?.split('@')[0] ?? 'User', avatar_url: null, total_score: 0, badge: 'Beginner' });
      setQuizHistory(quizRes.data ?? []);
      setChallengeHistory(challengeRes.data ?? []);
      setCertificates(certRes.data ?? []);
      setLoading(false);
    }
    load();
  }, []);

  async function downloadCertPDF(cert: Certificate) {
    const qrDataUrl = await QRCode.toDataURL(`https://corestack.tech/verify/${cert.cert_id}`, { width: 100 });
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    const W = 297, H = 210;

    // Background
    doc.setFillColor(10, 10, 15);
    doc.rect(0, 0, W, H, 'F');

    // Border
    doc.setDrawColor(255, 115, 0);
    doc.setLineWidth(1.5);
    doc.rect(8, 8, W - 16, H - 16, 'S');

    // Title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(32);
    doc.setTextColor(255, 255, 255);
    doc.text('CERTIFICATE OF COMPLETION', W / 2, 45, { align: 'center' });

    doc.setFontSize(14);
    doc.setTextColor(255, 115, 0);
    doc.text('CoreStack Technology', W / 2, 58, { align: 'center' });

    doc.setFontSize(13);
    doc.setTextColor(180, 180, 200);
    doc.text('This is to certify that', W / 2, 78, { align: 'center' });

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(26);
    doc.setTextColor(255, 255, 255);
    doc.text(cert.full_name, W / 2, 93, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(13);
    doc.setTextColor(180, 180, 200);
    doc.text('has successfully completed', W / 2, 107, { align: 'center' });

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.setTextColor(255, 115, 0);
    doc.text(cert.challenge_name, W / 2, 120, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(14);
    doc.setTextColor(255, 255, 255);
    doc.text(`Score: ${cert.score}%`, W / 2, 133, { align: 'center' });

    doc.setFontSize(11);
    doc.setTextColor(130, 130, 150);
    doc.text(`Issued: ${new Date(cert.issued_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, W / 2, 145, { align: 'center' });
    doc.text(`Certificate ID: ${cert.cert_id}`, W / 2, 153, { align: 'center' });

    // QR Code
    doc.addImage(qrDataUrl, 'PNG', W - 50, H - 52, 38, 38);
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 120);
    doc.text('Scan to verify', W - 31, H - 10, { align: 'center' });

    doc.save(`${cert.cert_id}.pdf`);
  }

  const badge = profile?.badge ?? 'Beginner';
  const bc = BADGE_COLORS[badge] ?? BADGE_COLORS.Beginner;

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="mb-6"><BackButton /></div>

          {/* Profile hero */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 p-6 rounded-2xl border border-border bg-card mb-8">
            <div className="w-18 h-18 w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-3xl font-display font-black text-primary shrink-0">
              {profile?.full_name?.charAt(0) ?? 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-display font-bold text-foreground">{profile?.full_name ?? 'User'}</h1>
              <div className="flex flex-wrap items-center gap-3 mt-2">
                <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border ${bc.bg} ${bc.text} ${bc.border}`}>
                  <Shield className="w-3 h-3" />{badge}
                </span>
                <span className="text-sm text-muted-foreground">Total Score: <span className="font-display font-black text-foreground">{(profile?.total_score ?? 0).toLocaleString()}</span></span>
              </div>
            </div>
            <button onClick={() => navigate('/leaderboard')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity shrink-0">
              <Trophy className="w-4 h-4" /> Leaderboard
            </button>
          </div>

          {/* Stat cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <StatCard icon={Star} label="Total Score" value={(profile?.total_score ?? 0).toLocaleString()} />
            <StatCard icon={BarChart3} label="Quizzes Done" value={quizHistory.length} />
            <StatCard icon={Zap} label="Challenges" value={challengeHistory.length} />
            <StatCard icon={Award} label="Certificates" value={certificates.length} />
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6 flex-wrap">
            {(['overview', 'history', 'certificates'] as const).map(t => (
              <button key={t} onClick={() => setActiveTab(t)}
                className={`px-5 py-2.5 rounded-xl border text-sm font-semibold capitalize transition-all ${activeTab === t ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground hover:border-primary/40 hover:text-foreground bg-card'}`}>
                {t}
              </button>
            ))}
          </div>

          {/* Overview tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Progress to next badge */}
              <div className="p-6 rounded-2xl border border-border bg-card">
                <h3 className="font-display font-bold text-foreground mb-4">Badge Progress</h3>
                <div className="flex items-center gap-4">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${bc.bg} ${bc.text} ${bc.border}`}>{badge}</span>
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full transition-all duration-700" style={{ width: `${Math.min(100, (profile?.total_score ?? 0) % 500 / 5)}%` }} />
                  </div>
                  <span className="text-xs text-muted-foreground font-mono">{profile?.total_score ?? 0} pts</span>
                </div>
                <p className="text-xs text-muted-foreground mt-3">
                  Badges: Beginner (0) → Learner (101) → Skilled (301) → Advanced (601) → Expert (1001) → Master (1501) → Elite (2001)
                </p>
              </div>

              {/* Quick navigate to challenges */}
              <div className="p-6 rounded-2xl border border-border bg-card">
                <h3 className="font-display font-bold text-foreground mb-4">Quick Jump to Challenges</h3>
                <div className="grid sm:grid-cols-2 gap-3">
                  {[
                    { label: 'Programming Quiz', path: '/challenges/programming-quiz', color: 'text-orange-400' },
                    { label: 'Aptitude Quiz', path: '/challenges/aptitude-quiz', color: 'text-purple-400' },
                    { label: 'Debug Challenge', path: '/challenges/debug-challenge', color: 'text-red-400' },
                    { label: 'Tech Matching', path: '/challenges/tech-matching', color: 'text-cyan-400' },
                    { label: 'Interview Rapid Fire', path: '/challenges/interview-rapid-fire', color: 'text-green-400' },
                  ].map(c => (
                    <button key={c.path} onClick={() => navigate(c.path)}
                      className="flex items-center justify-between p-3.5 rounded-xl border border-border bg-muted/30 hover:border-primary/40 hover:bg-primary/5 transition-all group">
                      <span className={`text-sm font-semibold ${c.color}`}>{c.label}</span>
                      <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* History tab */}
          {activeTab === 'history' && (
            <div className="space-y-4">
              {[...quizHistory, ...challengeHistory]
                .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                .map(item => {
                  const isQuiz = 'total' in item;
                  const pct = isQuiz ? Math.round(((item as QuizResult).score / (item as QuizResult).total) * 100) : Math.round(((item as ChallengeResult).score / (item as ChallengeResult).max_score) * 100);
                  return (
                    <div key={item.id} className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${pct >= 80 ? 'bg-green-500/10' : pct >= 60 ? 'bg-amber-500/10' : 'bg-red-500/10'}`}>
                        {isQuiz ? <BarChart3 className={`w-5 h-5 ${pct >= 80 ? 'text-green-400' : pct >= 60 ? 'text-amber-400' : 'text-red-400'}`} /> : <Zap className={`w-5 h-5 ${pct >= 80 ? 'text-green-400' : pct >= 60 ? 'text-amber-400' : 'text-red-400'}`} />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground capitalize">{item.challenge_type.replace(/-/g, ' ')}</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-2 mt-0.5">
                          <Calendar className="w-3 h-3" />{new Date(item.created_at).toLocaleDateString()}
                          {isQuiz && <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{Math.floor((item as QuizResult).time_taken / 60)}m {(item as QuizResult).time_taken % 60}s</span>}
                        </p>
                      </div>
                      <span className={`text-sm font-display font-black ${pct >= 80 ? 'text-green-400' : pct >= 60 ? 'text-amber-400' : 'text-red-400'}`}>{pct}%</span>
                    </div>
                  );
                })}
              {quizHistory.length === 0 && challengeHistory.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <BarChart3 className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p className="font-medium">No history yet</p>
                  <p className="text-sm mt-1">Complete a challenge to see your history here.</p>
                </div>
              )}
            </div>
          )}

          {/* Certificates tab */}
          {activeTab === 'certificates' && (
            <div className="space-y-4">
              {certificates.map(cert => (
                <div key={cert.id} ref={el => { certRefs.current[cert.id] = el; }}>
                  <CertCard cert={cert} onDownload={downloadCertPDF} />
                </div>
              ))}
              {certificates.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <Award className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p className="font-medium">No certificates yet</p>
                  <p className="text-sm mt-1">Score 80%+ on any challenge to earn a certificate.</p>
                  <button onClick={() => navigate('/#challenge-hub')}
                    className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity">
                    Take a Challenge <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

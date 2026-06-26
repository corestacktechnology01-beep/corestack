import { useState, useEffect } from 'react';
import Header from '@/components/layouts/Header';
import Footer from '@/components/layouts/Footer';
import BackButton from '@/components/ui/BackButton';
import { supabase } from '@/db/supabase';
import { Trophy, Medal, Star, Crown, Zap, Calendar, RefreshCw } from 'lucide-react';

type Period = 'today' | 'weekly' | 'monthly' | 'alltime';

interface LeaderboardEntry {
  rank: number;
  user_id: string;
  full_name: string;
  score: number;
  badge: string;
  period: Period;
}

const BADGE_COLORS: Record<string, string> = {
  Elite: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  Master: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  Expert: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  Advanced: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
  Skilled: 'bg-green-500/20 text-green-400 border-green-500/30',
  Learner: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  Beginner: 'bg-muted text-muted-foreground border-border',
};

const TABS: { key: Period; label: string; icon: React.ReactNode }[] = [
  { key: 'today', label: 'Today', icon: <Zap className="w-3.5 h-3.5" /> },
  { key: 'weekly', label: 'Weekly', icon: <Calendar className="w-3.5 h-3.5" /> },
  { key: 'monthly', label: 'Monthly', icon: <Star className="w-3.5 h-3.5" /> },
  { key: 'alltime', label: 'All-Time', icon: <Crown className="w-3.5 h-3.5" /> },
];

function RankIcon({ rank }: { rank: number }) {
  if (rank === 1) return <Trophy className="w-5 h-5 text-yellow-400" />;
  if (rank === 2) return <Medal className="w-5 h-5 text-slate-300" />;
  if (rank === 3) return <Medal className="w-5 h-5 text-amber-600" />;
  return <span className="text-sm font-bold font-display text-muted-foreground w-5 text-center">{rank}</span>;
}

// Mock fallback data when DB is empty
const MOCK_DATA: Omit<LeaderboardEntry, 'period'>[] = [
  { rank: 1, user_id: 'u1', full_name: 'Alex Morgan', score: 2450, badge: 'Elite' },
  { rank: 2, user_id: 'u2', full_name: 'Priya Sharma', score: 2100, badge: 'Master' },
  { rank: 3, user_id: 'u3', full_name: 'David Chen', score: 1875, badge: 'Expert' },
  { rank: 4, user_id: 'u4', full_name: 'Sara Kim', score: 1520, badge: 'Advanced' },
  { rank: 5, user_id: 'u5', full_name: 'Liam Torres', score: 1240, badge: 'Advanced' },
  { rank: 6, user_id: 'u6', full_name: 'Aisha Patel', score: 980, badge: 'Skilled' },
  { rank: 7, user_id: 'u7', full_name: 'Marcus Reed', score: 760, badge: 'Skilled' },
  { rank: 8, user_id: 'u8', full_name: 'Nina Johansson', score: 540, badge: 'Learner' },
  { rank: 9, user_id: 'u9', full_name: 'Carlos Diaz', score: 380, badge: 'Learner' },
  { rank: 10, user_id: 'u10', full_name: 'Emily Walsh', score: 210, badge: 'Beginner' },
];

export default function LeaderboardPage() {
  const [period, setPeriod] = useState<Period>('alltime');
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setCurrentUserId(data?.user?.id ?? null));
  }, []);

  useEffect(() => { fetchLeaderboard(); }, [period]);

  async function fetchLeaderboard() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('leaderboard_entries')
        .select('*')
        .eq('period', period)
        .order('score', { ascending: false })
        .limit(100);

      if (error || !data || data.length === 0) {
        // Show mock data with period applied
        setEntries(MOCK_DATA.map(e => ({ ...e, period })));
      } else {
        setEntries(data.map((e, i) => ({ ...e, rank: i + 1 })));
      }
    } catch {
      setEntries(MOCK_DATA.map(e => ({ ...e, period })));
    } finally {
      setLoading(false);
    }
  }

  const top3 = entries.slice(0, 3);
  const rest = entries.slice(3);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="mb-6"><BackButton /></div>

          {/* Hero */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-6">
              <Trophy className="w-3.5 h-3.5 text-primary" />
              <span className="text-primary text-xs font-semibold uppercase tracking-widest">Top Performers</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-display font-bold text-foreground mb-4 text-balance">
              Challenge <span className="gradient-text">Leaderboard</span>
            </h1>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto text-pretty">
              Compete across programming quizzes, aptitude challenges, and more. Climb the ranks and earn elite badges.
            </p>
          </div>

          {/* Tabs */}
          <div className="flex flex-wrap gap-2 justify-center mb-10">
            {TABS.map(t => (
              <button key={t.key} onClick={() => setPeriod(t.key)}
                className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border text-sm font-semibold transition-all ${period === t.key ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground hover:border-primary/40 hover:text-foreground bg-card'}`}>
                {t.icon}{t.label}
              </button>
            ))}
            <button onClick={fetchLeaderboard} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border text-sm font-semibold text-muted-foreground hover:border-primary/40 hover:text-foreground bg-card transition-all">
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center py-24">
              <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <>
              {/* Top 3 Podium */}
              {top3.length > 0 && (
                <div className="flex items-end justify-center gap-4 mb-10">
                  {/* 2nd */}
                  {top3[1] && (
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-14 h-14 rounded-full bg-slate-400/20 border-2 border-slate-400/40 flex items-center justify-center text-xl font-display font-black text-slate-300">
                        {top3[1].full_name.charAt(0)}
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-semibold text-foreground truncate max-w-[80px]">{top3[1].full_name.split(' ')[0]}</p>
                        <p className="text-xs text-muted-foreground font-display font-bold">{top3[1].score.toLocaleString()}</p>
                      </div>
                      <div className="w-20 h-16 rounded-t-xl bg-slate-400/10 border border-slate-400/20 flex items-center justify-center">
                        <Medal className="w-6 h-6 text-slate-300" />
                      </div>
                    </div>
                  )}
                  {/* 1st */}
                  {top3[0] && (
                    <div className="flex flex-col items-center gap-2">
                      <Crown className="w-6 h-6 text-yellow-400" />
                      <div className="w-16 h-16 rounded-full bg-yellow-400/20 border-2 border-yellow-400/40 flex items-center justify-center text-2xl font-display font-black text-yellow-400">
                        {top3[0].full_name.charAt(0)}
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-semibold text-foreground truncate max-w-[80px]">{top3[0].full_name.split(' ')[0]}</p>
                        <p className="text-xs text-yellow-400 font-display font-bold">{top3[0].score.toLocaleString()}</p>
                      </div>
                      <div className="w-20 h-24 rounded-t-xl bg-yellow-400/10 border border-yellow-400/20 flex items-center justify-center">
                        <Trophy className="w-7 h-7 text-yellow-400" />
                      </div>
                    </div>
                  )}
                  {/* 3rd */}
                  {top3[2] && (
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-14 h-14 rounded-full bg-amber-700/20 border-2 border-amber-700/40 flex items-center justify-center text-xl font-display font-black text-amber-600">
                        {top3[2].full_name.charAt(0)}
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-semibold text-foreground truncate max-w-[80px]">{top3[2].full_name.split(' ')[0]}</p>
                        <p className="text-xs text-muted-foreground font-display font-bold">{top3[2].score.toLocaleString()}</p>
                      </div>
                      <div className="w-20 h-10 rounded-t-xl bg-amber-700/10 border border-amber-700/20 flex items-center justify-center">
                        <Medal className="w-5 h-5 text-amber-600" />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Full table */}
              <div className="rounded-2xl border border-border bg-card overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border bg-muted/30">
                        <th className="text-left px-5 py-3.5 text-xs font-semibold uppercase tracking-widest text-muted-foreground whitespace-nowrap">Rank</th>
                        <th className="text-left px-5 py-3.5 text-xs font-semibold uppercase tracking-widest text-muted-foreground whitespace-nowrap">Name</th>
                        <th className="text-left px-5 py-3.5 text-xs font-semibold uppercase tracking-widest text-muted-foreground whitespace-nowrap">Badge</th>
                        <th className="text-right px-5 py-3.5 text-xs font-semibold uppercase tracking-widest text-muted-foreground whitespace-nowrap">Score</th>
                      </tr>
                    </thead>
                    <tbody>
                      {entries.map(entry => {
                        const isMe = entry.user_id === currentUserId;
                        return (
                          <tr key={entry.user_id + entry.period}
                            className={`border-b border-border/50 last:border-0 transition-colors ${isMe ? 'bg-primary/5' : 'hover:bg-muted/30'}`}>
                            <td className="px-5 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-1">
                                <RankIcon rank={entry.rank} />
                              </div>
                            </td>
                            <td className="px-5 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold font-display shrink-0 ${isMe ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}`}>
                                  {entry.full_name.charAt(0)}
                                </div>
                                <span className={`text-sm font-medium ${isMe ? 'text-primary font-semibold' : 'text-foreground'}`}>
                                  {entry.full_name} {isMe && <span className="text-xs">(you)</span>}
                                </span>
                              </div>
                            </td>
                            <td className="px-5 py-4 whitespace-nowrap">
                              <span className={`inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full border ${BADGE_COLORS[entry.badge] ?? BADGE_COLORS.Beginner}`}>
                                {entry.badge}
                              </span>
                            </td>
                            <td className="px-5 py-4 whitespace-nowrap text-right">
                              <span className="text-sm font-display font-bold text-foreground">{entry.score.toLocaleString()}</span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

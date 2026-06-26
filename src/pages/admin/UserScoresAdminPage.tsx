import { useState, useEffect } from 'react';
import { supabase } from '@/db/supabase';
import { BarChart3, RefreshCw, Search, DownloadCloud, Trophy, Star, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

interface UserScore {
  id: string;
  full_name: string;
  email: string;
  total_score: number;
  badge: string;
  quiz_count: number;
  challenge_count: number;
  cert_count: number;
  last_active: string;
}

const BADGE_COLORS: Record<string, string> = {
  Elite: 'bg-yellow-500/20 text-yellow-400',
  Master: 'bg-purple-500/20 text-purple-400',
  Expert: 'bg-blue-500/20 text-blue-400',
  Advanced: 'bg-cyan-500/20 text-cyan-400',
  Skilled: 'bg-green-500/20 text-green-400',
  Learner: 'bg-amber-500/20 text-amber-400',
  Beginner: 'bg-muted text-muted-foreground',
};

export default function UserScoresAdminPage() {
  const [users, setUsers] = useState<UserScore[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'total_score' | 'quiz_count' | 'cert_count'>('total_score');

  useEffect(() => { fetchScores(); }, []);

  async function fetchScores() {
    setLoading(true);
    try {
      // Join user_profiles with aggregated counts
      const { data: profiles } = await supabase
        .from('user_profiles')
        .select('id, full_name, total_score, badge, created_at');

      if (!profiles) { setLoading(false); return; }

      const enriched: UserScore[] = await Promise.all(
        profiles.map(async (p) => {
          const [quizRes, challengeRes, certRes] = await Promise.all([
            supabase.from('quiz_results').select('id', { count: 'exact', head: true }).eq('user_id', p.id),
            supabase.from('challenge_results').select('id', { count: 'exact', head: true }).eq('user_id', p.id),
            supabase.from('certificates').select('id', { count: 'exact', head: true }).eq('user_id', p.id),
          ]);
          return {
            id: p.id,
            full_name: p.full_name || 'Unknown',
            email: '',
            total_score: p.total_score || 0,
            badge: p.badge || 'Beginner',
            quiz_count: quizRes.count ?? 0,
            challenge_count: challengeRes.count ?? 0,
            cert_count: certRes.count ?? 0,
            last_active: p.created_at,
          };
        })
      );
      setUsers(enriched);
    } catch {
      toast.error('Failed to load user scores');
    } finally {
      setLoading(false);
    }
  }

  function exportCSV() {
    const rows = [['Name', 'Total Score', 'Badge', 'Quizzes', 'Challenges', 'Certificates']];
    filtered.forEach(u => rows.push([u.full_name, String(u.total_score), u.badge, String(u.quiz_count), String(u.challenge_count), String(u.cert_count)]));
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'user_scores.csv'; a.click();
    URL.revokeObjectURL(url);
    toast.success('Export started');
  }

  const filtered = users
    .filter(u => !search || u.full_name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => b[sortBy] - a[sortBy]);

  const totalScore = users.reduce((a, u) => a + u.total_score, 0);
  const totalCerts = users.reduce((a, u) => a + u.cert_count, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">User Scores</h1>
          <p className="text-sm text-muted-foreground mt-1">Challenge performance across all registered users</p>
        </div>
        <div className="flex gap-2 shrink-0">
          <Button variant="outline" onClick={exportCSV} className="gap-2"><DownloadCloud className="w-4 h-4" />Export</Button>
          <Button variant="outline" onClick={fetchScores} className="gap-2"><RefreshCw className="w-4 h-4" />Refresh</Button>
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Users', value: users.length, icon: BarChart3 },
          { label: 'Total Points Earned', value: totalScore.toLocaleString(), icon: Star },
          { label: 'Certs Issued', value: totalCerts, icon: Trophy },
          { label: 'Avg Score', value: users.length ? Math.round(totalScore / users.length).toLocaleString() : '—', icon: BarChart3 },
        ].map(s => (
          <div key={s.label} className="p-4 rounded-2xl border border-border bg-card flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <s.icon className="w-5 h-5 text-primary" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">{s.label}</p>
              <p className="text-lg font-display font-black text-foreground">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name..." className="pl-9 px-9" />
        </div>
        <Select value={sortBy} onValueChange={v => setSortBy(v as typeof sortBy)}>
          <SelectTrigger className="w-44"><SelectValue placeholder="Sort by" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="total_score">Sort by Score</SelectItem>
            <SelectItem value="quiz_count">Sort by Quizzes</SelectItem>
            <SelectItem value="cert_count">Sort by Certificates</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <AlertCircle className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="font-medium">No users found</p>
        </div>
      ) : (
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  {['#', 'Name', 'Badge', 'Score', 'Quizzes', 'Challenges', 'Certs'].map(h => (
                    <th key={h} className="text-left px-5 py-3.5 text-xs font-semibold uppercase tracking-widest text-muted-foreground whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((u, i) => (
                  <tr key={u.id} className="border-b border-border/50 last:border-0 hover:bg-muted/20 transition-colors">
                    <td className="px-5 py-3.5 whitespace-nowrap text-sm font-bold text-muted-foreground">{i + 1}</td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0">{u.full_name.charAt(0)}</div>
                        <span className="text-sm font-medium text-foreground">{u.full_name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${BADGE_COLORS[u.badge] ?? BADGE_COLORS.Beginner}`}>{u.badge}</span>
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <span className="text-sm font-display font-black text-foreground">{u.total_score.toLocaleString()}</span>
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap text-sm text-muted-foreground">{u.quiz_count}</td>
                    <td className="px-5 py-3.5 whitespace-nowrap text-sm text-muted-foreground">{u.challenge_count}</td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <span className={`text-sm font-semibold ${u.cert_count > 0 ? 'text-primary' : 'text-muted-foreground'}`}>{u.cert_count}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

import { useState, useEffect } from 'react';
import { supabase } from '@/db/supabase';
import { Trophy, RefreshCw, Trash2, DownloadCloud, AlertCircle, Crown, Medal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

type Period = 'today' | 'weekly' | 'monthly' | 'alltime';

interface LeaderboardEntry {
  id: string;
  user_id: string;
  full_name: string;
  score: number;
  badge: string;
  period: Period;
  created_at: string;
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

export default function LeaderboardAdminPage() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [period, setPeriod] = useState<Period>('alltime');
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetch(); }, [period]);

  async function fetch() {
    setLoading(true);
    const { data } = await supabase
      .from('leaderboard_entries')
      .select('*')
      .eq('period', period)
      .order('score', { ascending: false })
      .limit(100);
    setEntries(data ?? []);
    setLoading(false);
  }

  async function resetPeriod() {
    if (!window.confirm(`Reset ALL ${period} rankings? This cannot be undone.`)) return;
    const { error } = await supabase.from('leaderboard_entries').delete().eq('period', period);
    if (error) { toast.error('Failed to reset'); return; }
    toast.success(`${period} rankings reset`);
    fetch();
  }

  async function deleteEntry(id: string) {
    const { error } = await supabase.from('leaderboard_entries').delete().eq('id', id);
    if (error) { toast.error('Failed to delete entry'); return; }
    toast.success('Entry removed');
    fetch();
  }

  function exportCSV() {
    const rows = [['Rank', 'Name', 'Score', 'Badge', 'Period']];
    entries.forEach((e, i) => rows.push([String(i + 1), e.full_name, String(e.score), e.badge, e.period]));
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `leaderboard_${period}.csv`; a.click();
    URL.revokeObjectURL(url);
    toast.success('Export started');
  }

  function RankIcon({ rank }: { rank: number }) {
    if (rank === 1) return <Trophy className="w-4 h-4 text-yellow-400" />;
    if (rank === 2) return <Medal className="w-4 h-4 text-slate-300" />;
    if (rank === 3) return <Medal className="w-4 h-4 text-amber-600" />;
    return <span className="text-sm font-bold font-display text-muted-foreground">{rank}</span>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Leaderboard Management</h1>
          <p className="text-sm text-muted-foreground mt-1">View, manage and reset challenge rankings</p>
        </div>
        <div className="flex gap-2 shrink-0">
          <Button variant="outline" onClick={exportCSV} className="gap-2"><DownloadCloud className="w-4 h-4" />Export CSV</Button>
          <Button variant="outline" onClick={fetch} className="gap-2"><RefreshCw className="w-4 h-4" />Refresh</Button>
          <Button variant="outline" onClick={resetPeriod} className="gap-2 text-red-400 border-red-500/30 hover:bg-red-500/10">
            <Trash2 className="w-4 h-4" />Reset {period}
          </Button>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {(['today', 'weekly', 'monthly', 'alltime'] as Period[]).map(p => (
          <button key={p} onClick={() => setPeriod(p)}
            className={`p-4 rounded-2xl border text-left transition-all ${period === p ? 'border-primary bg-primary/5' : 'border-border bg-card hover:border-primary/40'}`}>
            <div className="text-xs font-medium text-muted-foreground capitalize mb-1">{p}</div>
            <div className="text-xl font-display font-black text-foreground">{p === period ? entries.length : '—'}</div>
            <div className="text-xs text-muted-foreground mt-0.5">entries</div>
          </button>
        ))}
      </div>

      {/* Period tabs */}
      <div className="flex gap-2">
        {(['today', 'weekly', 'monthly', 'alltime'] as Period[]).map(p => (
          <button key={p} onClick={() => setPeriod(p)}
            className={`px-4 py-2 rounded-xl border text-sm font-medium transition-all capitalize ${period === p ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground hover:border-primary/40 hover:text-foreground'}`}>
            {p}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : entries.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Crown className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="font-medium">No entries for this period</p>
        </div>
      ) : (
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left px-5 py-3.5 text-xs font-semibold uppercase tracking-widest text-muted-foreground whitespace-nowrap">Rank</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold uppercase tracking-widest text-muted-foreground whitespace-nowrap">Name</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold uppercase tracking-widest text-muted-foreground whitespace-nowrap">Badge</th>
                  <th className="text-right px-5 py-3.5 text-xs font-semibold uppercase tracking-widest text-muted-foreground whitespace-nowrap">Score</th>
                  <th className="text-right px-5 py-3.5 text-xs font-semibold uppercase tracking-widest text-muted-foreground whitespace-nowrap">Action</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((e, i) => (
                  <tr key={e.id} className="border-b border-border/50 last:border-0 hover:bg-muted/20 transition-colors">
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <div className="flex items-center justify-start w-6"><RankIcon rank={i + 1} /></div>
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground shrink-0">{e.full_name.charAt(0)}</div>
                        <span className="text-sm font-medium text-foreground">{e.full_name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${BADGE_COLORS[e.badge] ?? BADGE_COLORS.Beginner}`}>{e.badge}</span>
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap text-right">
                      <span className="text-sm font-display font-bold text-foreground">{e.score.toLocaleString()}</span>
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap text-right">
                      <button onClick={() => deleteEntry(e.id)} className="text-muted-foreground hover:text-red-400 p-1.5 rounded-lg hover:bg-red-500/10 transition-all">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
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

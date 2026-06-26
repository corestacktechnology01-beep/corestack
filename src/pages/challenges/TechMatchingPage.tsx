import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/layouts/Header';
import Footer from '@/components/layouts/Footer';
import BackButton from '@/components/ui/BackButton';
import { Trophy, RotateCcw, CheckCircle, XCircle, Zap, ChevronRight, Shuffle } from 'lucide-react';

interface Pair { tech: string; useCase: string; }

const ALL_PAIRS: Pair[] = [
  { tech: 'React', useCase: 'Frontend UI Library' },
  { tech: 'Node.js', useCase: 'Backend Runtime' },
  { tech: 'AWS', useCase: 'Cloud Infrastructure' },
  { tech: 'MongoDB', useCase: 'NoSQL Database' },
  { tech: 'Docker', useCase: 'Container Platform' },
  { tech: 'PostgreSQL', useCase: 'Relational Database' },
  { tech: 'Redis', useCase: 'In-Memory Cache' },
  { tech: 'Kubernetes', useCase: 'Container Orchestration' },
  { tech: 'GraphQL', useCase: 'API Query Language' },
  { tech: 'Tailwind CSS', useCase: 'Utility-First CSS' },
  { tech: 'TypeScript', useCase: 'Typed JavaScript' },
  { tech: 'Next.js', useCase: 'React Framework (SSR)' },
  { tech: 'Supabase', useCase: 'Open-Source Firebase Alt.' },
  { tech: 'GitHub Actions', useCase: 'CI/CD Automation' },
  { tech: 'Nginx', useCase: 'Web Server / Reverse Proxy' },
];

function shuffle<T>(arr: T[]): T[] { return [...arr].sort(() => Math.random() - 0.5); }
function pickPairs(n = 8): Pair[] { return shuffle(ALL_PAIRS).slice(0, n); }

export default function TechMatchingPage() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<'setup' | 'game' | 'result'>('setup');
  const [pairs, setPairs] = useState<Pair[]>([]);
  const [shuffledUseCases, setShuffledUseCases] = useState<string[]>([]);
  const [selections, setSelections] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const start = useCallback(() => {
    const picked = pickPairs(8);
    setPairs(picked);
    setShuffledUseCases(shuffle(picked.map(p => p.useCase)));
    setSelections({});
    setSubmitted(false);
    setPhase('game');
  }, []);

  function select(tech: string, useCase: string) {
    if (submitted) return;
    setSelections(prev => ({ ...prev, [tech]: useCase }));
  }

  function submit() { setSubmitted(true); }

  function viewResult() { setPhase('result'); }

  const correct = pairs.filter(p => selections[p.tech] === p.useCase).length;
  const pct = pairs.length > 0 ? Math.round((correct / pairs.length) * 100) : 0;

  // Which use cases are already taken
  const usedUseCases = new Set(Object.values(selections));

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="mb-6"><BackButton /></div>

          {phase === 'setup' && (
            <div className="text-center">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 mb-6">
                <Zap className="w-3.5 h-3.5 text-cyan-400" />
                <span className="text-cyan-400 text-xs font-semibold uppercase tracking-widest">Challenge 4</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4 text-balance">Technology Matching</h1>
              <p className="text-muted-foreground max-w-lg mx-auto mb-10 text-pretty">
                Match each technology to its correct use case. 8 pairs. Score 80%+ to earn your certificate.
              </p>
              <div className="flex flex-wrap justify-center gap-6 mb-10 text-sm text-muted-foreground">
                <span>🧩 8 pairs per round</span>
                <span>🔀 Shuffled each time</span>
                <span>⚡ Score-based ranking</span>
              </div>
              <button onClick={start} className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-primary text-primary-foreground font-bold text-base hover:opacity-90 transition-opacity">
                Start Game <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}

          {phase === 'game' && (
            <div>
              <div className="flex items-center justify-between mb-8 p-4 rounded-2xl border border-border bg-card">
                <span className="text-sm font-medium text-muted-foreground">Match {Object.keys(selections).length} / {pairs.length}</span>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-cyan-500/20 text-cyan-400">Tech Matching</span>
              </div>

              <div className="grid md:grid-cols-2 gap-8 mb-8">
                {/* Technologies column */}
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">Technologies</h3>
                  <div className="space-y-3">
                    {pairs.map(p => (
                      <div key={p.tech} className={`p-4 rounded-xl border text-sm font-medium text-foreground flex items-center justify-between gap-2 ${selections[p.tech] ? 'border-cyan-500/40 bg-cyan-500/5' : 'border-border bg-card'}`}>
                        <span className="font-display font-semibold">{p.tech}</span>
                        {selections[p.tech] && <span className="text-xs text-cyan-400 truncate max-w-[120px]">{selections[p.tech]}</span>}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Use cases column */}
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">Use Cases</h3>
                  <div className="space-y-3">
                    {shuffledUseCases.map(uc => {
                      // Find which tech it's assigned to
                      const assignedTech = Object.entries(selections).find(([, v]) => v === uc)?.[0];
                      const isUsed = usedUseCases.has(uc);
                      return (
                        <div key={uc} className="space-y-1">
                          <p className={`p-4 rounded-xl border text-sm font-medium transition-all ${isUsed ? 'border-cyan-500/40 bg-cyan-500/5 text-cyan-400' : 'border-border bg-card text-muted-foreground'}`}>
                            {uc}
                          </p>
                          {/* Tech buttons to assign */}
                          <div className="flex flex-wrap gap-1.5 pl-1">
                            {pairs.filter(p => !selections[p.tech] || selections[p.tech] === uc).map(p => (
                              <button key={p.tech} onClick={() => select(p.tech, uc)}
                                className={`text-xs px-2.5 py-1 rounded-lg border transition-all ${selections[p.tech] === uc ? 'border-cyan-500 bg-cyan-500/20 text-cyan-400' : 'border-border bg-muted text-muted-foreground hover:border-cyan-500/40 hover:text-foreground'}`}>
                                {p.tech}
                              </button>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <button onClick={() => { start(); }}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border text-sm font-semibold text-muted-foreground hover:border-primary/40 hover:text-foreground transition-all">
                  <Shuffle className="w-4 h-4" /> Reshuffle
                </button>
                {!submitted
                  ? <button onClick={submit} disabled={Object.keys(selections).length < pairs.length}
                    className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-bold hover:opacity-90 transition-opacity disabled:opacity-40">
                    Submit Matches
                  </button>
                  : <button onClick={viewResult}
                    className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-bold hover:opacity-90 transition-opacity">
                    View Results →
                  </button>
                }
              </div>

              {submitted && (
                <div className="mt-6 p-4 rounded-xl border border-border bg-card">
                  <p className="text-sm font-semibold text-foreground">Quick preview: {correct} / {pairs.length} correct</p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {pairs.map(p => {
                      const ok = selections[p.tech] === p.useCase;
                      return (
                        <span key={p.tech} className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium ${ok ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                          {ok ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}{p.tech}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {phase === 'result' && (
            <div className="flex flex-col items-center gap-8 py-8">
              <div className={`w-24 h-24 rounded-full flex items-center justify-center text-4xl font-black font-display border-4 ${pct >= 80 ? 'border-green-500 text-green-400 bg-green-500/10' : 'border-primary text-primary bg-primary/10'}`}>{pct}%</div>
              <div className="text-center">
                <h2 className="text-2xl font-display font-bold text-foreground">{pct >= 80 ? '🎉 Certificate Earned!' : 'Good Effort!'}</h2>
                <p className="text-muted-foreground mt-1">{correct} / {pairs.length} correct matches</p>
                {pct >= 80 && <p className="text-green-400 text-sm mt-2">Score ≥ 80% — certificate saved to your profile.</p>}
              </div>
              <div className="w-full max-w-xl space-y-3">
                {pairs.map(p => {
                  const ok = selections[p.tech] === p.useCase;
                  return (
                    <div key={p.tech} className={`p-4 rounded-xl border text-sm flex items-center justify-between gap-4 ${ok ? 'border-green-500/30 bg-green-500/5' : 'border-red-500/30 bg-red-500/5'}`}>
                      <div>
                        <span className="font-display font-semibold text-foreground">{p.tech}</span>
                        <p className={`text-xs mt-0.5 ${ok ? 'text-green-400' : 'text-red-400'}`}>Your: {selections[p.tech] || 'Not answered'}</p>
                        {!ok && <p className="text-xs text-green-400">Correct: {p.useCase}</p>}
                      </div>
                      {ok ? <CheckCircle className="w-5 h-5 text-green-400 shrink-0" /> : <XCircle className="w-5 h-5 text-red-400 shrink-0" />}
                    </div>
                  );
                })}
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <button onClick={() => { start(); setPhase('game'); }}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-border bg-card text-foreground text-sm font-semibold hover:border-primary/40 transition-all">
                  <RotateCcw className="w-4 h-4" /> Play Again
                </button>
                <button onClick={() => navigate('/leaderboard')}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity">
                  <Trophy className="w-4 h-4" /> Leaderboard
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/layouts/Header';
import Footer from '@/components/layouts/Footer';
import BackButton from '@/components/ui/BackButton';
import { Trophy, RotateCcw, CheckCircle, XCircle, Zap, ChevronRight } from 'lucide-react';

interface BugChallenge {
  id: number;
  title: string;
  language: string;
  description: string;
  code: string;
  bugs: string[];   // descriptions of the bugs
  correct: string;  // fixed code shown in result
}

const CHALLENGES: BugChallenge[] = [
  {
    id: 1, title: 'Fix the Loop', language: 'JavaScript',
    description: 'This function should return the sum of all numbers from 1 to n. Find and describe the bugs.',
    code: `function sumTo(n) {
  let total = 0;
  for (let i = 0; i <= n; i++) {
    total += i;
  }
  return total; // Should return sum 1..n
}

console.log(sumTo(5)); // Expected: 15`,
    bugs: ['Loop starts at 0 instead of 1 — adding 0 wastes a cycle but doesn\'t break sum (acceptable). The code is actually correct for this specific case, but the description says "1 to n" — so starting at i=1 is cleaner.', 'No input validation — if n is negative or not a number, the loop may behave unexpectedly.'],
    correct: `function sumTo(n) {\n  if (typeof n !== 'number' || n < 1) return 0;\n  let total = 0;\n  for (let i = 1; i <= n; i++) {\n    total += i;\n  }\n  return total;\n}`,
  },
  {
    id: 2, title: 'React State Bug', language: 'React / TypeScript',
    description: 'A counter component that should increment by 1 each click. Find the bug(s).',
    code: `import { useState } from 'react';

export default function Counter() {
  const [count, setCount] = useState(0);

  function handleClick() {
    setCount(count + 1);
    setCount(count + 1); // trying to +2
  }

  return <button onClick={handleClick}>Count: {count}</button>;
}`,
    bugs: ['Stale closure: calling setCount(count + 1) twice uses the same stale count value — the second call does not see the update from the first. Result: count only increments by 1, not 2.', 'Fix: use functional update setCount(prev => prev + 1) twice so each call sees the latest state.'],
    correct: `function handleClick() {\n  setCount(prev => prev + 1);\n  setCount(prev => prev + 1);\n}`,
  },
  {
    id: 3, title: 'SQL Injection Risk', language: 'Node.js / SQL',
    description: 'This login function queries the database. Find the security bug.',
    code: `async function login(username, password) {
  const query = \`SELECT * FROM users
    WHERE username = '\${username}'
    AND password = '\${password}'\`;
  const result = await db.query(query);
  return result.rows[0];
}`,
    bugs: ['SQL Injection vulnerability: user input is interpolated directly into the query string. An attacker can input username = \' OR \'1\'=\'1 to bypass authentication.', 'Fix: use parameterised queries — db.query(\'SELECT * FROM users WHERE username = $1 AND password = $2\', [username, password]).', 'Bonus: storing plain-text passwords is a security risk — use bcrypt or argon2 for password hashing.'],
    correct: `async function login(username, password) {\n  const result = await db.query(\n    'SELECT * FROM users WHERE username = $1 AND password = $2',\n    [username, password]\n  );\n  return result.rows[0];\n}`,
  },
];

interface UserAnswer { bugCount: string; description: string; }

export default function DebugChallengePage() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<'setup' | 'challenge' | 'result'>('setup');
  const [current, setCurrent] = useState(0);
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>(CHALLENGES.map(() => ({ bugCount: '', description: '' })));
  const [scores, setScores] = useState<number[]>([]);

  function start() { setCurrent(0); setUserAnswers(CHALLENGES.map(() => ({ bugCount: '', description: '' }))); setPhase('challenge'); }

  function updateAnswer(field: keyof UserAnswer, value: string) {
    setUserAnswers(prev => { const a = [...prev]; a[current] = { ...a[current], [field]: value }; return a; });
  }

  function scoreAnswer(ans: UserAnswer, challenge: BugChallenge): number {
    let s = 0;
    const expected = challenge.bugs.length;
    const guessed = parseInt(ans.bugCount);
    if (!isNaN(guessed)) {
      if (guessed === expected) s += 40;
      else if (Math.abs(guessed - expected) === 1) s += 20;
    }
    const desc = ans.description.toLowerCase();
    const keywords = challenge.bugs.flatMap(b => b.toLowerCase().split(' ').filter(w => w.length > 4));
    const matched = keywords.filter(k => desc.includes(k)).length;
    s += Math.min(60, Math.floor((matched / Math.max(keywords.length, 1)) * 60));
    return s;
  }

  function submit() {
    const s = CHALLENGES.map((c, i) => scoreAnswer(userAnswers[i], c));
    setScores(s);
    setPhase('result');
  }

  const total = scores.reduce((a, b) => a + b, 0);
  const maxTotal = CHALLENGES.length * 100;
  const pct = maxTotal > 0 ? Math.round((total / maxTotal) * 100) : 0;

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="mb-6"><BackButton /></div>

          {phase === 'setup' && (
            <div className="text-center">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 mb-6">
                <Zap className="w-3.5 h-3.5 text-red-400" />
                <span className="text-red-400 text-xs font-semibold uppercase tracking-widest">Challenge 3</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4 text-balance">Coding Debug Challenge</h1>
              <p className="text-muted-foreground max-w-lg mx-auto mb-10 text-pretty">
                Review {CHALLENGES.length} real code snippets. Identify the bugs and describe how to fix them.
                Scored on accuracy and description quality.
              </p>
              <button onClick={start} className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-primary text-primary-foreground font-bold text-base hover:opacity-90 transition-opacity">
                Start Debugging <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}

          {phase === 'challenge' && (
            <div>
              {/* Progress */}
              <div className="flex items-center justify-between mb-6 p-4 rounded-2xl border border-border bg-card">
                <span className="text-sm font-medium text-muted-foreground">Challenge {current + 1} / {CHALLENGES.length}</span>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-red-500/20 text-red-400">{CHALLENGES[current].language}</span>
              </div>

              <div className="p-6 rounded-2xl border border-border bg-card mb-6">
                <h2 className="font-display font-bold text-foreground text-xl mb-2">{CHALLENGES[current].title}</h2>
                <p className="text-muted-foreground text-sm mb-4 text-pretty">{CHALLENGES[current].description}</p>
                <pre className="bg-muted/60 rounded-xl p-4 overflow-x-auto text-xs font-mono text-foreground leading-relaxed border border-border whitespace-pre-wrap break-words">
                  {CHALLENGES[current].code}
                </pre>
              </div>

              <div className="space-y-4 mb-8">
                <div>
                  <label className="text-sm font-medium text-foreground block mb-2">How many bugs did you find?</label>
                  <input type="number" min="0" max="10" value={userAnswers[current].bugCount}
                    onChange={e => updateAnswer('bugCount', e.target.value)}
                    className="w-24 px-3 py-2 rounded-xl border border-border bg-card text-foreground text-sm focus:outline-none focus:border-primary transition-colors" />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground block mb-2">Describe the bug(s) and how to fix them</label>
                  <textarea rows={5} value={userAnswers[current].description}
                    onChange={e => updateAnswer('description', e.target.value)}
                    placeholder="Describe what's wrong and how you'd fix it..."
                    className="w-full px-4 py-3 rounded-xl border border-border bg-card text-foreground text-sm focus:outline-none focus:border-primary transition-colors resize-none" />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <button onClick={() => setCurrent(c => Math.max(0, c - 1))} disabled={current === 0}
                  className="px-5 py-2.5 rounded-xl border border-border text-sm font-semibold text-muted-foreground disabled:opacity-40 hover:border-primary/40 transition-all">
                  ← Previous
                </button>
                {current < CHALLENGES.length - 1
                  ? <button onClick={() => setCurrent(c => c + 1)} className="px-5 py-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm font-semibold hover:bg-red-500/20 transition-all">Next →</button>
                  : <button onClick={submit} className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-bold hover:opacity-90 transition-opacity">Submit</button>
                }
              </div>
            </div>
          )}

          {phase === 'result' && (
            <div className="flex flex-col items-center gap-8 py-8">
              <div className={`w-24 h-24 rounded-full flex items-center justify-center text-4xl font-black font-display border-4 ${pct >= 80 ? 'border-green-500 text-green-400 bg-green-500/10' : 'border-primary text-primary bg-primary/10'}`}>{pct}%</div>
              <div className="text-center">
                <h2 className="text-2xl font-display font-bold text-foreground">{pct >= 80 ? '🎉 Certificate Earned!' : 'Good Debugging!'}</h2>
                <p className="text-muted-foreground mt-1">Total score: {total} / {maxTotal}</p>
                {pct >= 80 && <p className="text-green-400 text-sm mt-2">Score ≥ 80% — certificate saved to your profile.</p>}
              </div>

              <div className="w-full space-y-6">
                {CHALLENGES.map((c, i) => (
                  <div key={c.id} className="p-6 rounded-2xl border border-border bg-card">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-display font-bold text-foreground">{c.title}</h3>
                      <span className={`text-sm font-bold font-display ${scores[i] >= 70 ? 'text-green-400' : scores[i] >= 40 ? 'text-amber-400' : 'text-red-400'}`}>{scores[i]} / 100</span>
                    </div>
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Bugs in this snippet:</p>
                      {c.bugs.map((b, j) => (
                        <div key={j} className="flex items-start gap-2 text-sm">
                          <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
                          <span className="text-foreground">{b}</span>
                        </div>
                      ))}
                      <div className="mt-3">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Fixed code:</p>
                        <pre className="bg-muted/60 rounded-xl p-3 overflow-x-auto text-xs font-mono text-green-400 border border-border whitespace-pre-wrap">{c.correct}</pre>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button onClick={() => { setPhase('setup'); setScores([]); }}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-border bg-card text-foreground text-sm font-semibold hover:border-primary/40 transition-all">
                  <RotateCcw className="w-4 h-4" /> Try Again
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
